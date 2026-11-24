import { BettingLimit, GameFormat, GameVariant } from "@block52/poker-vm-sdk";
import type { GameWithFormat } from "./convertUtils";
import type { SizeBand, StakeBand } from "./lobbyLayout";
import {
    filterLobbyGames,
    groupLobbySections,
    matchesSearch,
    matchesSize,
    matchesStake,
    openSeats,
    pickQuickSeat,
    seatFill,
    seatPosition,
    seatedTotal,
    lobbyStakesLabel,
    lobbyBuyInLabel,
    tableSizeLabel,
    sectionAnchorId,
    svgSafeId,
    lobbyPhase,
    stakeLevelOf,
    stakeLevels,
    tileSizesLabel,
    busiestRow,
    levelSummary,
    growFrom,
    inviteOnlyTables,
    type LobbyFilter,
    LEVEL_DEFAULT_STAKES,
    tileTable,
    feltLabels,
    rowView,
    sectionRows,
    stakeKeyOf,
    groupStakeRows,
    isQuietStake,
    busiestSize,
    rowSizeSelection,
    toggleRowSize,
    rowTables,
    sortStakeRows,
    quietStakeTable,
    inPlayTables,
    occupiedTables,
    visibleLevelTables,
    similarOpenTable,
    toggleBand,
    matchesStakes,
    parseLobbyPrefs,
    hasBalance,
    othersAtLevel,
    activeFilterCount,
    levelKeyOf,
    isListedTable,
    isInPlay,
    sectionCount,
    firstSectionOf,
    totalOpenSeats,
    toLobbySort,
    isTableCreator,
    isTreasuryTable,
    lobbyBalanceLabel,
    lobbyScheduleLabel,
    sectionKeyOf,
    sortLobbyGames,
    stakeOptions
} from "./lobbyLayout";

/** A cash table with blinds in dollars (stored as micro-USDC strings, like the chain). */
const cash = (id: string, sb: number, bb: number, seated: number, max: number, extra: Partial<GameWithFormat> = {}): GameWithFormat => ({
    gameId: id,
    minBuyIn: String(bb * 20 * 1_000_000),
    maxBuyIn: String(bb * 100 * 1_000_000),
    minPlayers: 2,
    maxPlayers: max,
    currentPlayers: seated,
    gameFormat: GameFormat.CASH,
    gameVariant: GameVariant.TEXAS_HOLDEM,
    smallBlind: String(sb * 1_000_000),
    bigBlind: String(bb * 1_000_000),
    status: "waiting",
    ...extra
});

const sng = (id: string, seated: number, max: number, extra: Partial<GameWithFormat> = {}): GameWithFormat =>
    cash(id, 0, 0, seated, max, { gameFormat: GameFormat.SIT_AND_GO, smallBlind: "10", bigBlind: "20", minBuyIn: "2000000", maxBuyIn: "2000000", ...extra });

describe("openSeats", () => {
    it("counts free seats and never goes negative", () => {
        expect(openSeats({ maxPlayers: 9, currentPlayers: 7 })).toBe(2);
        expect(openSeats({ maxPlayers: 6, currentPlayers: 6 })).toBe(0);
        expect(openSeats({ maxPlayers: 6, currentPlayers: 8 })).toBe(0);
    });
});

describe("sectionKeyOf", () => {
    it("puts cash tables in a section named after the game", () => {
        expect(sectionKeyOf(cash("a", 1, 2, 3, 9))).toBe("cash:Texas Hold'em");
        expect(sectionKeyOf(cash("b", 1, 2, 3, 6, { gameVariant: GameVariant.OMAHA, bettingLimit: BettingLimit.POT_LIMIT }))).toBe("cash:Pot-Limit Omaha");
        expect(sectionKeyOf(cash("c", 1, 2, 3, 6, { bettingLimit: BettingLimit.FIXED_LIMIT }))).toBe("cash:Fixed-Limit Texas Hold'em");
    });

    it("splits sit & gos from tournaments (scheduled or multi-table)", () => {
        expect(sectionKeyOf(sng("s", 2, 6))).toBe("sit-and-go");
        expect(sectionKeyOf(sng("t", 2, 9, { scheduledStartTime: 1_800_000_000_000 }))).toBe("tournament");
        expect(sectionKeyOf(sng("m", 2, 27, { gameFormat: GameFormat.TOURNAMENT }))).toBe("tournament");
    });
});

