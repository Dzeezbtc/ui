/**
 * Bad Beat's chip colours (Dzeezbtc/ui#36), for the flat chips drawn as
 * markup: the same five as the 3D table's (utils/badBeatScene BB_CHIP_DENOMS),
 * white, crimson, ice blue, green and amber from the smallest value up, each
 * with the colour of the slash across its core (graphite on a pale chip).
 */
export const BB_FLAT_CHIP_COLORS: [number, string, string][] = [
    [500, "#f5c542", "#15181d"],
    [100, "#2ee59d", "#15181d"],
    [25, "#9fd8ff", "#15181d"],
    [5, "#ff2d55", "#ffffff"],
    [0, "#eef1f5", "#15181d"]
];

/**
 * Maison 52's chips, the "Salon plaques" (Dzeezbtc/ui#38, #40): ivory, navy,
 * bottle green, bordeaux, black and champagne gold from the smallest value up,
 * each with its mark (gold on the dark chips, espresso on ivory and champagne).
 */
export const MAISON_FLAT_CHIP_COLORS: [number, string, string][] = [
    [1000, "#d9bf8c", "#4a3418"],
    [500, "#1d1a16", "#cdb07f"],
    [100, "#6e1f2b", "#cdb07f"],
    [25, "#0f3b2e", "#cdb07f"],
    [5, "#22427a", "#cdb07f"],
    [0, "#f4eee2", "#6b4f2a"]
];

/**
 * Chip and a Chair's own chips, the "Sticker chips" (Dzeezbtc/ui#40): sky for
 * cents, then white, red, blue, lavender, yellow, pink and green up the values,
 * each with white edge blocks (ink on the white chip).
 */
export const CHIPCHAIR_FLAT_CHIP_COLORS: [number, string, string][] = [
    [5000, "#22c55e", "#ffffff"],
    [1000, "#ff6fb5", "#ffffff"],
    [500, "#ffd23f", "#ffffff"],
    [100, "#b9a2ff", "#ffffff"],
    [25, "#3d7bff", "#ffffff"],
    [5, "#ff4d3d", "#ffffff"],
    [1, "#ffffff", "#0e0e10"],
    [0, "#7fd4ff", "#ffffff"]
];

/** A look that draws its own flat chips. */
export type FlatChipLook = "badbeat" | "maison" | "chipchair";

const FLAT_CHIP_PALETTES: Record<FlatChipLook, [number, string, string][]> = {
    badbeat: BB_FLAT_CHIP_COLORS,
    maison: MAISON_FLAT_CHIP_COLORS,
    chipchair: CHIPCHAIR_FLAT_CHIP_COLORS
};

/** The colour of a chip of this value (dollars, or tournament points) and of its mark, for a look that draws its own chips. */
export const badBeatChipColor = (value: number, look: FlatChipLook = "badbeat"): { color: string; slash: string } => {
    const [, color, slash] = FLAT_CHIP_PALETTES[look].find(([min]) => value >= min)!;
    return { color, slash };
};

/**
 * What a sticker or salon chip's face says: its value without a currency sign,
 * "25", "1K", "50¢" (cents only on cash tables).
 */
export const flatChipFaceLabel = (value: number): string => {
    if (value >= 1000) return `${Math.round(value / 100) / 10}K`;
    if (value < 1) return `${Math.round(value * 100)}¢`;
    return `${Math.round(value * 100) / 100}`;
};

/** True for a pale chip (ivory, champagne, white), whose inlays and marks are drawn dark. */
export const isPaleChip = (color: string): boolean => {
    const n = parseInt(color.replace("#", ""), 16);
    const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return lum > 170;
};

/** At most this many chips of one value in a flat Bad Beat stack, as on the 3D table. */
export const BB_FLAT_PER_VALUE = 4;

/**
 * A flat Bad Beat bet as one neat stack (ui#36), as the 3D table draws it: the
 * highest value at the bottom (the stacks come largest first), at most
 * {@link BB_FLAT_PER_VALUE} of each, each value stepped `step` px across so a
 * sliver of every colour shows. Returns each chip's spot and the stack's size.
 */
export const flatChipStack = (
    stacks: { value: number; visibleCount: number }[],
    chipSize: number,
    rise: number,
    step: number
): { chips: { value: number; left: number; bottom: number }[]; width: number; height: number } => {
    const chips: { value: number; left: number; bottom: number }[] = [];
    stacks.forEach((s, g) => {
        for (let k = 0; k < Math.min(s.visibleCount, BB_FLAT_PER_VALUE); k++) chips.push({ value: s.value, left: g * step, bottom: chips.length * rise });
    });
    const groups = Math.max(1, stacks.length);
    return { chips, width: chipSize + (groups - 1) * step, height: chipSize + Math.max(0, chips.length - 1) * rise };
};
