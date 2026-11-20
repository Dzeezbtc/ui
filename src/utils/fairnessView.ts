import type { CardStats, ChiSquaredResult } from "../pages/explorer/types";

export type FairnessVerdict = "pass" | "marginal" | "fail";

/** One check's verdict from the indexer's result word (PASS / MARGINAL / FAIL). */
export const checkVerdict = (r: Pick<ChiSquaredResult, "result">): FairnessVerdict => {
    const w = r.result.toUpperCase();
    if (w === "PASS") return "pass";
    if (w === "MARGINAL") return "marginal";
    return "fail";
};

/** The page's overall verdict: the worst of the three checks. */
export const overallVerdict = (checks: Pick<ChiSquaredResult, "result">[]): FairnessVerdict => {
    const v = checks.map(checkVerdict);
    if (v.includes("fail")) return "fail";
    if (v.includes("marginal")) return "marginal";
    return "pass";
};

export const SUITS = ["s", "h", "d", "c"] as const;
export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;

export interface HeatCell {
    card: string;
    rank: string;
    suit: string;
    count: number;
    /** How far from a fair share, as a fraction of it (+0.1 = 10% more often). */
    off: number;
}

/** Every card's count against a fair share (total / 52), laid out suit by suit, ace to two. Missing cards count 0. */
export const heatGrid = (cards: CardStats[]): HeatCell[][] => {
    const total = cards.reduce((n, c) => n + c.total_appearances, 0);
    const fair = total / 52;
    const find = (rank: string, suit: string) => cards.find(c => c.rank.toUpperCase() === rank && c.suit.toLowerCase() === suit);
    return SUITS.map(suit =>
        RANKS.map(rank => {
            const count = find(rank, suit)?.total_appearances ?? 0;
            return { card: `${rank}${suit}`, rank, suit, count, off: fair > 0 ? (count - fair) / fair : 0 };
        })
    );
};

/** The biggest gap from a fair share across the grid, as a whole percent. */
export const maxOffPercent = (grid: HeatCell[][]): number => Math.round(Math.max(0, ...grid.flat().map(c => Math.abs(c.off))) * 100);

/** Total cards counted. */
export const cardsCounted = (cards: CardStats[]): number => cards.reduce((n, c) => n + c.total_appearances, 0);

/** A heat cell's colour: blue below a fair share, magenta above, pale near it (scaled to the biggest gap). */
export const heatColour = (off: number, scale: number): string => {
    const t = scale > 0 ? Math.max(-1, Math.min(1, off / scale)) : 0;
    const a = (0.12 + 0.6 * Math.abs(t)).toFixed(2);
    return t >= 0 ? `rgba(192, 38, 211, ${a})` : `rgba(59, 130, 246, ${a})`;
};