describe("matchesStake", () => {
    it("bands cash tables by big blind", () => {
        expect(matchesStake(cash("a", 0.1, 0.2, 1, 9), "micro")).toBe(true);
        expect(matchesStake(cash("a", 0.25, 0.5, 1, 9), "micro")).toBe(false);
        expect(matchesStake(cash("a", 0.25, 0.5, 1, 9), "low")).toBe(true);
        expect(matchesStake(cash("a", 1, 2, 1, 9), "low")).toBe(true);
        expect(matchesStake(cash("a", 2, 5, 1, 9), "mid")).toBe(true);
        expect(matchesStake(cash("a", 5, 10, 1, 9), "mid")).toBe(true);
        expect(matchesStake(cash("a", 10, 20, 1, 9), "high")).toBe(true);
        expect(matchesStake(cash("a", 10, 20, 1, 9), "all")).toBe(true);
    });

    it("never hides tournaments by stake (their blinds are chips)", () => {
        expect(matchesStake(sng("s", 1, 6), "high")).toBe(true);
    });
});

describe("matchesSize", () => {
    it("bands by seat count", () => {
        expect(matchesSize({ maxPlayers: 2 }, "heads-up")).toBe(true);
        expect(matchesSize({ maxPlayers: 6 }, "6-max")).toBe(true);
        expect(matchesSize({ maxPlayers: 4 }, "6-max")).toBe(true);
        expect(matchesSize({ maxPlayers: 9 }, "9-max")).toBe(true);
        expect(matchesSize({ maxPlayers: 9 }, "6-max")).toBe(false);
        expect(matchesSize({ maxPlayers: 9 }, "all")).toBe(true);
    });
});

describe("matchesSearch", () => {
    it("matches name, table ID or club, ignoring case and spaces", () => {
        expect(matchesSearch({ gameId: "0xabc123", name: "neon-alley" }, "  NEON ")).toBe(true);
        expect(matchesSearch({ gameId: "0xabc123" }, "abc1")).toBe(true);
        expect(matchesSearch({ gameId: "0xabc123" }, "texas", "Texas Hodl")).toBe(true);
        expect(matchesSearch({ gameId: "0xabc123" }, "zzz")).toBe(false);
        expect(matchesSearch({ gameId: "0xabc123" }, "")).toBe(true);
    });
});

describe("filterLobbyGames", () => {
    const games = [cash("t1", 1, 2, 3, 9, { creator: "b52treasury" }), cash("t2", 10, 20, 1, 6, { creator: "b52someone" }), cash("t3", 0.05, 0.1, 1, 2)];
    const base = { query: "", stakes: [] as StakeBand[], sizes: [] as SizeBand[], treasuryOnly: false, treasuryAddress: "b52treasury" };

    it("keeps everything with no filters", () => {
        expect(filterLobbyGames(games, base)).toHaveLength(3);
    });

    it("keeps only treasury tables when asked", () => {
        expect(filterLobbyGames(games, { ...base, treasuryOnly: true }).map(g => g.gameId)).toEqual(["t1"]);
    });

    it("ignores the treasury switch when no treasury is configured", () => {
        expect(filterLobbyGames(games, { ...base, treasuryOnly: true, treasuryAddress: "" })).toHaveLength(3);
    });

    it("combines stake, size and search", () => {
        expect(filterLobbyGames(games, { ...base, stakes: ["high"] }).map(g => g.gameId)).toEqual(["t2"]);
        expect(filterLobbyGames(games, { ...base, stakes: ["low", "high"] }).map(g => g.gameId)).toEqual(["t1", "t2"]);
        expect(filterLobbyGames(games, { ...base, sizes: ["heads-up"] }).map(g => g.gameId)).toEqual(["t3"]);
        expect(filterLobbyGames(games, { ...base, query: "t1" }).map(g => g.gameId)).toEqual(["t1"]);
    });
});

