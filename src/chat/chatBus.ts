/**
 * Table chat bus (block52-chat#1): a small module-level pub/sub that decouples
 * the chat UI from the transport. Chat rides the SAME WebSocket the game already
 * uses (near-zero extra hosting cost): the host registers a sender that puts a
 * {type:"chat"} frame on the wire, and forwards inbound chat frames here.
 *
 * A message is either typed text or a quick-chat sticker (block52-chat#2). Own
 * messages echo locally on send, so the chat box and the seat bubbles work
 * standalone before the ws-server relays chat to other players (#6).
 */
import { RateLimiter, STICKER_RULE, THROW_RULE } from "./rateLimit";
import { findSticker } from "./stickers";
import { findThrowable } from "./throwables";

export interface ChatMessage {
    id: string;
    /** Sender's wallet address. Set for everyone, including you once the host registers your address. */
    from?: string;
    /** Typed text; for a sticker, its label (so logs and screen readers read it). */
    text: string;
    /** Quick-chat sticker id (block52-chat#2), when this message is a sticker. */
    sticker?: string;
    /** Throwable id (block52-chat#7), when this message is a throw at another player. */
    throwId?: string;
    /** The target player's address, for a throw. */
    to?: string;
    ts: number;
    /** True for messages this client sent. */
    mine: boolean;
}

/** What goes on the wire for one send. */
export interface OutgoingChat {
    text: string;
    sticker?: string;
    throwId?: string;
    to?: string;
}

const MAX_MESSAGES = 100;
/** @deprecated kept for callers; the real limits live in rateLimit.ts. */
export const STICKER_COOLDOWN_MS = STICKER_RULE.minGapMs;
/** @deprecated kept for callers; the real limits live in rateLimit.ts. */
export const THROW_COOLDOWN_MS = THROW_RULE.minGapMs;

let messages: ChatMessage[] = [];
const listeners = new Set<(messages: ChatMessage[]) => void>();
let sender: ((out: OutgoingChat) => void) | null = null;
let localAddress: string | undefined;
const stickerLimit = new RateLimiter(STICKER_RULE);
const throwLimit = new RateLimiter(THROW_RULE);

/** Ms until we may send another sticker (0 = now). */
export function stickerWaitMs(now: number = Date.now()): number {
    return stickerLimit.waitMs(now);
}

/** Ms until we may throw again (0 = now), and throws left in the window. */
export function throwStatus(now: number = Date.now()): { waitMs: number; remaining: number } {
    return { waitMs: throwLimit.waitMs(now), remaining: throwLimit.remaining(now) };
}

/** Stickers left in the current window. */
export function stickersRemaining(now: number = Date.now()): number {
    return stickerLimit.remaining(now);
}
let seq = 0;

function emit(): void {
    const snapshot = messages;
    listeners.forEach(l => l(snapshot));
}

/** Append a chat message (capped to the most recent {@link MAX_MESSAGES}). */
export function pushChatMessage(msg: Omit<ChatMessage, "id">): void {
    // An unknown sticker/throwable id (an older/newer client) shows as its text only.
    const sticker = findSticker(msg.sticker) ? msg.sticker : undefined;
    const throwId = findThrowable(msg.throwId) && msg.to ? msg.throwId : undefined;
    const next = messages.concat({ ...msg, sticker, throwId, to: throwId ? msg.to : undefined, id: `c${Date.now()}_${seq++}` });
    messages = next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    emit();
}

/** Subscribe to the message list; returns an unsubscribe. */
export function subscribeChatMessages(listener: (messages: ChatMessage[]) => void): () => void {
    listeners.add(listener);
    listener(messages);
    return () => {
        listeners.delete(listener);
    };
}

export function getChatMessages(): ChatMessage[] {
    return messages;
}

/** The host registers the real WS sender here (and null on teardown). */
export function registerChatSender(fn: ((out: OutgoingChat) => void) | null): void {
    sender = fn;
}

/** The host registers the local player's address, so your own messages can bubble above your seat. */
export function registerLocalAddress(address: string | undefined): void {
    localAddress = address;
}

export function getLocalAddress(): string | undefined {
    return localAddress;
}

/**
 * Send typed text: echo it locally straight away (so you see your own message
 * without any backend), then put it on the wire via the registered sender.
 */
export function sendChat(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    pushChatMessage({ from: localAddress, text: trimmed, ts: Date.now(), mine: true });
    sender?.({ text: trimmed });
}

/**
 * Send a quick-chat sticker. Returns false (and sends nothing) for an unknown
 * sticker or inside the cooldown.
 */
export function sendSticker(id: string, now: number = Date.now()): boolean {
    const sticker = findSticker(id);
    if (!sticker || !stickerLimit.tryTake(now)) return false;
    pushChatMessage({ from: localAddress, text: sticker.label, sticker: id, ts: now, mine: true });
    sender?.({ text: sticker.label, sticker: id });
    return true;
}

/**
 * Throw something at another player's seat (block52-chat#7). Returns false (and
 * sends nothing) for an unknown throwable, no target, a throw at yourself, or
 * inside the cooldown.
 */
export function sendThrow(id: string, to: string, now: number = Date.now()): boolean {
    const t = findThrowable(id);
    if (!t || !to || to.toLowerCase() === localAddress?.toLowerCase() || !throwLimit.tryTake(now)) return false;
    pushChatMessage({ from: localAddress, text: t.label, throwId: id, to, ts: now, mine: true });
    sender?.({ text: t.label, throwId: id, to });
    return true;
}

/** Clear the log (e.g. when switching tables). */
export function clearChat(): void {
    messages = [];
    emit();
}

/** Test helper: reset module state. */
export function __resetChatForTests(): void {
    messages = [];
    sender = null;
    localAddress = undefined;
    stickerLimit.reset();
    throwLimit.reset();
    listeners.clear();
}
