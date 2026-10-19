import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlindsPanel from "./BlindsPanel";
import type { BlindLevelInfo } from "../../hooks/game/useBlindLevel";

const mockUseBlindLevel = jest.fn<BlindLevelInfo, []>();

jest.mock("../../hooks/game/useBlindLevel", () => ({
    useBlindLevel: () => mockUseBlindLevel()
}));

const activeInfo = (overrides: Partial<BlindLevelInfo> = {}): BlindLevelInfo => ({
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

describe("BlindsPanel", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        try {
            localStorage.clear();
        } catch {
            /* ignore */
        }
    });

    it("renders nothing for cash games (not SNG/tournament)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo({ isActive: false }));
        const { container } = render(<BlindsPanel />);
        expect(container.firstChild).toBeNull();
    });

    it("shows the tab for SNG/tournament, closed by default", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(<BlindsPanel />);
        expect(screen.getByTestId("blinds-panel-tab")).toBeInTheDocument();
        expect(screen.queryByTestId("blinds-panel")).not.toBeInTheDocument();
    });

    it("opens on tab click and closes on a second click (AC-2)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(<BlindsPanel />);
        const tab = screen.getByTestId("blinds-panel-tab");

        fireEvent.click(tab);
        expect(screen.getByTestId("blinds-panel")).toBeInTheDocument();

        fireEvent.click(tab);
        expect(screen.queryByTestId("blinds-panel")).not.toBeInTheDocument();
    });

    it("closes on Escape (AC-2)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));
        expect(screen.getByTestId("blinds-panel")).toBeInTheDocument();

        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByTestId("blinds-panel")).not.toBeInTheDocument();
    });

    it("closes on an outside click (AC-2)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(
            <div>
                <button data-testid="outside">felt</button>
                <BlindsPanel />
            </div>
        );
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));
        expect(screen.getByTestId("blinds-panel")).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByTestId("outside"));
        expect(screen.queryByTestId("blinds-panel")).not.toBeInTheDocument();
    });

    it("highlights the current level and shows SB/BB, minutes and countdown (AC-4)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));

        const current = screen.getByTestId("blinds-row-current");
        expect(current).toHaveTextContent("1");
        expect(screen.getByText("50/100")).toBeInTheDocument();
        expect(screen.getByTestId("blinds-row-next")).toHaveTextContent("2");
        expect(screen.getByText("100/200")).toBeInTheDocument();
        expect(screen.getByTestId("blinds-panel-countdown")).toHaveTextContent("2:00");
    });

    it("notes the pending full structure (AC-6)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));
        expect(screen.getByTestId("blinds-panel-pending")).toHaveTextContent("poker-vm#1734");
    });
});
