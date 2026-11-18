import React, { useId } from "react";
import type { TableSkin } from "../brand";

/**
 * Table-skin art (block52-chat#2). Every skin icon is drawn once, as shapes on
 * a 64 grid that each have a *role* (the face, the body, a feature line, a hot
 * accent…). Each table skin paints those roles its own way, so one drawing
 * reads as four different looks that all match their table:
 *
 *   flagship   night glass and neon: dark fills, fuchsia → violet → blue line, glow
 *   chipchair  comic sticker: flat candy fills, fat ink outline, hard offset shadow
 *   badbeat    sports broadcast: flat white / red / gold / ice, no outline
 *   maison     private salon: ivory, brass, oxblood and bottle green
 */
export type Role =
    | "face" // a face's skin
    | "base" // the main body of an object
    | "fill2" // a secondary body (cuffs, lids, fins)
    | "white" // light parts: card faces, eye whites, teeth
    | "hot" // red accent: hearts, flames, jewels
    | "gold" // gold accent: chips, stars, bolts
    | "cool" // ice accent: tears, windows, clover
    | "dot" // small dark solids drawn on top: pupils, open mouths
    | "line" // features drawn on top of a body (eyes, mouths, creases)
    | "mark" // free strokes on the background (motion lines, rays)
    | "hline" // a hot stroke
    | "cline" // a cool stroke
    | "gline"; // a gold stroke

export type Tone = "ink" | "light" | "gold" | "hot" | "mark";

export interface Shape {
    role: Role;
    d: string;
    /** optional SVG transform for this shape */
    t?: string;
    /** stroke width multiplier for line roles */
    w?: number;
}
export interface Label {
    text: string;
    x: number;
    y: number;
    size: number;
    tone: Tone;
    t?: string;
}
export type Part = Shape | Label;
export interface Glyph {
    parts: Part[];
    /** comic-skin fill for the face/base (chipchair), e.g. "red" for an angry face */
    tint?: CcTint;
}

export const isLabel = (p: Part): p is Label => "text" in p;

// ── geometry helpers (64 grid) ──────────────────────────────────────────────
export const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
    r ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z` : `M${x} ${y}h${w}v${h}h${-w}z`;
/** A heart centred on (cx, cy), `s` = half-width. */
export const heart = (cx: number, cy: number, s: number) => {
    const k = s / 23;
    const pts = [0, 21, -14, 11, -23, 2, -23, -9, -23, -16, -18, -21, -11, -21, -6, -21, -2, -18, 0, -14, 2, -18, 6, -21, 11, -21, 18, -21, 23, -16, 23, -9, 23, 2, 14, 11, 0, 21];
    const q = (i: number) => `${+(cx + pts[i] * k).toFixed(2)} ${+(cy + pts[i + 1] * k).toFixed(2)}`;
    return `M${q(0)}C${q(2)} ${q(4)} ${q(6)}C${q(8)} ${q(10)} ${q(12)}C${q(14)} ${q(16)} ${q(18)}C${q(20)} ${q(22)} ${q(24)}C${q(26)} ${q(28)} ${q(30)}C${q(32)} ${q(34)} ${q(36)}z`;
};
/** A four-point sparkle. */
export const sparkle = (cx: number, cy: number, r: number) => {
    const q = r * 0.28;
    return `M${cx} ${cy - r}L${cx + q} ${cy - q}L${cx + r} ${cy}L${cx + q} ${cy + q}L${cx} ${cy + r}L${cx - q} ${cy + q}L${cx - r} ${cy}L${cx - q} ${cy - q}z`;
};
/** An n-point star. */
export const star = (cx: number, cy: number, r: number, n = 5, inner = 0.45) => {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
        const a = (Math.PI * i) / n - Math.PI / 2;
        const rr = i % 2 ? r * inner : r;
        d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`;
    }
    return d + "z";
};
/** A teardrop pointing up, its round end centred on (cx, cy). */
export const drop = (cx: number, cy: number, r: number) => `M${cx} ${cy - r * 2.1}C${cx + r * 0.6} ${cy - r} ${cx + r} ${cy - r * 0.4} ${cx + r} ${cy}a${r} ${r} 0 0 1 ${-2 * r} 0c0-${r * 0.4} ${r * 0.4}-${r} ${r}-${r * 2.1}z`;
/** A flat poker chip seen from the side (a short pill). */
export const chip = (x: number, y: number, w: number, h = 7) => rect(x, y, w, h, h / 2);

