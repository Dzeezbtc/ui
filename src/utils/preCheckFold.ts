import { PlayerStatus } from "@block52/poker-vm-sdk";

/**
 * The rules of the pre-select "Check/Fold" box (ui#388), as pure functions so
 * they can be unit tested apart from PokerActionPanel and usePreCheckFold.
 *
 * Check/Fold has the standard online-poker meaning: check if checking is free
 * when the player's turn comes, fold if someone bets first.
 */

/** What the player's own seat and the table look like right now. */
export interface PreCheckFoldState {
    /** The opt-in "Pre-Select Check/Fold" setting (default OFF). */
    enabled: boolean;
    /** Whether it is the player's turn (the action panel shows instead). */
    isUsersTurn: boolean;
    /** The player's seat status; only an ACTIVE seat is in the hand. */
    playerStatus: PlayerStatus | string | null | undefined;
    /** Whether checking would be free for the player right now. */
    facingNoBet: boolean;
    /** Whether the player has ticked the box. */
    queued: boolean;
}

/**
 * Whether to show the box.
 *
 * Shown only while the setting is on, the player is in the hand and it is not
 * their turn. It is first offered while checking is free; once ticked it stays
 * visible after a bet lands (relabelled "Fold") so the player can see, and
 * untick, what will happen.
 */
export function shouldShowPreCheckFold(state: PreCheckFoldState): boolean {
    return state.enabled && !state.isUsersTurn && state.playerStatus === PlayerStatus.ACTIVE && (state.facingNoBet || state.queued);
}

/**
 * Whether a ticked box must be cleared because the player left the hand (fold,
 * bust, sit out). A bet landing does NOT clear it — that is when Check/Fold
 * folds — and on the player's turn it is left for usePreCheckFold to consume.
 */
export function shouldClearPreCheckFold(state: Pick<PreCheckFoldState, "queued" | "isUsersTurn" | "playerStatus">): boolean {
    return state.queued && !state.isUsersTurn && state.playerStatus !== PlayerStatus.ACTIVE;
}

/** The box's label: "Fold" once a bet has landed, "Check/Fold" otherwise. */
export function preCheckFoldLabel(facingNoBet: boolean): "Check/Fold" | "Fold" {
    return facingNoBet ? "Check/Fold" : "Fold";
}

/** The legal actions that decide what a queued Check/Fold does on the player's turn. */
export interface PreCheckFoldLegalActions {
    hasCheckAction: boolean;
    hasCallAction: boolean;
    hasFoldAction: boolean;
}

/**
 * What a queued Check/Fold submits when the player's turn arrives:
 *
 *   - "check" if checking is free;
 *   - "fold" only when the player genuinely faces a bet (CALL is legal). FOLD
 *     alone is not enough: the engine offers fold-anytime, including on a
 *     blind-posting turn, and Check/Fold must never fold a player out of a hand
 *     they have not been bet into;
 *   - null otherwise: resolve without acting, so the player takes their turn.
 */
export function resolvePreCheckFoldAction(legal: PreCheckFoldLegalActions): "check" | "fold" | null {
    if (legal.hasCheckAction) {
        return "check";
    }
    if (legal.hasCallAction && legal.hasFoldAction) {
        return "fold";
    }
    return null;
}
