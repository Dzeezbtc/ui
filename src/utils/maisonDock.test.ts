import { dockAmount, dockStreet, hasFreeSeat, maisonDockLine } from "./maisonDock";

describe("dockStreet", () => {
    it("names the four streets", () => {
        expect(dockStreet("preflop")).toBe("Pre-flop");
        expect(dockStreet("flop")).toBe("Flop");
        expect(dockStreet("turn")).toBe("Turn");
        expect(dockStreet("river")).toBe("River");
    });
    it("is empty outside them", () => {
        expect(dockStreet(undefined)).toBe("");
        expect(dockStreet("not-a-round")).toBe("");
    });
});

describe("maisonDockLine", () => {
    it("says it is your turn, with the street", () => {
        expect(maisonDockLine(5, 5, "flop", null)).toEqual({ title: "Your turn", detail: "Flop", mine: true });
    });
    it("says whose turn it is while you wait", () => {
        expect(maisonDockLine(5, 7, "turn", null)).toEqual({ title: "Waiting", detail: "Seat 7's turn · Turn", mine: false });
    });
    it("says Watching when you have no seat", () => {
        expect(maisonDockLine(0, 7, "preflop", null)).toEqual({ title: "Watching", detail: "Seat 7's turn · Pre-flop", mine: false });
    });
    it("is never empty when watching between hands", () => {
        expect(maisonDockLine(-1, 0, "end", null)).toEqual({ title: "Watching", detail: "Between hands", mine: false });
    });
    it("leaves a seated player's dock to their cards between hands", () => {
        expect(maisonDockLine(5, 0, "end", null)).toBeNull();
    });
    it("names the winner and the hand", () => {
        expect(maisonDockLine(0, -1, "end", { seat: 7, amount: "$195", hand: "Pair of Aces" })).toEqual({ title: "Seat 7 won $195", detail: "Pair of Aces", mine: false });
    });
    it("says You when you won, and leaves the hand out of a fold win", () => {
        expect(maisonDockLine(5, -1, "end", { seat: 5, amount: "$30" })).toEqual({ title: "You won $30", detail: "", mine: true });
    });
});

describe("hasFreeSeat", () => {
    it("is true while seats are left", () => {
        expect(hasFreeSeat(8, 9)).toBe(true);
    });
    it("is false when the table is full or its size is unknown", () => {
        expect(hasFreeSeat(9, 9)).toBe(false);
        expect(hasFreeSeat(0, undefined)).toBe(false);
    });
});

describe("dockAmount", () => {
    it("puts the dollar sign on a cash win", () => {
        expect(dockAmount("195.00", false)).toBe("$195.00");
    });
    it("leaves tournament chips as they are", () => {
        expect(dockAmount("1,950 chips", true)).toBe("1,950 chips");
    });
});
