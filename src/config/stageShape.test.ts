import {
    FLAGSHIP_PORTRAIT_DIMS,
    FLAGSHIP_PORTRAIT_PADDING,
    getContentBounds,
    placeBetSpotsToward,
    STAGE_DIMS,
    clearLayoutCache,
    getLayoutPositions,
    getSeatPositions,
    getStageDims,
    getStageShape,
    holeCardSideFor,
    setStageShape
} from "./stageGeometry";

const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
    Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: height });
};

describe("flagship stage shape", () => {
    afterEach(() => {
        setStageShape("standard");
        clearLayoutCache();
    });

    it("reports whether the shape changed", () => {
        expect(getStageShape()).toBe("standard");
        expect(setStageShape("flagship")).toBe(true);
        expect(setStageShape("flagship")).toBe(false);
        expect(getStageShape()).toBe("flagship");
    });

    it("uses the wide oval felt on phones in portrait only", () => {
        setViewport(390, 844);
        expect(getStageDims()).toBe(STAGE_DIMS.portrait);
        setStageShape("flagship");
        expect(getStageDims()).toBe(FLAGSHIP_PORTRAIT_DIMS);
        setViewport(1920, 1080);
        expect(getStageDims()).toBe(STAGE_DIMS.landscape);
    });

    it("keeps you at the bottom centre of the oval and every seat near its rim", () => {
        setViewport(390, 844);
        setStageShape("flagship");
        const { tableWidth, tableHeight } = FLAGSHIP_PORTRAIT_DIMS;
        for (const size of [2, 4, 6, 9] as const) {
            const seats = getSeatPositions(size);
            expect(seats).toHaveLength(size);
            expect(parseFloat(seats[0].left)).toBe(tableWidth / 2);
            expect(parseFloat(seats[0].top)).toBeGreaterThan(tableHeight - 20);
            seats.forEach(s => {
                expect(parseFloat(s.left)).toBeGreaterThanOrEqual(-120);
                expect(parseFloat(s.left)).toBeLessThanOrEqual(tableWidth + 120);
            });
        }
    });

    it("leaves room either side of the flagship phone table", () => {
        setViewport(390, 844);
        const standard = getContentBounds(6);
        setStageShape("flagship");
        const flagship = getContentBounds(6);
        expect(flagship.width).toBeGreaterThan(FLAGSHIP_PORTRAIT_DIMS.tableWidth + 2 * FLAGSHIP_PORTRAIT_PADDING.x - 120);
        expect(flagship.width).not.toBe(standard.width);
    });

    it("spaces the flagship seats evenly, mirrored left to right", () => {
        setViewport(1920, 1080);
        setStageShape("flagship");
        const seats = getSeatPositions(9).map(p => [parseFloat(p.left), parseFloat(p.top)]);
        // seat k and seat 9-k mirror each other across the centre line
        for (let k = 1; k <= 4; k++) {
            expect(seats[k][0] + seats[9 - k][0]).toBeCloseTo(seats[0][0] * 2, 0);
            expect(seats[k][1]).toBeCloseTo(seats[9 - k][1], 0);
        }
    });

    it("caches layouts per shape", () => {
        setViewport(390, 844);
        const standard = getLayoutPositions(6, "mobile-portrait");
        setStageShape("flagship");
        const flagship = getLayoutPositions(6, "mobile-portrait");
        expect(flagship).not.toBe(standard);
        expect(flagship.players[1].left).not.toBe(standard.players[1].left);
    });
});

describe("holeCardSideFor", () => {
    it("pushes cards away from the felt", () => {
        expect(holeCardSideFor("10px", 620)).toBe("left");
        expect(holeCardSideFor("600px", 620)).toBe("right");
        expect(holeCardSideFor("310px", 620)).toBe("up");
        expect(holeCardSideFor("330px", 620)).toBe("up");
    });
});

describe("placeBetSpotsToward", () => {
    const seat = (left: number, top: number) => ({ left: `${left}px`, top: `${top}px` });

    it("puts each bet a third of the way from its seat to the centre", () => {
        const [spot] = placeBetSpotsToward([seat(0, 250)], 1000, 500, [], 0.34);
        expect(parseFloat(spot.left)).toBeCloseTo(170, 0);
        expect(parseFloat(spot.top ?? "")).toBeCloseTo(250, 0);
        expect(spot.side).toBe("left");
    });

    it("puts your bet beside your cards, not under them", () => {
        const [you] = placeBetSpotsToward([seat(500, 560)], 1000, 500, [], 0.38);
        expect(parseFloat(you.left)).toBe(665);
        expect(parseFloat(you.top ?? "")).toBe(490);
    });

    it("slides a bet that lands on the board up or down until it clears", () => {
        const board = [{ x: 500, y: 250, hw: 200, hy: 60 }];
        const [above, below] = placeBetSpotsToward([seat(500, -40), seat(560, 560)], 1000, 500, board, 0.34);
        expect(parseFloat(above.top ?? "")).toBeLessThanOrEqual(250 - 60 - 16);
        expect(parseFloat(below.top ?? "")).toBeGreaterThanOrEqual(250 + 60 + 16);
        expect(parseFloat(above.left)).toBe(500);
        expect(parseFloat(below.left)).toBeLessThan(560);
    });
});
