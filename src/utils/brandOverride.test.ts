import { applyBrandOverride } from "./brandOverride";

const lobby = () => ({ brand: { primary: "#3b82f6" }, accent: { glow: "#64ffda" } });

describe("applyBrandOverride (block52-club#39)", () => {
    it("wears the club's colours, then puts the lobby's back", () => {
        const palette = lobby();
        const restore = applyBrandOverride(palette, "#ff8500", "#6e36ff");
        expect(palette).toEqual({ brand: { primary: "#ff8500" }, accent: { glow: "#6e36ff" } });
        expect(document.documentElement.style.getPropertyValue("--brand-primary")).toBe("#ff8500");
        expect(document.documentElement.style.getPropertyValue("--brand-primary-10")).toBe("rgba(255, 133, 0, 0.1)");
        restore();
        expect(palette).toEqual(lobby());
        expect(document.documentElement.style.getPropertyValue("--brand-primary")).toBe("");
    });

    it("leaves a colour the club didn't set alone", () => {
        const palette = lobby();
        const restore = applyBrandOverride(palette, "#112233", null);
        expect(palette.accent.glow).toBe("#64ffda");
        expect(document.documentElement.style.getPropertyValue("--accent-glow")).toBe("");
        restore();
    });
});
