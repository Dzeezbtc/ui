import { buildBlindLadder, formatBlindCountdown } from "./blindStructure";
import type { BlindLevelInfo } from "../hooks/game/useBlindLevel";

const makeInfo = (overrides: Partial<BlindLevelInfo> = {}): BlindLevelInfo => ({
    level: 0,
    smallBlind: 50,
    bigBlind: 100,
    nextSmallBlind: 100,
    nextBigBlind: 200,
    currentBlindsFormatted: "50/100",
    nextBlindsFormatted: "100/200",
    secondsRemaining: 120,
    levelDurationSeconds: 300,
    isActive: true,
    hasTimer: true,
    ...overrides
});

describe("buildBlindLadder", () => {
    it("returns current and next levels with 1-based display numbers", () => {
        const { rows, hasFullSchedule } = buildBlindLadder(makeInfo());

        expect(hasFullSchedule).toBe(false);
        expect(rows).toHaveLength(2);

        expect(rows[0]).toMatchObject({
            level: 1,
            smallBlind: 50,
            bigBlind: 100,
            blindsFormatted: "50/100",
            minutes: 5,
            isCurrent: true,
            isNext: false
        });

        expect(rows[1]).toMatchObject({
            level: 2,
            smallBlind: 100,
            bigBlind: 200,
            blindsFormatted: "100/200",
            minutes: 5,
            isCurrent: false,
            isNext: true
        });
    });

    it("formats large chip counts with thousands separators", () => {
        const { rows } = buildBlindLadder(makeInfo({ smallBlind: 5000, bigBlind: 10000 }));
        expect(rows[0].blindsFormatted).toBe("5,000/10,000");
    });

    it("omits the next row when there is no next big blind", () => {
        const { rows } = buildBlindLadder(makeInfo({ nextSmallBlind: 0, nextBigBlind: 0 }));
        expect(rows).toHaveLength(1);
        expect(rows[0].isCurrent).toBe(true);
    });

    it("leaves level numbers undefined when the backend provides no level index", () => {
        const { rows } = buildBlindLadder(makeInfo({ level: undefined }));
        expect(rows[0].level).toBeUndefined();
        expect(rows[1].level).toBeUndefined();
    });

    it("leaves minutes undefined when the level duration is unknown", () => {
        const { rows } = buildBlindLadder(makeInfo({ levelDurationSeconds: 0 }));
        expect(rows[0].minutes).toBeUndefined();
    });

    it("rounds the level duration to whole minutes", () => {
        const { rows } = buildBlindLadder(makeInfo({ levelDurationSeconds: 150 }));
        expect(rows[0].minutes).toBe(3);
    });
});

describe("formatBlindCountdown", () => {
    it("formats seconds as m:ss with a zero-padded seconds field", () => {
        expect(formatBlindCountdown(125)).toBe("2:05");
        expect(formatBlindCountdown(60)).toBe("1:00");
        expect(formatBlindCountdown(9)).toBe("0:09");
    });

    it("shows overtime with a leading minus", () => {
        expect(formatBlindCountdown(-10)).toBe("-0:10");
    });
});
