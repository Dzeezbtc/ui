import { STORAGE_KEYS } from "../constants/storageKeys";
import {
    defaultTableStyleFor,
    getSavedTableStyle,
    isSiteLook,
    isTablePagePath,
    resolveSiteLook,
    saveTableStyle,
    siteLookFromEnv,
    siteLookScopeFor
} from "./siteLook";

describe("siteLook", () => {
    beforeEach(() => window.localStorage.clear());

    it("knows the two looks", () => {
        expect(isSiteLook("flagship")).toBe(true);
        expect(isSiteLook("traditional")).toBe(true);
        expect(isSiteLook("modern")).toBe(false);
        expect(isSiteLook(undefined)).toBe(false);
    });

    it("defaults to Flagship when the build names no look or an unknown one", () => {
        expect(siteLookFromEnv(undefined)).toBe("flagship");
        expect(siteLookFromEnv("blue")).toBe("flagship");
        expect(siteLookFromEnv("traditional")).toBe("traditional");
    });

    it("prefers a ?look= link, then the saved pick, then the build default", () => {
        expect(resolveSiteLook("?look=traditional", "flagship", "flagship")).toBe("traditional");
        expect(resolveSiteLook("?look=TRADITIONAL", null, undefined)).toBe("traditional");
        expect(resolveSiteLook("?look=nope", "traditional", undefined)).toBe("traditional");
        expect(resolveSiteLook("", "traditional", "flagship")).toBe("traditional");
        expect(resolveSiteLook("", null, "traditional")).toBe("traditional");
        expect(resolveSiteLook("", "junk", undefined)).toBe("flagship");
    });

    it("starts tables in Flagship for the Flagship look and the old skin for Traditional", () => {
        expect(defaultTableStyleFor("flagship", "modern")).toBe("flagship");
        expect(defaultTableStyleFor("traditional", "modern")).toBe("modern");
        expect(defaultTableStyleFor("traditional", "classic")).toBe("classic");
        expect(defaultTableStyleFor("traditional", undefined)).toBe("modern");
    });

    it("remembers the skin a player picks at a table", () => {
        expect(getSavedTableStyle()).toBeNull();
        saveTableStyle("maison");
        expect(getSavedTableStyle()).toBe("maison");
        window.localStorage.setItem(STORAGE_KEYS.tableStyle, "junk");
        expect(getSavedTableStyle()).toBeNull();
    });

    it("leaves game tables to their own skin", () => {
        expect(isTablePagePath("/table/0xabc")).toBe(true);
        expect(isTablePagePath("/table/admin")).toBe(false);
        expect(isTablePagePath("/")).toBe(false);
        expect(siteLookScopeFor("flagship", "/table/0xabc")).toBeUndefined();
        expect(siteLookScopeFor("flagship", "/wallet")).toBe("flagship");
        expect(siteLookScopeFor("traditional", "/")).toBe("traditional");
    });
});
