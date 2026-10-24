import React from "react";
import type { StickerDef } from "./stickers";

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
            <rect x="6" y="73" width="88" height="22" rx="11" fill="#0b1220" stroke={sticker.from} strokeWidth="2.5" />
            <text
                x="50"
                y="84.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={sticker.label.length > 10 ? 10.5 : 12}
                fontWeight="800"
                fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
                fill="#fff"
                letterSpacing="0.3"
            >
                {sticker.label.toUpperCase()}
            </text>
        </svg>
    );
};

export default StickerArt;
