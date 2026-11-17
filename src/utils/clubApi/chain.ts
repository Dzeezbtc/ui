/**
 * Chain reads through the club API (Dzeezbtc/block52-club#54): the app asks the API, the API asks the node (gRPC where
 * it can). New reads go here, not to the node.
 */
import { custodyBase } from "../custody/session";

/** The club API's base URL, or null when this app has none configured (VITE_CLUB_SERVICE_URLS). */
export const clubApiBase = (): string | null => custodyBase();

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
