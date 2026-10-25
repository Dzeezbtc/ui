import React from "react";
import { CastSpec, SKIN } from "./cast";
import { ChipPile } from "./frame";
import { Obj } from "./scene";

/**
 * Who says each movie line, drawn with the cast kit (cast.tsx): face shape,
 * hair, brows/nose/facial hair and the costume from the scene.
 */
const H = {
    black: "#141414",
    darkBrown: "#33231a",
    brown: "#5a3a22",
    lightBrown: "#7a5532",
    auburn: "#8a3a22",
    sandy: "#c9a46a",
    blond: "#dcb86a",
    platinum: "#efdca0",
    grey: "#9a958c",
    silver: "#c8c4bc",
    white: "#ececec",
    saltPepper: "#6e6a66",
    red: "#b04a2a",
    greenHair: "#5f9a4a"
};

const Oreo = (
    <g transform="translate(74 50)">
        <circle r={5} fill="#2b1d16" stroke="#1d1d1d" strokeWidth={1} />
        <circle r={3.6} fill="#f2ede4" />
    </g>
);

const kgb = (eyes: CastSpec["eyes"], mouth: CastSpec["mouth"], extra: Partial<CastSpec> = {}): CastSpec => ({
    who: "Teddy KGB",
    skin: SKIN.pale,
    face: "egg",
    hair: { color: H.darkBrown, line: "receding", volume: 0, texture: "slick" },
    brows: "thin",
    eyes,
    mouth,
    nose: "long",
    costume: { kind: "tracksuit", color: "#2a2f5a" },
    bg: "#2f4a3a",
    ...extra
});

