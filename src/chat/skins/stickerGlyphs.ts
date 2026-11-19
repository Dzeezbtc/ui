import { circle, ellipse, rect, heart, sparkle, star, drop, chip, Glyph, Part } from "./paint";
import { EMOTE_GLYPHS, SPADE, DIAMOND, FLAME, FLAME_IN, BAG } from "./emoteGlyphs";

/**
 * The core quick-chat stickers (Classics, Hype & wins, Bad beats & tilt,
 * Calls & folds) drawn for the table skins, on the 64 grid. Movie, meme and
 * pop-culture stickers keep their character drawings and only take the skin's
 * frame and caption (see SkinSticker.tsx).
 */
const card = (x: number, y: number, rot = 0, role: "white" | "fill2" = "white"): Part => ({
    role,
    d: rect(x, y, 22, 32, 3),
    t: rot ? `rotate(${rot} ${x + 11} ${y + 16})` : undefined
});
const stack = (x: number, bottom: number, n: number, w = 16): Part[] =>
    Array.from({ length: n }, (_, i) => ({ role: (["gold", "hot", "cool", "base"] as const)[i % 4], d: chip(x, bottom - 7 - i * 7, w) }));
const SKULL = "M32 9c-12 0-19 8-19 19 0 6 3 10 7 12v9h24v-9c4-2 7-6 7-12 0-11-7-19-19-19z";
const ROCKET = "M32 5c9 7 13 17 12 30l-5 8H25l-5-8C19 22 23 12 32 5z";
const BOLT = "M36 4L13 36h15l-4 24 26-34H35z";

