/**
 * Swipe between open tables on phones and tablets (multi-tabling, ui#55).
 *
 * Pure helpers: whether this device swipes at all, whether a finished touch was
 * a sideways swipe, and which table sits on that side of the active one in the
 * pill order. The hook (hooks/game/useTableSwipe) wires them to touch events.
 */
import { isNullish } from "./guards";

/** Shortest sideways travel, in CSS pixels, that counts as a swipe. */
export const SWIPE_MIN_DISTANCE_PX = 60;
/** The swipe must be at least this many times wider than it is tall. */
export const SWIPE_MIN_RATIO = 1.5;
/** A slower drag is a scroll or a hold, not a swipe. */
export const SWIPE_MAX_DURATION_MS = 600;

/** Touches that start on these are left alone: sliders, fields, the pill bar, bubbles and dialogs. */
export const SWIPE_IGNORE_SELECTOR =
    "input, textarea, select, [role='slider'], [role='tablist'], [role='dialog'], [data-no-table-swipe], [data-testid^='table-bubble']";

/** -1 = swiped left (go to the next table), 1 = swiped right (go to the previous table), 0 = no swipe. */
export type SwipeDirection = -1 | 0 | 1;

/**
 * Phones and tablets only: a touch screen as the main pointer, with no hover.
 * A desktop (mouse, or a laptop with a touch screen and a trackpad) never swipes.
 * Safe under jsdom, which has no `matchMedia`: reports `false`.
 */
export function isSwipeDevice(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return false;
    }
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** Reads a finished touch as a sideways swipe, or 0 when it was a tap, scroll or slow drag. */
export function swipeDirection(dx: number, dy: number, durationMs: number): SwipeDirection {
    if (durationMs > SWIPE_MAX_DURATION_MS) return 0;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE_PX) return 0;
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_MIN_RATIO) return 0;
    return dx < 0 ? -1 : 1;
}

/**
 * The table beside the active one for a swipe: swiping left brings in the table
 * to the right of it in the pill order, swiping right the one to its left. No
 * wrap-around, so the first and last tables stop at the edge. Null when there's
 * nothing on that side or the active table isn't in the order.
 */
export function neighbourTableId(order: readonly string[], activeId: string | null, direction: SwipeDirection): string | null {
    if (direction === 0 || isNullish(activeId)) return null;
    const index = order.indexOf(activeId);
    if (index < 0) return null;
    return order[index - direction] ?? null;
}
