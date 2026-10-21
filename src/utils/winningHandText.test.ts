import { describeWinningHand, flushSuit } from "./winningHandText";

describe("describeWinningHand (ui#848)", () => {
    it.each([
        ["Four 4s", undefined, "Quad Fours"],
        ["Full House, 8s over 7s", undefined, "Full House, Eights over Sevens"],
        ["Two Pair, As and Ks", undefined, "Two Pair, Aces and Kings"],
        ["Flush, 6 high", ["6D", "5D", "4D", "3D", "2D"], "Diamond Flush, Six high"],
        ["Straight Flush, 9 high", ["9H", "8H", "7H", "6H", "5H"], "Heart Straight Flush, Nine high"],
        ["Royal Flush", ["AS", "KS", "QS", "JS", "TS"], "Royal Flush in Spades"],
        ["Straight, 10 high", undefined, "Straight, Ten high"],
        ["Three Ks", undefined, "Trip Kings"],
        ["Pair of 6s", undefined, "Pair of Sixes"],
        ["Pair of Qs", undefined, "Pair of Queens"],
        ["A high", undefined, "Ace high"]
    ])("%s → %s", (description, cards, expected) => {
        expect(describeWinningHand(description, cards)).toBe(expected);
    });

    it("leaves a flush unsuited when the cards are missing", () => {
        expect(describeWinningHand("Flush, J high")).toBe("Flush, Jack high");
    });

    it("passes through text it doesn't recognise", () => {
        expect(describeWinningHand("Something new")).toBe("Something new");
    });
});

describe("flushSuit", () => {
    it("names the suit when every card shares it", () => {
        expect(flushSuit(["AC", "9C", "7C", "4C", "2C"])).toBe("Club");
    });

    it("is null for mixed suits or no cards", () => {
        expect(flushSuit(["AC", "9D"])).toBeNull();
        expect(flushSuit([])).toBeNull();
        expect(flushSuit(undefined)).toBeNull();
    });
});
