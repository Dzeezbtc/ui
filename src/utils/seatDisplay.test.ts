import { GameFormat, PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";
import { playersLeft, seatDisplay, type SeatDisplayInput } from "./seatDisplay";

const input = (over: Partial<SeatDisplayInput> = {}): SeatDisplayInput => ({
    hasPlayer: true,
    playerStatus: PlayerStatus.ACTIVE,
    gameFormat: GameFormat.SIT_AND_GO,
    tournamentStarted: true,
    hideBusted: true,
    round: TexasHoldemRound.PREFLOP,
    playersLeft: 3,
    ...over
});

describe("seatDisplay", () => {
    it("blanks a busted player's seat at a Sit & Go and a tournament", () => {
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED }))).toBe("blank");
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED, gameFormat: GameFormat.TOURNAMENT }))).toBe("blank");
    });

    it("keeps a busted player through the showdown that knocked them out, so their hand is seen", () => {
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED, round: TexasHoldemRound.SHOWDOWN }))).toBe("player");
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED, round: TexasHoldemRound.END }))).toBe("player");
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED, round: TexasHoldemRound.ANTE }))).toBe("blank");
    });

    it("blanks busted players at once when that hand ended the tournament", () => {
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED, round: TexasHoldemRound.END, playersLeft: 1 }))).toBe("blank");
    });

    it("draws everyone still in", () => {
        expect(seatDisplay(input())).toBe("player");
        expect(seatDisplay(input({ playerStatus: PlayerStatus.FOLDED }))).toBe("player");
        expect(seatDisplay(input({ playerStatus: PlayerStatus.SITTING_OUT }))).toBe("player");
    });

    it("blanks an empty seat once the tournament has started", () => {
        expect(seatDisplay(input({ hasPlayer: false, playerStatus: undefined }))).toBe("blank");
    });

    it("shows the EMPTY marker before the start, while players register", () => {
        expect(seatDisplay(input({ hasPlayer: false, playerStatus: undefined, tournamentStarted: false }))).toBe("vacant");
    });

    it("keeps busted players and empty markers when the setting is off", () => {
        expect(seatDisplay(input({ playerStatus: PlayerStatus.BUSTED, hideBusted: false }))).toBe("player");
        expect(seatDisplay(input({ hasPlayer: false, playerStatus: undefined, hideBusted: false }))).toBe("vacant");
    });

    it("never blanks a cash table seat", () => {
        expect(seatDisplay(input({ gameFormat: GameFormat.CASH, playerStatus: PlayerStatus.BUSTED }))).toBe("player");
        expect(seatDisplay(input({ gameFormat: GameFormat.CASH, hasPlayer: false, playerStatus: undefined }))).toBe("vacant");
    });

    it("doesn't blank while the format is still loading", () => {
        expect(seatDisplay(input({ gameFormat: undefined, playerStatus: PlayerStatus.BUSTED }))).toBe("player");
    });
});

describe("playersLeft", () => {
    it("counts everyone but the busted", () => {
        expect(playersLeft([PlayerStatus.ACTIVE, PlayerStatus.BUSTED, PlayerStatus.FOLDED, undefined])).toBe(3);
        expect(playersLeft([PlayerStatus.BUSTED, PlayerStatus.SHOWING])).toBe(1);
    });
});
