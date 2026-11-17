/**
 * Pot odds for a call, as a whole percent: the share of the final pot you put
 * in, which is the equity you need for the call to break even. Null when
 * there is nothing to call (a check) or the amounts make no sense.
 */
export const potOddsPercent = (toCall: number, pot: number): number | null => {
    if (!(toCall > 0) || !(pot >= 0)) return null;
    return Math.round((toCall / (pot + toCall)) * 100);
};
