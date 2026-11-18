import React from "react";
import { ChipPile, Flame } from "./frame";

/**
 * Rubber-hose stickers (block52-chat#2): 1930s cartoon energy — pie-cut eyes,
 * white four-finger gloves, noodle arms and legs, big shoes, eyes popping out on
 * springs, fountain tears. The star is our own character, Chipper: a poker chip
 * with arms and legs. Thick black ink on an aged cream card. 100×76 art area.
 */
const INK = "#141414";
const W = 2.2;
const RED = "#c8342b";
const CREAM = "#f6ead0";

/** A pie-cut eye: black oval with a wedge of white cut out. */
const PieEye: React.FC<{ x: number; y: number; rx?: number; ry?: number; look?: number }> = ({ x, y, rx = 3.2, ry = 5, look = 0 }) => (
    <g>
        <ellipse cx={x} cy={y} rx={rx + 1.6} ry={ry + 1.8} fill="#fff" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={x + look} cy={y + 1} rx={rx} ry={ry} fill={INK} />
        <path d={`M${x + look} ${y + 1} L${x + look + rx * 0.9} ${y - ry * 0.55} A${rx} ${ry} 0 0 0 ${x + look + rx * 0.15} ${y - ry + 1}z`} fill="#fff" />
    </g>
);

/** A white cartoon glove at (x, y). */
const Glove: React.FC<{ x: number; y: number; rot?: number; k?: number; point?: boolean }> = ({ x, y, rot = 0, k = 1, point }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" fill="#fff">
        <path d="M-4 3 h8 v3 h-8z" />
        {point ? (
            <path d="M-4.5 3 C-6 -1 -5 -5 -2 -5 L-1 -12 C-1 -14 2 -14 2 -12 L2 -5 C5 -5 6 -1 4.5 3z" />
        ) : (
            <path d="M-4.5 3 C-7 0 -6 -6 -3 -6 C-3 -9 0 -9 0.5 -7 C1.5 -9.5 4.5 -8.5 4 -5.5 C6.5 -5 7 -1 4.5 3z" />
        )}
        <path d="M-1.5 2 v-3 M1.5 2 v-3" strokeWidth={0.8} />
    </g>
);

/** A noodle limb: thick black hose. */
const Hose: React.FC<{ d: string; w?: number }> = ({ d, w = 2.8 }) => <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" />;

const Shoe: React.FC<{ x: number; y: number; flip?: boolean }> = ({ x, y, flip }) => (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
        <path d="M-3 0 C-3 -4 4 -5 8 -2 C11 0 10 3 6 3 H-2 C-4 3 -4 1 -3 0z" fill={INK} />
        <path d="M0 -2.4 q3 -1 5 0" stroke="#fff" strokeWidth={0.8} fill="none" />
    </g>
);

