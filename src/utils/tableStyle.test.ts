import { TABLE_STYLES, TABLE_STYLE_LABELS, dealsFaceDown, flatChipLookFor, isTableStyle, nextTableStyle, skinAttrFor, skinForTheme, stageShapeFor, tableStyleFromEnv, usesFlagshipLayout, isThreeTableStyle } from "./tableStyle";

describe("tableStyle", () => {
    it("knows every style and names each one", () => {
        expect(TABLE_STYLES).toEqual(["modern", "classic", "nouns", "chipchair", "flagship", "badbeat", "maison"]);
        TABLE_STYLES.forEach(s => expect(TABLE_STYLE_LABELS[s]).toBeTruthy());
        expect(TABLE_STYLE_LABELS.chipchair).toBe("Chip and a Chair");
        expect(TABLE_STYLE_LABELS.flagship).toBe("Block52 Flagship");
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
        expect(nextTableStyle("chipchair")).toBe("flagship");
        expect(nextTableStyle("flagship")).toBe("badbeat");
        expect(nextTableStyle("badbeat")).toBe("maison");
        expect(nextTableStyle("maison")).toBe("modern");
    });

    it("starts in the env style, or modern", () => {
        expect(tableStyleFromEnv("chipchair")).toBe("chipchair");
        expect(tableStyleFromEnv("flagship")).toBe("flagship");
        expect(tableStyleFromEnv("classic")).toBe("classic");
        expect(tableStyleFromEnv("purple")).toBe("modern");
        expect(tableStyleFromEnv(undefined)).toBe("modern");
    });

    it("maps a club theme to its table skin", () => {
        expect(skinForTheme("chipandachair")).toBe("chipchair");
        expect(skinForTheme("block52")).toBeNull();
        expect(skinForTheme("maison")).toBe("maison");
        expect(skinForTheme("triplebarrel")).toBeNull();
        expect(skinForTheme("")).toBeNull();
    });

    it("lays the flagship out on its own stage shape", () => {
        expect(stageShapeFor("flagship")).toBe("flagship");
        expect(stageShapeFor("badbeat")).toBe("badbeat");
        expect(stageShapeFor("maison")).toBe("maison");
        expect(stageShapeFor("modern")).toBe("standard");
    });

    it("lays Bad Beat out like the flagship, under the flagship's stylesheet", () => {
        expect(TABLE_STYLE_LABELS.badbeat).toBe("Bad Beat");
        expect(usesFlagshipLayout("badbeat")).toBe(true);
        expect(TABLE_STYLE_LABELS.maison).toBe("Maison 52");
        expect(usesFlagshipLayout("maison")).toBe(true);
        expect(isThreeTableStyle("maison")).toBe(true);
        expect(isThreeTableStyle("badbeat")).toBe(true);
        expect(isThreeTableStyle("flagship")).toBe(false);
        expect(usesFlagshipLayout("flagship")).toBe(true);
        expect(skinAttrFor("badbeat")).toBe("flagship");
        expect(skinForTheme("badbeat")).toBe("badbeat");
    });

    it("lays Chip and a Chair out like the flagship, and deals it face down", () => {
        expect(usesFlagshipLayout("chipchair")).toBe(true);
        expect(skinAttrFor("chipchair")).toBe("flagship");
        expect(stageShapeFor("chipchair")).toBe("chipchair");
        expect(dealsFaceDown("chipchair")).toBe(true);
        expect(dealsFaceDown("maison")).toBe(true);
        expect(dealsFaceDown("flagship")).toBe(false);
        expect(flatChipLookFor("chipchair")).toBe("chipchair");
        expect(flatChipLookFor("maison")).toBe("maison");
        expect(flatChipLookFor("badbeat")).toBe("badbeat");
    });
});
