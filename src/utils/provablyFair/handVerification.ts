/**
 * Checks a hand's deal against the chain (ui#972), PlayBlind-style: four checks,
 * the cards as dealt, and every input needed to redo it by hand.
 *
 * What the four checks mean on Block52 today (before sealed dealing,
 * pokerchain#426):
 *   1. seed       — the seed the deck was shuffled from is on chain, in the
 *                   transaction that dealt the hand.
 *   2. randomness — who could choose that seed. A validator VRF seed is proven
 *                   here (proof, key, block proposer). A seed sent by the
 *                   player who started the hand is NOT independent randomness,
 *                   so this check says "limited", never "pass".
 *   3. anchor     — the seed was fixed in the same block that dealt the cards,
 *                   before anyone saw a card.
 *   4. deck       — the recomputed deck reproduces the board and every hole
 *                   card that was shown.
 * The green "Verified" result needs all four to pass, so a player-seeded hand
 * tops out at "limited", and says why.
 *
 * Nothing here runs while the hand is being played: the deck is only
 * recomputed once the hand has ended.
 */
import { bytesToHex } from "@noble/hashes/utils";
import { hasContent, hasElements, hasValue } from "../guards";
import { deckHash, isRealCard, seedHash, shuffleFromSeed } from "./deckShuffle";
import { buildVrfInput, bytesToHeight, consensusAddressHex, verifyVrf } from "./ecvrf";
import { BlockRecord, DeckSeedRecord, HandEndRecord, HandStartRecord, hexBytes } from "./handEvidence";
import { explorerBlockPath, explorerTxPath } from "./presentation";

export type CheckStatus = "pass" | "fail" | "pending" | "limited" | "unavailable" | "na";
export type CheckId = "seed" | "randomness" | "anchor" | "deck";
export type OverallStatus = "verified" | "limited" | "failed" | "pending" | "unavailable";

/** Where the deck's seed came from (mirrors pokerchain's new-hand / create-game paths). */
export type DeckSource = "player-seed" | "validator-vrf" | "chain-state";

export interface FairnessCheck {
    id: CheckId;
    title: string;
    status: CheckStatus;
    detail: string;
}

/** A seat that was dealt cards, as the table showed it at the end of the hand. */
export interface DealtSeat {
    seat: number;
    address: string;
    /** The hole cards in the public end state: real cards when shown, "X" when hidden. */
    holeCards: string[];
}

export interface DealtHand {
    seat: number | null;
    address: string;
    cards: string[];
    /** True when the table showed these cards; false when they come only from the recomputed deck. */
    shown: boolean;
}

export interface VerificationInput {
    label: string;
    value: string;
    /** Copy the value (hashes, seeds, addresses, tx hashes). */
    copy?: boolean;
    /** A link to an explorer or block record. */
    href?: string;
}

export interface HandEvidence {
    gameId: string;
    handNumber: number;
    /** True once `hand_completed` / `hand_ended` exists for the hand. */
    ended: boolean;
    start: HandStartRecord | null;
    startBlock: BlockRecord | null;
    /** Every VRF seed recorded for this hand, oldest first. */
    deckSeeds: DeckSeedRecord[];
    end: HandEndRecord | null;
    /** Seats with cards in the hand's end state, in the engine's player (deal) order; null when the state isn't available. */
    seats: DealtSeat[] | null;
    /** Hole cards per player for the variant (2 Hold'em, 4 PLO, …); null when unknown. */
    holeCardsPerPlayer: number | null;
}

export interface HandVerification {
    overall: OverallStatus;
    headline: string;
    checks: FairnessCheck[];
    source: DeckSource | null;
    /** The recomputed deck, top card first; null while the hand runs or when the seed is missing. */
    deck: string[] | null;
    board: string[];
    dealt: DealtHand[];
    /** Players in deal order, when the layout was confirmed against the board. */
    recipients: number | null;
    inputs: VerificationInput[];
}

export const CHECK_TITLES: Record<CheckId, string> = {
    seed: "The deck's seed is on chain",
    randomness: "Who could choose the seed",
    anchor: "Seed fixed before any card was dealt",
    deck: "Recomputed deck reproduces every card"
};

/** The largest table the engine seats. */
export const MAX_SEATS = 10;

/** The board starts after every hole card and the five cards the engine pre-deals: deck[holeCards·n + 5 …]. */
export const BOARD_OFFSET_AFTER_HOLE_CARDS = 5;

