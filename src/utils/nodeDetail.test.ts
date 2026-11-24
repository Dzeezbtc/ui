import { agoText, agoParts, findNode, pushPulse, readNodeSnapshot } from "./nodeDetail";

const net = (name: string, rest = `https://${name}.x`) => ({ name, rpc: "", rest, grpc: "", ws: "" });

describe("findNode", () => {
    const presets = [net("Block52"), net("Texas Hodl")];
    const found = [net("peer-a")];
    it("finds a preset, then a discovered node, ignoring case", () => {
        expect(findNode("texas hodl", presets, found, undefined)?.name).toBe("Texas Hodl");
        expect(findNode("PEER-A", presets, found, undefined)?.name).toBe("peer-a");
    });
    it("falls back to the node passed in the link", () => {
        expect(findNode("unknown", presets, found, net("linked"))?.name).toBe("linked");
        expect(findNode("unknown", presets, found, undefined)).toBeUndefined();
        expect(findNode(" ", presets, found, net("linked"))?.name).toBe("linked");
    });
});

describe("readNodeSnapshot", () => {
    it("reads height, time, chain, versions, moniker and catching up", () => {
        const s = readNodeSnapshot(
            { default_node_info: { network: "pokerchain", moniker: "node1", version: "0.38" }, application_version: { version: "v0.1.211", cosmos_sdk_version: "v0.50.9" } },
            { block: { header: { height: "1217700", time: "2026-11-24T04:51:10Z", chain_id: "pokerchain" } } },
            { syncing: true }
        );
        expect(s).toEqual({ height: 1217700, blockTime: "2026-11-24T04:51:10Z", chainId: "pokerchain", version: "v0.1.211", sdkVersion: "v0.50.9", moniker: "node1", catchingUp: true });
    });
    it("reads the sdk_block shape and copes with missing answers", () => {
        const s = readNodeSnapshot(null, { sdk_block: { header: { height: "7", chain_id: "c" } } }, undefined);
        expect(s.height).toBe(7);
        expect(s.chainId).toBe("c");
        expect(s.version).toBeNull();
        expect(s.catchingUp).toBe(false);
    });
    it("takes the chain from node info when there is no block", () => {
        const s = readNodeSnapshot({ default_node_info: { network: "pokerchain" } }, null, null);
        expect(s.height).toBeNull();
        expect(s.chainId).toBe("pokerchain");
    });
});

describe("pushPulse", () => {
    it("adds new heights and keeps the last few", () => {
        expect(pushPulse([1, 2], 3)).toEqual([1, 2, 3]);
        expect(pushPulse([1, 2, 3], 4, 3)).toEqual([2, 3, 4]);
    });
    it("ignores a repeat or a missing height", () => {
        const p = [1, 2];
        expect(pushPulse(p, 2)).toBe(p);
        expect(pushPulse(p, null)).toBe(p);
    });
});

describe("agoParts", () => {
    it.each([
        [1_000, "now", 0],
        [12_000, "s", 12],
        [180_000, "m", 3],
        [7_200_000, "h", 2],
        [4 * 86_400_000, "d", 4]
    ])("%i ms → %s %i", (ms, unit, n) => expect(agoParts(0, ms)).toEqual({ unit, n }));
});

describe("agoText", () => {
    it("words the time with the matching key", () => {
        const t = (key: string, v?: Record<string, string | number>) => `${key}:${v?.n}`;
        expect(agoText(0, 180_000, t)).toBe("node.agoM:3");
        expect(agoText(0, 0, t)).toBe("node.agoNow:0");
    });
});
