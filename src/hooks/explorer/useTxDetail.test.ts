import { renderHook, waitFor } from "@testing-library/react";
import { useTxDetail } from "./useTxDetail";

const mockGetTx = jest.fn();
jest.mock("../../context/NetworkContext", () => ({ useNetwork: () => ({ currentNetwork: { name: "test" } }) }));
jest.mock("../../utils/cosmos/client", () => ({ getCosmosClient: () => ({ getTx: (h: string) => mockGetTx(h) }) }));

describe("useTxDetail", () => {
    beforeEach(() => mockGetTx.mockReset());

    it("keeps a { tx, tx_response } answer as it is", async () => {
        const answer = { tx: { body: { messages: [] } }, tx_response: { txhash: "H", height: "5", code: 0 } };
        mockGetTx.mockResolvedValue(answer);
        const { result } = renderHook(() => useTxDetail("H"));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.tx).toEqual(answer);
    });

    it("wraps a bare response", async () => {
        mockGetTx.mockResolvedValue({ txhash: "H", height: "5", code: 0, tx: { body: { messages: [{ "@type": "x" }] } } });
        const { result } = renderHook(() => useTxDetail(" H "));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.tx?.tx_response.txhash).toBe("H");
        expect(result.current.tx?.tx.body.messages).toHaveLength(1);
        expect(mockGetTx).toHaveBeenCalledWith("H");
    });

    it("reports a missing transaction", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockGetTx.mockRejectedValue(new Error("tx not found"));
        const { result } = renderHook(() => useTxDetail("H"));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("tx not found");
        spy.mockRestore();
    });
});
