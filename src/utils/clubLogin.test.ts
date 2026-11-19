import { pubkeyToAddress } from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64 } from "@cosmjs/encoding";
import { handoffUrl, parseAllowList, readClubLoginRequest, signChallenge, signedBytes } from "./clubLogin";

const consoles = parseAllowList("http://localhost:5198, https://club.block52.xyz/");
const services = parseAllowList("http://localhost:8787,https://club-api.block52.xyz");
const q = (club: string, api: string, ret: string) => `?club=${club}&api=${encodeURIComponent(api)}&return=${encodeURIComponent(ret)}`;

// The standard BIP-39 test phrase: a throwaway wallet, never funded.
const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("club login hand-off", () => {
    it("reads a request from an allowed console and service", () => {
        const r = readClubLoginRequest(q("block52", "https://club-api.block52.xyz", "https://club.block52.xyz/login"), consoles, services);
        expect(r).toEqual({ ok: true, request: { club: "block52", api: "https://club-api.block52.xyz", returnTo: "https://club.block52.xyz/login" } });
    });

    it("blocks a lookalike console so a signature can't be collected", () => {
        const r = readClubLoginRequest(q("block52", "https://club-api.block52.xyz", "https://club.block52.xyz.evil.example/login"), consoles, services);
        expect(r.ok).toBe(false);
    });

    it("blocks an unknown club service", () => {
        expect(readClubLoginRequest(q("block52", "https://evil.example", "https://club.block52.xyz/login"), consoles, services).ok).toBe(false);
    });

    it("refuses plain http except on localhost, and bad club handles", () => {
        expect(readClubLoginRequest(q("block52", "http://club-api.block52.xyz", "https://club.block52.xyz/login"), consoles, parseAllowList("http://club-api.block52.xyz")).ok).toBe(false);
        expect(readClubLoginRequest(q("Block 52!", "http://localhost:8787", "http://localhost:5198/login"), consoles, services).ok).toBe(false);
    });

    it("signs the challenge so the club service's ADR-036 check accepts it", async () => {
        const text = "Block52 club console sign-in\nClub: @block52\nNonce: abc";
        const s = await signChallenge(MNEMONIC, text);
        expect(s.address).toMatch(/^b521[0-9a-z]{38}$/);
        // Exactly what the service does: the key must be this address, and must have signed this text.
        expect(pubkeyToAddress({ type: "tendermint/PubKeySecp256k1", value: s.pubkey }, "b52")).toBe(s.address);
        const ok = await Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(fromBase64(s.signature)), sha256(signedBytes(s.address, text)), fromBase64(s.pubkey));
        expect(ok).toBe(true);
        const wrongText = await Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(fromBase64(s.signature)), sha256(signedBytes(s.address, text + "!")), fromBase64(s.pubkey));
        expect(wrongText).toBe(false);
    });

    it("returns the signed parts in the URL fragment, which browsers never send to servers", () => {
        const url = handoffUrl("http://localhost:5198/login#old", { club: "block52", address: "b521x", nonce: "n", signature: "s+/=", pubkey: "p" });
        expect(url.startsWith("http://localhost:5198/login#")).toBe(true);
        expect(new URLSearchParams(url.split("#")[1]).get("signature")).toBe("s+/=");
    });
});
