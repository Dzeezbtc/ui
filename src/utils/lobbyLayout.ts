/**
 * Lobby layout helpers (Block52 lobby redesign).
 *
 * The lobby shows every table as a small picture of the felt, grouped into
 * sections by game. These helpers decide which section a table belongs to,
 * how the stake and table-size filters match, how tables are ordered inside a
 * section, where the filled seats sit on the little table, and which open
 * table "Quick seat" picks. They are pure so they can be unit tested; the
 * components only render what they return.
 */
import { GameFormat } from "@block52/poker-vm-sdk";
import type { GameWithFormat } from "./convertUtils";
import { isTournamentFormat, formatTableGameDisplay, toGameVariant } from "./gameFormatUtils";
import { formatLateRegistration, formatStartsAt, isScheduledSng, scheduledSngPhase, type ScheduledSngPhase } from "./scheduledSng";
import { hasValue } from "./guards";
import { formatMicroAsUsdc, microToUsdc } from "../constants/currency";
import { computeSngEntryBreakdown } from "./buyInUtils";
import { cashBlind } from "./blindsLabel";
import { hasContent, hasElements } from "./guards";

/** A lobby section: one per cash game (by name), plus Sit & Go and Tournaments. */
export interface LobbySection {
    /** Stable key, e.g. "cash:Texas Hold'em", "sit-and-go", "tournament". */
    key: string;
    /** The heading the lobby shows, e.g. "Texas Hold'em", "Pot-Limit Omaha", "Sit & Go". */
    title: string;
    kind: "cash" | "sit-and-go" | "tournament";
    games: GameWithFormat[];
}

export type StakeBand = "all" | "micro" | "low" | "mid" | "high";
export type SizeBand = "all" | "heads-up" | "6-max" | "9-max";

export const STAKE_BANDS: readonly StakeBand[] = ["all", "micro", "low", "mid", "high"];
export const SIZE_BANDS: readonly SizeBand[] = ["all", "heads-up", "6-max", "9-max"];

/** Big blind of a table in dollars (cash tables; tournaments are in chips). */
export const bigBlindDollars = (game: Pick<GameWithFormat, "bigBlind">): number => microToUsdc(game.bigBlind);

/** Seats still free at a table, never negative. */
export const openSeats = (game: Pick<GameWithFormat, "maxPlayers" | "currentPlayers">): number => Math.max(0, game.maxPlayers - game.currentPlayers);

/** True for a cash (ring) table. */
export const isCashTable = (game: Pick<GameWithFormat, "gameFormat">): boolean => !isTournamentFormat(game.gameFormat);

/** Which section a table sits in. */
export const sectionKeyOf = (game: GameWithFormat): string => {
    if (!isCashTable(game)) return game.gameFormat === GameFormat.TOURNAMENT || isScheduledSng({ scheduledStartTime: game.scheduledStartTime }) ? "tournament" : "sit-and-go";
    return `cash:${formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit)}`;
};

/** Does a cash table fall in the stake band? Micro ≤ $0.20 BB, Low ≤ $2, Mid ≤ $10, High above. */
export const matchesStake = (game: GameWithFormat, band: StakeBand): boolean => {
    if (band === "all" || !isCashTable(game)) return true;
    const bb = bigBlindDollars(game);
    if (band === "micro") return bb <= 0.2;
    if (band === "low") return bb > 0.2 && bb <= 2;
    if (band === "mid") return bb > 2 && bb <= 10;
    return bb > 10;
};

/** Does a table match the table-size band? Heads-up = 2 seats, 6-max = 3–6, 9-max = 7+. */
export const matchesSize = (game: Pick<GameWithFormat, "maxPlayers">, band: SizeBand): boolean => {
    if (band === "all") return true;
    if (band === "heads-up") return game.maxPlayers === 2;
    if (band === "6-max") return game.maxPlayers > 2 && game.maxPlayers <= 6;
    return game.maxPlayers > 6;
};

/** Does a table match the search text (name, table ID or club name)? Case-insensitive. */
export const matchesSearch = (game: Pick<GameWithFormat, "gameId" | "name">, query: string, clubName?: string): boolean => {
    const q = query.trim().toLowerCase();
    if (!hasContent(q)) return true;
    return `${game.name ?? ""} ${game.gameId} ${clubName ?? ""}`.toLowerCase().includes(q);
};

export interface LobbyFilter {
    query: string;
    stake: StakeBand;
    size: SizeBand;
    /** Only tables the treasury opened. Ignored when no treasury address is configured. */
    treasuryOnly: boolean;
    treasuryAddress: string;
    /** gameId → club name, for search. */
    clubNames?: Record<string, string>;
}

