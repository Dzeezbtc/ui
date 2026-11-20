import { renderHook, waitFor } from "@testing-library/react";
import { useLatestBlockHeight } from "./useLatestBlockHeight";
import { getCosmosClient } from "../../utils/cosmos/client";

jest.mock("../../context/NetworkContext", () => ({
    useNetwork: () => ({ currentNetwork: { rpc: "http://rpc", rest: "http://rest" } })
}));
jest.mock("../../utils/cosmos/client", () => ({ getCosmosClient: jest.fn() }));

const mockedClient = getCosmosClient as jest.Mock;

describe("useLatestBlockHeight", () => {
    afterEach(() => jest.clearAllMocks());

    it("reads the latest block height", async () => {
        mockedClient.mockReturnValue({ getLatestBlocks: jest.fn().mockResolvedValue([{ block: { header: { height: "1284503" } } }]) });
        const { result } = renderHook(() => useLatestBlockHeight(true));
        await waitFor(() => expect(result.current.height).toBe("1284503"));
        expect(result.current.hasError).toBe(false);
    });

    it("flags an error when the node can't be reached", async () => {
        mockedClient.mockReturnValue({ getLatestBlocks: jest.fn().mockRejectedValue(new Error("down")) });
        const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const { result } = renderHook(() => useLatestBlockHeight(true));
        await waitFor(() => expect(result.current.hasError).toBe(true));
        expect(result.current.height).toBeNull();
        err.mockRestore();
    });

    it("doesn't poll when disabled", () => {
        renderHook(() => useLatestBlockHeight(false));
        expect(mockedClient).not.toHaveBeenCalled();
    });
});
