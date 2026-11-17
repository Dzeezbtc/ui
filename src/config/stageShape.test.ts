import {
    BADBEAT_PORTRAIT_LIFT,
    BADBEAT_SIDE_COLUMN,
    calculateZoom,
    getTableTransform,
    FLAGSHIP_PORTRAIT_DIMS,
    FLAGSHIP_PORTRAIT_PADDING,
    getContentBounds,
    FLAGSHIP_BET_HALF_H,
    FLAGSHIP_BET_HALF_W,
    FLAGSHIP_SEAT_BOX,
    FLAGSHIP_YOUR_BOX,
    FLAGSHIP_YOUR_BOX_PORTRAIT,
    inwardNormal,
    flagshipBoardKeepOut,
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

describe("flagship bets", () => {
    type Rect = { x0: number; x1: number; y0: number; y1: number; what: string };
    const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

    const layout = (width: number, height: number, size: 2 | 4 | 6 | 9) => {
        setViewport(width, height);
        setStageShape("flagship");
        clearLayoutCache();
        const mode = width > height ? "desktop" : "mobile-portrait";
        const { players, chips } = getLayoutPositions(size, mode);
        const { tableWidth, tableHeight } = getStageDims();
        return { players, chips, tableWidth, tableHeight };
    };

    it("puts every bet straight out in front of its player, clear of every bet, every seat and the board", () => {
        for (const [w, h] of [[1920, 1080], [390, 844]]) {
            for (const size of [2, 4, 6, 9] as const) {
                const { players, chips, tableWidth, tableHeight } = layout(w, h, size);
                const seatRects: Rect[] = players.map((p, i) => {
                    const x = parseFloat(p.left);
                    const y = parseFloat(p.top);
                    const box = i === 0 ? (w > h ? FLAGSHIP_YOUR_BOX : FLAGSHIP_YOUR_BOX_PORTRAIT) : FLAGSHIP_SEAT_BOX;
                    return { x0: x - box.halfW, x1: x + box.halfW, y0: y - box.up, y1: y + box.down, what: `seat ${i + 1}` };
                });
                const betRects: Rect[] = chips.map((c, i) => {
                    const x = parseFloat(c.left);
                    const y = parseFloat(c.top ?? "");
                    return { x0: x - FLAGSHIP_BET_HALF_W, x1: x + FLAGSHIP_BET_HALF_W, y0: y - FLAGSHIP_BET_HALF_H, y1: y + FLAGSHIP_BET_HALF_H, what: `bet ${i + 1}` };
                });
                const k = flagshipBoardKeepOut(tableWidth, tableHeight);
                const board: Rect = { x0: k.x - k.hw, x1: k.x + k.hw, y0: k.y - k.hy, y1: k.y + k.hy, what: "board" };
                const where = `${w}x${h} ${size}-max`;
                betRects.forEach((b, i) => {
                    seatRects.forEach(s => expect(`${where} ${b.what} on ${s.what}: ${overlaps(b, s)}`).toBe(`${where} ${b.what} on ${s.what}: false`));
                    betRects.forEach((o, j) => {
                        if (j > i) expect(`${where} ${b.what} on ${o.what}: ${overlaps(b, o)}`).toBe(`${where} ${b.what} on ${o.what}: false`);
                    });
                    expect(`${where} ${b.what} on board: ${overlaps(b, board)}`).toBe(`${where} ${b.what} on board: false`);
                    // in front of its own player: closer to the middle of the felt than the seat is
                    const sx = parseFloat(players[i].left) - tableWidth / 2;
                    const sy = parseFloat(players[i].top) - tableHeight / 2;
                    const bx = (b.x0 + b.x1) / 2 - tableWidth / 2;
                    const by = (b.y0 + b.y1) / 2 - tableHeight / 2;
                    expect(Math.hypot(bx, by)).toBeLessThan(Math.hypot(sx, sy));
                });
            }
        }
    });

    it("leaves a clear gap above your bigger phone cards", () => {
        const { players, chips } = layout(390, 844, 9);
        expect(parseFloat(players[0].top) - parseFloat(chips[0].top ?? "")).toBeGreaterThanOrEqual(FLAGSHIP_YOUR_BOX_PORTRAIT.up);
    });

    it("sends your bet straight up from your seat", () => {
        const { players, chips } = layout(1920, 1080, 9);
        expect(parseFloat(chips[0].left)).toBeCloseTo(parseFloat(players[0].left), 0);
        expect(parseFloat(chips[0].top ?? "")).toBeLessThan(parseFloat(players[0].top) - FLAGSHIP_YOUR_BOX.up);
    });

    it("points straight across on the sides and at the end's centre on the round ends", () => {
        expect(inwardNormal(500, 0, 1000, 500)).toEqual([0, 1]);
        expect(inwardNormal(500, 500, 1000, 500)).toEqual([0, -1]);
        const [nx, ny] = inwardNormal(0, 250, 1000, 500);
        expect(nx).toBeCloseTo(1);
        expect(ny).toBeCloseTo(0);
        expect(inwardNormal(0, 400, 500, 1000)).toEqual([1, 0]);
    });
});

describe("Bad Beat stage shape", () => {
    afterEach(() => {
        setStageShape("standard");
        clearLayoutCache();
    });

    const parse = (t: string) => {
        const m = /translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([\d.]+)\)/.exec(t);
        if (!m) throw new Error(`unexpected transform ${t}`);
        return { tx: +m[1], ty: +m[2], zoom: +m[3] };
    };

    it("lays out on the flagship's seats, phone table and bets", () => {
        setViewport(390, 844);
        setStageShape("badbeat");
        expect(getStageDims()).toBe(FLAGSHIP_PORTRAIT_DIMS);
        const badbeat = getLayoutPositions(9, "mobile-portrait");
        setStageShape("flagship");
        expect(getLayoutPositions(9, "mobile-portrait").players).toEqual(badbeat.players);
    });

    it("on a phone held sideways, grows the table and sits it left of the button column", () => {
        setViewport(844, 390);
        setStageShape("flagship");
        const flagship = parse(getTableTransform(calculateZoom(9, 844, 340), 9, 844, 340));
        setStageShape("badbeat");
        const badbeat = parse(getTableTransform(calculateZoom(9, 844, 340), 9, 844, 340));
        expect(badbeat.zoom).toBeGreaterThan(flagship.zoom);
        // the table's centre is left of the screen's centre, clear of the column
        const bounds = getContentBounds(9);
        expect(badbeat.tx + bounds.centerX * badbeat.zoom).toBeCloseTo((844 - BADBEAT_SIDE_COLUMN) / 2, 0);
    });

    it("on an upright phone, lifts the table into the gap under the top bar", () => {
        setViewport(390, 844);
        setStageShape("flagship");
        const flagship = parse(getTableTransform(calculateZoom(9, 390, 790), 9, 390, 790));
        setStageShape("badbeat");
        const badbeat = parse(getTableTransform(calculateZoom(9, 390, 790), 9, 390, 790));
        expect(badbeat.zoom).toBe(flagship.zoom);
        expect(flagship.ty - badbeat.ty).toBeCloseTo(BADBEAT_PORTRAIT_LIFT, 1);
    });
});
