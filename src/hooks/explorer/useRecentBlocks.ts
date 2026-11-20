import { useEffect, useState } from "react";
import { useNetwork } from "../../context/NetworkContext";
import { getCosmosClient } from "../../utils/cosmos/client";
import { type RecentBlock, sortBlocks, toRecentBlock, type ChainBlockLike } from "../../utils/explorerView";

/**
 * The chain's latest blocks for the explorer home (newest first), refreshed on
 * an interval. Keeps the last good list when a refresh fails and reports the error.
 */
export const useRecentBlocks = (count: number, pollMs: number): { blocks: RecentBlock[]; loading: boolean; error: string | null } => {
    const { currentNetwork } = useNetwork();
    const [blocks, setBlocks] = useState<RecentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            try {
                const client = getCosmosClient({ rpc: currentNetwork.rpc, rest: currentNetwork.rest });
                if (!client) throw new Error("Block52 client not initialized.");
                const raw: ChainBlockLike[] = await client.getLatestBlocks(count);
                if (!alive) return;
                setBlocks(sortBlocks(raw.map(toRecentBlock)));
                setError(null);
            } catch (err) {
                console.error("Could not load the latest blocks:", err);
                if (alive) setError(err instanceof Error ? err.message : "Could not load the latest blocks");
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        const id = setInterval(load, pollMs);
        return () => {
            alive = false;
            clearInterval(id);
        };
    }, [currentNetwork, count, pollMs]);

    return { blocks, loading, error };
};
