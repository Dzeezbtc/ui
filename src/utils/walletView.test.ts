import { balanceParts, phraseWords } from "./walletView";

describe("balanceParts", () => {
    it("splits dollars and cents with thousands separators", () => {
        expect(balanceParts("1240.5")).toEqual({ whole: "$1,240", cents: ".50" });
        expect(balanceParts("0.00")).toEqual({ whole: "$0", cents: ".00" });
        expect(balanceParts("89.104")).toEqual({ whole: "$89", cents: ".10" });
    });

    it("shows $0.00 for something that isn't a number", () => {
        expect(balanceParts("")).toEqual({ whole: "$0", cents: ".00" });
        expect(balanceParts("abc")).toEqual({ whole: "$0", cents: ".00" });
    });
});

describe("phraseWords", () => {
    it("splits on any whitespace and drops blanks", () => {
        expect(phraseWords("  apple  banana\ncherry ")).toEqual(["apple", "banana", "cherry"]);
        expect(phraseWords("")).toEqual([]);
    });
});
