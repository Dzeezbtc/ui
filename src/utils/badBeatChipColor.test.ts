import { badBeatChipColor, flatChipFaceLabel, flatChipStack, isPaleChip } from "./badBeatChipColor";

describe("badBeatChipColor", () => {
    it("runs white, crimson, ice blue, green, amber up the values", () => {
        expect(badBeatChipColor(0.25).color).toBe("#eef1f5");
        expect(badBeatChipColor(1).color).toBe("#eef1f5");
        expect(badBeatChipColor(5).color).toBe("#ff2d55");
        expect(badBeatChipColor(25).color).toBe("#9fd8ff");
        expect(badBeatChipColor(100).color).toBe("#2ee59d");
        expect(badBeatChipColor(5000).color).toBe("#f5c542");
    });
});

describe("badBeatChipColor slash", () => {
    it("is white on crimson and graphite on the pale chips", () => {
        expect(badBeatChipColor(5).slash).toBe("#ffffff");
        expect(badBeatChipColor(1).slash).toBe("#15181d");
    });
});

describe("flatChipStack", () => {
    it("piles the values into one stack, each stepped across, at most four of a value", () => {
        const s = flatChipStack(
            [
                { value: 100, visibleCount: 1 },
                { value: 5, visibleCount: 6 }
            ],
            30,
            4,
            3
        );
        expect(s.chips.map(c => c.value)).toEqual([100, 5, 5, 5, 5]);
        expect(s.chips.map(c => c.bottom)).toEqual([0, 4, 8, 12, 16]);
        expect(s.chips.map(c => c.left)).toEqual([0, 3, 3, 3, 3]);
        expect(s.width).toBe(33);
        expect(s.height).toBe(46);
    });
});

describe("badBeatChipColor for Maison 52", () => {
    it("runs ivory, navy, green, bordeaux, black up the values, gold marks on the dark chips", () => {
        expect(badBeatChipColor(1, "maison")).toEqual({ color: "#f4eee2", slash: "#6b4f2a" });
        expect(badBeatChipColor(5, "maison").color).toBe("#22427a");
        expect(badBeatChipColor(25, "maison").color).toBe("#0f3b2e");
        expect(badBeatChipColor(100, "maison").color).toBe("#6e1f2b");
        expect(badBeatChipColor(500, "maison")).toEqual({ color: "#1d1a16", slash: "#cdb07f" });
    });
});

describe("badBeatChipColor for Chip and a Chair", () => {
    it("runs white, red, blue, lavender, yellow up the values", () => {
        expect(badBeatChipColor(1, "chipchair").color).toBe("#ffffff");
        expect(badBeatChipColor(5, "chipchair").color).toBe("#ff4d3d");
        expect(badBeatChipColor(25, "chipchair").color).toBe("#3d7bff");
        expect(badBeatChipColor(100, "chipchair").color).toBe("#b9a2ff");
        expect(badBeatChipColor(500, "chipchair").color).toBe("#ffd23f");
    });

    it("has its own pink 1K, green 5K and sky cents, with ink blocks on the white chip only", () => {
        expect(badBeatChipColor(1000, "chipchair").color).toBe("#ff6fb5");
        expect(badBeatChipColor(25000, "chipchair").color).toBe("#22c55e");
        expect(badBeatChipColor(0.25, "chipchair").color).toBe("#7fd4ff");
        expect(badBeatChipColor(1, "chipchair").slash).toBe("#0e0e10");
        expect(badBeatChipColor(5, "chipchair").slash).toBe("#ffffff");
    });
});

describe("Maison 52's salon plaques", () => {
    it("tops out at a champagne gold 1K with an espresso mark", () => {
        expect(badBeatChipColor(1000, "maison")).toEqual({ color: "#d9bf8c", slash: "#4a3418" });
        expect(badBeatChipColor(999, "maison").color).toBe("#1d1a16");
    });
});

describe("flatChipFaceLabel", () => {
    it("says the value without a currency sign", () => {
        expect(flatChipFaceLabel(5)).toBe("5");
        expect(flatChipFaceLabel(25)).toBe("25");
        expect(flatChipFaceLabel(1000)).toBe("1K");
        expect(flatChipFaceLabel(2500)).toBe("2.5K");
        expect(flatChipFaceLabel(0.25)).toBe("25¢");
        expect(flatChipFaceLabel(2.5)).toBe("2.5");
    });
});

describe("isPaleChip", () => {
    it("tells the ivory, champagne and white chips from the dark ones", () => {
        expect(isPaleChip("#f4eee2")).toBe(true);
        expect(isPaleChip("#d9bf8c")).toBe(true);
        expect(isPaleChip("#ffffff")).toBe(true);
        expect(isPaleChip("#1d1a16")).toBe(false);
        expect(isPaleChip("#22427a")).toBe(false);
    });
});
