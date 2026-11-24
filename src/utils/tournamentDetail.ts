/**
 * The lobby's tournament detail panel (Dzeezbtc/ui#92): what a Sit & Go or
 * tournament pays, where it is in its life, its starting stack and its blind
 * ladder, worked out from the lobby's table record and, once fetched, the
 * table's own state (the payouts the engine authored).
 *
 * The UI never invents a payout split: the per-place amounts are only ever the
 * engine's `payouts`. Before those arrive the prize pool is the entries so far
 * times the prize-pool share of one buy-in, flagged as an estimate.
 */

import { expandBlindLevel, resolveBlindPreset, type BlindStructureDTO, type PayoutPlaceDTO, type TexasHoldemStateDTO } from "@block52/poker-vm-sdk";
import { computeSngEntryBreakdown } from "./buyInUtils";
import { lobbyPhase } from "./lobbyLayout";
import { formatChipCount } from "./potDisplayUtils";
import { formatMicroAsUsdc } from "../constants/currency";
import { cashBlind } from "./blindsLabel";
import { hasElements, hasValue, isNullish } from "./guards";
import type { GameWithFormat } from "./convertUtils";
import type { TranslationKey } from "../i18n";
import { hasTournamentStarted, lateRegistrationEndsAt, lateRegistrationPhase, type LateRegistrationPhase } from "./scheduledSng";

/** What the lobby learns from a tournament table's own state. */
export interface LobbyTournamentLive {
    /** The engine's prize structure by finishing place; empty until it has one. */
    payouts: PayoutPlaceDTO[];
    /** The first hand has been started. */
    started: boolean;
    /** Late registration, once started. */
    lateRegistration: LateRegistrationPhase;
    /** When late registration closes (epoch ms), when known. */
    lateRegistrationEndsAt: number | undefined;
    /** The blind level in play (0-based), when known. */
    level: number | undefined;
}

export interface PrizePlace {
    place: number;
    /** Micro-USDC. */
    amount: bigint;
    /** Share of the pool, 0–100, one decimal. */
    percent: number;
}

export interface TournamentPrize {
    /** Micro-USDC. */
    pool: bigint;
    /** First place's prize (micro-USDC), or null before the engine has a structure. */
    first: bigint | null;
    places: PrizePlace[];
    /** True when the pool is worked out from entries, not the engine's payouts. */
    estimated: boolean;
}

/** A dollar amount for prize money: "$12", "$12.60", "$0.45". */
export const prizeMoney = (micro: bigint | string): string => {
    const usdc = formatMicroAsUsdc(micro, 2);
    return Number(usdc.split(",").join("")) >= 1 ? cashBlind(usdc) : `$${usdc}`;
};

/**
 * The prize pool and its split. With the engine's payouts: their total, first
 * place and every paid place with its share. Without: entries so far × the
 * prize-pool portion of a buy-in, and no split.
 */
export const tournamentPrize = (
    game: Pick<GameWithFormat, "minBuyIn" | "entryFee" | "protocolFeeBps" | "currentPlayers">,
    payouts: PayoutPlaceDTO[] | undefined
): TournamentPrize => {
    const paid = (payouts ?? []).map(p => ({ place: p.place, amount: BigInt(p.amount) })).filter(p => p.amount > 0n);
    const pool = paid.reduce((sum, p) => sum + p.amount, 0n);
    if (hasElements(paid) && pool > 0n) {
        const places = [...paid].sort((a, b) => a.place - b.place).map(p => ({ ...p, percent: Number((p.amount * 1000n) / pool) / 10 }));
        return { pool, first: places[0].amount, places, estimated: false };
    }
    const share = computeSngEntryBreakdown(game.minBuyIn, game.entryFee, game.protocolFeeBps).prizePoolPortion;
    return { pool: share * BigInt(game.currentPlayers), first: null, places: [], estimated: true };
};

export type TournamentStatus =
    | { kind: "startsIn"; ms: number }
    | { kind: "starting" }
    | { kind: "short"; have: number; need: number }
    | { kind: "registering"; have: number; need: number }
    | { kind: "lateReg"; ms: number | undefined }
    | { kind: "running" }
    | { kind: "cancelled" };

/** Where the tournament is: counting down, filling up, in late registration, running or cancelled. */
export const tournamentStatus = (
    game: Pick<GameWithFormat, "scheduledStartTime" | "minPlayers" | "maxPlayers" | "currentPlayers">,
    live: LobbyTournamentLive | undefined,
    nowMs: number
): TournamentStatus => {
    if (live?.lateRegistration === "open") {
        return { kind: "lateReg", ms: hasValue(live.lateRegistrationEndsAt) ? Math.max(0, live.lateRegistrationEndsAt - nowMs) : undefined };
    }
    if (live?.started) return { kind: "running" };
    const phase = lobbyPhase(game, nowMs);
    if (phase === "cancelled") return { kind: "cancelled" };
    if (phase === "ready") return { kind: "starting" };
    if (phase === "short") return { kind: "short", have: game.currentPlayers, need: game.minPlayers };
    if (phase === "registering" && hasValue(game.scheduledStartTime)) return { kind: "startsIn", ms: game.scheduledStartTime - nowMs };
    return { kind: "registering", have: game.currentPlayers, need: game.maxPlayers };
};

