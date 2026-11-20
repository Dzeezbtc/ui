import { useEffect, useState } from "react";
import { useNetwork } from "../../context/NetworkContext";
import { getCosmosClient } from "../../utils/cosmos/client";
import { hasElements } from "../../utils/guards";

export const BLOCK_HEIGHT_POLL_MS = 10_000;

/**
 * The chain's latest block height, refreshed every 10 seconds, for the header's
 * live block pill. `hasError` is true when the last fetch failed. Pass
 * `enabled: false` where the header is hidden so a table page doesn't poll RPC.
 */
export const useLatestBlockHeight = (enabled: boolean): { height: string | null; hasError: boolean } => {
    const { currentNetwork } = useNetwork();
    const [height, setHeight] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        const fetchHeight = async () => {
            try {
                const client = getCosmosClient({ rpc: currentNetwork.rpc, rest: currentNetwork.rest });
                if (!client) return;
                const blocks = await client.getLatestBlocks(1);
                if (hasElements(blocks)) {
                    setHeight(blocks[0].block.header.height);
                    setHasError(false);
                }
            } catch (err) {
                console.error("Could not read the latest block:", err);
                setHasError(true);
            }
        };
        fetchHeight();
        const id = setInterval(fetchHeight, BLOCK_HEIGHT_POLL_MS);
        return () => clearInterval(id);
    }, [currentNetwork, enabled]);

    return { height, hasError };
};
