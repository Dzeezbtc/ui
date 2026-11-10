import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import mainnetSeeds from "./__fixtures__/mainnetDeckSeeds.json";
import { shuffleFromSeed } from "./deckShuffle";
import { base64ToHex } from "./handEvidence";
import {
    HandEvidence,
    buildVerificationRecord,
    findRecipientCount,
    holeCardsAt,
    pickDeckSource,
    shortId,
    verificationRecordFileName,
    verifyHand
} from "./handVerification";

const GAME = "0xba95ed78a7e5bc05423ee914a24e9f84311efa3654776bda237c06feae9135f4";
const SEED = "b982e48dd60c628ba3f746dc3a7be681ad012d5567acae9ca63c749009149b7d";

// Hand 5 of a heads-up local-chain table: seed from its new-hand tx, cards from hand_completed.
const seededHand = (over: Partial<HandEvidence> = {}): HandEvidence => ({
    gameId: GAME,
    handNumber: 5,
    ended: true,
    start: {
        height: 260780,
        txHash: "AB12CD34EF56AB12CD34EF56AB12CD34EF56AB12CD34EF56AB12CD34EF56AB12",
        time: "2026-11-01T02:00:00Z",
        kind: "new-hand",
        sender: "b521m6gnxt06yq9upq4xz5kd74wvw39x3xja6n24kw",
        playerSeedHex: SEED,
        data: `seed=${SEED}`,
        appHashHex: "21a1b7d47d7356d28709d564aebee6ce6da557a65b63ee91065b141a3bedca36"
    },
    startBlock: null,
    deckSeeds: [],
    end: { height: 260802, txHash: "FF", round: "end", board: ["6H", "5H", "AH", "JD", "7D"], shownHoleCards: ["8S", "8H", "2S", "6S"] },
    seats: [
        { seat: 1, address: "b521one", holeCards: ["8S", "8H"] },
        { seat: 2, address: "b521two", holeCards: ["2S", "6S"] }
    ],
    holeCardsPerPlayer: 2,
    ...over
});

describe("verifyHand — player-seeded hand", () => {
    it("passes seed, anchor and deck, and is 'limited' because the seed isn't independent", () => {
        const r = verifyHand(seededHand());
        expect(r.source).toBe("player-seed");
        expect(r.checks.map(c => [c.id, c.status])).toEqual([
            ["seed", "pass"],
            ["randomness", "limited"],
            ["anchor", "pass"],
            ["deck", "pass"]
        ]);
        expect(r.overall).toBe("limited");
        expect(r.recipients).toBe(2);
        expect(r.dealt).toEqual([
            { seat: 1, address: "b521one", cards: ["8S", "8H"], shown: true },
            { seat: 2, address: "b521two", cards: ["2S", "6S"], shown: true }
        ]);
        expect(r.inputs.find(i => i.label === "Seed")?.value).toBe(SEED);
        expect(r.deck).toHaveLength(52);
    });

    it("fails when a shown hand isn't what the deck dealt", () => {
        const r = verifyHand(seededHand({ seats: [{ seat: 1, address: "a", holeCards: ["8S", "AS"] }, { seat: 2, address: "b", holeCards: ["2S", "6S"] }] }));
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("fail");
        expect(r.overall).toBe("failed");
    });

    it("fails when the board isn't in the deck where it should be", () => {
        const r = verifyHand(seededHand({ end: { height: 1, txHash: "", round: "end", board: ["AS", "KS", "QS"], shownHoleCards: [] } }));
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("fail");
    });

    it("hides nothing: a mucked hand is recomputed but marked not shown", () => {
        const r = verifyHand(
            seededHand({
                seats: [{ seat: 1, address: "a", holeCards: ["8S", "8H"] }, { seat: 2, address: "b", holeCards: ["X", "X"] }],
                end: { height: 1, txHash: "", round: "end", board: ["6H", "5H", "AH", "JD", "7D"], shownHoleCards: ["8S", "8H"] }
            })
        );
        expect(r.dealt[1]).toEqual({ seat: 2, address: "b", cards: ["2S", "6S"], shown: false });
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("pass");
    });

    it("checks loose shown cards when the seat map is missing", () => {
        const r = verifyHand(seededHand({ seats: null }));
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("pass");
        expect(r.dealt.every(d => d.seat === null)).toBe(true);
        const bad = verifyHand(seededHand({ seats: null, end: { height: 1, txHash: "", round: "end", board: ["6H", "5H", "AH", "JD", "7D"], shownHoleCards: ["KC"] } }));
        expect(bad.checks.find(c => c.id === "deck")?.status).toBe("fail");
    });

    it("says there's nothing to compare on a pre-flop fold-out", () => {
        const r = verifyHand(seededHand({ end: { height: 1, txHash: "", round: "end", board: [], shownHoleCards: [] }, seats: [{ seat: 1, address: "a", holeCards: ["X", "X"] }, { seat: 2, address: "b", holeCards: ["X", "X"] }] }));
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("na");
        expect(r.overall).toBe("limited");
    });
});

