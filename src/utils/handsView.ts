import { PlayerStatus } from "@block52/poker-vm-sdk";
import type { PlayerHand } from "../types/players";
import type { TranslationKey } from "../i18n";

/** The Hands page's filter chips. */
export type HandsFilter = "all" | "won" | "lost" | "folded";

export const HANDS_FILTERS: HandsFilter[] = ["all", "won", "lost", "folded"];

/** Each chip's label (i18n key). */
export const HANDS_FILTER_LABELS: Record<HandsFilter, TranslationKey> = {
    all: "hands.filterAll",
    won: "hands.filterWon",
    lost: "hands.filterLost",
    folded: "hands.filterFolded"
};

/** Which chip a hand falls under: a pot won, a fold, or anything else lost. */
const bucketOf = (hand: PlayerHand): Exclude<HandsFilter, "all"> => {
    if (hand.won_amount > 0) return "won";
    if (hand.status === PlayerStatus.FOLDED) return "folded";
    return "lost";
};

/** The hands a chip shows (from the hands loaded so far). */
export const filterHands = (hands: PlayerHand[], filter: HandsFilter): PlayerHand[] => (filter === "all" ? hands : hands.filter(h => bucketOf(h) === filter));

/** How many loaded hands fall under each chip. */
export const handsCounts = (hands: PlayerHand[]): Record<HandsFilter, number> => {
    const counts: Record<HandsFilter, number> = { all: hands.length, won: 0, lost: 0, folded: 0 };
    for (const h of hands) counts[bucketOf(h)] += 1;
    return counts;
};

/**
 * The hand with the biggest win among those loaded, counting only the hands
 * `counts` accepts (the page passes "cash table": chips and dollars don't compare).
 */
export const biggestWin = (hands: PlayerHand[], counts: (hand: PlayerHand) => boolean = () => true): PlayerHand | undefined =>
    hands.reduce<PlayerHand | undefined>((best, h) => (h.won_amount > 0 && counts(h) && (!best || h.won_amount > best.won_amount) ? h : best), undefined);

/** Share of loaded hands that won a pot, as a whole percent (0 with no hands). */
export const winShare = (hands: PlayerHand[]): number => (hands.length === 0 ? 0 : Math.round((handsCounts(hands).won / hands.length) * 100));

/** Where a hand's replay opens: its table at that hand. */
export const replayUrlFor = (hand: Pick<PlayerHand, "game_id" | "hand_number">): string => `/table/${hand.game_id}?hand=${hand.hand_number}`;
