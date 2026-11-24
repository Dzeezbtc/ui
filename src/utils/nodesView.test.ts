import { heightLabel, hostOf, isValidatorName, publicNodes, ringLayout, syncState, tipHeight } from "./nodesView";

const net = (name: string) => ({ name, rpc: "", rest: `https://${name}.example`, grpc: "", ws: "" });

describe("publicNodes", () => {
    it("leaves out the local chain and the stub", () => {
        expect(publicNodes([net("Block52"), net("Localhost"), net("Texas Hodl"), net("Stub")]).map(n => n.name)).toEqual(["Block52", "Texas Hodl"]);
    });
});

describe("isValidatorName", () => {
    it("matches loosely across spaces, dashes and a validator prefix", () => {
        expect(isValidatorName("Texas Hodl", ["validator-texashodl"])).toBe(true);
        expect(isValidatorName("Block52", ["block52"])).toBe(true);
    });
    it("does not match other names or empty input", () => {
        expect(isValidatorName("Miller Services", ["validator-texashodl"])).toBe(false);
        expect(isValidatorName("", ["x"])).toBe(false);
        expect(isValidatorName("Block52", [])).toBe(false);
        expect(isValidatorName("Validator", ["validator-x"])).toBe(false);
    });
});

describe("syncState + tipHeight", () => {
    it("is in sync within a few blocks of the tip", () => {
        expect(syncState(100, 102)).toEqual({ kind: "synced" });
        expect(syncState(100, 100)).toEqual({ kind: "synced" });
    });
    it("counts blocks behind past the tolerance", () => {
        expect(syncState(90, 100)).toEqual({ kind: "behind", blocks: 10 });
    });
    it("is unknown without a height", () => {
        expect(syncState(null, 100)).toEqual({ kind: "unknown" });
        expect(syncState(100, null)).toEqual({ kind: "unknown" });
    });
    it("takes the highest known height", () => {
        expect(tipHeight([5, null, 9, 7])).toBe(9);
        expect(tipHeight([null])).toBeNull();
        expect(tipHeight([])).toBeNull();
    });
});

describe("ringLayout", () => {
    it("starts at the top and spaces points evenly", () => {
        const pts = ringLayout(4, 100, 100, 50);
        expect(pts).toEqual([
            { x: 100, y: 50 },
            { x: 150, y: 100 },
            { x: 100, y: 150 },
            { x: 50, y: 100 }
        ]);
    });
    it("handles none", () => {
        expect(ringLayout(0, 0, 0, 1)).toEqual([]);
    });
});

describe("hostOf + heightLabel", () => {
    it("takes the host from a URL", () => {
        expect(hostOf("https://node1.block52.xyz/rpc/")).toBe("node1.block52.xyz");
        expect(hostOf("not a url")).toBe("not a url");
    });
    it("formats heights with a hash and commas", () => {
        expect(heightLabel(1234567)).toBe("#1,234,567");
    });
});
