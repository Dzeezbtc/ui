import { SETTINGS_SECTIONS, SETTINGS_SECTION_LABEL_KEYS, flagshipGameTitle, settingsMenuPosition } from "./tableSettingsMenu";
import { en } from "../i18n/en";

describe("table settings menu", () => {
    it("names every section with a real translation key", () => {
        SETTINGS_SECTIONS.forEach(s => expect(en[SETTINGS_SECTION_LABEL_KEYS[s] as keyof typeof en]).toBeTruthy());
    });

    const viewport = { width: 1440, height: 900 };

    it("opens above the cog, right-aligned to it, when there is room", () => {
        const anchor = { left: 1200, right: 1230, top: 700, bottom: 730 };
        expect(settingsMenuPosition(anchor, 300, 440, viewport)).toEqual({ left: 930, top: 252, maxHeight: 440 });
    });

    it("opens below when the space above is smaller", () => {
        const anchor = { left: 1200, right: 1230, top: 60, bottom: 90 };
        expect(settingsMenuPosition(anchor, 300, 440, viewport)).toEqual({ left: 930, top: 98, maxHeight: 440 });
    });

    it("shrinks to the room it has", () => {
        const anchor = { left: 1200, right: 1230, top: 300, bottom: 330 };
        expect(settingsMenuPosition(anchor, 300, 440, { width: 1440, height: 500 })).toEqual({ left: 930, top: 12, maxHeight: 280 });
    });

    it("never runs off either side of the screen", () => {
        expect(settingsMenuPosition({ left: 5, right: 40, top: 700, bottom: 730 }, 300, 440, viewport).left).toBe(12);
        expect(settingsMenuPosition({ left: 360, right: 390, top: 700, bottom: 730 }, 300, 440, { width: 390, height: 844 }).left).toBe(78);
    });

    it("titles the top bar with the format and the game", () => {
        expect(flagshipGameTitle("Cash", "Pot-Limit Omaha")).toBe("Cash · Pot-Limit Omaha");
        expect(flagshipGameTitle(undefined, "Texas Hold'em")).toBe("Texas Hold'em");
    });
});
