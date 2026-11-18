import { useSyncExternalStore } from "react";

/**
 * Which look the chat wears (block52-chat#2). Two layers:
 *
 *  1. The style pick — Block52 (default) or Texas Hodl. An operator sets it once
 *     at startup (configureChatBrand); the player can switch it from the logos
 *     in the chat header (setChatBrand), and that pick is remembered.
 *  2. The table skin — flagship, chipchair, badbeat or maison. The host passes
 *     the player's table style in (setChatTableSkin, same ids as the UI's
 *     TableStyle); while a skin is on, the chat wears it and the header logos
 *     hide. Plain tables (modern, classic, nouns) fall back to the pick.
 *
 * Every sticker, emoji, the chat panel, throwables and seat bubbles follow it.
 */
export type TableSkin = "flagship" | "chipchair" | "badbeat" | "maison";
export type StylePick = "block52" | "texashodl";
export type ChatBrand = StylePick | TableSkin;

export const TABLE_SKINS: readonly TableSkin[] = ["flagship", "chipchair", "badbeat", "maison"];
const PICKS: readonly StylePick[] = ["block52", "texashodl"];

export const isTableSkin = (v: unknown): v is TableSkin => typeof v === "string" && (TABLE_SKINS as readonly string[]).includes(v);
export const isChatBrand = (v: unknown): v is ChatBrand => isTableSkin(v) || (typeof v === "string" && (PICKS as readonly string[]).includes(v));

const LS_BRAND = "b52.chat.brand";

/**
 * The player's last pick from the header logos. Also a QA override: setting
 * localStorage "b52.chat.brand" to a skin id ("maison") previews that skin on any table.
 */
function stored(): ChatBrand | undefined {
    try {
        const v = localStorage.getItem(LS_BRAND);
        return isChatBrand(v) ? v : undefined;
    } catch {
        return undefined;
    }
}

const initial = stored();
let pick: StylePick = initial && !isTableSkin(initial) ? initial : "block52";
let skin: TableSkin | undefined;
/** A skin forced from localStorage for QA; wins over the table's own skin. */
const previewSkin: TableSkin | undefined = isTableSkin(initial) ? initial : undefined;
let brand: ChatBrand = previewSkin ?? pick;

const listeners = new Set<() => void>();
function update(): void {
    const next = previewSkin ?? skin ?? pick;
    if (next === brand) return;
    brand = next;
    listeners.forEach(l => l());
}

/** Operator/host setup: a style pick ("block52" | "texashodl") or, as a shortcut, a table skin. */
export const configureChatBrand = (b: ChatBrand): void => {
    if (isTableSkin(b)) skin = b;
    else {
        pick = b;
        skin = undefined;
    }
    update();
};

/** The player picked a look from the chat header: switch now and remember it. */
export const setChatBrand = (b: StylePick): void => {
    try {
        localStorage.setItem(LS_BRAND, b);
    } catch {
        // Private mode: the switch still applies for this visit.
    }
    pick = b;
    update();
};

/**
 * The table skin the player is looking at, from the UI's table style
 * ("flagship", "chipchair", "badbeat", "maison"; anything else, or undefined,
 * means no skin and the chat falls back to the style pick).
 */
export const setChatTableSkin = (tableStyle: string | undefined): void => {
    skin = isTableSkin(tableStyle) ? tableStyle : undefined;
    update();
};

/** The chat brand a table style gives on its own (plain styles → Block52). */
export const chatBrandForTableStyle = (style: string): ChatBrand => (isTableSkin(style) ? style : "block52");

export const getChatBrand = (): ChatBrand => brand;

const subscribe = (l: () => void): (() => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

/** The current brand; re-renders the caller when it changes (skin switch or header pick). */
export const useChatBrand = (): ChatBrand => useSyncExternalStore(subscribe, getChatBrand, getChatBrand);

/** The table skin the chat is wearing, if any. */
export const tableSkinOf = (b: ChatBrand): TableSkin | undefined => (isTableSkin(b) ? b : undefined);

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

/** Extra class for the chat's root elements: " b52-th" in Texas Hodl's look, " b52-sk b52-sk-<skin>" for a table skin. */
export const brandClass = (b: ChatBrand = brand): string => (b === "texashodl" ? " b52-th" : isTableSkin(b) ? ` b52-sk b52-sk-${b}` : "");
