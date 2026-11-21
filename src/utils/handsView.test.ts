import type { PlayerHand } from "../types/players";
import { biggestWin, filterHands, handsCounts, replayUrlFor, winShare } from "./handsView";

const hand = (n: number, status: string, won: number): PlayerHand => ({
    game_id: "0xabc",
    hand_number: n,
    seat: 1,
    status,
    won_amount: won,
    block_height: 100 + n,
    community_cards: [],
    winner_count: won > 0 ? 1 : 0
});

const hands = [hand(1, "active", 2500000), hand(2, "folded", 0), hand(3, "active", 0), hand(4, "showing", 9000000), hand(5, "busted", 0)];

describe("handsView", () => {
    it("counts hands per chip", () => {
        expect(handsCounts(hands)).toEqual({ all: 5, won: 2, lost: 2, folded: 1 });
        expect(handsCounts([])).toEqual({ all: 0, won: 0, lost: 0, folded: 0 });
    });

    it("filters by chip", () => {
        expect(filterHands(hands, "all")).toHaveLength(5);
        expect(filterHands(hands, "won").map(h => h.hand_number)).toEqual([1, 4]);
        expect(filterHands(hands, "folded").map(h => h.hand_number)).toEqual([2]);
        expect(filterHands(hands, "lost").map(h => h.hand_number)).toEqual([3, 5]);
    });

    it("finds the biggest win, or none", () => {
        expect(biggestWin(hands)?.hand_number).toBe(4);
        expect(biggestWin([hand(1, "folded", 0)])).toBeUndefined();
        expect(biggestWin(hands, h => h.hand_number !== 4)?.hand_number).toBe(1);
    });

    it("gives the share of hands won", () => {
        expect(winShare(hands)).toBe(40);
        expect(winShare([])).toBe(0);
    });

    it("links a hand to its replay", () => {
        expect(replayUrlFor({ game_id: "0xabc", hand_number: 7 })).toBe("/table/0xabc?hand=7");
    });
});
