/**
 * Where each seated player is on screen (block52-chat#7), so a throwable can
 * fly from one seat to another. Every SeatChatBubble registers its seat's
 * element under the player's address.
 */
const seats = new Map<string, HTMLElement>();

export function registerSeat(address: string | undefined, el: HTMLElement | null): () => void {
    if (!address || !el) return () => undefined;
    const key = address.toLowerCase();
    seats.set(key, el);
    return () => {
        if (seats.get(key) === el) seats.delete(key);
    };
}

/** The centre of a player's seat on screen, or null if they aren't seated / visible. */
export function seatCentre(address: string | undefined): { x: number; y: number } | null {
    if (!address) return null;
    const el = seats.get(address.toLowerCase());
    if (!el || !el.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
