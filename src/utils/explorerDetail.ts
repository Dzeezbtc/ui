/**
 * Explorer block and transaction pages (Flagship look, Dzeezbtc/ui#98): what a transaction did
 * in plain English, its message fields with readable names, and transaction
 * hashes worked out from a block's raw transactions.
 */

import { formatMicroAsUsdc } from "../constants/currency";
import { hasContent, isNumber, isRecord, isString } from "./guards";
import { formatTransactionLabel } from "./transactionUtils";
import { truncateMiddle } from "./stringUtils";

/** A message's bare name from its type URL: "/pokerchain.poker.v1.MsgJoinGame" → "MsgJoinGame". */
export const msgName = (typeUrl: string): string => typeUrl.split(".").pop() ?? typeUrl;

/** A Block52 account or validator address. */
export const isChainAddress = (v: string): boolean => /^b521(valoper)?[02-9ac-hj-np-z]{38,}$/.test(v);

const str = (v: unknown): string | undefined => (isString(v) ? v : isNumber(v) ? String(v) : undefined);
const shortId = (id: string): string => (id.length > 14 ? truncateMiddle(id, 6, 4) : id);
const count = (v: string): string => (/^\d+$/.test(v) ? Number(v).toLocaleString("en-US") : v);
const usd = (micro: string): string => `$${formatMicroAsUsdc(micro, 2)}`;

/** The USDC amount in a Cosmos coin list, as "$12.50"; undefined when there is none. */
const usdcIn = (coins: unknown): string | undefined => {
    if (!Array.isArray(coins)) return undefined;
    const coin = coins.find(c => isRecord(c) && isString(c.denom) && c.denom.toLowerCase().includes("usdc"));
    return isRecord(coin) && isString(coin.amount) ? usd(coin.amount) : undefined;
};

/** What one message did, in a sentence: "Recorded Ethereum block 26,483,023", "Joined table 0x5a67…d001 in seat 3". */
export const txSentence = (msg: Record<string, unknown>): string => {
    const type = isString(msg["@type"]) ? msgName(msg["@type"]) : "";
    const game = str(msg.game_id) ?? str(msg.gameId);
    const at = hasContent(game) ? ` at table ${shortId(game)}` : "";
    switch (type) {
        case "MsgRecordEthBlockHeight": {
            const eth = str(msg.eth_block_height);
            return hasContent(eth) ? `Recorded Ethereum block ${count(eth)}` : "Recorded an Ethereum block";
        }
        case "MsgPerformAction": {
            const action = str(msg.action);
            return `${hasContent(action) ? formatTransactionLabel(action) : "Played a move"}${at}`;
        }
        case "MsgJoinGame": {
            const seat = str(msg.seat);
            return `Joined table${hasContent(game) ? ` ${shortId(game)}` : ""}${hasContent(seat) ? ` in seat ${seat}` : ""}`;
        }
        case "MsgLeaveGame":
            return `Left table${hasContent(game) ? ` ${shortId(game)}` : ""}`;
        case "MsgCreateGame":
            return "Created a table";
        case "MsgSend": {
            const amount = usdcIn(msg.amount);
            const to = str(msg.to_address);
            return `Sent ${amount ?? "funds"}${hasContent(to) ? ` to ${shortId(to)}` : ""}`;
        }
        default:
            return type ? formatTransactionLabel(undefined, type) : "Transaction";
    }
};

/** A field name as people read it: "cosmos_block_height" → "Cosmos block height", "gameId" → "Game id". */
export const fieldLabel = (key: string): string => {
    const words = key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .trim()
        .toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
};

export type FieldKind = "address" | "long" | "text";

export interface MessageField {
    key: string;
    label: string;
    value: string;
    kind: FieldKind;
}

/** A message's fields (not its type) with readable names, marked as addresses or long values to fold. */
export const messageFields = (msg: Record<string, unknown>): MessageField[] =>
    Object.entries(msg)
        .filter(([key]) => key !== "@type")
        .map(([key, raw]) => {
            const value = str(raw) ?? JSON.stringify(raw);
            const kind: FieldKind = isChainAddress(value) ? "address" : value.length > 42 ? "long" : "text";
            return { key, label: fieldLabel(key), value, kind };
        });

/** Raw transaction bytes (base64, as a block lists them) as lowercase hex. */
export const base64ToHex = (b64: string): string => {
    const bin = atob(b64);
    let hex = "";
    for (let i = 0; i < bin.length; i++) hex += bin.charCodeAt(i).toString(16).padStart(2, "0");
    return hex;
};

/** A transaction's hash (upper-case SHA-256 of its bytes), from the base64 a block lists. */
export const txHashFromBase64 = async (b64: string): Promise<string> => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    return Array.from(digest, b => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
};

/** A block height as people read it: "#1,234,567". */
export const blockLabel = (height: number): string => `#${height.toLocaleString("en-US")}`;
