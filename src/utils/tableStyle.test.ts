import { TABLE_STYLES, TABLE_STYLE_LABELS, isTableStyle, nextTableStyle, skinForTheme, tableStyleFromEnv } from "./tableStyle";

describe("tableStyle", () => {
    it("knows every style and names each one", () => {
        expect(TABLE_STYLES).toEqual(["modern", "classic", "nouns", "chipchair"]);
        TABLE_STYLES.forEach(s => expect(TABLE_STYLE_LABELS[s]).toBeTruthy());
        expect(TABLE_STYLE_LABELS.chipchair).toBe("Chip and a Chair");
    });

    it("recognises style names and nothing else", () => {
        expect(isTableStyle("chipchair")).toBe(true);
        expect(isTableStyle("nouns")).toBe(true);
        expect(isTableStyle("Chip and a Chair")).toBe(false);
        expect(isTableStyle("")).toBe(false);
        expect(isTableStyle(undefined)).toBe(false);
        expect(isTableStyle(3)).toBe(false);
    });

    it("cycles through the styles and wraps", () => {
        expect(nextTableStyle("modern")).toBe("classic");
        expect(nextTableStyle("classic")).toBe("nouns");
        expect(nextTableStyle("nouns")).toBe("chipchair");
        expect(nextTableStyle("chipchair")).toBe("modern");
    });

    it("starts in the env style, or modern", () => {
        expect(tableStyleFromEnv("chipchair")).toBe("chipchair");
        expect(tableStyleFromEnv("classic")).toBe("classic");
        expect(tableStyleFromEnv("purple")).toBe("modern");
        expect(tableStyleFromEnv(undefined)).toBe("modern");
    });

    it("maps a club theme to its table skin", () => {
        expect(skinForTheme("chipandachair")).toBe("chipchair");
        expect(skinForTheme("block52")).toBeNull();
        expect(skinForTheme("maison")).toBeNull();
        expect(skinForTheme("")).toBeNull();
    });
});
