import { winAmountFloatText } from "./winAmountFloat";

describe("winAmountFloatText (ui#861)", () => {
    it("shows cash wins in dollars", () => {
        expect(winAmountFloatText("0.04")).toBe("+$0.04");
        expect(winAmountFloatText("1,250.00")).toBe("+$1,250.00");
    });

    it("keeps chip wins as chips", () => {
        expect(winAmountFloatText("1,240 chips")).toBe("+1,240 chips");
    });

    it("is null when there is no amount", () => {
        expect(winAmountFloatText(null)).toBeNull();
        expect(winAmountFloatText(undefined)).toBeNull();
        expect(winAmountFloatText("")).toBeNull();
    });
});
