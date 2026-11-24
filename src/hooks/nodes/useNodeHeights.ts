import { useCallback, useEffect, useState } from "react";
import type { NetworkEndpoints } from "../../context/NetworkContext";
import { useCosmosApiFactory } from "../../context/CosmosApiContext";

export type NodeReach = "checking" | "online" | "offline";

export interface NodeHeight {
    status: NodeReach;
    /** Latest block height the node reported, or null when it did not answer. */
    height: number | null;
}

/** How often the Nodes page re-reads every node's height. */
export const NODE_HEIGHT_POLL_MS = 15_000;

type LatestBlock = { block?: { header?: { height?: string } }; sdk_block?: { header?: { height?: string } } };

/**
 * useNodeHeights: asks each node for its latest block, now and every 15 s.
 * A node that does not answer within 5 s is offline until the next round.
 */
export const useNodeHeights = (nodes: NetworkEndpoints[]): Record<string, NodeHeight> => {
    const apiFor = useCosmosApiFactory();
    const [heights, setHeights] = useState<Record<string, NodeHeight>>(() => Object.fromEntries(nodes.map(n => [n.name, { status: "checking", height: null }])));

    const check = useCallback(async () => {
        const results = await Promise.all(
            nodes.map(async (n): Promise<[string, NodeHeight]> => {
                try {
                    const data = (await apiFor(n.rest).getLatestBlock(AbortSignal.timeout(5000))) as LatestBlock;
                    const raw = data.block?.header?.height ?? data.sdk_block?.header?.height;
                    const height = Number(raw);
                    return [n.name, { status: "online", height: Number.isFinite(height) && height > 0 ? height : null }];
                } catch (err) {
                    console.error("[useNodeHeights] no answer from", n.name, err);
                    return [n.name, { status: "offline", height: null }];
                }
            })
        );
        setHeights(Object.fromEntries(results));
    }, [apiFor, nodes]);

    useEffect(() => {
        void check();
        const timer = window.setInterval(check, NODE_HEIGHT_POLL_MS);
        return () => window.clearInterval(timer);
    }, [check]);

    return heights;
};
