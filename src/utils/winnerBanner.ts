import { describeWinningHand } from "./winningHandText";

/**
 * Builds the last-pot winner banner text (ui#848) from the resolved winners.
 * Pure + typed so it can be unit-tested apart from the component.
 */
export interface BannerWinner {
    seat: number;
    /** "0.03" for cash (USDC), "1,240 chips" for SNG/tournaments. */
    formattedAmount: string;
    handName?: string;
    /** The engine's hand description, e.g. "Full House, 8s over 7s". */
    description?: string;
    /** The winning five cards as mnemonics ("6D"), for a flush's suit. */
    cards?: string[];
    /** "showdown" shows the winning hand; "uncontested" just shows the amount. */
    winType?: string;
}

/** A cash amount arrives as a bare decimal ("0.03"); tournament amounts already say "chips". */
const isCashAmount = (formattedAmount: string): boolean => /^[\d,.]+$/.test(formattedAmount);

/** "$0.03" for cash, "1,240 chips" unchanged. */
function bannerAmount(formattedAmount: string): string {
    return isCashAmount(formattedAmount) ? `$${formattedAmount}` : formattedAmount;
}

/** "the $0.03 pot" for cash; "1,240 chips" for tournaments. */
function wonPhrase(formattedAmount: string): string {
    return isCashAmount(formattedAmount) ? `the ${bannerAmount(formattedAmount)} pot` : formattedAmount;
}

/**
 * "Seat 3 wins the $12.50 pot with Full House, Eights over Sevens", or for a
 * split pot "Split pot — Seat 3 $6.25 · Seat 5 $6.25". Null when there are no
 * winners.
 */
export function winnerBannerText(winners: BannerWinner[] | null | undefined): string | null {
    if (!winners || winners.length === 0) return null;
    if (winners.length === 1) {
        const w = winners[0];
        const engineHand = w.description || w.handName;
        const hand = w.winType === "showdown" && engineHand ? ` with ${describeWinningHand(engineHand, w.cards)}` : "";
        return `Seat ${w.seat} wins ${wonPhrase(w.formattedAmount)}${hand}`;
    }
    return `Split pot — ${winners.map(w => `Seat ${w.seat} ${bannerAmount(w.formattedAmount)}`).join(" · ")}`;
}
