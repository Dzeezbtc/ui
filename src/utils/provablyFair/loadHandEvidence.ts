/**
 * Gathers a hand's fairness evidence from one node (ui#972). The node calls are
 * injected, so this runs the same in the hook and in tests.
 *
 * Order: has the hand ended (hand_completed, else hand_ended)? → the tx that
 * dealt it (hand_started, or game_created for hand 1) → that block's header →
 * the validator VRF seeds in that block (only when the deal didn't carry a
 * player seed) → the table at the hand's end, for the seat map. Nothing about
 * the deck is fetched or derived here; verifyHand decides what to compute.
 */
import type { TexasHoldemStateDTO } from "@block52/poker-vm-sdk";
import { hasElements, hasValue } from "../guards";
import { snapshotHeights } from "../handReplay";
import { isRealCard } from "./deckShuffle";
import {
    BlockRecord,
    DeckSeedRecord,
    HandEndRecord,
    HandStartRecord,
    TxSearchReply,
    hasTxs,
    parseBlock,
    parseDeckSeeds,
    parseGameCreated,
    parseHandEnd,
    parseHandStart
} from "./handEvidence";
import type { DealtSeat, HandEvidence } from "./handVerification";

export const DECK_SEEDS_ACTION = "/pokerchain.poker.v1.MsgRecordDeckSeeds";

export interface EvidenceSources {
    /** REST tx search (decoded txs + events). */
    searchTxs: (query: string, limit: number) => Promise<TxSearchReply>;
    /** CometBFT RPC `/block?height=`. */
    block: (height: number) => Promise<unknown>;
    /** The public (masked) table state at a height. */
    publicStateAt: (height: number) => Promise<TexasHoldemStateDTO>;
}

function checkIds(gameId: string, handNumber: number): void {
    if (!/^[A-Za-z0-9]+$/.test(gameId)) throw new Error(`Invalid table id: ${gameId}`);
    if (!Number.isInteger(handNumber) || handNumber < 1) throw new Error(`Invalid hand number: ${handNumber}`);
}

/** Event queries for one hand. */
export function handEvidenceQueries(gameId: string, handNumber: number) {
    checkIds(gameId, handNumber);
    const ev = (type: string) => `${type}.game_id='${gameId}' AND ${type}.hand_number='${handNumber}'`;
    return {
        completed: ev("hand_completed"),
        ended: ev("hand_ended"),
        started: ev("hand_started"),
        created: `game_created.game_id='${gameId}'`,
        deckSeedsAt: (height: number) => `tx.height=${height} AND message.action='${DECK_SEEDS_ACTION}'`
    };
}

/**
 * The seats dealt in, from a public state snapshot of the hand, in the order
 * the state lists them. That is the engine's own player order (DealRecipients
 * walks it), which follows when players joined, not seat numbers.
 */
export function dealtSeatsFrom(state: TexasHoldemStateDTO): DealtSeat[] {
    return state.players.filter(p => hasElements(p.holeCards)).map(p => ({ seat: p.seat, address: p.address, holeCards: [...(p.holeCards ?? [])] }));
}

/** The board and shown cards from an end-of-hand state, for chains without hand_completed. */
export function endFromState(state: TexasHoldemStateDTO, height: number): HandEndRecord {
    return {
        height,
        txHash: "",
        round: state.round,
        board: state.communityCards.filter(isRealCard),
        shownHoleCards: state.players.flatMap(p => p.holeCards ?? []).filter(isRealCard)
    };
}

async function findEndState(src: EvidenceSources, handNumber: number, endHeight: number): Promise<{ state: TexasHoldemStateDTO; height: number } | null> {
    for (const height of snapshotHeights(endHeight)) {
        try {
            const state = await src.publicStateAt(height);
            if (state.handNumber === handNumber) return { state, height };
        } catch (err) {
            console.warn(`[provablyFair] table state at ${height} unavailable:`, err);
        }
    }
    return null;
}

/**
 * Everything verifyHand needs for (gameId, handNumber). Throws only on a network
 * failure; missing records come back as nulls for verifyHand to report.
 */
export async function loadHandEvidence(src: EvidenceSources, gameId: string, handNumber: number): Promise<HandEvidence> {
    const q = handEvidenceQueries(gameId, handNumber);

    const end: HandEndRecord | null = parseHandEnd(await src.searchTxs(q.completed, 5), gameId, handNumber);
    let endHeight = end?.height ?? null;
    if (!hasValue(endHeight)) {
        // Chains before hand_completed (pokerchain#415) still emit hand_ended.
        const endedReply = await src.searchTxs(q.ended, 1);
        endHeight = hasTxs(endedReply) ? Number(endedReply.tx_responses?.[0]?.height) : null;
    }
    const ended = hasValue(endHeight);

    const start: HandStartRecord | null =
        handNumber === 1 ? parseGameCreated(await src.searchTxs(q.created, 1), gameId) : parseHandStart(await src.searchTxs(q.started, 5), gameId, handNumber);

    let startBlock: BlockRecord | null = null;
    let deckSeeds: DeckSeedRecord[] = [];
    if (start) {
        startBlock = parseBlock(await src.block(start.height));
        if (!hasValue(start.playerSeedHex)) {
            deckSeeds = parseDeckSeeds(await src.searchTxs(q.deckSeedsAt(start.height), 10), gameId, handNumber);
        }
    }

    const snapshot = hasValue(endHeight) ? await findEndState(src, handNumber, endHeight) : null;
    const seats = snapshot ? dealtSeatsFrom(snapshot.state) : null;

    return {
        gameId,
        handNumber,
        ended,
        start,
        startBlock,
        deckSeeds,
        end: end ?? (snapshot ? endFromState(snapshot.state, snapshot.height) : null),
        seats,
        holeCardsPerPlayer: null
    };
}

/**
 * Tries each node in turn (the current one, then the official one that keeps
 * history) and returns the first that has the hand's dealing tx. When none has
 * it, returns the first answer that came back; throws only when every node
 * failed.
 */
export async function loadHandEvidenceFromNodes(nodes: Array<{ name: string; src: EvidenceSources }>, gameId: string, handNumber: number): Promise<{ node: string; evidence: HandEvidence }> {
    let fallback: { node: string; evidence: HandEvidence } | null = null;
    const failures: string[] = [];
    for (const { name, src } of nodes) {
        try {
            const evidence = await loadHandEvidence(src, gameId, handNumber);
            if (evidence.start) return { node: name, evidence };
            fallback = fallback ?? { node: name, evidence };
        } catch (err) {
            failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    if (fallback) return fallback;
    throw new Error(`Couldn't read hand ${handNumber} from any node (${failures.join("; ")}).`);
}
