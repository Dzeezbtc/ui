import { webcrypto } from "crypto";
import { renderHook, waitFor } from "@testing-library/react";
import { useBlockDetail } from "./useBlockDetail";

const mockGetBlock = jest.fn();
jest.mock("../../context/NetworkContext", () => ({ useNetwork: () => ({ currentNetwork: { name: "test" } }) }));
jest.mock("../../utils/cosmos/client", () => ({ getCosmosClient: () => ({ getBlock: (h: number) => mockGetBlock(h) }) }));

beforeAll(() => {
    if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
});

describe("useBlockDetail", () => {
    beforeEach(() => mockGetBlock.mockReset());

    it("reads the header and hashes each transaction", async () => {
        mockGetBlock.mockResolvedValue({
            block_id: { hash: "BLOCKHASH" },
            block: { header: { height: "10", time: "2026-11-24T00:00:00Z", chain_id: "pokerchain", proposer_address: "PROP", app_hash: "APP" }, data: { txs: ["YWJj"] } }
        });
        const { result } = renderHook(() => useBlockDetail(10));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.block).toMatchObject({ height: 10, hash: "BLOCKHASH", chainId: "pokerchain", proposer: "PROP" });
        expect(result.current.block?.txs[0].hash).toBe("BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD");
        expect(mockGetBlock).toHaveBeenCalledWith(10);
    });

    it("reports a missing block", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockGetBlock.mockRejectedValue(new Error("height not available"));
        const { result } = renderHook(() => useBlockDetail(10));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("height not available");
        expect(result.current.block).toBeNull();
        spy.mockRestore();
    });

    it("refuses a height that is not a number", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const { result } = renderHook(() => useBlockDetail(NaN));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("No block height");
        spy.mockRestore();
    });
});
