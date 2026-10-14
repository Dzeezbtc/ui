import { PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";

/**
 * The pre-action bar (ui#388), CoinPoker-style. While it is NOT the player's turn
 * they can arm one of three pre-actions, which fires the instant their turn comes
 * (so the betting bar never appears). The three buttons are:
 *
 *   - left   "Check/Fold" — check if checking is free when my turn comes, else fold;
 *   - middle, context-aware:
 *        "Check"        when no one has bet into me (arms `check`);
 *        "Call {amount}" when I face a bet         (arms `call-exact` — that exact size);
 *   - right  "Call Any"  — call whatever the bet is when my turn comes.
 *
 * These are pure functions so they can be unit tested apart from the component.
 */
export type PreAction = "check-fold" | "check" | "call-exact" | "call-any";

/** The middle button's identity depends on whether checking is currently free. */
export function middlePreAction(facingNoBet: boolean): "check" | "call-exact" {
    return facingNoBet ? "check" : "call-exact";
}

const BETTING_ROUNDS: ReadonlySet<string> = new Set([
    TexasHoldemRound.PREFLOP,
    TexasHoldemRound.FLOP,
    TexasHoldemRound.TURN,
    TexasHoldemRound.RIVER
]);

/** Whether the hand is on a betting street (not ante, showdown or end — nothing to pre-select there). */
export function isBettingRound(round: TexasHoldemRound | string | null | undefined): boolean {
    return round != null && BETTING_ROUNDS.has(round);
}

/** Table/seat snapshot that decides whether the pre-action bar is shown. */
export interface PreActionsState {
    /** The opt-in pre-action setting (default ON unless ?autofold=false). */
    enabled: boolean;
    /** Whether it is the player's turn (the real action panel shows instead). */
    isUsersTurn: boolean;
    /** The player's seat status; only an ACTIVE seat is in the hand. */
    playerStatus: PlayerStatus | string | null | undefined;
    /** The current betting round; the bar only applies to a live betting street. */
    round: TexasHoldemRound | string | null | undefined;
}

/**
 * Whether to show the pre-action bar: the setting is on, the hand is on a live
 * betting street, the player is in the hand, and it is not their turn.
 */
export function shouldShowPreActions(state: PreActionsState): boolean {
    return state.enabled && isBettingRound(state.round) && !state.isUsersTurn && state.playerStatus === PlayerStatus.ACTIVE;
}

/** The legal actions at the moment the player's turn arrives. */
export interface PreActionLegal {
    hasCheckAction: boolean;
    hasCallAction: boolean;
    hasFoldAction: boolean;
}

export type ResolvedPreAction = "check" | "fold" | "call";

/**
 * What an armed pre-action submits when the player's turn arrives, or null to do
 * nothing (let the player take their turn normally).
 */
export function resolvePreAction(action: PreAction, legal: PreActionLegal): ResolvedPreAction | null {
    if (action === "check-fold") {
        // Check if free; fold only when genuinely facing a bet (CALL is legal),
        // never on a blind-posting turn where FOLD alone is offered.
        if (legal.hasCheckAction) return "check";
        if (legal.hasCallAction && legal.hasFoldAction) return "fold";
        return null;
    }
    if (action === "check") {
        // Check only. If a bet landed before the turn, checking is impossible — do nothing.
        return legal.hasCheckAction ? "check" : null;
    }
    // "call-exact" and "call-any": call whatever the bet is; if there is no bet, check (never fold).
    if (legal.hasCallAction) return "call";
    if (legal.hasCheckAction) return "check";
    return null;
}

/**
 * Whether an armed pre-action is still valid for the current table context, so a
 * stale selection never fires the wrong move.
 *
 *   - "check-fold" / "call-any" survive a bet landing (they are defined for both cases);
 *   - "check" is only valid while checking is free (clears when a bet lands);
 *   - "call-exact" is tied to a specific call size (clears when a bet lands away, or
 *     when the amount changes — e.g. a raise — so it never calls more than was shown).
 */
export function isPreActionStillValid(
    action: PreAction,
    facingNoBet: boolean,
    currentCallMicro: bigint,
    armedCallMicro: bigint | null
): boolean {
    switch (action) {
        case "check-fold":
        case "call-any":
            return true;
        case "check":
            return facingNoBet;
        case "call-exact":
            return !facingNoBet && armedCallMicro != null && currentCallMicro === armedCallMicro;
    }
}

/** An armed pre-action is cleared when the player leaves the hand (fold, bust, sit out). */
export function shouldClearPreAction(state: {
    action: PreAction | null;
    isUsersTurn: boolean;
    playerStatus: PlayerStatus | string | null | undefined;
}): boolean {
    return state.action != null && !state.isUsersTurn && state.playerStatus !== PlayerStatus.ACTIVE;
}