/** Chipper, the chip mascot, centred at (x, y). */
const Chipper: React.FC<{
    x: number;
    y: number;
    k?: number;
    eyes?: "pie" | "happy" | "pop" | "cry";
    mouth?: "grin" | "smile" | "drop" | "wail";
    arms?: React.ReactNode;
    legs?: boolean;
}> = ({ x, y, k = 1, eyes = "pie", mouth = "grin", arms, legs = true }) => (
    <g transform={`translate(${x} ${y}) scale(${k})`} strokeLinejoin="round">
        {legs && (
            <>
                <Hose d="M-6 18 C-7 24 -9 26 -10 30" />
                <Hose d="M6 18 C7 24 9 26 10 30" />
                <Shoe x={-12} y={31} flip />
                <Shoe x={12} y={31} />
            </>
        )}
        {arms}
        <circle cx={0} cy={0} r={20} fill={RED} stroke={INK} strokeWidth={W} />
        {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={-2.6} y={-19.2} width={5.2} height={5} rx={1} fill={CREAM} transform={`rotate(${i * 45 + 22.5})`} />
        ))}
        <circle cx={0} cy={0} r={14} fill={CREAM} stroke={INK} strokeWidth={1.6} />
        {eyes === "pie" && (
            <>
                <PieEye x={-4.6} y={-4} />
                <PieEye x={4.6} y={-4} />
            </>
        )}
        {eyes === "happy" && <path d="M-8 -3 q3.4 -5 6.8 0 M1.2 -3 q3.4 -5 6.8 0" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />}
        {eyes === "cry" && <path d="M-8 -5 q3.4 4 6.8 0 M1.2 -5 q3.4 4 6.8 0" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />}
        {mouth === "grin" && (
            <g stroke={INK} strokeWidth={1.4}>
                <path d="M-8 4 C-6 13 6 13 8 4 C3 6 -3 6 -8 4z" fill={INK} />
                <path d="M-3 9.6 C-1 7.8 1 7.8 3 9.6 C1 11 -1 11 -3 9.6z" fill="#e0727a" strokeWidth={0} />
            </g>
        )}
        {mouth === "smile" && <path d="M-7 5 q7 7 14 0" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />}
        {mouth === "wail" && <path d="M-6 9 C-6 2 6 2 6 9 C6 12 -6 12 -6 9z" fill={INK} stroke={INK} strokeWidth={1.2} />}
    </g>
);

