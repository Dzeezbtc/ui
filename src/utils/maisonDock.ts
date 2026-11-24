import { hasContent } from "./guards";
import { STREET_LABELS, streetIndex } from "./streetTracker";
import { whoseTurn } from "./turnStatus";

/** A hand's winner, as Maison 52's dock says it between hands. */
export interface DockWinner {
    seat: number;
    /** Already formatted ("$195", "1,950 chips"). */
    amount: string;
    /** The winning hand in words, when the hand went to a showdown. */
    hand?: string;
}

/** What Maison 52's dock says in its middle: a line and a quieter detail. */
export interface DockLine {
    title: string;
    detail: string;
    /** True when the line is about you (your turn, you won): drawn in gold. */
    mine: boolean;
}

/** The street's name for the dock ("Flop"), or "" outside the four streets. */
export const dockStreet = (round: string | undefined): string => {
    const i = streetIndex(round);
    return i < 0 ? "" : i === 0 ? "Pre-flop" : STREET_LABELS[i];
};

/**
 * Maison 52's dock line (Dzeezbtc/ui#38). Seats are 1-based; `mySeat` is 0 or
 * less when you only watch. A finished hand says who won; otherwise whose turn
 * it is and the street. Watching with nothing on says so, so the dock is never
 * an empty band.
 */
export const maisonDockLine = (mySeat: number, nextToAct: number, round: string | undefined, winner: DockWinner | null): DockLine | null => {
    const seated = mySeat > 0;
    if (winner) {
        const mine = seated && winner.seat === mySeat;
        return { title: `${mine ? "You" : `Seat ${winner.seat}`} won ${winner.amount}`, detail: hasContent(winner.hand) ? winner.hand : "", mine };
    }
    const street = dockStreet(round);
    if (nextToAct > 0) {
        if (seated && nextToAct === mySeat) return { title: "Your turn", detail: street, mine: true };
        const turn = whoseTurn(nextToAct);
        return { title: seated ? "Waiting" : "Watching", detail: hasContent(street) ? `${turn} · ${street}` : turn, mine: false };
    }
    return seated ? null : { title: "Watching", detail: "Between hands", mine: false };
};

/** True while the table has a seat to take (`seated` = players at the table now). */
export const hasFreeSeat = (seated: number, maxPlayers: number | undefined): boolean => (maxPlayers ?? 0) > seated;

/** A won amount as the dock says it: "$195.00" at a cash table; tournament chips as they come ("1,950 chips"). */
export const dockAmount = (formatted: string, isTournament: boolean): string => (isTournament ? formatted : `$${formatted}`);
