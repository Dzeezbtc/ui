/**
 * The Block52 Flagship's table settings menu (Dzeezbtc/ui#31): one small cog
 * under the table that holds everything the top bar and side panel used to show.
 */

/** The menu's sections, in the order they are listed. */
export const SETTINGS_SECTIONS = ["history", "share", "look", "sound", "play", "account"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

/** Translation key for each section's name. */
export const SETTINGS_SECTION_LABEL_KEYS: Record<SettingsSection, string> = {
    history: "table.handHistory",
    share: "settingsMenu.share",
    look: "settingsMenu.look",
    sound: "settingsMenu.sound",
    play: "settingsMenu.play",
    account: "settingsMenu.account"
};

const MARGIN = 12;
const GAP = 8;

/**
 * Where the menu sits: right-aligned to its button, above it when there is room
 * (the cog lives under the table), otherwise below; always inside the screen.
 * Returns the panel's top-left corner and the height it may use.
 */
export function settingsMenuPosition(
    anchor: { left: number; right: number; top: number; bottom: number },
    width: number,
    preferredHeight: number,
    viewport: { width: number; height: number }
): { left: number; top: number; maxHeight: number } {
    const left = Math.max(MARGIN, Math.min(anchor.right - width, viewport.width - width - MARGIN));
    const roomAbove = anchor.top - GAP - MARGIN;
    const roomBelow = viewport.height - anchor.bottom - GAP - MARGIN;
    if (roomAbove >= preferredHeight || roomAbove >= roomBelow) {
        const maxHeight = Math.max(0, Math.min(preferredHeight, roomAbove));
        return { left, top: anchor.top - GAP - maxHeight, maxHeight };
    }
    const maxHeight = Math.max(0, Math.min(preferredHeight, roomBelow));
    return { left, top: anchor.bottom + GAP, maxHeight };
}

/** The flagship top bar's one line: "Cash · Pot-Limit Omaha", or just the game. */
export const flagshipGameTitle = (format: string | undefined, game: string): string => (format ? `${format} · ${game}` : game);