describe("verifyHand — while the hand runs", () => {
    it("is pending and never recomputes the deck", () => {
        const r = verifyHand(seededHand({ ended: false, end: null }));
        expect(r.overall).toBe("pending");
        expect(r.deck).toBeNull();
        expect(r.dealt).toEqual([]);
        expect(r.checks.every(c => c.status === "pending")).toBe(true);
        expect(r.inputs.some(i => i.label === "Seed")).toBe(false);
    });
});

describe("verifyHand — validator VRF seed", () => {
    const s = mainnetSeeds.find(x => x.hand_number === "2") as (typeof mainnetSeeds)[number];
    const vrf = {
        height: Number(s.height),
        txHash: "VRFTX",
        gameId: s.game_id,
        handNumber: 2,
        vrfOutputHex: base64ToHex(s.vrf_output),
        vrfProofHex: base64ToHex(s.vrf_proof),
        proposerPubkeyHex: base64ToHex(s.proposer_pubkey),
        heightBytesHex: base64ToHex(s.prev_block_hash),
        playerSeedHex: ""
    };
    const deck = shuffleFromSeed(hexToBytes(vrf.vrfOutputHex));
    const ev = (over: Partial<HandEvidence> = {}): HandEvidence => ({
        gameId: s.game_id,
        handNumber: 2,
        ended: true,
        start: { height: vrf.height, txHash: "NH", time: "", kind: "new-hand", sender: "b521x", playerSeedHex: null, data: "", appHashHex: "00" },
        startBlock: { height: vrf.height, time: "", proposerAddressHex: "D06E3FBFCB70D1564B4FECE7F928B9C17E2B35A2", appHashHex: "00" },
        deckSeeds: [vrf],
        end: { height: vrf.height + 5, txHash: "E", round: "end", board: deck.slice(9, 14), shownHoleCards: [] },
        seats: null,
        holeCardsPerPlayer: 2,
        ...over
    });

    it("is not green when nobody showed cards and there was no board", () => {
        const r = verifyHand(ev({ end: { height: vrf.height + 5, txHash: "E", round: "end", board: [], shownHoleCards: [] } }));
        expect(r.checks.map(c => c.status)).toEqual(["pass", "pass", "pass", "na"]);
        expect(r.overall).toBe("limited");
        expect(r.headline).toMatch(/nothing public to compare/);
    });

    it("verifies the proof, the proposer and the deck — fully green", () => {
        const r = verifyHand(ev());
        expect(r.source).toBe("validator-vrf");
        expect(r.checks.map(c => c.status)).toEqual(["pass", "pass", "pass", "pass"]);
        expect(r.overall).toBe("verified");
    });

    it("fails when the key isn't the block's proposer", () => {
        const r = verifyHand(ev({ startBlock: { height: vrf.height, time: "", proposerAddressHex: "AA".repeat(20), appHashHex: "" } }));
        expect(r.checks.find(c => c.id === "randomness")?.status).toBe("fail");
        expect(r.overall).toBe("failed");
    });

    it("fails when the recorded output doesn't match the proof", () => {
        const wrong = { ...vrf, vrfOutputHex: bytesToHex(new Uint8Array(64).fill(1)) };
        const r = verifyHand(ev({ deckSeeds: [wrong] }));
        expect(r.checks.find(c => c.id === "randomness")?.status).toBe("fail");
    });

    it("ignores VRF seeds recorded after the hand was dealt", () => {
        const later = { ...vrf, height: vrf.height + 10 };
        expect(pickDeckSource(ev({ deckSeeds: [later] }))?.source).toBe("chain-state");
    });
});

