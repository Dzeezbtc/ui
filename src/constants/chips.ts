/**
 * Poker chip denominations and their associated chip images.
 *
 * Each entry maps a dollar value threshold to the chip image file.
 * Images are on the cards CDN in two styles × two sets (ui#842), chosen by the
 * "Marble Chips" setting and the game format:
 *   - marble (default): photoreal marble, pearl value on a black face
 *     (chips/marble-pearl/{cash,tournament}/*.webp);
 *   - notched: flat vector chips, sharpest at small sizes
 *     (chips/notched/{cash,tournament}/*.svg).
 * Cash sets carry $ on dollars and ¢ on cents; tournament sets are points with
 * no currency and no fractional chips. *
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

/** The two chip looks (ui#842). */
export type ChipStyle = "marble" | "notched";

/** Folder and file type of each style under the CDN chips folder. */
const CHIP_STYLE_FILES: Record<ChipStyle, { dir: string; ext: string }> = {
    marble: { dir: "marble-pearl", ext: "webp" },
    notched: { dir: "notched", ext: "svg" }
};

/** Every denomination, largest first. Values are in dollars (cash) or chips (tournament). */
const DENOMINATIONS: { value: number; name: string; color: string }[] = [
    { value: 5000000, name: "5000000chip", color: "platinum" },
    { value: 1000000, name: "1000000chip", color: "gold" },
    { value: 250000, name: "250000chip", color: "striped blue/orange" },
    { value: 100000, name: "100000chip", color: "pink" },
    { value: 25000,  name: "25000chip",  color: "blue" },
    { value: 5000,   name: "5000chip",   color: "orange" },
    { value: 1000,   name: "1000chip",   color: "yellow" },
    { value: 500,    name: "500chip",    color: "purple" },
    { value: 100,    name: "100chip",    color: "black" },
    { value: 25,     name: "25chip",     color: "green" },
    { value: 5,      name: "5chip",      color: "red" },
    { value: 1,      name: "1chip",      color: "white" },
    // Cent denominations (cash only; values in dollars)
    { value: 0.5,    name: "50cent",     color: "purple" },
    { value: 0.25,   name: "25cent",     color: "green" },
    { value: 0.1,    name: "10cent",     color: "yellow" },
    { value: 0.05,   name: "5cent",      color: "blue" },
    { value: 0.01,   name: "1cent",      color: "red" },
];

const buildChipSet = (style: ChipStyle, isTournament: boolean): ChipDenomination[] => {
    const { dir, ext } = CHIP_STYLE_FILES[style];
    const set = isTournament ? "tournament" : "cash";
    return DENOMINATIONS.filter(d => !isTournament || d.value >= 1).map(d => ({
        value: d.value,
        file: `${dir}/${set}/${d.name}.${ext}`,
        color: d.color
    }));
};

const CHIP_SETS: Record<ChipStyle, { cash: ChipDenomination[]; tournament: ChipDenomination[] }> = {
    marble: { cash: buildChipSet("marble", false), tournament: buildChipSet("marble", true) },
    notched: { cash: buildChipSet("notched", false), tournament: buildChipSet("notched", true) }
};

/**
 * The chips to draw: cash ($/¢) or tournament (points, same colours as the dollar
 * chips, no fractional chips; 1/5/25/100… make exact change for any whole-number
 * bet), in the chosen style. Largest first. Returns a stable array per style/set.
 */
export const getChipSet = (style: ChipStyle, isTournament: boolean): ChipDenomination[] =>
    isTournament ? CHIP_SETS[style].tournament : CHIP_SETS[style].cash;

/** Cash chips in the default (marble) style. */
export const CHIP_DENOMINATIONS: ChipDenomination[] = getChipSet("marble", false);

/** Tournament chips in the default (marble) style. */
export const TOURNAMENT_CHIP_DENOMINATIONS: ChipDenomination[] = getChipSet("marble", true);

/** Fallback chip used for amounts < $1 */
export const DEFAULT_CHIP_FILE = "marble-pearl/cash/1chip.webp";

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
