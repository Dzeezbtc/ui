import { TexasHoldemRound } from "@block52/poker-vm-sdk";
import { isNullish } from "./guards";

/** The four betting streets, as Bad Beat's street tracker labels them. */
export const STREET_LABELS = ["Pre", "Flop", "Turn", "River"] as const;

const STREET_OF_ROUND: Partial<Record<string, number>> = {
    [TexasHoldemRound.PREFLOP]: 0,
    [TexasHoldemRound.FLOP]: 1,
    [TexasHoldemRound.TURN]: 2,
    [TexasHoldemRound.RIVER]: 3,
    [TexasHoldemRound.SHOWDOWN]: 3,
    [TexasHoldemRound.END]: 3
};

/**
 * Which street the hand is on (0 = pre-flop … 3 = river), or -1 before the
 * cards are dealt (antes, between hands, no game). Showdown and the hand's end
 * stay on the river.
 */
export const streetIndex = (round: string | undefined): number => (isNullish(round) ? -1 : STREET_OF_ROUND[round] ?? -1);
