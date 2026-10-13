/**
 * Tests for the pre-select Check/Fold rules (ui#388): when the box shows, when a
 * ticked box clears, its label, and what it submits on the player's turn.
 */
import { PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";
import { shouldShowPreCheckFold, shouldClearPreCheckFold, preCheckFoldLabel, resolvePreCheckFoldAction, isBettingRound, PreCheckFoldState } from "./preCheckFold";

// In the hand, not to act, checking free, setting on, not yet ticked, on a betting street.
const base: PreCheckFoldState = {
    enabled: true,
    isUsersTurn: false,
    playerStatus: PlayerStatus.ACTIVE,
    facingNoBet: true,
    queued: false,
    round: TexasHoldemRound.FLOP
};

describe("shouldShowPreCheckFold", () => {
    it("shows while in the hand, not to act, and checking is free", () => {
        expect(shouldShowPreCheckFold(base)).toBe(true);
    });

    it("hides when the setting is off", () => {
        expect(shouldShowPreCheckFold({ ...base, enabled: false })).toBe(false);
    });

    it("hides on the player's own turn (the action panel shows instead)", () => {
        expect(shouldShowPreCheckFold({ ...base, isUsersTurn: true })).toBe(false);
        expect(shouldShowPreCheckFold({ ...base, isUsersTurn: true, queued: true })).toBe(false);
    });

    it.each([PlayerStatus.FOLDED, PlayerStatus.SITTING_OUT, PlayerStatus.ALL_IN, PlayerStatus.SEATED, null, undefined])(
        "hides when the player is not an active seat in the hand (%s)",
        playerStatus => {
            expect(shouldShowPreCheckFold({ ...base, playerStatus, queued: true })).toBe(false);
        }
    );

    it("is not offered for the first time when already facing a bet", () => {
        expect(shouldShowPreCheckFold({ ...base, facingNoBet: false, queued: false })).toBe(false);
    });

    it("stays visible once ticked after a bet lands, so the player sees it will fold", () => {
        expect(shouldShowPreCheckFold({ ...base, facingNoBet: false, queued: true })).toBe(true);
    });

    it.each([TexasHoldemRound.PREFLOP, TexasHoldemRound.FLOP, TexasHoldemRound.TURN, TexasHoldemRound.RIVER])(
        "shows on betting street %s",
        round => {
            expect(shouldShowPreCheckFold({ ...base, round })).toBe(true);
        }
    );

    it.each([TexasHoldemRound.ANTE, TexasHoldemRound.SHOWDOWN, TexasHoldemRound.END, null, undefined])(
        "hides off a betting street (%s) — nothing to pre-select at showdown/end",
        round => {
            // even with the box already ticked, it must not linger past the betting rounds
            expect(shouldShowPreCheckFold({ ...base, round, queued: true })).toBe(false);
        }
    );
});

describe("isBettingRound", () => {
    it("is true on preflop/flop/turn/river", () => {
        for (const r of [TexasHoldemRound.PREFLOP, TexasHoldemRound.FLOP, TexasHoldemRound.TURN, TexasHoldemRound.RIVER]) {
            expect(isBettingRound(r)).toBe(true);
        }
    });

    it("is false for ante, showdown, end and nullish rounds", () => {
        for (const r of [TexasHoldemRound.ANTE, TexasHoldemRound.SHOWDOWN, TexasHoldemRound.END, null, undefined]) {
            expect(isBettingRound(r)).toBe(false);
        }
    });
});

describe("shouldClearPreCheckFold", () => {
    it("keeps a ticked box while the player is still in the hand", () => {
        expect(shouldClearPreCheckFold({ queued: true, isUsersTurn: false, playerStatus: PlayerStatus.ACTIVE })).toBe(false);
    });

    it.each([PlayerStatus.FOLDED, PlayerStatus.SITTING_OUT, PlayerStatus.BUSTED])("clears a ticked box when the player leaves the hand (%s)", playerStatus => {
        expect(shouldClearPreCheckFold({ queued: true, isUsersTurn: false, playerStatus })).toBe(true);
    });

    it("leaves it for the hook to consume on the player's turn", () => {
        expect(shouldClearPreCheckFold({ queued: true, isUsersTurn: true, playerStatus: PlayerStatus.FOLDED })).toBe(false);
    });

    it("has nothing to clear when the box is not ticked", () => {
        expect(shouldClearPreCheckFold({ queued: false, isUsersTurn: false, playerStatus: PlayerStatus.FOLDED })).toBe(false);
    });
});

describe("preCheckFoldLabel", () => {
    it("reads Check/Fold while checking is free", () => {
        expect(preCheckFoldLabel(true)).toBe("Check/Fold");
    });

    it("reads Fold once a bet has landed", () => {
        expect(preCheckFoldLabel(false)).toBe("Fold");
    });
});

describe("resolvePreCheckFoldAction", () => {
    it("checks whenever checking is free, even though fold is also legal", () => {
        expect(resolvePreCheckFoldAction({ hasCheckAction: true, hasCallAction: false, hasFoldAction: true })).toBe("check");
    });

    it("folds when facing a bet (call and fold legal)", () => {
        expect(resolvePreCheckFoldAction({ hasCheckAction: false, hasCallAction: true, hasFoldAction: true })).toBe("fold");
    });

    it("never folds without a bet to fold to (blind-posting turn: only fold-anytime legal)", () => {
        expect(resolvePreCheckFoldAction({ hasCheckAction: false, hasCallAction: false, hasFoldAction: true })).toBeNull();
    });

    it("does nothing when facing a bet but fold is not legal", () => {
        expect(resolvePreCheckFoldAction({ hasCheckAction: false, hasCallAction: true, hasFoldAction: false })).toBeNull();
    });

    it("does nothing when no relevant action is legal", () => {
        expect(resolvePreCheckFoldAction({ hasCheckAction: false, hasCallAction: false, hasFoldAction: false })).toBeNull();
    });
});
