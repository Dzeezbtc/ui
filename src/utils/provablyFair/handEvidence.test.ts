import fx from "./__fixtures__/localChainHand5.json";
import { base64ToHex, hasTxs, hexBytes, parseBlock, parseDeckSeeds, parseGameCreated, parseHandEnd, parseHandStart, parsePlayerSeed } from "./handEvidence";
import type { TxSearchReply } from "./handEvidence";

const GAME = "0xba95ed78a7e5bc05423ee914a24e9f84311efa3654776bda237c06feae9135f4";

describe("handEvidence parsers (real local-chain replies)", () => {
    it("parsePlayerSeed reads, lower-cases and validates", () => {
        expect(parsePlayerSeed(`seed=${"AB".repeat(32)}`)).toBe("ab".repeat(32));
        expect(parsePlayerSeed("method=post-now")).toBeNull();
        expect(parsePlayerSeed(`x=1&seed=${"0".repeat(64)}&y=2`)).toBe("0".repeat(64));
        expect(() => parsePlayerSeed("seed=abc")).toThrow();
    });

    it("parseHandStart finds the new-hand and its seed", () => {
        const s = parseHandStart(fx.handStarted as TxSearchReply, GAME, 5);
        expect(s).toMatchObject({ height: 260780, kind: "new-hand", sender: "b521m6gnxt06yq9upq4xz5kd74wvw39x3xja6n24kw" });
        expect(s?.playerSeedHex).toBe("b982e48dd60c628ba3f746dc3a7be681ad012d5567acae9ca63c749009149b7d");
        expect(s?.appHashHex).toMatch(/^[0-9a-f]{64}$/);
        expect(parseHandStart(fx.handStarted as TxSearchReply, GAME, 6)).toBeNull();
        expect(parseHandStart({}, GAME, 5)).toBeNull();
    });

    it("parseHandStart prefers the earliest of duplicate new-hands", () => {
        const dup = JSON.parse(JSON.stringify(fx.handStarted));
        const later = JSON.parse(JSON.stringify(dup.tx_responses[0]));
        later.height = "260790";
        dup.tx_responses.unshift(later);
        dup.txs.unshift(JSON.parse(JSON.stringify(dup.txs[0])));
        expect(parseHandStart(dup, GAME, 5)?.height).toBe(260780);
    });

    it("parseHandEnd reads board and shown cards", () => {
        expect(parseHandEnd(fx.handCompleted as TxSearchReply, GAME, 5)).toMatchObject({
            height: 260802,
            board: ["6H", "5H", "AH", "JD", "7D"],
            shownHoleCards: ["8S", "8H", "2S", "6S"]
        });
        expect(parseHandEnd(fx.handCompleted as TxSearchReply, GAME, 4)).toBeNull();
    });

    it("parseGameCreated reads the create-table tx", () => {
        expect(parseGameCreated(fx.gameCreated as TxSearchReply, GAME)).toMatchObject({ height: 260213, kind: "create-game", playerSeedHex: null });
        expect(parseGameCreated(fx.gameCreated as TxSearchReply, "0xother")).toBeNull();
    });

    it("parseDeckSeeds decodes the VRF record", () => {
        const [s] = parseDeckSeeds(fx.deckSeeds as TxSearchReply, GAME, 5);
        expect(s.height).toBe(260780);
        expect(s.vrfProofHex).toHaveLength(160);
        expect(s.vrfOutputHex).toHaveLength(128);
        expect(s.proposerPubkeyHex).toHaveLength(64);
        expect(parseDeckSeeds(fx.deckSeeds as TxSearchReply, GAME, 4)).toEqual([]);
    });

    it("parseBlock reads the header", () => {
        expect(parseBlock(fx.block)).toMatchObject({ height: 260780, proposerAddressHex: "37BE25E7C33CFB07FEF90F9093BEF767F4547ADE" });
        expect(parseBlock({})).toBeNull();
    });

    it("byte helpers", () => {
        expect(base64ToHex("AAAAAAAPKiQ=")).toBe("00000000000f2a24");
        expect(base64ToHex(null)).toBe("");
        expect(hexBytes("")).toHaveLength(0);
        expect(hasTxs(fx.handStarted as TxSearchReply)).toBe(true);
        expect(hasTxs({})).toBe(false);
    });
});
