/** The parts of the lobby's palette a club can change. */
export interface BrandPalette {
    brand: { primary: string };
    accent: { glow: string };
}

const rgba = (hex: string, alpha: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;

/**
 * A club's own colours at its page and tables (block52-club#39). The lobby's
 * colours are fixed when it is built, so this swaps the primary and accent in
 * place, and in the CSS variables, until the returned function puts the
 * lobby's back. Components pick it up the next time they render.
 */
export const applyBrandOverride = (palette: BrandPalette, primary: string | null, accent: string | null): (() => void) => {
    const before = { primary: palette.brand.primary, glow: palette.accent.glow };
    const root = document.documentElement.style;
    if (primary) {
        palette.brand.primary = primary;
        root.setProperty("--brand-primary", primary);
        root.setProperty("--brand-primary-10", rgba(primary, 0.1));
    }
    if (accent) {
        palette.accent.glow = accent;
        root.setProperty("--accent-glow", accent);
    }
    return () => {
        palette.brand.primary = before.primary;
        palette.accent.glow = before.glow;
        ["--brand-primary", "--brand-primary-10", "--accent-glow"].forEach(v => root.removeProperty(v));
    };
};
