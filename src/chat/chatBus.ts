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
import { findSticker } from "./stickers";

export interface ChatMessage {
    id: string;
    /** Sender's wallet address. Set for everyone, including you once the host registers your address. */
    from?: string;
    /** Typed text; for a sticker, its label (so logs and screen readers read it). */
    text: string;
    /** Quick-chat sticker id (block52-chat#2), when this message is a sticker. */
    sticker?: string;
    ts: number;
    /** True for messages this client sent. */
    mine: boolean;
}

/** What goes on the wire for one send. */
export interface OutgoingChat {
    text: string;
    sticker?: string;
}

const MAX_MESSAGES = 100;
/** One sticker per player every this many ms — keeps the felt readable. */
export const STICKER_COOLDOWN_MS = 2000;

let messages: ChatMessage[] = [];
const listeners = new Set<(messages: ChatMessage[]) => void>();
let sender: ((out: OutgoingChat) => void) | null = null;
let localAddress: string | undefined;
let lastStickerAt = -Infinity;
let seq = 0;

function emit(): void {
    const snapshot = messages;
    listeners.forEach(l => l(snapshot));
}

/** Append a chat message (capped to the most recent {@link MAX_MESSAGES}). */
export function pushChatMessage(msg: Omit<ChatMessage, "id">): void {
    // An unknown sticker id (an older/newer client) shows as its text only.
    const sticker = findSticker(msg.sticker) ? msg.sticker : undefined;
    const next = messages.concat({ ...msg, sticker, id: `c${Date.now()}_${seq++}` });
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
    if (!sticker || now - lastStickerAt < STICKER_COOLDOWN_MS) return false;
    lastStickerAt = now;
    pushChatMessage({ from: localAddress, text: sticker.label, sticker: id, ts: now, mine: true });
    sender?.({ text: sticker.label, sticker: id });
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
    lastStickerAt = -Infinity;
    listeners.clear();
}