export const CAST: Record<string, CastSpec> = {
    // ── Rounders ──
    "pay-that-man": kgb("smug", "smirk", { hold: "cash" }),
    nyet: kgb("angry", "frown", { hands: "hold", over: Oreo }),
    "splash-the-pot": kgb("crazy", "grin", { hands: "point", over: <ChipPile x={84} y={78} k={0.8} /> }),
    "spot-the-sucker": {
        who: "Mike McDermott",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "sideL", volume: 2 },
        brows: "straight",
        eyes: "smug",
        mouth: "smirk",
        costume: { kind: "suit", color: "#5a6070", shirt: "#cfd8e6" },
        hold: "cards-fan",
        bg: "#1f4f3a"
    },
    // ── Jerry Maguire ──
    "show-me-the-money": {
        who: "Jerry Maguire",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.darkBrown, line: "sideR", volume: 4, texture: "feathered" },
        brows: "thick",
        eyes: "crazy",
        mouth: "bigGrin",
        costume: { kind: "suit", color: "#2a2f40", shirt: "#ffffff", tie: "#8a1f2b" },
        hold: "phone",
        bg: "#5c86b5"
    },
    // ── Terminator ──
    "ill-be-back": {
        who: "The Terminator",
        skin: SKIN.tan,
        face: "block",
        hair: { color: H.brown, line: "flat", volume: 3 },
        brows: "straight",
        eyes: "shades",
        mouth: "flat",
        nose: "big",
        costume: { kind: "leather", color: "#1a1a1c", shirt: "#2c2c30" },
        hands: "thumb",
        bg: "#c7642a"
    },
    "hasta-la-vista": {
        who: "The T-800",
        skin: SKIN.tan,
        face: "block",
        hair: { color: H.brown, line: "flat", volume: 3 },
        brows: "straight",
        eyes: "shades",
        mouth: "smirk",
        nose: "big",
        costume: { kind: "leather", color: "#1a1a1c", shirt: "#2c2c30" },
        hands: "thumb",
        bg: "#3a6a8a"
    },
    // ── Scarface ──
    "little-friend": {
        who: "Tony Montana",
        skin: SKIN.olive,
        face: "narrow",
        hair: { color: H.black, line: "high", volume: 3, texture: "slick", shine: true },
        brows: "angry",
        eyes: "crazy",
        mouth: "shout",
        nose: "hook",
        facial: ["stubble"],
        costume: { kind: "suit", color: "#f4f1ea", shirt: "#8a1f1f" },
        hands: "hold",
        over: (
            <>
                <path d="M34 34 l7 8" stroke="#9b3b3b" strokeWidth={1.4} />
                <ChipPile x={76} y={64} k={0.9} />
            </>
        ),
        bg: "#e8a6b5"
    },
    // ── Lord of the Rings ──
    "shall-not-pass": {
        who: "Gandalf",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.silver, line: "high", volume: 3, length: "shoulder", texture: "wavy" },
        brows: "bushy",
        browColor: "#bdbdbd",
        eyes: "angry",
        mouth: "shout",
        nose: "long",
        facial: ["fullBeard"],
        facialColor: "#dcdcdc",
        costume: { kind: "robe", color: "#8d8d93" },
        hands: "up",
        scene: (
            <>
                <ellipse cx={50} cy={86} rx={60} ry={16} fill="#e8592a" opacity={0.6} />
                <path d="M78 76 V8" stroke="#7a5230" strokeWidth={3} />
                <circle cx={78} cy={6} r={3.6} fill="#e8f4ff" stroke="#1d1d1d" strokeWidth={1} />
            </>
        ),
        bg: "#2b1a14"
    },
    "one-does-not-simply": {
        who: "Boromir",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.brown, line: "middle", volume: 3, length: "shoulder", texture: "wavy" },
        brows: "worried",
        eyes: "sad",
        mouth: "flat",
        nose: "long",
        facial: ["beard"],
        costume: { kind: "robe", color: "#6b4a2f", accent: "#cdb48c" },
        hands: "circle",
        over: <path d="M30 56 C38 50 62 50 70 56 C62 54 38 54 30 56z" fill="#cdb48c" stroke="#1d1d1d" strokeWidth={1} />,
        bg: "#8c8a80"
    },
    "my-precious": {
        who: "Gollum",
        skin: "#c8c4b0",
        face: "egg",
        hair: { color: "#6a6a5a", line: "bald", volume: 0 },
        eyes: "crazy",
        mouth: "teeth",
        nose: "small",
        costume: { kind: "bare", color: "#c8c4b0" },
        hands: "hold",
        over: (
            <>
                <path d="M40 10 q-2 -6 2 -8 M52 8 q0 -6 4 -6 M60 12 q3 -4 6 -2" fill="none" stroke="#3a3a2a" strokeWidth={0.8} />
                <g transform="translate(74 46)">
                    <circle r={4.4} fill="none" stroke="#d6a531" strokeWidth={2.4} />
                </g>
            </>
        ),
        bg: "#3a3a2a"
    },
    // ── The Dark Knight / Batman ──
    "why-so-serious": {
        who: "The Joker",
        skin: "#f1ede4",
        face: "narrow",
        hair: { color: H.greenHair, line: "middle", volume: 5, length: "chin", texture: "wavy" },
        brows: "none",
        eyes: "crazy",
        mouth: "flat",
        costume: { kind: "suit", color: "#5a2f7a", shirt: "#5fae5a", tie: "#2f6a3a" },
        over: (
            <>
                <ellipse cx={43.6} cy={28} rx={8} ry={9} fill="#2a2a3a" opacity={0.6} />
                <ellipse cx={56.4} cy={28} rx={8} ry={9} fill="#2a2a3a" opacity={0.6} />
                <path d="M34 40 C40 48 60 48 66 38 C60 44 40 46 34 40z" fill="#c8232c" opacity={0.85} />
                <path d="M34 40 l-4 -4 M66 38 l4 -4" stroke="#c8232c" strokeWidth={1.6} />
            </>
        ),
        bg: "#3a3550"
    },
    "world-burn": {
        who: "Alfred",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.silver, line: "receding", volume: 1, texture: "slick" },
        brows: "worried",
        browColor: "#9a958c",
        eyes: "sad",
        mouth: "flat",
        nose: "big",
        glasses: "square",
        costume: { kind: "suit", color: "#151515", shirt: "#ffffff", tie: "#2a2a2a" },
        bg: "#c75a2a"
    },
    // ── Marvel ──
    inevitable: {
        who: "Thanos",
        skin: SKIN.purple,
        face: "jaw",
        hair: { color: "#5a3f7a", line: "bald", volume: 0 },
        brows: "straight",
        browColor: "#4f2f6e",
        eyes: "smug",
        mouth: "smirk",
        costume: { kind: "armor", color: "#3e4a8a", accent: "#d6a531" },
        hands: "snap",
        over: (
            <>
                <path d="M44 50 v4 M48 51 v5 M52 51 v5 M56 50 v4 M34 18 q16 -6 32 0" stroke="#4f2f6e" strokeWidth={1} fill="none" />
                <g transform="translate(76 34)">
                    <path d="M-6 4 h12 v-10 q-6 -4 -12 0z" fill="#d6a531" stroke="#1d1d1d" strokeWidth={1} />
                    {["#e8566f", "#3d7fd6", "#5fae5a", "#f2b632", "#8a5fb3"].map((c, i) => (
                        <circle key={c} cx={-4 + i * 2} cy={-4} r={0.9} fill={c} />
                    ))}
                </g>
            </>
        ),
        bg: "#1d1638"
    },
    "perfectly-balanced": {
        who: "Thanos",
        skin: SKIN.purple,
        face: "jaw",
        hair: { color: "#5a3f7a", line: "bald", volume: 0 },
        brows: "straight",
        browColor: "#4f2f6e",
        eyes: "closed",
        mouth: "smile",
        costume: { kind: "armor", color: "#3e4a8a", accent: "#d6a531" },
        hold: "scales",
        over: <path d="M44 50 v4 M48 51 v5 M52 51 v5 M56 50 v4 M34 18 q16 -6 32 0" stroke="#4f2f6e" strokeWidth={1} fill="none" />,
        bg: "#1d1638"
    },
    // ── Pretty Woman ──
    "big-mistake": {
        who: "Vivian",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.auburn, line: "middle", volume: 5, length: "shoulder", texture: "wavy", shine: true },
        brows: "arched",
        eyes: "smug",
        mouth: "bigGrin",
        lashes: true,
        costume: { kind: "dress", color: "#f4efe6", accent: "#5a3a22" },
        hold: "shopping-bag",
        bg: "#f3eee6"
    },
    // ── Captain Phillips ──
    "captain-now": {
        who: "Muse",
        skin: SKIN.deep,
        face: "narrow",
        hair: { color: H.black, line: "mid", volume: 1 },
        brows: "straight",
        eyes: "wide",
        mouth: "flat",
        costume: { kind: "tee", color: "#6d8a5a" },
        hands: "point",
        bg: "#3b6d8f"
    },
    // ── Chernobyl ──
    "not-great": {
        who: "Dyatlov",
        skin: SKIN.light,
        face: "narrow",
        hair: { color: H.silver, line: "receding", volume: 0, texture: "slick" },
        brows: "angry",
        browColor: "#5a5a5a",
        eyes: "smug",
        mouth: "frown",
        nose: "big",
        facial: ["stubble"],
        costume: { kind: "suit", color: "#3a3d42", shirt: "#ffffff", tie: "#4a3a2a" },
        over: (
            <>
                <rect x={6} y={6} width={22} height={14} rx={2} fill="#2c332b" stroke="#1d1d1d" strokeWidth={1} />
                <text x={17} y={13.5} textAnchor="middle" dominantBaseline="central" fontFamily="'Courier New', monospace" fontWeight={900} fontSize={8} fill="#ffb03a">
                    3.6
                </text>
            </>
        ),
        bg: "#5e6a5a"
    },
    // ── Dragon Ball ──
    "over-9000": {
        who: "Vegeta",
        skin: SKIN.light,
        face: "narrow",
        hair: { color: H.black, line: "widow", volume: 7, texture: "flame" },
        brows: "angry",
        eyes: "angry",
        mouth: "teeth",
        costume: { kind: "armor", color: "#2a3f8a", accent: "#f2f2f2" },
        over: <rect x={56} y={22} width={12} height={10} rx={1.5} fill="#5fd36a" opacity={0.6} stroke="#1d1d1d" strokeWidth={1} />,
        bg: "#4d7bb8"
    },
    // ── Scorsese ──
    "absolute-cinema": {
        who: "Martin Scorsese",
        skin: SKIN.light,
        face: "round",
        hair: { color: H.silver, line: "receding", volume: 3, texture: "slick" },
        brows: "bushy",
        browColor: "#2a2a2a",
        eyes: "closed",
        mouth: "smile",
        nose: "big",
        glasses: "thick",
        costume: { kind: "suit", color: "#2a2a2e", shirt: "#ffffff", tie: "#2a2a2e" },
        hands: "frame",
        scene: <path d="M30 -5 L10 90 H90 L70 -5z" fill="#fff6c2" opacity={0.18} />,
        bg: "#1a1a1a"
    },
    // ── 21 ──
    "chicken-dinner": {
        who: "Ben Campbell",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.brown, line: "sideL", volume: 3, texture: "smooth" },
        brows: "straight",
        eyes: "smug",
        mouth: "grin",
        costume: { kind: "suit", color: "#151515", shirt: "#ffffff", tie: "#151515" },
        hold: "drumstick",
        bg: "#7a1f2b"
    },
    // ── Happy Gilmore ──
    breakfast: {
        who: "Shooter McGavin",
        skin: SKIN.tan,
        face: "narrow",
        hair: { color: H.black, line: "sideL", volume: 3, texture: "slick", shine: true },
        brows: "devil",
        eyes: "smug",
        mouth: "smirk",
        nose: "small",
        costume: { kind: "vest", color: "#1f2a4a", shirt: "#ffffff" },
        hands: "point",
        bg: "#7fae6a"
    },
    "breakfast-reply": {
        who: "Happy Gilmore",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.brown, line: "fringe", volume: 4, length: "collar", texture: "wavy" },
        brows: "raised",
        eyes: "wide",
        mouth: "o",
        costume: { kind: "jersey", color: "#151515", accent: "#e8b84a", text: "B" },
        bg: "#7fae6a"
    },
    "price-is-wrong": {
        who: "Happy Gilmore",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.brown, line: "fringe", volume: 4, length: "collar", texture: "wavy" },
        brows: "angry",
        eyes: "angry",
        mouth: "shout",
        costume: { kind: "jersey", color: "#151515", accent: "#e8b84a", text: "B" },
        hands: "fists",
        bg: "#e8b84a"
    },
    // ── A Few Good Men ──
    "want-the-truth": {
        who: "Lt. Kaffee",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.darkBrown, line: "sideL", volume: 2, texture: "smooth" },
        brows: "angry",
        eyes: "angry",
        mouth: "shout",
        costume: { kind: "navyWhites", color: "#f7f7f4" },
        hands: "point",
        bg: "#7a5a3a"
    },
    "want-the-truth-reply": {
        who: "Col. Jessup",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.saltPepper, line: "receding", volume: 1, texture: "slick" },
        brows: "devil",
        eyes: "angry",
        mouth: "shout",
        costume: { kind: "marine", color: "#4b5a3a" },
        bg: "#7a5a3a"
    },
    // ── Star Wars ──
    "your-father-reply": {
        who: "Luke Skywalker",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.sandy, line: "sideL", volume: 3 },
        brows: "worried",
        eyes: "sad",
        mouth: "shout",
        costume: { kind: "uniform", color: "#b8ab93" },
        hands: "up",
        bg: "#2a2f45"
    },
    "the-odds": {
        who: "Han Solo",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "sideL", volume: 3, texture: "feathered" },
        brows: "raised",
        eyes: "smug",
        mouth: "smirk",
        costume: { kind: "vest", color: "#151515", shirt: "#f2efe6" },
        bg: "#1d2440"
    },
    droids: {
        who: "Obi-Wan Kenobi",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.white, line: "high", volume: 2 },
        brows: "bushy",
        browColor: "#d0d0d0",
        eyes: "smug",
        mouth: "flat",
        nose: "long",
        facial: ["beard"],
        facialColor: "#e4e4e4",
        costume: { kind: "robe", color: "#a08060" },
        hands: "frame",
        bg: "#c9a46a"
    },
    // ── Anchorman ──
    "big-deal": {
        who: "Ron Burgundy",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "sideL", volume: 6, texture: "feathered", shine: true },
        brows: "thick",
        eyes: "smug",
        mouth: "smirk",
        facial: ["chevron"],
        costume: { kind: "suit", color: "#7a1f2f", shirt: "#f2e6c8", tie: "#c97a3a" },
        bg: "#3b5a8a"
    },
    "big-deal-reply": {
        who: "Veronica Corningstone",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.platinum, line: "middle", volume: 5, length: "shoulder", texture: "feathered" },
        brows: "arched",
        eyes: "smug",
        mouth: "flat",
        lashes: true,
        lips: true,
        costume: { kind: "dress", color: "#c46a8a" },
        bg: "#3b5a8a"
    },
    "bad-choice": {
        who: "Ron Burgundy",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "sideL", volume: 6, texture: "feathered" },
        brows: "worried",
        eyes: "sad",
        mouth: "frown",
        facial: ["chevron"],
        costume: { kind: "suit", color: "#7a1f2f", shirt: "#f2e6c8", tie: "#c97a3a" },
        over: <path d="M68 16 q-3 4 0 6 q3 -2 0 -6z" fill="#7cc0ee" stroke="#1d1d1d" strokeWidth={0.6} />,
        bg: "#e8e0c8"
    },
    // ── Taken ──
    "find-you": {
        who: "Bryan Mills",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.saltPepper, line: "mid", volume: 1 },
        brows: "angry",
        eyes: "angry",
        mouth: "flat",
        nose: "long",
        costume: { kind: "leather", color: "#2a2a2e", shirt: "#3a3a40" },
        hold: "phone",
        bg: "#2c3a40"
    },
    "find-you-reply": {
        who: "Marko",
        skin: SKIN.light,
        face: "narrow",
        hair: { color: H.black, line: "high", volume: 2, texture: "slick" },
        brows: "thick",
        eyes: "smug",
        mouth: "smirk",
        facial: ["stubble"],
        costume: { kind: "leather", color: "#3a2a22" },
        bg: "#2c3a40"
    },
    // ── The Princess Bride ──
    inconceivable: {
        who: "Vizzini",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.brown, line: "receding", volume: 2, texture: "curly" },
        brows: "raised",
        eyes: "crazy",
        mouth: "shout",
        costume: { kind: "doublet", color: "#3a2a5a", accent: "#d6a531" },
        bg: "#7d8f5a"
    },
    "inconceivable-reply": {
        who: "Inigo Montoya",
        skin: SKIN.olive,
        face: "long",
        hair: { color: H.black, line: "middle", volume: 4, length: "shoulder", texture: "wavy" },
        brows: "thick",
        eyes: "smug",
        mouth: "flat",
        facial: ["mustache"],
        costume: { kind: "vest", color: "#2a2a2a", shirt: "#f2efe6" },
        bg: "#7d8f5a"
    },
    // ── Mean Girls ──
    fetch: {
        who: "Gretchen Wieners",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.brown, line: "middle", volume: 6, length: "shoulder", texture: "wavy", shine: true },
        brows: "arched",
        eyes: "wide",
        mouth: "smile",
        lashes: true,
        lips: true,
        costume: { kind: "dress", color: "#e8a6c0" },
        bg: "#f2c6d8"
    },
    "fetch-reply": {
        who: "Regina George",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.platinum, line: "sideL", volume: 5, length: "long", texture: "smooth", shine: true },
        brows: "arched",
        eyes: "smug",
        mouth: "frown",
        lashes: true,
        lips: true,
        costume: { kind: "dress", color: "#e85c8a" },
        bg: "#f2c6d8"
    },
    // ── Pulp Fiction ──
    "say-what": {
        who: "Jules",
        skin: SKIN.brown,
        face: "oval",
        hair: { color: H.black, line: "mid", volume: 7, length: "collar", texture: "jheri", shine: true },
        brows: "angry",
        eyes: "angry",
        mouth: "shout",
        nose: "wide",
        facial: ["chops", "mustache"],
        costume: { kind: "suit", color: "#151515", shirt: "#ffffff", tie: "#151515" },
        hands: "point",
        bg: "#c79a3a"
    },
    "say-what-reply": {
        who: "Brett",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.brown, line: "fringe", volume: 4, texture: "curly" },
        brows: "worried",
        eyes: "wide",
        mouth: "o",
        costume: { kind: "polo", color: "#5a7aa8", shirt: "#5a7aa8" },
        bg: "#c79a3a"
    },
    // ── Step Brothers ──
    "best-friends": {
        who: "Brennan",
        skin: SKIN.light,
        face: "round",
        hair: { color: H.brown, line: "fringe", volume: 5, length: "ears", texture: "wavy" },
        brows: "raised",
        eyes: "wide",
        mouth: "grin",
        costume: { kind: "tee", color: "#5f7d9a" },
        bg: "#e8c48a"
    },
    "best-friends-reply": {
        who: "Dale",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.darkBrown, line: "low", volume: 5, texture: "curly" },
        brows: "thick",
        eyes: "wide",
        mouth: "grin",
        costume: { kind: "tee", color: "#8a5a3a" },
        hands: "thumb",
        bg: "#e8c48a"
    },
    // ── Jaws ──
    "bigger-boat": {
        who: "Chief Brody",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.saltPepper, line: "receding", volume: 1 },
        brows: "worried",
        eyes: "wide",
        mouth: "flat",
        nose: "long",
        glasses: "square",
        costume: { kind: "uniform", color: "#6a7aa0" },
        scene: (
            <>
                <rect x={-5} y={56} width={110} height={30} fill="#2a5a8a" />
                <path d="M74 70 l6 -14 l6 14z" fill="#6a7a8a" stroke="#1d1d1d" strokeWidth={1} />
            </>
        ),
        bg: "#7ab0d8"
    },
    // ── Dirty Harry / Taxi Driver / The Godfather ──
    "feel-lucky": {
        who: "Harry Callahan",
        skin: SKIN.tan,
        face: "long",
        hair: { color: H.lightBrown, line: "sideL", volume: 3, texture: "smooth" },
        brows: "angry",
        eyes: "squint",
        mouth: "flat",
        nose: "long",
        costume: { kind: "suit", color: "#8a7350", shirt: "#ffffff", tie: "#5a4a2a" },
        hands: "point",
        bg: "#7a6a5a"
    },
    "talkin-to-me": {
        who: "Travis Bickle",
        skin: SKIN.light,
        face: "narrow",
        hair: { color: H.darkBrown, line: "mid", volume: 2 },
        brows: "angry",
        eyes: "smug",
        mouth: "smirk",
        nose: "small",
        costume: { kind: "army", color: "#5a5a3a" },
        hands: "point",
        bg: "#2f2f3a"
    },
    "cant-refuse": {
        who: "Vito Corleone",
        skin: SKIN.light,
        face: "jaw",
        hair: { color: H.grey, line: "high", volume: 1, texture: "slick" },
        brows: "thick",
        browColor: "#4a4a4a",
        eyes: "smug",
        mouth: "frown",
        nose: "big",
        facial: ["pencil"],
        facialColor: "#5a5a5a",
        costume: { kind: "tux", color: "#141414", shirt: "#ffffff" },
        over: (
            <>
                <path d="M32 38 q2 8 8 11 M68 38 q-2 8 -8 11" fill="none" stroke="#1d1d1d" strokeWidth={0.8} opacity={0.7} />
                <circle cx={60} cy={60} r={2.6} fill="#c8232c" stroke="#1d1d1d" strokeWidth={0.6} />
            </>
        ),
        bg: "#3a2a1d"
    },
    // ── Gladiator / 300 ──
    entertained: {
        who: "Maximus",
        skin: SKIN.tan,
        face: "square",
        hair: { color: H.darkBrown, line: "mid", volume: 0 },
        brows: "angry",
        eyes: "angry",
        mouth: "shout",
        facial: ["beard"],
        costume: { kind: "armor", color: "#6b4a2f", accent: "#9a7a4a" },
        hands: "spread",
        bg: "#c79a5a"
    },
    sparta: {
        who: "Leonidas",
        skin: SKIN.tan,
        face: "square",
        hair: { color: H.black, line: "mid", volume: 2, texture: "wavy" },
        brows: "angry",
        eyes: "angry",
        mouth: "shout",
        facial: ["fullBeard"],
        costume: { kind: "bare", color: "#9a1f1f" },
        hands: "spread",
        over: (
            <>
                <path d="M54 78 L86 66" stroke="#1d1d1d" strokeWidth={9.6} strokeLinecap="round" />
                <path d="M54 78 L86 66" stroke={SKIN.tan} strokeWidth={7} strokeLinecap="round" />
                <path d="M84 62 l8 2 l-2 6 l-8 -1z" fill="#6b4a2f" stroke="#1d1d1d" strokeWidth={1} />
                <path d="M92 58 l4 -3 M93 66 h5" stroke="#1d1d1d" strokeWidth={1.1} strokeLinecap="round" />
            </>
        ),
        bg: "#d9894a"
    },
    // ── The Wolf of Wall Street ──
    "not-leaving": {
        who: "Jordan Belfort",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.sandy, line: "high", volume: 3, texture: "slick", shine: true },
        brows: "angry",
        eyes: "crazy",
        mouth: "shout",
        costume: { kind: "suit", color: "#2a2f45", shirt: "#ffffff", tie: "#8a1f2b" },
        hold: "microphone",
        bg: "#2f4a6a"
    },
    // ── The Big Lebowski ──
    "your-opinion": {
        who: "The Dude",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.lightBrown, line: "high", volume: 4, length: "shoulder", texture: "wavy" },
        brows: "raised",
        eyes: "smug",
        mouth: "flat",
        facial: ["beard"],
        glasses: "square",
        costume: { kind: "cardigan", color: "#c4a77a", shirt: "#e8e0c8", accent: "#5a3a22" },
        bg: "#8a6a9a"
    },
    // ── Casino Royale ──
    "nearly-killed-me": {
        who: "James Bond",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.blond, line: "low", volume: 1 },
        brows: "straight",
        browColor: "#a8885a",
        eyes: "smug",
        mouth: "flat",
        costume: { kind: "tux", color: "#151515", shirt: "#ffffff" },
        bg: "#2a4a3a"
    },
    // ── Ocean's Eleven ──
    "in-or-out": {
        who: "Danny Ocean",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.saltPepper, line: "low", volume: 2 },
        brows: "thick",
        browColor: "#3a3a3a",
        eyes: "smug",
        mouth: "smirk",
        facial: ["stubble"],
        costume: { kind: "suit", color: "#2a2a2e", shirt: "#3a3a40" },
        bg: "#5a2a3a"
    },
    // ── Austin Powers ──
    "one-million": {
        who: "Dr. Evil",
        skin: SKIN.light,
        face: "round",
        hair: { color: H.black, line: "bald", volume: 0 },
        brows: "thin",
        eyes: "smug",
        mouth: "smirk",
        costume: { kind: "doublet", color: "#8a8a8a", accent: "#6a6a6a" },
        hands: "pinky",
        over: <path d="M57 18 l8 10 M59 17 l1 3 M62 21 l1 3" stroke="#9b3b3b" strokeWidth={1.2} />,
        bg: "#3a3a5a"
    },
    // ── Home Alone ──
    "filthy-animal": {
        who: "Johnny",
        skin: SKIN.light,
        face: "narrow",
        hair: { color: H.black, line: "high", volume: 1, texture: "slick" },
        brows: "angry",
        eyes: "angry",
        mouth: "smirk",
        costume: { kind: "suit", color: "#2a2a2a", shirt: "#ffffff", tie: "#5a1a1a" },
        hat: "cowboy-hat",
        hold: "cash",
        bg: "#3a3a3a"
    },
    // ── Jurassic Park ──
    "finds-a-way": {
        who: "Ian Malcolm",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.black, line: "sideL", volume: 4, texture: "curly" },
        brows: "raised",
        eyes: "smug",
        mouth: "smirk",
        nose: "long",
        glasses: "square",
        costume: { kind: "leather", color: "#151515", shirt: "#151515" },
        bg: "#3f6a3a"
    },
    // ── Titanic ──
    "king-of-the-world": {
        who: "Jack Dawson",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.sandy, line: "middle", volume: 3, length: "ears", texture: "smooth" },
        brows: "straight",
        eyes: "wide",
        mouth: "grin",
        costume: { kind: "vest", color: "#6a5a4a", shirt: "#f2efe6" },
        hands: "spread",
        bg: "#5aa0d0"
    },
    // ── Zoolander ──
    "center-for-ants": {
        who: "Derek Zoolander",
        skin: SKIN.tan,
        face: "heart",
        hair: { color: H.platinum, line: "sideR", volume: 4, texture: "spiky" },
        brows: "angry",
        eyes: "angry",
        mouth: "pout",
        costume: { kind: "leather", color: "#c8c8d0", shirt: "#ffffff" },
        bg: "#d8d0c0"
    },
    // ── Talladega Nights ──
    "first-or-last": {
        who: "Ricky Bobby",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "mid", volume: 2 },
        brows: "raised",
        eyes: "wide",
        mouth: "grin",
        costume: { kind: "racing", color: "#f2f2f2", accent: "#2f6fc0" },
        hands: "thumb",
        bg: "#e85c2a"
    },
    // ── Billy Madison ──
    dumber: {
        who: "The principal",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.grey, line: "receding", volume: 1 },
        brows: "straight",
        eyes: "smug",
        mouth: "frown",
        glasses: "square",
        costume: { kind: "suit", color: "#5a5a5a", shirt: "#ffffff", tie: "#2a2a2a" },
        bg: "#c8c0a8"
    },
    // ── Good Will Hunting ──
    "them-apples": {
        who: "Will Hunting",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "low", volume: 1 },
        brows: "straight",
        eyes: "smug",
        mouth: "grin",
        costume: { kind: "hoodie", color: "#7a7a80" },
        bg: "#8a3a2a"
    }
};

