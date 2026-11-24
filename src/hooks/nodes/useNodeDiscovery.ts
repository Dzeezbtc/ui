import { useCallback, useEffect, useState } from "react";
import { useNetwork, type NetworkEndpoints } from "../../context/NetworkContext";
import { cacheNodes, clearNodeCache, discoverNodes, getCachedNodes, probeNodes, type DiscoveredNode } from "../../services/nodeDiscovery";
import { hasElements, hasValue } from "../../utils/guards";

export type DiscoveryPhase = "idle" | "discovering" | "probing";

export interface UseNodeDiscoveryReturn {
    nodes: DiscoveredNode[];
    phase: DiscoveryPhase;
    discover: () => Promise<void>;
    /** Whether a node is already in the network picker. */
    isAdded: (node: DiscoveredNode) => boolean;
    /** Put a node in the network picker. */
    add: (node: DiscoveredNode) => void;
}

/**
 * useNodeDiscovery: asks the known nodes for their peers, keeps the ones that
 * are not presets, checks which answer, and remembers them between visits.
 */
export const useNodeDiscovery = (seeds: NetworkEndpoints[]): UseNodeDiscoveryReturn => {
    const { addDiscoveredNetwork, discoveredNetworks } = useNetwork();
    const [nodes, setNodes] = useState<DiscoveredNode[]>([]);
    const [phase, setPhase] = useState<DiscoveryPhase>("idle");

    useEffect(() => {
        const cached = getCachedNodes();
        if (cached) setNodes(cached.filter(n => !n.isPreset));
    }, []);

    const discover = useCallback(async () => {
        setPhase("discovering");
        clearNodeCache();
        try {
            const found = (await discoverNodes(seeds, seeds)).filter(d => !d.isPreset);
            setNodes(found);
            cacheNodes(found);
            if (hasElements(found)) {
                setPhase("probing");
                const probed = await probeNodes(found);
                setNodes(probed);
                cacheNodes(probed);
            }
        } catch (err) {
            console.error("[useNodeDiscovery] Failed to discover nodes:", err);
        } finally {
            setPhase("idle");
        }
    }, [seeds]);

    const isAdded = useCallback(
        (node: DiscoveredNode) => hasValue(node.endpoints) && discoveredNetworks.some(n => n.name === node.endpoints?.name || n.rest === node.endpoints?.rest),
        [discoveredNetworks]
    );

    const add = useCallback(
        (node: DiscoveredNode) => {
            if (node.endpoints) addDiscoveredNetwork(node.endpoints);
        },
        [addDiscoveredNetwork]
    );

    return { nodes, phase, discover, isAdded, add };
};
