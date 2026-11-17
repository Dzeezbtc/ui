import { ActionDTO, PlayerDTO, TexasHoldemRound } from "@block52/poker-vm-sdk";
import { seatBetThisRound } from "./chipUtils";
import { hasElements } from "./guards";
import { hasFoldedOrMucked } from "./playerStatus";

/** What the 3D Bad Beat table draws at one table position. */
export interface BadBeatSeatState {
    /** The seat's two cards ("AS", or "??" face down), or null when it holds none. */
    cards: string[] | null;
    /** Its bet this round, in small blinds (0 for none). */
    bet: number;
}

/** What the 3D Bad Beat table draws. */
export interface BadBeatTableState {
    /** Per table position (the layout's order). */
    seats: BadBeatSeatState[];
    /** The table position holding the dealer disc, or null between hands. */
    dealerPosition: number | null;
    /** The pot gathered in the middle so far (not this round's bets), in small blinds. */
    pot: number;
}

/** The seat number at a table position (the ring is turned so you sit at the bottom). */
export const seatAtPosition = (positionIndex: number, startIndex: number, tableSize: number): number => ((positionIndex - startIndex + tableSize) % tableSize) + 1;

/** An amount (chain units, as a string) in small blinds; 0 when it or the blind is missing. */
export const inSmallBlinds = (amount: string | undefined, smallBlind: string | undefined): number => {
    const sb = Number(smallBlind);
    const v = Number(amount);
    if (!Number.isFinite(sb) || sb <= 0 || !Number.isFinite(v)) return 0;
    return v / sb;
};

/**
 * The live game as the 3D table draws it: each position's cards (none once
 * folded), its bet this round, where the dealer disc sits and the pot.
 */
export const badBeatTableState = (args: {
    playersBySeat: Map<number, PlayerDTO>;
    tableSize: number;
    startIndex: number;
    dealerSeat: number | null;
    round: TexasHoldemRound | undefined;
    previousActions: ActionDTO[];
    pots: string[] | undefined;
    smallBlind: string | undefined;
}): BadBeatTableState => {
    const { playersBySeat, tableSize, startIndex, dealerSeat, round, previousActions, pots, smallBlind } = args;
    let dealerPosition: number | null = null;
    const seats: BadBeatSeatState[] = [];
    for (let i = 0; i < tableSize; i++) {
        const seat = seatAtPosition(i, startIndex, tableSize);
        const player = playersBySeat.get(seat);
        if (player && seat === dealerSeat) dealerPosition = i;
        const holding = player && hasElements(player.holeCards) && !hasFoldedOrMucked(player.status);
        seats.push({
            cards: holding ? player.holeCards!.slice(0, 2) : null,
            bet: inSmallBlinds(seatBetThisRound(player, round, previousActions), smallBlind)
        });
    }
    // the pots count this round's bets too; those still stand in front of their seats
    const total = (pots ?? []).reduce((sum, p) => sum + inSmallBlinds(p, smallBlind), 0);
    const pot = Math.max(0, total - seats.reduce((sum, s) => sum + s.bet, 0));
    return { seats, dealerPosition, pot };
};
