/**
 * Tests for the CoinPoker-style pre-action bar rules (ui#388): when the bar shows,
 * the middle button's identity, what each pre-action resolves to on the player's
 * turn, when a stale selection is invalidated, and when it clears.
 */
import { PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";
import {
    shouldShowPreActions,
    shouldClearPreAction,
    resolvePreAction,
    middlePreAction,
    isBettingRound,
    isPreActionStillValid,
    PreActionsState,
    PreActionLegal
} from "./preActions";

const base: PreActionsState = {
    enabled: true,
    isUsersTurn: false,
    playerStatus: PlayerStatus.ACTIVE,
    round: TexasHoldemRound.FLOP
};

const canCheck: PreActionLegal = { hasCheckAction: true, hasCallAction: false, hasFoldAction: true };
const facingBet: PreActionLegal = { hasCheckAction: false, hasCallAction: true, hasFoldAction: true };
const blindTurn: PreActionLegal = { hasCheckAction: false, hasCallAction: false, hasFoldAction: true };

describe("shouldShowPreActions", () => {
    it("shows while in the hand, on a betting street, and not to act", () => {
        expect(shouldShowPreActions(base)).toBe(true);
    });
    it("hides when the setting is off", () => {
        expect(shouldShowPreActions({ ...base, enabled: false })).toBe(false);
    });
    it("hides on the player's own turn (the betting bar shows instead)", () => {
        expect(shouldShowPreActions({ ...base, isUsersTurn: true })).toBe(false);
    });
    it.each([PlayerStatus.FOLDED, PlayerStatus.SITTING_OUT, PlayerStatus.ALL_IN, PlayerStatus.SEATED, null, undefined])(
        "hides when not an active seat (%s)",
        playerStatus => expect(shouldShowPreActions({ ...base, playerStatus })).toBe(false)
    );
    it.each([TexasHoldemRound.ANTE, TexasHoldemRound.SHOWDOWN, TexasHoldemRound.END, null, undefined])(
        "hides off a betting street (%s)",
        round => expect(shouldShowPreActions({ ...base, round })).toBe(false)
    );
});

describe("middlePreAction", () => {
    it("is Check when checking is free, Call-exact when facing a bet", () => {
        expect(middlePreAction(true)).toBe("check");
        expect(middlePreAction(false)).toBe("call-exact");
    });
});

describe("resolvePreAction", () => {
    it("check-fold: checks when free", () => {
        expect(resolvePreAction("check-fold", canCheck)).toBe("check");
    });
    it("check-fold: folds only when genuinely facing a bet", () => {
        expect(resolvePreAction("check-fold", facingBet)).toBe("fold");
        expect(resolvePreAction("check-fold", blindTurn)).toBeNull();
    });
    it("check: checks when free, otherwise does nothing (never calls)", () => {
        expect(resolvePreAction("check", canCheck)).toBe("check");
        expect(resolvePreAction("check", facingBet)).toBeNull();
    });
    it("call-exact and call-any: call when facing a bet, check when there is none, never fold", () => {
        for (const a of ["call-exact", "call-any"] as const) {
            expect(resolvePreAction(a, facingBet)).toBe("call");
            expect(resolvePreAction(a, canCheck)).toBe("check");
            expect(resolvePreAction(a, blindTurn)).toBeNull();
        }
    });
});

describe("isPreActionStillValid", () => {
    it("check-fold and call-any survive a bet landing", () => {
        expect(isPreActionStillValid("check-fold", false, 7n, null)).toBe(true);
        expect(isPreActionStillValid("call-any", false, 7n, null)).toBe(true);
    });
    it("check is only valid while checking is free", () => {
        expect(isPreActionStillValid("check", true, 0n, null)).toBe(true);
        expect(isPreActionStillValid("check", false, 3n, null)).toBe(false);
    });
    it("call-exact clears when the bet goes away or the amount changes", () => {
        expect(isPreActionStillValid("call-exact", false, 3n, 3n)).toBe(true);
        expect(isPreActionStillValid("call-exact", false, 7n, 3n)).toBe(false); // raised
        expect(isPreActionStillValid("call-exact", true, 0n, 3n)).toBe(false); // bet gone
    });
});

describe("shouldClearPreAction", () => {
    it("clears when the player leaves the hand", () => {
        expect(shouldClearPreAction({ action: "check-fold", isUsersTurn: false, playerStatus: PlayerStatus.FOLDED })).toBe(true);
    });
    it("does not clear while still active, or on the player's turn", () => {
        expect(shouldClearPreAction({ action: "call-any", isUsersTurn: false, playerStatus: PlayerStatus.ACTIVE })).toBe(false);
        expect(shouldClearPreAction({ action: "call-any", isUsersTurn: true, playerStatus: PlayerStatus.FOLDED })).toBe(false);
    });
    it("nothing to clear when none is armed", () => {
        expect(shouldClearPreAction({ action: null, isUsersTurn: false, playerStatus: PlayerStatus.FOLDED })).toBe(false);
    });
});

describe("isBettingRound", () => {
    it("true on preflop/flop/turn/river, false otherwise", () => {
        for (const r of [TexasHoldemRound.PREFLOP, TexasHoldemRound.FLOP, TexasHoldemRound.TURN, TexasHoldemRound.RIVER]) {
            expect(isBettingRound(r)).toBe(true);
        }
        for (const r of [TexasHoldemRound.ANTE, TexasHoldemRound.SHOWDOWN, TexasHoldemRound.END, null, undefined]) {
            expect(isBettingRound(r)).toBe(false);
        }
    });
});
