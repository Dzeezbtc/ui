/**
 * Chain reads through the club API (Dzeezbtc/block52-club#54): the app asks the API, the API asks the node (gRPC where
 * it can). New reads go here, not to the node.
 */
import type { GameListItem } from "@block52/poker-vm-sdk";
import { features } from "../../config/features";
import { custodyBase } from "../custody/session";

/**
 * The club API's base URL for chain reads, or null when this app has none configured (VITE_CLUB_SERVICE_URLS) or the
 * switch is off (VITE_FEATURE_API_READS). Null means the caller reads the node directly, as the app always did.
 */
export const clubApiBase = (): string | null => (features.apiReads ? custodyBase() : null);

/** The address's USDC balance in micro-units, as a string. Throws when the API can't answer: nothing is guessed. */
export async function fetchUsdcBalance(address: string): Promise<string> {
    const base = clubApiBase();
    if (!base) throw new Error("No club service is configured (VITE_CLUB_SERVICE_URLS).");
    const res = await fetch(`${base}/chain/balance/${encodeURIComponent(address)}?denom=usdc`);
    const json = (await res.json().catch(() => ({}))) as { amount?: string; error?: string };
    if (!res.ok) throw new Error(json.error ?? `Balance request failed (${res.status})`);
    if (typeof json.amount !== "string") throw new Error("The club service sent no balance.");
    return json.amount;
}

/** Every table, as the club API lists them (the same items the node lists; each carries its current player count). */
export async function fetchTables(): Promise<GameListItem[]> {
    const base = clubApiBase();
    if (!base) throw new Error("No club service is configured (VITE_CLUB_SERVICE_URLS).");
    const res = await fetch(`${base}/chain/tables`);
    const json = (await res.json().catch(() => ({}))) as { games?: GameListItem[]; error?: string };
    if (!res.ok) throw new Error(json.error ?? `Table list request failed (${res.status})`);
    if (!Array.isArray(json.games)) throw new Error("The club service sent no table list.");
    return json.games;
}
