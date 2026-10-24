import React from "react";
import { act, renderHook } from "@testing-library/react";
import { GameSettingsProvider, useGameSettings, useChipStyle } from "./GameSettingsContext";

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

describe("GameSettingsContext — pot as chips (ui#772)", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("is off by default, so the pot stays as plain text", () => {
        const { result } = renderHook(() => useGameSettings(), { wrapper });
        expect(result.current.potAsChips).toBe(false);
    });

    it("toggles on and back off, persisting each change", () => {
        const { result } = renderHook(() => useGameSettings(), { wrapper });

        act(() => result.current.togglePotAsChips());
        expect(result.current.potAsChips).toBe(true);
        expect(localStorage.getItem("setting_potaschips")).toBe("true");

        act(() => result.current.togglePotAsChips());
        expect(result.current.potAsChips).toBe(false);
        expect(localStorage.getItem("setting_potaschips")).toBe("false");
    });

    it("remembers the choice across a reload", () => {
        localStorage.setItem("setting_potaschips", "true");
        const { result } = renderHook(() => useGameSettings(), { wrapper });
        expect(result.current.potAsChips).toBe(true);
    });
});

describe("GameSettingsContext — marble chips (ui#842)", () => {
    beforeEach(() => localStorage.removeItem("setting_marblechips"));

    it("defaults to the photoreal marble chips", () => {
        const { result } = renderHook(() => ({ settings: useGameSettings(), style: useChipStyle() }), { wrapper });
        expect(result.current.settings.marbleChips).toBe(true);
        expect(result.current.style).toBe("marble");
    });

    it("turning it off switches to the notched chips and is remembered", () => {
        const { result } = renderHook(() => ({ settings: useGameSettings(), style: useChipStyle() }), { wrapper });
        act(() => result.current.settings.toggleMarbleChips());
        expect(result.current.style).toBe("notched");
        expect(localStorage.getItem("setting_marblechips")).toBe("false");

        const { result: reloaded } = renderHook(() => useChipStyle(), { wrapper });
        expect(reloaded.current).toBe("notched");
    });

    it("useChipStyle falls back to marble outside the provider", () => {
        const { result } = renderHook(() => useChipStyle());
        expect(result.current).toBe("marble");
    });
});
