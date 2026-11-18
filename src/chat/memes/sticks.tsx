import React from "react";
import { ChipPile, Flame } from "./frame";

/**
 * Stick-figure stickers (block52-chat#2), in the round-head webcomic style:
 * white circle heads with dot eyes and a mouth line, block-colour shirts on
 * stick bodies, stick arms and legs, flat backgrounds, deadpan-to-dark jokes.
 * Our own gags. 100×76 art area.
 */
const INK = "#111";
const W = 2.1;

const Guy: React.FC<{
    x: number;
    y: number;
    k?: number;
    shirt?: string;
    face?: React.ReactNode;
    arms?: string;
    legs?: string;
    head?: React.ReactNode;
}> = ({ x, y, k = 1, shirt = "#3d7fd6", face, arms = "M-6 -8 l-8 8 M6 -8 l8 8", legs = "M-3 8 l-3 14 M3 8 l3 14", head }) => (
    <g transform={`translate(${x} ${y}) scale(${k})`} stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={legs} />
        <path d={arms} />
        <path d="M-6 8 L-6.4 -6 Q-6.4 -10 0 -10 Q6.4 -10 6.4 -6 L6 8 Z" fill={shirt} />
        {head ?? (
            <>
                <path d="M0 -32 C7.2 -32 10 -26.6 10 -19 C10 -12 7 -9.4 0 -9.4 C-7 -9.4 -10 -12 -10 -19 C-10 -26.6 -7.2 -32 0 -32z" fill="#f8c38f" />
                {face}
            </>
        )}
    </g>
);

const eyes = (dx = 0, dy = 0) => (
    <>
        <ellipse cx={-3.2 + dx} cy={-22 + dy} rx={0.9} ry={1.5} fill={INK} stroke="none" />
        <ellipse cx={3.2 + dx} cy={-22 + dy} rx={0.9} ry={1.5} fill={INK} stroke="none" />
    </>
);

