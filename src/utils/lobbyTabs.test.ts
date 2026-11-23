import { BettingLimit, GameFormat, GameVariant } from "@block52/poker-vm-sdk";
import type { GameWithFormat } from "./convertUtils";
import { activeGameType, activeTab, activeTabs, toggleTab, gameTypeOf, gameTypesIn, gamesFor, isLobbyTab, shortGameType, tabCounts, tabOf } from "./lobbyTabs";

const cash = (id: string, seated: number, extra: Partial<GameWithFormat> = {}): GameWithFormat => ({
    gameId: id,
    minBuyIn: "400000",
    maxBuyIn: "2000000",
    minPlayers: 2,
    maxPlayers: 9,
    currentPlayers: seated,
    gameFormat: GameFormat.CASH,
    gameVariant: GameVariant.TEXAS_HOLDEM,
    smallBlind: "10000",
    bigBlind: "20000",
    status: "waiting",
    ...extra
});
const plo = (id: string, seated: number) => cash(id, seated, { gameVariant: GameVariant.OMAHA, bettingLimit: BettingLimit.POT_LIMIT });
const sng = (id: string, seated: number) => cash(id, seated, { gameFormat: GameFormat.SIT_AND_GO, minBuyIn: "1000000", maxBuyIn: "1000000" });
const mtt = (id: string, seated: number) => cash(id, seated, { gameFormat: GameFormat.TOURNAMENT, minBuyIn: "1000000", maxBuyIn: "1000000" });

const games = [cash("h1", 3), cash("h2", 0), plo("o1", 5), sng("s1", 2), mtt("t1", 4), mtt("t2", 0)];

describe("lobbyTabs", () => {
    it("puts each table in its tab and counts them", () => {
        expect(tabOf(cash("a", 0))).toBe("cash");
        expect(tabOf(sng("a", 0))).toBe("sit-and-go");
        expect(tabOf(mtt("a", 0))).toBe("tournament");
        expect(tabCounts(games)).toEqual({ cash: 3, "sit-and-go": 1, tournament: 2 });
    });

    it("lists a tab's game types busiest first", () => {
        expect(gameTypesIn(games, "cash")).toEqual([
            { type: gameTypeOf(plo("x", 0)), tables: 1, seated: 5 },
            { type: gameTypeOf(cash("x", 0)), tables: 2, seated: 3 }
        ]);
        expect(gameTypesIn(games, "tournament")).toHaveLength(1);
        expect(gameTypesIn([], "cash")).toEqual([]);
    });

    it("keeps the saved type while it has tables, else the busiest", () => {
        const chips = gameTypesIn(games, "cash");
        const holdem = gameTypeOf(cash("x", 0));
        expect(activeGameType(chips, holdem)).toBe(holdem);
        expect(activeGameType(chips, "Stud")).toBe(chips[0].type);
        expect(activeGameType([], holdem)).toBeUndefined();
    });

    it("opens on the saved tab if it has tables, else the first that does", () => {
        expect(activeTab({ cash: 3, "sit-and-go": 1, tournament: 0 }, "sit-and-go")).toBe("sit-and-go");
        expect(activeTab({ cash: 0, "sit-and-go": 1, tournament: 0 }, "tournament")).toBe("sit-and-go");
        expect(activeTab({ cash: 0, "sit-and-go": 0, tournament: 0 }, undefined)).toBe("cash");
    });

    it("picks a tab's tables for one type", () => {
        expect(gamesFor(games, "cash", gameTypeOf(cash("x", 0))).map(g => g.gameId)).toEqual(["h1", "h2"]);
        expect(gamesFor(games, "cash", undefined)).toEqual([]);
    });

    it("recognises tab names", () => {
        expect(isLobbyTab("cash")).toBe(true);
        expect(isLobbyTab("poker")).toBe(false);
    });
});

describe("shortGameType", () => {
    it("shortens the game names players know", () => {
        expect(shortGameType("Texas Hold'em")).toBe("Hold'em");
        expect(shortGameType("Pot-Limit Omaha")).toBe("Omaha");
        expect(shortGameType("Omaha")).toBe("Omaha");
        expect(shortGameType("Stud")).toBe("Stud");
    });
});

describe("several areas at once", () => {
    const counts = { cash: 3, "sit-and-go": 2, tournament: 0 };

    it("shows the saved areas in lobby order, or the single fallback tab", () => {
        expect(activeTabs(counts, ["tournament", "cash"], undefined)).toEqual(["cash", "tournament"]);
        expect(activeTabs(counts, [], "sit-and-go")).toEqual(["sit-and-go"]);
        expect(activeTabs(counts, undefined, undefined)).toEqual(["cash"]);
    });

    it("switches areas on and off but never all off", () => {
        expect(toggleTab(["cash"], "tournament")).toEqual(["cash", "tournament"]);
        expect(toggleTab(["tournament"], "cash")).toEqual(["cash", "tournament"]);
        expect(toggleTab(["cash", "tournament"], "cash")).toEqual(["tournament"]);
        expect(toggleTab(["cash"], "cash")).toEqual(["cash"]);
    });
});
