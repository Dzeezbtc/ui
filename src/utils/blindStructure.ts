import { formatChipCount } from "./potDisplayUtils";
import { isNullish } from "./guards";
import type { BlindLevelInfo } from "../hooks/game/useBlindLevel";

/**
 * A single row in the blind-structure ladder shown by the Blinds panel.
 *
 * The UI can currently only derive the CURRENT and NEXT levels from the backend
 * (via useBlindLevel) — the full schedule needs a backend change to serialise
 * the whole ladder (block52/poker-vm#1734). Until then `buildBlindLadder`
 * returns the two known levels and the panel labels the rest as pending.
 */
export interface BlindLadderRow {
    /** 1-based level number for display, or undefined when the backend has not provided a level index. */
    level: number | undefined;
    /** Small blind (chip count). */
    smallBlind: number;
    /** Big blind (chip count). */
    bigBlind: number;
    /** Formatted "SB/BB" string, e.g. "50/100". */
    blindsFormatted: string;
    /** Minutes per level, or undefined when the duration is unknown. */
    minutes: number | undefined;
    /** True for the level currently in play. */
    isCurrent: boolean;
    /** True for the upcoming level. */
    isNext: boolean;
}

export interface BlindLadder {
    rows: BlindLadderRow[];
    /**
     * Whether the full schedule is available. Always false for now — only
     * current+next come from the backend (poker-vm#1734). Kept as a flag so the
     * panel can drop the "pending" note once the backend serialises the ladder.
     */
    hasFullSchedule: boolean;
}

/**
 * Format a blind-level countdown as m:ss.
 *
 * Negative input = overtime (the hand is still running past the level end);
 * it is shown with a leading minus, e.g. -0:10. (poker-vm#2292)
 */
export const formatBlindCountdown = (secondsRemaining: number): string => {
    const isOvertime = secondsRemaining < 0;
    const abs = Math.abs(secondsRemaining);
    const minutes = Math.floor(abs / 60);
    const seconds = abs % 60;
    return `${isOvertime ? "-" : ""}${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const minutesFromSeconds = (levelDurationSeconds: number): number | undefined =>
    levelDurationSeconds > 0 ? Math.round(levelDurationSeconds / 60) : undefined;

/**
 * Build the blind ladder from the data useBlindLevel exposes.
 *
 * Returns the current level and the next level (when distinct values are
 * available). Levels are 1-based for display; when the backend has not supplied
 * a level index, `level` is left undefined and the next row's number is omitted
 * too (we cannot know "current + 1" without "current").
 */
export const buildBlindLadder = (info: BlindLevelInfo): BlindLadder => {
    const rows: BlindLadderRow[] = [];
    const minutes = minutesFromSeconds(info.levelDurationSeconds);

    // 1-based display numbers. `level` from the hook is 0-based.
    const currentLevelDisplay = isNullish(info.level) ? undefined : info.level + 1;
    const nextLevelDisplay = isNullish(currentLevelDisplay) ? undefined : currentLevelDisplay + 1;

    rows.push({
        level: currentLevelDisplay,
        smallBlind: info.smallBlind,
        bigBlind: info.bigBlind,
        blindsFormatted: `${formatChipCount(info.smallBlind)}/${formatChipCount(info.bigBlind)}`,
        minutes,
        isCurrent: true,
        isNext: false
    });

    // Only add the next row when the backend gives us a next big blind > 0; a
    // zero/zero next means the schedule is flat or unknown, and a duplicate row
    // would be noise. (NO defaults — we show only what the backend provides.)
    if (info.nextBigBlind > 0) {
        rows.push({
            level: nextLevelDisplay,
            smallBlind: info.nextSmallBlind,
            bigBlind: info.nextBigBlind,
            blindsFormatted: `${formatChipCount(info.nextSmallBlind)}/${formatChipCount(info.nextBigBlind)}`,
            minutes,
            isCurrent: false,
            isNext: true
        });
    }

    return { rows, hasFullSchedule: false };
};
