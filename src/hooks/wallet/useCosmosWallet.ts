/**
 * useCosmosWallet - Temporary replacement hook
 *
 * This provides basic Cosmos wallet functionality using localStorage
 * and the SDK directly, without using CosmosContext.
 *
 * TODO: Replace with proper hooks in /src/hooks/cosmos/ after SDK testing is complete
 */

import { useState, useEffect, useCallback } from "react";
import { getCosmosClient, getSigningClient } from "../../utils/cosmos/client";
import { getCosmosMnemonic, getCosmosAddress, setCosmosMnemonic, setCosmosAddress } from "../../utils/cosmos/storage";
import { getAddressFromMnemonic } from "@block52/poker-vm-sdk";
import { clubApiBase, fetchUsdcBalance } from "../../utils/clubApi/chain";
import { getCustodySession } from "../../utils/custody/session";
import { useNetwork } from "../../context/NetworkContext";
import { isString } from "../../utils/guards";

interface Balance {
    denom: string;
    amount: string;
}

interface UseCosmosWalletReturn {
    address: string | null;
    balance: Balance[];
    isLoading: boolean;
    error: string | null;
    refreshBalance: () => Promise<void>;
    importSeedPhrase: (mnemonic: string) => Promise<void>;
    sendTokens: (recipient: string, amount: bigint | string, denom?: string) => Promise<string>;
}

/** How often the wallet balance is re-read while the page is open. */
export const BALANCE_POLL_MS = 10_000;

export const useCosmosWallet = (): UseCosmosWalletReturn => {
    const { currentNetwork } = useNetwork();
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<Balance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load address from mnemonic
    useEffect(() => {
        const loadAddress = async () => {
            // A club account has no seed phrase here: its address comes from the sign-in.
            const custody = getCustodySession();
            if (custody) {
                setAddress(custody.address);
                return;
            }
            const mnemonic = getCosmosMnemonic();
            if (!mnemonic) {
                setAddress(null);
                return;
            }

            try {
                const addr = await getAddressFromMnemonic(mnemonic, "b52");
                setAddress(addr);
            } catch (err) {
                console.error("Error loading Cosmos address:", err);
                setAddress(null);
            }
        };

        loadAddress();
    }, []);

    // Read the balance. `quiet` is for the background poll: it does not flash the loading state, and a failed poll keeps the
    // last balance on screen instead of clearing it (the next poll, or the refresh button, tries again).
    const loadBalance = useCallback(
        async (quiet: boolean) => {
            if (!address) return;

            if (!quiet) {
                setIsLoading(true);
                setError(null);
            }

            try {
                // Through the club API when this app has one (the API reads the node); the direct node client only remains
                // for an app with no club service configured.
                if (clubApiBase()) {
                    setBalance([{ denom: "usdc", amount: await fetchUsdcBalance(address) }]);
                    setError(null);
                    return;
                }
                const client = getCosmosClient(currentNetwork);
                if (!client) {
                    throw new Error("Block52 client not initialized");
                }

                const balances = await client.getAllBalances(address);
                setBalance(balances);
                setError(null);
            } catch (err) {
                if (!quiet) {
                    console.error("Error fetching balance:", err);
                    setError(err instanceof Error ? err.message : "Failed to fetch balance");
                }
            } finally {
                if (!quiet) setIsLoading(false);
            }
        },
        [address, currentNetwork]
    );

    // The refresh button and everything that asks for a fresh balance.
    const refreshBalance = useCallback(() => loadBalance(false), [loadBalance]);

    // Load when the address changes, then keep it current while the tab is visible, so USDC sent to this address shows up
    // without a click: every BALANCE_POLL_MS, and straight away when the tab comes back to the front.
    useEffect(() => {
        if (!address) return;
        void loadBalance(false);
        const tick = () => {
            if (!document.hidden) void loadBalance(true);
        };
        const id = setInterval(tick, BALANCE_POLL_MS);
        document.addEventListener("visibilitychange", tick);
        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [address, loadBalance]);

    // Import seed phrase
    const importSeedPhrase = useCallback(async (mnemonic: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Get address from mnemonic
            const addr = await getAddressFromMnemonic(mnemonic, "b52");

            // Store mnemonic AND address in localStorage
            setCosmosMnemonic(mnemonic);
            setCosmosAddress(addr);

            // Verify storage worked
            const verifyMnemonic = getCosmosMnemonic();
            const verifyAddress = getCosmosAddress();

            // Update state
            setAddress(addr);
        } catch (err) {
            console.error("Error importing seed phrase:", err);
            setError(err instanceof Error ? err.message : "Failed to import seed phrase");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Send tokens using SigningCosmosClient
    const sendTokens = useCallback(async (recipient: string, amount: bigint | string, denom: string = "usdc"): Promise<string> => {
        if (!address) {
            throw new Error("No wallet connected");
        }

        try {
            const { signingClient } = await getSigningClient(currentNetwork);

            // Convert amount to BigInt if it's a string
            const amountBigInt = isString(amount) ? BigInt(amount) : amount;

            // Send tokens - use the provided denom (usdc or stake)
            const txHash = await signingClient.sendTokens(
                address,        // from address
                recipient,      // to address
                amountBigInt,   // amount in micro-units as BigInt
                denom,          // denom (usdc or stake)
                `Transfer ${denom.toUpperCase()} via Dashboard`  // memo
            );


            // Refresh balance after sending
            await refreshBalance();

            return txHash;
        } catch (err) {
            console.error(`❌ Failed to send ${denom}:`, err);
            throw new Error(err instanceof Error ? err.message : `Failed to send ${denom}`);
        }
    }, [address, currentNetwork, refreshBalance]);

    return {
        address,
        balance,
        isLoading,
        error,
        refreshBalance,
        importSeedPhrase,
        sendTokens,
    };
};

export default useCosmosWallet;
