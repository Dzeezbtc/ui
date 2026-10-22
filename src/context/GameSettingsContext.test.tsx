import React from "react";
import { act, renderHook } from "@testing-library/react";
import { GameSettingsProvider, useGameSettings } from "./GameSettingsContext";

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <GameSettingsProvider>{children}</GameSettingsProvider>;

describe("GameSettingsContext — win celebration (ui#847)", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("is on by default, so existing players see no change", () => {
        const { result } = renderHook(() => useGameSettings(), { wrapper });
        expect(result.current.winCelebration).toBe(true);
    });

    it("toggles off and back on, persisting each change", () => {
        const { result } = renderHook(() => useGameSettings(), { wrapper });

        act(() => result.current.toggleWinCelebration());
        expect(result.current.winCelebration).toBe(false);
        expect(localStorage.getItem("setting_wincelebration")).toBe("false");

        act(() => result.current.toggleWinCelebration());
        expect(result.current.winCelebration).toBe(true);
        expect(localStorage.getItem("setting_wincelebration")).toBe("true");
    });

    it("remembers the choice across a reload", () => {
        localStorage.setItem("setting_wincelebration", "false");
        const { result } = renderHook(() => useGameSettings(), { wrapper });
        expect(result.current.winCelebration).toBe(false);
    });
});
