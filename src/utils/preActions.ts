import { PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";

/**
 * The pre-action bar (ui#388), CoinPoker-style. While it is NOT the player's turn
 * they can arm one pre-action, which fires the instant their turn comes (so the
 * betting bar never appears). The buttons shown depend on whether the player will
 * be able to CHECK when action returns to them:
 *
 *   - **Can check** (no bet owed and they haven't committed this round):
 *       "Check/Fold"  — check if still free on my turn, else fold
 *       "Check"       — check
 *       "Call Any"    — call whatever the bet is
 *   - **Cannot check** (facing a bet, or they already bet/called and only a raise
 *     brings action back):
 *       "Fold"            — fold
 *       "Call {amount}"   — call that exact size (only when a concrete bet is owed)
 *       "Call Any"        — call whatever the bet is
 *
 * These are pure functions so they can be unit tested apart from the component.
 */
export type PreAction = "check-fold" | "check" | "fold" | "call-exact" | "call-any";

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
    if (action === "fold") {
        // Fold to anything.
        return legal.hasFoldAction ? "fold" : null;
    }
    // "call-exact" and "call-any": call whatever the bet is; if there is no bet, check (never fold).
    if (legal.hasCallAction) return "call";
    if (legal.hasCheckAction) return "check";
    return null;
}

/**
 * Whether an armed pre-action is still valid for the current table context, so a
 * stale selection never fires the wrong move and never lingers on the wrong button
 * set after the betting picture changes.
 *
 *   - "call-any" is offered in every situation, so it always survives;
 *   - "check-fold" / "check" belong to the can-check button set — they clear the
 *     moment a bet lands (the buttons switch to Fold/Call);
 *   - "fold" belongs to the cannot-check set — it clears if checking becomes free again;
 *   - "call-exact" is tied to a specific owed amount — it clears if checking becomes
 *     free, the bet goes to zero, or the amount changes (e.g. a raise).
 */
export function isPreActionStillValid(
    action: PreAction,
    canCheck: boolean,
    amountToCallMicro: bigint,
    armedCallMicro: bigint | null
): boolean {
    switch (action) {
        case "call-any":
            return true;
        case "check-fold":
        case "check":
            return canCheck;
        case "fold":
            return !canCheck;
        case "call-exact":
            return !canCheck && amountToCallMicro > BigInt(0) && armedCallMicro != null && amountToCallMicro === armedCallMicro;
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
