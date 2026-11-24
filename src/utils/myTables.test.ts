import { myTableItems } from "./myTables";
import type { GameWithFormat } from "./convertUtils";

const ID = "0x00000000000000000000000000000000000000000000000000000000cafe0001";
const game = {
    gameId: ID,
    minBuyIn: "200000000",
    maxBuyIn: "500000000",
    minPlayers: 2,
    maxPlayers: 6,
    currentPlayers: 4,
    gameFormat: "cash",
    gameVariant: "texas-holdem",
    smallBlind: "2000000",
    bigBlind: "5000000",
    status: "active"
} as unknown as GameWithFormat;

describe("myTableItems", () => {
    it("labels a listed table with its stakes, game and seats", () => {
        const [item] = myTableItems([{ id: ID }], [game]);
        expect(item.title).toBe("$2 / $5");
        expect(item.sub).toContain("6-max");
        expect(item.seats).toBe("4/6");
    });

    it("matches ids case-insensitively", () => {
        expect(myTableItems([{ id: ID.toUpperCase().replace("0X", "0x") }], [game])[0].seats).toBe("4/6");
    });

    it("falls back to the saved name, then the short id", () => {
        expect(myTableItems([{ id: "0xabc", name: "Friday game" }], [])[0]).toEqual({ id: "0xabc", title: "Friday game", sub: "", seats: null });
        expect(myTableItems([{ id: ID }], [])[0].title).not.toBe(ID);
    });

    it("keeps the open order and is empty with nothing open", () => {
        expect(myTableItems([{ id: "0x2" }, { id: "0x1" }], []).map(i => i.id)).toEqual(["0x2", "0x1"]);
        expect(myTableItems([], [game])).toEqual([]);
    });
});
