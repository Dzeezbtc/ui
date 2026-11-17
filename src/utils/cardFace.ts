import { isString } from "./guards";

/** What a card face shows when it is drawn as markup (the flagship skin) instead of an image. */
export interface CardFace {
    /** "2"–"10", "J", "Q", "K", "A". */
    rank: string;
    suit: "♠" | "♥" | "♦" | "♣";
    /** Hearts and diamonds. */
    red: boolean;
}

const SUITS: Record<string, CardFace["suit"]> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANKS = "23456789TJQKA";

/**
 * The rank and suit of a card code ("AS", "TC", "qh"), or null for a hidden or
 * unknown card ("??", "XX", "", anything that is not a rank then a suit).
 */
export const cardFace = (code: unknown): CardFace | null => {
    if (!isString(code) || code.length !== 2) return null;
    const rank = code[0].toUpperCase();
    const suit = SUITS[code[1].toUpperCase()];
    if (!suit || !RANKS.includes(rank)) return null;
    return { rank: rank === "T" ? "10" : rank, suit, red: suit === "♥" || suit === "♦" };
};

/** The flagship avatar gradients, one per seat (wraps after six). */
const SEAT_GRADIENTS: readonly [string, string][] = [
    ["#C026D3", "#7C3AED"],
    ["#7C3AED", "#3B82F6"],
    ["#3B82F6", "#4DD0F8"],
    ["#F472B6", "#C026D3"],
    ["#34D399", "#3B82F6"],
    ["#FBBF24", "#F472B6"]
];

/** The flagship's round avatar for a seat with no picture: a two-colour gradient picked by seat number. */
export const seatGradient = (seat: number): string => {
    const [a, b] = SEAT_GRADIENTS[((Math.trunc(seat) % SEAT_GRADIENTS.length) + SEAT_GRADIENTS.length) % SEAT_GRADIENTS.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
};
