import React from "react";
import type { BustProps, StyleKit } from "./scene";
import { HANDS, Obj } from "./scene";
import type { Face, Who } from "./specs";

/**
 * The rubber-hose style kit (block52-chat#2): 1930s cartoon. The cast are
 * poker chips with faces (Chipper and friends, one colour per character) on
 * noodle legs with big shoes, noodle arms and white four-finger gloves;
 * pie-cut eyes; a donkey, whale and fish in the same style. Thick ink on cream.
 */
const INK = "#141414";
const W = 2.2;
const CREAM = "#f6ead0";
const TEAR = "#5aa9e6";

const CHIP: Record<Who, string> = {
    guy: "#c8342b",
    nerd: "#3d6fa8",
    doomer: "#3b3b40",
    chad: "#d9a02a",
    npc: "#9a958c",
    donkey: "#9b958a",
    whale: "#6f8fb0",
    fish: "#e08a3c"
};

const PieEye: React.FC<{ x: number; y: number; rx?: number; ry?: number; look?: number }> = ({ x, y, rx = 2.8, ry = 4.4, look = 0 }) => (
    <g>
        <ellipse cx={x} cy={y} rx={rx + 1.5} ry={ry + 1.6} fill="#fff" stroke={INK} strokeWidth={1.3} />
        <ellipse cx={x + look} cy={y + 1} rx={rx} ry={ry} fill={INK} />
        <path d={`M${x + look} ${y + 1} L${x + look + rx * 0.9} ${y - ry * 0.55} A${rx} ${ry} 0 0 0 ${x + look + rx * 0.15} ${y - ry + 1}z`} fill="#fff" />
    </g>
);

function faceEl(face: Face): React.ReactNode {
    const st = { fill: "none", stroke: INK, strokeWidth: 1.8, strokeLinecap: "round" as const };
    const pies = (look = 0, ry = 4.4) => (
        <>
            <PieEye x={-4.4} y={-4} look={look} ry={ry} />
            <PieEye x={4.4} y={-4} look={look} ry={ry} />
        </>
    );
    let eyes: React.ReactNode;
    let mouth: React.ReactNode;
    switch (face) {
        case "laugh":
        case "calm":
            eyes = <path d="M-8 -3 q3.4 -5 6.8 0 M1.2 -3 q3.4 -5 6.8 0" {...st} />;
            break;
        case "cry":
        case "sleep":
            eyes = <path d="M-8 -5 q3.4 4 6.8 0 M1.2 -5 q3.4 4 6.8 0" {...st} />;
            break;
        case "dizzy":
            eyes = <path d="M-7.5 -7 l5 5 M-2.5 -7 l-5 5 M2.5 -7 l5 5 M7.5 -7 l-5 5" {...st} />;
            break;
        case "love":
            eyes = (
                <g fill="#e8566f" stroke={INK} strokeWidth={1}>
                    <path transform="translate(-4.4 -4)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                    <path transform="translate(4.4 -4)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                </g>
            );
            break;
        case "cool":
            eyes = <path d="M-10 -7 h20 v2 q-1 4 -5 4 q-3 0 -4 -3 h-2 q-1 3 -4 3 q-4 0 -5 -4z" fill={INK} />;
            break;
        case "shock":
        case "wow":
            eyes = (
                <>
                    <PieEye x={-5} y={-5} rx={3.4} ry={5.6} />
                    <PieEye x={5} y={-5} rx={3.4} ry={5.6} />
                </>
            );
            break;
        default:
            eyes = pies(face === "smug" || face === "confused" ? 1 : 0, face === "smug" ? 3 : 4.4);
    }
    const brows =
        face === "rage" || face === "determined"
            ? <path d="M-9 -12 l6 2.4 M9 -12 l-6 2.4" {...st} strokeWidth={2.2} />
            : face === "sad" || face === "nervous" || face === "cry"
              ? <path d="M-9 -10 l6 -2.4 M9 -10 l-6 -2.4" {...st} />
              : face === "smug" || face === "confused"
                ? <path d="M1.6 -12.4 q3 -2.4 6.4 0" {...st} />
                : null;
    switch (face) {
        case "grin":
        case "laugh":
        case "wow":
            mouth = (
                <g stroke={INK} strokeWidth={1.4}>
                    <path d="M-8 4 C-6 13 6 13 8 4 C3 6 -3 6 -8 4z" fill={INK} />
                    <path d="M-3 9.6 C-1 7.8 1 7.8 3 9.6 C1 11 -1 11 -3 9.6z" fill="#e0727a" strokeWidth={0} />
                </g>
            );
            break;
        case "smile":
        case "calm":
        case "love":
            mouth = <path d="M-7 5 q7 7 14 0" {...st} />;
            break;
        case "cry":
        case "shock":
            mouth = <path d="M-5 9 C-5 3 5 3 5 9 C5 12 -5 12 -5 9z" fill={INK} />;
            break;
        case "sad":
            mouth = <path d="M-6 9 q6 -5 12 0" {...st} />;
            break;
        case "rage":
            mouth = (
                <g stroke={INK} strokeWidth={1.2}>
                    <rect x={-7} y={4} width={14} height={6} rx={1.4} fill="#fff" />
                    <path d="M-7 7 h14 M-3.5 4 v6 M0 4 v6 M3.5 4 v6" strokeWidth={0.8} />
                </g>
            );
            break;
        case "smug":
        case "cool":
            mouth = <path d="M-5 7 q6 3 10 -2" {...st} />;
            break;
        case "nervous":
        case "dizzy":
        case "confused":
            mouth = <path d="M-6 7 q1.5 -2 3 0 t3 0 t3 0 t3 0" {...st} strokeWidth={1.5} />;
            break;
        case "sleep":
            mouth = <ellipse cx={0} cy={7} rx={1.6} ry={1.2} fill={INK} />;
            break;
        default:
            mouth = <path d="M-5 7 h10" {...st} />;
    }
    return (
        <g>
            {brows}
            {eyes}
            {mouth}
            {(face === "cry" || face === "laugh") && (
                <g fill="none" stroke={TEAR} strokeWidth={2.4} strokeLinecap="round">
                    <path d="M-7 -1 C-14 -10 -22 -8 -26 2" />
                    <path d="M7 -1 C14 -10 22 -8 26 2" />
                </g>
            )}
            {face === "nervous" && <path d="M12 -14 q-3 4 0 6 q3 -2 0 -6z" fill="#7cc0ee" stroke={INK} strokeWidth={0.9} />}
        </g>
    );
}

