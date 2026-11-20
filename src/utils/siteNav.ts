import { hasContent } from "./guards";
import type { TranslationKey } from "../i18n";

/** Which icon a navigation item draws (the SVG paths live in the nav component). */
export type NavIcon = "play" | "wallet" | "hands" | "explorer" | "distribution" | "nodes" | "players" | "awards" | "notes";

/** Where an item sits: the main group, the network/data group, or pinned to the bottom of the rail. */
export type NavGroup = "main" | "data" | "foot";

export interface NavItem {
    path: string;
    /** i18n key for the label. */
    label: TranslationKey;
    icon: NavIcon;
    group: NavGroup;
    /** Shown in the phone tab bar; everything else lives under "More". */
    tab: boolean;
}

/** Every page in the site navigation, in rail order. */
export const NAV_ITEMS: NavItem[] = [
    { path: "/", label: "nav.play", icon: "play", group: "main", tab: true },
    { path: "/wallet", label: "nav.wallet", icon: "wallet", group: "main", tab: true },
    { path: "/hands", label: "nav.hands", icon: "hands", group: "main", tab: true },
    { path: "/explorer", label: "nav.explorerShort", icon: "explorer", group: "data", tab: true },
    { path: "/explorer/distribution", label: "nav.distributionShort", icon: "distribution", group: "data", tab: false },
    { path: "/nodes", label: "nav.nodes", icon: "nodes", group: "data", tab: false },
    { path: "/players", label: "nav.players", icon: "players", group: "data", tab: false },
    { path: "/awards", label: "nav.awards", icon: "awards", group: "data", tab: false },
    { path: "/tech-notes", label: "nav.techNotesShort", icon: "notes", group: "foot", tab: false }
];

/** Other paths that belong to a nav item (a node's own page lights up Nodes). */
const ALIASES: Record<string, string> = { "/node": "/nodes" };

const under = (pathname: string, base: string): boolean => pathname === base || pathname.startsWith(`${base}/`);

/**
 * The nav item for a page: the longest item path the page sits under, so
 * /explorer/distribution lights Distribution and /explorer/tx/… lights Explorer.
 * "/" only matches the lobby itself. Undefined for pages outside the nav (admin, sign-in).
 */
export const activeNavItem = (pathname: string, items: NavItem[] = NAV_ITEMS): NavItem | undefined => {
    const alias = Object.keys(ALIASES).find(a => under(pathname, a));
    const path = hasContent(alias) ? ALIASES[alias] : pathname;
    return items
        .filter(i => (i.path === "/" ? path === "/" : under(path, i.path)))
        .sort((a, b) => b.path.length - a.path.length)[0];
};

/** The site navigation hides on a game table (it has its own layout), except the legacy /table/admin page. */
export const showsSiteNav = (pathname: string): boolean => !pathname.startsWith("/table/") || pathname === "/table/admin";

const B52_ADDRESS = /^b521[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,}$/;
const TABLE_ID = /^0x[0-9a-f]{64}$/i;
const TX_HASH = /^[0-9a-f]{64}$/i;
const BLOCK_HEIGHT = /^#?\d{1,12}$/;

/**
 * Where the header search box goes for what was typed: a block number, a
 * transaction hash, a table ID or a b52 player address. Undefined when it is
 * none of those.
 */
export const searchTarget = (query: string): string | undefined => {
    const q = query.trim();
    if (BLOCK_HEIGHT.test(q)) return `/explorer/block/${q.replace("#", "")}`;
    if (TABLE_ID.test(q)) return `/table/${q.toLowerCase()}`;
    if (TX_HASH.test(q)) return `/explorer/tx/${q.toUpperCase()}`;
    if (B52_ADDRESS.test(q.toLowerCase())) return `/players/${q.toLowerCase()}`;
    return undefined;
};

/** The USDC balance (micro-units, as a string) from a wallet's bank balances, or "0" when it holds none. */
export const usdcMicroOf = (balances: { denom: string; amount: string }[]): string => balances.find(b => b.denom === "usdc")?.amount ?? "0";

/** The query flag that asks the lobby to open the deposit window (the header's Deposit button, from any page). */
export const DEPOSIT_PARAM = "deposit";
