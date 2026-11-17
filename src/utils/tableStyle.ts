import { isString } from "./guards";
import type { StageShape } from "../config/stageGeometry";

/**
 * The table's look. "modern", "classic" and "nouns" restyle the felt and rail;
 * "chipchair" (the Chip and a Chair theme) and "flagship" (the Block52
 * flagship look) are full skins: seats, buttons, panels and the felt, each
 * from one scoped stylesheet in components/playPage/skins/. Every style shows
 * the same components, so the controls and behaviour never differ between them.
 */
export type TableStyle = "modern" | "classic" | "nouns" | "chipchair" | "flagship";

/** Every style, in the order the style button cycles through them. */
export const TABLE_STYLES: readonly TableStyle[] = ["modern", "classic", "nouns", "chipchair", "flagship"];

/** What the style button and the mobile menu call each style. */
export const TABLE_STYLE_LABELS: Record<TableStyle, string> = {
    modern: "Modern",
    classic: "Classic",
    nouns: "Nouns",
    chipchair: "Chip and a Chair",
    flagship: "Block52 Flagship"
};

/** True when the value names a table style. */
export const isTableStyle = (value: unknown): value is TableStyle => isString(value) && TABLE_STYLES.some(s => s === value);

/** The style after this one, wrapping back to the first. */
export const nextTableStyle = (style: TableStyle): TableStyle => TABLE_STYLES[(TABLE_STYLES.indexOf(style) + 1) % TABLE_STYLES.length];

/**
 * The style a build starts in, from VITE_TABLE_STYLE. Anything unknown (or no
 * value at all) starts in "modern", the house look.
 */
export const tableStyleFromEnv = (value: unknown): TableStyle => (isTableStyle(value) ? value : "modern");

/** Club themes (block52-club setting profile.theme) that come with their own table skin. */
const THEME_SKINS: Record<string, TableStyle> = {
    chipandachair: "chipchair"
};

/** The table skin a club theme brings, or null when the theme only styles the lobby. */
export const skinForTheme = (theme: string): TableStyle | null => THEME_SKINS[theme] ?? null;

/** The stage shape a style lays out on: the flagship has its own phone table (a wide oval). */
export const stageShapeFor = (style: TableStyle): StageShape => (style === "flagship" ? "flagship" : "standard");
