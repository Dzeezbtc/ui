import { PLAYER_SORTS, orbHue, orbLetters, plainUsd, shortCount, signedUsd } from "./playersView";

describe("playersView", () => {
    it("gives each address a stable hue", () => {
        const h = orbHue("b521sjny6zd9ys87xtw4x5tvm4emqe4ep8ll24d07n");
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThan(360);
        expect(orbHue("b521sjny6zd9ys87xtw4x5tvm4emqe4ep8ll24d07n")).toBe(h);
        expect(orbHue("b521abc")).not.toBe(orbHue("b521abd"));
    });

    it("takes two letters after the prefix", () => {
        expect(orbLetters("b521sjny6zd9")).toBe("SJ");
    });

    it("signs dollars", () => {
        expect(signedUsd(3724200)).toBe("+$3.72");
        expect(signedUsd(-1500000)).toBe("-$1.50");
        expect(signedUsd(0)).toBe("$0.00");
        expect(plainUsd(1234500000)).toBe("$1,234.50");
    });

    it("shortens counts", () => {
        expect(shortCount(950)).toBe("950");
        expect(shortCount(1240)).toBe("1.2k");
        expect(shortCount(14200)).toBe("14k");
    });

    it("lists the sorts", () => {
        expect(PLAYER_SORTS.map(s => s.field)).toEqual(["net_profit", "total_hands", "vip_points", "total_rake_contributed"]);
    });
});
