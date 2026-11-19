import { hexToBytes } from "@noble/hashes/utils";
import vectors from "./__fixtures__/chainVectors.json";
import { buildVrfInput } from "./ecvrf";
import { HkdfStream, deckHash, goRandInt, seedHash, shuffleFromSeed, standardDeck } from "./deckShuffle";

// Decks produced by pokerchain's own types.Deck.ShuffleFromVRF.
describe("deckShuffle", () => {
    it("starts from the chain's standard order", () => {
        const deck = standardDeck();
        expect(deck).toHaveLength(52);
        expect(deck.slice(0, 3)).toEqual(["AC", "2C", "3C"]);
        expect(deck[13]).toBe("AD");
        expect(deck[51]).toBe("KS");
    });

    it.each(vectors.shuffle)("reproduces the chain's deck for seed $seed", v => {
        const deck = shuffleFromSeed(hexToBytes(v.seed));
        expect(deck.join("-")).toBe(v.deck);
        expect(deckHash(deck)).toBe(v.hash);
        expect(seedHash(hexToBytes(v.seed))).toBe(v.seedHash);
    });

    it("reproduces the chain-state fallback deck (hand 1 without a VRF seed)", () => {
        const f = vectors.fallback;
        const input = buildVrfInput(hexToBytes(f.appHash), f.gameId, Number(f.hand), new Uint8Array());
        expect(shuffleFromSeed(input).join("-")).toBe(f.deck);
    });

    it("matches real local-chain hands (board + shown cards at their dealt positions)", () => {
        // Hand 5 of a heads-up local table: seed from its new-hand tx, cards from its hand_completed event.
        const deck = shuffleFromSeed(hexToBytes("b982e48dd60c628ba3f746dc3a7be681ad012d5567acae9ca63c749009149b7d"));
        expect(deck.slice(9, 14)).toEqual(["6H", "5H", "AH", "JD", "7D"]);
        expect([deck[0], deck[2], deck[1], deck[3]]).toEqual(["8S", "8H", "2S", "6S"]);
    });

    it("rejects an empty seed", () => {
        expect(() => shuffleFromSeed(new Uint8Array())).toThrow();
    });

    it("goRandInt stays in range and handles max 1", () => {
        const stream = new HkdfStream(new Uint8Array([1]), "t");
        expect(goRandInt(stream, 1)).toBe(0);
        for (let max = 2; max <= 52; max++) {
            const n = goRandInt(stream, max);
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThan(max);
        }
        expect(() => goRandInt(stream, 0)).toThrow();
    });
});
