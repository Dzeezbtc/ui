import { potOddsPercent } from "./potOdds";

describe("potOddsPercent", () => {
    it("is the share of the final pot the call puts in", () => {
        expect(potOddsPercent(2, 7)).toBe(22);
        expect(potOddsPercent(10, 30)).toBe(25);
        expect(potOddsPercent(50, 50)).toBe(50);
    });

    it("is null when there is nothing to call or the amounts are bad", () => {
        expect(potOddsPercent(0, 30)).toBeNull();
        expect(potOddsPercent(-5, 30)).toBeNull();
        expect(potOddsPercent(5, -1)).toBeNull();
        expect(potOddsPercent(Number.NaN, 30)).toBeNull();
    });
});