describe("sortLobbyGames", () => {
    const games = [cash("b", 1, 2, 8, 9), cash("a", 0.25, 0.5, 2, 9), cash("c", 1, 2, 3, 9), cash("d", 5, 10, 6, 6)];

    it("orders by stakes, smallest first, ties by most open seats", () => {
        expect(sortLobbyGames(games, "stakes-up").map(g => g.gameId)).toEqual(["a", "c", "b", "d"]);
    });

    it("orders by stakes, biggest first", () => {
        expect(sortLobbyGames(games, "stakes-down").map(g => g.gameId)).toEqual(["d", "c", "b", "a"]);
    });

    it("orders by most players, or most open seats", () => {
        expect(sortLobbyGames(games, "most-players").map(g => g.gameId)).toEqual(["b", "d", "c", "a"]);
        expect(sortLobbyGames(games, "most-open").map(g => g.gameId)).toEqual(["a", "c", "b", "d"]);
    });

    it("does not change the input array", () => {
        const copy = [...games];
        sortLobbyGames(games, "stakes-up");
        expect(games).toEqual(copy);
    });
});

describe("groupLobbySections", () => {
    it("groups into Hold'em, other cash games, Sit & Go, Tournaments, leaving empty sections out", () => {
        const games = [
            sng("s1", 1, 6),
            cash("o1", 1, 2, 2, 6, { gameVariant: GameVariant.OMAHA, bettingLimit: BettingLimit.POT_LIMIT }),
            cash("h2", 1, 2, 1, 9),
            cash("h1", 0.25, 0.5, 1, 9),
            sng("t1", 3, 27, { gameFormat: GameFormat.TOURNAMENT })
        ];
        const sections = groupLobbySections(games, "stakes-up");
        expect(sections.map(s => s.title)).toEqual(["Texas Hold'em", "Pot-Limit Omaha", "Sit & Go", "Tournaments"]);
        expect(sections.map(s => s.kind)).toEqual(["cash", "cash", "sit-and-go", "tournament"]);
        expect(sections[0].games.map(g => g.gameId)).toEqual(["h1", "h2"]);
    });

    it("returns nothing for no tables", () => {
        expect(groupLobbySections([], "stakes-up")).toEqual([]);
    });
});

describe("seatFill", () => {
    it("spreads seated players evenly from the bottom seat", () => {
        expect(seatFill(6, 3)).toEqual([true, false, true, false, true, false]);
        expect(seatFill(9, 9).every(Boolean)).toBe(true);
        expect(seatFill(9, 0).some(Boolean)).toBe(false);
        expect(seatFill(2, 1)).toEqual([true, false]);
    });

    it("always fills exactly the seated count, capped at the table size", () => {
        for (let max = 2; max <= 9; max++) {
            for (let n = 0; n <= max + 2; n++) {
                expect(seatFill(max, n).filter(Boolean)).toHaveLength(Math.min(n, max));
            }
        }
    });
});

describe("seatPosition", () => {
    it("puts seat 0 at the bottom and goes clockwise", () => {
        const p0 = seatPosition(0, 4, 100, 50, 80, 40);
        expect(p0.x).toBeCloseTo(100);
        expect(p0.y).toBeCloseTo(90);
        const p1 = seatPosition(1, 4, 100, 50, 80, 40);
        expect(p1.x).toBeCloseTo(20);
        expect(p1.y).toBeCloseTo(50);
    });
});

describe("pickQuickSeat and stakeOptions", () => {
    const games = [cash("a", 1, 2, 3, 9), cash("b", 1, 2, 7, 9), cash("c", 1, 2, 9, 9), cash("d", 0.25, 0.5, 1, 9), sng("s", 1, 6)];

    it("picks the open table at that stake with the most players", () => {
        expect(pickQuickSeat(games, "cash:Texas Hold'em", "2000000")?.gameId).toBe("b");
    });

    it("returns undefined when no open table matches", () => {
        expect(pickQuickSeat(games, "cash:Texas Hold'em", "20000000")).toBeUndefined();
        expect(pickQuickSeat(games, "cash:Pot-Limit Omaha", "2000000")).toBeUndefined();
    });

    it("lists each section's big blinds once, smallest first", () => {
        expect(stakeOptions(games, "cash:Texas Hold'em")).toEqual(["500000", "2000000"]);
    });
});

