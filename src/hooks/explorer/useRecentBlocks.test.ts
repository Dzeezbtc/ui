import { renderHook, waitFor } from "@testing-library/react";
import { useRecentBlocks } from "./useRecentBlocks";
import { getCosmosClient } from "../../utils/cosmos/client";

jest.mock("../../context/NetworkContext", () => ({
    useNetwork: () => ({ currentNetwork: { rpc: "http://rpc", rest: "http://rest" } })
}));
jest.mock("../../utils/cosmos/client", () => ({ getCosmosClient: jest.fn() }));

const mocked = getCosmosClient as jest.Mock;
const raw = (h: number) => ({ block_id: { hash: `H${h}` }, block: { header: { height: String(h), time: "2026-11-20T00:00:00Z", proposer_address: "P" }, data: { txs: [] } } });

describe("useRecentBlocks", () => {
    afterEach(() => jest.clearAllMocks());

    it("loads the latest blocks newest first", async () => {
        mocked.mockReturnValue({ getLatestBlocks: jest.fn().mockResolvedValue([raw(1), raw(3), raw(2)]) });
        const { result } = renderHook(() => useRecentBlocks(3, 60000));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.blocks.map(b => b.height)).toEqual([3, 2, 1]);
        expect(result.current.error).toBeNull();
    });

    it("reports a failure", async () => {
        mocked.mockReturnValue({ getLatestBlocks: jest.fn().mockRejectedValue(new Error("down")) });
        const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const { result } = renderHook(() => useRecentBlocks(3, 60000));
        await waitFor(() => expect(result.current.error).toBe("down"));
        expect(result.current.blocks).toEqual([]);
        err.mockRestore();
    });
});