/** Short form of a long id for prose: first 10 and last 6 characters. */
export function shortId(value: string): string {
    return value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

/** The seed source the chain used for this hand, and the record behind it. */
export function pickDeckSource(ev: HandEvidence): { source: DeckSource; vrf: DeckSeedRecord | null } | null {
    const start = ev.start;
    if (!start) return null;
    if (start.kind === "new-hand" && hasValue(start.playerSeedHex)) {
        return { source: "player-seed", vrf: null };
    }
    // Keeper.ShuffleDeckForNewHand: the stored VRF seed as of this block (the
    // proposer records it before the tx runs), else the chain-state fallback.
    const vrf = [...ev.deckSeeds].reverse().find(s => s.height <= start.height) ?? null;
    return vrf ? { source: "validator-vrf", vrf } : { source: "chain-state", vrf: null };
}

/** The bytes the deck was shuffled from, per source. */
export function seedBytesFor(ev: HandEvidence, source: DeckSource, vrf: DeckSeedRecord | null): Uint8Array | null {
    const start = ev.start;
    if (!start) return null;
    switch (source) {
        case "player-seed":
            return hasValue(start.playerSeedHex) ? hexBytes(start.playerSeedHex) : null;
        case "validator-vrf":
            return vrf ? hexBytes(vrf.vrfOutputHex) : null;
        case "chain-state": {
            const appHash = start.appHashHex ?? ev.startBlock?.appHashHex ?? "";
            return hasContent(appHash) ? buildVrfInput(hexBytes(appHash), ev.gameId, ev.handNumber, new Uint8Array()) : null;
        }
    }
}

/**
 * How many players were dealt in, confirmed by where the board sits in the
 * deck. Tries the seat count first, then every table size, so a board that
 * fits no layout is a failure, not a guess.
 */
export function findRecipientCount(deck: string[], board: string[], holeCards: number, seatCount: number | null): number | null {
    if (!hasElements(board)) return seatCount;
    const fits = (n: number) => {
        const at = holeCards * n + BOARD_OFFSET_AFTER_HOLE_CARDS;
        return board.every((c, i) => deck[at + i] === c);
    };
    if (hasValue(seatCount) && fits(seatCount)) return seatCount;
    for (let n = 2; n <= MAX_SEATS; n++) if (fits(n)) return n;
    return null;
}

/** Hole cards of the r-th player dealt in (seat order): one card per pass round the table. */
export function holeCardsAt(deck: string[], r: number, n: number, holeCards: number): string[] {
    return Array.from({ length: holeCards }, (_, k) => deck[r + k * n]);
}

const sameCards = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

function compareDeal(
    deck: string[],
    ev: HandEvidence
): { status: CheckStatus; detail: string; dealt: DealtHand[]; recipients: number | null; board: string[] } {
    const board = ev.end?.board ?? [];
    const shownLoose = ev.end?.shownHoleCards ?? [];
    // Deal order is the engine's player order, as the state lists it (not seat order).
    const seats = ev.seats ? ev.seats.filter(s => hasElements(s.holeCards)) : null;
    const hc = ev.holeCardsPerPlayer ?? seats?.[0]?.holeCards.length ?? 2;
    const n = findRecipientCount(deck, board, hc, seats ? seats.length : null);
    if (!hasValue(n) && hasElements(board)) {
        return { status: "fail", detail: `The board ${board.join(" ")} is not where the recomputed deck puts it.`, dealt: [], recipients: null, board };
    }
    if (!hasValue(n)) {
        // No board and no seat map: the player count is unknown, so a shown card
        // can only be checked against the hole cards of the largest table.
        const holeSlice = new Set(deck.slice(0, hc * MAX_SEATS));
        const stray = shownLoose.filter(c => !holeSlice.has(c));
        if (hasElements(stray)) return { status: "fail", detail: `${stray.join(" ")} can't have been dealt from this deck.`, dealt: [], recipients: null, board };
        return {
            status: "na",
            detail: "No board was dealt and the seat map isn't available, so there is nothing to place the cards against.",
            dealt: [],
            recipients: null,
            board
        };
    }

    const dealt: DealtHand[] = [];
    const mismatches: string[] = [];
    let compared = board.length;
    if (seats && seats.length === n) {
        seats.forEach((s, r) => {
            const cards = holeCardsAt(deck, r, n, hc);
            const shown = s.holeCards.every(isRealCard);
            if (shown) {
                compared += s.holeCards.length;
                if (!sameCards(cards, s.holeCards)) mismatches.push(`seat ${s.seat} showed ${s.holeCards.join(" ")}, deck gives ${cards.join(" ")}`);
            }
            dealt.push({ seat: s.seat, address: s.address, cards, shown });
        });
        // hand_completed can list shown hands the snapshot still masks: match each to the hand the deck dealt.
        const covered = new Set(dealt.filter(d => d.shown).flatMap(d => d.cards));
        const extra = shownLoose.filter(c => !covered.has(c));
        for (let i = 0; i < extra.length; i += hc) {
            const group = extra.slice(i, i + hc);
            compared += group.length;
            const owner = dealt.find(d => !d.shown && sameCards(d.cards, group));
            if (owner) owner.shown = true;
            else mismatches.push(`${group.join(" ")} was shown but no player was dealt that hand`);
        }
    } else {
        // No seat map: every shown card must still be one of the dealt hole cards.
        const holeSlice = new Set(deck.slice(0, hc * n));
        for (const c of shownLoose) {
            compared++;
            if (!holeSlice.has(c)) mismatches.push(`${c} was shown but isn't among the dealt hole cards`);
        }
        for (let r = 0; r < n; r++) dealt.push({ seat: null, address: "", cards: holeCardsAt(deck, r, n, hc), shown: false });
    }

    if (hasElements(mismatches)) {
        return { status: "fail", detail: mismatches.join("; "), dealt, recipients: n, board };
    }
    const shownHands = dealt.filter(d => d.shown).length;
    if (compared === 0) {
        return {
            status: "na",
            detail: "Nobody showed cards and no board was dealt, so there is nothing public to compare. The recomputed deal is below.",
            dealt,
            recipients: n,
            board
        };
    }
    const parts = [hasElements(board) ? `the ${board.length}-card board` : null, shownHands > 0 ? `${shownHands} shown hand${shownHands === 1 ? "" : "s"}` : null].filter(hasValue);
    return {
        status: "pass",
        detail: `The recomputed deck reproduces ${parts.join(" and ")} exactly (${n} players dealt in, ${hc} cards each).`,
        dealt,
        recipients: n,
        board
    };
}

function randomnessCheck(ev: HandEvidence, source: DeckSource, vrf: DeckSeedRecord | null): { status: CheckStatus; detail: string } {
    const start = ev.start as HandStartRecord;
    switch (source) {
        case "player-seed":
            return {
                status: "limited",
                detail:
                    `The seed was chosen by the wallet that started the hand (${shortId(start.sender)}), and nothing it couldn't predict was mixed in. ` +
                    "Sealed dealing (pokerchain#426) replaces this with commitments from every player and the dealer."
            };
        case "chain-state":
            return {
                status: "limited",
                detail: "The seed comes from the block's app hash, table id and hand number. The block proposer can influence the app hash, so this isn't independent randomness."
            };
        case "validator-vrf": {
            const v = vrf as DeckSeedRecord;
            const input = buildVrfInput(hexBytes(v.heightBytesHex), v.gameId, v.handNumber, hexBytes(v.playerSeedHex));
            const out = verifyVrf(hexBytes(v.proposerPubkeyHex), hexBytes(v.vrfProofHex), input);
            if (!out) return { status: "fail", detail: "The VRF proof does not verify under the proposer's key." };
            if (bytesToHex(out) !== v.vrfOutputHex) return { status: "fail", detail: "The VRF proof verifies, but to a different output than the one recorded." };
            if (bytesToHeight(hexBytes(v.heightBytesHex)) !== v.height) {
                return { status: "fail", detail: `The proof is for block ${bytesToHeight(hexBytes(v.heightBytesHex))}, not block ${v.height} where it was recorded.` };
            }
            const block = ev.startBlock;
            if (block && block.height === v.height && consensusAddressHex(hexBytes(v.proposerPubkeyHex)) !== block.proposerAddressHex) {
                return { status: "fail", detail: `The proof's key isn't block ${v.height}'s proposer.` };
            }
            const proposerNote = block && block.height === v.height ? `, the proposer of block ${v.height}` : "";
            return {
                status: "pass",
                detail: `A validator VRF: the proof verifies under key ${shortId(v.proposerPubkeyHex)}${proposerNote}, over this table, hand and block. The validator couldn't pick a different output.`
            };
        }
    }
}

function overallOf(checks: FairnessCheck[], ended: boolean): OverallStatus {
    const has = (s: CheckStatus) => checks.some(c => c.status === s);
    if (has("fail")) return "failed";
    if (!ended) return "pending";
    if (has("unavailable")) return "unavailable";
    // Green needs every check to pass: a deck with nothing public to compare isn't a pass.
    if (has("limited") || has("na")) return "limited";
    return "verified";
}

/** The banner line; "limited" says which kind of limit applies. */
export function headlineFor(overall: OverallStatus, checks: FairnessCheck[]): string {
    if (overall === "limited" && !checks.some(c => c.status === "limited")) {
        return "The seed checks out. Nobody showed cards and no board was dealt, so there was nothing public to compare the deck with.";
    }
    return HEADLINES[overall];
}

const HEADLINES: Record<OverallStatus, string> = {
    verified: "Verified — this hand was dealt exactly as committed.",
    limited: "The cards match the seed on chain. The seed itself isn't independent randomness yet.",
    failed: "Verification failed — see the check marked in red.",
    pending: "Hand still running — the deck is recomputed once it ends.",
    unavailable: "Couldn't check this hand — some of its records aren't available."
};

const SOURCE_LABELS: Record<DeckSource, string> = {
    "player-seed": "Seed sent with the new-hand action (deck = ShuffleFromVRF(seed))",
    "validator-vrf": "Validator VRF (deck = ShuffleFromVRF(VRF output))",
    "chain-state": "Chain state (deck = ShuffleFromVRF(BuildVRFInput(app hash, table, hand)))"
};

/** Runs every check. Pure: the same evidence always gives the same result. */
export function verifyHand(ev: HandEvidence): HandVerification {
    const handLabel = `${ev.gameId}#${ev.handNumber}`;
    const baseInputs: VerificationInput[] = [
        { label: "Table id", value: ev.gameId, copy: true },
        { label: "Hand number", value: String(ev.handNumber) }
    ];
    const picked = pickDeckSource(ev);

    if (!ev.start || !picked) {
        const checks = (Object.keys(CHECK_TITLES) as CheckId[]).map(id => ({
            id,
            title: CHECK_TITLES[id],
            status: (ev.ended ? "unavailable" : "pending") as CheckStatus,
            detail: ev.ended
                ? `The transaction that dealt hand ${ev.handNumber} wasn't found. The node may have pruned it.`
                : "Waiting for the hand's records."
        }));
        return { overall: overallOf(checks, ev.ended), headline: headlineFor(overallOf(checks, ev.ended), checks), checks, source: null, deck: null, board: [], dealt: [], recipients: null, inputs: baseInputs };
    }

    const { source, vrf } = picked;
    const start = ev.start;
    const where = `block ${start.height.toLocaleString()}`;

    if (!ev.ended) {
        const pending = (id: CheckId, detail: string): FairnessCheck => ({ id, title: CHECK_TITLES[id], status: "pending", detail });
        const checks = [
            pending("seed", `The seed was recorded in ${where}. It is shown, and checked, when the hand ends.`),
            pending("randomness", "Checked when the hand ends."),
            pending("anchor", `The cards were dealt in ${where}; the timing is checked when the hand ends.`),
            pending("deck", "Cards can be recomputed once the hand is complete. Nothing is recomputed while cards are hidden.")
        ];
        return {
            overall: "pending",
            headline: HEADLINES.pending,
            checks,
            source,
            deck: null,
            board: [],
            dealt: [],
            recipients: null,
            inputs: [...baseInputs, { label: "Dealt in", value: `${where} · ${start.time}` }]
        };
    }

    const seed = seedBytesFor(ev, source, vrf);
    const checks: FairnessCheck[] = [];
    let deck: string[] | null = null;
    let deal: ReturnType<typeof compareDeal> | null = null;

    if (!seed || seed.length === 0) {
        checks.push({ id: "seed", title: CHECK_TITLES.seed, status: "unavailable", detail: "The seed for this hand couldn't be read from the chain." });
    } else {
        deck = shuffleFromSeed(seed);
        const seedDetail: Record<DeckSource, string> = {
            "player-seed": `The 32-byte seed is in the new-hand transaction ${shortId(start.txHash)} (${where}), sent by ${shortId(start.sender)}.`,
            "validator-vrf": `The block proposer recorded the VRF seed in ${where} (tx ${shortId(vrf?.txHash ?? "")}) before the hand was dealt.`,
            "chain-state": `Built from ${where}'s app hash, the table id and the hand number — all on chain.`
        };
        checks.push({ id: "seed", title: CHECK_TITLES.seed, status: "pass", detail: seedDetail[source] });
    }

    const r = randomnessCheck(ev, source, vrf);
    checks.push({ id: "randomness", title: CHECK_TITLES.randomness, ...r });

    const dealtIn = start.kind === "create-game" ? "the transaction that created the table" : "the new-hand transaction";
    const seedIn = source === "validator-vrf" && vrf ? `block ${vrf.height.toLocaleString()}` : "the same transaction";
    checks.push({
        id: "anchor",
        title: CHECK_TITLES.anchor,
        status: hasValue(seed) ? "pass" : "unavailable",
        detail: `The cards were dealt by ${dealtIn} (${where}${hasContent(start.time) ? `, ${start.time}` : ""}); the seed was fixed in ${seedIn}. No card existed before the seed did.`
    });

    if (deck) {
        deal = compareDeal(deck, ev);
        checks.push({ id: "deck", title: CHECK_TITLES.deck, status: deal.status, detail: deal.detail });
    } else {
        checks.push({ id: "deck", title: CHECK_TITLES.deck, status: "unavailable", detail: "No seed, so no deck to recompute." });
    }

    const overall = overallOf(checks, true);
    const inputs: VerificationInput[] = [
        { label: "Hand id", value: handLabel, copy: true },
        ...baseInputs,
        { label: "Deal source", value: SOURCE_LABELS[source] },
        { label: "Dealt in", value: `${where}${hasContent(start.time) ? ` · ${start.time}` : ""}`, href: explorerBlockPath(start.height) },
        { label: start.kind === "create-game" ? "Create-table tx" : "New-hand tx", value: start.txHash, copy: true, href: explorerTxPath(start.txHash) },
        { label: "Started by", value: start.sender, copy: true }
    ];
    if (source === "player-seed" && hasValue(start.playerSeedHex)) inputs.push({ label: "Seed", value: start.playerSeedHex, copy: true });
    if (source === "chain-state" && hasValue(seed)) inputs.push({ label: "Chain-state seed input", value: bytesToHex(seed), copy: true });
    if (vrf) {
        inputs.push(
            { label: "VRF seed tx", value: vrf.txHash, copy: true, href: explorerTxPath(vrf.txHash) },
            { label: "Proposer key (Ed25519)", value: vrf.proposerPubkeyHex, copy: true },
            { label: "Proposer address", value: consensusAddressHex(hexBytes(vrf.proposerPubkeyHex)), copy: true },
            { label: "VRF input height", value: String(bytesToHeight(hexBytes(vrf.heightBytesHex))) },
            { label: "VRF player seed", value: hasContent(vrf.playerSeedHex) ? vrf.playerSeedHex : "none", copy: hasContent(vrf.playerSeedHex) },
            { label: "VRF proof", value: vrf.vrfProofHex, copy: true },
            { label: "VRF output", value: vrf.vrfOutputHex, copy: true }
        );
    }
    if (seed && deck) {
        inputs.push(
            { label: "Seed hash (SHA-256)", value: seedHash(seed), copy: true },
            { label: "Deck hash (SHA-256)", value: deckHash(deck), copy: true },
            { label: "Recomputed deck", value: deck.join(" "), copy: true }
        );
    }
    if (ev.end) {
        inputs.push(
            {
                label: "Hand ended",
                value: hasContent(ev.end.txHash) ? `block ${ev.end.height.toLocaleString()} · tx ${shortId(ev.end.txHash)}` : `block ${ev.end.height.toLocaleString()}`,
                href: hasContent(ev.end.txHash) ? explorerTxPath(ev.end.txHash) : explorerBlockPath(ev.end.height)
            },
            { label: "Board", value: hasElements(ev.end.board) ? ev.end.board.join(" ") : "none" },
            { label: "Shown hole cards", value: hasElements(ev.end.shownHoleCards) ? ev.end.shownHoleCards.join(" ") : "none" }
        );
    }
    inputs.push({ label: "Algorithm", value: "HKDF-SHA-256(seed, info \"poker/deck/v1\") → Fisher–Yates with Go crypto/rand.Int rejection sampling; deal one card per player per pass, 5 pre-dealt, then the board" });

    return {
        overall,
        headline: headlineFor(overall, checks),
        checks,
        source,
        deck,
        board: deal?.board ?? ev.end?.board ?? [],
        dealt: deal?.dealt ?? [],
        recipients: deal?.recipients ?? null,
        inputs
    };
}

/** The downloadable record: everything needed to redo the checks offline. */
export function buildVerificationRecord(ev: HandEvidence, result: HandVerification, generatedAt: string): string {
    return JSON.stringify(
        {
            kind: "block52-hand-verification",
            version: 1,
            generatedAt,
            gameId: ev.gameId,
            handNumber: ev.handNumber,
            overall: result.overall,
            headline: result.headline,
            checks: result.checks,
            source: result.source,
            deck: result.deck,
            board: result.board,
            dealt: result.dealt,
            inputs: Object.fromEntries(result.inputs.map(i => [i.label, i.value])),
            evidence: ev
        },
        null,
        2
    );
}

/** File name for the downloaded record. */
export function verificationRecordFileName(gameId: string, handNumber: number): string {
    return `block52-hand-${gameId.slice(0, 10)}-${handNumber}.json`;
}
