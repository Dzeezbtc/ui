import React from "react";
import { C, Card, Glove, Label, Lines, PointGlove, Shine, Sparkle, Suit, ThumbGlove } from "./ink";
import { ChipBody } from "./chippy";

/**
 * Props (block52-chat#2): every object in the Chip Crew set, drawn on the 64
 * grid inside an <Ink> wrapper (so the outline is inherited). Overlay props
 * (`*-top`, `*-sides`) are made to sit around Chippy without covering the face.
 */
type Draw = () => React.ReactElement;

const Drop: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = C.sky }) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -5 q-4 5.5 -4 8 a4 4 0 0 0 8 0 q0 -2.5 -4 -8z" fill={fill} strokeWidth={1.8} />
);

const Bill: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <rect x={-16} y={-9} width={32} height={18} rx={2.5} fill={C.green} />
        <ellipse cx={0} cy={0} rx={6} ry={6} fill="#bdf5d2" strokeWidth={1.8} />
        <Label x={0} y={0.4} size={9} fill={C.ink}>$</Label>
    </g>
);

const Flame: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0 -26 C8 -14 18 -10 16 6 C15 18 8 24 0 24 C-8 24 -15 18 -16 8 C-17 -2 -10 -6 -8 -14 C-4 -8 -2 -10 0 -26z" fill={C.orange} />
        <path d="M0 -4 C4 2 8 6 7 13 C6 19 3 21 0 21 C-3 21 -6 19 -7 14 C-7 8 -2 5 0 -4z" fill={C.gold} strokeWidth={2.2} />
    </g>
);

const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = C.grey }) => (
    <path
        transform={`translate(${x} ${y}) scale(${s})`}
        d="M-16 6 a7 7 0 0 1 3 -12 a10 10 0 0 1 18 -3 a8 8 0 0 1 11 9 a6 6 0 0 1 -2 12 h-26 a5 5 0 0 1 -4 -6z"
        fill={fill}
    />
);

const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 14 }) => (
    <g>
        <circle cx={x} cy={y} r={r} fill={C.gold} />
        <circle cx={x} cy={y} r={r * 0.7} fill="none" strokeWidth={1.8} />
        <Label x={x} y={y + 0.5} size={r * 0.8} fill={C.ink}>52</Label>
        <Shine d={`M${x - r * 0.6} ${y - r * 0.3} a${r * 0.7} ${r * 0.7} 0 0 1 ${r * 0.4} -${r * 0.4}`} />
    </g>
);

const Fish: React.FC<{ x: number; y: number; s?: number; rot?: number; fill?: string }> = ({ x, y, s = 1, rot = 0, fill = C.orange }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        <path d="M14 0 l10 -8 v16z" fill={fill} />
        <path d="M-18 0 q10 -14 32 0 q-22 14 -32 0z" fill={fill} />
        <circle cx={-9} cy={-2} r={2.2} fill={C.ink} stroke="none" />
        <path d="M-2 -6 q3 6 0 12" fill="none" strokeWidth={1.8} />
    </g>
);

const Star: React.FC<{ x: number; y: number; r?: number; fill?: string }> = ({ x, y, r = 18, fill = C.gold }) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rr = i % 2 === 0 ? r : r * 0.45;
        return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    return <polygon points={pts} fill={fill} />;
};

const Burst: React.FC<{ x: number; y: number; r?: number; fill?: string; spikes?: number }> = ({ x, y, r = 26, fill = C.gold, spikes = 12 }) => {
    const pts = Array.from({ length: spikes * 2 }, (_, i) => {
        const a = (Math.PI / spikes) * i;
        const rr = i % 2 === 0 ? r : r * 0.72;
        return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    return <polygon points={pts} fill={fill} />;
};

const Heart: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = C.red }) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 14 C-22 -2 -14 -20 0 -9 C14 -20 22 -2 0 14z" fill={fill} />
);

