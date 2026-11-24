/**
 * Node detail page (Flagship look, Dzeezbtc/ui#104): which node the
 * URL names, what its status answers say, the live block pulse and "ago" labels.
 */

import type { NetworkEndpoints } from "../context/NetworkContext";
import { hasContent, isRecord, isString } from "./guards";
import type { TranslationKey } from "../i18n";

/** The node a /node/:name URL names: a preset, then a discovered node, then one passed in the link (case-insensitive). */
export const findNode = (
    name: string,
    presets: NetworkEndpoints[],
    discovered: NetworkEndpoints[],
    fromLink: NetworkEndpoints | undefined
): NetworkEndpoints | undefined => {
    const want = name.trim().toLowerCase();
    if (!hasContent(want)) return fromLink;
    return presets.find(n => n.name.toLowerCase() === want) ?? discovered.find(n => n.name.toLowerCase() === want) ?? fromLink;
};

export interface NodeSnapshot {
    height: number | null;
    /** ISO time of the latest block. */
    blockTime: string | null;
    chainId: string | null;
    version: string | null;
    sdkVersion: string | null;
    moniker: string | null;
    /** The node says it is still catching up. */
    catchingUp: boolean;
}

const str = (o: unknown, ...path: string[]): string | null => {
    let cur: unknown = o;
    for (const key of path) {
        if (!isRecord(cur)) return null;
        cur = cur[key];
    }
    return isString(cur) && hasContent(cur) ? cur : null;
};

/** What the node's three status answers say (each may be missing when that call failed). */
export const readNodeSnapshot = (nodeInfo: unknown, latestBlock: unknown, syncing: unknown): NodeSnapshot => {
    const header = (key: string) => str(latestBlock, "block", "header", key) ?? str(latestBlock, "sdk_block", "header", key);
    const heightText = header("height");
    const height = heightText !== null && Number(heightText) > 0 ? Number(heightText) : null;
    return {
        height,
        blockTime: header("time"),
        chainId: header("chain_id") ?? str(nodeInfo, "default_node_info", "network"),
        version: str(nodeInfo, "application_version", "version") ?? str(nodeInfo, "default_node_info", "version"),
        sdkVersion: str(nodeInfo, "application_version", "cosmos_sdk_version"),
        moniker: str(nodeInfo, "default_node_info", "moniker"),
        catchingUp: isRecord(syncing) && syncing.syncing === true
    };
};

/** How many recent heights the pulse strip shows. */
export const PULSE_LENGTH = 8;

/** The pulse strip after a new reading: a new height is added on the right, the oldest drops off. */
export const pushPulse = (pulse: number[], height: number | null, max: number = PULSE_LENGTH): number[] => {
    if (height === null || pulse[pulse.length - 1] === height) return pulse;
    return [...pulse, height].slice(-max);
};

export type AgoUnit = "now" | "s" | "m" | "h" | "d";

/** How long ago, as a unit and a count: just now, 12 s, 3 m, 2 h, 4 d (the page words it in the player's language). */
export const agoParts = (thenMs: number, nowMs: number): { unit: AgoUnit; n: number } => {
    const s = Math.max(0, Math.round((nowMs - thenMs) / 1000));
    if (s < 3) return { unit: "now", n: 0 };
    if (s < 60) return { unit: "s", n: s };
    if (s < 3600) return { unit: "m", n: Math.floor(s / 60) };
    if (s < 86400) return { unit: "h", n: Math.floor(s / 3600) };
    return { unit: "d", n: Math.floor(s / 86400) };
};

const AGO_KEYS: Record<AgoUnit, TranslationKey> = { now: "node.agoNow", s: "node.agoS", m: "node.agoM", h: "node.agoH", d: "node.agoD" };

/** "12s ago" in the player's language. */
export const agoText = (thenMs: number, nowMs: number, t: (key: TranslationKey, values?: Record<string, string | number>) => string): string => {
    const a = agoParts(thenMs, nowMs);
    return t(AGO_KEYS[a.unit], { n: a.n });
};