/** All tables that pass the lobby filters. */
export const filterLobbyGames = (games: GameWithFormat[], f: LobbyFilter): GameWithFormat[] =>
    games.filter(
        g =>
            (!f.treasuryOnly || !hasContent(f.treasuryAddress) || g.creator === f.treasuryAddress) &&
            matchesStake(g, f.stake) &&
            matchesSize(g, f.size) &&
            matchesSearch(g, f.query, f.clubNames?.[g.gameId])
    );

export type LobbySort = "stakes-up" | "stakes-down" | "most-players" | "most-open";

/** Order tables inside a section. Ties fall back to most open seats, then table ID, so the order is stable. */
export const sortLobbyGames = (games: GameWithFormat[], sort: LobbySort): GameWithFormat[] => {
    const tie = (a: GameWithFormat, b: GameWithFormat) => openSeats(b) - openSeats(a) || a.gameId.localeCompare(b.gameId);
    const byBuyIn = (a: GameWithFormat, b: GameWithFormat) => Number(a.bigBlind) - Number(b.bigBlind) || Number(a.minBuyIn) - Number(b.minBuyIn);
    return [...games].sort((a, b) => {
        if (sort === "stakes-up") return byBuyIn(a, b) || tie(a, b);
        if (sort === "stakes-down") return byBuyIn(b, a) || tie(a, b);
        if (sort === "most-players") return b.currentPlayers - a.currentPlayers || tie(a, b);
        return openSeats(b) - openSeats(a) || byBuyIn(a, b) || a.gameId.localeCompare(b.gameId);
    });
};

const SECTION_ORDER = (key: string): number => {
    if (key === "cash:Texas Hold'em") return 0;
    if (key.startsWith("cash:") && key.includes("Hold'em")) return 1;
    if (key.startsWith("cash:")) return 2;
    if (key === "sit-and-go") return 3;
    return 4;
};

/** Group tables into lobby sections: cash games by name (Hold'em first), then Sit & Go, then Tournaments. Empty sections are left out. */
export const groupLobbySections = (games: GameWithFormat[], sort: LobbySort): LobbySection[] => {
    const map = new Map<string, GameWithFormat[]>();
    for (const g of games) {
        const key = sectionKeyOf(g);
        map.set(key, [...(map.get(key) ?? []), g]);
    }
    return [...map.entries()]
        .sort(([a], [b]) => SECTION_ORDER(a) - SECTION_ORDER(b) || a.localeCompare(b))
        .map(([key, list]) => ({
            key,
            title: key.startsWith("cash:") ? key.slice(5) : key === "sit-and-go" ? "Sit & Go" : "Tournaments",
            kind: key.startsWith("cash:") ? "cash" : key === "sit-and-go" ? "sit-and-go" : "tournament",
            games: sortLobbyGames(list, sort)
        }));
};

/**
 * Which seats to draw as taken on the little table. The lobby only knows how
 * many players are seated, not where, so the taken seats are spread evenly
 * round the table starting from the bottom seat.
 */
export const seatFill = (maxPlayers: number, currentPlayers: number): boolean[] => {
    const seats = Array.from({ length: Math.max(0, maxPlayers) }, () => false);
    const n = Math.min(Math.max(0, currentPlayers), seats.length);
    for (let i = 0; i < n; i++) seats[Math.floor((i * seats.length) / n)] = true;
    return seats;
};

/** Position of seat `index` of `count` round an ellipse, starting at the bottom and going clockwise. */
export const seatPosition = (index: number, count: number, cx: number, cy: number, rx: number, ry: number): { x: number; y: number } => {
    const angle = Math.PI / 2 + (index * 2 * Math.PI) / Math.max(1, count);
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
};

/**
 * Quick seat: the open cash table for this game at this big blind (in micro-USDC)
 * with the most players already seated (the liveliest game), or undefined.
 */
export const pickQuickSeat = (games: GameWithFormat[], sectionKey: string, bigBlindMicro: string): GameWithFormat | undefined =>
    games
        .filter(g => isCashTable(g) && sectionKeyOf(g) === sectionKey && g.bigBlind === bigBlindMicro && openSeats(g) > 0)
        .sort((a, b) => b.currentPlayers - a.currentPlayers || a.gameId.localeCompare(b.gameId))[0];

