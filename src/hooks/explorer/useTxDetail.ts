import { useEffect, useState } from "react";
import { useNetwork } from "../../context/NetworkContext";
import { getCosmosClient } from "../../utils/cosmos/client";
import { isRecord } from "../../utils/guards";
import type { CosmosTransaction } from "../../pages/explorer/types";

export interface UseTxDetailReturn {
    tx: CosmosTransaction | null;
    loading: boolean;
    error: string | null;
}

/** useTxDetail: one transaction by hash, in the { tx, tx_response } shape the explorer reads. */
export const useTxDetail = (hash: string): UseTxDetailReturn => {
    const { currentNetwork } = useNetwork();
    const [tx, setTx] = useState<CosmosTransaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stopped = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!hash.trim()) throw new Error("No transaction hash");
                const client = getCosmosClient(currentNetwork);
                if (!client) throw new Error("Block52 client not ready");
                const raw: unknown = await client.getTx(hash.trim());
                if (!isRecord(raw)) throw new Error("Transaction not found");
                const shaped = isRecord(raw.tx_response) ? raw : { tx_response: raw, tx: isRecord(raw.tx) ? raw.tx : { body: { messages: [] } } };
                if (!stopped) setTx(shaped as unknown as CosmosTransaction);
            } catch (err) {
                console.error("[useTxDetail] Failed to load transaction", hash, err);
                if (!stopped) {
                    setTx(null);
                    setError(err instanceof Error ? err.message : "Transaction not found");
                }
            } finally {
                if (!stopped) setLoading(false);
            }
        };
        void load();
        return () => {
            stopped = true;
        };
    }, [currentNetwork, hash]);

    return { tx, loading, error };
};
