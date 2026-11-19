/**
 * Labels for an empty seat and its buy-in button (ui#969, ui#872), in the
 * player's language (ui#959).
 *
 * At a Sit & Go the seat is drawn when you join (utils/seatDraw), so an empty
 * seat is an entry point, not a seat you claim: its EMPTY circle is called
 * "Open Seat" and the button doesn't name a seat number. Cash tables show a
 * "+" and name the seat you pick.
 */
import { t } from "../i18n";

/** Shown on a Sit & Go buy-in so the player knows the clicked seat isn't theirs. */
export const seatDrawNote = (): string => t("buyIn.seatDrawn");

/**
 * An empty seat's marker (ui#872): a "+" circle at a cash table, an "EMPTY"
 * circle where seats are drawn (Sit & Go / tournament). `joinable` is whether
 * this viewer can take it; `label` is its accessible name and tooltip.
 */
export interface VacantSeatMarker {
    kind: "plus" | "empty";
    joinable: boolean;
    label: string;
}

export function vacantSeatMarker(seat: number, isUserAlreadyPlaying: boolean, canJoin: boolean, seatDrawn: boolean): VacantSeatMarker {
    const joinable = !isUserAlreadyPlaying && canJoin;
    if (seatDrawn) {
        return { kind: "empty", joinable, label: joinable ? t("felt.openSeat") : t("felt.seatEmpty", { seat }) };
    }
    return { kind: "plus", joinable, label: joinable ? t("felt.sitInSeat", { seat }) : t("felt.seatOpen", { seat }) };
}

export function joinSeatButtonLabel(seat: number, seatDrawn: boolean): string {
    return seatDrawn ? t("felt.confirmJoinDrawn") : t("felt.confirmJoin", { seat });
}
