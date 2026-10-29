import { PlayerStatus } from "@block52/poker-vm-sdk";
import { hasFoldedOrMucked, isEliminatedFromTournament } from "./playerStatus";

describe("hasFoldedOrMucked", () => {
    it("treats a mucked seat exactly like a folded one (engine v1.0.18, poker-vm#2586)", () => {
        expect(hasFoldedOrMucked(PlayerStatus.FOLDED)).toBe(true);
        expect(hasFoldedOrMucked(PlayerStatus.MUCKED)).toBe(true);
        expect(hasFoldedOrMucked("mucked")).toBe(true);
    });

    it("is false for every in-hand and idle status, and for a missing one", () => {
        for (const status of [PlayerStatus.ACTIVE, PlayerStatus.ALL_IN, PlayerStatus.SHOWING, PlayerStatus.SITTING_OUT, PlayerStatus.BUSTED, PlayerStatus.SEATED]) {
            expect(hasFoldedOrMucked(status)).toBe(false);
        }
        expect(hasFoldedOrMucked(undefined)).toBe(false);
        expect(hasFoldedOrMucked(null)).toBe(false);
    });
});

describe("isEliminatedFromTournament", () => {
    it("is true for a busted player in a Sit & Go or tournament", () => {
        expect(isEliminatedFromTournament(PlayerStatus.BUSTED, true)).toBe(true);
        expect(isEliminatedFromTournament("busted", true)).toBe(true);
    });

    it("is false for a busted cash player, who keeps the seat to top up", () => {
        expect(isEliminatedFromTournament(PlayerStatus.BUSTED, false)).toBe(false);
    });

    it("is false for anyone still in, sitting out, or with no status", () => {
        for (const status of [PlayerStatus.ACTIVE, PlayerStatus.ALL_IN, PlayerStatus.FOLDED, PlayerStatus.SITTING_OUT, PlayerStatus.SEATED]) {
            expect(isEliminatedFromTournament(status, true)).toBe(false);
        }
        expect(isEliminatedFromTournament(undefined, true)).toBe(false);
        expect(isEliminatedFromTournament(null, true)).toBe(false);
    });
});
