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
 * Maison 52's chips (Dzeezbtc/ui#38), as on its 3D table: ivory, navy, bottle
 * green, bordeaux and black from the smallest value up, each with its mark
 * (gold on the dark chips, espresso on ivory).
 */
export const MAISON_FLAT_CHIP_COLORS: [number, string, string][] = [
    [500, "#1d1a16", "#cdb07f"],
    [100, "#6e1f2b", "#cdb07f"],
    [25, "#0f3b2e", "#cdb07f"],
    [5, "#22427a", "#cdb07f"],
    [0, "#f4eee2", "#6b4f2a"]
];

/** The colour of a chip of this value (dollars, or tournament points) and of its mark, for a 3D table's look. */
export const badBeatChipColor = (value: number, look: "badbeat" | "maison" = "badbeat"): { color: string; slash: string } => {
    const [, color, slash] = (look === "maison" ? MAISON_FLAT_CHIP_COLORS : BB_FLAT_CHIP_COLORS).find(([min]) => value >= min)!;
    return { color, slash };
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
