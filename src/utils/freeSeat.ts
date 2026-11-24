/**
 * The first free seat's button on the table, the same one a player taps on the
 * felt, or null when no seat can be joined. Maison 52's dock "Take a seat"
 * (Dzeezbtc/ui#38) presses it, so it opens the same buy-in as tapping the seat.
 */
export const firstFreeSeatButton = (root: ParentNode): HTMLButtonElement | null => root.querySelector<HTMLButtonElement>("[data-part=\"vacant-seat\"] button:not([disabled])");

/** Press the first free seat's button; false when there is none to join. */
export const openFirstFreeSeat = (root: ParentNode): boolean => {
    const button = firstFreeSeatButton(root);
    if (!button) return false;
    button.click();
    return true;
};
