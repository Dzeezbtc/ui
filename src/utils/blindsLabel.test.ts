import { blindsLabel } from "./blindsLabel";

describe("blindsLabel", () => {
    it("shows cash blinds in dollars", () => {
        expect(blindsLabel("10.00", "20.00", false)).toBe("$10.00 / $20.00");
    });

    it("shows tournament blinds as plain chips", () => {
        expect(blindsLabel("100", "200", true)).toBe("100 / 200");
    });
});