/** A countdown in words: "45s", "12m", "1h 05m", "2d 3h". */
export const countdownLabel = (ms: number): string => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.ceil(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h}h ${String(m % 60).padStart(2, "0")}m`;
    return `${Math.floor(h / 24)}d ${h % 24}h`;
};

type ConcreteStructure = Exclude<BlindStructureDTO, { preset: unknown }>;

/**
 * The structure this table plays. A table created with one carries it; any
 * other doubles its blinds every `blindLevelDuration` minutes from the starting
 * blinds, recovered from the current blinds and level as the table page does.
 */
export const lobbyBlindStructure = (
    game: Pick<GameWithFormat, "blindStructure" | "smallBlind" | "bigBlind" | "blindLevel" | "blindLevelDuration">
): ConcreteStructure | undefined => {
    if (!isNullish(game.blindStructure)) return resolveBlindPreset(game.blindStructure);
    const sb = Number(game.smallBlind);
    const bb = Number(game.bigBlind);
    if (!(sb > 0) || !(bb > 0)) return undefined;
    const factor = 2 ** (game.blindLevel ?? 0);
    const exact = sb % factor === 0 && bb % factor === 0;
    return {
        progression: "double",
        startSmallBlind: String(exact ? sb / factor : sb),
        startBigBlind: String(exact ? bb / factor : bb),
        durationMinutes: game.blindLevelDuration ?? 0
    };
};

export interface LadderRow {
    /** 1-based. */
    level: number;
    smallBlind: number;
    bigBlind: number;
    ante: number;
    minutes: number | undefined;
    isBreak: boolean;
    isCurrent: boolean;
}

/** How many levels the lobby ladder lists. */
export const LOBBY_LADDER_LEVELS = 15;

/** The first `count` levels of the table's blind ladder, the one in play marked. */
export const lobbyBlindLadder = (
    structure: ConcreteStructure | undefined,
    currentLevel: number | undefined,
    count: number = LOBBY_LADDER_LEVELS
): LadderRow[] => {
    if (isNullish(structure)) return [];
    const rows: LadderRow[] = [];
    for (let n = 0; n < count; n++) {
        const lvl = expandBlindLevel(structure, n);
        rows.push({
            level: n + 1,
            smallBlind: Number(lvl.smallBlind),
            bigBlind: Number(lvl.bigBlind),
            ante: Number(lvl.ante),
            minutes: lvl.durationMinutes > 0 ? lvl.durationMinutes : undefined,
            isBreak: lvl.isBreak,
            isCurrent: currentLevel === n
        });
    }
    return rows;
};

/** "1,500 chips · 75 BB" — the starting stack and how deep it is at level 1; "" without one. */
export const startingStackLabel = (startingStack: string | undefined, firstBigBlind: number | undefined): string => {
    const chips = Number(startingStack);
    if (!(chips > 0)) return "";
    const deep = hasValue(firstBigBlind) && firstBigBlind > 0 ? ` · ${formatChipCount(Math.floor(chips / firstBigBlind))} BB` : "";
    return `${formatChipCount(chips)}${deep}`;
};

/** "10 / 20", with " · ante 5" when there is one. */
export const ladderBlinds = (row: Pick<LadderRow, "smallBlind" | "bigBlind">): string =>
    `${formatChipCount(row.smallBlind)} / ${formatChipCount(row.bigBlind)}`;

/** Ordinal place: 1st, 2nd, 3rd, 4th, 11th, 21st. */
export const placeLabel = (place: number): string => {
    const mod100 = place % 100;
    const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : (({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[place % 10] ?? "th");
    return `${place}${suffix}`;
};

/** What the lobby panel needs from a tournament table's state. */
export const toLobbyTournamentLive = (
    state: Pick<TexasHoldemStateDTO, "gameOptions" | "results" | "handNumber" | "previousActions" | "payouts">,
    nowMs: number
): LobbyTournamentLive => ({
    payouts: state.payouts ?? [],
    started: hasTournamentStarted(state),
    lateRegistration: lateRegistrationPhase(state, nowMs),
    lateRegistrationEndsAt: isNullish(state.gameOptions.lateRegistrationLevels) ? undefined : lateRegistrationEndsAt(state.gameOptions),
    level: state.gameOptions.blindLevel
});

type Translate = (key: TranslationKey, values?: Record<string, string | number>) => string;

/** The status pill's words: "Starts in 14m", "Late reg · 4m left", "Filling 3 / 6", … */
export const tournamentStatusText = (s: TournamentStatus, t: Translate): string => {
    switch (s.kind) {
        case "startsIn":
            return t("lobby.tdStartsIn", { time: countdownLabel(s.ms) });
        case "starting":
            return t("lobby.tdStarting");
        case "short":
            return t("lobby.tdShort", { have: s.have, need: s.need });
        case "registering":
            return t("lobby.tdFilling", { have: s.have, need: s.need });
        case "lateReg":
            return hasValue(s.ms) ? t("lobby.tdLateRegLeft", { time: countdownLabel(s.ms) }) : t("lobby.tdLateReg");
        case "running":
            return t("lobby.tdRunning");
        case "cancelled":
            return t("lobby.cancelled");
    }
};

/** The pill's colour: live (late reg), bad (short / cancelled), quiet (running) or soon. */
export const tournamentStatusTone = (s: TournamentStatus): "live" | "bad" | "quiet" | "soon" =>
    s.kind === "lateReg" ? "live" : s.kind === "cancelled" || s.kind === "short" ? "bad" : s.kind === "running" ? "quiet" : "soon";

/** A payout bar's width: this place against first, 4–100%. */
export const payoutBarPercent = (amount: bigint, first: bigint | null): number =>
    first !== null && first > 0n ? Math.max(4, Math.min(100, Number((amount * 100n) / first))) : 4;