describe("seatedTotal", () => {
    it("adds up seated players", () => {
        expect(seatedTotal([{ currentPlayers: 3 }, { currentPlayers: 0 }, { currentPlayers: 6 }])).toBe(9);
        expect(seatedTotal([])).toBe(0);
    });
});

describe("labels", () => {
    it("shows cash stakes without cents on whole dollars", () => {
        expect(lobbyStakesLabel(cash("a", 1, 2, 0, 9))).toBe("$1 / $2");
        expect(lobbyStakesLabel(cash("a", 0.25, 0.5, 0, 9))).toBe("25c / 50c");
        expect(lobbyStakesLabel(cash("a", 10, 20, 0, 9))).toBe("$10 / $20");
    });

    it("shows a cash buy-in range and a single tournament buy-in", () => {
        expect(lobbyBuyInLabel(cash("a", 1, 2, 0, 9))).toBe("$40 – $200");
        expect(lobbyBuyInLabel(sng("s", 0, 6))).toBe("$2");
    });

    it("splits a tournament buy-in when a protocol fee is set", () => {
        expect(lobbyBuyInLabel(sng("s", 0, 6, { minBuyIn: "10000000", protocolFeeBps: 1000 }))).toBe("$10 ($9 + $1)");
        expect(lobbyBuyInLabel(sng("s", 0, 6, { minBuyIn: "9000000", protocolFeeBps: 1000 }))).toBe("$9 ($8.10 + 90c)");
    });

    it("names table sizes", () => {
        expect(tableSizeLabel(2)).toBe("Heads-up");
        expect(tableSizeLabel(6)).toBe("6-max");
        expect(tableSizeLabel(9)).toBe("9-max");
    });

    it("makes safe DOM and SVG ids", () => {
        expect(sectionAnchorId("cash:Texas Hold'em")).toBe("lobby-cash-texas-hold-em");
        expect(sectionAnchorId("sit-and-go")).toBe("lobby-sit-and-go");
        expect(svgSafeId(":r1a:")).toBe("r1a");
    });
});

describe("schedule", () => {
    const now = 1_800_000_000_000;

    it("is empty for an unscheduled table", () => {
        expect(lobbyPhase(sng("s", 1, 6), now)).toBe("unscheduled");
        expect(lobbyScheduleLabel(sng("s", 1, 6), now)).toBe("");
    });

    it("shows the start, minimum and late registration while registering", () => {
        const g = sng("t", 1, 9, { scheduledStartTime: now + 3_600_000, minPlayers: 4, lateRegistrationLevels: 2 });
        expect(lobbyPhase(g, now)).toBe("registering");
        expect(lobbyScheduleLabel(g, now)).toMatch(/^Starts .+ · min 4 · Late reg: 2 levels$/);
    });

    it("says Starting once due with enough players, Cancelled after the grace window without", () => {
        expect(lobbyScheduleLabel(sng("t", 4, 9, { scheduledStartTime: now - 1000, minPlayers: 4 }), now)).toBe("Starting");
        expect(lobbyScheduleLabel(sng("t", 1, 9, { scheduledStartTime: now - 60 * 60 * 1000, minPlayers: 4 }), now)).toBe("Cancelled: not enough players");
    });
});

describe("ownership and balance", () => {
    it("knows the creator, ignoring case, and never matches a missing wallet", () => {
        expect(isTableCreator({ creator: "b52ABC" }, "b52abc")).toBe(true);
        expect(isTableCreator({ creator: "b52abc" }, "b52xyz")).toBe(false);
        expect(isTableCreator({ creator: "b52abc" }, null)).toBe(false);
        expect(isTableCreator({}, "b52abc")).toBe(false);
    });

    it("knows treasury tables only when a treasury is configured", () => {
        expect(isTreasuryTable({ creator: "b52t" }, "b52t")).toBe(true);
        expect(isTreasuryTable({ creator: "b52t" }, "")).toBe(false);
        expect(isTreasuryTable({}, "")).toBe(false);
    });

    it("formats a balance with thousands and two decimals", () => {
        expect(lobbyBalanceLabel("1240.500000")).toBe("$1,240.50");
        expect(lobbyBalanceLabel("0.00")).toBe("$0.00");
    });
});

