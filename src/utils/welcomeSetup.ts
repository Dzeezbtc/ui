/**
 * First-visit setup (Flagship look, Dzeezbtc/ui#100): who gets it, and the recovery-word check.
 */

import { hasContent, hasElements } from "./guards";

/** Set once a visitor has finished or skipped the setup; it is not offered again. */
export const WELCOME_SEEN_KEY = "b52.welcome.seen";

/** Set when the app makes a wallet on a first visit (block52/ui#377): that visitor gets the setup. */
export const WELCOME_PENDING_KEY = "b52.welcome.pending";

/** How many recovery words the check asks for. */
export const CHECK_WORDS = 3;

/**
 * Offer the setup to a visitor whose wallet the app has just made (pending), who is
 * not signed in with a club account and has not seen it. Players who already had a
 * wallet never get it.
 */
export const shouldOfferWelcome = (s: { pending: boolean; hasCustody: boolean; seen: boolean }): boolean => s.pending && !s.hasCustody && !s.seen;

/** A recovery phrase as its words. */
export const phraseWords = (phrase: string): string[] => phrase.trim().split(/\s+/).filter(hasContent);

/** `n` different word positions (0-based, ascending) out of `count`, chosen with `random`. */
export const pickCheckPositions = (count: number, n: number = CHECK_WORDS, random: () => number = Math.random): number[] => {
    const pool = Array.from({ length: count }, (_, i) => i);
    const picked: number[] = [];
    while (picked.length < Math.min(n, count)) {
        const at = Math.floor(random() * pool.length);
        picked.push(pool.splice(at, 1)[0]);
    }
    return picked.sort((a, b) => a - b);
};

/** Whether each answer matches the word at its position (ignoring case and spaces). */
export const wordsMatch = (words: string[], positions: number[], answers: string[]): boolean =>
    hasElements(positions) && positions.every((p, i) => (answers[i] ?? "").trim().toLowerCase() === (words[p] ?? "").toLowerCase());
