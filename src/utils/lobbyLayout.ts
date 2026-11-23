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
import { hasContent, hasElements, isBoolean, isNumber, isRecord, isString } from "./guards";

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
    /** Stake bands to show; empty = all. */
    stakes: readonly StakeBand[];
    /** Table sizes to show; empty = all. */
    sizes: readonly SizeBand[];
    /** Only tables the treasury opened. Ignored when no treasury address is configured. */
    treasuryOnly: boolean;
    treasuryAddress: string;
    /** gameId → club name, for search. */
    clubNames?: Record<string, string>;
    /** Leave out tables with no open seat. */
    hideFull?: boolean;
    /** Leave out tables nobody is sitting at. */
    hideEmpty?: boolean;
    /** Show tables of invite-only Circles (seen, not joinable). Off = they stay hidden. */
    showInviteOnly?: boolean;
    /** gameIds of tables whose Circle is invite-only. */
    inviteOnly?: ReadonlySet<string>;
}

/** Does a table pass the Show switches (invite only, hide full, hide empty)? */
export const passesShowFilters = (game: GameWithFormat, f: Pick<LobbyFilter, "hideFull" | "hideEmpty" | "showInviteOnly" | "inviteOnly">): boolean =>
    !(f.hideFull && openSeats(game) <= 0) && !(f.hideEmpty && game.currentPlayers <= 0) && (Boolean(f.showInviteOnly) || !f.inviteOnly?.has(game.gameId));

/** gameIds of tables whose Circle only lets people in by invite. */
export const inviteOnlyTables = (tables: Record<string, { joining?: string }>): Set<string> =>
    new Set(Object.entries(tables).filter(([, c]) => c.joining === "invite").map(([id]) => id));

