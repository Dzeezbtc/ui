import { winnerBannerText } from "./winnerBanner";

describe("winnerBannerText", () => {
    it("returns null when there are no winners", () => {
        expect(winnerBannerText(null)).toBeNull();
        expect(winnerBannerText(undefined)).toBeNull();
        expect(winnerBannerText([])).toBeNull();
    });

    it("single showdown winner spells out the winning hand", () => {
        expect(
            winnerBannerText([
                { seat: 3, formattedAmount: "12.50", description: "Full House, 8s over 7s", handName: "Full House, 8s over 7s", winType: "showdown" }
            ])
        ).toBe("Seat 3 wins the $12.50 pot with Full House, Eights over Sevens");
    });

    it("names a flush's suit from the winning cards", () => {
        expect(
            winnerBannerText([
                { seat: 2, formattedAmount: "0.40", description: "Flush, 6 high", cards: ["6D", "5D", "4D", "3D", "2D"], winType: "showdown" }
            ])
        ).toBe("Seat 2 wins the $0.40 pot with Diamond Flush, Six high");
    });

    it("falls back to the hand name when there is no description", () => {
        expect(winnerBannerText([{ seat: 1, formattedAmount: "1.00", handName: "Four 4s", winType: "showdown" }])).toBe(
            "Seat 1 wins the $1.00 pot with Quad Fours"
        );
    });

    it("single uncontested winner omits the hand", () => {
        expect(winnerBannerText([{ seat: 5, formattedAmount: "4.00", handName: "Pair of 9s", winType: "uncontested" }])).toBe(
            "Seat 5 wins the $4.00 pot"
        );
    });

    it("keeps chip amounts as chips in tournaments", () => {
        expect(winnerBannerText([{ seat: 1, formattedAmount: "1,240 chips", winType: "showdown" }])).toBe(
            "Seat 1 wins 1,240 chips"
        );
    });

    it("split pot lists every winner and amount", () => {
        expect(
            winnerBannerText([
                { seat: 3, formattedAmount: "6.25" },
                { seat: 5, formattedAmount: "6.25" }
            ])
        ).toBe("Split pot — Seat 3 $6.25 · Seat 5 $6.25");
    });
});
