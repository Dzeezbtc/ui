import { useSyncExternalStore } from "react";

/**
 * Which operator's look the chat wears (block52-chat#2). Block52 is the
 * default; an operator with its own UI (e.g. Texas Hodl) sets its brand once
 * at startup, and the player can switch it from the logos in the chat header.
 * Every sticker, the chat panel, throwables and seat bubbles follow it.
 */
export type ChatBrand = "block52" | "texashodl";

const LS_BRAND = "b52.chat.brand";

/** The player's last pick from the header logos (also a QA override): localStorage "b52.chat.brand". */
function previewOverride(): ChatBrand | undefined {
    try {
        const v = localStorage.getItem(LS_BRAND);
        return v === "texashodl" || v === "block52" ? v : undefined;
    } catch {
        return undefined;
    }
}

let brand: ChatBrand = previewOverride() ?? "block52";

const listeners = new Set<() => void>();

export const configureChatBrand = (b: ChatBrand): void => {
    if (b === brand) return;
    brand = b;
    listeners.forEach(l => l());
};

/** The player picked a look from the chat header: switch now and remember it. */
export const setChatBrand = (b: ChatBrand): void => {
    try {
        localStorage.setItem(LS_BRAND, b);
    } catch {
        // Private mode: the switch still applies for this visit.
    }
    configureChatBrand(b);
};

export const getChatBrand = (): ChatBrand => brand;

const subscribe = (l: () => void): (() => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

/** The current brand; re-renders the caller when the player switches it. */
export const useChatBrand = (): ChatBrand => useSyncExternalStore(subscribe, getChatBrand, getChatBrand);

/** Texas Hodl's design tokens (texashodl.net). */
export const TEXAS_HODL = {
    orange: "#ff8500",
    red: "#ff4f3f",
    pink: "#f12cff",
    violet: "#6e36ff",
    ink: "#030305",
    panel: "#09090e",
    line: "#ffffff1a",
    font: "Geist, 'Geist Fallback', Arial, sans-serif"
} as const;

/** Extra class for the chat's root elements: " b52-th" in Texas Hodl's look. */
export const brandClass = (): string => (brand === "texashodl" ? " b52-th" : "");
