import { hasElements } from "./guards";

/**
 * The Block52 chip set (the flagship skin's chips): the standard casino
 * denominations, each in a Block52 neon colour. Cash chips show $ and ¢;
 * tournament chips show plain points and carry a different edge, so the two
 * never look alike.
 */
export interface B52ChipColor {
    /** Shown in the debug view and the design sheet. */
    name: string;
    /** Gradient start and end, and the glow. */
    a: string;
    b: string;
    glow: string;
    /** A pale face that needs dark lettering. */
    light?: boolean;
}

const C = (name: string, a: string, b: string, glow: string, light = false): B52ChipColor => ({ name, a, b, glow, light });

/** Every denomination's colour, keyed by its value (dollars for cash, points for tournaments). */
export const B52_CHIP_COLORS: ReadonlyMap<number, B52ChipColor> = new Map([
    [5000000, C("Onyx", "#3F3A55", "#0D0B17", "rgba(124,58,237,.55)")],
    [1000000, C("Platinum", "#F1F5F9", "#A5B4FC", "rgba(199,210,254,.6)", true)],
    [250000, C("Aurora", "#C026D3", "#4DD0F8", "rgba(124,58,237,.6)")],
    [100000, C("Pearl", "#FFFFFF", "#E9D5FF", "rgba(233,213,255,.55)", true)],
    [25000, C("Gold", "#FDE68A", "#F59E0B", "rgba(251,191,36,.5)", true)],
    [5000, C("Ruby", "#FB7185", "#E11D48", "rgba(244,63,94,.55)")],
    [1000, C("Sunset", "#FDBA74", "#F97316", "rgba(249,115,22,.5)")],
    [500, C("Mint", "#6EE7B7", "#10B981", "rgba(52,211,153,.55)")],
    [100, C("Cyan", "#4DD0F8", "#0EA5E9", "rgba(77,208,248,.55)")],
    [25, C("Blue", "#60A5FA", "#3B82F6", "rgba(59,130,246,.6)")],
    [5, C("Purple", "#A855F7", "#7C3AED", "rgba(124,58,237,.6)")],
    [1, C("Pink", "#F472B6", "#C026D3", "rgba(244,114,182,.55)")],
    [0.5, C("Lavender", "#C4B5FD", "#8B5CF6", "rgba(167,139,250,.5)")],
    [0.25, C("Aqua", "#5EEAD4", "#14B8A6", "rgba(45,212,191,.5)")],
    [0.1, C("Lime", "#BEF264", "#65A30D", "rgba(163,230,53,.45)")],
    [0.05, C("Ice", "#BAE6FD", "#38BDF8", "rgba(125,211,252,.5)")],
    [0.01, C("Coral", "#FDA4AF", "#FB7185", "rgba(251,113,133,.5)")]
]);

const SMALLEST = 0.01;

/** The colour for a denomination; the nearest smaller one for a value that is not a chip. */
export const b52ChipColor = (value: number): B52ChipColor => {
    const exact = B52_CHIP_COLORS.get(value);
    if (exact) return exact;
    const below = [...B52_CHIP_COLORS.keys()].filter(v => v <= value).sort((x, y) => y - x);
    return B52_CHIP_COLORS.get(hasElements(below) ? below[0] : SMALLEST)!;
};

const short = (n: number): string => {
    if (n >= 1000000) return `${n / 1000000}M`;
    if (n >= 1000) return `${n / 1000}K`;
    return `${n}`;
};

/** What a chip face says: "$25", "50¢", "$1K" for cash; "25", "1K" for tournaments. */
export const b52ChipLabel = (value: number, isTournament: boolean): string => {
    if (isTournament) return short(value);
    if (value < 1) return `${Math.round(value * 100)}¢`;
    return `$${short(value)}`;
};
