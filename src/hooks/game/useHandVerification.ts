import { useCallback, useEffect, useRef, useState } from "react";
import { NETWORK_PRESETS, useNetwork } from "../../context/NetworkContext";
import { useCometRpcApiFactory, useCosmosApiFactory } from "../../context/CosmosApiContext";
import { GAME_STATE_PUBLIC_PATH, historyNetworks, parseGameStateJson } from "../../utils/handReplay";
import { encodeStringField1, parseAbciStringResponse } from "../../utils/abciQuery";
import { hasValue, isNullish } from "../../utils/guards";
import type { TxSearchReply } from "../../utils/provablyFair/handEvidence";
import { HandEvidence, HandVerification, verifyHand } from "../../utils/provablyFair/handVerification";
import { loadHandEvidenceFromNodes } from "../../utils/provablyFair/loadHandEvidence";

export interface HandVerificationState {
    evidence: HandEvidence | null;
    result: HandVerification | null;
    /** The node the records came from. */
    node: string | null;
    isLoading: boolean;
    error: string | null;
    reload: () => void;
}

interface UseHandVerificationArgs {
    tableId: string | undefined;
    handNumber: number | null;
    /** Only fetch while the verify panel is open. */
    enabled: boolean;
}

/**
 * Loads a hand's dealing records from the chain and checks them in the browser
 * (ui#972). Reads the current node first, then the official Block52 node, which
 * keeps history. Re-runs when the hand changes or on reload().
 */
export function useHandVerification({ tableId, handNumber, enabled }: UseHandVerificationArgs): HandVerificationState {
    const { currentNetwork } = useNetwork();
    const cosmosApiFactory = useCosmosApiFactory();
    const cometRpcApiFactory = useCometRpcApiFactory();
    const [evidence, setEvidence] = useState<HandEvidence | null>(null);
    const [result, setResult] = useState<HandVerification | null>(null);
    const [node, setNode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const runId = useRef(0);

    const reload = useCallback(() => setReloadKey(k => k + 1), []);

    useEffect(() => {
        if (!enabled || isNullish(tableId) || !hasValue(handNumber) || handNumber < 1) return;
        const id = ++runId.current;
        const nodes = historyNetworks(currentNetwork, NETWORK_PRESETS).map(network => {
            const rest = cosmosApiFactory(network.rest);
            const rpc = cometRpcApiFactory(network.rpc);
            return {
                name: network.name,
                src: {
                    searchTxs: (query: string, limit: number) => rest.searchTxs(query, limit) as Promise<TxSearchReply>,
                    block: (height: number) => rpc.block(height),
                    publicStateAt: async (height: number) =>
                        parseGameStateJson(parseAbciStringResponse(await rpc.abciQuery(GAME_STATE_PUBLIC_PATH, encodeStringField1(tableId), height))).state
                }
            };
        });
        setIsLoading(true);
        setError(null);
        (async () => {
            try {
                const loaded = await loadHandEvidenceFromNodes(nodes, tableId, handNumber);
                if (id !== runId.current) return;
                setEvidence(loaded.evidence);
                setNode(loaded.node);
                setResult(verifyHand(loaded.evidence));
            } catch (err) {
                if (id !== runId.current) return;
                console.error("[useHandVerification] Failed to load hand records:", err);
                setEvidence(null);
                setResult(null);
                setError(err instanceof Error ? err.message : "Couldn't load the hand's records.");
            } finally {
                if (id === runId.current) setIsLoading(false);
            }
        })();
    }, [enabled, tableId, handNumber, reloadKey, currentNetwork, cosmosApiFactory, cometRpcApiFactory]);

    return { evidence, result, node, isLoading, error, reload };
}