export const STICKS_SET: Record<string, () => React.ReactElement> = {
    "this-is-fine": () => (
        <g>
            <rect className="b52-bg" x={0} y={0} width={100} height={80} fill="#ffe2b8" />
            <Flame x={10} y={76} k={1.3} line={1.2} />
            <Flame x={90} y={76} k={1.3} line={1.2} />
            <Flame x={20} y={30} k={0.8} line={1.2} />
            <Flame x={82} y={28} k={0.8} line={1.2} />
            <path d="M34 60 h30 M38 60 v16 M60 60 v16 M34 60 v-16" stroke={INK} strokeWidth={W} fill="#a0703f" />
            <Guy
                x={50}
                y={46}
                k={1.35}
                shirt="#e05a4f"
                arms="M-6 -6 l-4 8 l6 2 M6 -6 l4 8 l-4 3"
                legs="M-3 8 l8 2 l0 10 M3 8 l8 2 l0 10"
                face={
                    <>
                        {eyes()}
                        <path d="M-4 -17 q4 3 8 0" stroke={INK} strokeWidth={1.2} />
                    </>
                }
            />
            <g stroke={INK} strokeWidth={W}>
                <rect x={56} y={46} width={8} height={9} rx={1} fill="#fff" />
                <path d="M64 48 q3 0 3 2.5 q0 2.5 -3 2.5" fill="none" />
            </g>
        </g>
    ),
    "donk-bet": () => (
        <g>
            <rect className="b52-bg" x={0} y={0} width={100} height={80} fill="#fff" />
            <ChipPile x={50} y={78} k={1.1} line={1} />
            <Guy
                x={50}
                y={44}
                k={1.4}
                shirt="#3d7fd6"
                arms="M-6 -6 C-12 0 -14 8 -10 14 M6 -6 C12 0 14 8 10 14"
                legs=""
                head={
                    <g>
                        {/* donkey head on a stick body */}
                        <path d="M-6 -28 C-9 -40 -5 -44 -3 -41 C-1 -38 -2 -32 -3 -28z M5 -28 C8 -40 4 -44 2 -41 C0 -38 1 -32 2 -28z" fill="#bdb6aa" />
                        <ellipse cx={0} cy={-20} rx={9} ry={11} fill="#bdb6aa" />
                        <ellipse cx={0} cy={-13} rx={7} ry={5} fill="#e4dccd" />
                        <ellipse cx={-2.6} cy={-13} rx={0.9} ry={1.3} fill={INK} stroke="none" />
                        <ellipse cx={2.6} cy={-13} rx={0.9} ry={1.3} fill={INK} stroke="none" />
                        <ellipse cx={-3.2} cy={-23} rx={0.9} ry={1.5} fill={INK} stroke="none" />
                        <ellipse cx={3.2} cy={-23} rx={0.9} ry={1.5} fill={INK} stroke="none" />
                        <path d="M-4 -9.6 q4 2 8 0" strokeWidth={1.1} />
                    </g>
                }
            />
            <g stroke={INK} strokeWidth={1.4}>
                <rect x={66} y={6} width={30} height={13} rx={2} fill="#fff" />
            </g>
            <text x={81} y={13} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', sans-serif" fontWeight={900} fontSize={8} fill={INK}>ALL IN</text>
            <path d="M14 66 l-6 -2 M14 72 h-7 M86 66 l6 -2 M86 72 h7" stroke={INK} strokeWidth={1.4} />
        </g>
    ),
    "whale-spotted": () => (
        <g>
            <rect className="b52-bg" x={0} y={0} width={100} height={80} fill="#fff" />
            {/* the whale, in a shirt and tie, at a table, with all the chips */}
            <path d="M0 62 h62" stroke={INK} strokeWidth={W} />
            <ChipPile x={30} y={62} k={0.95} line={1} />
            <path d="M6 44 C6 22 20 14 34 16 C48 18 54 28 52 40 C51 48 44 52 32 52 C18 52 6 52 6 44z" fill="#6f8fb0" stroke={INK} strokeWidth={W} />
            <path d="M52 38 l7 -7 l-1 9 l5 4 l-10 -1z" fill="#6f8fb0" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
            <ellipse cx={16} cy={30} rx={0.9} ry={1.5} fill={INK} />
            <path d="M12 38 q4 2 8 0" stroke={INK} strokeWidth={1.2} fill="none" />
            <path d="M24 46 l3 6 l3 -6z" fill="#d23c32" stroke={INK} strokeWidth={1} />
            {/* the guy with binoculars */}
            <Guy
                x={80}
                y={50}
                k={1.25}
                shirt="#2e9a4e"
                arms="M-6 -6 l-6 -10 M6 -6 l-8 -10"
                face={
                    <>
                        <g stroke={INK} strokeWidth={1.2}>
                            <rect x={-10} y={-26} width={8} height={7} rx={2} fill="#333" />
                            <rect x={-2} y={-26} width={8} height={7} rx={2} fill="#333" />
                        </g>
                        <ellipse cx={0} cy={-14} rx={2} ry={2.6} fill={INK} stroke="none" />
                    </>
                }
            />
            <path d="M62 14 l-4 -3 M60 22 h-5" stroke={INK} strokeWidth={1.2} />
        </g>
    ),
    "so-over": () => (
        <g>
            <rect className="b52-bg" x={0} y={0} width={100} height={80} fill="#fff" />
            <path d="M0 66 h100" stroke={INK} strokeWidth={W} />
            {/* face-down on the floor, one chip left */}
            <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M22 64 L60 62 L62 52 Q44 48 24 54 Z" fill="#8a5bb5" strokeWidth={W * 0.8} />
                <path d="M60 60 l14 -2 l10 4 M60 56 l14 0 l12 -4" />
                <path d="M24 56 l-6 -8 M24 62 l-10 2" />
                <circle cx={14} cy={58} r={9} fill="#fff" />
                <ellipse cx={8} cy={60} rx={0.9} ry={1.5} fill={INK} stroke="none" transform="rotate(80 8 60)" />
                <path d="M8 64 q3 2 7 1" strokeWidth={1.1} />
            </g>
            <path d="M2 66 q8 4 18 0" stroke="#5aa9e6" strokeWidth={2.4} fill="none" />
            <g transform="translate(88 60)" stroke={INK} strokeWidth={1}>
                <rect x={-4.5} y={-1.6} width={9} height={2.4} fill="#d23c32" />
                <ellipse cx={0} cy={-1.6} rx={4.5} ry={1.6} fill="#d23c32" />
            </g>
            <text x={70} y={20} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8} fill="#555">*sigh*</text>
        </g>
    )
};