describe("section helpers", () => {
    const sections = groupLobbySections([cash("h", 1, 2, 3, 9), cash("i", 1, 2, 9, 9), sng("s", 1, 6)], "stakes-up");

    it("counts tables per kind and finds the first section", () => {
        expect(sectionCount(sections, "cash")).toBe(2);
        expect(sectionCount(sections, "sit-and-go")).toBe(1);
        expect(sectionCount(sections, "tournament")).toBe(0);
        expect(firstSectionOf(sections, "sit-and-go")?.key).toBe("sit-and-go");
        expect(firstSectionOf(sections, "tournament")).toBeUndefined();
    });

    it("adds up open seats", () => {
        expect(totalOpenSeats(sections[0].games)).toBe(6);
    });

    it("accepts only known sorts", () => {
        expect(toLobbySort("most-open")).toBe("most-open");
        expect(toLobbySort("nope")).toBeUndefined();
    });
});

describe("stake levels", () => {
    it("puts tables with the same blinds and size in one level", () => {
        expect(levelKeyOf(cash("a", 1, 2, 0, 9))).toBe(levelKeyOf(cash("b", 1, 2, 5, 9)));
        expect(levelKeyOf(cash("a", 1, 2, 0, 9))).not.toBe(levelKeyOf(cash("c", 1, 2, 0, 6)));
        expect(levelKeyOf(cash("a", 1, 2, 0, 9))).not.toBe(levelKeyOf(cash("d", 2, 5, 0, 9)));
        expect(levelKeyOf(sng("s", 0, 6))).toBe(levelKeyOf(sng("t", 3, 6)));
    });

    it("lists everything except cancelled scheduled tournaments", () => {
        const now = 1_800_000_000_000;
        expect(isListedTable(cash("a", 1, 2, 0, 9), now)).toBe(true);
        expect(isListedTable(sng("t", 1, 9, { scheduledStartTime: now - 3_600_000, minPlayers: 4 }), now)).toBe(false);
        expect(isListedTable(sng("t", 1, 9, { scheduledStartTime: now + 3_600_000, minPlayers: 4 }), now)).toBe(true);
    });

    it("calls a table in play from two players", () => {
        expect(isInPlay({ currentPlayers: 1 })).toBe(false);
        expect(isInPlay({ currentPlayers: 2 })).toBe(true);
    });
});

describe("othersAtLevel and activeFilterCount", () => {
    it("lists the other tables at the same stakes and size, open seats first", () => {
        const a = cash("a", 1, 2, 3, 9);
        const games = [a, cash("b", 1, 2, 9, 9), cash("c", 1, 2, 1, 9), cash("d", 1, 2, 1, 6), cash("e", 2, 5, 1, 9)];
        expect(othersAtLevel(games, a).map(g => g.gameId)).toEqual(["c", "b"]);
    });

    it("counts set filters", () => {
        expect(activeFilterCount({ query: " ", stakes: [], sizes: [] })).toBe(0);
        expect(activeFilterCount({ query: "neon", stakes: ["low", "mid"], sizes: ["6-max"] })).toBe(3);
    });
});

describe("hasBalance", () => {
    it("is true only above zero", () => {
        expect(hasBalance("0.00")).toBe(false);
        expect(hasBalance("0.000001")).toBe(true);
        expect(hasBalance("12.5")).toBe(true);
    });
});

describe("what a stake level shows", () => {
    it("shows tables with players, most first, then one empty table", () => {
        const tables = [cash("e1", 0.01, 0.02, 0, 9), cash("p2", 0.01, 0.02, 2, 9), cash("e2", 0.01, 0.02, 0, 9), cash("full", 0.01, 0.02, 9, 9), cash("e3", 0.01, 0.02, 0, 9), cash("p5", 0.01, 0.02, 5, 9)];
        expect(visibleLevelTables(tables).map(t => t.gameId)).toEqual(["full", "p5", "p2", "e1"]);
    });

    it("shows a single empty table when nobody is playing", () => {
        expect(visibleLevelTables([cash("b", 1, 2, 0, 9), cash("a", 1, 2, 0, 9)]).map(t => t.gameId)).toEqual(["a"]);
    });

});

