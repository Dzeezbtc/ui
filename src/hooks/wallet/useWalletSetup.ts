import { useCallback, useState } from "react";
import { createWalletFromMnemonic, generateWallet } from "@block52/poker-vm-sdk";
import { getCosmosAddress, getCosmosMnemonic, isValidSeedPhrase, setCosmosAddress, setCosmosMnemonic } from "../../utils/cosmos";
import { WELCOME_PENDING_KEY, WELCOME_SEEN_KEY } from "../../utils/welcomeSetup";
import { hasContent } from "../../utils/guards";

export interface NewWallet {
    mnemonic: string;
    address: string;
}

export interface UseWalletSetupReturn {
    busy: boolean;
    error: string | null;
    /** The wallet already on this device (the app makes one on a first visit), or null. */
    current: () => NewWallet | null;
    /** Makes a new 24-word wallet (not saved until `save`). */
    create: () => Promise<NewWallet | null>;
    /** Checks a recovery phrase and returns its wallet (not saved until `save`). */
    restore: (phrase: string) => Promise<NewWallet | null>;
    /** Keeps the wallet on this device. */
    save: (wallet: NewWallet) => void;
    /** Remembers that this visitor has finished or skipped the setup. */
    markSeen: () => void;
}

/** useWalletSetup: the wallet on this device for the first-visit setup (or a new or restored one), kept on this device. */
export const useWalletSetup = (): UseWalletSetupReturn => {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const current = useCallback((): NewWallet | null => {
        const mnemonic = getCosmosMnemonic();
        const address = getCosmosAddress();
        return hasContent(mnemonic) && hasContent(address) ? { mnemonic, address } : null;
    }, []);

    const create = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            const w = await generateWallet("b52", 24);
            return { mnemonic: w.mnemonic, address: w.address };
        } catch (err) {
            console.error("[useWalletSetup] Failed to create a wallet:", err);
            setError("create");
            return null;
        } finally {
            setBusy(false);
        }
    }, []);

    const restore = useCallback(async (phrase: string) => {
        setError(null);
        const clean = phrase.trim().split(/\s+/).join(" ");
        if (!isValidSeedPhrase(clean)) {
            setError("phrase");
            return null;
        }
        setBusy(true);
        try {
            const w = await createWalletFromMnemonic(clean, "b52");
            return { mnemonic: clean, address: w.address };
        } catch (err) {
            console.error("[useWalletSetup] Failed to restore a wallet:", err);
            setError("phrase");
            return null;
        } finally {
            setBusy(false);
        }
    }, []);

    const markSeen = useCallback(() => {
        try {
            localStorage.setItem(WELCOME_SEEN_KEY, "1");
            localStorage.removeItem(WELCOME_PENDING_KEY);
        } catch (err) {
            console.error("[useWalletSetup] Could not remember the setup:", err);
        }
    }, []);

    const save = useCallback(
        (wallet: NewWallet) => {
            setCosmosMnemonic(wallet.mnemonic);
            setCosmosAddress(wallet.address);
            markSeen();
        },
        [markSeen]
    );

    return { busy, error, current, create, restore, save, markSeen };
};
