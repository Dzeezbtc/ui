/**
 * The chain's deck shuffle, reproduced byte for byte (ui#972).
 *
 * pokerchain `types.Deck.ShuffleFromVRF(seed)`:
 *   1. Start from the standard deck: clubs, diamonds, hearts, spades, each A..K.
 *   2. Expand the seed with HKDF-SHA-256 (no salt, info = "poker/deck/v1").
 *   3. Fisher-Yates from the last card down: swap card i with card j, where j is
 *      Go's `crypto/rand.Int(hkdfReader, i+1)` (rejection sampling, no modulo bias).
 *
 * Whoever holds the seed can rebuild the deck with nothing but this file, which
 * is what makes a hand checkable after it ends.
 */
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";

/** HKDF info and BuildVRFInput prefix (pokerchain `types.VRFInputPrefix`). */
export const DECK_DERIVATION_INFO = "poker/deck/v1";

const SUITS = ["C", "D", "H", "S"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"] as const;

/** The unshuffled deck in the chain's order (`initStandard52`): AC..KC, AD..KD, AH..KH, AS..KS. */
export function standardDeck(): string[] {
    return SUITS.flatMap(suit => RANKS.map(rank => `${rank}${suit}`));
}

// HKDF-SHA-256 may emit at most 255 blocks of 32 bytes. A 52-card shuffle reads
// 51 values of one byte each plus rejections, far below the cap.
const HKDF_MAX_BYTES = 255 * 32;

/** A byte stream over HKDF-SHA-256(seed, salt = none, info), read like Go's hkdf.Reader. */
export class HkdfStream {
    private readonly bytes: Uint8Array;
    private offset = 0;

    constructor(seed: Uint8Array, info: string) {
        this.bytes = hkdf(sha256, seed, undefined, utf8ToBytes(info), HKDF_MAX_BYTES);
    }

    read(n: number): Uint8Array {
        if (this.offset + n > this.bytes.length) {
            throw new Error("HKDF stream exhausted");
        }
        const out = this.bytes.slice(this.offset, this.offset + n);
        this.offset += n;
        return out;
    }
}

/**
 * Go's `crypto/rand.Int(reader, max)` for a small max: read just enough bytes for
 * max-1, mask the excess high bits of the first byte, retry while the value is
 * >= max.
 */
export function goRandInt(stream: HkdfStream, max: number): number {
    if (!Number.isInteger(max) || max < 1) {
        throw new Error(`goRandInt: max must be a positive integer, got ${max}`);
    }
    if (max === 1) return 0;
    const bitLen = (max - 1).toString(2).length;
    const byteLen = Math.ceil(bitLen / 8);
    const topBits = bitLen % 8 === 0 ? 8 : bitLen % 8;
    const mask = (1 << topBits) - 1;
    for (;;) {
        const bytes = stream.read(byteLen);
        bytes[0] &= mask;
        let value = 0;
        for (const b of bytes) value = value * 256 + b;
        if (value < max) return value;
    }
}

/** The 52-card deck the chain deals from for `seed` (top card first). */
export function shuffleFromSeed(seed: Uint8Array): string[] {
    if (seed.byteLength < 1) {
        throw new Error("shuffleFromSeed: empty seed");
    }
    const deck = standardDeck();
    const stream = new HkdfStream(seed, DECK_DERIVATION_INFO);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = goRandInt(stream, i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

/** A real card mnemonic ("AS", "TD"); masked cards ("X", "??") are not. */
export function isRealCard(card: string): boolean {
    return /^[2-9TJQKA][CDHS]$/.test(card);
}

/** The chain's deck hash: SHA-256 of the cards joined with "-" (no top-of-deck brackets). */
export function deckHash(deck: string[]): string {
    return bytesToHex(sha256(utf8ToBytes(deck.join("-"))));
}

/** The chain's `SeedHash`: SHA-256 of the shuffle seed. */
export function seedHash(seed: Uint8Array): string {
    return bytesToHex(sha256(seed));
}
