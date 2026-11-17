import { BLOCK52_STATIONS, radioStationsFor } from "./radioStations";

describe("table radio stations", () => {
    it("plays the Circle's own stations when it has some", () => {
        const mine = [{ name: "Ours", url: "https://radio.test/ours.mp3" }];
        expect(radioStationsFor(mine)).toBe(mine);
    });

    it("falls back to Block52's stations", () => {
        expect(radioStationsFor(undefined)).toBe(BLOCK52_STATIONS);
        expect(radioStationsFor(null)).toBe(BLOCK52_STATIONS);
        expect(radioStationsFor([])).toBe(BLOCK52_STATIONS);
    });

    it("only uses secure stream links", () => {
        BLOCK52_STATIONS.forEach(s => expect(s.url.startsWith("https://")).toBe(true));
    });
});