/** All tables that pass the lobby filters. */
export const filterLobbyGames = (games: GameWithFormat[], f: LobbyFilter): GameWithFormat[] =>
    games.filter(
        g =>
            (!f.treasuryOnly || !hasContent(f.treasuryAddress) || g.creator === f.treasuryAddress) &&
            matchesStakes(g, f.stakes) &&
            matchesSizes(g, f.sizes) &&
            matchesSearch(g, f.query, f.clubNames?.[g.gameId]) &&
            passesShowFilters(g, f)
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

/** Which level a table belongs to: section + blinds (cash) or buy-in (tournaments) + table size. */
export const levelKeyOf = (game: GameWithFormat): string =>
    isCashTable(game) ? `${sectionKeyOf(game)}|${game.smallBlind}|${game.bigBlind}|${game.maxPlayers}` : `${sectionKeyOf(game)}|${game.minBuyIn}|${game.maxPlayers}`;

/** A table the lobby lists: everything except a scheduled tournament that was cancelled for too few players. */
export const isListedTable = (game: GameWithFormat, nowMs: number): boolean => lobbyPhase(game, nowMs) !== "cancelled";

/**
 * The tables a stake level's row shows: every table with players (most players
 * first, so full tables come before ones with a seat), then ONE empty table so
 * there is always somewhere to start a game. Other empty tables are left out,
 * so a level with six tables and two in play shows three cards, not six.
 */
export const visibleLevelTables = (tables: GameWithFormat[]): GameWithFormat[] => {
    const occupied = tables.filter(t => t.currentPlayers > 0).sort((a, b) => b.currentPlayers - a.currentPlayers || openSeats(a) - openSeats(b) || a.gameId.localeCompare(b.gameId));
    const empty = tables.filter(t => t.currentPlayers === 0).sort((a, b) => a.gameId.localeCompare(b.gameId));
    return [...occupied, ...empty.slice(0, 1)];
};

/** A table is "in play" when at least two players are seated. */
export const isInPlay = (game: Pick<GameWithFormat, "currentPlayers">): boolean => game.currentPlayers >= 2;

/** The other tables at the same stake level as `game`, busiest with a free seat first. */
export const othersAtLevel = (games: GameWithFormat[], game: GameWithFormat): GameWithFormat[] =>
    games
        .filter(g => g.gameId !== game.gameId && levelKeyOf(g) === levelKeyOf(game))
        .sort((a, b) => Number(openSeats(b) > 0) - Number(openSeats(a) > 0) || b.currentPlayers - a.currentPlayers || a.gameId.localeCompare(b.gameId));

/** How many lobby filters are set (search counts as one), for the Filters button badge. */
export const activeFilterCount = (f: { query: string; stakes: readonly StakeBand[]; sizes: readonly SizeBand[]; hideFull?: boolean; hideEmpty?: boolean; inviteOnly?: boolean }): number =>
    Number(hasContent(f.query.trim())) + Number(hasElements([...f.stakes])) + Number(hasElements([...f.sizes])) + Number(Boolean(f.hideFull)) + Number(Boolean(f.hideEmpty)) + Number(Boolean(f.inviteOnly));

/** True when a USDC balance (decimal string) is above zero. */
export const hasBalance = (usdc: string): boolean => Number(usdc) > 0;

/**
 * "Join similar table" for a full table: another table at the same stakes and
 * size with a free seat, preferring one that already has players. Undefined
 * when there is none (the lobby then offers to create one).
 */
export const similarOpenTable = (games: GameWithFormat[], game: GameWithFormat): GameWithFormat | undefined =>
    othersAtLevel(games, game).find(g => openSeats(g) > 0);

/** Multi-select stake filter: no bands picked means every stake. */
export const matchesStakes = (game: GameWithFormat, bands: readonly StakeBand[]): boolean => !hasElements([...bands]) || bands.some(b => matchesStake(game, b));

/** Multi-select size filter: no bands picked means every size. */
export const matchesSizes = (game: Pick<GameWithFormat, "maxPlayers">, bands: readonly SizeBand[]): boolean => !hasElements([...bands]) || bands.some(b => matchesSize(game, b));

/** Add a band to a multi-select filter, or take it out if it is already there. "all" clears the filter. */
export const toggleBand = <T extends string>(bands: readonly T[], band: T | "all"): T[] =>
    band === "all" ? [] : bands.includes(band) ? bands.filter(b => b !== band) : [...bands, band];

/** The lobby filters a player keeps between visits. */
export interface LobbyPrefs {
    stakes: StakeBand[];
    sizes: SizeBand[];
    sort: LobbySort;
    treasuryOnly: boolean;
    /** Show switches: invite-only Circles' tables, and hiding full or empty tables. */
    inviteOnly?: boolean;
    hideFull?: boolean;
    hideEmpty?: boolean;
    /** Table sizes switched on in each stake row, by stake key. A stake with no entry starts on its busiest size. */
    rowSizes: Record<string, number[]>;
    /** The tab the lobby was last on: "cash", "sit-and-go" or "tournament". */
    tab: string;
    /** The areas switched on (several can be on at once; they stack in lobby order). */
    tabs?: string[];
    /** The game type picked in each tab, by tab. */
    types: Record<string, string>;
}

const isStakeBand = (v: unknown): v is StakeBand => v === "micro" || v === "low" || v === "mid" || v === "high";
const isSizeBand = (v: unknown): v is SizeBand => v === "heads-up" || v === "6-max" || v === "9-max";

const parseRowSizes = (raw: Record<string, unknown>): Record<string, number[]> =>
    Object.fromEntries(
        Object.entries(raw)
            .map(([key, v]): [string, number[]] => [key, Array.isArray(v) ? v.filter((n): n is number => isNumber(n) && Number.isInteger(n) && n > 1) : []])
            .filter(([, v]) => hasElements(v))
    );

const parseTypes = (raw: Record<string, unknown>): Record<string, string> =>
    Object.fromEntries(Object.entries(raw).filter((e): e is [string, string] => isString(e[1])));

/** Read saved lobby filters (JSON from storage). Anything missing or unrecognised falls back to `defaults`. */
export const parseLobbyPrefs = (raw: string | null, defaults: LobbyPrefs): LobbyPrefs => {
    if (!hasContent(raw)) return defaults;
    try {
        const data: unknown = JSON.parse(raw);
        if (!isRecord(data)) return defaults;
        return {
            stakes: Array.isArray(data.stakes) ? data.stakes.filter(isStakeBand) : defaults.stakes,
            sizes: Array.isArray(data.sizes) ? data.sizes.filter(isSizeBand) : defaults.sizes,
            sort: isString(data.sort) ? (toLobbySort(data.sort) ?? defaults.sort) : defaults.sort,
            treasuryOnly: isBoolean(data.treasuryOnly) ? data.treasuryOnly : defaults.treasuryOnly,
            inviteOnly: isBoolean(data.inviteOnly) ? data.inviteOnly : defaults.inviteOnly,
            hideFull: isBoolean(data.hideFull) ? data.hideFull : defaults.hideFull,
            hideEmpty: isBoolean(data.hideEmpty) ? data.hideEmpty : defaults.hideEmpty,
            rowSizes: isRecord(data.rowSizes) ? parseRowSizes(data.rowSizes) : defaults.rowSizes,
            tab: isString(data.tab) ? data.tab : defaults.tab,
            tabs: Array.isArray(data.tabs) ? data.tabs.filter(isString) : defaults.tabs,
            types: isRecord(data.types) ? parseTypes(data.types) : defaults.types
        };
    } catch {
        return defaults;
    }
};

/** Tables that have at least one player. */
export const occupiedTables = (tables: GameWithFormat[]): GameWithFormat[] => tables.filter(t => t.currentPlayers > 0);

/** Tables with a game going (two or more players), matching the cards' In play badge. */
export const inPlayTables = (tables: GameWithFormat[]): GameWithFormat[] => tables.filter(isInPlay);

/** Which stake row a table belongs to: section + blinds (cash) or buy-in (tournaments), any table size. */
export const stakeKeyOf = (game: GameWithFormat): string =>
    isCashTable(game) ? `${sectionKeyOf(game)}|${game.smallBlind}|${game.bigBlind}` : `${sectionKeyOf(game)}|${game.minBuyIn}`;

/** One table size inside a stake row. */
export interface RowSize {
    size: number;
    tables: GameWithFormat[];
    /** Players seated at this size. */
    seated: number;
    /** Tables with a game going (2+ players) at this size. */
    inPlay: number;
}

/** One stake inside a game section: every table at those stakes, split by table size for the row's size chips. */
export interface StakeRow {
    key: string;
    /** A table at these stakes, for the row's label. */
    sample: GameWithFormat;
    /** Sizes at this stake, largest first. */
    sizes: RowSize[];
    seated: number;
    open: number;
}

/** Group a section's tables into stake rows (all sizes together). */
export const groupStakeRows = (games: GameWithFormat[]): StakeRow[] => {
    const map = new Map<string, GameWithFormat[]>();
    for (const g of games) map.set(stakeKeyOf(g), [...(map.get(stakeKeyOf(g)) ?? []), g]);
    return [...map.entries()].map(([key, tables]) => {
        const bySize = new Map<number, GameWithFormat[]>();
        for (const t of tables) bySize.set(t.maxPlayers, [...(bySize.get(t.maxPlayers) ?? []), t]);
        const sizes = [...bySize.entries()]
            .sort(([a], [b]) => b - a)
            .map(([size, list]) => ({ size, tables: list, seated: seatedTotal(list), inPlay: list.filter(isInPlay).length }));
        return { key, sample: tables[0], sizes, seated: seatedTotal(tables), open: totalOpenSeats(tables) };
    });
};

/** A stake where nobody is sitting at any size; it folds into the section's "No one playing yet" line. */
export const isQuietStake = (row: StakeRow): boolean => row.seated === 0;

/** The size a row starts on: the size with the most players (larger size on a tie), else the largest size. */
export const busiestSize = (row: StakeRow): number => [...row.sizes].sort((a, b) => b.seated - a.seated || b.size - a.size)[0].size;

/** The sizes switched on for a row: the saved choice (sizes that still exist), else the busiest size. Never empty. */
export const rowSizeSelection = (row: StakeRow, saved: number[] | undefined): number[] => {
    const valid = (saved ?? []).filter(n => row.sizes.some(s => s.size === n));
    return hasElements(valid) ? valid : [busiestSize(row)];
};

/** Switch a size on or off in a row; the last size can't be switched off. */
export const toggleRowSize = (selected: number[], size: number): number[] => {
    if (!selected.includes(size)) return [...selected, size];
    const next = selected.filter(n => n !== size);
    return hasElements(next) ? next : selected;
};

/**
 * The cards a row shows for the sizes switched on: tables with players (most
 * first), then one spare empty table for each size switched on, so turning on
 * a size always shows somewhere to sit at that size.
 */
export const rowTables = (row: StakeRow, selected: number[]): GameWithFormat[] => {
    const on = row.sizes.filter(s => selected.includes(s.size));
    const occupied = visibleLevelTables(on.flatMap(s => s.tables)).filter(t => t.currentPlayers > 0);
    const spares = on.flatMap(s => s.tables.filter(t => t.currentPlayers === 0).sort((a, b) => a.gameId.localeCompare(b.gameId)).slice(0, 1));
    return [...occupied, ...spares];
};

/** Order stake rows: busiest first (players seated), or by stakes, or by open seats. */
export const sortStakeRows = (rows: StakeRow[], sort: LobbySort): StakeRow[] => {
    const bb = (r: StakeRow) => Number(r.sample.bigBlind) || Number(r.sample.minBuyIn);
    return [...rows].sort((a, b) => {
        if (sort === "most-players") return b.seated - a.seated || bb(a) - bb(b);
        if (sort === "stakes-down") return bb(b) - bb(a);
        if (sort === "most-open") return b.open - a.open || bb(a) - bb(b);
        return bb(a) - bb(b);
    });
};

/** For a quiet stake: the empty table its "No one playing yet" chip opens (the largest size). */
export const quietStakeTable = (row: StakeRow): GameWithFormat => row.sizes[0].tables[0];

/** What a row shows for the sizes switched on: its cards, and the in-play / open-seat counts for those sizes. */
export const rowView = (row: StakeRow, selected: number[]): { cards: GameWithFormat[]; inPlay: number; open: number } => {
    const on = row.sizes.filter(s => selected.includes(s.size));
    return { cards: rowTables(row, selected), inPlay: on.reduce((n, s) => n + s.inPlay, 0), open: on.reduce((n, s) => n + totalOpenSeats(s.tables), 0) };
};

/** Split a section into stake rows with players (sorted) and quiet stakes (nobody seated, by stakes). */
export const sectionRows = (games: GameWithFormat[], sort: LobbySort): { active: StakeRow[]; quiet: StakeRow[] } => {
    const rows = groupStakeRows(games);
    return { active: sortStakeRows(rows.filter(r => !isQuietStake(r)), sort), quiet: sortStakeRows(rows.filter(isQuietStake), "stakes-up") };
};

/**
 * What a lobby card writes on its felt: the stakes (cash) or the buy-in
 * (Sit & Go / tournament, without the fee split) as the big line, and the game
 * and table size underneath. `gameName` is the game as the lobby names it
 * ("Texas Hold'em", "Sit & Go"...).
 */
export const feltLabels = (game: GameWithFormat, gameName: string): { title: string; sub: string } => ({
    title: isTournamentFormat(game.gameFormat) ? cashBlind(formatMicroAsUsdc(game.minBuyIn, 2)) : lobbyStakesLabel(game),
    sub: `${gameName} · ${tableSizeLabel(game.maxPlayers)}`
});

/** A stake level's band, for the lobby's level headings. */
export type StakeLevel = Exclude<StakeBand, "all">;

const LEVELS: StakeLevel[] = ["micro", "low", "mid", "high"];

/** Which level a stake row is in (by big blind: micro up to 20c, low up to $2, mid up to $10, high above). */
export const stakeLevelOf = (row: StakeRow): StakeLevel => LEVELS.find(l => matchesStake(row.sample, l)) ?? "high";

/**
 * Stake rows as tiles grouped by level (micro first), each level's stakes low to high. Tournaments are one group.
 * With `allLevels`, cash games keep every level (micro, low, mid, high) even when it has no tables yet, so the
 * lobby always shows the same four blocks in the same places.
 */
export const stakeLevels = (rows: StakeRow[], allLevels = false): { level: StakeLevel | "buy-in"; rows: StakeRow[] }[] => {
    const sorted = sortStakeRows(rows, "stakes-up");
    if (!sorted.some(r => isCashTable(r.sample))) return hasElements(sorted) ? [{ level: "buy-in", rows: sorted }] : [];
    const groups = LEVELS.map(level => ({ level, rows: sorted.filter(r => stakeLevelOf(r) === level) }));
    return allLevels ? groups : groups.filter(g => hasElements(g.rows));
};

/** The stakes a level offers when nobody has opened a table there yet (small blind, big blind in dollars). */
export const LEVEL_DEFAULT_STAKES: Record<StakeLevel, { smallBlind: number; bigBlind: number }> = {
    micro: { smallBlind: 0.05, bigBlind: 0.1 },
    low: { smallBlind: 0.5, bigBlind: 1 },
    mid: { smallBlind: 2, bigBlind: 5 },
    high: { smallBlind: 10, bigBlind: 20 }
};

/** A tile's sizes, short and biggest first: "9-max · 6-max · H/U" (3–6 seats count as 6-max). */
export const tileSizesLabel = (sizes: readonly number[]): string => {
    const bands = new Set<string>(sizes.map(n => (n === 2 ? "H/U" : n <= 6 ? "6-max" : "9-max")));
    return ["9-max", "6-max", "H/U"].filter(b => bands.has(b)).join(" · ");
};

/** The table a stake tile pictures: its busiest table (most players), else its largest. */
export const tileTable = (row: StakeRow): GameWithFormat =>
    [...row.sizes.flatMap(s => s.tables)].sort((a, b) => b.currentPlayers - a.currentPlayers || b.maxPlayers - a.maxPlayers)[0];

/** A box on screen (from getBoundingClientRect). */
export interface ScreenBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * The transform that makes the stake panel sit exactly over the tile it came from,
 * so it can grow out of the tile into the middle (and shrink back into it on close).
 */
export const growFrom = (from: ScreenBox, to: ScreenBox): string => {
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const sx = to.width > 0 ? from.width / to.width : 1;
    const sy = to.height > 0 ? from.height / to.height : 1;
    return `translate(${Math.round(dx)}px, ${Math.round(dy)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
};
