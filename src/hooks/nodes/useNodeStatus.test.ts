import { act, renderHook, waitFor } from "@testing-library/react";
import { useNodeStatus, NODE_STATUS_POLL_MS } from "./useNodeStatus";

const mockInfo = jest.fn();
const mockBlock = jest.fn();
const mockSync = jest.fn();
// Stable like the real (memoised) factory, so the hook does not re-run its effect every render.
const mockFactory = () => ({ getNodeInfo: () => mockInfo(), getLatestBlock: () => mockBlock(), getSyncing: () => mockSync() });
jest.mock("../../context/CosmosApiContext", () => ({
    useCosmosApiFactory: () => mockFactory
}));

const NODE = { name: "Block52", rpc: "", rest: "https://x", grpc: "", ws: "" };
const block = (h: string) => ({ block: { header: { height: h, time: "2026-11-24T00:00:00Z", chain_id: "pokerchain" } } });

describe("useNodeStatus", () => {
    beforeEach(() => {
        mockInfo.mockReset();
        mockBlock.mockReset();
        mockSync.mockReset();
    });

    it("reads the node and starts the pulse", async () => {
        mockInfo.mockResolvedValue({ application_version: { version: "v1" } });
        mockBlock.mockResolvedValue(block("100"));
        mockSync.mockResolvedValue({ syncing: false });
        const { result } = renderHook(() => useNodeStatus(NODE));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.online).toBe(true);
        expect(result.current.snapshot?.height).toBe(100);
        expect(result.current.snapshot?.version).toBe("v1");
        expect(result.current.pulse).toEqual([100]);
        expect(result.current.checkedAt).not.toBeNull();
    });

    it("keeps the last numbers when the node stops answering", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockInfo.mockResolvedValue({});
        mockBlock.mockResolvedValue(block("100"));
        mockSync.mockResolvedValue({});
        const { result } = renderHook(() => useNodeStatus(NODE));
        await waitFor(() => expect(result.current.online).toBe(true));
        mockInfo.mockRejectedValue(new Error("down"));
        mockBlock.mockRejectedValue(new Error("down"));
        mockSync.mockRejectedValue(new Error("down"));
        await act(async () => {
            await result.current.refresh();
        });
        expect(result.current.online).toBe(false);
        expect(result.current.snapshot?.height).toBe(100);
        spy.mockRestore();
    });

    it("polls and does nothing without a node", async () => {
        const intervals = jest.spyOn(window, "setInterval");
        renderHook(() => useNodeStatus(undefined));
        expect(mockInfo).not.toHaveBeenCalled();
        expect(intervals).toHaveBeenCalledWith(expect.any(Function), NODE_STATUS_POLL_MS);
        intervals.mockRestore();
    });
});
