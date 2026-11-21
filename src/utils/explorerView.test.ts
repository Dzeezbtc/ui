import { avgBlockSeconds, heartbeatBars, signingValidators, sortBlocks, toRecentBlock, totalTxs, type RecentBlock } from "./explorerView";

const blk = (height: number, sec: number, txs: number): RecentBlock => ({ height, time: new Date(Date.UTC(2026, 10, 20, 0, 0, sec)).toISOString(), txs, proposer: "p", hash: `h${height}` });

describe("explorerView", () => {
    it("reads a chain block", () => {
        expect(
            toRecentBlock({ block_id: { hash: "AB" }, block: { header: { height: "42", time: "2026-11-20T00:00:00Z", proposer_address: "X" }, data: { txs: ["a", "b"] } } })
        ).toEqual({ height: 42, time: "2026-11-20T00:00:00Z", txs: 2, proposer: "X", hash: "AB" });
        expect(toRecentBlock({ block_id: { hash: "AB" }, block: { header: { height: "1", time: "t", proposer_address: "X" }, data: { txs: null } } }).txs).toBe(0);
    });

    it("sorts newest first without duplicates", () => {
        expect(sortBlocks([blk(1, 0, 0), blk(3, 4, 0), blk(2, 2, 0), blk(3, 4, 0)]).map(b => b.height)).toEqual([3, 2, 1]);
    });

    it("averages the block time", () => {
        expect(avgBlockSeconds([blk(10, 20, 0), blk(5, 10, 0)])).toBe(2);
        expect(avgBlockSeconds([blk(10, 20, 0)])).toBeNull();
    });

    it("totals transactions", () => {
        expect(totalTxs([blk(2, 2, 3), blk(1, 0, 4)])).toBe(7);
    });

    it("draws heartbeat bars oldest to newest, scaled to the busiest", () => {
        const bars = heartbeatBars([blk(3, 4, 4), blk(2, 2, 0), blk(1, 0, 2)], 2);
        expect(bars.map(b => b.height)).toEqual([2, 3]);
        expect(bars[1].level).toBe(1);
        expect(bars[0].level).toBeCloseTo(0.12);
    });

    it("counts signing validators", () => {
        expect(signingValidators([{ jailed: false }, { jailed: true }, { jailed: false }])).toEqual({ live: 2, total: 3 });
    });
});
