import React from "react";
import { act, render } from "@testing-library/react";
import { NonPlayerActionType } from "@block52/poker-vm-sdk";
import PlayerChipDisplay from "./PlayerChipDisplay";

// Live fake game data: the seat re-renders when it changes, as with the real context.
let mockAmount = "0";
let mockActed: { type: "playerActed"; action: { seat: number; action: string; amount: string } }[] = [];
const mockListeners = new Set<() => void>();
const mockSubscribe = (listener: () => void) => {
    mockListeners.add(listener);
    return () => mockListeners.delete(listener);
};
jest.mock("../../../../hooks/player/usePlayerChipData", () => ({
    usePlayerChipData: () => ({ chipAmount: jest.requireActual("react").useSyncExternalStore(mockSubscribe, () => mockAmount), chipActions: [] })
}));
jest.mock("../../../../hooks/game/useGameEvents", () => ({ useGameEvents: () => jest.requireActual("react").useSyncExternalStore(mockSubscribe, () => mockActed) }));
const update = (change: () => void) =>
    act(() => {
        change();
        mockListeners.forEach(listener => listener());
    });
jest.mock("../../common/Chip", () => ({ __esModule: true, default: ({ amount }: { amount: string }) => <span data-testid="chip">{amount}</span> }));
jest.mock("./DealerButtonDisplay", () => ({ __esModule: true, default: () => null }));

const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) });

const seat = () => <PlayerChipDisplay seatIndex={2} left="100px" bottom="0px" top="300px" side="bottom" isTournament={false} />;

describe("PlayerChipDisplay chip motion", () => {
    beforeEach(() => {
        mockAmount = "0";
        mockActed = [];
        // A visible felt 600x400 with the chips near the bottom left.
        jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
            return (this.classList.contains("chip-flight-measure") || this.classList.contains("chip-to-pot") ? rect(100, 300, 20, 20) : rect(0, 0, 600, 400)) as DOMRect;
        });
    });
    afterEach(() => jest.restoreAllMocks());

    const wrap = (ui: React.ReactElement) => render(<div className="felt">{ui}</div>);

    it("slides chips out from the player when a bet appears or grows", () => {
        const view = wrap(seat());
        expect(view.container.querySelector(".chip-slide-in")).toBeNull();
        update(() => (mockAmount = "20000"));
        const sliding = view.container.querySelector(".chip-slide-in") as HTMLElement;
        expect(sliding).not.toBeNull();
        expect(sliding.style.getPropertyValue("--chip-from-y")).toBe("28px");
    });

    it("flies the bet into the pot when the round's bets are cleared", () => {
        mockAmount = "60000";
        const view = wrap(seat());
        update(() => (mockAmount = "0"));
        const flying = view.container.querySelector(".chip-to-pot") as HTMLElement;
        expect(flying).not.toBeNull();
        expect(flying.textContent).toBe("60000");
        // From the chips' centre (110, 310) to the felt's (300, 200).
        expect(flying.style.getPropertyValue("--chip-dx")).toBe("190px");
        expect(flying.style.getPropertyValue("--chip-dy")).toBe("-110px");
        act(() => {
            flying.dispatchEvent(new Event("animationend", { bubbles: true }));
        });
        expect(view.container.querySelector(".chip-to-pot")).toBeNull();
    });

    it("shows an ante at the bet spot and sends it to the pot after a beat, never as a bet", () => {
        const view = wrap(seat());
        update(() => (mockActed = [{ type: "playerActed", action: { seat: 2, action: NonPlayerActionType.ANTE, amount: "1000" } }]));
        const ante = view.container.querySelector(".chip-to-pot") as HTMLElement;
        expect(ante.textContent).toBe("1000");
        expect(ante.style.animationDelay).toBe("150ms");
        expect(view.container.querySelector(".chip-slide-in")).toBeNull();
    });

    it("doesn't move anything with reduced motion", () => {
        window.matchMedia = jest.fn().mockImplementation((query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)", media: query }));
        const view = wrap(seat());
        update(() => (mockAmount = "20000"));
        update(() => (mockAmount = "0"));
        expect(view.container.querySelector(".chip-slide-in, .chip-to-pot")).toBeNull();
        // @ts-expect-error — jsdom has no matchMedia; put it back.
        delete window.matchMedia;
    });
});
