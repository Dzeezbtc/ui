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

    it("highlights the current level and counts down to the next (AC-4)", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo());
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));

        expect(screen.getByTestId("blinds-row-current")).toHaveTextContent("1");
        expect(screen.getByTestId("blinds-row-next")).toHaveTextContent("2");
        expect(screen.getByText("100/200")).toBeInTheDocument();
        expect(screen.getByTestId("blinds-panel-countdown")).toHaveTextContent("2:00");
    });

    it("lists this game's whole schedule with when each level starts", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo({ secondsRemaining: 120, levelDurationSeconds: 300 }));
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));

        expect(screen.getByTestId("blinds-panel-summary")).toHaveTextContent("Starts 50/100 · doubles every 5 min");
        expect(screen.getAllByTestId("blinds-row-upcoming")).toHaveLength(11);
        // Level 5 is 4 levels away: 2:00 left + 3 × 5 min = 17 min.
        expect(screen.getByText("800/1,600")).toBeInTheDocument();
        expect(screen.getByText("17m")).toBeInTheDocument();
        // Level 11 is 10 levels away: 2 + 9 × 5 = 47 min.
        expect(screen.getByText("51,200/102,400")).toBeInTheDocument();
        expect(screen.getByText("47m")).toBeInTheDocument();
        expect(screen.queryByTestId("blinds-panel-partial")).not.toBeInTheDocument();
    });

    it("dims the levels already played", () => {
        mockUseBlindLevel.mockReturnValue(
            activeInfo({ level: 2, smallBlind: 200, bigBlind: 400, nextSmallBlind: 400, nextBigBlind: 800 })
        );
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));

        expect(screen.getAllByTestId("blinds-row-past").map(el => el.textContent)).toEqual(["1", "2"]);
        expect(screen.getAllByText("Done")).toHaveLength(2);
        expect(screen.getByTestId("blinds-row-current")).toHaveTextContent("3");
    });

    it("says only current + next are known when the schedule can't be derived", () => {
        mockUseBlindLevel.mockReturnValue(activeInfo({ nextSmallBlind: 75, nextBigBlind: 150 }));
        render(<BlindsPanel />);
        fireEvent.click(screen.getByTestId("blinds-panel-tab"));

        expect(screen.getByTestId("blinds-panel-partial")).toHaveTextContent("Only the current and next levels are known");
        expect(screen.queryByTestId("blinds-panel-summary")).not.toBeInTheDocument();
    });
});
