import {
    payoutBarPercent,
    tournamentStatusText,
    tournamentStatusTone,
    countdownLabel,
    ladderBlinds,
    lobbyBlindLadder,
    lobbyBlindStructure,
    placeLabel,
    prizeMoney,
    startingStackLabel,
    tournamentPrize,
    tournamentStatus,
    type LobbyTournamentLive
} from "./tournamentDetail";

const NOW = 1_800_000_000_000;
const live = (over: Partial<LobbyTournamentLive>): LobbyTournamentLive => ({
    payouts: [],
    started: false,
    lateRegistration: "none",
    lateRegistrationEndsAt: undefined,
    level: undefined,
    ...over
});

describe("prizeMoney", () => {
    it("drops cents on whole dollars and keeps them otherwise", () => {
        expect(prizeMoney(12_000_000n)).toBe("$12");
        expect(prizeMoney("12600000")).toBe("$12.60");
        expect(prizeMoney(1_234_000_000n)).toBe("$1,234");
    });
    it("shows small prizes in dollars, not cents", () => {
        expect(prizeMoney(450_000n)).toBe("$0.45");
    });
});

describe("tournamentPrize", () => {
    const game = { minBuyIn: "10000000", entryFee: undefined, protocolFeeBps: 1000, currentPlayers: 4 };

    it("uses the engine's payouts: pool, first place and shares by place", () => {
        const p = tournamentPrize(game, [
            { place: 2, amount: "18000000" },
            { place: 1, amount: "36000000" }
        ]);
        expect(p.estimated).toBe(false);
        expect(p.pool).toBe(54_000_000n);
        expect(p.first).toBe(36_000_000n);
        expect(p.places.map(x => [x.place, x.percent])).toEqual([
            [1, 66.6],
            [2, 33.3]
        ]);
    });

    it("estimates the pool from entries when the engine has no payouts yet, without a split", () => {
        const p = tournamentPrize(game, []);
        expect(p.estimated).toBe(true);
        expect(p.pool).toBe(36_000_000n); // 4 × ($10 − 10%)
        expect(p.first).toBeNull();
        expect(p.places).toEqual([]);
    });

    it("ignores zero payouts", () => {
        expect(tournamentPrize(game, [{ place: 1, amount: "0" }]).estimated).toBe(true);
    });
});

describe("tournamentStatus", () => {
    const base = { scheduledStartTime: undefined as number | undefined, minPlayers: 2, maxPlayers: 6, currentPlayers: 3 };

    it("counts down to a scheduled start", () => {
        expect(tournamentStatus({ ...base, scheduledStartTime: NOW + 60_000 }, undefined, NOW)).toEqual({ kind: "startsIn", ms: 60_000 });
    });
    it("fills up when there is no start time", () => {
        expect(tournamentStatus(base, undefined, NOW)).toEqual({ kind: "registering", have: 3, need: 6 });
    });
    it("is starting once the time passes with enough players", () => {
        expect(tournamentStatus({ ...base, scheduledStartTime: NOW - 1 }, undefined, NOW)).toEqual({ kind: "starting" });
    });
    it("is short when the time passes without enough players", () => {
        expect(tournamentStatus({ ...base, currentPlayers: 1, scheduledStartTime: NOW - 1 }, undefined, NOW)).toEqual({ kind: "short", have: 1, need: 2 });
    });
    it("is cancelled after the grace window", () => {
        expect(tournamentStatus({ ...base, currentPlayers: 1, scheduledStartTime: NOW - 60 * 60_000 }, undefined, NOW)).toEqual({ kind: "cancelled" });
    });
    it("shows late registration with time left", () => {
        expect(tournamentStatus(base, live({ started: true, lateRegistration: "open", lateRegistrationEndsAt: NOW + 240_000 }), NOW)).toEqual({
            kind: "lateReg",
            ms: 240_000
        });
        expect(tournamentStatus(base, live({ started: true, lateRegistration: "open" }), NOW)).toEqual({ kind: "lateReg", ms: undefined });
    });
    it("is running once started and late registration is over", () => {
        expect(tournamentStatus(base, live({ started: true, lateRegistration: "closed" }), NOW)).toEqual({ kind: "running" });
    });
});

