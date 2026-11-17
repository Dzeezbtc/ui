import { BB_TABLE, betLabelPoint, pileSpots, badBeatScene, boardZ, chipPiles, inFrontOf, fitBadBeatCamera, projectPoint, ringPoint, seatAngle, BB_RINGS, type Vec3 } from "./badBeatScene";

// The flagship ring's seat angles for n evenly spaced seats, you at the bottom.
const ring = (n: number) => Array.from({ length: n }, (_, i) => Math.PI / 2 + (i * 2 * Math.PI) / n);

/** True when a point lies on the felt (the FW × FH stadium). */
const onFelt = ([x, , z]: Vec3, portrait: boolean) => {
    const u = portrait ? z : x;
    const v = portrait ? x : z;
    const r = BB_TABLE.FH / 2;
    const flat = BB_TABLE.FW / 2 - r;
    return Math.hypot(Math.max(0, Math.abs(u) - flat), v) <= r + 1e-9;
};

describe("seatAngle", () => {
    it("reads a seat's direction off the flat stage, you at the bottom", () => {
        expect(seatAngle(500, 500, 1000, 500)).toBeCloseTo(Math.PI / 2);
        expect(seatAngle(1000, 250, 1000, 500)).toBeCloseTo(0);
        expect(seatAngle(500, 0, 1000, 500)).toBeCloseTo(-Math.PI / 2);
    });
});

describe("ringPoint", () => {
    it("runs the long side across the screen, or down it upright", () => {
        expect(ringPoint(0, BB_RINGS.plate, false)[0]).toBeCloseTo(BB_RINGS.plate.rx);
        expect(ringPoint(0, BB_RINGS.plate, true)[0]).toBeCloseTo(BB_RINGS.plate.rz);
        expect(ringPoint(Math.PI / 2, BB_RINGS.plate, true)[2]).toBeCloseTo(BB_RINGS.plate.rx);
    });
});

describe("inFrontOf", () => {
    it("stands in from the felt's edge nearest the plate, on the flat sides and the round ends", () => {
        expect(inFrontOf([0, 0.5, 3.05], 0.5, 0, false)[2]).toBeCloseTo(BB_TABLE.FH / 2 - 0.5);
        expect(inFrontOf([5.55, 0.5, 0], 0.5, 0, false)[0]).toBeCloseTo(BB_TABLE.FW / 2 - 0.5);
        expect(inFrontOf([0, 0.5, 5.55], 0.5, 0, true)[2]).toBeCloseTo(BB_TABLE.FW / 2 - 0.5);
        for (let a = 0; a < 2 * Math.PI; a += 0.1) expect(onFelt(inFrontOf(ringPoint(a, BB_RINGS.plate, false), 0.3, 0, false), false)).toBe(true);
    });

    it("keeps a seat's things on the line from its plate to the felt's spine", () => {
        const plate = ringPoint((140 * Math.PI) / 180, BB_RINGS.plate, false);
        const cards = inFrontOf(plate, 0.55, 0, false);
        const bet = inFrontOf(plate, 1.25, 0, false);
        const cross = (cards[0] - plate[0]) * (bet[2] - plate[2]) - (cards[2] - plate[2]) * (bet[0] - plate[0]);
        expect(cross).toBeCloseTo(0);
    });

    it("moves along the rail without leaving it", () => {
        const p = inFrontOf([0, 0.5, 3.05], 0.5, 0, false, 0.6);
        expect(Math.abs(p[0])).toBeCloseTo(0.6);
        expect(p[2]).toBeCloseTo(BB_TABLE.FH / 2 - 0.5);
    });
});

describe("projectPoint", () => {
    it("puts the point looked at in the frame's middle, nearer things lower", () => {
        const cam = fitBadBeatCamera(ring(6), false, 1000, 500);
        const [x, y] = projectPoint(cam, cam.look, 1000, 500);
        expect(x).toBeCloseTo(500);
        expect(y).toBeCloseTo(250);
        expect(projectPoint(cam, [0, 0, 2], 1000, 500)[1]).toBeGreaterThan(projectPoint(cam, [0, 0, -2], 1000, 500)[1]);
    });
});

