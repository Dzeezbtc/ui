/**
 * Send limits for stickers and throwables (block52-chat#7). Tuned so a player
 * can fire off a quick pair, but nobody can keep it up long enough to make the
 * table want to switch the feature off.
 */
export interface RateRule {
    /** How many sends fit in the rolling window. */
    max: number;
    /** The rolling window, in ms. */
    windowMs: number;
    /** The shortest gap between two sends, in ms (stops double-taps). */
    minGapMs: number;
}

/** Stickers: 5 a minute, at least 1.5s apart. */
export const STICKER_RULE: RateRule = { max: 5, windowMs: 60_000, minGapMs: 1500 };
/** Throwables: 3 every 3 minutes, at least 1s apart (two in a row is fine). */
export const THROW_RULE: RateRule = { max: 3, windowMs: 180_000, minGapMs: 1000 };
/** Throwables at the same player: 2 every 3 minutes, so nobody gets pelted. */
export const THROW_SAME_TARGET_RULE: RateRule = { max: 2, windowMs: 180_000, minGapMs: 0 };

export class RateLimiter {
    private sent: number[] = [];
    constructor(private readonly rule: RateRule) {}

    private prune(now: number): void {
        this.sent = this.sent.filter(t => now - t < this.rule.windowMs);
    }

    /** Ms until the next send is allowed (0 = now). */
    waitMs(now: number = Date.now()): number {
        this.prune(now);
        const last = this.sent[this.sent.length - 1];
        const gap = last === undefined ? 0 : Math.max(0, this.rule.minGapMs - (now - last));
        const full = this.sent.length >= this.rule.max ? this.rule.windowMs - (now - this.sent[0]) : 0;
        return Math.max(gap, full);
    }

    /** Sends left in the current window. */
    remaining(now: number = Date.now()): number {
        this.prune(now);
        return Math.max(0, this.rule.max - this.sent.length);
    }

    /** Records a send if allowed; returns whether it was. */
    tryTake(now: number = Date.now()): boolean {
        if (this.waitMs(now) > 0) return false;
        this.sent.push(now);
        return true;
    }

    record(now: number): void {
        this.sent.push(now);
    }

    reset(): void {
        this.sent = [];
    }
}
