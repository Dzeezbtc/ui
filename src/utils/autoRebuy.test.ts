import { autoRebuyAmount, parseAutoRebuyMode, type AutoRebuyInput } from "./autoRebuy";

const $ = (dollars: number): bigint => BigInt(Math.round(dollars * 1_000_000));
const base: AutoRebuyInput = { mode: "half", stack: $(20), minBuyIn: $(40), maxBuyIn: $(200), wallet: $(1000), canTopUp: true };

describe("parseAutoRebuyMode", () => {
    it("reads the known modes", () => {
        expect(parseAutoRebuyMode("half")).toBe("half");
        expect(parseAutoRebuyMode("full")).toBe("full");
        expect(parseAutoRebuyMode("off")).toBe("off");
    });

    it("is off for anything else", () => {
        expect(parseAutoRebuyMode(null)).toBe("off");
        expect(parseAutoRebuyMode("on")).toBe("off");
    });
});

describe("autoRebuyAmount", () => {
    it("fills a low stack to the max buy-in", () => {
        expect(autoRebuyAmount(base)).toBe($(180));
    });

    it("does nothing when off or when top-up isn't allowed", () => {
        expect(autoRebuyAmount({ ...base, mode: "off" })).toBeNull();
        expect(autoRebuyAmount({ ...base, canTopUp: false })).toBeNull();
    });

    it("waits until the stack is under half in half mode", () => {
        expect(autoRebuyAmount({ ...base, stack: $(100) })).toBeNull();
        expect(autoRebuyAmount({ ...base, stack: $(99.99) })).toBe($(100.01));
    });

    it("keeps the stack full in full mode", () => {
        expect(autoRebuyAmount({ ...base, mode: "full", stack: $(195) })).toBe($(5));
        expect(autoRebuyAmount({ ...base, mode: "full", stack: $(200) })).toBeNull();
    });

    it("re-buys a busted stack", () => {
        expect(autoRebuyAmount({ ...base, stack: 0n })).toBe($(200));
    });

    it("is capped by the wallet and floored to cents", () => {
        expect(autoRebuyAmount({ ...base, wallet: 75_123_456n })).toBe($(75.12));
    });

    it("skips when the wallet can't reach the min buy-in", () => {
        expect(autoRebuyAmount({ ...base, stack: $(10), wallet: $(29.99) })).toBeNull();
        expect(autoRebuyAmount({ ...base, stack: $(10), wallet: $(30) })).toBe($(30));
    });

    it("skips an empty wallet or a table with no max buy-in", () => {
        expect(autoRebuyAmount({ ...base, wallet: 0n })).toBeNull();
        expect(autoRebuyAmount({ ...base, maxBuyIn: 0n })).toBeNull();
    });
});
