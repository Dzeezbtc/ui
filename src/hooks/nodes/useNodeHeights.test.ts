import { renderHook, waitFor } from "@testing-library/react";
import { useNodeHeights, NODE_HEIGHT_POLL_MS } from "./useNodeHeights";

const mockLatest = jest.fn();
jest.mock("../../context/CosmosApiContext", () => ({
    useCosmosApiFactory: () => (rest: string) => ({ getLatestBlock: () => mockLatest(rest) })
}));

const NODES = [
    { name: "A", rpc: "", rest: "https://a", grpc: "", ws: "" },
    { name: "B", rpc: "", rest: "https://b", grpc: "", ws: "" }
];

describe("useNodeHeights", () => {
    beforeEach(() => mockLatest.mockReset());

    it("starts every node as checking, then reports heights and offline nodes", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockLatest.mockImplementation((rest: string) => (rest === "https://a" ? Promise.resolve({ block: { header: { height: "120" } } }) : Promise.reject(new Error("down"))));
        const { result } = renderHook(() => useNodeHeights(NODES));
        expect(result.current.A.status).toBe("checking");
        await waitFor(() => expect(result.current.A).toEqual({ status: "online", height: 120 }));
        expect(result.current.B).toEqual({ status: "offline", height: null });
        spy.mockRestore();
    });

    it("reads the sdk_block shape too and polls", async () => {
        const intervals = jest.spyOn(window, "setInterval");
        mockLatest.mockResolvedValue({ sdk_block: { header: { height: "7" } } });
        const { result } = renderHook(() => useNodeHeights(NODES));
        await waitFor(() => expect(result.current.B.height).toBe(7));
        expect(intervals).toHaveBeenCalledWith(expect.any(Function), NODE_HEIGHT_POLL_MS);
        intervals.mockRestore();
    });
});
