import { blindsLabel, cashBlind } from "./blindsLabel";

describe("blindsLabel", () => {
    it("shows whole-dollar cash blinds without cents", () => {
        expect(blindsLabel("10.00", "20.00", false)).toBe("$10 / $20");
        expect(blindsLabel("1.00", "2.00", false)).toBe("$1 / $2");
        expect(blindsLabel("1,000.00", "2,000.00", false)).toBe("$1,000 / $2,000");
    });

    it("keeps cents under a dollar", () => {
        expect(blindsLabel("0.25", "0.50", false)).toBe("$0.25 / $0.50");
        expect(blindsLabel("0.50", "1.00", false)).toBe("$0.50 / $1");
        expect(blindsLabel("0.01", "0.02", false)).toBe("$0.01 / $0.02");
    });

    it("keeps real cents above a dollar", () => {
        expect(cashBlind("2.50")).toBe("$2.50");
    });

    it("shows tournament blinds as plain chips", () => {
        expect(blindsLabel("100", "200", true)).toBe("100 / 200");
    });
});
