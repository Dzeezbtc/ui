/**
 * Spells out the engine's winning-hand description for the winner banner
 * (ui#848): "Full House, 8s over 7s" → "Full House, Eights over Sevens",
 * "Four 4s" → "Quad Fours", "Flush, 6 high" → "Diamond Flush, Six high".
 *
 * The engine's wording (FormatHandDescription) uses rank symbols and no suit;
 * the suit of a flush is read from the winning five cards.
 */

const RANK_WORDS: Record<string, [string, string]> = {
    A: ["Ace", "Aces"],
    K: ["King", "Kings"],
    Q: ["Queen", "Queens"],
    J: ["Jack", "Jacks"],
    "10": ["Ten", "Tens"],
    T: ["Ten", "Tens"],
    "9": ["Nine", "Nines"],
    "8": ["Eight", "Eights"],
    "7": ["Seven", "Sevens"],
    "6": ["Six", "Sixes"],
    "5": ["Five", "Fives"],
    "4": ["Four", "Fours"],
    "3": ["Three", "Threes"],
    "2": ["Two", "Twos"]
};

const SUIT_WORDS: Record<string, string> = { C: "Club", D: "Diamond", H: "Heart", S: "Spade" };

const one = (rank: string): string => RANK_WORDS[rank]?.[0] ?? rank;
const many = (rank: string): string => RANK_WORDS[rank]?.[1] ?? `${rank}s`;

/** The suit word ("Diamond") when all the winning cards share one suit, else null. */
export function flushSuit(cards: string[] | undefined): string | null {
    if (!cards || cards.length === 0) return null;
    const suits = new Set(cards.map(c => c.slice(-1).toUpperCase()));
    if (suits.size !== 1) return null;
    return SUIT_WORDS[[...suits][0]] ?? null;
}

/**
 * The winning hand in words, or the engine's text unchanged when it isn't a
 * shape we recognise (never drops information).
 *
 * @param description The engine's hand description (WinnerDTO.description)
 * @param cards The winning five cards as mnemonics ("6D"), used for flush suits
 */
export function describeWinningHand(description: string, cards?: string[]): string {
    const suit = flushSuit(cards);
    const suited = (hand: string) => (suit ? `${suit} ${hand}` : hand);
    let m: RegExpMatchArray | null;

    if (description === "Royal Flush") return suit ? `Royal Flush in ${suit}s` : description;
    if ((m = description.match(/^Straight Flush, (\w+) high$/))) return `${suited("Straight Flush")}, ${one(m[1])} high`;
    if ((m = description.match(/^Four (\w+)s$/))) return `Quad ${many(m[1])}`;
    if ((m = description.match(/^Full House, (\w+)s over (\w+)s$/))) return `Full House, ${many(m[1])} over ${many(m[2])}`;
    if ((m = description.match(/^Flush, (\w+) high$/))) return `${suited("Flush")}, ${one(m[1])} high`;
    if ((m = description.match(/^Straight, (\w+) high$/))) return `Straight, ${one(m[1])} high`;
    if ((m = description.match(/^Three (\w+)s$/))) return `Trip ${many(m[1])}`;
    if ((m = description.match(/^Two Pair, (\w+)s and (\w+)s$/))) return `Two Pair, ${many(m[1])} and ${many(m[2])}`;
    if ((m = description.match(/^Pair of (\w+)s$/))) return `Pair of ${many(m[1])}`;
    if ((m = description.match(/^(\w+) high$/))) return `${one(m[1])} high`;
    return description;
}
