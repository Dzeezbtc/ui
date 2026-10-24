import React from "react";

/**
 * The Block52 "Chip Crew" art style (block52-chat#2): flat cartoon shapes with
 * a thick ink outline, one fixed palette, and white cartoon gloves for hands.
 * Every sticker, throwable and emote is drawn from these pieces on a 64×64
 * grid, so the whole set looks like one family. No system emoji anywhere.
 */
export const C = {
    ink: "#1b1029",
    white: "#ffffff",
    cream: "#fff3d6",
    gold: "#ffc83d",
    orange: "#ff8a3d",
    red: "#ff4d5e",
    pink: "#ff7ab6",
    green: "#33d17a",
    teal: "#2ec4b6",
    sky: "#5cc8ff",
    blue: "#3d7bff",
    purple: "#8b5cf6",
    brown: "#b5713a",
    tan: "#e8b778",
    grey: "#c9c3d6",
    slate: "#6b6385"
} as const;

export const STROKE = 3;
export const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Wraps art so every child gets the ink outline by default. */
export const Ink: React.FC<{ children: React.ReactNode; width?: number }> = ({ children, width = STROKE }) => (
    <g stroke={C.ink} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round">
        {children}
    </g>
);

/** The house shine: a short white stroke in the top-left of a shape. */
export const Shine: React.FC<{ d: string }> = ({ d }) => <path d={d} fill="none" stroke={C.white} strokeWidth={2.4} strokeOpacity={0.85} />;

/** Ink text with the house font (outlined shapes stay crisp at sticker size). */
export const Label: React.FC<{ x: number; y: number; size: number; fill?: string; children: React.ReactNode; outline?: boolean }> = ({ x, y, size, fill = C.ink, children, outline }) => (
    <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={900}
        fontFamily={FONT}
        fill={fill}
        stroke={outline ? C.ink : "none"}
        strokeWidth={outline ? 2.2 : 0}
        paintOrder="stroke"
    >
        {children}
    </text>
);

/** A white cartoon glove, fingers up, centred at (x, y). */
export const Glove: React.FC<{ x: number; y: number; rot?: number; scale?: number; fill?: string }> = ({ x, y, rot = 0, scale = 1, fill = C.white }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <rect x={-7.5} y={-11} width={15} height={18} rx={7} fill={fill} />
        <ellipse cx={-8} cy={0} rx={3.2} ry={5} transform="rotate(-25 -8 0)" fill={fill} />
        <rect x={-6.5} y={6} width={13} height={5.5} rx={2} fill={fill} />
        <path d="M-2.5 -10 v6 M2 -10.5 v6.5" fill="none" strokeWidth={1.6} />
    </g>
);

/** A glove pointing one (or two) fingers up. */
export const PointGlove: React.FC<{ x: number; y: number; rot?: number; fingers?: 1 | 2 }> = ({ x, y, rot = 0, fingers = 1 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {fingers === 2 && <rect x={1} y={-24} width={6.5} height={18} rx={3.2} fill={C.white} transform="rotate(14 4 -6)" />}
        <rect x={-6} y={-25} width={6.5} height={19} rx={3.2} fill={C.white} transform={fingers === 2 ? "rotate(-10 -3 -6)" : undefined} />
        <rect x={-8} y={-9} width={17} height={15} rx={6} fill={C.white} />
        <rect x={-6.5} y={5} width={13} height={5.5} rx={2} fill={C.white} />
    </g>
);

/** A glove with the thumb up (rot 180 for down). */
export const ThumbGlove: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <rect x={-7} y={-22} width={7} height={16} rx={3.5} fill={C.white} />
        <rect x={-9} y={-9} width={19} height={16} rx={6} fill={C.white} />
        <path d="M1 -4 h8 M1 1 h8" fill="none" strokeWidth={1.6} />
        <rect x={-12} y={-7} width={5} height={13} rx={2} fill={C.white} />
    </g>
);

export type SuitId = "s" | "h" | "d" | "c";
export const SUIT_FILL: Record<SuitId, string> = { s: C.ink, c: C.ink, h: C.red, d: C.red };

/** A suit pip centred at (x, y), about 10 units tall at scale 1. */
export const Suit: React.FC<{ suit: SuitId; x: number; y: number; scale?: number }> = ({ suit, x, y, scale = 1 }) => {
    const fill = SUIT_FILL[suit];
    const t = `translate(${x} ${y}) scale(${scale})`;
    if (suit === "h") return <path transform={t} d="M0 4.5 C-7 -1 -5 -7 0 -3.2 C5 -7 7 -1 0 4.5z" fill={fill} strokeWidth={1.2} />;
    if (suit === "d") return <path transform={t} d="M0 -5.5 L4.5 0 L0 5.5 L-4.5 0z" fill={fill} strokeWidth={1.2} />;
    if (suit === "s")
        return <path transform={t} d="M0 -5.5 C-7 0 -5.5 4.5 -1 2.2 L-2.4 5.5 H2.4 L1 2.2 C5.5 4.5 7 0 0 -5.5z" fill={fill} strokeWidth={1.2} />;
    return (
        <g transform={t} fill={fill} strokeWidth={1.2}>
            <circle cx={0} cy={-2.8} r={2.6} />
            <circle cx={-2.8} cy={1.2} r={2.6} />
            <circle cx={2.8} cy={1.2} r={2.6} />
            <path d="M-1.3 2 L-2.4 5.5 H2.4 L1.3 2z" />
        </g>
    );
};

/** A playing card, 20×28, centred at (x, y). */
export const Card: React.FC<{ x: number; y: number; rank: string; suit: SuitId; rot?: number }> = ({ x, y, rank, suit, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <rect x={-10} y={-14} width={20} height={28} rx={3} fill={C.white} />
        <Label x={rank.length > 1 ? -2.5 : -4.5} y={-7.5} size={rank.length > 1 ? 7.5 : 9} fill={SUIT_FILL[suit]}>
            {rank}
        </Label>
        <Suit suit={suit} x={1} y={5} scale={1.05} />
    </g>
);

/** Little sparkle star at (x, y). */
export const Sparkle: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = C.gold }) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -5 Q1 -1 5 0 Q1 1 0 5 Q-1 1 -5 0 Q-1 -1 0 -5z" fill={fill} strokeWidth={1.4} />
);

/** Motion / emphasis lines. */
export const Lines: React.FC<{ d: string }> = ({ d }) => <path d={d} fill="none" strokeWidth={2.4} />;
