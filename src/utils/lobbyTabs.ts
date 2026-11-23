import { hasElements } from "./guards";
import type { GameWithFormat } from "./convertUtils";
import { formatTableGameDisplay, toGameVariant } from "./gameFormatUtils";
import { sectionKeyOf, seatedTotal } from "./lobbyLayout";

/** The lobby's three areas. */
export type LobbyTab = "cash" | "sit-and-go" | "tournament";

export const LOBBY_TABS: LobbyTab[] = ["cash", "sit-and-go", "tournament"];

export const isLobbyTab = (v: unknown): v is LobbyTab => v === "cash" || v === "sit-and-go" || v === "tournament";

/** Which tab a table lives in. */
export const tabOf = (game: GameWithFormat): LobbyTab => {
    const key = sectionKeyOf(game);
    if (key === "tournament") return "tournament";
    if (key === "sit-and-go") return "sit-and-go";
    return "cash";
};

/** A table's game type, as the type chips name it: "Texas Hold'em", "Pot-Limit Omaha"... */
export const gameTypeOf = (game: GameWithFormat): string => formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit);

/** How many tables each tab holds. */
export const tabCounts = (games: GameWithFormat[]): Record<LobbyTab, number> => {
    const counts: Record<LobbyTab, number> = { cash: 0, "sit-and-go": 0, tournament: 0 };
    for (const g of games) counts[tabOf(g)] += 1;
    return counts;
};

export interface GameTypeChip {
    type: string;
    tables: number;
    seated: number;
}

/** The game types with tables in a tab, busiest first (most players seated, then most tables, then by name). */
export const gameTypesIn = (games: GameWithFormat[], tab: LobbyTab): GameTypeChip[] => {
    const byType = new Map<string, GameWithFormat[]>();
    for (const g of games) {
        if (tabOf(g) !== tab) continue;
        const t = gameTypeOf(g);
        byType.set(t, [...(byType.get(t) ?? []), g]);
    }
    return [...byType.entries()]
        .map(([type, list]) => ({ type, tables: list.length, seated: seatedTotal(list) }))
        .sort((a, b) => b.seated - a.seated || b.tables - a.tables || a.type.localeCompare(b.type));
};

/** The type a tab shows: the saved one if it still has tables, else the busiest. Undefined for an empty tab. */
export const activeGameType = (chips: GameTypeChip[], saved: string | undefined): string | undefined =>
    chips.some(c => c.type === saved) ? saved : chips[0]?.type;

/** The tab the lobby opens on: the saved one if it has tables, else the first tab that does, else cash. */
export const activeTab = (counts: Record<LobbyTab, number>, saved: LobbyTab | undefined): LobbyTab => {
    if (saved && counts[saved] > 0) return saved;
    return LOBBY_TABS.find(t => counts[t] > 0) ?? "cash";
};

/**
 * The areas the lobby shows, in lobby order (Cash games, Sit & Go, Tournaments).
 * Uses the saved picks; with none saved, falls back to the one tab `activeTab` picks.
 */
export const activeTabs = (counts: Record<LobbyTab, number>, saved: readonly string[] | undefined, legacy: LobbyTab | undefined): LobbyTab[] => {
    const picked = LOBBY_TABS.filter(t => (saved ?? []).includes(t));
    return hasElements(picked) ? picked : [activeTab(counts, legacy)];
};

/** Switch an area on or off. The last one left stays on, so the lobby is never blank. */
export const toggleTab = (tabs: readonly LobbyTab[], tab: LobbyTab): LobbyTab[] => {
    if (!tabs.includes(tab)) return LOBBY_TABS.filter(t => t === tab || tabs.includes(t));
    return tabs.length > 1 ? tabs.filter(t => t !== tab) : [...tabs];
};

/** The tables a tab shows for one game type. */
export const gamesFor = (games: GameWithFormat[], tab: LobbyTab, type: string | undefined): GameWithFormat[] =>
    games.filter(g => tabOf(g) === tab && gameTypeOf(g) === type);

/**
 * A game type as the lobby names it: "Hold'em" or "Omaha" (5- and 6-card Omaha
 * will sit under Omaha as PLO5 / PLO6 when they arrive). Unknown types keep their name.
 */
export const shortGameType = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("omaha")) return "Omaha";
    if (t.includes("hold")) return "Hold'em";
    return type;
};
