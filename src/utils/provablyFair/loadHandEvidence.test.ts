import type { TexasHoldemStateDTO } from "@block52/poker-vm-sdk";
import fx from "./__fixtures__/localChainHand5.json";
import { DECK_SEEDS_ACTION, EvidenceSources, dealtSeatsFrom, endFromState, handEvidenceQueries, loadHandEvidence, loadHandEvidenceFromNodes } from "./loadHandEvidence";
import { verifyHand } from "./handVerification";
import type { TxSearchReply } from "./handEvidence";

const GAME = "0xba95ed78a7e5bc05423ee914a24e9f84311efa3654776bda237c06feae9135f4";
const EMPTY: TxSearchReply = { txs: [], tx_responses: [] };

const state = (handNumber: number, players: Array<{ seat: number; address: string; holeCards?: string[] }>, communityCards: string[] = []) =>
    ({ handNumber, round: "end", communityCards, players }) as unknown as TexasHoldemStateDTO;

/** A fake node answering from the real local-chain replies in the fixture. */
function sources(over: Partial<Record<"completed" | "ended" | "started" | "created" | "seeds", TxSearchReply>> = {}, endState?: TexasHoldemStateDTO) {
    const q = handEvidenceQueries(GAME, 5);
    const calls: string[] = [];
    const src: EvidenceSources = {
        searchTxs: async query => {
            calls.push(query);
            if (query === q.completed) return over.completed ?? (fx.handCompleted as TxSearchReply);
            if (query === q.ended) return over.ended ?? EMPTY;
            if (query === q.started) return over.started ?? (fx.handStarted as TxSearchReply);
            if (query.startsWith("tx.height=")) return over.seeds ?? (fx.deckSeeds as TxSearchReply);
            return EMPTY;
        },
        block: async () => fx.block,
        publicStateAt: async () =>
            endState ??
            state(5, [
                { seat: 1, address: "b521one", holeCards: ["8S", "8H"] },
                { seat: 2, address: "b521two", holeCards: ["2S", "6S"] },
                { seat: 3, address: "b521out" }
            ])
    };
    return { src, calls };
}

describe("loadHandEvidence", () => {
    it("gathers a seeded hand from real chain replies, and it verifies", async () => {
        const { src, calls } = sources();
        const ev = await loadHandEvidence(src, GAME, 5);
        expect(ev.ended).toBe(true);
        expect(ev.start?.playerSeedHex).toBe("b982e48dd60c628ba3f746dc3a7be681ad012d5567acae9ca63c749009149b7d");
        expect(ev.start?.height).toBe(260780);
        expect(ev.startBlock?.proposerAddressHex).toBe("37BE25E7C33CFB07FEF90F9093BEF767F4547ADE");
        expect(ev.end?.board).toEqual(["6H", "5H", "AH", "JD", "7D"]);
        expect(ev.seats?.map(s => s.seat)).toEqual([1, 2]);
        // A player seed means the VRF records aren't needed.
        expect(calls.some(c => c.includes(DECK_SEEDS_ACTION))).toBe(false);
        const r = verifyHand(ev);
        expect(r.checks.find(c => c.id === "deck")?.status).toBe("pass");
        expect(r.overall).toBe("limited");
    });

    it("reports a running hand as not ended and skips the seat map", async () => {
        const { src } = sources({ completed: EMPTY, ended: EMPTY });
        const ev = await loadHandEvidence(src, GAME, 5);
        expect(ev.ended).toBe(false);
        expect(ev.seats).toBeNull();
        expect(verifyHand(ev).overall).toBe("pending");
    });

    it("falls back to hand_ended and the end state on chains without hand_completed", async () => {
        const ended: TxSearchReply = { txs: [{ body: { messages: [] } }], tx_responses: [{ height: "260802", txhash: "E" }] };
        const end = state(5, [{ seat: 1, address: "a", holeCards: ["8S", "8H"] }, { seat: 2, address: "b", holeCards: ["X", "X"] }], ["6H", "5H", "AH", "JD", "7D"]);
        const { src } = sources({ completed: EMPTY, ended }, end);
        const ev = await loadHandEvidence(src, GAME, 5);
        expect(ev.ended).toBe(true);
        expect(ev.end?.board).toEqual(["6H", "5H", "AH", "JD", "7D"]);
        expect(ev.end?.shownHoleCards).toEqual(["8S", "8H"]);
        expect(verifyHand(ev).checks.find(c => c.id === "deck")?.status).toBe("pass");
    });

    it("reads the VRF records when the deal carried no player seed", async () => {
        const noSeed = JSON.parse(JSON.stringify(fx.handStarted));
        noSeed.txs[0].body.messages[0].data = "";
        const { src, calls } = sources({ started: noSeed });
        const ev = await loadHandEvidence(src, GAME, 5);
        expect(calls.some(c => c.includes(DECK_SEEDS_ACTION))).toBe(true);
        expect(ev.deckSeeds).toHaveLength(1);
        expect(ev.deckSeeds[0].handNumber).toBe(5);
    });

    it("loads hand 1 from the create-table tx", async () => {
        const src: EvidenceSources = {
            searchTxs: async query => {
                if (query.startsWith("game_created")) return fx.gameCreated as TxSearchReply;
                if (query.startsWith("tx.height=")) return fx.deckSeedsHand1 as TxSearchReply;
                return EMPTY;
            },
            block: async () => fx.block,
            publicStateAt: async () => state(1, [])
        };
        const ev = await loadHandEvidence(src, GAME, 1);
        expect(ev.start?.kind).toBe("create-game");
        expect(ev.start?.height).toBe(260213);
        expect(ev.deckSeeds[0]?.handNumber).toBe(1);
    });

    it("keeps going when the end state was pruned", async () => {
        const { src } = sources();
        src.publicStateAt = async () => {
            throw new Error("version does not exist");
        };
        const ev = await loadHandEvidence(src, GAME, 5);
        expect(ev.seats).toBeNull();
        expect(verifyHand(ev).checks.find(c => c.id === "deck")?.status).toBe("pass");
    });

    it("rejects ids that would break the event query", () => {
        expect(() => handEvidenceQueries("0xabc' OR '1", 2)).toThrow();
        expect(() => handEvidenceQueries(GAME, 0)).toThrow();
    });
});

