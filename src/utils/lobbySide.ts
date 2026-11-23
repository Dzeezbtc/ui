import type { PlayerHand } from "../types/players";
import { hasContent } from "./guards";
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
    wonShare: hands.length === 0 ? 0 : Math.round((handsCounts(hands).won / hands.length) * 100),
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