describe("badBeatScene", () => {
    it("keeps every plate inside the frame", () => {
        for (const [w, h] of [
            [1000, 500],
            [654, 960]
        ]) {
            for (const n of [2, 4, 6, 9]) {
                const { screen } = badBeatScene(ring(n), w, h);
                screen.plates.forEach(([x, y]) => {
                    expect(x).toBeGreaterThan(0);
                    expect(x).toBeLessThan(w);
                    expect(y).toBeGreaterThan(0);
                    expect(y).toBeLessThan(h);
                });
            }
        }
    });

    it("lays every seat's cards, bet and dealer disc on the felt, none touching another's", () => {
        const problems: string[] = [];
        for (const [w, h] of [
            [1000, 500],
            [654, 960]
        ]) {
            for (const n of [2, 4, 6, 9]) {
                const { world, portrait } = badBeatScene(ring(n), w, h);
                // cards: two side by side (0.75 × 0.6), bets and the disc: round
                const things = [
                    ...world.holes.map((p, i) => ({ p, r: 0.42, what: `cards ${i}` })),
                        // the biggest bet: four piles in a row across the seat's line
                    ...world.bets.flatMap((p, i) =>
                        pileSpots(4, p, world.plates[i]).map(([dx, dz]) => ({ p: [p[0] + dx, p[1], p[2] + dz] as Vec3, r: 0.14, what: `bet ${i}` }))
                    ),
                    ...world.dealers.map((p, i) => ({ p, r: 0.2, what: `dealer ${i}` }))
                ];
                things.forEach(t => {
                    if (!onFelt(t.p, portrait)) problems.push(`${w}x${h} ${n}: ${t.what} off the felt`);
                });
                things.forEach((a, i) =>
                    things.forEach((b, j) => {
                        if (j <= i || a.what.split(" ")[1] === b.what.split(" ")[1]) return;
                        if (Math.hypot(a.p[0] - b.p[0], a.p[2] - b.p[2]) < a.r + b.r) problems.push(`${w}x${h} ${n}: ${a.what} on ${b.what}`);
                    })
                );
            }
        }
        expect(problems).toEqual([]);
    });

    it("upright, lays the board between the side seats' cards", () => {
        const { world } = badBeatScene(ring(9), 654, 960);
        const z = boardZ(world.holes, true);
        world.holes.filter(h => Math.abs(h[0]) > 0.3).forEach(h => expect(Math.abs(h[2] - z)).toBeGreaterThan(0.5));
        expect(boardZ(world.holes, false)).toBeCloseTo(0.05);
    });
});

describe("chipPiles", () => {
    it("breaks a bet into the concept's colours, biggest first", () => {
        expect(chipPiles(2)).toEqual([{ color: 0xeef1f5, count: 2 }]);
        expect(chipPiles(131)).toEqual([
            { color: 0x2ee59d, count: 1 },
            { color: 0x9fd8ff, count: 1 },
            { color: 0xff2d55, count: 1 },
            { color: 0xeef1f5, count: 1 }
        ]);
    });

    it("caps a pile at 8 chips and shows a sliver of a bet as one chip", () => {
        expect(chipPiles(4000)[0].count).toBe(8);
        expect(chipPiles(0.4)).toEqual([{ color: 0xeef1f5, count: 1 }]);
        expect(chipPiles(0)).toEqual([]);
    });
});

describe("pileSpots", () => {
    it("stands a bet's piles apart, lined up with its seat", () => {
        for (let n = 1; n <= 4; n++) {
            const spots = pileSpots(n, [0, 0, -1], [0, 0, -3]);
            expect(spots).toHaveLength(n);
            spots.forEach((a, i) => spots.forEach((b, j) => j > i && expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeGreaterThanOrEqual(0.29)));
            // never more than a chip and a half towards the middle
            spots.forEach(([, z]) => expect(z).toBeLessThanOrEqual(0.15 + 1e-9));
        }
    });
});

describe("betLabelPoint", () => {
    it("puts the amount by the chips on the side facing the middle", () => {
        // far side: below; near side: above; an end: beside, towards the board
        expect(betLabelPoint([1, 0.2, -1], [1, 0.5, -3], false)[2]).toBeGreaterThan(-1);
        expect(betLabelPoint([1, 0.2, 1], [1, 0.5, 3], false)[2]).toBeLessThan(1);
        const end = betLabelPoint([3.4, 0.2, 0.3], [5.5, 0.5, 0.8], false);
        expect(end[0]).toBeLessThan(3.4);
        expect(end[2]).toBe(0.3);
        // upright, never beside: the felt is too narrow
        expect(betLabelPoint([0.9, 0.2, 0.3], [3, 0.5, 0.4], true)[0]).toBe(0.9);
    });
});
