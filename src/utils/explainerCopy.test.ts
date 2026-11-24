import { explainerCopy, hasExplainerTranslation } from "./explainerCopy";
import { EXPLAINER_TEXT, HELP_SERVICES } from "../pages/explainers/explainerText";

/** Every string path of an object, so two translations can be compared shape for shape. */
const shape = (value: unknown, path = ""): string[] => {
    if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
    if (value !== null && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => shape(v, `${path}.${k}`)); // guards-ok
    return [path];
};

describe("explainerCopy", () => {
    it("returns the written language", () => {
        expect(explainerCopy("es").how.title).toBe("Cómo funciona Block52");
        expect(explainerCopy("en").how.title).toBe("How Block52 works");
    });

    it("shows English for a language not written yet", () => {
        expect(explainerCopy("ja")).toBe(EXPLAINER_TEXT.en);
        expect(explainerCopy("")).toBe(EXPLAINER_TEXT.en);
    });

    it("says which languages are written", () => {
        expect(hasExplainerTranslation("es")).toBe(true);
        expect(hasExplainerTranslation("de")).toBe(false);
    });

    it("keeps every translation the same shape as English", () => {
        Object.values(EXPLAINER_TEXT).forEach(text => expect(shape(text)).toEqual(shape(EXPLAINER_TEXT.en)));
    });

    it("has four steps and a region line for every help service", () => {
        Object.values(EXPLAINER_TEXT).forEach(text => {
            expect(text.how.steps).toHaveLength(4);
            expect(text.care.regions).toHaveLength(HELP_SERVICES.length);
        });
    });

    it("links help services over https", () => {
        HELP_SERVICES.forEach(s => expect(s.url.startsWith("https://")).toBe(true));
    });

    it("never says rake", () => {
        expect(JSON.stringify(EXPLAINER_TEXT).toLowerCase()).not.toContain("rake");
    });
});
