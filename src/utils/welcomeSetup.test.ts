import { phraseWords, pickCheckPositions, shouldOfferWelcome, wordsMatch } from "./welcomeSetup";

describe("shouldOfferWelcome", () => {
    it("offers only to a visitor whose wallet was just made, with no club sign-in, who has not seen it", () => {
        expect(shouldOfferWelcome({ pending: true, hasCustody: false, seen: false })).toBe(true);
        expect(shouldOfferWelcome({ pending: false, hasCustody: false, seen: false })).toBe(false);
        expect(shouldOfferWelcome({ pending: true, hasCustody: true, seen: false })).toBe(false);
        expect(shouldOfferWelcome({ pending: true, hasCustody: false, seen: true })).toBe(false);
    });
});

describe("phraseWords", () => {
    it("splits on any spacing", () => {
        expect(phraseWords("  legal  winner\nthank ")).toEqual(["legal", "winner", "thank"]);
        expect(phraseWords("")).toEqual([]);
    });
});

describe("pickCheckPositions", () => {
    it("picks different positions in order", () => {
        const seq = [0.9, 0.1, 0.5];
        let i = 0;
        const pos = pickCheckPositions(24, 3, () => seq[i++]);
        expect(pos).toHaveLength(3);
        expect(new Set(pos).size).toBe(3);
        expect([...pos].sort((a, b) => a - b)).toEqual(pos);
        pos.forEach(p => expect(p).toBeGreaterThanOrEqual(0));
        pos.forEach(p => expect(p).toBeLessThan(24));
    });
    it("never asks for more words than there are", () => {
        expect(pickCheckPositions(2, 3)).toHaveLength(2);
    });
});

describe("wordsMatch", () => {
    const words = ["legal", "winner", "thank", "year"];
    it("accepts the right words, ignoring case and spaces", () => {
        expect(wordsMatch(words, [0, 3], [" Legal", "YEAR "])).toBe(true);
    });
    it("rejects a wrong or missing word, and an empty check", () => {
        expect(wordsMatch(words, [0, 3], ["legal", "thank"])).toBe(false);
        expect(wordsMatch(words, [0, 3], ["legal"])).toBe(false);
        expect(wordsMatch(words, [], [])).toBe(false);
    });
});
