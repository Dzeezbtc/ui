import { isString } from "./guards";
import type { StageShape } from "../config/stageGeometry";

/**
 * The table's look. "modern", "classic" and "nouns" restyle the felt and rail;
 * "chipchair" (the Chip and a Chair theme), "flagship" (the Block52
 * flagship look), "badbeat" (Bad Beat) and "maison" (Maison 52), the last two
 * 3D tables built on the flagship's layout, are full skins: seats, buttons, panels and the felt, each
 * from one scoped stylesheet in components/playPage/skins/. Every style shows
 * the same components, so the controls and behaviour never differ between them.
 */
export type TableStyle = "modern" | "classic" | "nouns" | "chipchair" | "flagship" | "badbeat" | "maison";

/** Every style, in the order the style button cycles through them. */
export const TABLE_STYLES: readonly TableStyle[] = ["modern", "classic", "nouns", "chipchair", "flagship", "badbeat", "maison"];

/** What the style button and the mobile menu call each style. */
export const TABLE_STYLE_LABELS: Record<TableStyle, string> = {
    modern: "Modern",
    classic: "Classic",
    nouns: "Nouns",
    chipchair: "Chip and a Chair",
    flagship: "Block52 Flagship",
    badbeat: "Bad Beat",
    maison: "Maison 52"
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

/**
 * The style a table link asks for with ?style= (e.g. /table/0x…?style=maison,
 * a demo link that opens straight into one skin), or the fallback when the
 * link names no style or an unknown one. Case and spaces are ignored.
 */
export const tableStyleFromUrl = (search: string, fallback: TableStyle): TableStyle => {
    const asked = new URLSearchParams(search).get("style")?.trim().toLowerCase();
    return isTableStyle(asked) ? asked : fallback;
};

/** Club themes (block52-club setting profile.theme) that come with their own table skin. */
const THEME_SKINS: Record<string, TableStyle> = {
    chipandachair: "chipchair",
    badbeat: "badbeat",
    maison: "maison"
};

/** The table skin a club theme brings, or null when the theme only styles the lobby. */
export const skinForTheme = (theme: string): TableStyle | null => THEME_SKINS[theme] ?? null;

/**
 * True for the styles laid out like the Block52 Flagship: the clean top bar,
 * the tools under the balance, the settings cog, the even seats and bets in
 * front. Each brings its own look (Bad Beat restyles the flagship's parts).
 */
export const usesFlagshipLayout = (style: TableStyle): boolean => style === "flagship" || style === "chipchair" || isThreeTableStyle(style);

/** True for the styles that deal the board and shown hands face down, roll them over and lift them flat (Bad Beat, Maison 52, Chip and a Chair). */
export const dealsFaceDown = (style: TableStyle): boolean => style === "chipchair" || isThreeTableStyle(style);

/** True for the styles drawn as a 3D table (Bad Beat, Maison 52): a WebGL table under the plates, cards and chips. */
export const isThreeTableStyle = (style: TableStyle): style is "badbeat" | "maison" => style === "badbeat" || style === "maison";

/**
 * The table root's data-skin: a style on the flagship layout shares the
 * flagship's stylesheet, and its own look comes from data-look.
 */
export const skinAttrFor = (style: TableStyle): TableStyle => (usesFlagshipLayout(style) ? "flagship" : style);

/** The stage shape a style lays out on: the flagship's phone table (a wide oval); a 3D table (Bad Beat, Maison 52) has its own camera and fit. */
export const stageShapeFor = (style: TableStyle): StageShape => (isThreeTableStyle(style) || style === "chipchair" ? style : usesFlagshipLayout(style) ? "flagship" : "standard");

/** The flat chip set a style draws (BadBeatChip), for the styles that draw their own. */
export const flatChipLookFor = (style: TableStyle): "badbeat" | "maison" | "chipchair" => (style === "maison" || style === "chipchair" ? style : "badbeat");
