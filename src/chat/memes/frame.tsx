import React from "react";

/**
 * Sticker frames for the meme styles (block52-chat#2): the drawing on top, the
 * phrase underneath. Wojak and rage comics sit on a plain white card with bold
 * black type (how those memes look); rubber hose sits on an aged cream card with
 * a dark vignette and the phrase on a black title banner.
 */
export type MemeStyle = "wojak" | "rage" | "hose";

const SANS = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const HOSE_FONT = "'Cooper Black', 'Rockwell Extra Bold', Rockwell, Georgia, serif";

export function splitCaption(label: string): string[] {
    if (label.length <= 15 || !label.includes(" ")) return [label];
    const mid = label.length / 2;
    let best = -1;
    for (let i = 0; i < label.length; i++) if (label[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return [label.slice(0, best), label.slice(best + 1)];
}

export const MemeFrame: React.FC<{ style: MemeStyle; label: string; size?: number; children: React.ReactNode }> = ({ style, label, size = 76, children }) => {
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const lines = splitCaption(style === "hose" ? label.toUpperCase() : label);
    const one = lines.length === 1;
    const fs = one ? (lines[0].length > 12 ? 10.5 : 12.5) : 9.6;
    const hoseFs = one ? fs : 8.6;
    const fit = (line: string) =>
        style === "hose"
            ? line.length * hoseFs * 0.74 > 86
                ? { textLength: 86, lengthAdjust: "spacingAndGlyphs" as const }
                : {}
            : line.length * fs * 0.6 > 92
              ? { textLength: 92, lengthAdjust: "spacingAndGlyphs" as const }
              : {};
    const hose = style === "hose";
    // No box, frame or background: just the character and its props pop up,
    // fading out where the body runs off the bottom, with the caption floating
    // underneath as outlined lettering that reads on any table colour.
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label} overflow="visible">
            <defs>
                <style>{".b52-bg{display:none}"}</style>
                <linearGradient id={`f${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="80">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={140} height={100}>
                    <rect x={-20} y={-20} width={140} height={100} fill={`url(#f${uid})`} />
                </mask>
                <filter id={`s${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor="#000" floodOpacity="0.45" />
                </filter>
            </defs>
            <g filter={`url(#s${uid})`}>
                <g mask={`url(#m${uid})`}>{children}</g>
            </g>
            {lines.map((l, i) => (
                <text
                    key={i}
                    x={50}
                    y={one ? 88.5 : 83 + i * 9.8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily={hose ? HOSE_FONT : SANS}
                    fontWeight={900}
                    fontSize={hose ? hoseFs : fs}
                    fill="#fff"
                    stroke="#111"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    {...fit(l)}
                >
                    {l}
                </text>
            ))}
        </svg>
    );
};

/** Flat poker chips, used by all three styles. */
export const ChipPile: React.FC<{ x: number; y: number; k?: number; line?: number; cols?: string[] }> = ({ x, y, k = 1, line = 1.2, cols = ["#d23c32", "#2f6fc0", "#2e9a4e", "#e3a92b", "#7b4bb5"] }) => {
    const stacks: [number, number, number][] = [
        [-14, 0, 4], [-5, 2, 6], [5, 1, 5], [14, 0, 3], [-9, 6, 3], [1, 7, 4], [10, 6, 2]
    ];
    return (
        <g transform={`translate(${x} ${y}) scale(${k})`} stroke="#141414" strokeWidth={line}>
            {stacks.map(([sx, sy, n], si) =>
                Array.from({ length: n }, (_, i) => (
                    <g key={`${si}-${i}`}>
                        <rect x={sx - 4.5} y={sy - i * 2.4 - 1.6} width={9} height={2.4} fill={cols[(si + i) % cols.length]} />
                        <ellipse cx={sx} cy={sy - i * 2.4 - 1.6} rx={4.5} ry={1.6} fill={cols[(si + i) % cols.length]} />
                    </g>
                ))
            )}
        </g>
    );
};

/** Cartoon flames (outlined), base at (x, y). */
export const Flame: React.FC<{ x: number; y: number; k?: number; line?: number; outer?: string; inner?: string }> = ({ x, y, k = 1, line = 1.4, outer = "#f08a24", inner = "#ffd23f" }) => (
    <g transform={`translate(${x} ${y}) scale(${k})`} stroke="#141414" strokeWidth={line} strokeLinejoin="round">
        <path d="M0 0 C-9 0 -11 -9 -7 -15 C-6 -11 -3 -11 -3 -14 C-4 -20 0 -24 2 -28 C3 -22 9 -19 9 -11 C11 -13 11 -15 10 -17 C14 -12 13 0 0 0z" fill={outer} />
        <path d="M0 0 C-4 0 -5 -5 -3 -8 C-2 -6 0 -6 0 -9 C2 -7 5 -5 4 -2 C3 0 1 0 0 0z" fill={inner} strokeWidth={line * 0.7} />
    </g>
);
