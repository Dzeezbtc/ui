/**
 * The table's blinds as one short label: "$10 / $20" for cash, "100 / 200"
 * (chips, no currency) for tournaments. The amounts arrive already formatted.
 */
export const blindsLabel = (smallBlind: string, bigBlind: string, isTournament: boolean): string =>
    isTournament ? `${smallBlind} / ${bigBlind}` : `$${smallBlind} / $${bigBlind}`;
