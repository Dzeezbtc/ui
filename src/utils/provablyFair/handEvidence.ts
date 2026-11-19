/**
 * Reading a hand's fairness evidence out of chain responses (ui#972). Pure
 * parsers only: the hook (useHandVerification) does the fetching.
 *
 * Where each piece lives on chain today:
 *   - Hand N ≥ 2 starts with a `new-hand` MsgPerformAction. Its `hand_started`
 *     event names the block; its `data` is normally "seed=<64 hex>", the 32-byte
 *     seed the chain shuffles the deck from (pokerchain deriveSeededDeck).
 *   - Hand 1 is dealt inside MsgCreateGame (`game_created` event). The block
 *     proposer commits a VRF seed for it in the same block (MsgRecordDeckSeeds).
 *   - A new-hand without a seed falls back to the proposer's VRF seed for that
 *     hand, or else to a chain-state seed built from the block's app hash
 *     (pokerchain Keeper.ShuffleDeckForNewHand).
 *   - `hand_completed` carries the final board and every hole card shown.
 */
import { hexToBytes } from "@noble/hashes/utils";
import { hasContent, hasElements, hasValue, isRecord, isString } from "../guards";

/** A REST `/cosmos/tx/v1beta1/txs` (or `/txs/{hash}`) reply, as far as we read it. */
export interface TxSearchReply {
    txs?: Array<{ body?: { messages?: unknown[] } }>;
    tx_responses?: Array<TxResponseLike>;
}

interface TxResponseLike {
    height?: string;
    txhash?: string;
    timestamp?: string;
    events?: Array<{ type?: string; attributes?: Array<{ key?: string; value?: string }> }>;
}

/** The transaction that dealt a hand. */
export interface HandStartRecord {
    height: number;
    txHash: string;
    time: string;
    /** "new-hand" for hands 2+, "create-game" for hand 1. */
    kind: "new-hand" | "create-game";
    /** The wallet that sent it. */
    sender: string;
    /** The 32-byte seed from the tx data ("seed=<hex>"), lower-case hex; null when the tx had none. */
    playerSeedHex: string | null;
    /** The tx data as sent, for the record. */
    data: string;
    /** `hand_started.deck_seed`: the block's app hash (the chain-state fallback input); null for hand 1. */
    appHashHex: string | null;
}

/** One validator VRF seed (MsgRecordDeckSeeds.seeds[i]), bytes as hex. */
export interface DeckSeedRecord {
    height: number;
    txHash: string;
    gameId: string;
    handNumber: number;
    vrfOutputHex: string;
    vrfProofHex: string;
    proposerPubkeyHex: string;
    /** The VRF's "prev_block_hash" field, which the chain fills with the block height (8 bytes). */
    heightBytesHex: string;
    playerSeedHex: string;
}

/** What `hand_completed` says the table showed. */
export interface HandEndRecord {
    height: number;
    txHash: string;
    round: string;
    board: string[];
    shownHoleCards: string[];
}

/** The header facts a check needs. */
export interface BlockRecord {
    height: number;
    time: string;
    proposerAddressHex: string;
    appHashHex: string;
}

/** `seed=<64 hex>` → lower-case hex; null when absent. Throws on a malformed seed (the chain rejects those). */
export function parsePlayerSeed(data: string): string | null {
    const idx = data.indexOf("seed=");
    if (idx < 0) return null;
    const raw = data.slice(idx + "seed=".length).split(/[&; ]/)[0];
    if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
        throw new Error(`Malformed seed in new-hand data: "${raw}"`);
    }
    return raw.toLowerCase();
}

/** Base64 (as the REST API returns bytes) → lower-case hex. Empty or null → "". */
export function base64ToHex(b64: string | null | undefined): string {
    if (!hasContent(b64)) return "";
    const bin = atob(b64);
    let out = "";
    for (let i = 0; i < bin.length; i++) out += bin.charCodeAt(i).toString(16).padStart(2, "0");
    return out;
}

/** True for a byte array with at least one byte (the guards cover arrays and strings, not Uint8Array). */
export function hasBytes(bytes: Uint8Array | null | undefined): bytes is Uint8Array {
    return hasValue(bytes) && bytes.byteLength > 0;
}

/** Hex → bytes, accepting "" as empty. */
export function hexBytes(hex: string): Uint8Array {
    return hasContent(hex) ? hexToBytes(hex) : new Uint8Array();
}

function eventAttrs(resp: TxResponseLike, type: string): Array<Record<string, string>> {
    const out: Array<Record<string, string>> = [];
    for (const ev of resp.events ?? []) {
        if (ev.type !== type) continue;
        const attrs: Record<string, string> = {};
        for (const a of ev.attributes ?? []) {
            if (isString(a.key) && isString(a.value)) attrs[a.key] = a.value;
        }
        out.push(attrs);
    }
    return out;
}

function pairs(reply: TxSearchReply): Array<{ messages: unknown[]; resp: TxResponseLike }> {
    const txs = reply.txs ?? [];
    const resps = reply.tx_responses ?? [];
    return resps.map((resp, i) => ({ messages: txs[i]?.body?.messages ?? [], resp }));
}

