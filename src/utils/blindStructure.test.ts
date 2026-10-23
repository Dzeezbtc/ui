import { BLIND_LEVELS_AHEAD, buildBlindLadder, formatBlindCountdown, formatLevelStartsIn } from "./blindStructure";
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

describe("buildBlindLadder — full schedule for this game", () => {
    it("lists every level from the starting blinds to a dozen levels ahead", () => {
        const { rows, hasFullSchedule, multiplier, startingBlindsFormatted } = buildBlindLadder(makeInfo());

        expect(hasFullSchedule).toBe(true);
        expect(multiplier).toBe(2);
        expect(startingBlindsFormatted).toBe("50/100");
        expect(rows).toHaveLength(1 + BLIND_LEVELS_AHEAD);
        expect(rows.map(r => r.level)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
        expect(rows.slice(0, 4).map(r => r.blindsFormatted)).toEqual(["50/100", "100/200", "200/400", "400/800"]);
        expect(rows[10].blindsFormatted).toBe("51,200/102,400");
    });

    it("recovers the starting blinds mid-game and marks past / current / next", () => {
        // Live SNG, hand 25: level 6 (0-based 5) at 800/1,600, started at 25/50.
        const { rows, startingBlindsFormatted } = buildBlindLadder(
            makeInfo({ level: 5, smallBlind: 800, bigBlind: 1600, nextSmallBlind: 1600, nextBigBlind: 3200 })
        );

        expect(startingBlindsFormatted).toBe("25/50");
        expect(rows).toHaveLength(6 + BLIND_LEVELS_AHEAD);
        expect(rows.slice(0, 5).every(r => r.isPast)).toBe(true);
        expect(rows[5]).toMatchObject({ level: 6, blindsFormatted: "800/1,600", isCurrent: true, isPast: false });
        expect(rows[6]).toMatchObject({ level: 7, blindsFormatted: "1,600/3,200", isNext: true });
        expect(rows.filter(r => r.isCurrent)).toHaveLength(1);
    });

    it("times each upcoming level from the current countdown", () => {
        const { rows } = buildBlindLadder(makeInfo({ secondsRemaining: 120, levelDurationSeconds: 300 }));
        expect(rows[0].startsInSeconds).toBeUndefined(); // current
        expect(rows[1].startsInSeconds).toBe(120); // next: when this level ends
        expect(rows[4].startsInSeconds).toBe(120 + 3 * 300); // 4 levels from now
        expect(rows[10].startsInSeconds).toBe(120 + 9 * 300); // 10 levels from now
    });

    it("treats overtime as the next level starting next hand", () => {
        const { rows } = buildBlindLadder(makeInfo({ secondsRemaining: -15, levelDurationSeconds: 300 }));
        expect(rows[1].startsInSeconds).toBe(0);
        expect(rows[2].startsInSeconds).toBe(300);
    });

    it("leaves start times undefined without a level timer", () => {
        const { rows } = buildBlindLadder(makeInfo({ hasTimer: false }));
        expect(rows.every(r => r.startsInSeconds === undefined)).toBe(true);
    });

    it("follows a non-doubling multiplier", () => {
        const { rows, multiplier } = buildBlindLadder(makeInfo({ nextSmallBlind: 150, nextBigBlind: 300 }));
        expect(multiplier).toBe(3);
        expect(rows.slice(0, 3).map(r => r.blindsFormatted)).toEqual(["50/100", "150/300", "450/900"]);
    });

    it("rounds the level duration to whole minutes", () => {
        const { rows } = buildBlindLadder(makeInfo({ levelDurationSeconds: 150 }));
        expect(rows[0].minutes).toBe(3);
    });
});

describe("buildBlindLadder — falls back to what the backend states", () => {
    it("shows only the current level when there is no next big blind", () => {
        const { rows, hasFullSchedule } = buildBlindLadder(makeInfo({ nextSmallBlind: 0, nextBigBlind: 0 }));
        expect(hasFullSchedule).toBe(false);
        expect(rows).toHaveLength(1);
        expect(rows[0].isCurrent).toBe(true);
    });

    it("shows current + next when the step isn't a clean multiple", () => {
        const { rows, hasFullSchedule } = buildBlindLadder(makeInfo({ nextSmallBlind: 75, nextBigBlind: 150 }));
        expect(hasFullSchedule).toBe(false);
        expect(rows.map(r => r.blindsFormatted)).toEqual(["50/100", "75/150"]);
        expect(rows[1]).toMatchObject({ level: 2, isNext: true, startsInSeconds: 120 });
    });

    it("shows current + next without level numbers when the backend gives no level index", () => {
        const { rows, hasFullSchedule } = buildBlindLadder(makeInfo({ level: undefined }));
        expect(hasFullSchedule).toBe(false);
        expect(rows).toHaveLength(2);
        expect(rows[0].level).toBeUndefined();
        expect(rows[1].level).toBeUndefined();
    });

    it("formats large chip counts with thousands separators", () => {
        const { rows } = buildBlindLadder(makeInfo({ smallBlind: 5000, bigBlind: 10000, nextSmallBlind: 7500, nextBigBlind: 15000 }));
        expect(rows[0].blindsFormatted).toBe("5,000/10,000");
    });

    it("leaves minutes undefined when the level duration is unknown", () => {
        const { rows } = buildBlindLadder(makeInfo({ levelDurationSeconds: 0 }));
        expect(rows[0].minutes).toBeUndefined();
    });
});

describe("formatLevelStartsIn", () => {
    it("shows minutes under an hour, rounded up", () => {
        expect(formatLevelStartsIn(61)).toBe("2m");
        expect(formatLevelStartsIn(720)).toBe("12m");
        expect(formatLevelStartsIn(0)).toBe("1m");
    });

    it("shows hours and zero-padded minutes from an hour up", () => {
        expect(formatLevelStartsIn(3600)).toBe("1h 00m");
        expect(formatLevelStartsIn(3900)).toBe("1h 05m");
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
