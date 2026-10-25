import React from "react";
import type { StickerDef } from "./stickers";
import { ArtLayers } from "./art/Art";
import { C, FONT } from "./art/ink";
import { useChatSettings } from "./chatSettings";
import MemeSticker from "./memes/MemeSticker";
import { MemeFrame } from "./memes/frame";
import { MOVIE_ART, MOVIE_SPEAKERS } from "./memes/movies";
import { RAGE_FACES } from "./memes/rageFaces";
import { LICENSED_ART } from "./licensedArt";
import { getChatBrand, TEXAS_HODL as TH, useChatBrand } from "./brand";
/**
 * Split a phrase for the ribbon: one line when short, otherwise two lines
 * broken at the space nearest the middle.
 */
export function ribbonLines(label: string): string[] {
    if (label.length <= 14 || !label.includes(" ")) return [label];
    const mid = label.length / 2;
    let best = -1;
    for (let i = 0; i < label.length; i++) {
        if (label[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    return [label.slice(0, best), label.slice(best + 1)];
}

/**
 * Draws a quick-chat sticker (block52-chat#2) in the Block52 Chip Crew style:
 * a die-cut sticker — white border, ink outline, the pack's colour roundel —
 * with our own art in the middle and the phrase on an ink banner. Designer
 * artwork (`art`) still replaces it when the manifest has some.
 */
export const StickerArt: React.FC<{ sticker: StickerDef; size?: number }> = ({ sticker: def, size = 64 }) => {
    useChatBrand();
    const { stickerStyle } = useChatSettings();
    // Licensed originals, once cleared, replace our drawing everywhere.
    const sticker = !def.art && LICENSED_ART[def.id] ? { ...def, art: LICENSED_ART[def.id] } : def;
    const movie = MOVIE_ART[sticker.id];
    // Movie references are always the movie characters, whatever the sticker style.
    if (movie && !sticker.art) {
        return (
            <MemeFrame style="wojak" variant="movies" label={`\u201c${sticker.label}\u201d`} size={size}>
                <title>{`${sticker.label} — ${MOVIE_SPEAKERS[sticker.id]}`}</title>
                {movie()}
            </MemeFrame>
        );
    }
    // Rage faces are always the classic rage-comic line art.
    const rage = RAGE_FACES[sticker.id];
    if (rage && !sticker.art) {
        return (
            <MemeFrame style="rage" label={sticker.label} size={size}>
                <title>{sticker.label}</title>
                {rage.draw()}
            </MemeFrame>
        );
    }
    if (stickerStyle !== "cartoon" && !sticker.art) return <MemeSticker sticker={sticker} style={stickerStyle} size={size} />;
    return <CartoonSticker sticker={sticker} size={size} />;
};

/** The Chip Crew cartoon sticker (the "Chip Crew" style option). */
export const CartoonSticker: React.FC<{ sticker: StickerDef; size?: number }> = ({ sticker, size = 64 }) => {
    useChatBrand();
    if (sticker.art) {
        return <img src={sticker.art} alt={sticker.label} width={size} height={size} draggable={false} />;
    }
    if (getChatBrand() === "texashodl") return <ChipTag sticker={sticker} size={size} />;
    const gid = `b52s-${sticker.id}`;
    const lines = ribbonLines(sticker.label.toUpperCase());
    const fontSize = lines[0].length > 10 ? 10.5 : 12;
    // A single line that's still too wide is squeezed to fit the banner.
    // Heavy caps run ~0.68em wide: anything that would overflow is squeezed to fit.
    const fitTo = (line: string, size: number, max: number) =>
        line.length * size * 0.68 > max ? { textLength: max, lengthAdjust: "spacingAndGlyphs" as const } : {};
    const fit = fitTo(lines[0], fontSize, 78);
    const text = { textAnchor: "middle" as const, dominantBaseline: "central" as const, fontWeight: 900, fontFamily: FONT, fill: C.white };
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sticker.label} overflow="visible">
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={sticker.from} />
                    <stop offset="1" stopColor={sticker.to} />
                </linearGradient>
            </defs>
            {/* die-cut: white border with an ink edge, then the pack roundel */}
            <circle cx="50" cy="41" r="39" fill={C.white} stroke={C.ink} strokeWidth="2.5" />
            <circle cx="50" cy="41" r="33.5" fill={`url(#${gid})`} stroke={C.ink} strokeWidth="2" />
            <path d="M24 26 a30 30 0 0 1 16 -14" fill="none" stroke={C.white} strokeOpacity="0.45" strokeWidth="3.5" strokeLinecap="round" />
            <g transform="translate(22.5 5) scale(0.86)">
                <ArtLayers spec={sticker.icon} />
            </g>
            {lines.length === 1 ? (
                <>
                    <rect x="5" y="71" width="90" height="24" rx="7" fill={C.white} stroke={C.ink} strokeWidth="2.5" transform="rotate(-3 50 83)" />
                    <rect x="8.5" y="74" width="83" height="18" rx="5" fill={C.ink} transform="rotate(-3 50 83)" />
                    <text x="50" y="83" fontSize={fontSize} letterSpacing="0.3" transform="rotate(-3 50 83)" {...text} {...fit}>
                        {lines[0]}
                    </text>
                </>
            ) : (
                <>
                    <rect x="2" y="64" width="96" height="34" rx="8" fill={C.white} stroke={C.ink} strokeWidth="2.5" transform="rotate(-3 50 81)" />
                    <rect x="5.5" y="67" width="89" height="28" rx="6" fill={C.ink} transform="rotate(-3 50 81)" />
                    {lines.map((line, i) => (
                        <text key={i} x="50" y={i === 0 ? 75 : 87} fontSize="9.6" letterSpacing="0.2" transform="rotate(-3 50 81)" {...text} {...fitTo(line, 9.6, 82)}>
                            {line}
                        </text>
                    ))}
                </>
            )}
        </svg>
    );
};

/**
 * Chip Crew in Texas Hodl's look: the art on a dark chamfered tag (their
 * button shape) with a gradient edge, a soft brand glow behind it, and the
 * phrase in their spaced Geist caps.
 */
const ChipTag: React.FC<{ sticker: StickerDef; size: number }> = ({ sticker, size }) => {
    const id = `th-${sticker.id}`;
    const lines = ribbonLines(sticker.label.toUpperCase());
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sticker.label} overflow="visible">
            <defs>
                <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={TH.orange} />
                    <stop offset="0.5" stopColor={TH.red} />
                    <stop offset="1" stopColor={TH.pink} />
                </linearGradient>
                <radialGradient id={`${id}r`} cx="50%" cy="40%" r="50%">
                    <stop offset="0" stopColor={TH.violet} stopOpacity="0.55" />
                    <stop offset="1" stopColor={TH.violet} stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d="M18 2 H90 L98 10 V66 L90 74 H10 L2 66 V18 Z" fill={TH.panel} stroke={`url(#${id}g)`} strokeWidth="1.6" />
            <circle cx="50" cy="38" r="32" fill={`url(#${id}r)`} />
            <path d="M2 18 L18 2" stroke={TH.pink} strokeWidth="2.4" />
            <g transform="translate(22 8) scale(0.88)">
                <ArtLayers spec={sticker.icon} />
            </g>
            {lines.map((l, i) => (
                <text key={i} x="50" y={lines.length === 1 ? 86 : 83 + i * 9} textAnchor="middle" dominantBaseline="central" fontFamily={TH.font} fontWeight={700} fontSize={lines.length === 1 ? 7.6 : 7} letterSpacing="0.9" fill="#fff" {...(l.length * 5.4 > 92 ? { textLength: 92, lengthAdjust: "spacingAndGlyphs" as const } : {})}>
                    {l}
                </text>
            ))}
        </svg>
    );
};

export default StickerArt;
