import { act, renderHook } from "@testing-library/react";
import { useLobbyPrefs } from "./useLobbyPrefs";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import type { LobbyPrefs } from "../../utils/lobbyLayout";

const defaults: LobbyPrefs = { stakes: [], sizes: [], sort: "most-players", treasuryOnly: true, rowSizes: {} };

describe("useLobbyPrefs", () => {
    beforeEach(() => localStorage.clear());

    it("starts from the defaults when nothing is saved", () => {
        const { result } = renderHook(() => useLobbyPrefs(defaults));
        expect(result.current[0]).toEqual(defaults);
    });

    it("saves changes and reads them back on the next visit", () => {
        const first = renderHook(() => useLobbyPrefs(defaults));
        act(() => first.result.current[1]({ stakes: ["low", "mid"], treasuryOnly: false }));
        expect(first.result.current[0]).toEqual({ ...defaults, stakes: ["low", "mid"], treasuryOnly: false });
        expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.lobbyFilters) ?? "{}").stakes).toEqual(["low", "mid"]);

        const second = renderHook(() => useLobbyPrefs(defaults));
        expect(second.result.current[0].stakes).toEqual(["low", "mid"]);
        expect(second.result.current[0].treasuryOnly).toBe(false);
    });

    it("falls back to the defaults when storage can't be read", () => {
        const spy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const { result } = renderHook(() => useLobbyPrefs(defaults));
        expect(result.current[0]).toEqual(defaults);
        spy.mockRestore();
        err.mockRestore();
    });
});
