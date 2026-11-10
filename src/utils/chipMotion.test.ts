import { NonPlayerActionType, PlayerActionType } from "@block52/poker-vm-sdk";
import { antesFor, chipChange, slideStart, towardCentre, SLIDE_DISTANCE_PX } from "./chipMotion";

describe("chipChange", () => {
    it("slides chips in when a bet appears or grows", () => {
        expect(chipChange("0", "20000")).toBe("slideIn");
        expect(chipChange(undefined, "20000")).toBe("slideIn");
        expect(chipChange("20000", "60000")).toBe("slideIn");
    });

    it("sweeps the bet to the pot when it's cleared", () => {
        expect(chipChange("60000", "0")).toBe("sweep");
        expect(chipChange("60000", undefined)).toBe("sweep");
    });

    it("does nothing when the bet is unchanged or was never there", () => {
        expect(chipChange("20000", "20000")).toBeNull();
        expect(chipChange("0", "0")).toBeNull();
        expect(chipChange("not a number", "0")).toBeNull();
    });
});

describe("slideStart", () => {
    it("starts a step towards the seat on that edge", () => {
        expect(slideStart("bottom")).toEqual({ x: 0, y: SLIDE_DISTANCE_PX });
        expect(slideStart("top")).toEqual({ x: 0, y: -SLIDE_DISTANCE_PX });
        expect(slideStart("left", 10)).toEqual({ x: -10, y: 0 });
        expect(slideStart("right", 10)).toEqual({ x: 10, y: 0 });
    });
});

describe("towardCentre", () => {
    it("is the move from the chip's centre to the felt's centre", () => {
        expect(towardCentre({ left: 100, top: 300, width: 20, height: 20 }, { left: 0, top: 0, width: 600, height: 400 })).toEqual({ dx: 190, dy: -110 });
    });
});

describe("antesFor", () => {
    it("picks this seat's antes and ignores other actions and seats", () => {
        const actions = [
            { seat: 2, action: NonPlayerActionType.ANTE, amount: "1000" },
            { seat: 3, action: NonPlayerActionType.ANTE, amount: "1000" },
            { seat: 2, action: PlayerActionType.BIG_BLIND, amount: "20000" },
            { seat: 2, action: NonPlayerActionType.ANTE, amount: "0" }
        ];
        expect(antesFor(2, actions)).toEqual(["1000"]);
    });
});
