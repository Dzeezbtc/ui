/**
 * One cash blind as people say it: whole dollars drop the cents ("$10", not
 * "$10.00"); under a dollar keeps them ("$0.25"). Blinds don't use odd cents
 * once they reach dollars, so "$2.50" only shows if it is really there.
 */
export const cashBlind = (amount: string): string => {
    const value = Number(amount.split(",").join(""));
    if (!Number.isFinite(value)) return `$${amount}`;
    if (value >= 1 && Number.isInteger(value)) return `$${value.toLocaleString("en-US")}`;
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * The table's blinds as one short label: "$10 / $20" for cash, "100 / 200"
 * (chips, no currency) for tournaments. The amounts arrive already formatted.
 */
export const blindsLabel = (smallBlind: string, bigBlind: string, isTournament: boolean): string =>
    isTournament ? `${smallBlind} / ${bigBlind}` : `${cashBlind(smallBlind)} / ${cashBlind(bigBlind)}`;
