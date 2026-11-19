import { circle, ellipse, rect, heart, sparkle, drop, Glyph, Part } from "./paint";

/**
 * The 27 composer emojis (emotes.ts ids) as table-skin glyphs on the 64 grid.
 * One drawing per emoji; each skin paints it its own way (see paint.tsx).
 */
const FACE: Part = { role: "face", d: circle(32, 32, 25) };
const face = (...parts: Part[]): Part[] => [FACE, ...parts];
const smile: Part = { role: "line", d: "M21 38c6 7 16 7 22 0" };

export const SPADE = "M32 8C24 20 12 26 12 36c0 7 7 11 14 8-1 5-3 8-6 10h24c-3-2-5-5-6-10 7 3 14-1 14-8 0-10-12-16-20-28z";
export const DIAMOND = "M32 6l20 26-20 26-20-26z";
export const CLUB = `${circle(32, 20, 10.5)}${circle(20.5, 37, 10.5)}${circle(43.5, 37, 10.5)}M29 36h6l3 19H26z`;
export const FLAME = "M32 58c-12 0-19-8-19-18 0-9 6-14 9-20 1 5 3 8 6 9-1-9 3-17 9-23 1 8 6 12 10 17 3 4 4 9 4 14 0 13-8 21-19 21z";
export const FLAME_IN = "M32 58c-6 0-10-4-10-10 0-5 4-8 6-12 1 3 3 5 5 5-1-4 1-8 4-10 1 4 4 7 4 12 0 9-3 15-9 15z";
export const BAG = "M24 16h16l-4 7c11 4 18 14 18 23 0 8-7 12-22 12S10 54 10 46c0-9 7-19 18-23z";
export const THUMB = "M21 30h5l9-15c3-4 8-2 7 3l-2 9h11c4 0 6 3 5 6l-4 15c-1 3-3 5-6 5H21z";

