import { useEffect, useMemo, useState } from "react";
import { ChatMessage, subscribeChatMessages } from "./chatBus";
import { isMessageVisible, useChatSettings } from "./chatSettings";

/** A sticker stays up 5s: notice it, read the caption, get the joke — with a hand on. */
export const STICKER_BUBBLE_MS = 5000;
/** Typed messages: 3s plus reading time (~60ms a character), at most 7s. */
const TEXT_MIN_MS = 3000;
const TEXT_PER_CHAR_MS = 60;
/** The longest any bubble stays up. */
export const SEAT_BUBBLE_MS = 7000;

/** How long this message's bubble stays up. */
export function bubbleMs(m: Pick<ChatMessage, "sticker" | "text">): number {
    if (m.sticker) return STICKER_BUBBLE_MS;
    return Math.min(SEAT_BUBBLE_MS, TEXT_MIN_MS + m.text.length * TEXT_PER_CHAR_MS);
}

/**
 * The newest message a seated player sent, while its bubble is still up
 * ({@link bubbleMs}), for their speech bubble above the seat (block52-chat#3) — or null. A newer
 * message replaces the bubble, so a seat never stacks bubbles. Respects the
 * chat settings (chat off, bubbles off, muted player).
 */
export function latestSeatMessage(
    messages: readonly ChatMessage[],
    address: string | undefined,
    now: number
): ChatMessage | null {
    if (!address) return null;
    const a = address.toLowerCase();
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (now - m.ts > SEAT_BUBBLE_MS) return null;
        if (m.throwId) continue; // throws fly between seats (ThrowLayer), no bubble
        if (m.from?.toLowerCase() === a) return now - m.ts <= bubbleMs(m) ? m : null;
    }
    return null;
}

export function useSeatChat(address: string | undefined): ChatMessage | null {
    const settings = useChatSettings();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => subscribeChatMessages(setMessages), []);

    const latest = useMemo(() => latestSeatMessage(messages, address, Date.now()), [messages, address, now]);

    // Re-check when the current bubble is due to expire.
    useEffect(() => {
        if (!latest) return;
        const t = setTimeout(() => setNow(Date.now()), Math.max(0, latest.ts + bubbleMs(latest) - Date.now()) + 20);
        return () => clearTimeout(t);
    }, [latest]);

    if (!latest || !settings.seatBubbles || !isMessageVisible(latest, settings)) return null;
    return latest;
}
