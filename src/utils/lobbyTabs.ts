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

/** The tables a tab shows for one game type. */
export const gamesFor = (games: GameWithFormat[], tab: LobbyTab, type: string | undefined): GameWithFormat[] =>
    games.filter(g => tabOf(g) === tab && gameTypeOf(g) === type);

/** A game type's short name for a phone's chip row ("Hold'em", "PLO"); unknown types keep their name. */
export const shortGameType = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("omaha")) return t.includes("pot-limit") || t.includes("pot limit") ? "PLO" : "Omaha";
    if (t.includes("hold")) return "Hold'em";
    return type;
};
