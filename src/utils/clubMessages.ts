import { hasElements } from "./guards";

/** A club's message, in the player's language (the club service's player feed). */
export interface ClubMessage {
    id: string;
    kind: "dropdown" | "banner" | "poster" | "notice";
    club: string;
    text: string;
    headline: string | null;
    /** A poster's picture (block52-club#4); the service only sends web or inline images. */
    image?: string | null;
    /** A poster's place in the carousel, first is 1. */
    order?: number | null;
    jump: { type: "none" } | { type: "club" } | { type: "table"; gameId: string; name: string };
    sentAt: string;
}

const SEEN_KEY = "b52.club.messages.seen";
/** More than a day's messages at the highest daily limits. */
const SEEN_LIMIT = 300;

export function readSeenMessages(): string[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
        return [];
    }
}

export function markMessageSeen(id: string): void {
    try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...readSeenMessages().filter(seen => seen !== id), id].slice(-SEEN_LIMIT)));
    } catch (err) {
        console.error("Could not remember a seen message:", err);
    }
}

/** The oldest message of this kind the player hasn't seen, so they arrive in the order sent. */
export function nextMessage(messages: ClubMessage[], kind: ClubMessage["kind"], seen: string[]): ClubMessage | null {
    const unseen = messages.filter(m => m.kind === kind && !seen.includes(m.id));
    if (!hasElements(unseen)) return null;
    return [...unseen].sort((a, b) => a.sentAt.localeCompare(b.sentAt))[0];
}

/** Where a message's button goes, or null when it has none. */
export function messageLink(message: ClubMessage): string | null {
    if (message.jump.type === "club") return `/club/${encodeURIComponent(message.club)}`;
    if (message.jump.type === "table") return `/table/${message.jump.gameId}`;
    return null;
}

/** The posters to show when the lobby opens: up to 3 unseen, in the club's order (block52-club#4). */
export function nextPosters(messages: ClubMessage[], seen: string[], max = 3): ClubMessage[] {
    return messages
        .filter(m => m.kind === "poster" && !seen.includes(m.id))
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.sentAt.localeCompare(b.sentAt))
        .slice(0, max);
}
