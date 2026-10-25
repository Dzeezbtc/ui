/**
 * Which operator's look the chat wears (block52-chat#2). Block52 is the
 * default; an operator with its own UI (e.g. Texas Hodl) sets its brand once
 * at startup and every sticker and the chat panel follow it.
 */
export type ChatBrand = "block52" | "texashodl";

let brand: ChatBrand = "block52";

export const configureChatBrand = (b: ChatBrand): void => {
    brand = b;
};

export const getChatBrand = (): ChatBrand => brand;

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
