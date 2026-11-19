import { renderHook, waitFor } from "@testing-library/react";
import fx from "../../utils/provablyFair/__fixtures__/localChainHand5.json";
import { useHandVerification } from "./useHandVerification";

const LOCAL = { name: "Localhost", rpc: "http://localhost:26657", rest: "http://localhost:1317", grpc: "", ws: "" };

jest.mock("../../context/NetworkContext", () => ({
    NETWORK_PRESETS: [],
    useNetwork: () => ({ currentNetwork: { name: "Localhost", rpc: "http://localhost:26657", rest: "http://localhost:1317", grpc: "", ws: "" } })
}));

const mockSearchTxs = jest.fn();
const mockBlock = jest.fn();
const mockAbciQuery = jest.fn();
jest.mock("../../context/CosmosApiContext", () => ({
    useCosmosApiFactory: () => () => ({ searchTxs: mockSearchTxs }),
    useCometRpcApiFactory: () => () => ({ block: mockBlock, abciQuery: mockAbciQuery })
}));

const GAME = "0xba95ed78a7e5bc05423ee914a24e9f84311efa3654776bda237c06feae9135f4";

describe("useHandVerification", () => {
    beforeEach(() => {
        mockSearchTxs.mockReset().mockImplementation(async (q: string) => {
            if (q.startsWith("hand_completed")) return fx.handCompleted;
            if (q.startsWith("hand_started")) return fx.handStarted;
            return { txs: [], tx_responses: [] };
        });
        mockBlock.mockReset().mockResolvedValue(fx.block);
        // The end-state query: pruned, so no seat map (the loose check still runs).
        mockAbciQuery.mockReset().mockRejectedValue(new Error("version does not exist"));
    });

    it("does nothing until enabled", () => {
        const { result } = renderHook(() => useHandVerification({ tableId: GAME, handNumber: 5, enabled: false }));
        expect(result.current.result).toBeNull();
        expect(mockSearchTxs).not.toHaveBeenCalled();
    });

    it("loads and checks a finished hand", async () => {
        const { result } = renderHook(() => useHandVerification({ tableId: GAME, handNumber: 5, enabled: true }));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.node).toBe(LOCAL.name);
        expect(result.current.result?.source).toBe("player-seed");
        expect(result.current.result?.checks.find(c => c.id === "deck")?.status).toBe("pass");
        expect(result.current.error).toBeNull();
    });

    it("reports a node failure as an error", async () => {
        mockSearchTxs.mockRejectedValue(new Error("offline"));
        const { result } = renderHook(() => useHandVerification({ tableId: GAME, handNumber: 5, enabled: true }));
        await waitFor(() => expect(result.current.error).toMatch(/offline/));
        expect(result.current.result).toBeNull();
    });
});
