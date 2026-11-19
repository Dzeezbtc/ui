/**
 * ECVRF-EDWARDS25519-SHA512-ELL2 verification (RFC 9381, suite 0x04), matching
 * the oasisprotocol `ecvrf.Verify` the chain uses (ui#972).
 *
 * A validator proves the randomness for a hand with its consensus key: the proof
 * shows the output could only come from that key and that input, so the
 * validator can't pick a different output after the fact. These checks run in
 * the browser, so a player doesn't have to trust the node they read from.
 */
import { ed25519, ed25519_hasher } from "@noble/curves/ed25519";
import { bytesToNumberLE, concatBytes, equalBytes } from "@noble/curves/abstract/utils";
import { sha256, sha512 } from "@noble/hashes/sha2";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";

export const VRF_PROOF_SIZE = 80;
export const VRF_OUTPUT_SIZE = 64;

const SUITE = 0x04;
const DST = concatBytes(utf8ToBytes("ECVRF_edwards25519_XMD:SHA-512_ELL2_NU_"), new Uint8Array([SUITE]));
const Point = ed25519.Point;
type EdPoint = InstanceType<typeof Point>;
const L = ed25519.CURVE.n;

/** The ECVRF input the chain signs for a hand (pokerchain `types.BuildVRFInput`). */
export function buildVrfInput(heightBytes: Uint8Array, gameId: string, handNumber: number, playerSeed: Uint8Array): Uint8Array {
    if (!Number.isSafeInteger(handNumber) || handNumber < 0) {
        throw new Error(`buildVrfInput: bad hand number ${handNumber}`);
    }
    const hand = new Uint8Array(8);
    new DataView(hand.buffer).setBigUint64(0, BigInt(handNumber));
    const bar = utf8ToBytes("|");
    return concatBytes(utf8ToBytes("poker/deck/v1"), bar, heightBytes, bar, utf8ToBytes(gameId), bar, hand, bar, playerSeed);
}

/** A block height as the chain feeds it to the VRF: 8 bytes, big-endian. */
export function heightToBytes(height: number): Uint8Array {
    if (!Number.isSafeInteger(height) || height < 0) {
        throw new Error(`heightToBytes: bad height ${height}`);
    }
    const out = new Uint8Array(8);
    new DataView(out.buffer).setBigUint64(0, BigInt(height));
    return out;
}

/** Big-endian 8-byte height back to a number (null if it isn't 8 bytes). */
export function bytesToHeight(bytes: Uint8Array): number | null {
    if (bytes.length !== 8) return null;
    return Number(new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0));
}

function decodePoint(bytes: Uint8Array): EdPoint | null {
    try {
        return Point.fromHex(bytes);
    } catch {
        return null;
    }
}

function pointBytes(p: EdPoint): Uint8Array {
    return p.toBytes();
}

function challenge(pk: Uint8Array, h: EdPoint, gamma: EdPoint, u: EdPoint, v: EdPoint): bigint {
    const digest = sha512(
        concatBytes(new Uint8Array([SUITE, 0x02]), pk, pointBytes(h), pointBytes(gamma), pointBytes(u), pointBytes(v), new Uint8Array([0x00]))
    );
    return bytesToNumberLE(digest.slice(0, 16));
}

function gammaToHash(gamma: EdPoint): Uint8Array {
    return sha512(concatBytes(new Uint8Array([SUITE, 0x03]), pointBytes(gamma.clearCofactor()), new Uint8Array([0x00])));
}

/** The 64-byte output a proof commits to (no key check; use verifyVrf to trust it). */
export function vrfProofToOutput(proof: Uint8Array): Uint8Array | null {
    if (proof.length !== VRF_PROOF_SIZE) return null;
    const gamma = decodePoint(proof.slice(0, 32));
    return gamma ? gammaToHash(gamma) : null;
}

/**
 * Verifies `proof` for `input` under the Ed25519 public key `pk`. Returns the
 * 64-byte VRF output when the proof is valid, null when it isn't.
 */
export function verifyVrf(pk: Uint8Array, proof: Uint8Array, input: Uint8Array): Uint8Array | null {
    if (pk.length !== 32 || proof.length !== VRF_PROOF_SIZE) return null;
    const y = decodePoint(pk);
    // RFC 8032 decoding must be canonical, and a small-order key proves nothing.
    if (!y || !equalBytes(pointBytes(y), pk) || y.isSmallOrder()) return null;
    const gamma = decodePoint(proof.slice(0, 32));
    if (!gamma) return null;
    const c = bytesToNumberLE(proof.slice(32, 48));
    const s = bytesToNumberLE(proof.slice(48, 80));
    if (s >= L) return null;

    const h = ed25519_hasher.encodeToCurve(concatBytes(pk, input), { DST }) as unknown as EdPoint;
    // U = s·B − c·Y, V = s·H − c·Γ
    const u = Point.BASE.multiplyUnsafe(s).subtract(y.multiplyUnsafe(c));
    const v = h.multiplyUnsafe(s).subtract(gamma.multiplyUnsafe(c));
    if (challenge(pk, h, gamma, u, v) !== c) return null;
    return gammaToHash(gamma);
}

/**
 * CometBFT's address for an Ed25519 consensus key: the first 20 bytes of
 * SHA-256(pubkey), upper-case hex. Matching it to a block header's
 * `proposer_address` shows the key belongs to the validator that made the block.
 */
export function consensusAddressHex(pk: Uint8Array): string {
    return bytesToHex(sha256(pk).slice(0, 20)).toUpperCase();
}
