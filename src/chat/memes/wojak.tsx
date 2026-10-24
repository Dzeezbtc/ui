import React from "react";
import { ChipPile, Flame } from "./frame";
import { WojakHead } from "./wojakKit";

/**
 * Wojak-style stickers (block52-chat#2): the plain bald meme face and its family
 * — crying wojak, the pointing open-mouthed guy with glasses and a beard, the
 * doomer in a beanie — black line on white, a little pale fill, nothing else.
 * Drawn on the 100×76 art area of the sticker.
 */
const INK = "#151515";
const W = 1.7;
const TEAR = "#5aa9e6";

type Eyes = "plain" | "sad" | "squeeze" | "wide" | "smug";
type Mouth = "flat" | "smile" | "frown" | "cry" | "open" | "grin";

/** The wojak head, centred at (x, y), ~44×52 at k=1. Looks slightly to our left. */
const Head: React.FC<{
    x: number;
    y: number;
    k?: number;
    eyes?: Eyes;
    mouth?: Mouth;
    glasses?: boolean;
    beard?: boolean;
    beanie?: boolean;
    tears?: boolean;
    fill?: string;
}> = ({ x, y, k = 1, eyes = "plain", mouth = "flat", glasses, beard, beanie, tears, fill = "#fdfdfb" }) => (
    <g transform={`translate(${x} ${y}) scale(${k})`} stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* skull + jaw */}
        <path d="M-18 -6 C-19 -24 -6 -30 4 -29 C17 -28 24 -18 23 -4 C22 8 18 16 12 21 C6 26 -6 26 -12 20 C-17 14 -18 6 -18 -6 Z" fill={fill} />
        {/* ear */}
        <path d="M21 -7 C27 -10 29 0 22 4" fill={fill} />
        <path d="M22.5 -4 q2 1.5 0 3.5" strokeWidth={W * 0.6} />
        {beard && (
            <g strokeWidth={W * 0.55}>
                <path d="M-16 6 C-14 18 -6 25 2 25 C10 25 17 17 19 9" strokeWidth={W * 0.9} />
                {[-14, -11, -8, -5, -2, 1, 4, 7, 10, 13, 16].map((bx, i) => (
                    <path key={bx} d={`M${bx} ${10 + Math.abs(bx - 1) * -0.25 + (i % 2) * 1.5} l${(i % 3) - 1} 3`} />
                ))}
                {[-12, -6, 0, 6, 12].map(bx => (
                    <path key={`b${bx}`} d={`M${bx} ${17 + Math.abs(bx) * -0.1} l0.6 2.6`} />
                ))}
            </g>
        )}
        {/* brows */}
        {(eyes === "sad" || eyes === "squeeze") && <path d="M-14 -11 q4 -3 9 0.5 M1 -10 q4 -3.5 9 -1" strokeWidth={W * 0.8} />}
        {eyes === "wide" && <path d="M-14 -14 q4 -3 9 -1 M1 -15 q4 -3 9 0" strokeWidth={W * 0.8} />}
        {eyes === "smug" && <path d="M-14 -10 q4 -1 9 0 M1 -11 q4 -2.5 9 -0.5" strokeWidth={W * 0.8} />}
        {/* eyes */}
        {eyes === "squeeze" ? (
            <path d="M-13 -4 q4 3 8 0 M1 -4 q4 3 8 0" />
        ) : eyes === "wide" ? (
            <>
                <ellipse cx={-9} cy={-5} rx={3.6} ry={3.2} fill="#fff" strokeWidth={W * 0.8} />
                <ellipse cx={5} cy={-5} rx={3.6} ry={3.2} fill="#fff" strokeWidth={W * 0.8} />
                <circle cx={-10} cy={-5} r={1.3} fill={INK} stroke="none" />
                <circle cx={4} cy={-5} r={1.3} fill={INK} stroke="none" />
            </>
        ) : (
            <>
                <path d={eyes === "smug" ? "M-13 -5 q4 -1.5 8 0 M1 -5 q4 -1.5 8 0" : "M-13 -5 q4 -3 8 0 M1 -5 q4 -3 8 0"} />
                <circle cx={-9} cy={-3.4} r={1.35} fill={INK} stroke="none" />
                <circle cx={5} cy={-3.4} r={1.35} fill={INK} stroke="none" />
                <path d="M-12 -0.6 q3 1.6 6 0 M2 -0.6 q3 1.6 6 0" strokeWidth={W * 0.5} />
            </>
        )}
        {glasses && (
            <g strokeWidth={W * 0.75}>
                <circle cx={-9} cy={-4} r={5.4} />
                <circle cx={5} cy={-4} r={5.4} />
                <path d="M-3.6 -4.6 q1.6 -1.2 3.2 0 M10.4 -5 l10 -1.6" />
            </g>
        )}
        {/* nose */}
        <path d="M-2 -1 C-3 4 -5.5 6.5 -3.5 7.5 C-1.5 8.5 1 7.5 1.5 6.5" />
        {/* mouth */}
        {mouth === "flat" && <path d="M-7 13 q4 -1.4 8 0" />}
        {mouth === "smile" && <path d="M-7.5 12 q4 3.4 9 0" />}
        {mouth === "frown" && <path d="M-7 14 q4 -3 8 0" />}
        {mouth === "cry" && <path d="M-8 12.5 q1 -2.6 4.5 -2 q3.5 -0.6 4.5 2 q-1 3.2 -4.5 3.2 q-3.5 0 -4.5 -3.2z" fill={INK} />}
        {mouth === "open" && (
            <g>
                <ellipse cx={-3} cy={12} rx={7.5} ry={6.5} fill={INK} />
                <path d="M-8 15 q5 -4 10 0 q-2 2.4 -5 2.4 q-3 0 -5 -2.4z" fill="#e0727a" stroke="none" />
            </g>
        )}
        {mouth === "grin" && (
            <g>
                <path d="M-11 10 q8 9 17 0 q-8 2.4 -17 0z" fill="#fff" />
                <path d="M-11 10 q8 2.4 17 0 M-7 10.6 v3.6 M-3 11 v4.4 M1 11 v4.2 M4 10.6 v3" strokeWidth={W * 0.6} />
            </g>
        )}
        {/* cheek line */}
        {!beard && <path d="M-15 5 q1 4 3.5 6" strokeWidth={W * 0.5} />}
        {tears && (
            <g stroke={TEAR} strokeWidth={2.6}>
                <path d="M-11 -1 q-2 9 -1 22" />
                <path d="M7 -1 q2 9 1 22" />
            </g>
        )}
        {beanie && (
            <g>
                <path d="M-19 -9 C-20 -28 -6 -34 4 -33 C18 -32 25 -22 23.5 -9 C12 -12 -8 -12 -19 -9z" fill="#2a2a2e" />
                <path d="M-19.5 -9 C-8 -13 12 -13 24 -9 L24 -4 C12 -8 -8 -8 -19.5 -4z" fill="#3a3a40" />
            </g>
        )}
    </g>
);