/** The distinct big blinds (micro-USDC strings) open cash tables offer in a section, smallest first. */
export const stakeOptions = (games: GameWithFormat[], sectionKey: string): string[] =>
    [...new Set(games.filter(g => isCashTable(g) && sectionKeyOf(g) === sectionKey).map(g => g.bigBlind))].sort((a, b) => Number(a) - Number(b));

/** Total players seated across the lobby. */
export const seatedTotal = (games: Pick<GameWithFormat, "currentPlayers">[]): number => games.reduce((sum, g) => sum + g.currentPlayers, 0);

/** Cash stakes as people say them: "$1 / $2", "$0.25 / $0.50" (no cents on whole dollars). */
export const lobbyStakesLabel = (game: Pick<GameWithFormat, "smallBlind" | "bigBlind">): string =>
    `${cashBlind(formatMicroAsUsdc(game.smallBlind, 2))} / ${cashBlind(formatMicroAsUsdc(game.bigBlind, 2))}`;

/**
 * Buy-in as the lobby shows it. Cash: the range, "$40 – $200". Sit & Go / tournament: the
 * single buy-in, "$2", or "$9 (8.10 + 0.90)" when a protocol fee is configured (the split
 * comes from the game's own protocolFeeBps, never a hardcoded rate — poker-vm#2592).
 */
export const lobbyBuyInLabel = (game: Pick<GameWithFormat, "gameFormat" | "minBuyIn" | "maxBuyIn" | "entryFee" | "protocolFeeBps">): string => {
    if (isTournamentFormat(game.gameFormat)) {
        const buyIn = cashBlind(formatMicroAsUsdc(game.minBuyIn, 2));
        const breakdown = computeSngEntryBreakdown(game.minBuyIn, game.entryFee, game.protocolFeeBps);
        if (!breakdown.hasProtocolFee) return buyIn;
        return `${buyIn} (${formatMicroAsUsdc(breakdown.prizePoolPortion, 2)} + ${formatMicroAsUsdc(breakdown.protocolCut, 2)})`;
    }
    return `${cashBlind(formatMicroAsUsdc(game.minBuyIn, 2))} – ${cashBlind(formatMicroAsUsdc(game.maxBuyIn, 2))}`;
};

/** Table size as players say it: "Heads-up", "6-max", "9-max". */
export const tableSizeLabel = (maxPlayers: number): string => (maxPlayers === 2 ? "Heads-up" : `${maxPlayers}-max`);

/** A DOM id for a lobby section, e.g. "lobby-cash-texas-hold-em". */
export const sectionAnchorId = (key: string): string => `lobby-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`;

/** React's useId() contains colons, which break url(#id) references in SVG; keep letters, digits, - and _. */
export const svgSafeId = (id: string): string => id.replace(/[^a-zA-Z0-9_-]/g, "");

/** A scheduled sit-and-go's phase now (poker-vm#2680); "unscheduled" for anything without a start time. */
export const lobbyPhase = (game: Pick<GameWithFormat, "scheduledStartTime" | "minPlayers" | "currentPlayers">, nowMs: number): ScheduledSngPhase =>
    scheduledSngPhase({ scheduledStartTime: game.scheduledStartTime, minPlayers: game.minPlayers, registered: game.currentPlayers, nowMs });

/** "Starts 20:30 · min 4 · Late reg: 2 levels" for a scheduled table, "Starting", "Cancelled: not enough players", or "". */
export const lobbyScheduleLabel = (game: Pick<GameWithFormat, "scheduledStartTime" | "minPlayers" | "currentPlayers" | "lateRegistrationLevels">, nowMs: number): string => {
    const phase = lobbyPhase(game, nowMs);
    if (phase === "unscheduled" || !hasValue(game.scheduledStartTime)) return "";
    if (phase === "cancelled") return "Cancelled: not enough players";
    if (phase === "ready") return "Starting";
    return [`Starts ${formatStartsAt(game.scheduledStartTime, nowMs)} · min ${game.minPlayers}`, formatLateRegistration(game.lateRegistrationLevels)].filter(hasContent).join(" · ");
};

/** True when this wallet created the table (owner tools: delete / close and refund). */
export const isTableCreator = (game: Pick<GameWithFormat, "creator">, address: string | null | undefined): boolean =>
    hasContent(address) && hasContent(game.creator) && game.creator.toLowerCase() === address.toLowerCase();

/** True when the configured treasury opened the table. False when no treasury is configured. */
export const isTreasuryTable = (game: Pick<GameWithFormat, "creator">, treasuryAddress: string): boolean => hasContent(treasuryAddress) && game.creator === treasuryAddress;

