import type { PlayerHand } from "../types/players";
import { playStats, recentTableIds, socialLinks, lobbyPromos } from "./lobbySide";

const hand = (game: string, status: string, won: number): PlayerHand => ({
    game_id: game,
    hand_number: 1,
    seat: 1,
    status,
    won_amount: won,
    block_height: 1,
    community_cards: [],
    winner_count: won > 0 ? 1 : 0
});

describe("lobby side column", () => {
    it("lists recent tables newest first, each once, up to the limit", () => {
        const hands = [hand("a", "active", 0), hand("a", "active", 0), hand("b", "folded", 0), hand("c", "active", 5), hand("d", "active", 0)];
        expect(recentTableIds(hands)).toEqual(["a", "b", "c"]);
        expect(recentTableIds(hands, 2)).toEqual(["a", "b"]);
        expect(recentTableIds([])).toEqual([]);
    });

    it("counts hands, the share of pots won and tables played", () => {
        const hands = [hand("a", "active", 5), hand("a", "folded", 0), hand("b", "active", 0), hand("b", "showing", 9)];
        expect(playStats(hands, 40)).toEqual({ hands: 40, wonShare: 50, tables: 2 });
        expect(playStats([], 0)).toEqual({ hands: 0, wonShare: 0, tables: 0 });
    });

    it("lists every social, with a link only where an https one is set", () => {
        const links = socialLinks({ VITE_SOCIAL_X: "https://x.com/example", VITE_SOCIAL_TELEGRAM: " ", VITE_SOCIAL_DISCORD: "http://insecure" });
        expect(links.map(l => l.kind)).toEqual(["x", "telegram", "discord", "youtube", "instagram"]);
        expect(links.map(l => l.url)).toEqual(["https://x.com/example", null, null, null, null]);
    });
});

describe("lobbyPromos", () => {
    it("always offers New here? first, linking How it works", () => {
        expect(lobbyPromos({})[0]).toEqual({ kind: "newHere", href: "/how-it-works", external: false });
    });

    it("sends Run your own Circle to the first club console", () => {
        expect(lobbyPromos({ VITE_CLUB_CONSOLE_URLS: " https://club.example.com/ , https://other.example.com" })[1]).toEqual({ kind: "runCircle", href: "https://club.example.com", external: true });
    });

    it("falls back to the FAQ without an https console", () => {
        expect(lobbyPromos({})[1]).toEqual({ kind: "runCircle", href: "/faq", external: false });
        expect(lobbyPromos({ VITE_CLUB_CONSOLE_URLS: "http://localhost:3000" })[1].href).toBe("/faq");
    });
});