describe("similarOpenTable", () => {
    it("finds another table at the same stakes with a seat, preferring one with players", () => {
        const full = cash("full", 1, 2, 9, 9);
        const games = [full, cash("empty", 1, 2, 0, 9), cash("busy", 1, 2, 6, 9), cash("other", 2, 5, 1, 9)];
        expect(similarOpenTable(games, full)?.gameId).toBe("busy");
    });

    it("is undefined when every table at that level is full", () => {
        const a = cash("a", 1, 2, 6, 6);
        expect(similarOpenTable([a, cash("b", 1, 2, 6, 6)], a)).toBeUndefined();
    });
});

describe("multi-select filters", () => {
    it("toggles bands and clears with all", () => {
        expect(toggleBand<StakeBand>([], "micro")).toEqual(["micro"]);
        expect(toggleBand<StakeBand>(["micro", "low"], "micro")).toEqual(["low"]);
        expect(toggleBand<StakeBand>(["micro"], "all")).toEqual([]);
    });

    it("matches any picked band, or everything when none are picked", () => {
        expect(matchesStakes(cash("a", 0.01, 0.02, 0, 9), [])).toBe(true);
        expect(matchesStakes(cash("a", 0.01, 0.02, 0, 9), ["low", "mid"])).toBe(false);
        expect(matchesStakes(cash("a", 1, 2, 0, 9), ["low", "mid"])).toBe(true);
    });
});

describe("parseLobbyPrefs", () => {
    const defaults = { stakes: [] as StakeBand[], sizes: [] as SizeBand[], sort: "stakes-up" as const, treasuryOnly: true, rowSizes: {} as Record<string, number[]>, tab: "cash", types: {} as Record<string, string> };

    it("reads saved filters", () => {
        const raw = JSON.stringify({ stakes: ["low", "mid"], sizes: ["6-max"], sort: "most-players", treasuryOnly: false, rowSizes: { "cash:x|1|2": [9, 6], bad: ["9", 1, 2.5] }, tab: "tournament", types: { cash: "Pot-Limit Omaha", bad: 3 } });
        expect(parseLobbyPrefs(raw, defaults)).toEqual({ stakes: ["low", "mid"], sizes: ["6-max"], sort: "most-players", treasuryOnly: false, rowSizes: { "cash:x|1|2": [9, 6] }, tab: "tournament", types: { cash: "Pot-Limit Omaha" } });
    });

    it("drops unknown values and falls back for missing ones", () => {
        expect(parseLobbyPrefs(JSON.stringify({ stakes: ["low", "huge", 3], sort: "nope" }), defaults)).toEqual({ ...defaults, stakes: ["low"] });
    });

    it("falls back on nothing saved or broken JSON", () => {
        expect(parseLobbyPrefs(null, defaults)).toEqual(defaults);
        expect(parseLobbyPrefs("{oops", defaults)).toEqual(defaults);
        expect(parseLobbyPrefs("[1,2]", defaults)).toEqual(defaults);
    });
});

describe("occupiedTables", () => {
    it("keeps tables with players", () => {
        expect(occupiedTables([cash("a", 1, 2, 0, 9), cash("b", 1, 2, 1, 9)]).map(g => g.gameId)).toEqual(["b"]);
    });
});

describe("inPlayTables", () => {
    it("keeps tables with two or more players", () => {
        expect(inPlayTables([cash("a", 1, 2, 1, 9), cash("b", 1, 2, 2, 9), cash("c", 1, 2, 0, 9)]).map(g => g.gameId)).toEqual(["b"]);
    });
});

