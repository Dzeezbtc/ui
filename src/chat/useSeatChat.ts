import { useEffect, useMemo, useState } from "react";
import { ChatMessage, subscribeChatMessages } from "./chatBus";
import { isMessageVisible, useChatSettings } from "./chatSettings";

/** How long a seat bubble stays up. */
export const SEAT_BUBBLE_MS = 4000;

/**
 * The newest message a seated player sent in the last {@link SEAT_BUBBLE_MS},
 * for their speech bubble above the seat (block52-chat#3) — or null. A newer
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
        if (m.from?.toLowerCase() === a) return m;
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
        const t = setTimeout(() => setNow(Date.now()), Math.max(0, latest.ts + SEAT_BUBBLE_MS - Date.now()) + 20);
        return () => clearTimeout(t);
    }, [latest]);

    if (!latest || !settings.seatBubbles || !isMessageVisible(latest, settings)) return null;
    return latest;
}