describe("countdownLabel", () => {
    it.each([
        [0, "0s"],
        [45_000, "45s"],
        [61_000, "2m"],
        [12 * 60_000, "12m"],
        [65 * 60_000, "1h 05m"],
        [50 * 3600_000, "2d 2h"]
    ])("%i ms → %s", (ms, label) => expect(countdownLabel(ms)).toBe(label));
});

describe("lobbyBlindStructure + lobbyBlindLadder", () => {
    it("doubles from the starting blinds when the table has no structure", () => {
        const s = lobbyBlindStructure({ smallBlind: "40", bigBlind: "80", blindLevel: 2, blindLevelDuration: 10, blindStructure: undefined });
        const rows = lobbyBlindLadder(s, 2, 4);
        expect(rows.map(r => ladderBlinds(r))).toEqual(["10 / 20", "20 / 40", "40 / 80", "80 / 160"]);
        expect(rows.map(r => r.isCurrent)).toEqual([false, false, true, false]);
        expect(rows[0].minutes).toBe(10);
        expect(rows[0].level).toBe(1);
    });

    it("plays a custom table structure as created", () => {
        const s = lobbyBlindStructure({
            smallBlind: "10",
            bigBlind: "20",
            blindLevel: undefined,
            blindLevelDuration: undefined,
            blindStructure: {
                progression: "table",
                levels: [
                    { level: 0, smallBlind: "10", bigBlind: "20", ante: "0", durationMinutes: 5, isBreak: false },
                    { level: 1, smallBlind: "20", bigBlind: "40", ante: "5", durationMinutes: 5, isBreak: false }
                ]
            }
        });
        const rows = lobbyBlindLadder(s, undefined, 2);
        expect(rows[1]).toMatchObject({ smallBlind: 20, bigBlind: 40, ante: 5, minutes: 5, isCurrent: false });
    });

    it("has no ladder without blinds", () => {
        expect(
            lobbyBlindStructure({ smallBlind: "0", bigBlind: "0", blindLevel: undefined, blindLevelDuration: undefined, blindStructure: undefined })
        ).toBeUndefined();
        expect(lobbyBlindLadder(undefined, 0)).toEqual([]);
    });
});

describe("startingStackLabel", () => {
    it("shows chips and big blinds deep", () => {
        expect(startingStackLabel("1500", 20)).toBe("1,500 · 75 BB");
    });
    it("shows chips alone without a big blind, and nothing without a stack", () => {
        expect(startingStackLabel("1500", undefined)).toBe("1,500");
        expect(startingStackLabel(undefined, 20)).toBe("");
    });
});

describe("placeLabel", () => {
    it.each([
        [1, "1st"],
        [2, "2nd"],
        [3, "3rd"],
        [4, "4th"],
        [11, "11th"],
        [12, "12th"],
        [21, "21st"]
    ])("%i → %s", (n, label) => expect(placeLabel(n)).toBe(label));
});

describe("tournamentStatusText + tone", () => {
    const t = (key: string, v?: Record<string, string | number>) => `${key}${v ? JSON.stringify(v) : ""}`;
    it("words each status with its numbers", () => {
        expect(tournamentStatusText({ kind: "startsIn", ms: 120_000 }, t)).toBe('lobby.tdStartsIn{"time":"2m"}');
        expect(tournamentStatusText({ kind: "registering", have: 3, need: 6 }, t)).toBe('lobby.tdFilling{"have":3,"need":6}');
        expect(tournamentStatusText({ kind: "lateReg", ms: undefined }, t)).toBe("lobby.tdLateReg");
        expect(tournamentStatusText({ kind: "cancelled" }, t)).toBe("lobby.cancelled");
    });
    it("colours late reg live, short/cancelled bad, running quiet", () => {
        expect(tournamentStatusTone({ kind: "lateReg", ms: 1 })).toBe("live");
        expect(tournamentStatusTone({ kind: "short", have: 1, need: 2 })).toBe("bad");
        expect(tournamentStatusTone({ kind: "running" })).toBe("quiet");
        expect(tournamentStatusTone({ kind: "startsIn", ms: 1 })).toBe("soon");
    });
});

describe("payoutBarPercent", () => {
    it("sizes a place against first, never below 4%", () => {
        expect(payoutBarPercent(50n, 100n)).toBe(50);
        expect(payoutBarPercent(100n, 100n)).toBe(100);
        expect(payoutBarPercent(1n, 100n)).toBe(4);
        expect(payoutBarPercent(10n, null)).toBe(4);
    });
});
