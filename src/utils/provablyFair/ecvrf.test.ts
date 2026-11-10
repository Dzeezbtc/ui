import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import vectors from "./__fixtures__/chainVectors.json";
import mainnetSeeds from "./__fixtures__/mainnetDeckSeeds.json";
import { buildVrfInput, bytesToHeight, consensusAddressHex, heightToBytes, verifyVrf, vrfProofToOutput } from "./ecvrf";

// Vectors produced by pokerchain's own types.VRFProve / VRFVerify / BuildVRFInput.
describe("ecvrf", () => {
    it.each(vectors.vrf)("verifies the chain's proof and output (%#)", v => {
        const out = verifyVrf(hexToBytes(v.pk), hexToBytes(v.proof), hexToBytes(v.input));
        expect(out).not.toBeNull();
        expect(bytesToHex(out as Uint8Array)).toBe(v.output);
        expect(bytesToHex(vrfProofToOutput(hexToBytes(v.proof)) as Uint8Array)).toBe(v.output);
    });

    it("rejects a proof for a different input", () => {
        const v = vectors.vrf[0];
        const input = hexToBytes(v.input);
        input[input.length - 1] ^= 1;
        expect(verifyVrf(hexToBytes(v.pk), hexToBytes(v.proof), input)).toBeNull();
    });

    it("rejects a proof under another key", () => {
        expect(verifyVrf(hexToBytes(vectors.vrf[1].pk), hexToBytes(vectors.vrf[0].proof), hexToBytes(vectors.vrf[0].input))).toBeNull();
    });

    it("rejects a tampered proof and bad sizes", () => {
        const v = vectors.vrf[0];
        const proof = hexToBytes(v.proof);
        proof[40] ^= 1;
        expect(verifyVrf(hexToBytes(v.pk), proof, hexToBytes(v.input))).toBeNull();
        expect(verifyVrf(hexToBytes(v.pk), hexToBytes(v.proof).slice(1), hexToBytes(v.input))).toBeNull();
        expect(verifyVrf(hexToBytes(v.pk).slice(1), hexToBytes(v.proof), hexToBytes(v.input))).toBeNull();
    });

    it("builds the chain's VRF input bytes", () => {
        // vectors.vrf[i]: height bytes 00..0f2a(24+i), game "0xabc", hand i+2; the last carries a player seed.
        const seed = new Uint8Array(32);
        seed[5] = 9;
        const heights = [0x0f2a24, 0x0f2a25, 0x0f2a26];
        vectors.vrf.forEach((v, i) => {
            const input = buildVrfInput(heightToBytes(heights[i]), "0xabc", i + 2, i === 2 ? seed : new Uint8Array());
            expect(bytesToHex(input)).toBe(v.input);
        });
    });

    it("round-trips heights", () => {
        expect(bytesToHeight(heightToBytes(993828))).toBe(993828);
        expect(bytesToHeight(new Uint8Array(7))).toBeNull();
        expect(() => heightToBytes(-1)).toThrow();
    });

    it("derives CometBFT's consensus address from a key", () => {
        // node1 proposer key XCdKkErz… from a mainnet MsgRecordDeckSeeds; address checked against its block header.
        const pk = Uint8Array.from(atob("XCdKkErz4Tp+xamCSHoMVr1Tg0ekt4EMCG79Khi6r94="), c => c.charCodeAt(0));
        expect(consensusAddressHex(pk)).toMatch(/^[0-9A-F]{40}$/);
    });
});

describe("ecvrf against mainnet", () => {
    // Two MsgRecordDeckSeeds entries read from node1.block52.xyz (game 0x6261…e539 hands 1–2, game 0x… hands 68–69).
    const b64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    it.each(mainnetSeeds)("verifies the proposer's proof for hand $hand_number", s => {
        expect(bytesToHeight(b64(s.prev_block_hash))).toBe(Number(s.height));
        const input = buildVrfInput(b64(s.prev_block_hash), s.game_id, Number(s.hand_number), s.player_seed ? b64(s.player_seed) : new Uint8Array());
        const out = verifyVrf(b64(s.proposer_pubkey), b64(s.vrf_proof), input);
        expect(out).not.toBeNull();
        expect(bytesToHex(out as Uint8Array)).toBe(bytesToHex(b64(s.vrf_output)));
    });

    it("maps the hand-2 proposer key to its block's proposer_address", () => {
        // Block 993828 header: proposer_address D06E3FBF…35A2.
        const s = mainnetSeeds.find(x => x.hand_number === "2");
        expect(consensusAddressHex(b64((s as { proposer_pubkey: string }).proposer_pubkey))).toBe("D06E3FBFCB70D1564B4FECE7F928B9C17E2B35A2");
    });
});