// ── Comebacks (block52-chat#2): the replies to setup lines ─────────────────
const vaderMask = (
    <>
        <path d="M27 42 C25 14 38 4 50 4 C62 4 75 14 73 42 L67 54 H33 Z" fill="#141414" stroke="#555" strokeWidth={1} />
        <path d="M37 25 l9 0 l-2 7 h-7z M63 25 l-9 0 l2 7 h7z" fill="#3a3f4a" />
        <path d="M44 40 l6 11 l6 -11 M46 45 h8" fill="none" stroke="#777" strokeWidth={1} />
    </>
);

export const COMEBACK_CAST: Record<string, CastSpec> = {
    "im-in-danger": {
        who: "Ralph Wiggum",
        skin: "#f5d23c",
        face: "round",
        hair: { color: "#7a5532", line: "fringe", volume: 1 },
        eyes: "wide",
        mouth: "smile",
        nose: "button",
        costume: { kind: "tee", color: "#5a8ad8" },
        scene: (
            <>
                <rect x={-5} y={-5} width={110} height={90} fill="#f2c94c" />
                <rect x={4} y={4} width={92} height={50} rx={4} fill="#9ad0f0" stroke="#1d1d1d" strokeWidth={1.2} />
                <path d="M50 4 v50" stroke="#1d1d1d" strokeWidth={1.2} />
            </>
        ),
        bg: "#f2c94c"
    },
    "fly-you-fools": { ...CAST["shall-not-pass"], eyes: "wide", mouth: "shout", hands: "up", bg: "#1a1210" },
    yippee: {
        who: "John McClane",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.lightBrown, line: "receding", volume: 0 },
        brows: "angry",
        eyes: "squint",
        mouth: "smirk",
        facial: ["stubble"],
        costume: { kind: "tank", color: "#e8e2d4" },
        over: <path d="M38 38 l4 2 M60 20 l3 3" stroke="#9b3b3b" strokeWidth={1} />,
        bg: "#c7642a"
    },
    "im-batman": {
        who: "Batman",
        skin: SKIN.light,
        face: "square",
        hair: { color: "#141414", line: "bald", volume: 0 },
        eyes: "squint",
        mouth: "flat",
        costume: { kind: "armor", color: "#2a2a2e", accent: "#3a3a40" },
        over: (
            <>
                <path d="M28 40 C26 20 30 8 34 4 L38 14 H62 L66 4 C70 8 74 20 72 40 L64 36 C60 32 40 32 36 36Z" fill="#1d1d22" stroke="#1d1d1d" strokeWidth={1} />
                <path d="M42 64 q8 -4 16 0 q-4 -1 -8 3 q-4 -4 -8 -3z" fill="#e8c22a" stroke="#1d1d1d" strokeWidth={0.6} />
            </>
        ),
        bg: "#2a3040"
    },
    "iron-man": {
        who: "Tony Stark",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.darkBrown, line: "high", volume: 3, texture: "slick" },
        brows: "straight",
        eyes: "smug",
        mouth: "flat",
        facial: ["goatee", "pencil"],
        costume: { kind: "armor", color: "#b3212b", accent: "#d6a531" },
        hands: "snap",
        over: <circle cx={50} cy={64} r={3.4} fill="#bff4ff" stroke="#1d1d1d" strokeWidth={0.8} />,
        bg: "#1d1638"
    },
    "dont-feel-good": {
        who: "Peter Parker",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.brown, line: "sideL", volume: 3, texture: "wavy" },
        brows: "worried",
        eyes: "sad",
        mouth: "frown",
        costume: { kind: "armor", color: "#c8232c", accent: "#2f4fa0" },
        bg: "#3a3a3a"
    },
    "run-forrest": {
        who: "Jenny",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.brown, line: "middle", volume: 3, length: "long", texture: "smooth" },
        brows: "arched",
        eyes: "wide",
        mouth: "shout",
        lashes: true,
        costume: { kind: "dress", color: "#e8d8a8" },
        hands: "up",
        bg: "#8ab06a"
    },
    "had-me-at-hello": {
        who: "Dorothy Boyd",
        skin: SKIN.light,
        face: "heart",
        hair: { color: H.blond, line: "middle", volume: 3, length: "chin", texture: "smooth" },
        brows: "worried",
        eyes: "sad",
        mouth: "smile",
        lashes: true,
        lips: true,
        costume: { kind: "cardigan", color: "#a8b8d0", shirt: "#ffffff" },
        over: <path d="M40 34 q-1 4 0 6 M60 34 q1 4 0 6" stroke="#7cc0ee" strokeWidth={1.4} fill="none" />,
        bg: "#e8d0c0"
    },
    "what-9000": {
        who: "Nappa",
        skin: SKIN.tan,
        face: "block",
        hair: { color: H.black, line: "bald", volume: 0 },
        brows: "thick",
        browColor: "#141414",
        eyes: "wide",
        mouth: "shout",
        facial: ["handlebar"],
        facialColor: "#141414",
        costume: { kind: "armor", color: "#2a3f8a", accent: "#e8e0c8" },
        bg: "#4d7bb8"
    },
    "oscar-goes-to": {
        who: "The presenter",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.silver, line: "sideL", volume: 3, texture: "slick" },
        brows: "raised",
        eyes: "smug",
        mouth: "smile",
        costume: { kind: "tux", color: "#151515", shirt: "#ffffff" },
        hands: "hold",
        over: <rect x={70} y={42} width={12} height={8} fill="#e8d8a8" stroke="#1d1d1d" strokeWidth={0.8} />,
        scene: <path d="M30 -5 L10 90 H90 L70 -5z" fill="#fff6c2" opacity={0.2} />,
        bg: "#5a1a2a"
    },
    "keep-swimming": {
        who: "Dory",
        skin: "#3d7fd6",
        face: "wide",
        hair: { color: "#e8b84a", line: "bald", volume: 0 },
        eyes: "wide",
        mouth: "smile",
        costume: { kind: "bare", color: "#3d7fd6" },
        over: (
            <>
                <path d="M30 22 q20 -14 40 0 q-20 6 -40 0z" fill="#141414" opacity={0.7} />
                <path d="M72 30 l12 -10 l2 22z" fill="#e8b84a" stroke="#1d1d1d" strokeWidth={1} />
            </>
        ),
        bg: "#5ac0e0"
    },
    "who-else": { ...CAST["talkin-to-me"], eyes: "angry", mouth: "shout" },
    cannoli: {
        who: "Clemenza",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.darkBrown, line: "receding", volume: 1, texture: "slick" },
        brows: "thick",
        eyes: "smug",
        mouth: "smile",
        nose: "big",
        costume: { kind: "suit", color: "#4a4038", shirt: "#ffffff", tie: "#2a2a2a" },
        hat: "cowboy-hat",
        bg: "#3a2a1d"
    },
    "bye-felicia": {
        who: "Craig",
        skin: SKIN.brown,
        face: "round",
        hair: { color: H.black, line: "low", volume: 1 },
        brows: "thick",
        eyes: "smug",
        mouth: "smirk",
        nose: "wide",
        facial: ["mustache"],
        costume: { kind: "tee", color: "#f2f2f2" },
        hands: "spread",
        bg: "#e8b84a"
    },
    shaken: { ...CAST["nearly-killed-me"], mouth: "smirk", hold: "beer" },
    "lack-of-faith": {
        who: "Darth Vader",
        skin: "#141414",
        hair: { color: "#141414", line: "bald", volume: 0 },
        costume: { kind: "robe", color: "#141414" },
        hands: "circle",
        over: vaderMask,
        bg: "#2a2f45"
    },
    "not-a-lot": {
        who: "Scott Evil",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.black, line: "fringe", volume: 4, texture: "spiky" },
        brows: "angry",
        eyes: "smug",
        mouth: "frown",
        costume: { kind: "tee", color: "#151515" },
        hands: "spread",
        bg: "#3a3a5a"
    },
    "price-is-right": {
        who: "Bob Barker",
        skin: SKIN.tan,
        face: "long",
        hair: { color: H.white, line: "sideL", volume: 4, texture: "slick", shine: true },
        brows: "straight",
        browColor: "#bdbdbd",
        eyes: "smug",
        mouth: "grin",
        costume: { kind: "suit", color: "#2a3a5a", shirt: "#ffffff", tie: "#8a1f2b" },
        hands: "fists",
        over: <path d="M74 44 l2 -16" stroke="#9a9a9a" strokeWidth={1.6} />,
        bg: "#e8b84a"
    },
    "clever-girl": {
        who: "Muldoon",
        skin: SKIN.tan,
        face: "long",
        hair: { color: H.silver, line: "mid", volume: 1 },
        eyes: "smug",
        mouth: "smile",
        facial: ["stubble"],
        costume: { kind: "safari", color: "#b8a070" },
        hat: "cowboy-hat",
        bg: "#3f6a3a"
    },
    "french-girls": {
        who: "Rose",
        skin: SKIN.pale,
        face: "heart",
        hair: { color: H.red, line: "middle", volume: 5, length: "shoulder", texture: "wavy", shine: true },
        brows: "arched",
        eyes: "smug",
        mouth: "smile",
        lashes: true,
        lips: true,
        costume: { kind: "dress", color: "#2a2a5a" },
        bg: "#c8a0a0"
    },
    "three-times-bigger": { ...CAST["center-for-ants"], hands: "spread" },
    "shake-and-bake": {
        who: "Cal Naughton Jr.",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.darkBrown, line: "low", volume: 3, texture: "curly" },
        brows: "thick",
        eyes: "wide",
        mouth: "grin",
        costume: { kind: "racing", color: "#f2f2f2", accent: "#c8232c" },
        hands: "fists",
        bg: "#e85c2a"
    },
    regret: { ...CAST["bad-choice"], mouth: "teeth" },
    "no-points": { ...CAST.dumber, eyes: "angry", mouth: "frown", hands: "point" },
    "tap-it-in": {
        who: "Chubbs",
        skin: SKIN.deep,
        face: "square",
        hair: { color: H.black, line: "low", volume: 1 },
        brows: "straight",
        eyes: "smug",
        mouth: "smile",
        facial: ["mustache"],
        costume: { kind: "polo", color: "#e8d8a8", shirt: "#e8d8a8" },
        hat: "cowboy-hat",
        bg: "#7fae6a"
    },
    "too-old": {
        who: "Murtaugh",
        skin: SKIN.brown,
        face: "square",
        hair: { color: H.saltPepper, line: "low", volume: 1 },
        brows: "worried",
        eyes: "sad",
        mouth: "frown",
        nose: "wide",
        facial: ["mustache"],
        facialColor: "#8a8680",
        costume: { kind: "suit", color: "#6a5a4a", shirt: "#ffffff", tie: "#3a3a5a" },
        bg: "#5a6a7a"
    },
    "this-is-madness": {
        who: "The Persian messenger",
        skin: SKIN.brown,
        face: "long",
        hair: { color: H.black, line: "bald", volume: 0 },
        brows: "angry",
        eyes: "wide",
        mouth: "shout",
        facial: ["beard"],
        facialColor: "#141414",
        costume: { kind: "robe", color: "#5a3a7a", accent: "#d6a531" },
        hands: "spread",
        over: <path d="M30 12 h40" stroke="#d6a531" strokeWidth={2.4} />,
        bg: "#d9894a"
    },
    "wax-on": {
        who: "Mr. Miyagi",
        skin: SKIN.tan,
        face: "oval",
        hair: { color: H.silver, line: "mid", volume: 2 },
        brows: "bushy",
        browColor: "#bdbdbd",
        eyes: "squint",
        mouth: "flat",
        facial: ["mustache", "goatee"],
        facialColor: "#cfcfcf",
        costume: { kind: "polo", color: "#f2f2f2", shirt: "#f2f2f2" },
        hands: "circle",
        bg: "#c8b07a"
    },
    "wax-off": {
        who: "Daniel LaRusso",
        skin: SKIN.light,
        face: "oval",
        hair: { color: H.darkBrown, line: "fringe", volume: 3, texture: "wavy" },
        brows: "straight",
        eyes: "plain",
        mouth: "flat",
        costume: { kind: "gi", color: "#141414" },
        hands: "circle",
        over: <path d="M29 18 C40 14 60 14 71 18 L71 21 C60 17 40 17 29 21z" fill="#f2f2f2" stroke="#1d1d1d" strokeWidth={0.7} />,
        bg: "#c8b07a"
    },
    houston: {
        who: "Jim Lovell",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.brown, line: "sideL", volume: 1 },
        brows: "worried",
        eyes: "wide",
        mouth: "flat",
        costume: { kind: "jumpsuit", color: "#f2f2f2" },
        bg: "#141a2a"
    },
    "failure-not-option": {
        who: "Gene Kranz",
        skin: SKIN.light,
        face: "block",
        hair: { color: H.darkBrown, line: "flat", volume: 1 },
        brows: "angry",
        eyes: "angry",
        mouth: "flat",
        costume: { kind: "vest", color: "#f2f2f2", shirt: "#ffffff" },
        hands: "fists",
        bg: "#3a4a5a"
    },
    "cant-sit-with-us": { ...CAST.fetch, eyes: "smug", mouth: "smirk", hands: "point" },
    "prepare-to-die": { ...CAST["inconceivable-reply"], eyes: "angry", mouth: "shout", hands: "point" },
    "as-you-wish": {
        who: "Westley",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.sandy, line: "middle", volume: 3, length: "collar", texture: "wavy" },
        brows: "straight",
        eyes: "smug",
        mouth: "smile",
        costume: { kind: "tee", color: "#e8e0c8" },
        bg: "#7d8f5a"
    },
    "expect-me-to-talk": {
        who: "James Bond",
        skin: SKIN.light,
        face: "square",
        hair: { color: H.black, line: "sideL", volume: 2, texture: "slick" },
        brows: "thick",
        eyes: "smug",
        mouth: "smirk",
        costume: { kind: "suit", color: "#6a6a70", shirt: "#ffffff", tie: "#2a2a3a" },
        bg: "#c8a050"
    },
    "expect-you-to-die": {
        who: "Goldfinger",
        skin: SKIN.light,
        face: "wide",
        hair: { color: H.red, line: "receding", volume: 1 },
        brows: "thick",
        browColor: "#8a3a22",
        eyes: "smug",
        mouth: "smirk",
        costume: { kind: "cardigan", color: "#d6a531", shirt: "#ffffff" },
        bg: "#c8a050"
    },
    "busy-livin": {
        who: "Andy Dufresne",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.darkBrown, line: "sideL", volume: 2 },
        brows: "straight",
        eyes: "smug",
        mouth: "flat",
        costume: { kind: "prison", color: "#7a90b0", text: "37927" },
        bg: "#8a8a80"
    },
    "busy-dyin": {
        who: "Red",
        skin: SKIN.brown,
        face: "oval",
        hair: { color: H.saltPepper, line: "receding", volume: 1 },
        brows: "straight",
        eyes: "smug",
        mouth: "smile",
        facial: ["mustache"],
        facialColor: "#8a8680",
        costume: { kind: "prison", color: "#7a90b0", text: "30765" },
        bg: "#8a8a80"
    },
    "dead-people": {
        who: "Cole",
        skin: SKIN.pale,
        face: "round",
        hair: { color: H.sandy, line: "fringe", volume: 2 },
        brows: "worried",
        eyes: "wide",
        mouth: "flat",
        costume: { kind: "tee", color: "#c8c0b0" },
        over: <path d="M20 82 C20 62 34 56 50 56 C66 56 80 62 80 82z" fill="#f2efe6" stroke="#1d1d1d" strokeWidth={1} />,
        bg: "#3a3a4a"
    },
    "only-one": {
        who: "Connor MacLeod",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.brown, line: "middle", volume: 3, length: "shoulder", texture: "wavy" },
        brows: "angry",
        eyes: "angry",
        mouth: "shout",
        costume: { kind: "trench", color: "#7a6a5a" },
        hands: "up",
        bg: "#3a4a6a"
    },
    "two-men-enter": {
        who: "Dr. Dealgood",
        skin: SKIN.light,
        face: "long",
        hair: { color: H.platinum, line: "high", volume: 4, length: "chin", texture: "spiky" },
        brows: "raised",
        eyes: "crazy",
        mouth: "shout",
        costume: { kind: "leather", color: "#5a4a3a", shirt: "#8a7a5a" },
        hands: "up",
        bg: "#c7642a"
    }
};

