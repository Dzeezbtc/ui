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

/** The colour of a chip of this value (dollars, or tournament points) and of its slash. */
export const badBeatChipColor = (value: number): { color: string; slash: string } => {
    const [, color, slash] = BB_FLAT_CHIP_COLORS.find(([min]) => value >= min)!;
    return { color, slash };
};
