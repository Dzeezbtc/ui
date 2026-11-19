import { formatPotLabel, potLabelParts } from "./potTextUtils";

describe("formatPotLabel", () => {
    describe("cash games (isTournamentStyle = false)", () => {
        it("formats Total Pot with $ prefix", () => {
            expect(formatPotLabel("Total Pot", "1.50", false)).toBe("Total Pot: $1.50");
        });

        it("formats Main Pot with $ prefix", () => {
            expect(formatPotLabel("Main Pot", "25.00", false)).toBe("Main Pot: $25.00");
        });

        it("formats zero amount", () => {
            expect(formatPotLabel("Total Pot", "0.00", false)).toBe("Total Pot: $0.00");
        });
    });

    describe("tournaments (isTournamentStyle = true)", () => {
        it("formats Total Pot without $ prefix", () => {
            expect(formatPotLabel("Total Pot", "1,500", true)).toBe("Total Pot: 1,500");
        });

        it("formats Main Pot without $ prefix", () => {
            expect(formatPotLabel("Main Pot", "3,000", true)).toBe("Main Pot: 3,000");
        });

        it("formats zero amount", () => {
            expect(formatPotLabel("Total Pot", "0", true)).toBe("Total Pot: 0");
        });
    });
});

describe("potLabelParts", () => {
    it("splits a cash pot into its name and dollar amount", () => {
        expect(potLabelParts("Pot", "9.00", false)).toEqual({ name: "Pot", value: "$9.00" });
        expect(potLabelParts("Total Pot", "1,110.00", false)).toEqual({ name: "Total Pot", value: "$1,110.00" });
    });

    it("keeps tournament pots in chips, with no dollar sign", () => {
        expect(potLabelParts("Main Pot", "1,500", true)).toEqual({ name: "Main Pot", value: "1,500" });
    });
});
