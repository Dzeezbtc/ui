/**
 * Nodes page (Flagship look, Dzeezbtc/ui#94): which nodes to show, which are validators, how far
 * each is behind the tip, and where each sits on the network drawing.
 */

import type { NetworkEndpoints } from "../context/NetworkContext";
import { hasContent, hasElements, hasValue, isEmpty, isNullish } from "./guards";

/** Presets that are not real public nodes (local chain, local stub). */
const LOCAL_PRESETS: ReadonlySet<string> = new Set(["Localhost", "Stub"]);

/** The public nodes among the network presets. */
export const publicNodes = (presets: NetworkEndpoints[]): NetworkEndpoints[] => presets.filter(n => !LOCAL_PRESETS.has(n.name));

const squash = (s: string): string => s.toLowerCase().replace(/[\s\-_]/g, "").replace("validator", "");

/**
 * Whether a node's name matches a bonded validator's moniker, loosely:
 * "Texas Hodl" matches "validator-texashodl".
 */
export const isValidatorName = (name: string, monikers: string[]): boolean => {
    if (!hasContent(name) || isEmpty(monikers)) return false;
    const n = squash(name);
    if (!hasContent(n)) return false;
    return monikers.some(m => {
        const v = squash(m);
        return hasContent(v) && (v.includes(n) || n.includes(v));
    });
};

export type SyncState = { kind: "synced" } | { kind: "behind"; blocks: number } | { kind: "unknown" };

/** Blocks a node may trail the tip and still count as in sync (heights are read a moment apart). */
export const SYNC_TOLERANCE = 3;

/** How a node's height compares with the highest height seen. */
export const syncState = (height: number | null, tip: number | null): SyncState => {
    if (isNullish(height) || isNullish(tip)) return { kind: "unknown" };
    const behind = tip - height;
    return behind <= SYNC_TOLERANCE ? { kind: "synced" } : { kind: "behind", blocks: behind };
};

/** The highest height among the nodes, or null when none answered. */
export const tipHeight = (heights: (number | null)[]): number | null => {
    const known = heights.filter((h): h is number => hasValue(h));
    return hasElements(known) ? Math.max(...known) : null;
};

/** Points evenly round a circle, the first at the top. */
export const ringLayout = (count: number, cx: number, cy: number, r: number): { x: number; y: number }[] =>
    Array.from({ length: count }, (_, i) => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, count);
        return { x: Math.round((cx + r * Math.cos(a)) * 10) / 10, y: Math.round((cy + r * Math.sin(a)) * 10) / 10 };
    });

/** "node1.block52.xyz" from an endpoint URL; the input when it is not a URL. */
export const hostOf = (url: string): string => {
    try {
        return new URL(url).host;
    } catch {
        return url;
    }
};

/** A block height as people read it: "#1,234,567". */
export const heightLabel = (height: number): string => `#${height.toLocaleString("en-US")}`;
