import { useCallback, useEffect, useState } from "react";
import type { NetworkEndpoints } from "../../context/NetworkContext";
import { useCosmosApiFactory } from "../../context/CosmosApiContext";
import { pushPulse, readNodeSnapshot, type NodeSnapshot } from "../../utils/nodeDetail";

/** How often the node page re-reads the node. */
export const NODE_STATUS_POLL_MS = 15_000;

export interface UseNodeStatusReturn {
    /** The last answer the node gave; kept when a later check fails. */
    snapshot: NodeSnapshot | null;
    /** The latest check got an answer. */
    online: boolean;
    /** True until the first check finishes. */
    loading: boolean;
    /** When the node was last checked (epoch ms), or null before the first check. */
    checkedAt: number | null;
    /** Recent block heights, oldest first. */
    pulse: number[];
    refresh: () => Promise<void>;
}

/**
 * useNodeStatus: one node's info, latest block and sync state, now and every
 * 15 s. A failed check marks it offline but keeps the last numbers on screen.
 */
export const useNodeStatus = (node: NetworkEndpoints | undefined): UseNodeStatusReturn => {
    const apiFor = useCosmosApiFactory();
    const [snapshot, setSnapshot] = useState<NodeSnapshot | null>(null);
    const [online, setOnline] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkedAt, setCheckedAt] = useState<number | null>(null);
    const [pulse, setPulse] = useState<number[]>([]);

    const refresh = useCallback(async () => {
        if (!node) return;
        const api = apiFor(node.rest);
        const [info, block, sync] = await Promise.allSettled([
            api.getNodeInfo(AbortSignal.timeout(10000)),
            api.getLatestBlock(AbortSignal.timeout(10000)),
            api.getSyncing(AbortSignal.timeout(10000))
        ]);
        const answered = info.status === "fulfilled" || block.status === "fulfilled";
        if (answered) {
            const next = readNodeSnapshot(
                info.status === "fulfilled" ? info.value : null,
                block.status === "fulfilled" ? block.value : null,
                sync.status === "fulfilled" ? sync.value : null
            );
            setSnapshot(next);
            setPulse(p => pushPulse(p, next.height));
        } else {
            console.error("[useNodeStatus] no answer from", node.name);
        }
        setOnline(answered);
        setCheckedAt(Date.now());
        setLoading(false);
    }, [apiFor, node]);

    useEffect(() => {
        setSnapshot(null);
        setPulse([]);
        setLoading(true);
        void refresh();
        const timer = window.setInterval(refresh, NODE_STATUS_POLL_MS);
        return () => window.clearInterval(timer);
    }, [refresh]);

    return { snapshot, online, loading, checkedAt, pulse, refresh };
};