export const PROPS: Record<string, Draw> = {
    // ── hands ────────────────────────────────────────────────
    clap: () => (
        <>
            <Glove x={24} y={36} rot={-22} scale={1.25} />
            <Glove x={40} y={36} rot={22} scale={1.25} />
            <Lines d="M14 18 l-4 -4 M32 12 v-6 M50 18 l4 -4" />
        </>
    ),
    handshake: () => (
        <>
            <Glove x={22} y={36} rot={75} scale={1.3} />
            <Glove x={42} y={36} rot={-75} scale={1.3} fill={C.gold} />
            <Sparkle x={32} y={14} s={1.2} />
        </>
    ),
    pray: () => (
        <>
            <Glove x={28} y={38} rot={14} scale={1.35} />
            <Glove x={36} y={38} rot={-14} scale={1.35} />
            <Lines d="M14 22 l-4 -3 M50 22 l4 -3 M32 10 v-5" />
        </>
    ),
    "hands-up": () => (
        <>
            <Glove x={18} y={32} rot={-25} scale={1.3} />
            <Glove x={46} y={32} rot={25} scale={1.3} />
            <Sparkle x={32} y={18} s={1.5} />
            <Sparkle x={32} y={44} s={0.9} fill={C.pink} />
        </>
    ),
    "thumbs-up": () => <ThumbGlove x={32} y={38} />,
    "thumbs-down": () => <ThumbGlove x={32} y={30} rot={180} />,
    "finger-one": () => (
        <>
            <PointGlove x={32} y={46} />
            <Sparkle x={46} y={16} s={1.1} />
        </>
    ),
    "finger-two": () => (
        <>
            <PointGlove x={32} y={46} fingers={2} />
            <Sparkle x={48} y={16} s={1.1} />
        </>
    ),
    "fingers-crossed": () => (
        <g transform="translate(32 46)">
            <rect x={-5} y={-27} width={6.5} height={20} rx={3.2} fill={C.white} transform="rotate(16 -2 -8)" />
            <rect x={-2} y={-27} width={6.5} height={20} rx={3.2} fill={C.white} transform="rotate(-18 1 -8)" />
            <rect x={-8} y={-10} width={17} height={15} rx={6} fill={C.white} />
            <rect x={-6.5} y={4} width={13} height={5.5} rx={2} fill={C.white} />
        </g>
    ),
    muscle: () => (
        <>
            <path d="M8 50 q2 -14 14 -16 q-2 -10 6 -16 q8 -2 10 6 q8 -2 14 6 q6 14 -8 22 h-30 q-6 0 -6 -2z" fill={C.purple} />
            <Glove x={30} y={14} rot={10} scale={1.05} />
            <Shine d="M28 30 q8 -6 16 0" />
        </>
    ),
    "boxing-glove": () => (
        <>
            <path d="M18 30 q0 -18 18 -18 q14 0 14 16 q0 14 -12 18 h-14 q-6 -2 -6 -16z" fill={C.red} />
            <path d="M18 34 q-6 -2 -6 -9 q2 -6 8 -4" fill={C.red} />
            <rect x={20} y={44} width={20} height={10} rx={2} fill={C.white} />
            <Shine d="M26 18 q6 -3 12 0" />
            <Lines d="M54 20 l5 -3 M56 30 h6" />
        </>
    ),
    gauntlet: () => (
        <>
            <rect x={16} y={18} width={30} height={26} rx={10} fill={C.gold} />
            <rect x={18} y={42} width={26} height={14} rx={3} fill={C.gold} />
            {[[22, 24, C.purple], [29, 22, C.blue], [36, 22, C.red], [43, 25, C.green], [30, 34, C.orange]].map(([x, y, f]) => (
                <circle key={`${x}${y}`} cx={x as number} cy={y as number} r={2.8} fill={f as string} strokeWidth={1.6} />
            ))}
            <Sparkle x={52} y={12} s={1.2} />
        </>
    ),

    // ── cards & chips ────────────────────────────────────────
    "cards-fan": () => (
        <>
            <Card x={21} y={36} rank="A" suit="s" rot={-18} />
            <Card x={32} y={33} rank="K" suit="h" />
            <Card x={43} y={36} rank="Q" suit="d" rot={18} />
        </>
    ),
    "cards-72": () => (
        <>
            <Card x={25} y={34} rank="7" suit="c" rot={-12} />
            <Card x={39} y={34} rank="2" suit="h" rot={12} />
        </>
    ),
    "cards-102": () => (
        <>
            <Card x={25} y={34} rank="10" suit="d" rot={-12} />
            <Card x={39} y={34} rank="2" suit="s" rot={12} />
        </>
    ),
    "cards-qj": () => (
        <>
            <Card x={25} y={34} rank="Q" suit="h" rot={-12} />
            <Card x={39} y={34} rank="J" suit="c" rot={12} />
        </>
    ),
    "joker-card": () => (
        <>
            <rect x={18} y={14} width={28} height={40} rx={4} fill={C.white} />
            <path d="M22 30 l4 -12 l6 8 l6 -8 l4 12z" fill={C.purple} strokeWidth={2} />
            <circle cx={26} cy={17} r={2} fill={C.gold} strokeWidth={1.4} />
            <circle cx={38} cy={17} r={2} fill={C.gold} strokeWidth={1.4} />
            <path d="M24 40 q8 8 16 -2" fill="none" strokeWidth={2.4} />
            <circle cx={28} cy={35} r={1.6} fill={C.ink} stroke="none" />
            <circle cx={36} cy={35} r={1.6} fill={C.ink} stroke="none" />
            <Label x={32} y={49} size={7} fill={C.red}>JOKER</Label>
        </>
    ),
    chip: () => (
        <>
            <ChipBody face={false} fill={C.red} cy={32} r={24} />
            <circle cx={32} cy={32} r={13} fill="none" stroke={C.red} strokeWidth={1.6} strokeDasharray="3 2.6" />
            <Label x={32} y={32.5} size={11} fill={C.red}>52</Label>
        </>
    ),
    "chip-stack": () => (
        <>
            {[48, 40, 32, 24].map((y, i) => (
                <g key={y}>
                    <ellipse cx={32} cy={y + 4} rx={16} ry={6} fill={[C.red, C.blue, C.green, C.purple][i]} />
                    <ellipse cx={32} cy={y} rx={16} ry={6} fill={[C.red, C.blue, C.green, C.purple][i]} />
                    <path d={`M20 ${y + 1} h4 M30 ${y + 6} h4 M40 ${y + 1} h4`} stroke={C.white} strokeWidth={2} />
                </g>
            ))}
        </>
    ),
    "dealer-button": () => (
        <>
            <ellipse cx={32} cy={38} rx={22} ry={8} fill={C.grey} />
            <ellipse cx={32} cy={33} rx={22} ry={8} fill={C.white} />
            <Label x={32} y={33} size={12} fill={C.ink}>D</Label>
            <Shine d="M16 30 q4 -3 10 -3" />
        </>
    ),
    coin: () => (
        <>
            <Coin x={32} y={34} r={18} />
            <Lines d="M10 20 q-4 8 0 16 M54 20 q4 8 0 16" />
        </>
    ),
    dice: () => (
        <>
            <rect x={10} y={22} width={24} height={24} rx={5} fill={C.white} transform="rotate(-12 22 34)" />
            <rect x={30} y={18} width={24} height={24} rx={5} fill={C.red} transform="rotate(14 42 30)" />
            {[[17, 30], [22, 35], [27, 40]].map(([x, y]) => (
                <circle key={x} cx={x} cy={y} r={2} fill={C.ink} stroke="none" transform="rotate(-12 22 34)" />
            ))}
            {[[37, 25], [47, 25], [37, 35], [47, 35]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r={2} fill={C.white} stroke="none" transform="rotate(14 42 30)" />
            ))}
        </>
    ),
    slot: () => (
        <>
            <rect x={10} y={14} width={38} height={40} rx={6} fill={C.red} />
            <rect x={14} y={24} width={30} height={16} rx={3} fill={C.white} />
            <Label x={29} y={32.5} size={11} fill={C.red}>777</Label>
            <path d="M48 36 h4 v-18" fill="none" strokeWidth={3} />
            <circle cx={52} cy={14} r={4} fill={C.gold} />
            <rect x={16} y={44} width={26} height={5} rx={2} fill={C.ink} stroke="none" />
            <Sparkle x={10} y={10} s={1} />
        </>
    ),

    // ── money ────────────────────────────────────────────────
    cash: () => (
        <>
            <Bill x={32} y={42} rot={-4} />
            <Bill x={32} y={34} rot={5} />
            <Bill x={32} y={26} rot={-3} />
            <rect x={27} y={17} width={10} height={20} fill={C.gold} strokeWidth={2} transform="rotate(-3 32 26)" />
        </>
    ),
    "money-bag": () => (
        <>
            <path d="M24 18 q-16 14 -12 28 q4 10 20 10 q16 0 20 -10 q4 -14 -12 -28z" fill={C.tan} />
            <path d="M22 18 h20 l-4 -8 q-6 4 -12 0z" fill={C.tan} />
            <path d="M23 18 q9 4 18 0" fill="none" strokeWidth={2.6} />
            <Label x={32} y={39} size={18} fill={C.green} outline>$</Label>
            <Shine d="M18 34 q2 -8 8 -12" />
        </>
    ),
    "money-wings": () => (
        <>
            <path d="M16 30 q-14 -10 -12 4 q4 8 14 4z" fill={C.white} />
            <path d="M48 30 q14 -10 12 4 q-4 8 -14 4z" fill={C.white} />
            <Bill x={32} y={34} rot={-8} />
            <Lines d="M20 52 l-3 4 M32 54 v5 M44 52 l3 4" />
        </>
    ),
    "chart-up": () => (
        <>
            <rect x={8} y={10} width={48} height={44} rx={5} fill={C.white} />
            <path d="M14 44 l10 -8 l8 6 l16 -20" fill="none" stroke={C.green} strokeWidth={4} />
            <path d="M42 20 h8 v8" fill="none" stroke={C.green} strokeWidth={4} />
        </>
    ),
    "chart-down": () => (
        <>
            <rect x={8} y={10} width={48} height={44} rx={5} fill={C.white} />
            <path d="M14 20 l10 8 l8 -4 l16 20" fill="none" stroke={C.red} strokeWidth={4} />
            <path d="M42 44 h8 v-8" fill="none" stroke={C.red} strokeWidth={4} />
        </>
    ),

    // ── weather & elements ───────────────────────────────────
    flame: () => <Flame x={32} y={32} />,
    "flames-sides": () => (
        <>
            <Flame x={8} y={44} s={0.45} />
            <Flame x={56} y={44} s={0.45} />
            <Flame x={50} y={18} s={0.3} />
        </>
    ),
    "rain-cloud-top": () => (
        <>
            <Cloud x={34} y={6} s={0.8} />
            <Drop x={22} y={18} s={0.6} />
            <Drop x={46} y={16} s={0.6} />
        </>
    ),
    "steam-top": () => (
        <g fill={C.white} strokeWidth={2}>
            <path d="M8 18 a4 4 0 0 1 4 -6 a5 5 0 0 1 8 2 a4 4 0 0 1 -2 7 h-8 a3 3 0 0 1 -2 -3z" />
            <path d="M42 14 a4 4 0 0 1 4 -6 a5 5 0 0 1 8 2 a4 4 0 0 1 -2 7 h-8 a3 3 0 0 1 -2 -3z" />
        </g>
    ),
    "question-top": () => (
        <>
            <Label x={50} y={12} size={14} fill={C.gold} outline>?</Label>
            <Label x={14} y={14} size={11} fill={C.sky} outline>?</Label>
        </>
    ),
    "stars-top": () => (
        <>
            <Sparkle x={14} y={12} s={1.2} />
            <Sparkle x={50} y={10} s={1.2} fill={C.pink} />
            <Sparkle x={32} y={6} s={0.8} fill={C.sky} />
        </>
    ),
    "shrug-sides": () => (
        <>
            <Glove x={7} y={32} rot={-70} scale={0.9} />
            <Glove x={57} y={32} rot={70} scale={0.9} />
        </>
    ),
    "salute-side": () => <Glove x={50} y={18} rot={60} scale={0.95} />,
    "facepalm": () => <Glove x={38} y={30} rot={-30} scale={1.05} />,
    "cash-top": () => (
        <>
            <Bill x={14} y={10} rot={-20} />
            <Bill x={50} y={8} rot={18} />
        </>
    ),
    bolt: () => (
        <>
            <path d="M36 4 l-20 32 h14 l-6 24 l24 -34 h-14 l8 -22z" fill={C.gold} />
            <Lines d="M10 14 l4 3 M54 46 l-4 -3" />
        </>
    ),
    wave: () => (
        <>
            <path d="M4 52 q4 -36 30 -40 q18 -2 24 14 q-12 -6 -18 4 q8 -2 10 6 q-6 0 -8 6 q-4 10 -38 10z" fill={C.blue} />
            <path d="M34 12 q18 -2 24 14 q-12 -6 -18 4" fill={C.white} strokeWidth={2.4} />
            <path d="M4 56 h56" strokeWidth={3} />
        </>
    ),
    splash: () => (
        <>
            <ellipse cx={32} cy={50} rx={20} ry={5} fill={C.sky} />
            <Drop x={32} y={22} s={1.4} />
            <Drop x={16} y={30} s={0.9} />
            <Drop x={48} y={30} s={0.9} />
            <Drop x={24} y={12} s={0.6} />
            <Drop x={42} y={12} s={0.6} />
        </>
    ),
    "ice-cube": () => (
        <>
            <path d="M14 24 l18 -10 l18 10 v20 l-18 10 l-18 -10z" fill={C.sky} />
            <path d="M14 24 l18 10 l18 -10 M32 34 v20" fill="none" strokeWidth={2.4} />
            <Shine d="M18 30 v8" />
            <Sparkle x={52} y={12} s={1} fill={C.white} />
            <Sparkle x={10} y={50} s={0.8} fill={C.white} />
        </>
    ),
    bubble: () => (
        <>
            <circle cx={32} cy={32} r={22} fill={C.sky} fillOpacity={0.45} />
            <path d="M18 24 a16 16 0 0 1 14 -10" fill="none" stroke={C.white} strokeWidth={3.5} />
            <circle cx={50} cy={50} r={5} fill={C.sky} fillOpacity={0.45} strokeWidth={2} />
            <circle cx={12} cy={50} r={3} fill={C.sky} fillOpacity={0.45} strokeWidth={1.8} />
        </>
    ),
    swirl: () => {
        const d = "M32 32 m0 -2 a2 2 0 1 1 -2 2 a5 5 0 0 1 6 -6 a8 8 0 0 1 6 10 a11 11 0 0 1 -14 8 a14 14 0 0 1 -10 -16 a17 17 0 0 1 20 -12 a20 20 0 0 1 14 22";
        return (
            <>
                <path d={d} fill="none" strokeWidth={9} />
                <path d={d} fill="none" stroke={C.gold} strokeWidth={4.5} />
                <path d="M56 46 l-6 2 l2 -7" fill="none" strokeWidth={3} />
                <Sparkle x={10} y={12} s={1.1} fill={C.sky} />
            </>
        );
    },
    boom: () => (
        <>
            <Burst x={32} y={32} r={28} fill={C.orange} />
            <Burst x={32} y={32} r={19} fill={C.gold} spikes={10} />
            <Label x={32} y={33} size={11} fill={C.red} outline>POW</Label>
        </>
    ),
    "burst-9000": () => (
        <>
            <Burst x={32} y={32} r={29} fill={C.gold} spikes={14} />
            <Label x={32} y={33} size={13} fill={C.red} outline>9000!</Label>
        </>
    ),
    star: () => (
        <>
            <Star x={32} y={33} r={24} />
            <Shine d="M24 26 l4 -6" />
            <Sparkle x={8} y={12} s={1} fill={C.pink} />
            <Sparkle x={56} y={52} s={0.9} fill={C.sky} />
        </>
    ),

    // ── creatures ────────────────────────────────────────────
    fish: () => <Fish x={30} y={34} s={1.2} />,
    whale: () => (
        <>
            <path d="M6 38 q2 -18 24 -18 q20 0 24 14 l6 -8 v18 l-6 -4 q-6 12 -26 12 q-22 0 -22 -14z" fill={C.blue} />
            <path d="M8 42 q22 8 44 -2" fill="none" strokeWidth={2} />
            <circle cx={18} cy={32} r={2.2} fill={C.ink} stroke="none" />
            <path d="M28 18 q-2 -8 -8 -10 M28 18 q2 -8 8 -10 M28 18 v-10" fill="none" stroke={C.sky} strokeWidth={3} />
        </>
    ),
    "fishing-rod": () => (
        <>
            <path d="M6 58 q10 -40 46 -50" fill="none" stroke={C.brown} strokeWidth={4} />
            <path d="M52 8 v26" fill="none" strokeWidth={1.6} />
            <Fish x={48} y={44} s={0.7} rot={-70} />
            <circle cx={12} cy={50} r={4} fill={C.grey} />
        </>
    ),
    fishbowl: () => (
        <>
            <path d="M14 18 h36 q10 10 10 22 q0 18 -28 18 q-28 0 -28 -18 q0 -12 10 -22z" fill={C.sky} fillOpacity={0.5} />
            <path d="M10 30 q22 6 44 0" fill="none" strokeWidth={2} />
            <Fish x={32} y={42} s={0.7} />
            <rect x={12} y={14} width={40} height={6} rx={3} fill={C.white} />
            <PointGlove x={56} y={20} rot={-80} />
        </>
    ),
    donkey: () => (
        <>
            <path d="M18 14 q-4 -12 4 -10 q4 2 4 14z" fill={C.grey} />
            <path d="M46 14 q4 -12 -4 -10 q-4 2 -4 14z" fill={C.grey} />
            <ellipse cx={32} cy={30} rx={15} ry={16} fill={C.grey} />
            <ellipse cx={32} cy={46} rx={13} ry={10} fill={C.tan} />
            <circle cx={26} cy={26} r={2.2} fill={C.ink} stroke="none" />
            <circle cx={38} cy={26} r={2.2} fill={C.ink} stroke="none" />
            <path d="M27 46 v1 M37 46 v1" strokeWidth={3} />
            <path d="M28 52 q4 3 8 0" fill="none" strokeWidth={2} />
        </>
    ),
    snail: () => (
        <>
            <path d="M6 52 h46 q6 0 6 -8 v-10 q0 -4 -4 -4 q-4 0 -4 4 v6 h-44z" fill={C.green} />
            <circle cx={28} cy={34} r={16} fill={C.orange} />
            <path d="M28 34 m0 0 a3 3 0 1 1 3 3 a7 7 0 0 1 -9 -6 a10 10 0 0 1 14 -8 a13 13 0 0 1 4 16" fill="none" strokeWidth={2.4} />
            <path d="M52 30 l-2 -10 M56 30 l2 -10" fill="none" strokeWidth={2} />
            <circle cx={50} cy={19} r={2} fill={C.ink} stroke="none" />
            <circle cx={58} cy={19} r={2} fill={C.ink} stroke="none" />
            <Lines d="M2 40 h-2" />
        </>
    ),
    unicorn: () => (
        <>
            <path d="M18 56 q-4 -22 8 -34 q8 -8 18 -4 q8 4 8 14 q0 6 -6 8 h-8 q-2 8 4 16z" fill={C.white} />
            <path d="M36 18 l6 -16 l2 18z" fill={C.gold} />
            <path d="M24 22 q-10 4 -8 18 q-4 -8 0 -14 q-6 2 -6 10 q-2 -14 14 -18z" fill={C.pink} />
            <circle cx={42} cy={28} r={2.2} fill={C.ink} stroke="none" />
            <Sparkle x={56} y={10} s={1} fill={C.pink} />
            <Sparkle x={10} y={14} s={0.8} fill={C.sky} />
        </>
    ),
    "eyes": () => (
        <>
            {[20, 44].map(x => (
                <g key={x}>
                    <ellipse cx={x} cy={32} rx={11} ry={14} fill={C.white} />
                    <circle cx={x + 5} cy={30} r={5} fill={C.ink} stroke="none" />
                    <circle cx={x + 6.5} cy={28} r={1.5} fill={C.white} stroke="none" />
                </g>
            ))}
        </>
    ),
    brain: () => (
        <>
            <path d="M32 12 c-10 -4 -20 4 -18 12 c-7 4 -5 14 3 16 c2 7 11 9 15 4 c4 5 13 3 15 -4 c8 -2 10 -12 3 -16 c2 -8 -8 -16 -18 -12z" fill={C.pink} />
            <path d="M32 12 v32 M21 24 q5 2 5 7 M43 24 q-5 2 -5 7 M20 36 q4 -2 6 1 M44 36 q-4 -2 -6 1" fill="none" strokeWidth={2.2} />
            <Sparkle x={54} y={10} s={1.1} />
        </>
    ),
    skull: () => (
        <>
            <path d="M12 30 a20 20 0 0 1 40 0 v6 a4 4 0 0 1 -4 4 h-3 v10 h-26 v-10 h-3 a4 4 0 0 1 -4 -4z" fill={C.cream} />
            <circle cx={24} cy={30} r={5.5} fill={C.ink} stroke="none" />
            <circle cx={40} cy={30} r={5.5} fill={C.ink} stroke="none" />
            <path d="M32 36 l-3 5 h6z" fill={C.ink} strokeWidth={1.4} />
            <path d="M26 50 v-6 M32 50 v-6 M38 50 v-6" fill="none" strokeWidth={2} />
            <Shine d="M18 22 q2 -6 8 -8" />
        </>
    ),
    robot: () => (
        <>
            <path d="M32 6 v8" strokeWidth={2.6} />
            <circle cx={32} cy={6} r={3} fill={C.red} />
            <rect x={12} y={14} width={40} height={34} rx={8} fill={C.grey} />
            <rect x={6} y={24} width={6} height={14} rx={2} fill={C.slate} />
            <rect x={52} y={24} width={6} height={14} rx={2} fill={C.slate} />
            <circle cx={24} cy={28} r={5} fill={C.sky} />
            <circle cx={40} cy={28} r={5} fill={C.sky} />
            <rect x={22} y={38} width={20} height={6} rx={2} fill={C.white} />
            <path d="M27 38 v6 M32 38 v6 M37 38 v6" fill="none" strokeWidth={1.6} />
        </>
    ),

    // ── things ───────────────────────────────────────────────
    target: () => (
        <>
            <circle cx={30} cy={36} r={22} fill={C.red} />
            <circle cx={30} cy={36} r={15} fill={C.white} />
            <circle cx={30} cy={36} r={8} fill={C.red} />
            <circle cx={30} cy={36} r={2.5} fill={C.white} strokeWidth={1.6} />
            <path d="M30 36 l24 -26" fill="none" stroke={C.brown} strokeWidth={3.5} />
            <path d="M50 8 l8 -2 l-2 8 M54 14 l6 0" fill={C.gold} strokeWidth={2.4} />
        </>
    ),
    rocket: () => (
        <>
            <path d="M20 44 l-8 8 l4 -14z M44 44 l8 8 l-4 -14z" fill={C.red} />
            <path d="M32 4 q14 12 12 40 h-24 q-2 -28 12 -40z" fill={C.white} />
            <path d="M32 4 q8 6 10 14 h-20 q2 -8 10 -14z" fill={C.red} />
            <circle cx={32} cy={28} r={5.5} fill={C.sky} />
            <path d="M24 46 q8 18 16 0z" fill={C.orange} />
            <path d="M28 46 q4 10 8 0z" fill={C.gold} strokeWidth={1.8} />
        </>
    ),
    ship: () => (
        <>
            <rect x={26} y={10} width={10} height={14} rx={1} fill={C.red} />
            <path d="M26 15 h10" stroke={C.white} strokeWidth={3} />
            <rect x={16} y={22} width={30} height={12} rx={2} fill={C.white} />
            <circle cx={23} cy={28} r={2} fill={C.sky} strokeWidth={1.4} />
            <circle cx={31} cy={28} r={2} fill={C.sky} strokeWidth={1.4} />
            <circle cx={39} cy={28} r={2} fill={C.sky} strokeWidth={1.4} />
            <path d="M6 34 h52 l-8 14 h-36z" fill={C.blue} />
            <path d="M2 54 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke={C.sky} strokeWidth={3} />
        </>
    ),
    bottle: () => (
        <>
            <path d="M28 6 q4 -4 8 0 v6 h-8z" fill={C.pink} />
            <rect x={24} y={12} width={16} height={7} rx={2} fill={C.sky} />
            <rect x={20} y={19} width={24} height={38} rx={8} fill={C.white} />
            <path d="M21 34 h22 v15 a7 7 0 0 1 -7 7 h-8 a7 7 0 0 1 -7 -7z" fill={C.cream} strokeWidth={0} />
            <path d="M20 34 h24" fill="none" strokeWidth={2} />
            <path d="M34 26 h6 M34 32 h6 M34 40 h6" fill="none" strokeWidth={1.8} />
        </>
    ),
    peanut: () => (
        <>
            <path d="M24 10 q14 -4 16 10 q0 6 -2 10 q8 6 4 18 q-6 14 -20 6 q-8 -6 -4 -16 q-10 -14 6 -28z" fill={C.tan} transform="rotate(-20 32 32)" />
            <g fill={C.brown} stroke="none" transform="rotate(-20 32 32)">
                <circle cx={28} cy={18} r={1.5} />
                <circle cx={33} cy={22} r={1.5} />
                <circle cx={26} cy={42} r={1.5} />
                <circle cx={32} cy={46} r={1.5} />
            </g>
            <Sparkle x={52} y={12} s={1.2} />
        </>
    ),
    "chequered-flag": () => (
        <>
            <path d="M12 58 v-50" stroke={C.brown} strokeWidth={4} />
            <path d="M12 10 q12 -6 22 0 t22 0 v24 q-10 -6 -22 0 t-22 0z" fill={C.white} />
            <g fill={C.ink} stroke="none">
                {[0, 1, 2, 3].map(c =>
                    [0, 1, 2].map(r => ((c + r) % 2 === 0 ? <rect key={`${c}${r}`} x={14 + c * 10.5} y={11 + r * 7.5} width={10.5} height={7.5} /> : null))
                )}
            </g>
            <path d="M12 10 q12 -6 22 0 t22 0 v24 q-10 -6 -22 0 t-22 0z" fill="none" />
        </>
    ),
    sneaker: () => (
        <>
            <path d="M8 44 q0 -16 10 -20 l8 6 q10 4 20 4 q12 0 12 10 v4 h-50z" fill={C.red} />
            <path d="M8 46 h50 v4 q0 4 -4 4 h-42 q-4 0 -4 -4z" fill={C.white} />
            <path d="M22 32 l4 -3 M27 35 l4 -3 M32 37 l4 -3" fill="none" stroke={C.white} strokeWidth={2} />
            <Lines d="M2 30 h-4 M4 38 h-6" />
        </>
    ),
    "broken-heart": () => (
        <>
            <path d="M30 46 C8 30 16 12 30 23 l-4 8 l6 5 l-4 8z" fill={C.red} transform="translate(-3 0)" />
            <path d="M34 46 C56 30 48 12 34 23 l-4 8 l6 5 l-4 8z" fill={C.red} transform="translate(3 2)" />
            <Drop x={14} y={52} s={0.6} />
        </>
    ),
    heart: () => (
        <>
            <Heart x={32} y={32} s={1.25} />
            <Shine d="M16 24 q2 -6 8 -6" />
        </>
    ),
    tombstone: () => (
        <>
            <path d="M14 56 v-30 a18 18 0 0 1 36 0 v30z" fill={C.grey} />
            <Label x={32} y={30} size={11} fill={C.ink}>RIP</Label>
            <path d="M24 40 h16 M26 46 h12" fill="none" strokeWidth={2} />
            <path d="M6 58 q4 -6 6 0 q4 -8 8 0 q4 -6 6 0 h12 q4 -6 6 0 q4 -8 8 0 q4 -6 6 0" fill={C.green} />
        </>
    ),
    trash: () => (
        <>
            <Card x={26} y={14} rank="7" suit="c" rot={-20} />
            <Card x={40} y={14} rank="2" suit="h" rot={16} />
            <path d="M14 24 h36 l-4 32 h-28z" fill={C.grey} />
            <rect x={10} y={20} width={44} height={7} rx={3} fill={C.slate} />
            <path d="M24 32 l1 18 M32 32 v18 M40 32 l-1 18" fill="none" strokeWidth={2} />
        </>
    ),
    phone: () => (
        <>
            <path d="M14 14 q-6 4 -2 16 q8 18 26 24 q10 2 14 -4 l-8 -8 q-4 4 -8 2 q-8 -4 -12 -12 q-2 -4 2 -8 l-8 -8z" fill={C.red} />
            <Lines d="M38 10 q8 2 10 10 M40 4 q14 2 16 16" />
        </>
    ),
    calculator: () => (
        <>
            <rect x={14} y={6} width={36} height={52} rx={6} fill={C.slate} />
            <rect x={19} y={12} width={26} height={12} rx={2} fill={C.green} />
            <Label x={32} y={18.5} size={8} fill={C.ink}>EV+</Label>
            {[0, 1, 2].map(r =>
                [0, 1, 2].map(c => <rect key={`${r}${c}`} x={19 + c * 9.5} y={29 + r * 9} width={7} height={6} rx={1.5} fill={r === 2 && c === 2 ? C.orange : C.white} strokeWidth={1.4} />)
            )}
        </>
    ),
    hourglass: () => (
        <>
            <rect x={14} y={6} width={36} height={6} rx={2} fill={C.brown} />
            <rect x={14} y={52} width={36} height={6} rx={2} fill={C.brown} />
            <path d="M18 12 h28 q0 12 -12 20 q12 8 12 20 h-28 q0 -12 12 -20 q-12 -8 -12 -20z" fill={C.sky} fillOpacity={0.55} />
            <path d="M24 18 h16 q-2 6 -8 10 q-6 -4 -8 -10z M32 34 v6 M22 50 q4 -8 10 -8 q6 0 10 8z" fill={C.gold} strokeWidth={1.8} />
        </>
    ),
    hammer: () => (
        <>
            <rect x={28} y={24} width={8} height={34} rx={3} fill={C.brown} transform="rotate(-30 32 40)" />
            <path d="M10 18 h34 q6 0 6 6 v4 h-40z" fill={C.grey} transform="rotate(-30 32 24)" />
            <Lines d="M52 8 l4 -4 M56 16 h6" />
        </>
    ),
    gift: () => (
        <>
            <rect x={10} y={26} width={44} height={30} rx={3} fill={C.red} />
            <rect x={6} y={18} width={52} height={10} rx={3} fill={C.red} />
            <rect x={28} y={18} width={8} height={38} fill={C.gold} />
            <path d="M32 18 q-14 -14 -16 -2 q2 4 16 2z M32 18 q14 -14 16 -2 q-2 4 -16 2z" fill={C.gold} />
        </>
    ),
    crown: () => (
        <>
            <path d="M8 46 l-2 -28 l14 12 l12 -18 l12 18 l14 -12 l-2 28z" fill={C.gold} />
            <rect x={8} y={46} width={48} height={8} rx={2} fill={C.gold} />
            <circle cx={20} cy={50} r={2.4} fill={C.red} strokeWidth={1.4} />
            <circle cx={32} cy={50} r={2.4} fill={C.blue} strokeWidth={1.4} />
            <circle cx={44} cy={50} r={2.4} fill={C.green} strokeWidth={1.4} />
            <Shine d="M14 40 l-1 -12" />
        </>
    ),
    lollipop: () => (
        <>
            <path d="M32 36 l10 24" stroke={C.white} strokeWidth={7} />
            <path d="M32 36 l10 24" fill="none" strokeWidth={0} />
            <circle cx={30} cy={26} r={20} fill={C.pink} />
            <path d="M30 26 m0 -2 a2 2 0 1 1 -2 2 a6 6 0 0 1 8 -6 a10 10 0 0 1 4 14 a14 14 0 0 1 -18 2 a17 17 0 0 1 4 -22" fill="none" stroke={C.white} strokeWidth={4} />
        </>
    ),
    beer: () => (
        <>
            <path d="M44 24 h6 a8 8 0 0 1 0 16 h-6" fill="none" strokeWidth={4} />
            <rect x={12} y={18} width={34} height={40} rx={4} fill={C.gold} />
            <path d="M10 22 a6 6 0 0 1 6 -10 a8 8 0 0 1 14 -2 a8 8 0 0 1 14 2 a6 6 0 0 1 4 10z" fill={C.white} />
            <path d="M20 28 v22 M29 28 v22 M38 28 v22" fill="none" stroke={C.white} strokeOpacity={0.7} strokeWidth={2.4} />
        </>
    ),
    siren: () => (
        <>
            <path d="M18 44 v-16 a14 14 0 0 1 28 0 v16z" fill={C.red} />
            <rect x={12} y={44} width={40} height={10} rx={3} fill={C.slate} />
            <Shine d="M24 26 a8 8 0 0 1 6 -6" />
            <Lines d="M6 22 l-4 -3 M58 22 l4 -3 M32 6 v-4 M14 10 l-3 -3 M50 10 l3 -3" />
        </>
    ),
    microphone: () => (
        <>
            <rect x={28} y={34} width={8} height={24} rx={3} fill={C.slate} transform="rotate(20 32 34)" />
            <circle cx={36} cy={22} r={14} fill={C.grey} />
            <path d="M26 16 l20 12 M24 24 l18 10 M30 10 l18 10" fill="none" strokeWidth={1.6} />
            <Sparkle x={12} y={14} s={1.1} />
        </>
    ),
    "white-flag": () => (
        <>
            <path d="M14 58 v-52" stroke={C.brown} strokeWidth={4} />
            <path d="M14 8 q10 -6 22 2 t20 0 v24 q-8 6 -20 -2 t-22 0z" fill={C.white} />
            <Label x={35} y={21} size={9} fill={C.ink}>GG</Label>
        </>
    ),
    chair: () => (
        <>
            <path d="M18 6 h28 v26 h-28z" fill={C.brown} />
            <rect x={14} y={30} width={36} height={8} rx={2} fill={C.tan} />
            <path d="M18 38 v20 M46 38 v20" stroke={C.brown} strokeWidth={4.5} />
            <Coin x={32} y={22} r={8} />
        </>
    ),
    trophy: () => (
        <>
            <path d="M18 14 h-8 q0 14 12 14 M46 14 h8 q0 14 -12 14" fill="none" strokeWidth={3.5} />
            <path d="M16 8 h32 v10 q0 16 -16 18 q-16 -2 -16 -18z" fill={C.gold} />
            <rect x={28} y={36} width={8} height={10} fill={C.gold} />
            <rect x={18} y={46} width={28} height={10} rx={2} fill={C.brown} />
            <Shine d="M22 14 v8" />
        </>
    ),
    key: () => (
        <>
            <circle cx={20} cy={22} r={14} fill={C.gold} />
            <circle cx={20} cy={22} r={5} fill={C.white} />
            <path d="M30 32 l24 24 M44 46 l6 -6 M50 52 l4 -4" fill="none" strokeWidth={6} />
            <path d="M30 32 l24 24 M44 46 l6 -6 M50 52 l4 -4" fill="none" stroke={C.gold} strokeWidth={3} />
            <Sparkle x={52} y={12} s={1.2} />
        </>
    ),
    radiation: () => (
        <>
            <circle cx={32} cy={32} r={26} fill={C.gold} />
            <circle cx={32} cy={32} r={4} fill={C.ink} />
            {[0, 120, 240].map(a => (
                <path key={a} d="M32 26 l-8 -14 a20 20 0 0 1 16 0z" fill={C.ink} transform={`rotate(${a} 32 32)`} strokeWidth={1.4} />
            ))}
        </>
    ),
    mousetrap: () => (
        <>
            <path d="M4 44 l10 -12 h46 l-10 12z" fill={C.tan} />
            <path d="M4 44 h46 v8 h-46z M50 44 l10 -12 v8 l-10 12z" fill={C.brown} />
            <path d="M16 40 l8 -10 h22 l-8 10" fill="none" strokeWidth={6} />
            <path d="M16 40 l8 -10 h22 l-8 10" fill="none" stroke={C.grey} strokeWidth={2.5} />
            <path d="M30 22 l16 -6 l-2 14z" fill={C.gold} />
            <circle cx={38} cy={20} r={1.4} fill={C.orange} stroke="none" />
            <circle cx={42} cy={24} r={1.2} fill={C.orange} stroke="none" />
            <Label x={14} y={16} size={13} fill={C.red} outline>!</Label>
        </>
    ),
    "shopping-bag": () => (
        <>
            <path d="M24 22 v-6 a8 8 0 0 1 16 0 v6" fill="none" strokeWidth={3.5} />
            <path d="M12 22 h40 l-4 34 h-32z" fill={C.pink} />
            <Label x={32} y={40} size={10} fill={C.white} outline>HUGE</Label>
        </>
    ),
    "wizard-hat": () => (
        <>
            <path d="M32 2 q4 20 18 44 h-36 q12 -24 18 -44z" fill={C.purple} />
            <ellipse cx={32} cy={48} rx={28} ry={8} fill={C.purple} />
            <Star x={30} y={30} r={6} />
            <Sparkle x={38} y={16} s={0.8} />
        </>
    ),
    ring: () => (
        <>
            <ellipse cx={32} cy={40} rx={20} ry={16} fill="none" stroke={C.ink} strokeWidth={10} />
            <ellipse cx={32} cy={40} rx={20} ry={16} fill="none" stroke={C.gold} strokeWidth={5} />
            <path d="M24 16 l8 -10 l8 10 l-8 10z" fill={C.sky} />
            <Sparkle x={50} y={10} s={1.2} fill={C.white} />
        </>
    ),
    door: () => (
        <>
            <rect x={14} y={6} width={32} height={52} rx={2} fill={C.gold} fillOpacity={0.9} />
            <path d="M14 6 l20 6 v50 l-20 -4z" fill={C.brown} />
            <circle cx={30} cy={34} r={2} fill={C.gold} />
            <Lines d="M52 20 h6 M52 30 h8 M52 40 h6" />
        </>
    ),
    "chef-hat": () => (
        <>
            <path d="M16 36 a10 10 0 0 1 -2 -18 a12 12 0 0 1 18 -10 a12 12 0 0 1 18 10 a10 10 0 0 1 -2 18z" fill={C.white} />
            <rect x={16} y={34} width={32} height={14} rx={2} fill={C.white} />
            <path d="M24 38 v8 M32 38 v8 M40 38 v8" fill="none" strokeWidth={1.8} />
            <Lines d="M10 54 q4 -4 0 -8 M54 54 q-4 -4 0 -8 M32 58 v-6" />
        </>
    ),
    drumstick: () => (
        <>
            <path d="M14 30 a16 16 0 0 1 28 -12 q4 6 -2 14 l-10 6 q-14 6 -16 -8z" fill={C.orange} />
            <path d="M34 34 l14 14" stroke={C.ink} strokeWidth={8} />
            <path d="M34 34 l14 14" stroke={C.cream} strokeWidth={4} />
            <circle cx={50} cy={46} r={4} fill={C.cream} />
            <circle cx={46} cy={52} r={4} fill={C.cream} />
            <Shine d="M20 24 q4 -6 10 -6" />
        </>
    ),
    clover: () => (
        <>
            <path d="M32 34 q4 14 -4 24" fill="none" stroke={C.green} strokeWidth={4} />
            {[0, 90, 180, 270].map(a => (
                <path key={a} d="M32 32 c-14 -2 -16 -16 -8 -18 c4 -1 7 2 8 6 c1 -4 4 -7 8 -6 c8 2 6 16 -8 18z" fill={C.green} transform={`rotate(${a} 32 32)`} />
            ))}
            <circle cx={32} cy={32} r={3} fill={C.gold} strokeWidth={1.6} />
        </>
    ),
    gamepad: () => (
        <>
            <path d="M14 22 h36 q10 0 10 14 q0 16 -8 16 q-6 0 -10 -8 h-20 q-4 8 -10 8 q-8 0 -8 -16 q0 -14 10 -14z" fill={C.slate} />
            <path d="M18 34 h8 M22 30 v8" stroke={C.white} strokeWidth={3} />
            <circle cx={42} cy={32} r={2.6} fill={C.red} strokeWidth={1.4} />
            <circle cx={48} cy={37} r={2.6} fill={C.green} strokeWidth={1.4} />
            <Label x={32} y={12} size={8} fill={C.red} outline>GAME OVER</Label>
        </>
    ),
    camera: () => (
        <>
            <rect x={8} y={20} width={48} height={32} rx={6} fill={C.slate} />
            <rect x={20} y={14} width={14} height={8} rx={2} fill={C.slate} />
            <circle cx={32} cy={36} r={11} fill={C.white} />
            <circle cx={32} cy={36} r={6} fill={C.blue} />
            <Label x={48} y={27} size={6} fill={C.white}>4K</Label>
            <Sparkle x={54} y={10} s={1.4} fill={C.white} />
        </>
    ),
    canister: () => (
        <>
            <rect x={18} y={14} width={28} height={44} rx={10} fill={C.green} />
            <rect x={26} y={6} width={12} height={8} rx={2} fill={C.grey} />
            <rect x={18} y={28} width={28} height={14} fill={C.white} />
            <Label x={32} y={35} size={6.5} fill={C.ink}>COPIUM</Label>
            <Lines d="M44 6 q6 -2 8 4 M48 2 q8 0 10 6" />
        </>
    ),
    grass: () => (
        <>
            <path d="M4 58 l6 -22 l4 14 l6 -24 l6 22 l6 -26 l6 24 l6 -20 l4 16 l6 -18 l6 22z" fill={C.green} />
            <circle cx={46} cy={18} r={5} fill={C.gold} />
            {[0, 72, 144, 216, 288].map(a => (
                <circle key={a} cx={46} cy={11} r={3.5} fill={C.white} transform={`rotate(${a} 46 18)`} strokeWidth={1.6} />
            ))}
            <circle cx={46} cy={18} r={3.5} fill={C.gold} strokeWidth={1.6} />
        </>
    ),
    medal: () => (
        <>
            <path d="M20 4 l8 22 h8 l8 -22z" fill={C.red} />
            <path d="M28 4 l4 22 l4 -22" fill={C.blue} strokeWidth={2} />
            <circle cx={32} cy={40} r={16} fill={C.grey} />
            <Star x={32} y={40} r={8} fill={C.white} />
        </>
    ),
    "hard-hat": () => (
        <>
            <path d="M10 42 a22 22 0 0 1 44 0z" fill={C.gold} />
            <rect x={4} y={40} width={56} height={8} rx={3} fill={C.gold} />
            <rect x={28} y={20} width={8} height={20} rx={2} fill={C.orange} />
            <Shine d="M16 36 a16 16 0 0 1 8 -12" />
        </>
    ),
    house: () => (
        <>
            <path d="M8 30 l24 -22 l24 22z" fill={C.red} />
            <rect x={14} y={30} width={36} height={26} fill={C.cream} />
            <rect x={27} y={40} width={10} height={16} fill={C.brown} />
            <rect x={18} y={36} width={7} height={7} fill={C.sky} strokeWidth={2} />
            <rect x={40} y={36} width={7} height={7} fill={C.sky} strokeWidth={2} />
        </>
    ),
    check: () => (
        <>
            <circle cx={32} cy={32} r={24} fill={C.green} />
            <path d="M20 32 l8 8 l16 -16" fill="none" stroke={C.white} strokeWidth={6} />
            <path d="M44 10 l-4 8 l6 2 l-4 8" fill="none" stroke={C.ink} strokeWidth={2} />
        </>
    ),
    ambulance: () => (
        <>
            <path d="M6 22 h34 v26 h-34z" fill={C.white} />
            <path d="M40 28 h10 l8 10 v10 h-18z" fill={C.white} />
            <path d="M44 30 h5 l5 7 h-10z" fill={C.sky} strokeWidth={1.8} />
            <path d="M23 28 v14 M16 35 h14" stroke={C.red} strokeWidth={4.5} />
            <rect x={18} y={14} width={10} height={8} rx={2} fill={C.red} />
            <circle cx={16} cy={50} r={5.5} fill={C.slate} />
            <circle cx={46} cy={50} r={5.5} fill={C.slate} />
            <Lines d="M14 8 l-3 -3 M32 8 l3 -3" />
        </>
    ),
    scales: () => (
        <>
            <path d="M32 10 v42 M20 56 h24 M10 18 h44" fill="none" strokeWidth={3.5} />
            <path d="M10 18 l-6 16 h12z M54 18 l-6 16 h12z" fill="none" strokeWidth={1.8} />
            <path d="M2 34 a8 5 0 0 0 16 0z M46 34 a8 5 0 0 0 16 0z" fill={C.gold} />
            <circle cx={32} cy={10} r={4} fill={C.gold} />
        </>
    ),
    clapper: () => (
        <>
            <rect x={8} y={26} width={48} height={30} rx={3} fill={C.slate} />
            <path d="M8 16 l46 -8 l2 10 l-46 8z" fill={C.white} />
            <path d="M16 14 l6 9 M28 12 l6 9 M40 10 l6 9" stroke={C.ink} strokeWidth={4} />
            <Label x={32} y={41} size={8} fill={C.white}>CINEMA</Label>
        </>
    ),
    "arrow-up": () => (
        <>
            <path d="M32 6 l20 22 h-12 v26 h-16 v-26 h-12z" fill={C.green} />
            <Sparkle x={10} y={14} s={1.2} />
            <Sparkle x={54} y={44} s={1} fill={C.pink} />
        </>
    ),
    "captain-hat": () => (
        <>
            <path d="M8 34 q0 -18 24 -20 q24 2 24 20z" fill={C.white} />
            <rect x={10} y={32} width={44} height={10} rx={2} fill={C.blue} />
            <path d="M12 42 q20 14 40 0z" fill={C.ink} />
            <circle cx={32} cy={30} r={5} fill={C.gold} />
            <path d="M22 30 q-4 -4 2 -6 M42 30 q4 -4 -2 -6" fill="none" stroke={C.gold} strokeWidth={2.4} />
        </>
    ),
    tv: () => (
        <>
            <path d="M24 6 l8 8 l8 -8" fill="none" strokeWidth={2.6} />
            <rect x={6} y={14} width={52} height={38} rx={6} fill={C.brown} />
            <rect x={11} y={19} width={34} height={28} rx={4} fill={C.sky} />
            <Label x={28} y={33} size={14} fill={C.white} outline>?!</Label>
            <circle cx={51} cy={24} r={2.6} fill={C.gold} strokeWidth={1.4} />
            <circle cx={51} cy={33} r={2.6} fill={C.gold} strokeWidth={1.4} />
            <path d="M14 52 l-2 6 M50 52 l2 6" strokeWidth={3} />
        </>
    ),
    plate: () => (
        <>
            <path d="M6 14 v16 a4 4 0 0 0 4 4 v22 M10 14 v12 M14 14 v16 a4 4 0 0 1 -4 4" fill="none" strokeWidth={2.6} />
            <path d="M54 14 q6 10 0 20 v22" fill="none" strokeWidth={2.6} />
            <ellipse cx={32} cy={36} rx={18} ry={18} fill={C.white} />
            <ellipse cx={32} cy={36} rx={11} ry={11} fill="none" strokeWidth={1.8} />
            <Sparkle x={32} y={36} s={1.2} />
        </>
    ),
    burger: () => (
        <>
            <path d="M8 30 q0 -20 24 -20 q24 0 24 20z" fill={C.tan} />
            <path d="M6 32 q6 6 12 0 t12 0 t12 0 t12 0 t6 0" fill={C.green} />
            <rect x={8} y={36} width={48} height={8} rx={4} fill={C.brown} />
            <path d="M8 46 h48 q0 10 -24 10 q-24 0 -24 -10z" fill={C.tan} />
            <g fill={C.cream} stroke="none">
                <ellipse cx={22} cy={20} rx={1.6} ry={1} />
                <ellipse cx={32} cy={16} rx={1.6} ry={1} />
                <ellipse cx={42} cy={20} rx={1.6} ry={1} />
            </g>
        </>
    ),
    magnifier: () => (
        <>
            <path d="M40 40 l16 16" strokeWidth={8} />
            <path d="M40 40 l16 16" stroke={C.brown} strokeWidth={4} />
            <circle cx={28} cy={28} r={18} fill={C.sky} fillOpacity={0.5} />
            <circle cx={28} cy={28} r={18} fill="none" strokeWidth={5} />
            <circle cx={28} cy={28} r={18} fill="none" stroke={C.gold} strokeWidth={2} />
            <Shine d="M18 22 a11 11 0 0 1 8 -6" />
        </>
    ),
    nope: () => (
        <>
            <circle cx={32} cy={32} r={24} fill={C.red} />
            <path d="M22 22 l20 20 M42 22 l-20 20" stroke={C.white} strokeWidth={6} />
        </>
    ),
    "cowboy-hat": () => (
        <>
            <path d="M4 40 q4 10 28 10 q24 0 28 -10 q-6 4 -12 2 q0 -24 -8 -28 q-4 -2 -8 4 q-4 -6 -8 -4 q-8 4 -8 28 q-6 2 -12 -2z" fill={C.brown} />
            <path d="M16 38 q16 4 32 0" fill="none" stroke={C.gold} strokeWidth={4} />
            <Shine d="M22 20 q2 -4 6 -4" />
        </>
    ),
    handkerchief: () => (
        <>
            <path d="M10 14 q22 -8 44 0 q-6 20 0 40 q-22 8 -44 0 q6 -20 0 -40z" fill={C.white} />
            <path d="M10 14 q8 -3 14 -4 v12 q-8 0 -12 2 M54 54 q-8 3 -14 4 v-12 q8 0 12 -2" fill={C.sky} strokeWidth={2} />
            <Drop x={32} y={34} s={1} />
        </>
    ),
    "tilt-sign": () => (
        <>
            <path d="M32 40 v20" stroke={C.brown} strokeWidth={5} />
            <rect x={6} y={10} width={52} height={30} rx={4} fill={C.red} transform="rotate(-8 32 25)" />
            <Label x={32} y={25} size={16} fill={C.white} outline>TILT</Label>
        </>
    ),
    suit: () => (
        <>
            <Suit suit="s" x={32} y={32} scale={4} />
        </>
    )
};

/** Suit pips as their own emotes. */
export const suitProp = (s: "s" | "h" | "d" | "c"): Draw => () => <Suit suit={s} x={32} y={32} scale={4.2} />;
