import { act, renderHook } from "@testing-library/react";
import { BALANCE_POLL_MS, useCosmosWallet } from "./useCosmosWallet";
import { fetchUsdcBalance } from "../../utils/clubApi/chain";

/** The wallet's balance is the chain's, read through the club API, and it keeps itself current. */

// A stable object, as the real context gives: a new one per render would re-run the effect forever.
const mockNetwork = { currentNetwork: {} };
jest.mock("../../context/NetworkContext", () => ({ useNetwork: () => mockNetwork }));
jest.mock("../../utils/cosmos/client", () => ({ getCosmosClient: jest.fn(), getSigningClient: jest.fn() }));
jest.mock("../../utils/clubApi/chain", () => ({ clubApiBase: () => "http://api", fetchUsdcBalance: jest.fn() }));
const mockSession = { token: "t", username: "alice", address: "b521custody" };
jest.mock("../../utils/custody/session", () => ({ getCustodySession: () => mockSession }));
jest.mock("../../utils/cosmos/storage", () => ({ getCosmosMnemonic: () => null, getCosmosAddress: () => null, setCosmosMnemonic: jest.fn(), setCosmosAddress: jest.fn() }));

const fetchBalance = fetchUsdcBalance as jest.Mock;
const usdc = (r: ReturnType<typeof renderHook<ReturnType<typeof useCosmosWallet>, unknown>>) => r.result.current.balance.find(b => b.denom === "usdc")?.amount;
const hidden = (v: boolean) => Object.defineProperty(document, "hidden", { configurable: true, get: () => v });

beforeEach(() => {
    jest.useFakeTimers();
    fetchBalance.mockReset();
    hidden(false);
});
afterEach(() => jest.useRealTimers());

describe("the wallet balance of a club account", () => {
    it("is read from the club API for the account's own address", async () => {
        fetchBalance.mockResolvedValue("1460000");
        const r = renderHook(() => useCosmosWallet());
        await act(async () => {});
        expect(fetchBalance).toHaveBeenCalledWith("b521custody");
        expect(usdc(r)).toBe("1460000");
    });

    it("picks up USDC sent to the address, without a click", async () => {
        fetchBalance.mockResolvedValueOnce("0").mockResolvedValue("5000000");
        const r = renderHook(() => useCosmosWallet());
        await act(async () => {});
        expect(usdc(r)).toBe("0");
        await act(async () => {
            jest.advanceTimersByTime(BALANCE_POLL_MS);
        });
        expect(usdc(r)).toBe("5000000");
    });

    it("does not poll while the tab is hidden, and refreshes the moment it is visible again", async () => {
        fetchBalance.mockResolvedValue("1");
        renderHook(() => useCosmosWallet());
        await act(async () => {});
        fetchBalance.mockClear();
        hidden(true);
        await act(async () => {
            jest.advanceTimersByTime(BALANCE_POLL_MS * 3);
        });
        expect(fetchBalance).not.toHaveBeenCalled();
        hidden(false);
        await act(async () => {
            document.dispatchEvent(new Event("visibilitychange"));
        });
        expect(fetchBalance).toHaveBeenCalledTimes(1);
    });

    it("keeps the last real balance when a background poll fails, and shows no error for it", async () => {
        fetchBalance.mockResolvedValueOnce("1460000").mockRejectedValue(new Error("The chain didn't answer"));
        const r = renderHook(() => useCosmosWallet());
        await act(async () => {});
        await act(async () => {
            jest.advanceTimersByTime(BALANCE_POLL_MS);
        });
        expect(usdc(r)).toBe("1460000");
        expect(r.result.current.error).toBeNull();
    });

    it("says so when the first read fails (the refresh button's read is not quiet)", async () => {
        const quiet = jest.spyOn(console, "error").mockImplementation(() => undefined);
        fetchBalance.mockRejectedValue(new Error("The chain didn't answer"));
        const r = renderHook(() => useCosmosWallet());
        await act(async () => {});
        expect(r.result.current.error).toBe("The chain didn't answer");
        quiet.mockRestore();
    });
});