// ── skin palettes ───────────────────────────────────────────────────────────
export type CcTint = "yellow" | "pink" | "blue" | "green" | "red" | "lavender" | "sky" | "white";
export const CC = {
    ink: "#0E0E10",
    yellow: "#FFD23F",
    pink: "#FF6FB5",
    blue: "#3D7BFF",
    green: "#22C55E",
    red: "#FF4D3D",
    lavender: "#B9A2FF",
    sky: "#7FD4FF",
    white: "#FFFFFF",
    paper: "#FBFBF8"
} as const;
export const FL = { fu: "#C026D3", vi: "#7C3AED", bl: "#3B82F6", hiFu: "#E879F9", hiVi: "#A78BFA", hiBl: "#60A5FA", dark: "#140f28", dark2: "#2a1f4d", fg: "#F4F2FA" } as const;
export const BB = { bg: "#0A0C0F", fg: "#EEF1F5", red: "#FF2D55", gold: "#F5C542", ice: "#9FD8FF", steel: "#4a525e", ok: "#2EE59D" } as const;
export const MS = { ivory: "#FBF8F3", ink: "#1D1A16", brass: "#A9834C", brassHi: "#E6CF9E", brass2: "#CDB07F", brassLo: "#7E5E2E", green: "#0F3B2E", green2: "#1B5443", ox: "#6E1F2B" } as const;

export const FONTS = {
    flagship: "Unbounded, Inter, 'Arial Black', sans-serif",
    chipchair: "'Dela Gothic One', 'Arial Black', Impact, sans-serif",
    badbeat: "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif",
    badbeatMono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
    maisonSerif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    maisonSans: "Jost, 'Helvetica Neue', Arial, sans-serif"
} as const;

type Paint = { fill: string; stroke?: string; strokeWidth?: number };