const Glove: React.FC<{ x: number; y: number; rot?: number; k?: number; point?: boolean; thumb?: boolean }> = ({ x, y, rot = 0, k = 1, point, thumb }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" fill="#fff">
        <path d="M-4 3 h8 v3 h-8z" />
        {point ? (
            <path d="M-4.5 3 C-6 -1 -5 -5 -2 -5 L-1 -12 C-1 -14 2 -14 2 -12 L2 -5 C5 -5 6 -1 4.5 3z" />
        ) : thumb ? (
            <path d="M-4.5 3 C-6 0 -6 -5 -3 -5 L-3 -11 C-3 -13 0 -13 0 -11 L0 -5 C4 -6 7 -3 4.5 3z" />
        ) : (
            <path d="M-4.5 3 C-7 0 -6 -6 -3 -6 C-3 -9 0 -9 0.5 -7 C1.5 -9.5 4.5 -8.5 4 -5.5 C6.5 -5 7 -1 4.5 3z" />
        )}
        <path d="M-1.5 2 v-3 M1.5 2 v-3" strokeWidth={0.8} />
    </g>
);

const Hose: React.FC<{ d: string; w?: number }> = ({ d, w = 2.8 }) => <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" />;

const Shoe: React.FC<{ x: number; y: number; flip?: boolean }> = ({ x, y, flip }) => (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
        <path d="M-3 0 C-3 -4 4 -5 8 -2 C11 0 10 3 6 3 H-2 C-4 3 -4 1 -3 0z" fill={INK} />
        <path d="M0 -2.4 q3 -1 5 0" stroke="#fff" strokeWidth={0.8} fill="none" />
    </g>
);

const ChipHead: React.FC<{ who: Who; face: Face }> = ({ who, face }) => (
    <g strokeLinejoin="round">
        <circle cx={0} cy={0} r={20} fill={CHIP[who]} stroke={INK} strokeWidth={W} />
        {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={-2.6} y={-19.2} width={5.2} height={5} rx={1} fill={CREAM} transform={`rotate(${i * 45 + 22.5})`} />
        ))}
        <circle cx={0} cy={0} r={14} fill={CREAM} stroke={INK} strokeWidth={1.6} />
        {faceEl(face)}
        {who === "nerd" && (
            <g fill="none" stroke={INK} strokeWidth={1.3}>
                <circle cx={-4.6} cy={-4} r={5.6} />
                <circle cx={4.6} cy={-4} r={5.6} />
            </g>
        )}
        {who === "doomer" && (
            <g stroke={INK} strokeWidth={1.6}>
                <path d="M-15 -12 C-14 -26 14 -26 15 -12 C6 -15 -6 -15 -15 -12z" fill="#2a2a2e" />
                <circle cx={0} cy={-25} r={2.6} fill="#2a2a2e" />
            </g>
        )}
    </g>
);

