/**
 * What a seat shows at a Sit & Go or tournament once players bust.
 *
 * With "Hide busted players" on (the default setting), a busted player's seat
 * goes completely blank: no avatar, no name, no EMPTY marker. It goes once the
 * hand that knocked them out is over, so a hand shown at the showdown is still
 * seen (poker-vm#2758). When that hand ends the tournament (one player left), the
 * table stays on that hand, so busted players go at once. Once the
 * tournament has started, a seat nobody is in is blank too, since a busted
 * player may already have left it. Before the start, an empty seat shows the
 * EMPTY marker as players register. Cash tables never blank a seat.
 * With the setting off, busted players stay on the table, dimmed.
 */
import { PlayerStatus, TexasHoldemRound } from "@block52/poker-vm-sdk";
import { isTournamentFormat } from "./gameFormatUtils";

/** Players at the table who haven't busted. */
export const playersLeft = (statuses: readonly (PlayerStatus | undefined)[]): number => statuses.filter(status => status !== PlayerStatus.BUSTED).length;

/** "player" = draw the player; "vacant" = draw the empty-seat marker; "blank" = draw nothing. */
export type SeatDisplay = "player" | "vacant" | "blank";

export interface SeatDisplayInput {
    hasPlayer: boolean;
    playerStatus: PlayerStatus | undefined;
    gameFormat: string | undefined;
    tournamentStarted: boolean;
    hideBusted: boolean;
    /** The hand's round: a busted player stays through the showdown and the end of the hand. */
    round: TexasHoldemRound | string | undefined;
    /** Players at the table who haven't busted. */
    playersLeft: number;
}

const BUST_HAND_ROUNDS: ReadonlySet<string> = new Set([TexasHoldemRound.SHOWDOWN, TexasHoldemRound.END]);

export function seatDisplay({ hasPlayer, playerStatus, gameFormat, tournamentStarted, hideBusted, round, playersLeft }: SeatDisplayInput): SeatDisplay {
    const blanks = hideBusted && isTournamentFormat(gameFormat);
    if (hasPlayer) {
        const bustHandShowing = BUST_HAND_ROUNDS.has(round ?? "") && playersLeft > 1;
        const gone = playerStatus === PlayerStatus.BUSTED && !bustHandShowing;
        return blanks && gone ? "blank" : "player";
    }
    return blanks && tournamentStarted ? "blank" : "vacant";
}
