import React from "react";
import { getChatBrand, TEXAS_HODL as TH } from "../brand";

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

/** Which Texas Hodl treatment a sticker gets: each drawing style has its own. */
export type ThVariant = "movies" | "wojak" | "rage" | "hose" | "sticks";

export const MemeFrame: React.FC<{ style: MemeStyle; label: string; size?: number; variant?: ThVariant; children: React.ReactNode }> = ({ style, label, size = 76, variant, children }) => {
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
    if (getChatBrand() === "texashodl")
        return (
            <ThFrame variant={variant ?? (style === "wojak" ? "movies" : style)} label={label} size={size} uid={uid} lines={lines}>
                {children}
            </ThFrame>
        );
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

/** A luminance → colour ramp (gradient map) as an SVG filter: dark → mid → light. */
const RampFilter: React.FC<{ id: string; dark: string; mid: string; light: string; steps?: number[] }> = ({ id, dark, mid, light, steps }) => {
    const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const [d, m, l] = [hex(dark), hex(mid), hex(light)];
    const table = (c: number) => (steps ? steps.map(k => [d, m, l][k][c]) : [d[c], m[c], l[c]]).map(v => v.toFixed(3)).join(" ");
    const type = steps ? "discrete" : "table";
    return (
        <filter id={id} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
            <feComponentTransfer>
                <feFuncR type={type} tableValues={table(0)} />
                <feFuncG type={type} tableValues={table(1)} />
                <feFuncB type={type} tableValues={table(2)} />
            </feComponentTransfer>
        </filter>
    );
};

const Glow: React.FC<{ id: string; r: number; strength?: number }> = ({ id, r, strength = 1 }) => (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation={r} result="b" />
        <feComponentTransfer in="b" result="bb">
            <feFuncA type="linear" slope={strength} />
        </feComponentTransfer>
        <feMerge>
            <feMergeNode in="bb" />
            <feMergeNode in="SourceGraphic" />
        </feMerge>
    </filter>
);

/**
 * Texas Hodl's look (texashodl.net): dark, neon orange → pink → violet, Geist
 * caps, chamfered corners. Each drawing style gets its own take so the set
 * isn't one filter on everything:
 *  - movies: the figure tinted deep violet, a gradient neon outline over it
 *  - wojak:  a hologram — cyan/violet ramp with scanlines and a thin pink edge
 *  - rage:   a neon tube sign — lines only, hot orange/pink glow, outlined caption
 *  - hose:   a duotone print — violet shadows to orange highlights, heavy caption
 *  - sticks: flat brand colours (posterised: ink, violet shirts, orange faces), white lines,
 *            caption on a chamfered gradient tag like their buttons
 */
const ThFrame: React.FC<{ variant: ThVariant; label: string; size: number; uid: string; lines: string[]; children: React.ReactNode }> = ({ variant, label, size, uid, lines, children }) => {
    const one = lines.length === 1;
    const g = `url(#g${uid})`;
    const outline = (cls: string, stroke: string, width?: number) =>
        `.${cls}${uid} *{fill:none!important;stroke:${stroke}!important;${width ? `stroke-width:${width}px!important;` : ""}} .${cls}${uid} text{display:none}`;
    let css = ".b52-bg{display:none}";
    let art: React.ReactNode;
    let defs: React.ReactNode = null;
    switch (variant) {
        case "wojak":
            css += outline("o", TH.pink, 0.9);
            defs = (
                <>
                    <RampFilter id={`r${uid}`} dark="#0b0830" mid="#4a3fd8" light="#9ff3ff" />
                    <pattern id={`p${uid}`} width="3" height="3" patternUnits="userSpaceOnUse">
                        <rect width="3" height="1.1" fill="#030305" opacity="0.55" />
                    </pattern>
                    <mask id={`k${uid}`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={140} height={100}>
                        <g filter={`url(#w${uid})`}>{children}</g>
                    </mask>
                    <filter id={`w${uid}`} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
                    </filter>
                    <Glow id={`e${uid}`} r={1.4} strength={1.4} />
                </>
            );
            art = (
                <>
                    <g filter={`url(#r${uid})`} opacity={0.92}>{children}</g>
                    <rect x={-20} y={-20} width={140} height={100} fill={`url(#p${uid})`} mask={`url(#k${uid})`} />
                    <g className={`o${uid}`} filter={`url(#e${uid})`} opacity={0.85}>{children}</g>
                </>
            );
            break;
        case "rage":
            css += outline("o", g, 1.5) + outline("q", TH.ink);
            defs = <Glow id={`e${uid}`} r={2.2} strength={2} />;
            art = (
                <>
                    <g opacity={0.9} style={{ fill: TH.ink }}>
                        <g className={`f${uid}`}>{children}</g>
                    </g>
                    <g className={`o${uid}`} filter={`url(#e${uid})`}>{children}</g>
                </>
            );
            css += ` .f${uid} *{fill:${TH.panel}!important;stroke:none!important} .f${uid} text{display:none}`;
            break;
        case "hose":
            defs = <RampFilter id={`r${uid}`} dark="#1a0b3a" mid={TH.pink} light="#ffb35c" />;
            art = <g filter={`url(#r${uid})`}>{children}</g>;
            break;
        case "sticks":
            css += outline("o", "#ffffff", 1.1);
            defs = <RampFilter id={`r${uid}`} dark={TH.ink} mid={TH.violet} light={TH.orange} steps={[0, 0, 1, 1, 2, 2]} />;
            art = (
                <>
                    <g filter={`url(#r${uid})`}>{children}</g>
                    <g className={`o${uid}`} opacity={0.9}>{children}</g>
                </>
            );
            break;
        default:
            css += outline("o", g);
            defs = (
                <>
                    <RampFilter id={`r${uid}`} dark="#07051a" mid="#3b2470" light="#c9b8ff" />
                    <Glow id={`e${uid}`} r={1.6} />
                </>
            );
            art = (
                <>
                    <g filter={`url(#r${uid})`}>{children}</g>
                    <g className={`o${uid}`} filter={`url(#e${uid})`}>{children}</g>
                </>
            );
    }
    const fitW = (l: string, per: number, max = 88) => (l.length * per > max ? { textLength: max, lengthAdjust: "spacingAndGlyphs" as const } : {});
    const caption = lines.map((l, i) => {
        const y = one ? 88.5 : 84 + i * 9;
        const L = l.toUpperCase();
        if (variant === "rage")
            return (
                <text key={i} x={50} y={y} textAnchor="middle" dominantBaseline="central" fontFamily={TH.font} fontWeight={900} fontSize={one ? 10 : 8.4} letterSpacing="-0.3" fill="none" stroke="#fff" strokeWidth={0.7} {...fitW(L, one ? 7.6 : 6.4)}>
                    {L}
                </text>
            );
        if (variant === "hose")
            return (
                <text key={i} x={50} y={y} textAnchor="middle" dominantBaseline="central" fontFamily={TH.font} fontWeight={900} fontSize={one ? 11 : 8.8} letterSpacing="-0.4" fill={g} {...fitW(L, one ? 8 : 6.6)}>
                    {L}
                </text>
            );
        if (variant === "sticks") return null;
        return (
            <g key={i}>
                {i === 0 && <path d={`M${Math.max(2, 50 - Math.min(44, L.length * 2.7) - 8)} ${y} h5`} stroke={variant === "wojak" ? "#9ff3ff" : TH.pink} strokeWidth={1} />}
                <text x={50} y={y} textAnchor="middle" dominantBaseline="central" fontFamily={TH.font} fontWeight={700} fontSize={one ? 7.4 : 6.8} letterSpacing="0.9" fill="#fff" {...fitW(L, 5.3)}>
                    {L}
                </text>
            </g>
        );
    });
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label} overflow="visible">
            <defs>
                <style>{css}</style>
                <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="80">
                    <stop offset="0" stopColor={TH.orange} />
                    <stop offset="0.5" stopColor={TH.red} />
                    <stop offset="1" stopColor={TH.pink} />
                </linearGradient>
                <linearGradient id={`f${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="62" x2="0" y2="80">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={140} height={100}>
                    <rect x={-20} y={-20} width={140} height={100} fill={`url(#f${uid})`} />
                </mask>
                {defs}
            </defs>
            <g mask={`url(#m${uid})`}>{art}</g>
            {variant === "sticks" && (
                <g>
                    <path d={`M${one ? 12 : 4} ${one ? 81 : 77} H${one ? 88 : 96} V${one ? 92 : 95} l-4 4 H${one ? 12 : 4} V${one ? 85 : 81}z`} fill={g} />
                    {lines.map((l, i) => (
                        <text key={i} x={50} y={one ? 87.5 : 82.5 + i * 8.4} textAnchor="middle" dominantBaseline="central" fontFamily={TH.font} fontWeight={800} fontSize={one ? 7.6 : 6.8} letterSpacing="0.5" fill={TH.ink} {...fitW(l.toUpperCase(), 5.4, one ? 70 : 86)}>
                            {l.toUpperCase()}
                        </text>
                    ))}
                </g>
            )}
            {caption}
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