/** Setup → comeback. Pairs can join two new stickers or reuse existing ones. */
export const REPLIES: Record<string, string> = {
    "shall-not-pass": "fly-you-fools",
    "little-friend": "yippee",
    "why-so-serious": "im-batman",
    inevitable: "iron-man",
    "perfectly-balanced": "dont-feel-good",
    "its-a-trap": "run-forrest",
    "show-me-the-money": "had-me-at-hello",
    "over-9000": "what-9000",
    "absolute-cinema": "oscar-goes-to",
    "bigger-boat": "keep-swimming",
    "talkin-to-me": "who-else",
    "cant-refuse": "cannoli",
    "not-leaving": "bye-felicia",
    "nearly-killed-me": "shaken",
    droids: "lack-of-faith",
    "one-million": "not-a-lot",
    "finds-a-way": "clever-girl",
    "king-of-the-world": "french-girls",
    "center-for-ants": "three-times-bigger",
    "first-or-last": "shake-and-bake",
    "bad-choice": "regret",
    dumber: "no-points",
    "price-is-wrong": "price-is-right",
    "card-dead": "too-old",
    "this-is-madness": "sparta",
    "wax-on": "wax-off",
    houston: "failure-not-option",
    "cant-sit-with-us": "not-leaving",
    "prepare-to-die": "as-you-wish",
    "expect-me-to-talk": "expect-you-to-die",
    "busy-livin": "busy-dyin",
    "dead-people": "card-dead",
    "only-one": "two-men-enter",
    "ill-be-back": "hasta-la-vista",
    "pay-that-man": "nyet",
    "spot-the-sucker": "talkin-to-me",
    "not-great": "im-in-danger",
    "chicken-dinner": "show-me-the-money",
    "feel-lucky": "the-odds",
    entertained: "absolute-cinema",
    "your-opinion": "big-deal",
    "in-or-out": "all-in-baby",
    "filthy-animal": "pay-that-man",
    "world-burn": "why-so-serious",
    "my-precious": "one-does-not-simply",
    // the original pairs
    breakfast: "breakfast-reply",
    "want-the-truth": "want-the-truth-reply",
    "your-father": "your-father-reply",
    "big-deal": "big-deal-reply",
    "find-you": "find-you-reply",
    inconceivable: "inconceivable-reply",
    fetch: "fetch-reply",
    "say-what": "say-what-reply",
    "best-friends": "best-friends-reply"
};

