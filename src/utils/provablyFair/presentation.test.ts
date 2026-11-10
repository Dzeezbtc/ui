import { CHECK_STATUS_LABEL, CHECK_STATUS_TONE, OVERALL_TONE, dealtHandLabel, explorerBlockPath, explorerTxPath, popoverPosition, previousHand } from "./presentation";

describe("presentation", () => {
    it("labels a dealt hand by seat, or by position when seats are unknown", () => {
        expect(dealtHandLabel({ seat: 3, address: "b521abcdefghijklmnop1234", cards: [], shown: true }, 0)).toBe("Seat 3 · b521ab...1234");
        expect(dealtHandLabel({ seat: 4, address: "", cards: [], shown: false }, 1)).toBe("Seat 4");
        expect(dealtHandLabel({ seat: null, address: "", cards: [], shown: false }, 1)).toBe("Player 2");
    });

    it("maps every status to a tone and a label", () => {
        expect(CHECK_STATUS_TONE.pass).toBe("good");
        expect(CHECK_STATUS_TONE.limited).toBe("warn");
        expect(CHECK_STATUS_TONE.fail).toBe("bad");
        expect(CHECK_STATUS_LABEL.na).toBe("Nothing to compare");
        expect(OVERALL_TONE.verified).toBe("good");
        expect(OVERALL_TONE.unavailable).toBe("neutral");
    });

    it("builds explorer paths", () => {
        expect(explorerTxPath("AB")).toBe("/explorer/tx/AB");
        expect(explorerBlockPath(12)).toBe("/explorer/block/12");
    });

    it("previousHand", () => {
        expect(previousHand(5)).toBe(4);
        expect(previousHand(1)).toBeNull();
        expect(previousHand(0)).toBeNull();
    });
});

describe("popoverPosition", () => {
    it("opens under the anchor and stays inside the viewport", () => {
        expect(popoverPosition({ left: 100, bottom: 40 }, 360, 1280)).toEqual({ top: 48, left: 100 });
        expect(popoverPosition({ left: 1100, bottom: 40 }, 360, 1280)).toEqual({ top: 48, left: 908 });
        expect(popoverPosition({ left: -5, bottom: 40 }, 360, 375)).toEqual({ top: 48, left: 12 });
    });
});
