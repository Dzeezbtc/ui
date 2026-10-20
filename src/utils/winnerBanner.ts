/**
 * Builds the last-pot winner banner text (ui#848) from the resolved winners.
 * Pure + typed so it can be unit-tested apart from the component.
 */
export interface BannerWinner {
    seat: number;
    formattedAmount: string;
    handName?: string;
    /** "showdown" shows the winning hand; "uncontested" just shows the amount. */
    winType?: string;
}

/**
 * "Seat 3 wins $12.50 with a Full House", or for a split pot
 * "Split pot — Seat 3 $6.25 · Seat 5 $6.25". Null when there are no winners.
 */
export function winnerBannerText(winners: BannerWinner[] | null | undefined): string | null {
    if (!winners || winners.length === 0) return null;
    if (winners.length === 1) {
        const w = winners[0];
        const hand = w.winType === "showdown" && w.handName ? ` with ${w.handName}` : "";
        return `Seat ${w.seat} wins ${w.formattedAmount}${hand}`;
    }
    return `Split pot — ${winners.map(w => `Seat ${w.seat} ${w.formattedAmount}`).join(" · ")}`;
}
