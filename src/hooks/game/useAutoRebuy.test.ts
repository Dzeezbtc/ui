import { renderHook, waitFor } from "@testing-library/react";
import { NonPlayerActionType, type LegalActionDTO } from "@block52/poker-vm-sdk";
import { useAutoRebuy, type UseAutoRebuyArgs } from "./useAutoRebuy";
import type { NetworkEndpoints } from "../../context/NetworkContext";

const mockTopUp = jest.fn();
jest.mock("./useTableTopUp", () => ({ useTableTopUp: () => ({ topUp: mockTopUp, loading: false, error: null }) }));

const TOP_UP = [{ action: NonPlayerActionType.TOP_UP, min: "0", max: "0", index: 0 }] as unknown as LegalActionDTO[];
const args = (over: Partial<UseAutoRebuyArgs> = {}): UseAutoRebuyArgs => ({
    tableId: "0xtable",
    network: {} as NetworkEndpoints,
    mode: "half",
    active: true,
    handNumber: 4,
    legalActions: TOP_UP,
    stack: "20000000",
    minBuyIn: "40000000",
    maxBuyIn: "200000000",
    wallet: "1000000000",
    ...over
});

describe("useAutoRebuy", () => {
    beforeEach(() => {
        mockTopUp.mockReset();
        mockTopUp.mockResolvedValue({ hash: "H", gameId: "0xtable", amount: "180000000" });
    });

    it("tops a low stack up to the max buy-in and reports it", async () => {
        const onRebuy = jest.fn();
        renderHook(() => useAutoRebuy(args({ onRebuy })));
        await waitFor(() => expect(onRebuy).toHaveBeenCalledWith(180_000_000n));
        expect(mockTopUp).toHaveBeenCalledWith("180000000");
    });

    it("tries once per hand, then again on the next hand", async () => {
        const { rerender } = renderHook(p => useAutoRebuy(p), { initialProps: args() });
        rerender(args({ wallet: "999000000" }));
        await waitFor(() => expect(mockTopUp).toHaveBeenCalledTimes(1));
        rerender(args({ handNumber: 5 }));
        await waitFor(() => expect(mockTopUp).toHaveBeenCalledTimes(2));
    });

    it("does nothing when off, inactive or without TOP_UP", () => {
        renderHook(() => useAutoRebuy(args({ mode: "off" })));
        renderHook(() => useAutoRebuy(args({ active: false })));
        renderHook(() => useAutoRebuy(args({ legalActions: [] })));
        expect(mockTopUp).not.toHaveBeenCalled();
    });

    it("logs a failed top-up without retrying in the same hand", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockTopUp.mockRejectedValue(new Error("nope"));
        const { rerender } = renderHook(p => useAutoRebuy(p), { initialProps: args() });
        await waitFor(() => expect(spy).toHaveBeenCalled());
        rerender(args({ stack: "19000000" }));
        expect(mockTopUp).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});
