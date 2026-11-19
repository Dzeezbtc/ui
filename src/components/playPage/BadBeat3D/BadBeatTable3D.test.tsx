/**
 * Live look switch (Bad Beat <-> Maison 52): a canvas keeps one WebGL context
 * for life and the old engine's dispose() loses it, so each look's engine must
 * draw into its own canvas — reusing the canvas left the new room blank.
 */
import React from "react";
import { render } from "@testing-library/react";
import { BadBeatTable3D } from "./BadBeatTable3D";

const made: { canvas: HTMLCanvasElement; look: string; disposed: boolean }[] = [];

jest.mock("./badBeatEngine", () => ({
    BadBeatEngine: class {
        private readonly entry: { canvas: HTMLCanvasElement; look: string; disposed: boolean };
        constructor(canvas: HTMLCanvasElement, look: { name: string }) {
            this.entry = { canvas, look: look.name, disposed: false };
            made.push(this.entry);
        }
        setFrame(): void {}
        setState(): void {}
        dispose(): void {
            this.entry.disposed = true;
        }
    }
}));
jest.mock("./looks", () => ({ lookFor: (name: string) => ({ name }) }));
jest.mock("../../../hooks/game/useBadBeatTable", () => ({ useBadBeatTable: () => ({ seats: [], pot: 0, dealerPosition: null }) }));
jest.mock("../../../utils/badBeatScene", () => ({ badBeatScene: () => ({}) }));
jest.mock("../../../config/stageGeometry", () => ({
    getStageDims: () => ({ tableWidth: 900, tableHeight: 450, originX: 0, originY: 0 }),
    getTableOffset: () => ({ tx: 0, ty: 0 })
}));

const props = { seatAngles: [0, 1, 2], tableSize: 9 as const, startIndex: 0, dealerSeat: null, zoom: 1, containerWidth: 1200, containerHeight: 700 };

describe("BadBeatTable3D look switch", () => {
    beforeEach(() => {
        made.length = 0;
    });

    it("gives each look a fresh canvas, both ways, and disposes the old engine", () => {
        const { rerender, container } = render(<BadBeatTable3D look="badbeat" {...props} />);
        rerender(<BadBeatTable3D look="maison" {...props} />);
        rerender(<BadBeatTable3D look="badbeat" {...props} />);

        expect(made.map(m => m.look)).toEqual(["badbeat", "maison", "badbeat"]);
        expect(new Set(made.map(m => m.canvas)).size).toBe(3);
        expect(made.map(m => m.disposed)).toEqual([true, true, false]);
        // the live engine draws into the canvas on the page
        expect(container.querySelectorAll("canvas")).toHaveLength(1);
        expect(container.querySelector("canvas")).toBe(made[2].canvas);
    });

    it("keeps the same canvas and engine while the look stays", () => {
        const { rerender } = render(<BadBeatTable3D look="maison" {...props} />);
        rerender(<BadBeatTable3D look="maison" {...props} zoom={1.2} />);
        expect(made).toHaveLength(1);
        expect(made[0].disposed).toBe(false);
    });
});