describe("stake rows", () => {
    const games = [
        cash("n1", 0.01, 0.02, 3, 9),
        cash("n2", 0.01, 0.02, 0, 9),
        cash("n3", 0.01, 0.02, 0, 9),
        cash("h1", 0.01, 0.02, 2, 2),
        cash("h2", 0.01, 0.02, 2, 2),
        cash("h3", 0.01, 0.02, 0, 2),
        cash("f1", 0.01, 0.02, 0, 4),
        cash("q1", 2, 5, 0, 9),
        cash("q2", 2, 5, 0, 6)
    ];
    const rows = groupStakeRows(games);
    const micro = rows.find(r => r.sample.bigBlind === "20000")!;
    const quiet = rows.find(r => r.sample.bigBlind === "5000000")!;

    it("puts every size of one stake in one row, sizes largest first", () => {
        expect(rows).toHaveLength(2);
        expect(stakeKeyOf(cash("a", 1, 2, 0, 9))).toBe(stakeKeyOf(cash("b", 1, 2, 0, 2)));
        expect(micro.sizes.map(s => s.size)).toEqual([9, 4, 2]);
        expect(micro.sizes.map(s => s.inPlay)).toEqual([1, 0, 2]);
        expect(micro.seated).toBe(7);
    });

    it("folds stakes with nobody seated", () => {
        expect(isQuietStake(micro)).toBe(false);
        expect(isQuietStake(quiet)).toBe(true);
        expect(quietStakeTable(quiet).maxPlayers).toBe(9);
    });

    it("starts a row on the size with the most players, else the largest", () => {
        // 4 players at heads-up beat 3 at 9-max
        expect(busiestSize(micro)).toBe(2);
        expect(busiestSize(quiet)).toBe(9);
        const hu = groupStakeRows([cash("a", 1, 2, 2, 2), cash("b", 1, 2, 2, 2), cash("c", 1, 2, 1, 9)])[0];
        expect(busiestSize(hu)).toBe(2);
    });

    it("uses the saved sizes that still exist, never an empty selection", () => {
        expect(rowSizeSelection(micro, undefined)).toEqual([2]);
        expect(rowSizeSelection(micro, [9, 6])).toEqual([9]);
        expect(rowSizeSelection(micro, [6])).toEqual([2]);
    });

    it("switches sizes on and off but keeps at least one", () => {
        expect(toggleRowSize([9], 2)).toEqual([9, 2]);
        expect(toggleRowSize([9, 2], 9)).toEqual([2]);
        expect(toggleRowSize([9], 9)).toEqual([9]);
    });

    it("shows tables with players for the sizes on, then one spare per size on", () => {
        expect(rowTables(micro, [9]).map(g => g.gameId)).toEqual(["n1", "n2"]);
        expect(rowTables(micro, [9, 2]).map(g => g.gameId)).toEqual(["n1", "h1", "h2", "n2", "h3"]);
        expect(rowTables(micro, [9, 4]).map(g => g.gameId)).toEqual(["n1", "n2", "f1"]);
    });

    it("orders rows busiest first, or by stakes", () => {
        expect(sortStakeRows(rows, "most-players")[0]).toBe(micro);
        expect(sortStakeRows(rows, "stakes-down")[0]).toBe(quiet);
        expect(sortStakeRows(rows, "stakes-up")[0]).toBe(micro);
    });
});

describe("rowView and sectionRows", () => {
    const games = [cash("a", 1, 2, 3, 9), cash("b", 1, 2, 2, 2), cash("c", 1, 2, 0, 9), cash("d", 5, 10, 0, 9)];

    it("counts in-play tables and open seats for the sizes switched on", () => {
        const [row] = groupStakeRows(games.slice(0, 3));
        expect(rowView(row, [9])).toEqual({ cards: [games[0], games[2]], inPlay: 1, open: 15 });
        expect(rowView(row, [9, 2]).inPlay).toBe(2);
    });

    it("splits busy stake rows from quiet ones", () => {
        const { active, quiet } = sectionRows(games, "most-players");
        expect(active).toHaveLength(1);
        expect(quiet.map(r => r.sample.gameId)).toEqual(["d"]);
    });
});

describe("feltLabels", () => {
    it("writes the stakes and the game on a cash table's felt", () => {
        expect(feltLabels(cash("a", 0.01, 0.02, 3, 9), "Texas Hold'em")).toEqual({ title: "1c / 2c", sub: "Texas Hold'em · 9-max" });
    });

    it("writes the buy-in (no fee split) on a tournament's felt", () => {
        expect(feltLabels(sng("s", 2, 6), "Sit & Go")).toEqual({ title: "$2", sub: "Sit & Go · 6-max" });
    });
});

