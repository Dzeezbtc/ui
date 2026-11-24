/**
 * Auto re-buy (CoinPoker-style): between hands at a cash table, top the stack
 * back up to the table's maximum buy-in from the wallet when it has fallen
 * below the player's chosen line. All amounts are USDC micro-units.
 */

/** Off, top up when the stack is under half the max buy-in, or keep it full. */
export const AUTO_REBUY_MODES = ["off", "half", "full"] as const;
export type AutoRebuyMode = (typeof AUTO_REBUY_MODES)[number];

/** Share of the max buy-in (percent) the stack must fall under before a re-buy. */
const THRESHOLD_PERCENT: Record<AutoRebuyMode, bigint> = { off: 0n, half: 50n, full: 100n };

/** One cent in micro-units: the smallest top-up, and the step amounts are floored to. */
const CENT = 10_000n;

/** Whether a stored value is one of the modes. */
export const isAutoRebuyMode = (value: string | null): value is AutoRebuyMode => AUTO_REBUY_MODES.some(m => m === value);

/** A stored setting read back; anything unknown is "off" (a re-buy spends money, so never guess one on). */
export const parseAutoRebuyMode = (stored: string | null): AutoRebuyMode => (isAutoRebuyMode(stored) ? stored : "off");

export interface AutoRebuyInput {
    mode: AutoRebuyMode;
    /** The player's stack at the table. */
    stack: bigint;
    minBuyIn: bigint;
    maxBuyIn: bigint;
    /** USDC in the player's wallet. */
    wallet: bigint;
    /** The engine offers TOP_UP right now (seated, between hands, cash table). */
    canTopUp: boolean;
}

/**
 * How much to re-buy now, or null for no re-buy: the mode is off, top-up isn't
 * allowed, the stack isn't under the line, or the wallet can't cover the
 * smallest top-up that is legal (enough to reach the min buy-in when below it).
 * The amount fills to the max buy-in, capped by the wallet, floored to cents.
 */
export const autoRebuyAmount = ({ mode, stack, minBuyIn, maxBuyIn, wallet, canTopUp }: AutoRebuyInput): bigint | null => {
    if (mode === "off" || !canTopUp || maxBuyIn <= 0n) return null;
    if (stack * 100n >= maxBuyIn * THRESHOLD_PERCENT[mode]) return null;
    const room = maxBuyIn - stack;
    const amount = ((room < wallet ? room : wallet) / CENT) * CENT;
    const least = stack < minBuyIn ? minBuyIn - stack : CENT;
    return amount >= least && amount > 0n ? amount : null;
};
