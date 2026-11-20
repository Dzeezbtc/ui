import { safeLength } from "./guards";

/** One block as the explorer home shows it. */
export interface RecentBlock {
    height: number;
    /** Block time (ISO). */
    time: string;
    /** Transactions (bets, deals, payouts, transfers) in the block. */
    txs: number;
    /** The proposing validator, when the chain reports it. */
    proposer?: string;
    hash: string;
}

/** The shape of a block from the chain client (only the fields the explorer home reads). */
export interface ChainBlockLike {
    block_id: { hash: string };
    block: { header: { height: string; time: string; proposer_address?: string }; data: { txs?: string[] | null } };
}

/** A chain block as a RecentBlock. */
export const toRecentBlock = (b: ChainBlockLike): RecentBlock => ({
    height: Number(b.block.header.height),
    time: b.block.header.time,
    txs: safeLength(b.block.data.txs),
    proposer: b.block.header.proposer_address,
    hash: b.block_id.hash
});

/** Newest first, one entry per height. */
export const sortBlocks = (blocks: RecentBlock[]): RecentBlock[] => {
    const byHeight = new Map(blocks.map(b => [b.height, b]));
    return [...byHeight.values()].sort((a, b) => b.height - a.height);
};

/** Average seconds between consecutive blocks (newest-first list), or null with fewer than two blocks. */
export const avgBlockSeconds = (blocks: RecentBlock[]): number | null => {
    if (blocks.length < 2) return null;
    const newest = Date.parse(blocks[0].time);
    const oldest = Date.parse(blocks[blocks.length - 1].time);
    const span = blocks[0].height - blocks[blocks.length - 1].height;
    if (!Number.isFinite(newest) || !Number.isFinite(oldest) || span <= 0) return null;
    return (newest - oldest) / 1000 / span;
};

/** Transactions across the blocks. */
export const totalTxs = (blocks: RecentBlock[]): number => blocks.reduce((n, b) => n + b.txs, 0);

/**
 * The heartbeat strip: one bar per block, oldest to newest, its height (0.12 to 1)
 * following how busy the block was against the busiest one shown.
 */
export const heartbeatBars = (blocks: RecentBlock[], count: number): { height: number; level: number; txs: number }[] => {
    const shown = blocks.slice(0, count).reverse();
    const max = Math.max(1, ...shown.map(b => b.txs));
    return shown.map(b => ({ height: b.height, txs: b.txs, level: 0.12 + 0.88 * (b.txs / max) }));
};

/** How many validators are signing (not jailed) out of the bonded set. */
export const signingValidators = (validators: { jailed: boolean }[]): { live: number; total: number } => ({
    live: validators.filter(v => !v.jailed).length,
    total: validators.length
});
