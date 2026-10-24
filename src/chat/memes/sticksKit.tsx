import React from "react";
import type { BustProps, StyleKit } from "./scene";
import { HANDS, Obj } from "./scene";
import type { Face, Who } from "./specs";

/**
 * The stick-figure style kit (block52-chat#2), in the round-head webcomic look:
 * white circle heads with oval dot eyes and a mouth line, a block-colour shirt
 * on a stick body, stick arms with no hands, flat pastel backgrounds.
 */
const INK = "#111";
const W = 1.6;
const TEAR = "#5aa9e6";

const SHIRT: Record<Who, string> = {
    guy: "#e05a4f",
    nerd: "#2e9a4e",
    doomer: "#2a2a2e",
    chad: "#3d7fd6",
    npc: "#9a9a9a",
    donkey: "#3d7fd6",
    whale: "#6f8fb0",
    fish: "#e8a33d"
};

const BG: Record<Who, string> = {
    guy: "#ffe2b8",
    nerd: "#d9ecd0",
    doomer: "#e2e2e8",
    chad: "#d6e6f5",
    npc: "#ececec",
    donkey: "#d9ecd0",
    whale: "#d6e6f5",
    fish: "#fde7c8"
};

function faceEl(face: Face): React.ReactNode {
    const eye = (x: number, ry = 1.7, dy = 0) => <ellipse key={x} cx={x} cy={-2 + dy} rx={1.05} ry={ry} fill={INK} stroke="none" />;
    const st = { fill: "none", stroke: INK, strokeWidth: 1.2, strokeLinecap: "round" as const };
    let eyes: React.ReactNode = [eye(-4), eye(4)];
    let mouth: React.ReactNode = <path d="M-3 5 h6" {...st} />;
    switch (face) {
        case "smile":
        case "calm":
        case "love":
            mouth = <path d="M-4 4 q4 3.4 8 0" {...st} />;
            if (face === "calm") eyes = <path d="M-6 -2 q2 -2 4 0 M2 -2 q2 -2 4 0" {...st} />;
            if (face === "love")
                eyes = (
                    <g fill="#e8566f" stroke="none">
                        <path transform="translate(-4 -2.4) scale(0.6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                        <path transform="translate(4 -2.4) scale(0.6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                    </g>
                );
            break;
        case "grin":
        case "laugh":
        case "wow":
            mouth = <path d="M-5 3 h10 q0 5 -5 5 q-5 0 -5 -5z" fill={INK} stroke={INK} strokeWidth={0.8} />;
            if (face === "laugh") eyes = <path d="M-6 -2 q2 -2 4 0 M2 -2 q2 -2 4 0" {...st} />;
            if (face === "wow") eyes = [eye(-4, 2.2), eye(4, 2.2)];
            break;
        case "cry":
            eyes = <path d="M-6 -2 q2 1.6 4 0 M2 -2 q2 1.6 4 0" {...st} />;
            mouth = <path d="M-3.4 7 q3.4 -4 6.8 0" {...st} />;
            break;
        case "sad":
            mouth = <path d="M-3.4 6 q3.4 -3 6.8 0" {...st} />;
            break;
        case "rage":
        case "determined":
            eyes = (
                <>
                    {eye(-4, 1.4, 0.4)}
                    {eye(4, 1.4, 0.4)}
                    <path d="M-7 -6 l5 2 M7 -6 l-5 2" {...st} strokeWidth={1.4} />
                </>
            );
            mouth = face === "rage" ? <path d="M-4 6 q4 -3 8 0z" fill={INK} stroke={INK} strokeWidth={1} /> : <path d="M-3 5 h6" {...st} />;
            break;
        case "shock":
            eyes = [eye(-4, 1, 0), eye(4, 1, 0)];
            mouth = <ellipse cx={0} cy={6} rx={2} ry={2.6} fill={INK} />;
            break;
        case "smug":
        case "cool":
            mouth = <path d="M-3 5 q3 1.6 6 -1.4" {...st} />;
            if (face === "smug") eyes = <path d="M-6 -2 h4 M2 -2 h4" {...st} strokeWidth={1.6} />;
            if (face === "cool") eyes = <path d="M-8 -4 h16 v1 q-1 3.4 -4 3.4 q-3 0 -3.4 -2.4 h-1.2 q-0.4 2.4 -3.4 2.4 q-3 0 -4 -3.4z" fill={INK} />;
            break;
        case "nervous":
        case "confused":
        case "dizzy":
            mouth = <path d="M-4 5 q1 -1.4 2 0 t2 0 t2 0 t2 0" {...st} />;
            if (face === "dizzy") eyes = <path d="M-5.4 -3.4 l2.8 2.8 M-2.6 -3.4 l-2.8 2.8 M2.6 -3.4 l2.8 2.8 M5.4 -3.4 l-2.8 2.8" {...st} />;
            if (face === "confused") eyes = [eye(-4, 1.2), eye(4, 2.2)];
            break;
        case "sleep":
            eyes = <path d="M-6 -2 h4 M2 -2 h4" {...st} />;
            mouth = <ellipse cx={0} cy={5} rx={1} ry={0.8} fill={INK} />;
            break;
    }
    return (
        <g>
            {eyes}
            {mouth}
            {face === "cry" && (
                <g stroke={TEAR} strokeWidth={1.8} fill="none">
                    <path d="M-4 0 v10" />
                    <path d="M4 0 v10" />
                </g>
            )}
            {face === "nervous" && <path d="M9 -9 q-2 3 0 4.4 q2 -1.4 0 -4.4z" fill="#7cc0ee" stroke={INK} strokeWidth={0.7} />}
        </g>
    );
}

const Head: React.FC<{ who: Who; face: Face }> = ({ who, face }) => {
    if (who === "donkey") {
        return (
            <g stroke={INK} strokeWidth={W} strokeLinejoin="round">
                <path d="M-6 -10 C-9 -22 -5 -26 -3 -23 C-1 -20 -2 -14 -3 -10z M5 -10 C8 -22 4 -26 2 -23 C0 -20 1 -14 2 -10z" fill="#bdb6aa" />
                <ellipse cx={0} cy={0} rx={10} ry={12} fill="#bdb6aa" />
                <ellipse cx={0} cy={7} rx={7.4} ry={5} fill="#e4dccd" />
                <ellipse cx={-2.6} cy={7} rx={0.9} ry={1.3} fill={INK} stroke="none" />
                <ellipse cx={2.6} cy={7} rx={0.9} ry={1.3} fill={INK} stroke="none" />
                <g transform="translate(0 -2)">{faceEl(face === "grin" ? "smug" : face)}</g>
            </g>
        );
    }
    if (who === "fish") {
        return (
            <g stroke={INK} strokeWidth={W} strokeLinejoin="round">
                <path d="M-14 0 C-14 -12 0 -18 10 -12 C16 -8 17 2 14 8 C10 14 0 16 -6 14 C-12 12 -14 6 -14 0z" fill="#f2a65a" />
                <g transform="translate(3 0)">{faceEl(face)}</g>
            </g>
        );
    }
    return (
        <g stroke={INK} strokeWidth={W}>
            <circle cx={0} cy={0} r={13} fill={who === "npc" ? "#cfcfcf" : "#fff"} />
            {faceEl(face)}
            {who === "nerd" && (
                <g fill="none" strokeWidth={1.1}>
                    <circle cx={-4} cy={-2} r={3.6} />
                    <circle cx={4} cy={-2} r={3.6} />
                    <path d="M-0.4 -2.4 h0.8" />
                </g>
            )}
            {who === "chad" && face !== "cool" && <path d="M-8 -4 h16 v1 q-1 3.4 -4 3.4 q-3 0 -3.4 -2.4 h-1.2 q-0.4 2.4 -3.4 2.4 q-3 0 -4 -3.4z" fill={INK} />}
            {who === "doomer" && (
                <g>
                    <path d="M-13 -3 C-14 -16 14 -16 13 -3 C6 -6 -6 -6 -13 -3z" fill="#2a2a2e" />
                </g>
            )}
        </g>
    );
};

const HAT_AT: Record<string, [number, number, number]> = {
    "captain-hat": [0, -16, 0.42],
    "chef-hat": [0, -20, 0.42],
    "wizard-hat": [0, -24, 0.46],
    crown: [0, -18, 0.34],
    "hard-hat": [0, -15, 0.42],
    "cowboy-hat": [0, -15, 0.48]
};

export const SticksBust: React.FC<BustProps> = ({ who, face, pose, hat, hold }) => {
    if (who === "whale") {
        return (
            <g stroke={INK} strokeWidth={W} strokeLinejoin="round" transform="translate(-26 -14)">
                <path d="M2 50 C2 32 18 24 34 26 C46 28 50 38 48 48 C47 56 40 60 30 60 C18 61 3 60 2 50z" fill="#6f8fb0" />
                <path d="M48 46 l8 -8 l-1 10 l5 4 l-11 -1z" fill="#6f8fb0" />
                <g transform="translate(16 42)">{faceEl(face)}</g>
                <path d="M24 50 l3 6 l3 -6z" fill="#d23c32" strokeWidth={1} />
            </g>
        );
    }
    // Hands follow the shared pose table, pulled in to stick-figure proportions.
    const [lh, rh] = HANDS[pose].map(([x, y]) => [x * 0.75, 14 + y * 0.6] as [number, number]);
    const showArms = pose !== "none";
    return (
        <g transform="scale(1.25)">
            <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M-3 44 l-3 16 M3 44 l3 16" />
                {showArms ? (
                    <>
                        <path d={`M-7 20 L${lh[0]} ${lh[1]}`} />
                        <path d={`M7 20 L${rh[0]} ${rh[1]}`} />
                    </>
                ) : (
                    <path d="M-7 20 l-6 14 M7 20 l6 14" />
                )}
                <path d="M-9 44 L-8 17 Q0 13 8 17 L9 44 Z" fill={SHIRT[who]} strokeWidth={W * 0.8} />
            </g>
            <Head who={who} face={face} />
            {hat && <Obj spec={hat} x={HAT_AT[hat][0]} y={HAT_AT[hat][1]} s={HAT_AT[hat][2]} />}
            {showArms && hold && <g transform={`translate(${rh[0]} ${rh[1]}) scale(0.8)`}>{hold}</g>}
        </g>
    );
};

/** The stick style uses a flat pastel background tied to who's in it. */
export const sticksBg = (who: Who): string => BG[who];

export const STICKS_KIT: StyleKit = { ink: INK, line: W, bg: "#fde9cf", bgFor: sticksBg, Bust: SticksBust };
