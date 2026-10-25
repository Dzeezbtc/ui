/**
 * Per-player chat settings (block52-chat#5), stored in localStorage:
 *  - chat on/off: off hides the chat box and every bubble, and stops sending;
 *  - seat bubbles on/off: keep the chat box but no bubbles on the felt;
 *  - blocked players (stored as `muted`): their messages, stickers and throws
 *    are hidden everywhere (#13);
 *  - mute spectators: hide messages from anyone not seated at the table;
 *  - throwables on/off (#7).
 * Blocking only hides on this client; nothing is sent to anyone.
 */
import { useEffect, useState } from "react";

export interface ChatSettings {
    enabled: boolean;
    seatBubbles: boolean;
    muteSpectators: boolean;
    /** Show throwables flying between seats (#7). */
    throwables: boolean;
    /** Sticker art style (block52-chat#2): four meme styles, or the Chip Crew cartoons. */
    stickerStyle: StickerStyle;
    /** Blocked players' lower-cased wallet addresses (#13). */
    muted: string[];
}

const LS_KEY = "b52.chat.settings";
export type StickerStyle = "wojak" | "rage" | "hose" | "sticks" | "cartoon";

export const STICKER_STYLES: readonly { id: StickerStyle; label: string }[] = [
    { id: "wojak", label: "Wojak" },
    { id: "rage", label: "Rage comic" },
    { id: "hose", label: "Rubber hose" },
    { id: "sticks", label: "Cyanide-style stick figures" },
    { id: "cartoon", label: "Chip Crew" }
];

const DEFAULTS: ChatSettings = { enabled: true, seatBubbles: true, muteSpectators: false, throwables: true, stickerStyle: "wojak", muted: [] };

function load(): ChatSettings {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return DEFAULTS;
        const p = JSON.parse(raw);
        return {
            enabled: typeof p.enabled === "boolean" ? p.enabled : DEFAULTS.enabled,
            seatBubbles: typeof p.seatBubbles === "boolean" ? p.seatBubbles : DEFAULTS.seatBubbles,
            muteSpectators: typeof p.muteSpectators === "boolean" ? p.muteSpectators : DEFAULTS.muteSpectators,
            throwables: typeof p.throwables === "boolean" ? p.throwables : DEFAULTS.throwables,
            stickerStyle: STICKER_STYLES.some(s => s.id === p.stickerStyle) ? p.stickerStyle : DEFAULTS.stickerStyle,
            muted: Array.isArray(p.muted) ? p.muted.filter((a: unknown) => typeof a === "string").map((a: string) => a.toLowerCase()) : []
        };
    } catch {
        return DEFAULTS;
    }
}

let settings: ChatSettings = load();
const listeners = new Set<(s: ChatSettings) => void>();

function save(next: ChatSettings): void {
    settings = next;
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
        /* blocked storage: settings still apply this session */
    }
    listeners.forEach(l => l(settings));
}

export const getChatSettings = (): ChatSettings => settings;

export function updateChatSettings(patch: Partial<Omit<ChatSettings, "muted">>): void {
    save({ ...settings, ...patch });
}

export function setPlayerMuted(address: string, muted: boolean): void {
    const a = address.toLowerCase();
    const rest = settings.muted.filter(m => m !== a);
    save({ ...settings, muted: muted ? [...rest, a] : rest });
}

export const isPlayerMuted = (address: string | undefined, s: ChatSettings = settings): boolean =>
    !!address && s.muted.includes(address.toLowerCase());

/**
 * Whether a message should be shown, given the settings and who is seated.
 * Your own messages always show; with chat off nothing does.
 */
export function isMessageVisible(
    msg: { from?: string; mine: boolean },
    s: ChatSettings,
    seatedAddresses?: readonly string[]
): boolean {
    if (!s.enabled) return false;
    if (msg.mine) return true;
    if (isPlayerMuted(msg.from, s)) return false;
    if (s.muteSpectators && seatedAddresses) {
        const seated = seatedAddresses.some(a => a.toLowerCase() === msg.from?.toLowerCase());
        if (!seated) return false;
    }
    return true;
}

/** React hook: the current chat settings, re-rendering on change. */
export function useChatSettings(): ChatSettings {
    const [s, setS] = useState<ChatSettings>(settings);
    useEffect(() => {
        listeners.add(setS);
        setS(settings);
        return () => {
            listeners.delete(setS);
        };
    }, []);
    return s;
}

/** Test helper. */
export function __resetChatSettingsForTests(): void {
    settings = DEFAULTS;
    listeners.clear();
}