export const HOSE_SET: Record<string, () => React.ReactElement> = {
    "this-is-fine": () => (
        <g>
            <Flame x={10} y={76} k={1.4} line={1.8} outer="#e8742a" inner="#f6c64a" />
            <Flame x={90} y={76} k={1.5} line={1.8} outer="#e8742a" inner="#f6c64a" />
            <Flame x={16} y={34} k={0.9} line={1.8} outer="#e8742a" inner="#f6c64a" />
            <Flame x={86} y={30} k={0.8} line={1.8} outer="#e8742a" inner="#f6c64a" />
            <Chipper
                x={50}
                y={36}
                k={1.2}
                eyes="happy"
                mouth="smile"
                arms={
                    <>
                        <Hose d="M-18 6 C-24 10 -22 18 -14 20" />
                        <Hose d="M18 6 C24 10 22 18 14 20" />
                        <g transform="translate(0 21)" stroke={INK} strokeWidth={1.6}>
                            <path d="M-7 -3 h14 l-2 8 h-10z" fill="#fff" />
                            <path d="M7 -1 q4 0 4 3 q0 3 -4 2" fill="none" />
                            <path d="M-2 -6 q-1 -2 0 -4 M2 -6 q-1 -2 0 -4" fill="none" strokeWidth={1} />
                        </g>
                        <Glove x={-12} y={20} rot={70} k={0.8} />
                        <Glove x={12} y={20} rot={-70} k={0.8} />
                    </>
                }
            />
        </g>
    ),
    "donk-bet": () => (
        <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round">
            {/* rubber-hose donkey kicking the whole pile in */}
            <path d="M30 14 C26 0 30 -6 34 -3 C38 0 37 8 36 14z M50 12 C52 -2 58 -6 61 -2 C63 2 58 8 55 14z" fill="#9b958a" />
            <path d="M24 26 C22 12 34 8 44 8 C56 8 64 16 62 28 C61 36 66 40 66 48 C66 58 56 62 45 62 C34 62 24 58 24 48 C24 40 26 36 24 26z" fill="#9b958a" />
            <path d="M28 46 C30 40 60 40 62 46 C62 58 54 62 45 62 C36 62 28 58 28 46z" fill="#d8c9a8" />
            <PieEye x={36} y={26} rx={2.8} ry={4.4} look={1} />
            <PieEye x={52} y={26} rx={2.8} ry={4.4} look={1} />
            <path d="M32 50 C38 58 52 58 58 50 C52 52 38 52 32 50z" fill="#fff" strokeWidth={1.4} />
            <path d="M38 51.6 v4 M45 52.4 v4.6 M52 51.6 v4" strokeWidth={1} />
            <Hose d="M28 60 C22 66 18 68 12 68" w={3.4} />
            <Glove x={10} y={68} rot={90} k={0.9} />
            <Hose d="M62 60 C68 66 72 68 76 66" w={3.4} />
            <Glove x={78} y={65} rot={-80} k={0.9} />
            <ChipPile x={45} y={80} k={1.15} line={1.4} cols={["#c8342b", "#3d6fa8", "#3f8a4e", "#e3a92b", "#6b4b8f"]} />
            <g fill="none" strokeWidth={1.6}>
                <path d="M8 56 l-5 -3 M6 62 h-5 M92 54 l5 -3 M94 60 h5" />
            </g>
            {[[20, 40], [70, 34], [84, 46]].map(([cx, cy]) => (
                <g key={cx} transform={`translate(${cx} ${cy}) rotate(${cx})`}>
                    <ellipse cx={0} cy={0} rx={4.5} ry={2} fill="#e3a92b" strokeWidth={1.2} />
                </g>
            ))}
        </g>
    ),
    "whale-spotted": () => (
        <g>
            <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round">
                <ChipPile x={22} y={76} k={0.95} line={1.4} cols={["#c8342b", "#3d6fa8", "#3f8a4e", "#e3a92b", "#6b4b8f"]} />
                <path d="M2 56 C2 40 16 32 30 34 C42 36 46 44 44 54 C43 60 36 64 26 64 C14 64 2 64 2 56z" fill="#6f8fb0" />
                <path d="M44 52 l7 -7 l-1 9 l5 4 l-10 -1z" fill="#6f8fb0" />
                <path d="M6 58 q18 4 36 -2" fill="none" strokeWidth={1.4} />
                <rect x={18} y={20} width={11} height={12} fill={INK} />
                <rect x={14} y={31} width={19} height={3} rx={1} fill={INK} />
            </g>
            <PieEye x={12} y={46} rx={2} ry={3} />
            {/* eyes popping out on springs */}
            <Chipper
                x={74}
                y={48}
                k={0.9}
                eyes="pop"
                mouth="wail"
                arms={
                    <>
                        <Hose d="M-18 4 C-24 0 -26 -6 -24 -12" />
                        <Hose d="M18 4 C24 0 26 -6 24 -12" />
                        <Glove x={-24} y={-14} rot={-20} k={0.85} />
                        <Glove x={24} y={-14} rot={20} k={0.85} />
                    </>
                }
            />
            <g stroke={INK} strokeWidth={1.4} fill="none">
                <path d="M69 44 l-3 -3 l3 -3 l-3 -3 l3 -3 l-3 -3" />
                <path d="M79 44 l3 -3 l-3 -3 l3 -3 l-3 -3 l3 -3" />
            </g>
            <PieEye x={64} y={20} rx={4.4} ry={6.4} look={-2} />
            <PieEye x={84} y={20} rx={4.4} ry={6.4} look={-2} />
            <path d="M60 8 l-3 -4 M88 8 l3 -4 M74 4 v-4" stroke={INK} strokeWidth={1.6} />
        </g>
    ),
    "so-over": () => (
        <g>
            {/* melted into a puddle, crying fountains */}
            <path d="M8 74 C8 64 26 62 50 62 C74 62 92 64 92 74z" fill={RED} stroke={INK} strokeWidth={W} />
            <Chipper x={50} y={50} k={1.05} eyes="cry" mouth="wail" legs={false} />
            <g fill="none" stroke="#5aa9e6" strokeWidth={3} strokeLinecap="round">
                <path d="M42 44 C34 26 20 22 10 34" />
                <path d="M58 44 C66 26 80 22 90 34" />
            </g>
            <g fill="#5aa9e6" stroke={INK} strokeWidth={1}>
                <circle cx={9} cy={38} r={2.2} />
                <circle cx={14} cy={44} r={1.6} />
                <circle cx={91} cy={38} r={2.2} />
                <circle cx={86} cy={44} r={1.6} />
            </g>
        </g>
    )
};
