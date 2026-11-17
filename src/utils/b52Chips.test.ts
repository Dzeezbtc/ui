import { CHIP_DENOMINATION_CONFIG } from "../config/chipSets";
import { B52_CHIP_COLORS, b52ChipColor, b52ChipLabel } from "./b52Chips";

describe("Block52 chips", () => {
    it("colours every denomination the table uses, each differently", () => {
        CHIP_DENOMINATION_CONFIG.forEach(d => expect(B52_CHIP_COLORS.has(d.value)).toBe(true));
        const names = [...B52_CHIP_COLORS.values()].map(c => c.name);
        expect(new Set(names).size).toBe(names.length);
    });

    it("keeps the colours approved on the sample sheet", () => {
        expect(b52ChipColor(1).name).toBe("Pink");
        expect(b52ChipColor(5).name).toBe("Purple");
        expect(b52ChipColor(25).name).toBe("Blue");
        expect(b52ChipColor(100).name).toBe("Cyan");
        expect(b52ChipColor(500).name).toBe("Mint");
        expect(b52ChipColor(1000).name).toBe("Sunset");
        expect(b52ChipColor(5000).name).toBe("Ruby");
        expect(b52ChipColor(25000).name).toBe("Gold");
    });

    it("falls back to the nearest smaller chip", () => {
        expect(b52ChipColor(7).name).toBe("Purple");
        expect(b52ChipColor(0.001).name).toBe("Coral");
    });

    it("labels cash in $ and ¢ and tournaments in points", () => {
        expect(b52ChipLabel(25, false)).toBe("$25");
        expect(b52ChipLabel(1000, false)).toBe("$1K");
        expect(b52ChipLabel(250000, false)).toBe("$250K");
        expect(b52ChipLabel(5000000, false)).toBe("$5M");
        expect(b52ChipLabel(0.5, false)).toBe("50¢");
        expect(b52ChipLabel(0.05, false)).toBe("5¢");
        expect(b52ChipLabel(25, true)).toBe("25");
        expect(b52ChipLabel(1000, true)).toBe("1K");
        expect(b52ChipLabel(1000000, true)).toBe("1M");
    });
});
