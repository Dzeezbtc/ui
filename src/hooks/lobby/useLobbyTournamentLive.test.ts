import { renderHook, waitFor } from "@testing-library/react";
import { useLobbyTournamentLive, LOBBY_TOURNAMENT_POLL_MS } from "./useLobbyTournamentLive";

const mockGetGame = jest.fn();
jest.mock("../../context/CosmosApiContext", () => ({
    useCosmosApi: () => ({ getGame: mockGetGame })
}));

const record = (payouts: { place: number; amount: string }[], handNumber = 0) => ({
    game: JSON.stringify({
        format: "sit-and-go",
        variant: "texas-holdem",
        gameState: { handNumber, previousActions: [], results: [], payouts, gameOptions: { blindLevel: 1 } }
    })
});

describe("useLobbyTournamentLive", () => {
    beforeEach(() => mockGetGame.mockReset());

    it("reads nothing without a table", () => {
        const { result } = renderHook(() => useLobbyTournamentLive(undefined));
        expect(result.current).toBeUndefined();
        expect(mockGetGame).not.toHaveBeenCalled();
    });

    it("reads the table's payouts and level, then polls", async () => {
        const intervals = jest.spyOn(window, "setInterval");
        mockGetGame.mockResolvedValue(record([{ place: 1, amount: "9000000" }]));
        const { result } = renderHook(() => useLobbyTournamentLive("0xabc"));
        await waitFor(() => expect(result.current?.payouts).toEqual([{ place: 1, amount: "9000000" }]));
        expect(result.current?.level).toBe(1);
        expect(result.current?.started).toBe(false);
        expect(mockGetGame).toHaveBeenCalledWith("0xabc");
        expect(intervals).toHaveBeenCalledWith(expect.any(Function), LOBBY_TOURNAMENT_POLL_MS);
        intervals.mockRestore();
    });

    it("stays undefined when the read fails", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockGetGame.mockRejectedValue(new Error("down"));
        const { result } = renderHook(() => useLobbyTournamentLive("0xabc"));
        await waitFor(() => expect(spy).toHaveBeenCalled());
        expect(result.current).toBeUndefined();
        spy.mockRestore();
    });
});
