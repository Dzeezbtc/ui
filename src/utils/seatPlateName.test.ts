import { seatPlateName } from "./seatPlateName";

describe("seatPlateName", () => {
    it("shortens a wallet address to its ends", () => {
        expect(seatPlateName("b521avgyh77ycn997ja45q5q8ss8y9mr424jsnxx93")).toBe("b521…xx93");
    });
    it("is undefined with no address, so the plate keeps Seat N", () => {
        expect(seatPlateName(undefined)).toBeUndefined();
        expect(seatPlateName(null)).toBeUndefined();
        expect(seatPlateName("")).toBeUndefined();
    });
});