export const STICKER_GLYPHS: Record<string, Glyph> = {
    // Classics
    "nice-hand": {
        parts: [
            card(11, 14, -14),
            card(30, 14, 10),
            { role: "hot", d: heart(41, 29, 6), t: "rotate(10 41 30)" },
            { role: "gold", d: sparkle(54, 9, 6) },
            { role: "gold", d: sparkle(9, 52, 4) }
        ]
    },
    "good-game": { parts: [{ role: "gold", d: circle(32, 32, 26) }, { role: "line", d: circle(32, 32, 19), w: 0.8 }, { text: "GG", x: 32, y: 39, size: 18, tone: "ink" }] },
    "well-played": {
        parts: [
            { role: "white", d: circle(30, 34, 24) },
            { role: "hot", d: circle(30, 34, 16) },
            { role: "white", d: circle(30, 34, 8) },
            { role: "mark", d: "M30 34L54 10M47 8h8v8", w: 1.1 }
        ]
    },
    "good-call": {
        parts: [
            { role: "gold", d: "M32 8c-11 0-18 8-18 17 0 7 4 11 7 14 2 2 3 4 3 7h16c0-3 1-5 3-7 3-3 7-7 7-14 0-9-7-17-18-17z" },
            { role: "fill2", d: rect(24, 46, 16, 8, 2) },
            { role: "line", d: "M27 60h10M28 30l4 6 4-6" },
            { role: "mark", d: "M8 10l4 4M56 10l-4 4M3 27h5M56 27h5" }
        ]
    },
    "nice-flop": {
        parts: [
            { role: "white", d: rect(5, 18, 17, 26, 3), t: "rotate(-8 13 31)" },
            { role: "white", d: rect(23.5, 16, 17, 26, 3) },
            { role: "white", d: rect(42, 18, 17, 26, 3), t: "rotate(8 50 31)" },
            { text: "A", x: 13, y: 36, size: 13, tone: "ink", t: "rotate(-8 13 31)" },
            { text: "K", x: 32, y: 34, size: 13, tone: "ink" },
            { text: "Q", x: 50, y: 36, size: 13, tone: "ink", t: "rotate(8 50 31)" },
            { role: "gold", d: sparkle(32, 54, 5) }
        ]
    },
    thanks: { parts: [{ role: "hot", d: heart(30, 34, 22) }, { role: "gold", d: sparkle(54, 10, 6) }, { role: "gold", d: sparkle(8, 14, 4) }] },
    "running-hot": { parts: [{ role: "hot", d: FLAME }, { role: "gold", d: FLAME_IN }, { role: "mark", d: "M6 30l5 2M58 30l-5 2M10 14l4 4M54 14l-4 4" }] },
    "running-bad": {
        parts: [
            { role: "white", d: "M15 40a10 10 0 0 1 2-20 14 14 0 0 1 27-3 11 11 0 0 1 5 23z" },
            { role: "cool", d: drop(20, 52, 3) },
            { role: "cool", d: drop(32, 56, 3) },
            { role: "cool", d: drop(44, 52, 3) }
        ]
    },
    "bad-run-out": {
        parts: [
            { role: "white", d: SKULL },
            { role: "dot", d: circle(24, 29, 5) },
            { role: "dot", d: circle(40, 29, 5) },
            { role: "dot", d: "M32 35l-3 5h6z" },
            { role: "line", d: "M27 46v4M32 46v4M37 46v4", w: 0.8 }
        ]
    },
    finally: {
        parts: [
            { role: "gold", d: "M8 58l11-32 21 21z" },
            { role: "line", d: "M13 44l9 9M17 33l13 13", w: 0.8 },
            { role: "mark", d: "M30 22l3-12M40 26l13-7M43 37l12 3" },
            { role: "hot", d: circle(37, 8, 3.4) },
            { role: "cool", d: circle(56, 14, 3.4) },
            { role: "gold", d: sparkle(56, 32, 5) },
            { role: "hot", d: rect(22, 12, 6, 6, 1), t: "rotate(25 25 15)" }
        ]
    },
    laughing: { parts: [...EMOTE_GLYPHS.laugh.parts, { role: "cool", d: drop(8, 34, 3) }, { role: "cool", d: drop(56, 34, 3) }] },
    sad: { tint: "sky", parts: EMOTE_GLYPHS.cry.parts },
    baby: {
        parts: [
            { role: "gold", d: "M27 18c0-7 2-12 5-12s5 5 5 12z" },
            { role: "fill2", d: rect(20, 16, 24, 8, 2) },
            { role: "white", d: rect(21, 24, 22, 34, 7) },
            { role: "line", d: "M21 34h7M21 42h7M21 50h7", w: 0.8 }
        ]
    },
    // Hype & wins
    "all-in-baby": {
        parts: [
            ...stack(6, 58, 5, 22),
            ...stack(30, 58, 3, 18),
            { role: "mark", d: "M34 18h20M48 12l6 6-6 6", w: 1.1 }
        ]
    },
    "ship-it": {
        parts: [
            { role: "fill2", d: "M20 32l-9 11 10 1zM44 32l9 11-10 1z" },
            { role: "hot", d: "M26 44l6 15 6-15z" },
            { role: "base", d: ROCKET },
            { role: "cool", d: circle(32, 23, 5.5) }
        ]
    },
    "daddy-new-stack": { parts: [...stack(10, 60, 7, 24), { role: "gline", d: "M48 10v16M40 18h16", w: 1.3 }] },
    bink: { parts: [{ role: "gold", d: star(32, 32, 30, 12, 0.66) }, { text: "BINK!", x: 32, y: 37, size: 10.5, tone: "ink", t: "rotate(-8 32 34)" }] },
    nutted: {
        parts: [
            { role: "gold", d: "M32 6c8 0 12 6 11 13-1 5-3 7-3 13s2 8 3 13c1 7-3 13-11 13s-12-6-11-13c1-5 3-7 3-13s-2-8-3-13c-1-7 3-13 11-13z" },
            { role: "line", d: "M27 17c3 1 7 1 10 0M27 47c3 1 7 1 10 0M28 32h8", w: 0.8 },
            { role: "gold", d: sparkle(52, 12, 5) }
        ]
    },
    "big-stack-energy": { parts: [...stack(4, 60, 2), ...stack(23, 60, 4), ...stack(42, 60, 6, 18), { role: "gold", d: sparkle(14, 18, 6) }] },
    "gets-there": {
        parts: [
            { role: "white", d: "M14 10h38v26H14z" },
            { role: "dot", d: "M14 10h9.5v6.5H14zM33 10h9.5v6.5H33zM23.5 16.5H33V23h-9.5zM42.5 16.5H52V23h-9.5zM14 23h9.5v6.5H14zM33 23h9.5v6.5H33zM23.5 29.5H33V36h-9.5zM42.5 29.5H52V36h-9.5z" },
            { role: "mark", d: "M14 8v52", w: 1.2 },
            { role: "mark", d: "M56 44l4 2M54 50l6 3" }
        ]
    },
    "pay-day": { parts: [{ role: "base", d: BAG }, { role: "fill2", d: rect(23, 19, 18, 6, 2) }, { text: "$", x: 32, y: 50, size: 18, tone: "ink" }, { role: "gold", d: sparkle(56, 12, 6) }, { role: "gold", d: sparkle(8, 22, 4) }] },
    "easy-game": {
        parts: [
            { role: "cool", d: "M4 24h56l-3 13c-1 4-15 4-17 0l-5-8h-6l-5 8c-2 4-16 4-17 0z" },
            { role: "mark", d: "M12 29l6-4M44 29l6-4", w: 0.8 },
            { role: "line", d: "M2 24h4M58 24h4", w: 0.8 },
            { role: "gold", d: sparkle(54, 48, 5) }
        ]
    },
    // Bad beats & tilt
    rigged: {
        parts: [
            { role: "white", d: rect(6, 24, 28, 28, 6), t: "rotate(-12 20 38)" },
            { role: "white", d: rect(30, 10, 28, 28, 6), t: "rotate(12 44 24)" },
            { role: "dot", d: `${circle(14, 31, 3)}${circle(20, 38, 3)}${circle(26, 45, 3)}`, t: "rotate(-12 20 38)" },
            { role: "dot", d: `${circle(38, 17, 3)}${circle(50, 17, 3)}${circle(38, 31, 3)}${circle(50, 31, 3)}`, t: "rotate(12 44 24)" }
        ]
    },
    "rivered-again": {
        parts: [
            { role: "white", d: rect(22, 4, 21, 28, 3), t: "rotate(-12 32 18)" },
            { role: "hot", d: "M32 11l5 7-5 7-5-7z", t: "rotate(-12 32 18)" },
            { role: "cline", d: "M4 42c6-6 10-6 14 0s8 6 12 0 8-6 12 0 8 6 14 0" },
            { role: "cline", d: "M4 54c6-6 10-6 14 0s8 6 12 0 8-6 12 0 8 6 14 0" }
        ]
    },
    "runner-runner": {
        parts: [
            { role: "mark", d: "M3 22h12M1 32h14M3 42h12" },
            card(18, 14, -6),
            card(38, 16, 8),
            { role: "hot", d: heart(29, 30, 5), t: "rotate(-6 29 30)" },
            { role: "hot", d: heart(49, 32, 5), t: "rotate(8 49 32)" }
        ]
    },
    cooler: {
        parts: [
            { role: "cline", d: "M32 5v54M8.6 18.5l46.8 27M8.6 45.5l46.8-27", w: 1.1 },
            { role: "cline", d: "M25 8l7 7 7-7M25 56l7-7 7 7M7 26l9 3-2-9M57 38l-9-3 2 9M7 38l9-3-2 9M57 26l-9 3 2-9" },
            { role: "cool", d: "M32 25l6 3.5v7L32 39l-6-3.5v-7z" }
        ]
    },
    "thats-poker": {
        parts: [
            { role: "white", d: rect(19, 7, 26, 40, 4) },
            { role: "dot", d: SPADE, t: "translate(21.5 14) scale(.33)" },
            { text: "A", x: 24, y: 17, size: 8, tone: "ink" },
            { role: "mark", d: "M5 34c4 5 9 5 12 0M59 34c-4 5-9 5-12 0M24 56h16" }
        ]
    },
    "cruel-game": {
        parts: [
            { role: "hot", d: "M30 54C17 45 8 36 8 25c0-7 5-12 12-12 5 0 8 2 10 6l-4 9 6 6-5 8 3 12z", t: "rotate(-6 20 34)" },
            { role: "hot", d: "M35 54l-3-12 5-8-6-6 4-9c2-3 5-6 10-6 7 0 12 5 12 12 0 11-9 20-22 29z", t: "rotate(6 44 34)" }
        ]
    },
    "variance-myth": {
        parts: [
            { role: "mark", d: "M8 6v50h50", w: 1 },
            { role: "hline", d: "M12 14l10 8 8-5 10 17 14 14", w: 1.2 },
            { role: "hot", d: "M48 52l9 2-2-9z" },
            { text: "?", x: 52, y: 22, size: 16, tone: "mark" }
        ]
    },
    tilted: {
        parts: [
            { role: "hot", d: rect(4, 17, 56, 30, 5), t: "rotate(-8 32 32)" },
            { text: "TILT", x: 32, y: 38.5, size: 16, tone: "light", t: "rotate(-8 32 32)" },
            { role: "mark", d: "M10 10l4 5M32 6v6M54 10l-4 5" }
        ]
    },
    "not-tilted": {
        parts: [
            { role: "face", d: circle(30, 34, 24) },
            { role: "dot", d: circle(22, 28, 3) },
            { role: "dot", d: circle(38, 28, 3) },
            { role: "white", d: rect(17, 37, 26, 10, 3) },
            { role: "line", d: "M23.5 37v10M30 37v10M36.5 37v10", w: 0.6 },
            { role: "cool", d: drop(54, 14, 4) }
        ]
    },
    "card-dead": {
        parts: [
            { role: "white", d: "M14 56V25c0-10 8-17 18-17s18 7 18 17v31z" },
            { text: "RIP", x: 32, y: 37, size: 11, tone: "ink" },
            { role: "line", d: "M24 45h16", w: 0.7 },
            { role: "mark", d: "M6 57h52" }
        ]
    },
    // Calls & folds
    "snap-call": { parts: [{ role: "gold", d: BOLT }, { role: "mark", d: "M8 20l7 3M6 32h7M52 40l6 2" }] },
    "hero-call": {
        parts: [
            { role: "base", d: "M32 5l23 8v17c0 15-10 25-23 30C19 55 9 45 9 30V13z" },
            { role: "hot", d: star(32, 31, 13) }
        ]
    },
    "hero-fold": {
        parts: [
            { role: "gline", d: ellipse(32, 9, 13, 4) },
            { role: "fill2", d: rect(20, 18, 24, 34, 4), t: "rotate(-10 32 35)" },
            { role: "line", d: "M25 24l14 22M39 24L25 46", t: "rotate(-10 32 35)", w: 0.6 },
            { role: "mark", d: "M50 48l6 6M56 48v6h-6" }
        ]
    },
    "snap-fold": {
        parts: [
            { role: "white", d: rect(22, 3, 18, 24, 3), t: "rotate(20 31 15)" },
            { role: "base", d: rect(11, 21, 42, 7, 3) },
            { role: "fill2", d: "M15 28h34l-4 30H19z" },
            { role: "line", d: "M25 34v18M32 34v18M39 34v18", w: 0.7 }
        ]
    },
    "had-to-call": {
        parts: [
            { role: "base", d: "M19 8c-5 0-9 4-9 10 0 21 16 37 37 37 6 0 10-4 10-9v-6l-13-5-5 5c-7-3-13-9-16-16l5-5-5-11z" },
            { role: "mark", d: "M38 8a17 17 0 0 1 17 17M38 17a8 8 0 0 1 8 8" }
        ]
    },
    "put-you-on-that": {
        parts: [
            { role: "base", d: "M38 41l6-6 16 16-6 6z" },
            { role: "fill2", d: circle(26, 26, 20) },
            { role: "white", d: circle(26, 26, 14) },
            { text: "A", x: 26, y: 32, size: 15, tone: "hot" }
        ]
    },
    "solver-says-call": {
        parts: [
            { role: "line", d: "M32 18V9", w: 1 },
            { role: "hot", d: circle(32, 7, 4) },
            { role: "fill2", d: rect(5, 28, 8, 14, 3) },
            { role: "fill2", d: rect(51, 28, 8, 14, 3) },
            { role: "base", d: rect(11, 17, 42, 36, 9) },
            { role: "cool", d: rect(16, 24, 32, 14, 6) },
            { role: "dot", d: `${circle(25, 31, 3.4)}${circle(39, 31, 3.4)}` },
            { role: "line", d: "M25 46h14", w: 0.8 }
        ]
    },
    "trust-the-math": {
        parts: [
            { role: "fill2", d: rect(13, 5, 38, 54, 7) },
            { role: "cool", d: rect(18, 10, 28, 13, 3) },
            { role: "white", d: `${rect(18, 28, 7, 6, 1.5)}${rect(28.5, 28, 7, 6, 1.5)}${rect(18, 38, 7, 6, 1.5)}${rect(28.5, 38, 7, 6, 1.5)}${rect(18, 48, 7, 6, 1.5)}${rect(28.5, 48, 7, 6, 1.5)}` },
            { role: "hot", d: rect(39, 28, 7, 26, 1.5) },
            { role: "line", d: "M28 16.5h14", w: 0.6 }
        ]
    },
    "never-folding": { parts: [{ role: "hot", d: circle(32, 32, 26) }, { role: "white", d: rect(14, 27, 36, 10, 2) }] },
    "tank-time": {
        parts: [
            { role: "white", d: "M18 11h28c0 13-10 16-10 21s10 8 10 21H18c0-13 10-16 10-21s-10-8-10-21z" },
            { role: "gold", d: "M23 17h18c-2 6-7 9-9 11-2-2-7-5-9-11zM21 50c2-6 7-9 11-9s9 3 11 9z" },
            { role: "fill2", d: rect(13, 5, 38, 7, 3) },
            { role: "fill2", d: rect(13, 52, 38, 7, 3) }
        ]
    }
};

/** The packs that get their own drawing in every table skin. */
export const CORE_PACKS: readonly string[] = ["classics", "hype", "bad-beats", "calls"];
