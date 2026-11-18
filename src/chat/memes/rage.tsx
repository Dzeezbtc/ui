import React from "react";
import { ChipPile, Flame } from "./frame";

/**
 * Rage-comic stickers (block52-chat#2): thin black line, stick-figure bodies,
 * big simple faces pulling extreme expressions — the guy at his desk screaming
 * and spitting at his monitor, the big-teeth grin, the jaw on the floor, the
 * waterfall cry. White ground, very little colour. 100×76 art area.
 */
const INK = "#111";
const W = 1.3;
const RAGE = "#e8483e";
const TEAR = "#5aa9e6";

const Body: React.FC<{ d: string }> = ({ d }) => <path d={d} fill="none" stroke={INK} strokeWidth={W * 1.3} strokeLinecap="round" strokeLinejoin="round" />;

export const RAGE_SET: Record<string, () => React.ReactElement> = {
    rigged: () => (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* desk, monitor showing the river that did it */}
            <path d="M54 62 h46 M58 62 v18 M96 62 v18" />
            <rect x={64} y={20} width={34} height={28} rx={2} fill="#fff" />
            <rect x={67} y={23} width={28} height={22} fill="#2e6b45" />
            <g stroke={INK} strokeWidth={0.8}>
                <rect x={70} y={27} width={9} height={13} rx={1} fill="#fff" />
                <rect x={83} y={27} width={9} height={13} rx={1} fill="#fff" />
            </g>
            <text x={74.5} y={33.5} textAnchor="middle" dominantBaseline="central" fontFamily="Arial Black, sans-serif" fontSize={7} fill={INK} stroke="none">7</text>
            <text x={87.5} y={33.5} textAnchor="middle" dominantBaseline="central" fontFamily="Arial Black, sans-serif" fontSize={7} fill={RAGE} stroke="none">2</text>
            <path d="M78 48 v8 M72 56 h12" />
            <path d="M62 60 h20 l-2 2 h-16z" fill="#ddd" />
            {/* stick body leaning at the desk */}
            <Body d="M30 50 C32 60 32 66 32 72 M32 72 l-6 8 M32 72 l8 7 M32 56 C40 56 46 58 54 60 M32 57 C40 60 46 62 60 61" />
            <path d="M18 60 h22 v4 h-22z M20 64 v14 M38 64 v14" />
            {/* rage face: red, veins, screaming */}
            <path d="M14 22 C13 8 22 2 32 2 C44 2 50 10 50 22 C50 36 44 46 32 47 C20 47 15 38 14 22z" fill={RAGE} />
            <path d="M18 12 l9 5 M46 12 l-9 5" strokeWidth={W * 1.6} />
            <path d="M21 18 q4 -3 7 1 M36 19 q3 -4 7 -1" />
            <circle cx={25} cy={19} r={1} fill={INK} stroke="none" />
            <circle cx={39} cy={19} r={1} fill={INK} stroke="none" />
            <path d="M20 26 h24 q0 14 -12 14 q-12 0 -12 -14z" fill="#fff" />
            <path d="M20 26 h24 M20 31.5 h23 M23 37 h18 M26 26 v12 M32 26 v14 M38 26 v12" strokeWidth={W * 0.8} />
            <path d="M44 6 l2 -3 l1 3 l3 -1 l-2 3" strokeWidth={W * 0.9} />
            {/* spit */}
            <g fill="#bfe3ff" strokeWidth={0.7}>
                <circle cx={54} cy={28} r={1.4} />
                <circle cx={58} cy={24} r={1.1} />
                <circle cx={57} cy={32} r={1.2} />
                <circle cx={61} cy={29} r={0.9} />
                <circle cx={52} cy={34} r={0.8} />
            </g>
            <path d="M51 20 l5 -3 M52 26 h5 M51 33 l5 2" strokeWidth={W * 0.8} />
        </g>
    ),
    "this-is-fine": () => (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Flame x={12} y={76} k={1.3} line={1.1} />
            <Flame x={88} y={76} k={1.4} line={1.1} />
            <Flame x={18} y={36} k={0.8} line={1.1} />
            <Flame x={84} y={34} k={0.8} line={1.1} />
            <Body d="M50 46 v20 M50 66 l-6 10 M50 66 l6 10 M50 52 l-10 6 l6 4 M50 52 l10 6 l-4 5" />
            <circle cx={50} cy={28} r={18} fill="#fff" />
            <path d="M40 26 q3 -4 6 0 M54 26 q3 -4 6 0" />
            <path d="M39 33 q11 10 22 0" />
            <rect x={44} y={58} width={9} height={9} rx={1} fill="#fff" />
            <path d="M53 60 q4 0 4 3 q0 3 -4 3" />
            <path d="M46 55 q-1 -2 0 -4 M50 55 q-1 -2 0 -4" strokeWidth={W * 0.7} />
        </g>
    ),
    "donk-bet": () => (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* donkey head, rage style: huge teeth grin */}
            <path d="M26 16 C22 2 26 -4 30 -1 C34 2 33 10 32 16z M54 14 C56 0 62 -4 64 0 C66 4 61 10 58 16z" fill="#fff" />
            <path d="M22 26 C20 12 34 8 44 8 C56 8 66 14 64 28 C63 36 68 40 68 48 C68 58 58 62 46 62 C34 62 22 58 22 48 C22 40 24 36 22 26z" fill="#fff" />
            <path d="M28 22 q5 -3 9 1 M52 22 q5 -4 9 -1" />
            <circle cx={33} cy={24} r={1.2} fill={INK} stroke="none" />
            <circle cx={57} cy={24} r={1.2} fill={INK} stroke="none" />
            <path d="M26 36 C34 52 58 52 66 36 C58 42 34 42 26 36z" fill="#fff" />
            <path d="M30 39.5 v7 M35 41 v8.5 M40 41.8 v9 M46 42 v9.4 M52 41.8 v9 M57 41 v8.5 M62 39.5 v7 M28 43 C36 47 56 47 64 43" strokeWidth={W * 0.8} />
            <ellipse cx={38} cy={33} rx={1.4} ry={2} fill={INK} stroke="none" />
            <ellipse cx={54} cy={33} rx={1.4} ry={2} fill={INK} stroke="none" />
            <Body d="M30 60 C26 66 22 70 16 72 M62 60 C66 66 70 70 76 72" />
            <ChipPile x={46} y={79} k={1.1} line={1} />
            <path d="M8 62 l-5 -2 M8 68 h-6 M92 62 l5 -2 M92 68 h6" />
            <g stroke="none">
                <rect x={70} y={4} width={27} height={12} rx={2} fill="#fff" stroke={INK} strokeWidth={W} />
                <text x={83.5} y={10.5} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', sans-serif" fontWeight={900} fontSize={7.4} fill={INK}>ALL IN</text>
            </g>
        </g>
    ),
    "whale-spotted": () => (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* whale on its chips */}
            <ChipPile x={22} y={74} k={0.95} line={1} />
            <path d="M2 54 C2 38 16 30 30 32 C42 34 46 42 44 52 C43 58 36 62 26 62 C14 62 2 62 2 54z" fill="#bcd4ea" />
            <path d="M44 50 l7 -7 l-1 9 l5 4 l-10 -1z" fill="#bcd4ea" />
            <circle cx={12} cy={44} r={1.2} fill={INK} stroke="none" />
            <path d="M8 50 q4 2 8 0" />
            <path d="M24 30 q-2 -8 -6 -10 M24 30 q2 -8 6 -10" stroke="#5aa9e6" strokeWidth={1.8} />
            {/* OMG face: eyes huge, jaw on the floor */}
            <path d="M64 10 C64 2 74 -2 82 0 C92 2 96 10 95 20 L96 64 C96 74 86 78 80 78 C72 78 66 72 66 62 L64 20z" fill="#fff" />
            <circle cx={73} cy={14} r={5.4} fill="#fff" />
            <circle cx={87} cy={14} r={5.4} fill="#fff" />
            <circle cx={73} cy={14} r={1} fill={INK} stroke="none" />
            <circle cx={87} cy={14} r={1} fill={INK} stroke="none" />
            <path d="M68 6 q5 -4 10 -1 M82 5 q5 -3 10 1" />
            <ellipse cx={80} cy={50} rx={9} ry={22} fill={INK} />
            <path d="M74 66 q6 -6 12 0 q-1 5 -6 5 q-5 0 -6 -5z" fill="#e0727a" stroke="none" />
            {/* pointing arm */}
            <Body d="M64 40 C58 40 54 38 50 36" />
            <path d="M50 36 l-6 -1.6 M50 36 l-2 3" strokeWidth={W * 1.3} />
        </g>
    ),
    "so-over": () => (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M26 10 C26 2 38 -2 50 -2 C64 -2 74 4 74 14 L74 48 C74 64 64 72 50 72 C36 72 26 64 26 48z" fill="#fff" />
            <path d="M34 20 q6 -6 12 -1 M54 19 q6 -5 12 1" />
            <path d="M34 26 q6 4 12 0 M54 26 q6 4 12 0" strokeWidth={W * 1.4} />
            <path d="M36 52 C38 40 62 40 64 52 C62 48 56 46 50 46 C44 46 38 48 36 52z" fill={INK} />
            <path d="M38 52 q2 6 4 0 q2 6 4 0 q2 6 4 0 q2 6 4 0 q2 6 4 0 q2 6 4 0" strokeWidth={W * 0.8} />
            {/* waterfall tears */}
            <g stroke={TEAR} strokeWidth={3.4}>
                <path d="M36 28 C28 34 16 42 10 76" />
                <path d="M64 28 C72 34 84 42 90 76" />
            </g>
            <path d="M4 78 q6 -4 12 0 M84 78 q6 -4 12 0" stroke={TEAR} strokeWidth={2} />
        </g>
    )
};
