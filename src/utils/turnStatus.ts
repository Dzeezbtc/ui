/** Whose turn it is, as the flagship's status label says it. */
export interface TurnStatus {
    /** True when it is your turn. */
    mine: boolean;
    /** "Your turn", or "Waiting" with whose turn it is. */
    title: string;
    /** "(Seat 5's turn)" while you wait; empty on your turn. */
    detail: string;
}

/**
 * The turn status for a seated player, or null when nobody is to act (between
 * hands) or you are not seated. Seats are 1-based; `nextToAct` is the seat to
 * act, `mySeat` yours (0 or less when not seated).
 */
export const turnStatus = (nextToAct: number, mySeat: number): TurnStatus | null => {
    if (mySeat <= 0 || nextToAct <= 0) return null;
    if (nextToAct === mySeat) return { mine: true, title: "Your turn", detail: "" };
    return { mine: false, title: "Waiting", detail: `(Seat ${nextToAct}'s turn)` };
};

/** Whose turn it is, plain ("Seat 5's turn"): Maison 52's dock says "Waiting — Seat 5's turn". */
export const whoseTurn = (nextToAct: number): string => `Seat ${nextToAct}'s turn`;
