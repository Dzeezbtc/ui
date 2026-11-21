import { renderHook, waitFor } from "@testing-library/react";
import { useFairnessData } from "./useFairnessData";

const mockApi = { getCardStats: jest.fn(), getRandomnessAnalysis: jest.fn(), getSyncStatus: jest.fn() };
jest.mock("../../context/IndexerApiContext", () => ({ useIndexerApi: () => mockApi }));

describe("useFairnessData", () => {
    let err: jest.SpyInstance;
    beforeEach(() => {
        jest.resetAllMocks();
        err = jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterEach(() => err.mockRestore());

    it("loads cards, checks and status", async () => {
        mockApi.getCardStats.mockResolvedValue([{ card: "As" }]);
        mockApi.getRandomnessAnalysis.mockResolvedValue({ card_chi_squared: { result: "PASS" } });
        mockApi.getSyncStatus.mockResolvedValue({ percent_complete: 100 });
        const { result } = renderHook(() => useFairnessData());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.cards).toHaveLength(1);
        expect(result.current.report).not.toBeNull();
        expect(result.current.status).not.toBeNull();
        expect(result.current.error).toBeNull();
    });

    it("still shows the cards when the checks fail to load", async () => {
        mockApi.getCardStats.mockResolvedValue([{ card: "As" }]);
        mockApi.getRandomnessAnalysis.mockRejectedValue(new Error("x"));
        mockApi.getSyncStatus.mockRejectedValue(new Error("x"));
        const { result } = renderHook(() => useFairnessData());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.cards).toHaveLength(1);
        expect(result.current.report).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it("reports an error when the card counts can't be loaded", async () => {
        mockApi.getCardStats.mockRejectedValue(new Error("down"));
        const { result } = renderHook(() => useFairnessData());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toMatch(/can't be reached/);
        expect(mockApi.getRandomnessAnalysis).not.toHaveBeenCalled();
    });
});