/** A plain line-art hand with the index finger out, wrist at (x, y), pointing along `rot` degrees. */
const PointHand: React.FC<{ x: number; y: number; rot?: number; k?: number }> = ({ x, y, rot = 180, k = 1 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" fill="#fdfdfb">
        <path d="M0 -4 h8 q2 -0.4 2.6 -2.2 h10 q2.4 0 2.4 2 q0 2 -2.4 2 h-7 q1.6 1 1.4 3 q-0.4 2 -2.6 2.2 q1 1.6 -0.6 3 q-1.4 1 -3 0.4 q0.4 1.8 -1.6 2.4 q-2 0.4 -3 -0.6 h-6z" />
        <path d="M13.4 -2.2 h-3 M13 2.8 h-3 M10.6 5.6 h-2.2" strokeWidth={W * 0.55} />
    </g>
);

export const WOJAK: Record<string, () => React.ReactElement> = {
    "this-is-fine": () => (
        <g>
            <rect x={0} y={0} width={100} height={80} fill="#fff1e0" />
            <Flame x={10} y={74} k={1.25} />
            <Flame x={90} y={74} k={1.35} />
            <Flame x={22} y={30} k={0.8} />
            <Flame x={80} y={28} k={0.75} />
            <Head x={48} y={42} k={1.05} eyes="smug" mouth="smile" />
            {/* coffee mug */}
            <g stroke={INK} strokeWidth={W} strokeLinejoin="round">
                <path d="M62 60 q6 0 6 4 q0 4 -6 4" fill="none" />
                <rect x={50} y={57} width={13} height={14} rx={2} fill="#fdfdfb" />
                <text x={56.5} y={64.5} textAnchor="middle" dominantBaseline="central" fontSize={8} fill={INK} stroke="none" fontFamily="'Arial Unicode MS', sans-serif">{"♠"}</text>
                <path d="M54 54 q-2 -3 0 -5 M59 54 q-2 -3 0 -5" fill="none" strokeWidth={W * 0.6} />
            </g>
        </g>
    ),
    "whale-spotted": () => (
        <g>
            {/* the whale, sitting on its chips, in a top hat */}
            <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round">
                <ChipPile x={24} y={70} k={1} line={1.1} />
                <path d="M2 50 C2 32 18 24 34 26 C46 28 50 38 48 48 C47 56 40 60 30 60 C18 61 3 60 2 50z" fill="#8fb3d6" />
                <path d="M48 46 l8 -8 l-1 10 l5 4 l-11 -1z" fill="#8fb3d6" />
                <path d="M6 52 q20 4 40 -2" fill="none" strokeWidth={W * 0.7} />
                <circle cx={14} cy={40} r={1.6} fill={INK} stroke="none" />
                <path d="M10 46 q4 2 8 0" fill="none" strokeWidth={W * 0.7} />
                <rect x={20} y={12} width={12} height={13} fill="#1d1d1d" />
                <rect x={16} y={24} width={20} height={3} rx={1} fill="#1d1d1d" />
                <path d="M30 22 q2 -6 -2 -10" fill="none" stroke="#8fb3d6" strokeWidth={2} />
            </g>
            {/* the pointing guy */}
            <g transform="translate(76 32) scale(0.82)"><WojakHead who="nerd" face="wow" /></g>
            <path d="M60 80 C62 62 70 56 76 56 C84 56 92 62 94 80" fill="#9aa59a" stroke={INK} strokeWidth={W} />
            <PointHand x={66} y={60} rot={200} k={0.95} />
        </g>
    ),
    "donk-bet": () => (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round">
            {/* donkey head, wojak line style */}
            <path d="M30 22 C27 6 31 -2 35 0 C39 3 38 14 37 22z" fill="#d9d6cf" />
            <path d="M50 20 C52 4 58 -2 61 1 C64 5 59 14 55 22z" fill="#d9d6cf" />
            <path d="M28 30 C26 16 38 12 46 13 C56 14 62 22 61 32 C60 38 64 42 64 50 C64 60 56 64 46 64 C36 64 28 60 28 52 C28 44 30 40 28 30z" fill="#d9d6cf" />
            <path d="M30 44 C32 40 60 40 62 44" fill="none" strokeWidth={W * 0.6} />
            <ellipse cx={38} cy={52} rx={2} ry={2.6} fill={INK} stroke="none" />
            <ellipse cx={54} cy={52} rx={2} ry={2.6} fill={INK} stroke="none" />
            {/* smug eyes */}
            <path d="M34 28 q4 -1.5 8 0 M48 28 q4 -1.5 8 0" fill="none" />
            <circle cx={38} cy={29.6} r={1.4} fill={INK} stroke="none" />
            <circle cx={52} cy={29.6} r={1.4} fill={INK} stroke="none" />
            {/* big teeth grin */}
            <path d="M36 58 q10 6 20 0 v3 q-10 5 -20 0z" fill="#fff" strokeWidth={W * 0.8} />
            <path d="M41 59.6 v3.4 M46 60.4 v3.6 M51 59.6 v3.4" strokeWidth={W * 0.6} />
            {/* hooves shoving the pile */}
            <path d="M30 64 C26 70 22 72 16 72" fill="none" strokeWidth={W * 3.2} stroke="#d9d6cf" />
            <path d="M30 64 C26 70 22 72 16 72" fill="none" strokeWidth={W * 0.6} />
            <ellipse cx={14} cy={72} rx={4} ry={3} fill="#555" />
            <path d="M62 64 C66 70 70 72 76 72" fill="none" strokeWidth={W * 3.2} stroke="#d9d6cf" />
            <path d="M62 64 C66 70 70 72 76 72" fill="none" strokeWidth={W * 0.6} />
            <ellipse cx={78} cy={72} rx={4} ry={3} fill="#555" />
            <ChipPile x={46} y={80} k={1.15} line={1.1} />
            <path d="M8 60 l-5 -2 M8 66 h-6 M90 60 l5 -2 M90 66 h6" fill="none" />
            <g stroke="none">
                <rect x={66} y={6} width={30} height={13} rx={2} fill="#d23c32" stroke={INK} strokeWidth={W} />
                <text x={81} y={13} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', sans-serif" fontWeight={900} fontSize={8} fill="#fff">ALL IN</text>
            </g>
        </g>
    )
};