/** The gradients/filters a skin's paints refer to, scoped by `uid`. */
export const SkinDefs: React.FC<{ skin: TableSkin; uid: string }> = ({ skin, uid }) => {
    switch (skin) {
        case "flagship":
            return (
                <>
                    <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={FL.hiFu} />
                        <stop offset=".5" stopColor={FL.hiVi} />
                        <stop offset="1" stopColor={FL.hiBl} />
                    </linearGradient>
                    <linearGradient id={`f${uid}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={FL.dark2} />
                        <stop offset="1" stopColor={FL.dark} />
                    </linearGradient>
                    <filter id={`e${uid}`} x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur stdDeviation="2.2" result="b" />
                        <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </>
            );
        case "maison":
            return (
                <>
                    <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={MS.brassHi} />
                        <stop offset=".45" stopColor={MS.brass} />
                        <stop offset=".7" stopColor={MS.brass2} />
                        <stop offset="1" stopColor={MS.brassLo} />
                    </linearGradient>
                    <filter id={`e${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#46321a" floodOpacity=".28" />
                    </filter>
                </>
            );
        case "badbeat":
            return (
                <filter id={`e${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity=".5" />
                </filter>
            );
        default:
            return null;
    }
};

/** How a skin paints one role. `tint` is the comic skin's body colour. */
export function paint(skin: TableSkin, role: Role, uid: string, tint: string): Paint {
    const none = "none";
    switch (skin) {
        case "flagship": {
            const g = `url(#g${uid})`;
            const f = `url(#f${uid})`;
            if (role === "line" || role === "mark" || role === "hline" || role === "cline" || role === "gline") return { fill: none, stroke: g, strokeWidth: 2.6 };
            if (role === "dot") return { fill: g };
            return { fill: f, stroke: g, strokeWidth: 2.4 };
        }
        case "chipchair": {
            const o = { stroke: CC.ink, strokeWidth: 3 };
            switch (role) {
                case "face":
                case "base":
                    return { fill: tint, ...o };
                case "fill2":
                    return { fill: tint === CC.pink ? CC.yellow : CC.pink, ...o };
                case "white":
                    return { fill: CC.white, ...o };
                case "hot":
                    return { fill: CC.red, ...o };
                case "gold":
                    return { fill: tint === CC.yellow ? CC.white : CC.yellow, ...o };
                case "cool":
                    return { fill: CC.sky, ...o };
                case "dot":
                    return { fill: CC.ink };
                case "hline":
                    return { fill: none, stroke: CC.red, strokeWidth: 3.6 };
                case "cline":
                    return { fill: none, stroke: CC.blue, strokeWidth: 3.6 };
                case "gline":
                    return { fill: none, stroke: CC.yellow, strokeWidth: 3.6 };
                default:
                    return { fill: none, stroke: CC.ink, strokeWidth: 3.2 };
            }
        }
        case "badbeat":
            switch (role) {
                case "face":
                case "base":
                case "white":
                    return { fill: BB.fg };
                case "fill2":
                    return { fill: BB.steel };
                case "hot":
                    return { fill: BB.red };
                case "gold":
                    return { fill: BB.gold };
                case "cool":
                    return { fill: BB.ice };
                case "dot":
                    return { fill: BB.bg };
                case "line":
                    return { fill: none, stroke: BB.bg, strokeWidth: 3 };
                case "mark":
                case "hline":
                    return { fill: none, stroke: BB.red, strokeWidth: 2.8 };
                case "cline":
                    return { fill: none, stroke: BB.ice, strokeWidth: 2.8 };
                default:
                    return { fill: none, stroke: BB.gold, strokeWidth: 2.8 };
            }
        case "maison": {
            const g = `url(#g${uid})`;
            switch (role) {
                case "face":
                case "white":
                    return { fill: MS.ivory, stroke: g, strokeWidth: 1.8 };
                case "base":
                case "gold":
                    return { fill: g };
                case "fill2":
                case "hot":
                    return { fill: MS.ox };
                case "cool":
                    return { fill: MS.green2 };
                case "dot":
                    return { fill: MS.ink };
                case "line":
                    return { fill: none, stroke: MS.ink, strokeWidth: 2.1 };
                case "hline":
                    return { fill: none, stroke: MS.ox, strokeWidth: 2.4 };
                case "cline":
                    return { fill: none, stroke: MS.green2, strokeWidth: 2.4 };
                default:
                    return { fill: none, stroke: g, strokeWidth: 2.2 };
            }
        }
    }
}

const LINE_ROLES: readonly Role[] = ["line", "mark", "hline", "cline", "gline"];

function toneFill(skin: TableSkin, tone: Tone, uid: string): string {
    switch (skin) {
        case "flagship":
            return tone === "light" ? FL.fg : `url(#g${uid})`;
        case "chipchair":
            return tone === "light" ? CC.white : tone === "hot" ? CC.red : CC.ink;
        case "badbeat":
            return tone === "light" ? "#fff" : tone === "gold" ? BB.gold : tone === "hot" || tone === "mark" ? BB.red : BB.bg;
        case "maison":
            return tone === "light" ? MS.ivory : tone === "gold" || tone === "mark" ? `url(#g${uid})` : tone === "hot" ? MS.ox : MS.ink;
    }
}

const TEXT_FONT: Record<TableSkin, { family: string; weight: number; italic?: boolean }> = {
    flagship: { family: FONTS.flagship, weight: 700 },
    chipchair: { family: FONTS.chipchair, weight: 400 },
    badbeat: { family: FONTS.badbeat, weight: 800, italic: true },
    maison: { family: FONTS.maisonSerif, weight: 700, italic: true }
};

/** The glyph's shapes painted in a skin, for embedding in an SVG that already has <SkinDefs>. */
export const GlyphLayers: React.FC<{ skin: TableSkin; glyph: Glyph; uid: string; tint?: string }> = ({ skin, glyph, uid, tint }) => {
    const bodyTint = tint ?? CC[glyph.tint ?? "yellow"];
    const shapes = glyph.parts.map((p, i) => {
        if (isLabel(p)) {
            const f = TEXT_FONT[skin];
            return (
                <text
                    key={i}
                    x={p.x}
                    y={p.y}
                    transform={p.t}
                    textAnchor="middle"
                    fontFamily={f.family}
                    fontWeight={f.weight}
                    fontStyle={f.italic ? "italic" : undefined}
                    fontSize={skin === "badbeat" ? p.size * 1.15 : p.size}
                    fill={toneFill(skin, p.tone, uid)}
                >
                    {p.text}
                </text>
            );
        }
        const pt = paint(skin, p.role, uid, bodyTint);
        const line = LINE_ROLES.includes(p.role);
        return (
            <path
                key={i}
                d={p.d}
                transform={p.t}
                fill={pt.fill}
                stroke={pt.stroke}
                strokeWidth={pt.stroke ? (pt.strokeWidth ?? 2) * (p.w ?? 1) : undefined}
                strokeLinecap={line ? "round" : undefined}
                strokeLinejoin="round"
            />
        );
    });
    // The comic skin's hard offset shadow: every filled shape again, in ink, behind.
    const shadow =
        skin === "chipchair" ? (
            <g transform="translate(2.6 2.6)" fill={CC.ink} stroke={CC.ink} strokeWidth={3} strokeLinejoin="round">
                {glyph.parts.map((p, i) => (!isLabel(p) && !LINE_ROLES.includes(p.role) && p.role !== "dot" ? <path key={i} d={p.d} transform={p.t} /> : null))}
            </g>
        ) : null;
    return (
        <g filter={skin === "chipchair" ? undefined : `url(#e${uid})`}>
            {shadow}
            {shapes}
        </g>
    );
};

/** A stand-alone skin icon (emojis in messages and the picker). */
export const SkinIcon: React.FC<{ skin: TableSkin; glyph: Glyph; size?: number; label?: string; className?: string }> = ({ skin, glyph, size = 24, label, className }) => {
    const uid = `sk${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    return (
        <svg
            viewBox="2 2 60 60"
            width={size}
            height={size}
            className={className}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            overflow="visible"
        >
            <defs>
                <SkinDefs skin={skin} uid={uid} />
            </defs>
            <GlyphLayers skin={skin} glyph={glyph} uid={uid} />
        </svg>
    );
};