describe("state helpers", () => {
    it("dealtSeatsFrom keeps only seats with cards, in the state's (deal) order", () => {
        const s = state(1, [
            { seat: 3, address: "c", holeCards: ["X", "X"] },
            { seat: 1, address: "a", holeCards: ["AS", "KS"] },
            { seat: 2, address: "b", holeCards: [] }
        ]);
        expect(dealtSeatsFrom(s).map(x => x.seat)).toEqual([3, 1]);
    });

    it("endFromState drops masked cards", () => {
        const s = state(1, [{ seat: 1, address: "a", holeCards: ["AS", "KS"] }, { seat: 2, address: "b", holeCards: ["X", "X"] }], ["2C", "3C", "4C"]);
        expect(endFromState(s, 9)).toEqual({ height: 9, txHash: "", round: "end", board: ["2C", "3C", "4C"], shownHoleCards: ["AS", "KS"] });
    });
});

describe("loadHandEvidenceFromNodes", () => {
    it("uses the first node that has the dealing tx", async () => {
        const empty: EvidenceSources = { searchTxs: async () => EMPTY, block: async () => ({}), publicStateAt: async () => state(5, []) };
        const { src } = sources();
        const r = await loadHandEvidenceFromNodes([{ name: "Pruned", src: empty }, { name: "Block52", src }], GAME, 5);
        expect(r.node).toBe("Block52");
        expect(r.evidence.start?.height).toBe(260780);
    });

    it("skips a failing node", async () => {
        const broken: EvidenceSources = {
            searchTxs: async () => {
                throw new Error("timeout");
            },
            block: async () => ({}),
            publicStateAt: async () => state(5, [])
        };
        const { src } = sources();
        expect((await loadHandEvidenceFromNodes([{ name: "Down", src: broken }, { name: "Up", src }], GAME, 5)).node).toBe("Up");
    });

    it("returns the empty answer when no node has the hand, and throws when all fail", async () => {
        const empty: EvidenceSources = { searchTxs: async () => EMPTY, block: async () => ({}), publicStateAt: async () => state(5, []) };
        const r = await loadHandEvidenceFromNodes([{ name: "A", src: empty }], GAME, 5);
        expect(r.evidence.start).toBeNull();
        const broken: EvidenceSources = { ...empty, searchTxs: async () => Promise.reject(new Error("down")) };
        await expect(loadHandEvidenceFromNodes([{ name: "A", src: broken }], GAME, 5)).rejects.toThrow(/A: down/);
    });
});
