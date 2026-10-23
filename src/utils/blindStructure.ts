import { formatChipCount } from "./potDisplayUtils";
import { isNullish } from "./guards";
import type { BlindLevelInfo } from "../hooks/game/useBlindLevel";

/**
 * A single row in the blind-structure ladder shown by the Blinds panel.
 *
 * The engine escalates SNG/tournament blinds geometrically from the game's own
 * settings: level N's blinds are the starting blinds x multiplier^N (the PVM's
 * SitAndGoBlindsManager doubles them), every level lasting blindLevelDuration
 * minutes. The backend sends the current level, the current blinds and the next
 * level's blinds, so the whole ladder for THIS game can be derived from them:
 * the multiplier is next / current, and the starting blinds are current /
 * multiplier^level. Nothing is assumed beyond what the game state says.
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
    /** True for a level that has already been played. */
    isPast: boolean;
    /** True for the level currently in play. */
    isCurrent: boolean;
    /** True for the upcoming level. */
    isNext: boolean;
    /**
     * Seconds from now until this level starts, for upcoming levels when the
     * level timer is known; undefined otherwise. Levels change at the first hand
     * boundary after the clock runs out, so this is the earliest start.
     */
    startsInSeconds: number | undefined;
}

export interface BlindLadder {
    rows: BlindLadderRow[];
    /**
     * Whether the whole ladder could be derived (current + next give a clean
     * whole-number multiplier). False falls back to just the current and next
     * levels.
     */
    hasFullSchedule: boolean;
    /** How much the blinds multiply each level (2 = doubling), when known. */
    multiplier: number | undefined;
    /** The game's starting (level 1) blinds, e.g. "25/50", when known. */
    startingBlindsFormatted: string | undefined;
}

/** How many levels past the current one the ladder lists. */
export const BLIND_LEVELS_AHEAD = 12;

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

/**
 * Format the time until a future level starts: "12m", "1h 05m". Rounded up to
 * the minute so a level is never shown as starting sooner than it can.
 */
export const formatLevelStartsIn = (seconds: number): string => {
    const totalMinutes = Math.max(1, Math.ceil(seconds / 60));
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

const minutesFromSeconds = (levelDurationSeconds: number): number | undefined =>
    levelDurationSeconds > 0 ? Math.round(levelDurationSeconds / 60) : undefined;

const formatBlinds = (smallBlind: number, bigBlind: number): string => `${formatChipCount(smallBlind)}/${formatChipCount(bigBlind)}`;

/**
 * The per-level multiplier implied by the current and next blinds, or undefined
 * when they don't describe a clean geometric step (unknown or flat schedule).
 */
const deriveMultiplier = (info: BlindLevelInfo): number | undefined => {
    const { smallBlind, bigBlind, nextSmallBlind, nextBigBlind } = info;
    if (smallBlind <= 0 || bigBlind <= 0 || nextSmallBlind <= 0 || nextBigBlind <= 0) return undefined;
    if (nextBigBlind % bigBlind !== 0 || nextSmallBlind % smallBlind !== 0) return undefined;
    const multiplier = nextBigBlind / bigBlind;
    if (multiplier < 2 || nextSmallBlind / smallBlind !== multiplier) return undefined;
    return multiplier;
};

/**
 * Build the blind ladder for this game from the data useBlindLevel exposes.
 *
 * With a known level and a clean multiplier, lists every level from level 1 (the
 * game's starting blinds) to `levelsAhead` levels past the current one, marking
 * past / current / next and the time until each upcoming level starts. Otherwise
 * it falls back to the current level and, when the backend gives one, the next.
 * Levels are 1-based for display.
 */
export const buildBlindLadder = (info: BlindLevelInfo, levelsAhead: number = BLIND_LEVELS_AHEAD): BlindLadder => {
    const minutes = minutesFromSeconds(info.levelDurationSeconds);
    const multiplier = deriveMultiplier(info);
    const currentLevel = info.level; // 0-based

    // Seconds until the level `stepsAhead` past the current one starts.
    const startsIn = (stepsAhead: number): number | undefined =>
        info.hasTimer ? Math.max(0, info.secondsRemaining) + (stepsAhead - 1) * info.levelDurationSeconds : undefined;

    if (!isNullish(multiplier) && !isNullish(currentLevel)) {
        const factor = multiplier ** currentLevel;
        // The engine's blinds are always starting blinds x multiplier^level, so this
        // divides exactly; if it doesn't, the schedule isn't the shape we derive.
        if (info.smallBlind % factor === 0 && info.bigBlind % factor === 0) {
            const baseSmall = info.smallBlind / factor;
            const baseBig = info.bigBlind / factor;
            const rows: BlindLadderRow[] = [];
            for (let level = 0; level <= currentLevel + levelsAhead; level++) {
                const smallBlind = baseSmall * multiplier ** level;
                const bigBlind = baseBig * multiplier ** level;
                const stepsAhead = level - currentLevel;
                rows.push({
                    level: level + 1,
                    smallBlind,
                    bigBlind,
                    blindsFormatted: formatBlinds(smallBlind, bigBlind),
                    minutes,
                    isPast: stepsAhead < 0,
                    isCurrent: stepsAhead === 0,
                    isNext: stepsAhead === 1,
                    startsInSeconds: stepsAhead > 0 ? startsIn(stepsAhead) : undefined
                });
            }
            return { rows, hasFullSchedule: true, multiplier, startingBlindsFormatted: formatBlinds(baseSmall, baseBig) };
        }
    }

    // Fallback: only what the backend states directly.
    const currentLevelDisplay = isNullish(currentLevel) ? undefined : currentLevel + 1;
    const rows: BlindLadderRow[] = [
        {
            level: currentLevelDisplay,
            smallBlind: info.smallBlind,
            bigBlind: info.bigBlind,
            blindsFormatted: formatBlinds(info.smallBlind, info.bigBlind),
            minutes,
            isPast: false,
            isCurrent: true,
            isNext: false,
            startsInSeconds: undefined
        }
    ];
    // A zero/zero next means the schedule is flat or unknown; a duplicate row would be noise.
    if (info.nextBigBlind > 0) {
        rows.push({
            level: isNullish(currentLevelDisplay) ? undefined : currentLevelDisplay + 1,
            smallBlind: info.nextSmallBlind,
            bigBlind: info.nextBigBlind,
            blindsFormatted: formatBlinds(info.nextSmallBlind, info.nextBigBlind),
            minutes,
            isPast: false,
            isCurrent: false,
            isNext: true,
            startsInSeconds: startsIn(1)
        });
    }
    return { rows, hasFullSchedule: false, multiplier, startingBlindsFormatted: undefined };
};
