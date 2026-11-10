/**
 * Labels for an empty seat and its buy-in button (ui#969), in the player's
 * language (ui#959).
 *
 * At a Sit & Go the seat is drawn when you join (utils/seatDraw), so an empty
 * seat is an entry point, not a seat you claim: it reads "Open Seat" and the
 * button doesn't name a seat number. Cash tables name the seat you pick.
 */
import { t } from "../i18n";

export interface VacantSeatText {
    title: string;
    subtitle: string | null;
}

/** Shown on a Sit & Go buy-in so the player knows the clicked seat isn't theirs. */
export const seatDrawNote = (): string => t("buyIn.seatDrawn");

export function vacantSeatText(seat: number, isUserAlreadyPlaying: boolean, canJoin: boolean, seatDrawn: boolean): VacantSeatText {
    if (isUserAlreadyPlaying) {
        return { title: t("felt.vacantSeat"), subtitle: null };
    }
    return {
        title: seatDrawn ? t("felt.openSeat") : t("felt.seatNumber", { seat }),
        subtitle: canJoin ? t("felt.clickToJoin") : t("felt.seatTaken")
    };
}

export function joinSeatButtonLabel(seat: number, seatDrawn: boolean): string {
    return seatDrawn ? t("felt.confirmJoinDrawn") : t("felt.confirmJoin", { seat });
}
