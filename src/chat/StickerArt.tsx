import React from "react";
import type { StickerDef } from "./stickers";

const FONT = "system-ui, -apple-system, Segoe UI, sans-serif";

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
 * Draws a quick-chat sticker (block52-chat#2): designer artwork when the
 * manifest has it, otherwise a Block52 badge — a glossy gradient disc with the
 * glyph and the phrase on a ribbon.
 */
export const StickerArt: React.FC<{ sticker: StickerDef; size?: number }> = ({ sticker, size = 64 }) => {
    if (sticker.art) {
        return <img src={sticker.art} alt={sticker.label} width={size} height={size} draggable={false} />;
    }
    const gid = `b52s-${sticker.id}`;
    const lines = ribbonLines(sticker.label.toUpperCase());
    const fontSize = lines[0].length > 10 ? 10.5 : 12;
    // A single line that's still too wide is squeezed to fit the ribbon.
    const fit = lines.length === 1 && lines[0].length > 13 ? { textLength: 82, lengthAdjust: "spacingAndGlyphs" as const } : {};
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sticker.label}>
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={sticker.from} />
                    <stop offset="1" stopColor={sticker.to} />
                </linearGradient>
            </defs>
            <circle cx="50" cy="44" r="40" fill={`url(#${gid})`} stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
            <ellipse cx="50" cy="24" rx="26" ry="11" fill="rgba(255,255,255,0.22)" />
            <text x="50" y="48" textAnchor="middle" dominantBaseline="central" fontSize="38">
                {sticker.emoji}
            </text>
            {lines.length === 1 ? (
                <>
                    <rect x="6" y="73" width="88" height="22" rx="11" fill="#0b1220" stroke={sticker.from} strokeWidth="2.5" />
                    <text x="50" y="84.5" textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight="800" fontFamily={FONT} fill="#fff" letterSpacing="0.3" {...fit}>
                        {lines[0]}
                    </text>
                </>
            ) : (
                <>
                    <rect x="3" y="66" width="94" height="31" rx="10" fill="#0b1220" stroke={sticker.from} strokeWidth="2.5" />
                    {lines.map((line, i) => (
                        <text key={i} x="50" y={i === 0 ? 75.5 : 87.5} textAnchor="middle" dominantBaseline="central" fontSize="9.6" fontWeight="800" fontFamily={FONT} fill="#fff" letterSpacing="0.2" {...(line.length > 15 ? { textLength: 86, lengthAdjust: "spacingAndGlyphs" } : {})}>
                            {line}
                        </text>
                    ))}
                </>
            )}
        </svg>
    );
};

export default StickerArt;
