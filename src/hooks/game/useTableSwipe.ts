import { useEffect, useRef } from "react";
import { isSwipeDevice, neighbourTableId, swipeDirection, SWIPE_IGNORE_SELECTOR } from "../../utils/tableSwipe";
import { isNullish } from "../../utils/guards";

interface TouchStart {
    x: number;
    y: number;
    at: number;
}

/**
 * Swipe left or right anywhere on the table to move to the open table on that
 * side (multi-tabling, ui#55). Phones and tablets only: on a desktop, or with
 * fewer than two tables, it does nothing.
 *
 * Touches that start on a slider, a field, the pill bar, a bubble or a dialog
 * are left alone, and so is any touch that turns into a pinch.
 *
 * @param order  open table ids in pill order
 * @param activeId  the table showing now
 * @param onSelect  switches to a table
 */
export function useTableSwipe(order: readonly string[], activeId: string | null, onSelect: (id: string) => void): void {
    // Read the latest values from the listeners without re-binding them on every render.
    const latest = useRef({ order, activeId, onSelect });
    latest.current = { order, activeId, onSelect };

    const enabled = order.length > 1;

    useEffect(() => {
        if (!enabled || !isSwipeDevice()) return;

        let start: TouchStart | null = null;

        const onTouchStart = (e: TouchEvent) => {
            const target = e.target instanceof Element ? e.target : null;
            if (e.touches.length !== 1 || target?.closest(SWIPE_IGNORE_SELECTOR)) {
                start = null;
                return;
            }
            const touch = e.touches[0];
            start = { x: touch.clientX, y: touch.clientY, at: e.timeStamp };
        };
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 1) start = null;
        };
        const onTouchEnd = (e: TouchEvent) => {
            const begun = start;
            start = null;
            const touch = e.changedTouches[0];
            if (isNullish(begun) || isNullish(touch)) return;
            const direction = swipeDirection(touch.clientX - begun.x, touch.clientY - begun.y, e.timeStamp - begun.at);
            const { order: ids, activeId: current, onSelect: select } = latest.current;
            const next = neighbourTableId(ids, current, direction);
            if (next) select(next);
        };
        const onTouchCancel = () => {
            start = null;
        };

        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        window.addEventListener("touchcancel", onTouchCancel, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchCancel);
        };
    }, [enabled]);
}
