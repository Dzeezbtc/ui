import { winnerBannerText } from "./winnerBanner";

describe("winnerBannerText", () => {
    it("returns null when there are no winners", () => {
        expect(winnerBannerText(null)).toBeNull();
        expect(winnerBannerText(undefined)).toBeNull();
        expect(winnerBannerText([])).toBeNull();
    });

    it("single showdown winner includes the hand name", () => {
        expect(
            winnerBannerText([{ seat: 3, formattedAmount: "$12.50", handName: "Full House", winType: "showdown" }])
        ).toBe("Seat 3 wins $12.50 with Full House");
    });

    it("single uncontested winner omits the hand name", () => {
        expect(winnerBannerText([{ seat: 5, formattedAmount: "$4.00", handName: "Pair", winType: "uncontested" }])).toBe(
            "Seat 5 wins $4.00"
        );
    });

    it("showdown with no hand name just shows the amount", () => {
        expect(winnerBannerText([{ seat: 1, formattedAmount: "1,240 chips", winType: "showdown" }])).toBe(
            "Seat 1 wins 1,240 chips"
        );
    });

    it("split pot lists every winner and amount", () => {
        expect(
            winnerBannerText([
                { seat: 3, formattedAmount: "$6.25" },
                { seat: 5, formattedAmount: "$6.25" }
            ])
        ).toBe("Split pot — Seat 3 $6.25 · Seat 5 $6.25");
    });
});
