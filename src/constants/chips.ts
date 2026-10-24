/**
 * Poker chip denominations and their associated chip images.
 *
 * Each entry maps a dollar value threshold to the chip image file.
 * Images are the notched set on the cards CDN (ui#842): flat vector chips with the
 * value as outlines, readable at table size. Two sets:
 *   - cash (chips/notched/cash/*.svg): real USDC, $ on dollars and ¢ on cents;
 *   - tournament (chips/notched/tournament/*.svg): points, no currency.
 * Sorted descending so the first match ≥ threshold wins.
 * The $1 chip also covers any amount less than $1.
 *
 * Visual colors (for reference — actual colours come from the images):
 *   $1      = white
 *   $5      = red
 *   $25     = green
 *   $100    = black
 *   $500    = purple
 *   $1000   = yellow
 *   $5000   = orange
 *   $25000  = blue
 *   $100000 = pink
 *   $250000 = striped blue/orange
 *   $1000000 = gold
 *   $5000000 = platinum
 */

export interface ChipDenomination {
    value: number;
    file: string;
    color: string;
}

/** Cash games: real USDC, so the chips carry $ and ¢. Values are in dollars. */
export const CHIP_DENOMINATIONS: ChipDenomination[] = [
    { value: 5000000, file: "notched/cash/5000000chip.svg", color: "platinum" },
    { value: 1000000, file: "notched/cash/1000000chip.svg", color: "gold" },
    { value: 250000, file: "notched/cash/250000chip.svg", color: "striped blue/orange" },
    { value: 100000, file: "notched/cash/100000chip.svg", color: "pink" },
    { value: 25000,  file: "notched/cash/25000chip.svg",  color: "blue" },
    { value: 5000,   file: "notched/cash/5000chip.svg",   color: "orange" },
    { value: 1000,   file: "notched/cash/1000chip.svg",   color: "yellow" },
    { value: 500,    file: "notched/cash/500chip.svg",     color: "purple" },
    { value: 100,    file: "notched/cash/100chip.svg",     color: "black" },
    { value: 25,     file: "notched/cash/25chip.svg",      color: "green" },
    { value: 5,      file: "notched/cash/5chip.svg",       color: "red" },
    { value: 1,      file: "notched/cash/1chip.svg",       color: "white" },
    // Cent denominations (values in dollars)
    { value: 0.5,    file: "notched/cash/50cent.svg",      color: "purple" },
    { value: 0.25,   file: "notched/cash/25cent.svg",      color: "green" },
    { value: 0.1,    file: "notched/cash/10cent.svg",      color: "yellow" },
    { value: 0.05,   file: "notched/cash/5cent.svg",       color: "blue" },
    { value: 0.01,   file: "notched/cash/1cent.svg",       color: "red" },
];

/**
 * Sit & Go / tournaments: point chips with no currency mark (ui#842). Same colours
 * as the dollar chips (green = 25 in both). No fractional chips; 1/5/25/100…
 * make exact change for any whole-number bet. Values are in chips.
 */
export const TOURNAMENT_CHIP_DENOMINATIONS: ChipDenomination[] = CHIP_DENOMINATIONS.filter(d => d.value >= 1).map(d => ({
    ...d,
    file: d.file.replace("notched/cash/", "notched/tournament/")
}));

/** Fallback chip used for amounts < $1 */
export const DEFAULT_CHIP_FILE = "notched/cash/1chip.svg";

/** Maximum number of action groups (side-by-side chip placements) to display */
export const MAX_ACTION_GROUPS = 5;

/** Maximum number of denomination columns within a single action group */
export const MAX_STACKS_PER_GROUP = 8;

/** Maximum number of overlapping chips within a single stack */
export const MAX_CHIPS_PER_STACK = 6;

/** Horizontal gap between action groups (px) — wider than within-group spacing */
export const ACTION_GROUP_GAP = 12;

/** Horizontal gap between denomination stacks within one group (px) */
export const STACK_GAP = 29;