describe("stake levels and tiles", () => {
    const rows = groupStakeRows([cash("a", 0.01, 0.02, 3, 9), cash("b", 0.05, 0.1, 0, 9), cash("c", 1, 2, 2, 6), cash("d", 5, 10, 0, 9), cash("e", 25, 50, 1, 2), cash("f", 0.01, 0.02, 0, 2)]);

    it("puts each stake in its level", () => {
        expect(rows.map(r => stakeLevelOf(r))).toEqual(["micro", "micro", "low", "mid", "high"]);
    });

    it("groups stakes by level, micro first, low to high inside", () => {
        const groups = stakeLevels(rows);
        expect(groups.map(g => g.level)).toEqual(["micro", "low", "mid", "high"]);
        expect(groups[0].rows.map(r => r.sample.bigBlind)).toEqual(["20000", "100000"]);
        expect(stakeLevels([])).toEqual([]);
    });

    it("keeps all four cash levels when asked, empty ones included", () => {
        const only = groupStakeRows([cash("a", 0.01, 0.02, 3, 9)]);
        expect(stakeLevels(only, true).map(g => [g.level, g.rows.length])).toEqual([["micro", 1], ["low", 0], ["mid", 0], ["high", 0]]);
        expect(stakeLevels(only).map(g => g.level)).toEqual(["micro"]);
    });

    it("gives every cash level stakes that fall inside it", () => {
        for (const level of ["micro", "low", "mid", "high"] as const) {
            const { smallBlind, bigBlind } = LEVEL_DEFAULT_STAKES[level];
            expect(stakeLevelOf(groupStakeRows([cash("x", smallBlind, bigBlind, 0, 9)])[0])).toBe(level);
        }
    });

    it("writes a tile's sizes short, biggest first", () => {
        expect(tileSizesLabel([2, 4, 9])).toBe("9-max · 6-max · H/U");
        expect(tileSizesLabel([6, 6])).toBe("6-max");
        expect(tileSizesLabel([2])).toBe("H/U");
    });

    it("hides full or empty tables, and invite-only Circles' tables unless asked", () => {
        const games = [cash("busy", 0.01, 0.02, 3, 9), cash("full", 0.01, 0.02, 2, 2), cash("empty", 0.01, 0.02, 0, 9), cash("vip", 0.01, 0.02, 4, 9)];
        const base = { query: "", stakes: [], sizes: [], treasuryOnly: false, treasuryAddress: "" };
        const invite = inviteOnlyTables({ vip: { joining: "invite" }, busy: { joining: "open" } });
        const ids = (f: Partial<LobbyFilter>) => filterLobbyGames(games, { ...base, inviteOnly: invite, ...f }).map(g => g.gameId);
        expect(ids({})).toEqual(["busy", "full", "empty"]);
        expect(ids({ showInviteOnly: true })).toEqual(["busy", "full", "empty", "vip"]);
        expect(ids({ hideFull: true })).toEqual(["busy", "empty"]);
        expect(ids({ hideEmpty: true })).toEqual(["busy", "full"]);
        expect(activeFilterCount({ query: "", stakes: [], sizes: [], hideFull: true, inviteOnly: true })).toBe(2);
    });

    it("works out how to sit the panel over the tile it grows from", () => {
        expect(growFrom({ left: 0, top: 0, width: 200, height: 100 }, { left: 300, top: 200, width: 800, height: 400 })).toBe("translate(-600px, -350px) scale(0.250, 0.250)");
        expect(growFrom({ left: 10, top: 10, width: 50, height: 50 }, { left: 10, top: 10, width: 0, height: 0 })).toBe("translate(25px, 25px) scale(1.000, 1.000)");
    });

    it("finds a level's busiest stake and adds up its players and tables", () => {
        const level = groupStakeRows([cash("a", 0.01, 0.02, 3, 9), cash("b", 0.05, 0.1, 6, 9), cash("c", 0.05, 0.1, 0, 2)]);
        expect(busiestRow(level)?.sample.bigBlind).toBe("100000");
        expect(levelSummary(level)).toEqual({ seated: 9, tables: 3 });
        expect(busiestRow([])).toBeUndefined();
    });

    it("keeps tournaments as one group", () => {
        expect(stakeLevels(groupStakeRows([sng("s", 2, 6)])).map(g => g.level)).toEqual(["buy-in"]);
    });

    it("pictures a stake's busiest table", () => {
        expect(tileTable(rows[0]).gameId).toBe("a");
    });
});
