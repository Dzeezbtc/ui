import React from "react";
import type { TableSkin } from "../brand";
import type { StickerDef } from "../stickers";
import { CC, BB, FL, MS, FONTS, SkinDefs, GlyphLayers, CcTint } from "./paint";
import { STICKER_GLYPHS } from "./stickerGlyphs";
import { MAISON_FRENCH } from "./maisonFrench";

/**
 * Stickers in a table skin (block52-chat#2), on a 100×100 box like the other
 * sticker styles:
 *
 *   flagship   no tile: the glowing line drawing, the phrase in gradient Unbounded caps
 *   chipchair  the one skin with a tile: a tilted candy-coloured square, fat outline, hard shadow
 *   badbeat    no box: the on-air graphic with a slanted TV chyron banner underneath
 *   maison     no card: the brass object, the French in italic serif, a brass hairline, the English
 *
 * The core packs have their own drawing (stickerGlyphs.ts). Everything else —
 * movie caricatures, rage faces, memes — keeps its drawing and takes the skin's
 * frame and caption through <SkinFrame>.
 */

const uidOf = (id: string) => `ss${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

function hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}

/** Split a caption onto two lines at the space nearest the middle when it's long. */
export function captionLines(label: string, max = 14): string[] {
    if (label.length <= max || !label.includes(" ")) return [label];
    const mid = label.length / 2;
    let best = -1;
    for (let i = 0; i < label.length; i++) if (label[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return [label.slice(0, best), label.slice(best + 1)];
}

const fit = (line: string, perChar: number, max: number) => (line.length * perChar > max ? { textLength: max, lengthAdjust: "spacingAndGlyphs" as const } : {});

// ── per-pack colours ────────────────────────────────────────────────────────
const CC_TILE: Record<string, CcTint> = {
    classics: "sky",
    hype: "yellow",
    "bad-beats": "red",
    calls: "lavender",
    movies: "pink",
    folklore: "green",
    banter: "sky",
    "pop-culture": "lavender",
    "rage-faces": "yellow"
};
type ChyronTone = "red" | "gold" | "ice";
const BB_TONE: Record<string, ChyronTone> = { classics: "red", hype: "gold", "bad-beats": "red", calls: "ice", movies: "gold", folklore: "ice", banter: "ice" };
const BB_TONE_BY_ID: Record<string, ChyronTone> = { cooler: "ice", "hero-call": "gold", "good-game": "gold", "well-played": "gold", "snap-call": "gold", thanks: "gold", "nice-hand": "gold" };
const CHYRON: Record<ChyronTone, string> = { red: BB.red, gold: "#b98b14", ice: "#2f6f99" };

export const ccTile = (s: StickerDef) => CC[CC_TILE[s.pack] ?? "white"];
export const bbTone = (s: StickerDef): ChyronTone => BB_TONE_BY_ID[s.id] ?? BB_TONE[s.pack] ?? "red";

// ── captions ────────────────────────────────────────────────────────────────

/** Flagship: gradient Unbounded caps with a soft violet glow. */
const FlagshipCaption: React.FC<{ label: string; uid: string }> = ({ label, uid }) => {
    const lines = captionLines(label.toUpperCase(), 13);
    const one = lines.length === 1;
    const fs = one ? 11.5 : 9.4;
    return (
        <g filter={`url(#c${uid})`}>
            {lines.map((l, i) => (
                <text key={i} x={50} y={one ? 87 : 82 + i * 10.5} textAnchor="middle" dominantBaseline="central" fontFamily={FONTS.flagship} fontWeight={700} fontSize={fs} letterSpacing="0.3" fill={`url(#t${uid})`} {...fit(l, fs * 0.82, 100)}>
                    {l}
                </text>
            ))}
        </g>
    );
};

/** Bad Beat: a slanted TV chyron banner in the pack colour with a white sliver. */
const Chyron: React.FC<{ label: string; tone: ChyronTone }> = ({ label, tone }) => {
    const lines = captionLines(label.toUpperCase(), 15);
    const one = lines.length === 1;
    const fs = one ? 14 : 11;
    const longest = Math.max(...lines.map(l => l.length));
    const w = Math.min(96, longest * fs * 0.47 + 18);
    const x0 = 50 - w / 2;
    const top = one ? 75 : 71;
    const h = one ? 19 : 28;
    const s = h * 0.32; // slant
    return (
        <g filter="url(#bbsh)">
            <path d={`M${x0 + s} ${top}H${x0 + w + s}L${x0 + w - s} ${top + h}H${x0 - s}z`} fill={CHYRON[tone]} />
            <path d={`M${x0 + w + s + 2} ${top}h2.6L${x0 + w - s + 4.6} ${top + h}h-2.6z`} fill="#fff" />
            {lines.map((l, i) => (
                <text key={i} x={50} y={one ? top + h / 2 + 0.5 : top + 7.5 + i * 12.5} textAnchor="middle" dominantBaseline="central" fontFamily={FONTS.badbeat} fontStyle="italic" fontWeight={800} fontSize={fs} letterSpacing="0.3" fill="#fff" {...fit(l, fs * 0.47, w - 6)}>
                    {l}
                </text>
            ))}
        </g>
    );
};

