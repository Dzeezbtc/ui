import { isSwipeDevice, neighbourTableId, swipeDirection, SWIPE_MAX_DURATION_MS, SWIPE_MIN_DISTANCE_PX } from "./tableSwipe";

describe("swipeDirection", () => {
    it("reads a quick sideways swipe left and right", () => {
        expect(swipeDirection(-120, 10, 200)).toBe(-1);
        expect(swipeDirection(120, -10, 200)).toBe(1);
    });

    it("ignores a short move or a tap", () => {
        expect(swipeDirection(SWIPE_MIN_DISTANCE_PX - 1, 0, 100)).toBe(0);
        expect(swipeDirection(0, 0, 50)).toBe(0);
    });

    it("counts a swipe of exactly the minimum distance", () => {
        expect(swipeDirection(-SWIPE_MIN_DISTANCE_PX, 0, 100)).toBe(-1);
    });

    it("ignores a mostly vertical move (a scroll)", () => {
        expect(swipeDirection(80, 70, 200)).toBe(0);
        expect(swipeDirection(-90, 200, 200)).toBe(0);
    });

    it("ignores a slow drag", () => {
        expect(swipeDirection(-200, 0, SWIPE_MAX_DURATION_MS + 1)).toBe(0);
        expect(swipeDirection(-200, 0, SWIPE_MAX_DURATION_MS)).toBe(-1);
    });
});

describe("neighbourTableId", () => {
    const order = ["a", "b", "c"];

    it("swiping left brings in the next table, swiping right the previous one", () => {
        expect(neighbourTableId(order, "b", -1)).toBe("c");
        expect(neighbourTableId(order, "b", 1)).toBe("a");
    });

    it("wraps around: past the last table comes the first, before the first the last", () => {
        expect(neighbourTableId(order, "c", -1)).toBe("a");
        expect(neighbourTableId(order, "a", 1)).toBe("c");
    });

    it("cycles through four tables with left swipes and back to table one", () => {
        const four = ["t1", "t2", "t3", "t4"];
        const seen: string[] = [];
        let active = "t1";
        for (let i = 0; i < 4; i++) {
            active = neighbourTableId(four, active, -1)!;
            seen.push(active);
        }
        expect(seen).toEqual(["t2", "t3", "t4", "t1"]);
    });

    it("does nothing with only one table", () => {
        expect(neighbourTableId(["a"], "a", -1)).toBeNull();
    });

    it("does nothing without a swipe, an active table, or when the active table isn't a pill", () => {
        expect(neighbourTableId(order, "b", 0)).toBeNull();
        expect(neighbourTableId(order, null, -1)).toBeNull();
        expect(neighbourTableId(order, "floating", -1)).toBeNull();
    });
});

describe("isSwipeDevice", () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    const fakeMatchMedia = (matches: boolean) =>
        jest.fn().mockImplementation((query: string) => ({ matches, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() }));

    it("is false when matchMedia is unavailable (jsdom)", () => {
        Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: undefined });
        expect(isSwipeDevice()).toBe(false);
    });

    it("is true on a touch-first device and asks for no hover plus a coarse pointer", () => {
        window.matchMedia = fakeMatchMedia(true);
        expect(isSwipeDevice()).toBe(true);
        expect(window.matchMedia).toHaveBeenCalledWith("(hover: none) and (pointer: coarse)");
    });

    it("is false on a desktop", () => {
        window.matchMedia = fakeMatchMedia(false);
        expect(isSwipeDevice()).toBe(false);
    });
});
