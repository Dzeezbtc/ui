import type { GameWithFormat } from "./convertUtils";
import { feltLabels } from "./lobbyLayout";
import { gameTypeOf, shortGameType } from "./lobbyTabs";
import { truncateHash } from "./formatUtils";
import { hasContent, hasValue } from "./guards";

/** A table the player has open, as the floating Tables button lists it. */
export interface MyTableItem {
    id: string;
    /** Stakes ("$2 / $5"), else the table's name, else its short id. */
    title: string;
    /** "Hold'em · 6-max" when the table is in the game list. */
    sub: string;
    /** "4/6" seats taken, when known. */
    seats: string | null;
}

/**
 * The player's open tables (from the multi-table workspace) labelled from the
 * game list: stakes, game and seats when the table is listed; otherwise its
 * saved name or short id, so a table the list hasn't loaded yet still shows.
 */
export const myTableItems = (open: { id: string; name?: string }[], games: GameWithFormat[]): MyTableItem[] =>
    open.map(t => {
        const game = games.find(g => g.gameId.toLowerCase() === t.id.toLowerCase());
        if (hasValue(game)) {
            const labels = feltLabels(game, shortGameType(gameTypeOf(game)));
            return { id: t.id, title: labels.title, sub: labels.sub, seats: `${game.currentPlayers}/${game.maxPlayers}` };
        }
        return { id: t.id, title: hasContent(t.name) ? t.name : truncateHash(t.id, 6), sub: "", seats: null };
    });