/** Maison: the phrase in italic serif (French when we have it), a brass hairline, the English in spaced caps. */
const MaisonCaption: React.FC<{ label: string; french?: string; uid: string }> = ({ label, french, uid }) => {
    const main = french ?? label;
    const lines = captionLines(main, 17);
    const one = lines.length === 1;
    const fs = one ? 15 : 12;
    const lastY = one ? 79 : 75 + 11;
    const halo = { stroke: MS.ivory, strokeWidth: 3, strokeOpacity: 0.85, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
    return (
        <g>
            {lines.map((l, i) => (
                <text key={i} x={50} y={one ? 79 : 75 + i * 11} textAnchor="middle" dominantBaseline="central" fontFamily={FONTS.maisonSerif} fontStyle="italic" fontWeight={600} fontSize={fs} fill={MS.ink} {...halo} {...fit(l, fs * 0.44, 100)}>
                    {l}
                </text>
            ))}
            {french && (
                <>
                    <path d={`M38 ${lastY + 8}H62`} stroke={`url(#g${uid})`} strokeWidth={0.8} />
                    <text x={50} y={lastY + 14} textAnchor="middle" dominantBaseline="central" fontFamily={FONTS.maisonSans} fontWeight={500} fontSize={5.4} letterSpacing="1.5" fill={MS.brass} {...halo} strokeWidth={2} {...fit(label.toUpperCase(), 5.4, 96)}>
                        {label.toUpperCase()}
                    </text>
                </>
            )}
        </g>
    );
};

/** Chip and a Chair: chunky Dela Gothic caps in ink inside the tile. */
const ComicCaption: React.FC<{ label: string }> = ({ label }) => {
    const lines = captionLines(label.toUpperCase(), 11);
    const one = lines.length === 1;
    const fs = one ? 10.5 : 8.6;
    return (
        <>
            {lines.map((l, i) => (
                <text key={i} x={50} y={one ? 82 : 76 + i * 9.6} textAnchor="middle" dominantBaseline="central" fontFamily={FONTS.chipchair} fontSize={fs} fill={CC.ink} {...fit(l, fs * 0.8, 76)}>
                    {l}
                </text>
            ))}
        </>
    );
};

/** The defs every skin sticker uses (glyph paints plus caption gradients/shadows). */
const StickerDefs: React.FC<{ skin: TableSkin; uid: string }> = ({ skin, uid }) => (
    <defs>
        <SkinDefs skin={skin} uid={uid} />
        {skin === "flagship" && (
            <>
                <linearGradient id={`t${uid}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#F0ABFC" />
                    <stop offset=".5" stopColor="#C4B5FD" />
                    <stop offset="1" stopColor="#93C5FD" />
                </linearGradient>
                <filter id={`c${uid}`} x="-20%" y="-60%" width="140%" height="220%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2.4" floodColor={FL.vi} floodOpacity=".75" />
                </filter>
            </>
        )}
        {skin === "badbeat" && (
            <filter id="bbsh" x="-10%" y="-30%" width="120%" height="160%">
                <feDropShadow dx="0" dy="1.6" stdDeviation="1.2" floodColor="#000" floodOpacity=".55" />
            </filter>
        )}
    </defs>
);

/** The comic tile: candy square, fat ink outline, hard offset shadow, a little tilt. */
const ComicTile: React.FC<{ fill: string; tilt: number; children: React.ReactNode; clipId?: string }> = ({ fill, tilt, children, clipId }) => (
    <g transform={`rotate(${tilt} 50 50)`}>
        <rect x={9} y={9} width={90} height={90} rx={14} fill={CC.ink} />
        <rect x={5} y={5} width={90} height={90} rx={14} fill={fill} stroke={CC.ink} strokeWidth={3.4} />
        {clipId && (
            <clipPath id={clipId}>
                <rect x={7} y={7} width={86} height={86} rx={12} />
            </clipPath>
        )}
        {children}
    </g>
);

const tiltOf = (id: string) => ((hash(id) % 2 ? 1 : -1) * (1.5 + (hash(id) % 3) * 0.8));

/** A core sticker redrawn for a table skin. */
export const SkinSticker: React.FC<{ skin: TableSkin; sticker: StickerDef; size?: number }> = ({ skin, sticker, size = 76 }) => {
    const glyph = STICKER_GLYPHS[sticker.id];
    const uid = uidOf(`${skin}-${sticker.id}-${React.useId()}`);
    if (!glyph) return <SkinFrame skin={skin} sticker={sticker} size={size} />;
    let body: React.ReactNode;
    switch (skin) {
        case "flagship":
            body = (
                <>
                    <g transform="translate(19 -2) scale(.97)">
                        <GlyphLayers skin={skin} glyph={glyph} uid={uid} />
                    </g>
                    <FlagshipCaption label={sticker.label} uid={uid} />
                </>
            );
            break;
        case "badbeat":
            body = (
                <>
                    <g transform="translate(20 -3) scale(.94)">
                        <GlyphLayers skin={skin} glyph={glyph} uid={uid} />
                    </g>
                    <Chyron label={sticker.label} tone={bbTone(sticker)} />
                </>
            );
            break;
        case "maison":
            body = (
                <>
                    <g transform="translate(22 -4) scale(.88)">
                        <GlyphLayers skin={skin} glyph={glyph} uid={uid} />
                    </g>
                    <MaisonCaption label={sticker.label} french={MAISON_FRENCH[sticker.id]} uid={uid} />
                </>
            );
            break;
        case "chipchair": {
            const tile = ccTile(sticker);
            body = (
                <ComicTile fill={tile} tilt={tiltOf(sticker.id)}>
                    <g transform="translate(25 8) scale(.78)">
                        <GlyphLayers skin={skin} glyph={glyph} uid={uid} tint={tile === CC.yellow ? CC.pink : CC.yellow} />
                    </g>
                    <ComicCaption label={sticker.label} />
                </ComicTile>
            );
            break;
        }
    }
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sticker.label} overflow="visible">
            <StickerDefs skin={skin} uid={uid} />
            {body}
        </svg>
    );
};

/**
 * Any other sticker (movie caricatures, rage faces, memes) in a table skin: its
 * own drawing stays, fading out at the bottom as in the frameless styles, and
 * the skin supplies the caption — and, for Chip and a Chair, the tile.
 */
export const SkinFrame: React.FC<{ skin: TableSkin; sticker?: StickerDef; label?: string; size?: number; children?: React.ReactNode }> = ({ skin, sticker, label, size = 76, children }) => {
    const text = label ?? sticker?.label ?? "";
    const uid = uidOf(`${skin}-f-${React.useId()}`);
    const fade = (
        <>
            <linearGradient id={`fm${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="76">
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={140} height={100}>
                <rect x={-20} y={-20} width={140} height={100} fill={`url(#fm${uid})`} />
            </mask>
            <filter id={`d${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor={skin === "flagship" ? FL.vi : "#000"} floodOpacity={skin === "flagship" ? 0.8 : 0.4} />
            </filter>
        </>
    );
    // The drawing hides its own background panel (".b52-bg") like the frameless styles.
    const art = (
        <g filter={`url(#d${uid})`}>
            <g mask={`url(#m${uid})`}>{children}</g>
        </g>
    );
    let body: React.ReactNode;
    switch (skin) {
        case "flagship":
            body = (
                <>
                    {art}
                    <FlagshipCaption label={text} uid={uid} />
                </>
            );
            break;
        case "badbeat":
            body = (
                <>
                    {art}
                    <Chyron label={text} tone={sticker ? bbTone(sticker) : "red"} />
                </>
            );
            break;
        case "maison":
            body = (
                <>
                    {art}
                    <MaisonCaption label={text} uid={uid} />
                </>
            );
            break;
        case "chipchair":
            body = (
                <ComicTile fill={sticker ? ccTile(sticker) : CC.white} tilt={tiltOf(sticker?.id ?? text)} clipId={`k${uid}`}>
                    <g clipPath={`url(#k${uid})`}>
                        <g transform="translate(9 3) scale(.82)">
                            <g mask={`url(#m${uid})`}>{children}</g>
                        </g>
                    </g>
                    <ComicCaption label={text} />
                </ComicTile>
            );
            break;
    }
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={text} overflow="visible">
            <StickerDefs skin={skin} uid={uid} />
            <defs>
                <style>{".b52-bg{display:none}"}</style>
                {fade}
            </defs>
            {body}
        </svg>
    );
};

export default SkinSticker;
