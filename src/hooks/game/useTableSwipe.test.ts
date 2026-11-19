import { renderHook } from "@testing-library/react";
import { useTableSwipe } from "./useTableSwipe";

type Point = { clientX: number; clientY: number };

/** jsdom has no TouchEvent constructor: build a plain event carrying the touch lists. */
function touch(type: string, points: Point[], timeStamp: number, target: EventTarget = document.body): void {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, "touches", { value: type === "touchend" ? [] : points });
    Object.defineProperty(event, "changedTouches", { value: points });
    Object.defineProperty(event, "timeStamp", { value: timeStamp });
    target.dispatchEvent(event);
}

function swipe(fromX: number, toX: number, durationMs = 200, target: EventTarget = document.body): void {
    touch("touchstart", [{ clientX: fromX, clientY: 300 }], 1000, target);
    touch("touchmove", [{ clientX: toX, clientY: 305 }], 1000 + durationMs / 2, target);
    touch("touchend", [{ clientX: toX, clientY: 305 }], 1000 + durationMs, target);
}

const setDevice = (touchFirst: boolean) => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({ matches: touchFirst, media: query }));
};

describe("useTableSwipe", () => {
    const originalMatchMedia = window.matchMedia;
    const order = ["a", "b", "c"];

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        document.body.innerHTML = "";
    });

    it("moves to the next table on a left swipe and the previous on a right swipe", () => {
        setDevice(true);
        const onSelect = jest.fn();
        renderHook(() => useTableSwipe(order, "b", onSelect));

        swipe(300, 150);
        expect(onSelect).toHaveBeenLastCalledWith("c");
        swipe(150, 300);
        expect(onSelect).toHaveBeenLastCalledWith("a");
    });

    it("does nothing on a desktop", () => {
        setDevice(false);
        const onSelect = jest.fn();
        renderHook(() => useTableSwipe(order, "b", onSelect));

        swipe(300, 150);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("does nothing with a single table", () => {
        setDevice(true);
        const onSelect = jest.fn();
        renderHook(() => useTableSwipe(["a"], "a", onSelect));

        swipe(300, 150);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("leaves a swipe that starts on the raise slider alone", () => {
        setDevice(true);
        const slider = document.createElement("input");
        slider.type = "range";
        document.body.appendChild(slider);
        const onSelect = jest.fn();
        renderHook(() => useTableSwipe(order, "b", onSelect));

        swipe(300, 150, 200, slider);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("ignores a pinch", () => {
        setDevice(true);
        const onSelect = jest.fn();
        renderHook(() => useTableSwipe(order, "b", onSelect));

        touch("touchstart", [{ clientX: 300, clientY: 300 }], 1000);
        touch("touchmove", [{ clientX: 250, clientY: 300 }, { clientX: 400, clientY: 300 }], 1100);
        touch("touchend", [{ clientX: 150, clientY: 300 }], 1200);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("follows the latest active table without re-binding", () => {
        setDevice(true);
        const onSelect = jest.fn();
        const { rerender } = renderHook(({ active }) => useTableSwipe(order, active, onSelect), { initialProps: { active: "a" } });

        rerender({ active: "c" });
        swipe(150, 300);
        expect(onSelect).toHaveBeenLastCalledWith("b");
    });

    it("stops listening once unmounted", () => {
        setDevice(true);
        const onSelect = jest.fn();
        const { unmount } = renderHook(() => useTableSwipe(order, "b", onSelect));

        unmount();
        swipe(300, 150);
        expect(onSelect).not.toHaveBeenCalled();
    });
});
