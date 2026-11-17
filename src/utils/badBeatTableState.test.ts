import { PlayerDTO, PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";
import { badBeatTableState, inSmallBlinds, seatAtPosition } from "./badBeatTableState";

const player = (seat: number, holeCards: string[] | undefined, status = PlayerStatus.ACTIVE, sumOfBets = "0") =>
    ({ seat, address: `0x${seat}`, holeCards, status, sumOfBets }) as unknown as PlayerDTO;

describe("seatAtPosition", () => {
    it("turns the ring so the start seat sits at position 0", () => {
        expect(seatAtPosition(0, 0, 6)).toBe(1);
        expect(seatAtPosition(0, 2, 6)).toBe(5);
        expect(seatAtPosition(2, 2, 6)).toBe(1);
    });
});

describe("inSmallBlinds", () => {
    it("reads an amount in small blinds, 0 when either is missing", () => {
        expect(inSmallBlinds("60000000", "10000000")).toBe(6);
        expect(inSmallBlinds(undefined, "10")).toBe(0);
        expect(inSmallBlinds("10", undefined)).toBe(0);
        expect(inSmallBlinds("10", "0")).toBe(0);
    });
});

describe("badBeatTableState", () => {
    const base = { tableSize: 4, startIndex: 0, round: TexasHoldemRound.PREFLOP, previousActions: [], smallBlind: "10", mySeat: 1 };

    it("gives each position its cards, none once folded, and finds the dealer", () => {
        const players = new Map([
            [1, player(1, ["AS", "KD"])],
            [2, player(2, ["??", "??"], PlayerStatus.FOLDED)],
            [3, player(3, ["??", "??"])]
        ]);
        const s = badBeatTableState({ ...base, playersBySeat: players, dealerSeat: 3, pots: [] });
        expect(s.seats.map(x => x.cards)).toEqual([["AS", "KD"], null, ["??", "??"], null]);
        expect(s.dealerPosition).toBe(2);
        // your cards stay on the felt; nobody else has shown
        expect(s.seats.map(x => x.shown)).toEqual([false, false, false, false]);
    });

    it("marks another player's face-up cards as shown", () => {
        const players = new Map([
            [1, player(1, ["AS", "KD"])],
            [3, player(3, ["QH", "QC"])]
        ]);
        const s = badBeatTableState({ ...base, playersBySeat: players, dealerSeat: null, pots: [] });
        expect(s.seats[2].shown).toBe(true);
        expect(s.seats[0].shown).toBe(false);
    });

    it("leaves no dealer for an empty seat and draws only the pot gathered in the middle", () => {
        const s = badBeatTableState({ ...base, playersBySeat: new Map(), dealerSeat: 2, pots: ["300", "100"] });
        expect(s.dealerPosition).toBeNull();
        expect(s.pot).toBe(40);
    });
});
