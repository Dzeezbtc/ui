import { STORAGE_KEYS } from "../constants/storageKeys";
import { TableStyle, isTableStyle, tableStyleFromEnv } from "./tableStyle";
import { viteEnv } from "./viteEnv";

/**
 * The whole site's look. "flagship" (the default) is the Block52 Flagship:
 * the new lobby, violet pages and the Flagship table. "traditional" is the
 * old look: the old table list lobby, the blue pages and the old table.
 */
export type SiteLook = "flagship" | "traditional";

export const SITE_LOOKS: readonly SiteLook[] = ["flagship", "traditional"];

export const SITE_LOOK_LABELS: Record<SiteLook, string> = {
    flagship: "Flagship",
    traditional: "Traditional"
};

export const isSiteLook = (value: unknown): value is SiteLook => value === "flagship" || value === "traditional";

/** The build's default look (VITE_SITE_LOOK), Flagship when unset or unknown. */
export const siteLookFromEnv = (value: unknown): SiteLook => (isSiteLook(value) ? value : "flagship");

const safeGet = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSet = (key: string, value: string | null): void => {
    try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
    } catch {
        // Private mode or blocked storage: the look just isn't remembered.
    }
};

/**
 * The look this visit uses: a ?look= link (remembered), else the player's saved
 * pick, else the build default.
 */
export const resolveSiteLook = (search: string, saved: string | null, envValue: unknown): SiteLook => {
    const asked = new URLSearchParams(search).get("look")?.trim().toLowerCase();
    if (isSiteLook(asked)) return asked;
    if (isSiteLook(saved)) return saved;
    return siteLookFromEnv(envValue);
};

let current: SiteLook | null = null;

export const getSiteLook = (): SiteLook => {
    if (current) return current;
    const search = typeof window === "undefined" ? "" : window.location.search;
    const saved = typeof window === "undefined" ? null : safeGet(STORAGE_KEYS.siteLook);
    current = resolveSiteLook(search, saved, viteEnv.VITE_SITE_LOOK);
    // A ?look= link sticks, so the player stays in it as they move around.
    if (typeof window !== "undefined" && new URLSearchParams(search).has("look")) safeSet(STORAGE_KEYS.siteLook, current);
    return current;
};

/**
 * Switch the whole site's look. Colours are read once at start-up, so the page
 * reloads. The table skin follows the new look (a skin picked at a table is cleared).
 */
export const setSiteLook = (look: SiteLook): void => {
    safeSet(STORAGE_KEYS.siteLook, look);
    safeSet(STORAGE_KEYS.tableStyle, null);
    current = look;
    const url = new URL(window.location.href);
    url.searchParams.delete("look");
    window.location.replace(url.toString());
};

/** The table skin a look starts tables in: Flagship, or the build's old default for Traditional. */
export const defaultTableStyleFor = (look: SiteLook, envValue: unknown): TableStyle => (look === "flagship" ? "flagship" : tableStyleFromEnv(envValue));

/** The skin the player last picked at a table, if any. */
export const getSavedTableStyle = (): TableStyle | null => {
    const saved = safeGet(STORAGE_KEYS.tableStyle);
    return isTableStyle(saved) ? saved : null;
};

export const saveTableStyle = (style: TableStyle): void => safeSet(STORAGE_KEYS.tableStyle, style);

/** True on a game table page (/table/:id), which wears its own table skin; /table/admin is a normal page. */
export const isTablePagePath = (pathname: string): boolean => pathname.startsWith("/table/") && pathname !== "/table/admin";

/** The site look a page's colours use, or undefined on table pages (left to the table skin). */
export const siteLookScopeFor = (look: SiteLook, pathname: string): SiteLook | undefined => (isTablePagePath(pathname) ? undefined : look);
