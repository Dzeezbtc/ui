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
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label}>
            <defs>
                <clipPath id={`c${uid}`}>
                    <rect x={2} y={2} width={96} height={hose ? 74 : 76} rx={3} />
                </clipPath>
                {hose && (
                    <radialGradient id={`v${uid}`} cx="50%" cy="45%" r="70%">
                        <stop offset="0.55" stopColor="#f1e4c3" />
                        <stop offset="1" stopColor="#c7ac7c" />
                    </radialGradient>
                )}
            </defs>
            <rect x={0.8} y={0.8} width={98.4} height={98.4} rx={5} fill={hose ? "#f1e4c3" : "#ffffff"} stroke="#1a1a1a" strokeWidth={1.4} />
            <g clipPath={`url(#c${uid})`}>
                {hose && <rect x={0} y={0} width={100} height={80} fill={`url(#v${uid})`} />}
                {children}
            </g>
            {hose ? (
                <>
                    <path d="M3 79 h94 l-3 9.5 l3 9.5 h-94 l3 -9.5z" fill="#141414" />
                    {lines.map((l, i) => (
                        <text key={i} x={50} y={one ? 88.5 : 84 + i * 9.4} textAnchor="middle" dominantBaseline="central" fontFamily={HOSE_FONT} fontWeight={900} fontSize={one ? fs : 8.6} fill="#f1e4c3" letterSpacing="0.4" {...fit(l)}>
                            {l}
                        </text>
                    ))}
                </>
            ) : (
                lines.map((l, i) => (
                    <text key={i} x={50} y={one ? 88.5 : 82.2 + i * 9.8} textAnchor="middle" dominantBaseline="central" fontFamily={SANS} fontWeight={900} fontSize={fs} fill="#111" {...fit(l)}>
                        {l}
                    </text>
                ))
            )}
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
