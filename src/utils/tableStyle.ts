import { isString } from "./guards";

/**
 * The table's look. "modern", "classic" and "nouns" restyle the felt and rail;
 * "chipchair" is a full skin (the Chip and a Chair theme): seats, buttons,
 * panels and the felt, all from one scoped stylesheet
 * (components/playPage/skins/chipchair.css). Every style shows the same
 * components, so the controls and behaviour never differ between them.
 */
export type TableStyle = "modern" | "classic" | "nouns" | "chipchair";

/** Every style, in the order the style button cycles through them. */
export const TABLE_STYLES: readonly TableStyle[] = ["modern", "classic", "nouns", "chipchair"];

/** What the style button and the mobile menu call each style. */
export const TABLE_STYLE_LABELS: Record<TableStyle, string> = {
    modern: "Modern",
    classic: "Classic",
    nouns: "Nouns",
    chipchair: "Chip and a Chair"
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
