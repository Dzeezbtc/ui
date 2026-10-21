/**
 * Text for the floating win pill on a winning seat (ui#861).
 *
 * `formattedAmount` comes from useWinnerInfo: a bare decimal for cash ("0.04",
 * micro-USDC already converted) or "1,240 chips" for SNG/tournaments.
 *
 * @returns "+$0.04" for cash, "+1,240 chips" for chips, or null when there is
 *          nothing to show
 */
export function winAmountFloatText(formattedAmount: string | null | undefined): string | null {
    if (!formattedAmount) return null;
    const isCash = /^[\d,.]+$/.test(formattedAmount);
    return isCash ? `+$${formattedAmount}` : `+${formattedAmount}`;
}