/** Labels for the new comeback stickers (id → [label, pack]). */
export const COMEBACK_LINES: Record<string, string> = {
    "fly-you-fools": "Fly, you fools!",
    yippee: "Yippee-ki-yay, motherf**ker!",
    "im-batman": "I'm Batman.",
    "iron-man": "And I… am… Iron Man.",
    "dont-feel-good": "I don't feel so good…",
    "run-forrest": "Run, Forrest, run!",
    "had-me-at-hello": "You had me at hello.",
    "what-9000": "WHAT, 9000?!",
    "oscar-goes-to": "And the Oscar goes to…",
    "keep-swimming": "Just keep swimming.",
    "who-else": "Then who the hell else are you talkin' to?",
    cannoli: "Leave the gun. Take the cannoli.",
    "bye-felicia": "Bye, Felicia.",
    shaken: "Shaken, not stirred.",
    "lack-of-faith": "I find your lack of faith disturbing.",
    "not-a-lot": "Why don't you just make it a hundred billion?",
    "price-is-right": "The price is right, bitch!",
    "clever-girl": "Clever girl.",
    "french-girls": "Draw me like one of your French girls.",
    "three-times-bigger": "It needs to be at least three times bigger!",
    "shake-and-bake": "Shake and bake!",
    regret: "I immediately regret this decision.",
    "no-points": "I award you no points, and may God have mercy on your soul.",
    "tap-it-in": "Just tap it in.",
    "too-old": "I'm getting too old for this shit.",
    "this-is-madness": "This is madness!",
    "wax-on": "Wax on.",
    "wax-off": "Wax off.",
    houston: "Houston, we have a problem.",
    "failure-not-option": "Failure is not an option.",
    "cant-sit-with-us": "You can't sit with us!",
    "prepare-to-die": "Prepare to die.",
    "as-you-wish": "As you wish.",
    "expect-me-to-talk": "Do you expect me to talk?",
    "expect-you-to-die": "No, Mr. Bond, I expect you to die!",
    "busy-livin": "Get busy livin'…",
    "busy-dyin": "…or get busy dyin'.",
    "dead-people": "I see dead people.",
    "only-one": "There can be only one!",
    "two-men-enter": "Two men enter, one man leaves!",
};
