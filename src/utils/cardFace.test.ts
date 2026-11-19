import { cardFace, seatGradient } from "./cardFace";

describe("cardFace", () => {
    it("reads rank and suit", () => {
        expect(cardFace("AS")).toEqual({ rank: "A", suit: "♠", red: false });
        expect(cardFace("QH")).toEqual({ rank: "Q", suit: "♥", red: true });
        expect(cardFace("QD")).toEqual({ rank: "Q", suit: "♦", red: true });
        expect(cardFace("2C")).toEqual({ rank: "2", suit: "♣", red: false });
    });

    it("draws T as 10 and ignores case", () => {
        expect(cardFace("TC")?.rank).toBe("10");
        expect(cardFace("kd")).toEqual({ rank: "K", suit: "♦", red: true });
    });

    it("returns null for hidden or bad codes", () => {
        expect(cardFace("??")).toBeNull();
        expect(cardFace("XX")).toBeNull();
        expect(cardFace("")).toBeNull();
        expect(cardFace("1S")).toBeNull();
        expect(cardFace("AZ")).toBeNull();
        expect(cardFace("10H")).toBeNull();
        expect(cardFace(undefined)).toBeNull();
        expect(cardFace(7)).toBeNull();
    });
});

describe("seatGradient", () => {
    it("gives each seat a gradient and wraps after six", () => {
        expect(seatGradient(0)).toBe("linear-gradient(135deg, #C026D3, #7C3AED)");
        expect(seatGradient(4)).toBe("linear-gradient(135deg, #34D399, #3B82F6)");
        expect(seatGradient(6)).toBe(seatGradient(0));
        expect(seatGradient(9)).toBe(seatGradient(3));
        expect(seatGradient(-1)).toBe(seatGradient(5));
    });
});