const DonkeyHead: React.FC<{ face: Face }> = ({ face }) => (
    <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round">
        <path d="M-12 -14 C-16 -28 -12 -34 -8 -31 C-4 -28 -5 -20 -6 -14z M8 -16 C10 -30 16 -34 19 -30 C21 -26 16 -20 13 -14z" fill={CHIP.donkey} />
        <path d="M-18 -6 C-20 -20 -8 -24 2 -24 C14 -24 22 -16 20 -4 C19 4 24 8 24 16 C24 26 14 30 3 30 C-8 30 -18 26 -18 16 C-18 8 -16 4 -18 -6z" fill={CHIP.donkey} />
        <path d="M-14 14 C-12 8 18 8 20 14 C20 26 12 30 3 30 C-6 30 -14 26 -14 14z" fill="#d8c9a8" />
        <g transform="translate(2 -4)">{faceEl(face)}</g>
    </g>
);

const WhaleBody: React.FC<{ face: Face }> = ({ face }) => (
    <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" transform="translate(-26 -16)">
        <path d="M2 56 C2 40 16 32 30 34 C42 36 46 44 44 54 C43 60 36 64 26 64 C14 64 2 64 2 56z" fill={CHIP.whale} />
        <path d="M44 52 l7 -7 l-1 9 l5 4 l-10 -1z" fill={CHIP.whale} />
        <rect x={18} y={20} width={11} height={12} fill={INK} />
        <rect x={14} y={31} width={19} height={3} rx={1} fill={INK} />
        <g transform="translate(16 48) scale(0.7)">{faceEl(face)}</g>
    </g>
);

const FishHead: React.FC<{ face: Face }> = ({ face }) => (
    <g stroke={INK} strokeWidth={W} strokeLinejoin="round">
        <path d="M-22 2 C-22 -18 0 -28 14 -20 C24 -14 26 0 22 10 C18 20 4 26 -8 24 C-18 22 -22 14 -22 2z" fill={CHIP.fish} />
        <path d="M22 6 q4 0 4 3 q-4 2 -5 -1" fill="#e0727a" />
        <g transform="translate(4 0)">{faceEl(face)}</g>
    </g>
);

const HAT_AT: Record<string, [number, number, number]> = {
    "captain-hat": [0, -24, 0.5],
    "chef-hat": [0, -30, 0.5],
    "wizard-hat": [0, -34, 0.54],
    crown: [0, -27, 0.42],
    "hard-hat": [0, -24, 0.52],
    "cowboy-hat": [0, -24, 0.58]
};

export const HoseBust: React.FC<BustProps> = ({ who, face, pose, hat, hold }) => {
    if (who === "whale") return <WhaleBody face={face} />;
    // A full little body: chip head on noodle legs, arms to the pose's hands.
    const hands = HANDS[pose === "none" ? "push" : pose].map(([x, y]) => [x * 0.9, Math.min(y * 0.8, 30)] as [number, number]);
    const [lh, rh] = pose === "none" ? [[-22, 14], [22, 14]] as [number, number][] : hands;
    return (
        <g>
            <Hose d="M-6 18 C-7 26 -9 30 -10 36" />
            <Hose d="M6 18 C7 26 9 30 10 36" />
            <Shoe x={-12} y={37} flip />
            <Shoe x={12} y={37} />
            <Hose d={`M-17 6 Q${(lh[0] - 17) / 2 - 6} ${(lh[1] + 6) / 2 + 6} ${lh[0]} ${lh[1]}`} />
            <Hose d={`M17 6 Q${(rh[0] + 17) / 2 + 6} ${(rh[1] + 6) / 2 + 6} ${rh[0]} ${rh[1]}`} />
            {who === "donkey" ? <DonkeyHead face={face} /> : who === "fish" ? <FishHead face={face} /> : <ChipHead who={who} face={face} />}
            {who === "chad" && face !== "cool" && <path d="M-10 -7 h20 v2 q-1 4 -5 4 q-3 0 -4 -3 h-2 q-1 3 -4 3 q-4 0 -5 -4z" fill={INK} />}
            {hat && <Obj spec={hat} x={HAT_AT[hat][0]} y={HAT_AT[hat][1]} s={HAT_AT[hat][2]} filter={undefined} />}
            {hold && <g transform={`translate(${rh[0]} ${rh[1] - 4})`}>{hold}</g>}
            <Glove x={lh[0]} y={lh[1]} rot={lh[0] < 0 ? -20 : 20} k={0.85} />
            <Glove x={rh[0]} y={rh[1]} rot={pose === "point" ? 80 : 20} k={0.85} point={pose === "point"} thumb={pose === "thumb"} />
        </g>
    );
};

export const HOSE_KIT: StyleKit = {
    ink: INK,
    line: 1.8,
    bg: "transparent",
    propFilter: (
        <>
            <feColorMatrix type="matrix" values="0.85 0.25 0.05 0 0.02  0.2 0.75 0.1 0 0.02  0.15 0.2 0.55 0 0  0 0 0 1 0" />
        </>
    ),
    Bust: HoseBust
};
