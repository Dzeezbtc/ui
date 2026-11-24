import { act, renderHook } from "@testing-library/react";
import { useWalletSetup } from "./useWalletSetup";
import { WELCOME_PENDING_KEY, WELCOME_SEEN_KEY } from "../../utils/welcomeSetup";

const mockGenerate = jest.fn();
const mockFromMnemonic = jest.fn();
jest.mock("@block52/poker-vm-sdk", () => ({
    generateWallet: (...a: unknown[]) => mockGenerate(...a),
    createWalletFromMnemonic: (...a: unknown[]) => mockFromMnemonic(...a)
}));
const mockSetMnemonic = jest.fn();
const mockSetAddress = jest.fn();
let mockStored: { m: string | null; a: string | null } = { m: null, a: null };
jest.mock("../../utils/cosmos", () => ({
    getCosmosMnemonic: () => mockStored.m,
    getCosmosAddress: () => mockStored.a,
    isValidSeedPhrase: (p: string) => p.split(" ").length === 12,
    setCosmosMnemonic: (m: string) => mockSetMnemonic(m),
    setCosmosAddress: (a: string) => mockSetAddress(a)
}));

const TWELVE = "a b c d e f g h i j k l";

describe("useWalletSetup", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockStored = { m: null, a: null };
    });

    it("reads the wallet already on this device", () => {
        const { result } = renderHook(() => useWalletSetup());
        expect(result.current.current()).toBeNull();
        mockStored = { m: TWELVE, a: "b521w" };
        expect(result.current.current()).toEqual({ mnemonic: TWELVE, address: "b521w" });
    });

    it("creates a 24-word wallet without saving it", async () => {
        mockGenerate.mockResolvedValue({ mnemonic: "m", address: "b521x" });
        const { result } = renderHook(() => useWalletSetup());
        let w = null;
        await act(async () => {
            w = await result.current.create();
        });
        expect(mockGenerate).toHaveBeenCalledWith("b52", 24);
        expect(w).toEqual({ mnemonic: "m", address: "b521x" });
        expect(mockSetMnemonic).not.toHaveBeenCalled();
    });

    it("restores a valid phrase, tidying its spacing", async () => {
        mockFromMnemonic.mockResolvedValue({ address: "b521y" });
        const { result } = renderHook(() => useWalletSetup());
        let w = null;
        await act(async () => {
            w = await result.current.restore("  a b  c d e f g h i j k l ");
        });
        expect(w).toEqual({ mnemonic: TWELVE, address: "b521y" });
    });

    it("refuses a phrase of the wrong length", async () => {
        const { result } = renderHook(() => useWalletSetup());
        await act(async () => {
            await result.current.restore("too short");
        });
        expect(result.current.error).toBe("phrase");
        expect(mockFromMnemonic).not.toHaveBeenCalled();
    });

    it("saves the wallet and remembers the setup", () => {
        localStorage.setItem(WELCOME_PENDING_KEY, "1");
        const { result } = renderHook(() => useWalletSetup());
        act(() => result.current.save({ mnemonic: TWELVE, address: "b521z" }));
        expect(mockSetMnemonic).toHaveBeenCalledWith(TWELVE);
        expect(mockSetAddress).toHaveBeenCalledWith("b521z");
        expect(localStorage.getItem(WELCOME_SEEN_KEY)).toBe("1");
        expect(localStorage.getItem(WELCOME_PENDING_KEY)).toBeNull();
    });

    it("reports a failed create", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockGenerate.mockRejectedValue(new Error("no entropy"));
        const { result } = renderHook(() => useWalletSetup());
        await act(async () => {
            await result.current.create();
        });
        expect(result.current.error).toBe("create");
        spy.mockRestore();
    });
});