/** A USDC balance (decimal string, e.g. "1240.500000") as "$1,240.50". */
export const lobbyBalanceLabel = (usdc: string): string =>
    `$${Number(usdc).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** How many tables the sections of one kind hold. */
export const sectionCount = (sections: LobbySection[], kind: LobbySection["kind"]): number =>
    sections.filter(s => s.kind === kind).reduce((n, s) => n + s.games.length, 0);

/** The first section of a kind (the one the toolbar jumps to), if any. */
export const firstSectionOf = (sections: LobbySection[], kind: LobbySection["kind"]): LobbySection | undefined => sections.find(s => s.kind === kind);

/** Open seats across a list of tables. */
export const totalOpenSeats = (games: Pick<GameWithFormat, "maxPlayers" | "currentPlayers">[]): number => games.reduce((n, g) => n + openSeats(g), 0);

/** The sort a <select> value names, or undefined for anything else. */
export const toLobbySort = (value: string): LobbySort | undefined =>
    value === "stakes-up" || value === "stakes-down" || value === "most-players" || value === "most-open" ? value : undefined;

/**
 * One stake level: every table in a section with the same blinds (cash) or the
 * same buy-in (Sit & Go / tournament) and the same table size. The lobby shows
 * one card per level (its lead table) and the rest one tap away, so a row of
 * identical empty tables collapses into a single card.
 */
export interface StakeLevel {
    key: string;
    /** The table the card shows and Join opens. */
    lead: GameWithFormat;
    /** Every table at this level, the lead first. */
    tables: GameWithFormat[];
    seated: number;
    open: number;
}

/** Which level a table belongs to: section + blinds (cash) or buy-in (tournaments) + table size. */
export const levelKeyOf = (game: GameWithFormat): string =>
    isCashTable(game) ? `${sectionKeyOf(game)}|${game.smallBlind}|${game.bigBlind}|${game.maxPlayers}` : `${sectionKeyOf(game)}|${game.minBuyIn}|${game.maxPlayers}`;

/** A table the lobby lists: everything except a scheduled tournament that was cancelled for too few players. */
export const isListedTable = (game: GameWithFormat, nowMs: number): boolean => lobbyPhase(game, nowMs) !== "cancelled";

/**
 * The table a level's card leads with: one you can sit at (open seat) with the
 * most players already there, earliest scheduled start breaking ties; if every
 * table is full, the one with the most players.
 */
export const pickLead = (tables: GameWithFormat[]): GameWithFormat => {
    const byBusy = (a: GameWithFormat, b: GameWithFormat) =>
        b.currentPlayers - a.currentPlayers || (a.scheduledStartTime ?? 0) - (b.scheduledStartTime ?? 0) || a.gameId.localeCompare(b.gameId);
    const open = tables.filter(t => openSeats(t) > 0).sort(byBusy);
    return hasElements(open) ? open[0] : [...tables].sort(byBusy)[0];
};

/** Collapse a section's (already sorted) tables into stake levels, in the order each level first appears. */
export const groupLevels = (games: GameWithFormat[]): StakeLevel[] => {
    const map = new Map<string, GameWithFormat[]>();
    for (const g of games) map.set(levelKeyOf(g), [...(map.get(levelKeyOf(g)) ?? []), g]);
    return [...map.entries()].map(([key, tables]) => {
        const lead = pickLead(tables);
        return { key, lead, tables: [lead, ...tables.filter(t => t !== lead)], seated: seatedTotal(tables), open: totalOpenSeats(tables) };
    });
};

/** A table is "in play" when at least two players are seated. */
export const isInPlay = (game: Pick<GameWithFormat, "currentPlayers">): boolean => game.currentPlayers >= 2;

/** The other tables at the same stake level as `game`, busiest with a free seat first. */
export const othersAtLevel = (games: GameWithFormat[], game: GameWithFormat): GameWithFormat[] =>
    games
        .filter(g => g.gameId !== game.gameId && levelKeyOf(g) === levelKeyOf(game))
        .sort((a, b) => Number(openSeats(b) > 0) - Number(openSeats(a) > 0) || b.currentPlayers - a.currentPlayers || a.gameId.localeCompare(b.gameId));

/** How many lobby filters are set (search counts as one), for the Filters button badge. */
export const activeFilterCount = (f: { query: string; stake: StakeBand; size: SizeBand }): number =>
    Number(hasContent(f.query.trim())) + Number(f.stake !== "all") + Number(f.size !== "all");

/** True when a USDC balance (decimal string) is above zero. */
export const hasBalance = (usdc: string): boolean => Number(usdc) > 0;
