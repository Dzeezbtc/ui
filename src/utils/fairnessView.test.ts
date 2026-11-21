import type { CardStats } from "../pages/explorer/types";
import { cardsCounted, checkVerdict, heatColour, heatGrid, maxOffPercent, overallVerdict } from "./fairnessView";

const card = (rank: string, suit: string, n: number): CardStats => ({
    card: `${rank}${suit}`,
    rank,
    suit,
    total_appearances: n,
    expected_frequency: 0,
    actual_frequency: 0,
    deviation: 0,
    deviation_percent: 0
});

describe("fairnessView", () => {
    it("reads each check's verdict", () => {
        expect(checkVerdict({ result: "PASS" })).toBe("pass");
        expect(checkVerdict({ result: "marginal" })).toBe("marginal");
        expect(checkVerdict({ result: "FAIL" })).toBe("fail");
    });

    it("takes the worst check as the overall verdict", () => {
        expect(overallVerdict([{ result: "PASS" }, { result: "PASS" }])).toBe("pass");
        expect(overallVerdict([{ result: "PASS" }, { result: "MARGINAL" }])).toBe("marginal");
        expect(overallVerdict([{ result: "MARGINAL" }, { result: "FAIL" }])).toBe("fail");
    });

    it("lays the 52 cards out by suit, ace to two, against a fair share", () => {
        const all = ["s", "h", "d", "c"].flatMap(s => ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"].map(r => card(r, s, 10)));
        all[0] = card("A", "s", 20);
        const grid = heatGrid(all);
        expect(grid).toHaveLength(4);
        expect(grid[0]).toHaveLength(13);
        expect(grid[0][0].card).toBe("As");
        expect(grid[0][0].off).toBeGreaterThan(0.9);
        expect(grid[3][12].card).toBe("2c");
        expect(cardsCounted(all)).toBe(530);
        expect(maxOffPercent(grid)).toBe(96);
    });

    it("counts missing cards as zero", () => {
        const grid = heatGrid([card("A", "s", 52)]);
        expect(grid[1][0].count).toBe(0);
        expect(heatGrid([]).flat().every(c => c.off === 0)).toBe(true);
    });

    it("colours below blue and above magenta", () => {
        expect(heatColour(0.1, 0.1)).toBe("rgba(192, 38, 211, 0.72)");
        expect(heatColour(-0.05, 0.1)).toBe("rgba(59, 130, 246, 0.42)");
        expect(heatColour(0, 0)).toBe("rgba(192, 38, 211, 0.12)");
    });
});
