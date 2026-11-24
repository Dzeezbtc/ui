import type { PlayerHand } from "../types/players";
import { hasContent, isEmpty } from "./guards";
import { handsCounts } from "./handsView";

/** The tables you played most recently (newest first, each once), for "Jump back in". */
export const recentTableIds = (hands: readonly Pick<PlayerHand, "game_id">[], max = 3): string[] => {
    const seen: string[] = [];
    for (const h of hands) {
        if (!seen.includes(h.game_id)) seen.push(h.game_id);
        if (seen.length >= max) break;
    }
    return seen;
};

/** The numbers in the lobby's "Your play" card, from your loaded hands and the indexer's total. */
export const playStats = (hands: PlayerHand[], total: number): { hands: number; wonShare: number; tables: number } => ({
    hands: Math.max(total, hands.length),
    wonShare: isEmpty(hands) ? 0 : Math.round((handsCounts(hands).won / hands.length) * 100),
    tables: new Set(hands.map(h => h.game_id)).size
});

export type SocialKind = "x" | "telegram" | "discord" | "youtube" | "instagram";

const SOCIAL_KEYS: [SocialKind, string][] = [
    ["x", "VITE_SOCIAL_X"],
    ["telegram", "VITE_SOCIAL_TELEGRAM"],
    ["discord", "VITE_SOCIAL_DISCORD"],
    ["youtube", "VITE_SOCIAL_YOUTUBE"],
    ["instagram", "VITE_SOCIAL_INSTAGRAM"]
];

/**
 * Block52's socials, always all of them so the footer shows every icon. A network
 * whose link is set for this build (https only) gets its url; the rest have none
 * yet and show as a plain icon until the link is added.
 */
export const socialLinks = (env: Record<string, string | undefined>): { kind: SocialKind; url: string | null }[] =>
    SOCIAL_KEYS.map(([kind, key]) => {
        const url = (env[key] ?? "").trim();
        return { kind, url: hasContent(url) && url.startsWith("https://") ? url : null };
    });

/** Block52's own promotions in the desktop lobby's side column. */
export type PromoKind = "newHere" | "runCircle";

export interface LobbyPromo {
    kind: PromoKind;
    href: string;
    /** Opens another site (the Circle console) rather than a page of this app. */
    external: boolean;
}

/**
 * The two side promotions: New here? (How it works) and Run your own Circle.
 * The Circle one opens the club console when this build has one (https only),
 * otherwise the FAQ, which explains Circles.
 */
export const lobbyPromos = (env: Record<string, string | undefined>): LobbyPromo[] => {
    const consoleUrl = (env.VITE_CLUB_CONSOLE_URLS ?? "").split(",")[0].trim().replace(/\/+$/, "");
    const hasConsole = consoleUrl.startsWith("https://");
    return [
        { kind: "newHere", href: "/how-it-works", external: false },
        { kind: "runCircle", href: hasConsole ? consoleUrl : "/faq", external: hasConsole }
    ];
};