describe("verifyHand — missing records", () => {
    it("is unavailable when the dealing tx can't be found", () => {
        const r = verifyHand(seededHand({ start: null }));
        expect(r.overall).toBe("unavailable");
        expect(r.checks.every(c => c.status === "unavailable")).toBe(true);
    });
});

describe("helpers", () => {
    it("findRecipientCount locates the board", () => {
        const deck = shuffleFromSeed(hexToBytes(SEED));
        expect(findRecipientCount(deck, deck.slice(9, 14), 2, null)).toBe(2);
        expect(findRecipientCount(deck, deck.slice(11, 14), 2, 3)).toBe(3);
        expect(findRecipientCount(deck, [], 2, 4)).toBe(4);
        expect(findRecipientCount(deck, ["ZZ"], 2, null)).toBeNull();
    });

    it("holeCardsAt deals one card per pass", () => {
        const deck = Array.from({ length: 52 }, (_, i) => String(i));
        expect(holeCardsAt(deck, 1, 3, 2)).toEqual(["1", "4"]);
        expect(holeCardsAt(deck, 0, 2, 4)).toEqual(["0", "2", "4", "6"]);
    });

    it("shortId keeps short values whole", () => {
        expect(shortId("abc")).toBe("abc");
        expect(shortId("0123456789abcdefghijklmnop")).toBe("0123456789…klmnop");
    });

    it("builds a downloadable record", () => {
        const ev = seededHand();
        const r = verifyHand(ev);
        const rec = JSON.parse(buildVerificationRecord(ev, r, "2026-11-10T00:00:00Z"));
        expect(rec.kind).toBe("block52-hand-verification");
        expect(rec.inputs.Seed).toBe(SEED);
        expect(rec.evidence.start.playerSeedHex).toBe(SEED);
        expect(verificationRecordFileName(GAME, 5)).toBe("block52-hand-0xba95ed78-5.json");
    });
});

describe("verifyHand — shown cards the end state still masks", () => {
    it("matches hand_completed's shown hands to the dealt hands", () => {
        const r = verifyHand(seededHand({ seats: [{ seat: 1, address: "a", holeCards: ["X", "X"] }, { seat: 2, address: "b", holeCards: ["X", "X"] }] }));
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("pass");
        expect(r.dealt.map(d => d.shown)).toEqual([true, true]);
    });

    it("fails a shown hand nobody was dealt", () => {
        const r = verifyHand(
            seededHand({
                seats: [{ seat: 1, address: "a", holeCards: ["X", "X"] }, { seat: 2, address: "b", holeCards: ["X", "X"] }],
                end: { height: 1, txHash: "", round: "end", board: ["6H", "5H", "AH", "JD", "7D"], shownHoleCards: ["8S", "2S"] }
            })
        );
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("fail");
    });

    it("deals in the engine's player order, not by seat number", () => {
        // Seat 2 listed first in the state is dealt first: it gets deck[0], deck[2].
        const r = verifyHand(seededHand({ seats: [{ seat: 2, address: "b", holeCards: ["8S", "8H"] }, { seat: 1, address: "a", holeCards: ["2S", "6S"] }] }));
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("pass");
        expect(r.dealt.map(d => d.seat)).toEqual([2, 1]);
    });
});