/**
 * The new-hand that started hand `handNumber` of `gameId`, from a REST search for
 * `hand_started.game_id=… AND hand_started.hand_number=…`. When the chain saw two
 * new-hands for one number in a block, the first one dealt the cards.
 */
export function parseHandStart(reply: TxSearchReply, gameId: string, handNumber: number): HandStartRecord | null {
    const candidates = pairs(reply)
        .map(({ messages, resp }): HandStartRecord | null => {
            const started = eventAttrs(resp, "hand_started").find(a => a.game_id === gameId && a.hand_number === String(handNumber));
            if (!started) return null;
            const msgIndex = Number(started.msg_index ?? 0);
            const msg = messages[msgIndex];
            if (!isRecord(msg) || msg.action !== "new-hand" || msg.game_id !== gameId) return null;
            const data = isString(msg.data) ? msg.data : "";
            return {
                height: Number(resp.height),
                txHash: resp.txhash ?? "",
                time: resp.timestamp ?? "",
                kind: "new-hand",
                sender: isString(msg.player) ? msg.player : "",
                playerSeedHex: parsePlayerSeed(data),
                data,
                appHashHex: hasContent(started.deck_seed) ? started.deck_seed.toLowerCase() : null
            };
        })
        .filter(hasValue)
        .sort((a, b) => a.height - b.height);
    return candidates[0] ?? null;
}

/** The MsgCreateGame that dealt hand 1, from a REST search for `game_created.game_id=…`. */
export function parseGameCreated(reply: TxSearchReply, gameId: string): HandStartRecord | null {
    for (const { messages, resp } of pairs(reply)) {
        const created = eventAttrs(resp, "game_created").find(a => a.game_id === gameId);
        if (!created) continue;
        const msg = messages[Number(created.msg_index ?? 0)];
        const creator = isRecord(msg) && isString(msg.creator) ? msg.creator : "";
        return {
            height: Number(resp.height),
            txHash: resp.txhash ?? "",
            time: resp.timestamp ?? "",
            kind: "create-game",
            sender: creator,
            playerSeedHex: null,
            data: "",
            appHashHex: null
        };
    }
    return null;
}

/** Every VRF seed recorded for (gameId, handNumber), from a REST search of MsgRecordDeckSeeds txs. */
export function parseDeckSeeds(reply: TxSearchReply, gameId: string, handNumber: number): DeckSeedRecord[] {
    const out: DeckSeedRecord[] = [];
    for (const { messages, resp } of pairs(reply)) {
        for (const msg of messages) {
            if (!isRecord(msg) || !Array.isArray(msg.seeds)) continue;
            for (const s of msg.seeds) {
                if (!isRecord(s) || s.game_id !== gameId || String(s.hand_number) !== String(handNumber)) continue;
                out.push({
                    height: Number(resp.height),
                    txHash: resp.txhash ?? "",
                    gameId,
                    handNumber,
                    vrfOutputHex: base64ToHex(s.vrf_output as string),
                    vrfProofHex: base64ToHex(s.vrf_proof as string),
                    proposerPubkeyHex: base64ToHex(s.proposer_pubkey as string),
                    heightBytesHex: base64ToHex(s.prev_block_hash as string),
                    playerSeedHex: base64ToHex(s.player_seed as string | null)
                });
            }
        }
    }
    return out.sort((a, b) => a.height - b.height);
}

const splitCards = (s: string | undefined): string[] => (hasContent(s) ? s.split(",").map(c => c.trim()).filter(hasContent) : []);

/** The `hand_completed` event for (gameId, handNumber). */
export function parseHandEnd(reply: TxSearchReply, gameId: string, handNumber: number): HandEndRecord | null {
    for (const { resp } of pairs(reply)) {
        const done = eventAttrs(resp, "hand_completed").find(a => a.game_id === gameId && a.hand_number === String(handNumber));
        if (!done) continue;
        return {
            height: Number(resp.height),
            txHash: resp.txhash ?? "",
            round: done.round ?? "",
            board: splitCards(done.community_cards),
            shownHoleCards: splitCards(done.revealed_hole_cards)
        };
    }
    return null;
}

/** A CometBFT RPC `/block?height=` reply → the header facts (hex upper-case as CometBFT prints them). */
export function parseBlock(reply: unknown): BlockRecord | null {
    const header = isRecord(reply) && isRecord(reply.result) && isRecord(reply.result.block) ? reply.result.block.header : undefined;
    if (!isRecord(header)) return null;
    const height = Number(header.height);
    if (!Number.isSafeInteger(height) || !isString(header.proposer_address)) return null;
    return {
        height,
        time: isString(header.time) ? header.time : "",
        proposerAddressHex: header.proposer_address.toUpperCase(),
        appHashHex: isString(header.app_hash) ? header.app_hash.toLowerCase() : ""
    };
}

/** True when a reply carries at least one tx. */
export function hasTxs(reply: TxSearchReply | null | undefined): boolean {
    return hasElements(reply?.tx_responses);
}