export const EMOTE_GLYPHS: Record<string, Glyph> = {
    happy: { parts: face({ role: "line", d: "M23 25v5M41 25v5" }, smile) },
    laugh: {
        parts: face(
            { role: "line", d: "M18 24l7 3-7 3M46 24l-7 3 7 3" },
            { role: "dot", d: "M18 36h28c-1 12-27 12-28 0z" },
            { role: "hot", d: "M25 45c3-3 11-3 14 0-3 3-11 3-14 0z" }
        )
    },
    cool: {
        parts: face(
            { role: "dot", d: "M12 24h40l-2 9c-1 3-11 3-12 0l-3-5h-6l-3 5c-1 3-11 3-12 0z" },
            { role: "line", d: "M25 43c5 3 10 2 15-2" }
        )
    },
    wink: { parts: face({ role: "line", d: "M20 28c2-3 6-3 8 0" }, { role: "dot", d: circle(41, 27, 3) }, { role: "line", d: "M22 38c6 6 15 6 20 0" }) },
    love: { tint: "pink", parts: face({ role: "hot", d: heart(23, 27, 7) }, { role: "hot", d: heart(41, 27, 7) }, smile) },
    smirk: { parts: face({ role: "line", d: "M19 27h8M37 27h8" }, { role: "line", d: "M24 41c6 1 12-1 17-6" }) },
    money: {
        tint: "green",
        parts: face(
            { text: "$", x: 23, y: 32, size: 14, tone: "gold" },
            { text: "$", x: 41, y: 32, size: 14, tone: "gold" },
            { role: "line", d: "M21 40c6 7 16 7 22 0" }
        )
    },
    shocked: { tint: "pink", parts: face({ role: "dot", d: circle(24, 26, 3.2) }, { role: "dot", d: circle(40, 26, 3.2) }, { role: "dot", d: ellipse(32, 42, 5, 6.5) }) },
    confused: {
        parts: [
            ...face({ role: "dot", d: circle(24, 27, 2.8) }, { role: "dot", d: circle(40, 27, 2.8) }, { role: "line", d: "M22 42c3-3 6 3 10 0s7-3 10 0" }),
            { role: "mark", d: "M50 6c0-4 8-4 8 1 0 4-4 4-4 8M54 20v.5" }
        ]
    },
    cry: {
        tint: "sky",
        parts: face(
            { role: "line", d: "M19 26c3 3 6 3 9 0M36 26c3 3 6 3 9 0" },
            { role: "cool", d: drop(23, 38, 3) },
            { role: "cool", d: drop(41, 38, 3) },
            { role: "line", d: "M24 47c5-5 11-5 16 0" }
        )
    },
    angry: {
        tint: "red",
        parts: [
            ...face({ role: "line", d: "M18 21l9 4M46 21l-9 4" }, { role: "dot", d: circle(24, 30, 2.6) }, { role: "dot", d: circle(40, 30, 2.6) }, { role: "line", d: "M23 45c6-5 12-5 18 0" }),
            { role: "mark", d: "M51 4c2 3-1 4 1 7M57 7c2 3-1 4 1 7", w: 0.8 }
        ]
    },
    melting: {
        parts: [
            { role: "face", d: "M7 32a25 25 0 0 1 50 0c0 7-2 10-5 10-2 0-2 7-6 7s-3-4-6-4-2 9-7 9-4-7-7-7-3 4-6 3-3-6-4-8c-6 0-9-4-9-10z" },
            { role: "dot", d: circle(23, 27, 2.8) },
            { role: "dot", d: circle(41, 27, 2.8) },
            { role: "line", d: "M23 37c6 4 12 4 18 0" }
        ]
    },
    dizzy: {
        parts: [
            ...face({ role: "line", d: "M19 23l8 8M27 23l-8 8M37 23l8 8M45 23l-8 8" }, { role: "line", d: "M22 43c3-3 6 3 10 0s7-3 10 0" }),
            { role: "gold", d: sparkle(10, 8, 5) },
            { role: "gold", d: sparkle(56, 10, 4) }
        ]
    },
    clown: {
        tint: "white",
        parts: [
            { role: "cool", d: circle(11, 24, 8) },
            { role: "cool", d: circle(53, 24, 8) },
            ...face(
                { role: "line", d: "M22 22v4M42 22v4" },
                { role: "hot", d: "M17 36c5 12 25 12 30 0-9 3-21 3-30 0z" },
                { role: "hot", d: circle(32, 32, 5) }
            )
        ]
    },
    "thumbs-up": { tint: "yellow", parts: [{ role: "fill2", d: rect(9, 29, 12, 28, 2) }, { role: "base", d: THUMB }, { role: "line", d: "M45 37h7M45 44h6" }] },
    "thumbs-down": {
        tint: "yellow",
        parts: [
            { role: "fill2", d: rect(9, 29, 12, 28, 2), t: "rotate(180 32 32)" },
            { role: "base", d: THUMB, t: "rotate(180 32 32)" },
            { role: "line", d: "M45 37h7M45 44h6", t: "rotate(180 32 32)" }
        ]
    },
    clap: {
        parts: [
            { role: "base", d: rect(12, 18, 18, 34, 9), t: "rotate(-16 21 35)" },
            { role: "base", d: rect(32, 18, 18, 34, 9), t: "rotate(16 41 35)" },
            { role: "mark", d: "M14 12l-4-5M32 9V3M50 12l4-5" }
        ]
    },
    pray: {
        parts: [
            { role: "fill2", d: rect(15, 46, 16, 11, 2) },
            { role: "fill2", d: rect(33, 46, 16, 11, 2) },
            { role: "base", d: "M31 9c-3 0-5 3-6 8l-6 23c-1 4 1 6 4 6h8z" },
            { role: "base", d: "M33 9c3 0 5 3 6 8l6 23c1 4-1 6-4 6h-8z" },
            { role: "mark", d: "M14 14l-5-3M50 14l5-3M12 26H6M52 26h6" }
        ]
    },
    fire: { parts: [{ role: "hot", d: FLAME }, { role: "gold", d: FLAME_IN }] },
    eyes: {
        parts: [
            { role: "white", d: ellipse(21, 32, 11, 15) },
            { role: "white", d: ellipse(43, 32, 11, 15) },
            { role: "dot", d: circle(25, 35, 5) },
            { role: "dot", d: circle(47, 35, 5) }
        ]
    },
    crown: {
        parts: [
            { role: "gold", d: "M9 46L6 20l13 11 13-17 13 17 13-11-3 26z" },
            { role: "gold", d: rect(9, 46, 46, 8, 2) },
            { role: "hot", d: circle(32, 38, 4) },
            { role: "white", d: circle(6, 18, 3) },
            { role: "white", d: circle(32, 12, 3) },
            { role: "white", d: circle(58, 18, 3) }
        ]
    },
    lucky: {
        parts: [
            { role: "cline", d: "M32 34c1 10 6 16 12 22", w: 1.2 },
            { role: "cool", d: heart(32, 19, 10), t: "rotate(0 32 19)" },
            { role: "cool", d: heart(32, 19, 10), t: "rotate(90 32 30)" },
            { role: "cool", d: heart(32, 19, 10), t: "rotate(180 32 30)" },
            { role: "cool", d: heart(32, 19, 10), t: "rotate(270 32 30)" }
        ]
    },
    bag: { parts: [{ role: "base", d: BAG }, { role: "fill2", d: rect(23, 19, 18, 6, 2) }, { text: "$", x: 32, y: 50, size: 18, tone: "ink" }] },
    spade: { tint: "blue", parts: [{ role: "base", d: SPADE }] },
    heart: { parts: [{ role: "hot", d: heart(32, 32, 24) }] },
    diamond: { parts: [{ role: "hot", d: DIAMOND }] },
    club: { tint: "green", parts: [{ role: "base", d: CLUB }] }
};
