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

/** Teeth: a row of uneven rectangles across a mouth, with gaps and one wonky tooth. */
const teethRow = (x0: number, x1: number, y: number, h: number, seed: number, gap = true) => {
    const n = Math.max(3, Math.round((x1 - x0) / 2.2));
    const w = (x1 - x0) / n;
    return Array.from({ length: n }, (_, i) => {
        if (gap && (i + seed) % 5 === 2) return null; // a missing tooth
        const hh = h * (0.75 + (((i * 7 + seed) % 4) * 0.1));
        const tilt = (i + seed) % 4 === 1 ? 8 : (i + seed) % 4 === 3 ? -6 : 0;
        const x = x0 + i * w;
        return <rect key={i} x={x + 0.15} y={y} width={w - 0.3} height={hh} fill={(i + seed) % 7 === 4 ? "#f3e2a0" : "#fff"} stroke={INK} strokeWidth={0.45} transform={`rotate(${tilt} ${x + w / 2} ${y})`} />;
    });
};

function faceEl(face: Face): React.ReactNode {
    const eye = (x: number, ry = 1.7, dy = 0, rx = 1.05) => <ellipse key={x} cx={x} cy={-2 + dy} rx={rx} ry={ry} fill={INK} stroke="none" />;
    const st = { fill: "none", stroke: INK, strokeWidth: 1.2, strokeLinecap: "round" as const };
    let eyes: React.ReactNode = [eye(-4), eye(4)];
    let mouth: React.ReactNode = <path d="M-3 5 q2 0.6 6 -0.4" {...st} />;
    switch (face) {
        case "smile":
        case "calm":
            // crooked half-smile, one corner hitched up
            mouth = <path d="M-5 4.4 q3.6 3.6 9 -1.6" {...st} />;
            if (face === "calm") eyes = <path d="M-6 -2 q2 -2 4 0 M2 -2 q2 -2 4 0" {...st} />;
            break;
        case "love":
            mouth = <path d="M-5 4 q5 4.6 10 0" {...st} />;
            eyes = (
                <g fill="#e8566f" stroke="none">
                    <path transform="translate(-4 -2.4) scale(0.6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                    <path transform="translate(4 -2.4) scale(0.6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                </g>
            );
            break;
        case "grin":
            // the too-wide, gappy, lopsided grin
            eyes = [eye(-4.4, 1.5, 0.4), eye(4.4, 2, -0.4)];
            mouth = (
                <g>
                    <path d="M-9 2 C-6 5 4 5.6 9.6 0.4 C8 7.6 2 10 -2 10 C-6 10 -9 7 -9 2z" fill="#3a1414" stroke={INK} strokeWidth={0.9} />
                    {teethRow(-8, 8, 2.4, 2.6, 1)}
                    {teethRow(-5, 4, 7.4, -2, 3, false)}
                </g>
            );
            break;
        case "laugh":
            eyes = <path d="M-6.4 -2 q2.2 -2.4 4.4 0 M2 -2 q2.2 -2.4 4.4 0" {...st} strokeWidth={1.4} />;
            mouth = (
                <g>
                    <path d="M-8 2 h16 C8 10 3 12.6 0 12.6 C-3 12.6 -8 10 -8 2z" fill="#3a1414" stroke={INK} strokeWidth={0.9} />
                    {teethRow(-7.4, 7.4, 2.2, 2.4, 2)}
                    <path d="M-3.4 10.6 q3.4 -3 6.8 0 q-1.6 2 -3.4 2 q-1.8 0 -3.4 -2z" fill="#e0727a" stroke="none" />
                </g>
            );
            break;
        case "wow":
        case "shock":
            eyes = face === "shock" ? [eye(-4, 0.9, 0, 0.9), eye(4, 0.9, 0, 0.9)] : [eye(-4, 2.4, 0, 1.4), eye(4, 2.4, 0, 1.4)];
            mouth = (
                <g>
                    <path d="M-5 3 C-5 0 5 0 5 3 L5.6 10 C5.6 14 -5.6 14 -5.6 10z" fill="#3a1414" stroke={INK} strokeWidth={0.9} />
                    {teethRow(-4.4, 4.6, 1.4, 1.8, 4, false)}
                </g>
            );
            break;
        case "cry":
            eyes = <path d="M-6.4 -1.6 q2.2 1.8 4.4 0 M2 -1.6 q2.2 1.8 4.4 0" {...st} strokeWidth={1.4} />;
            mouth = (
                <g>
                    <path d="M-7 8 C-7 2 7 2 7 8 C6 11 -6 11 -7 8z" fill="#3a1414" stroke={INK} strokeWidth={0.9} />
                    {teethRow(-5.6, 5.6, 3.2, 1.8, 0)}
                </g>
            );
            break;
        case "sad":
            mouth = <path d="M-4.4 6.6 q2 -2.6 4.4 -2 q2.6 0.2 4 2.6" {...st} />;
            eyes = [eye(-4, 1.7, 0.4), eye(4, 1.7, 0.4), <path key="b" d="M-6.4 -5.4 l3.4 -1.4 M6.4 -5.4 l-3.4 -1.4" {...st} />];
            break;
        case "rage":
            eyes = (
                <>
                    {eye(-4, 1.2, 0.4)}
                    {eye(4, 1.2, 0.4)}
                    <path d="M-7.4 -6.6 l5.4 2.4 M7.4 -6.6 l-5.4 2.4" {...st} strokeWidth={1.6} />
                </>
            );
            // bared, gritted, crooked teeth
            mouth = (
                <g>
                    <rect x={-7.4} y={2.6} width={14.8} height={6} rx={1.4} fill="#c95b52" stroke={INK} strokeWidth={0.9} />
                    {teethRow(-6.8, 6.8, 3, 2.4, 3)}
                    {teethRow(-6.8, 6.8, 8.2, -2.4, 1)}
                </g>
            );
            break;
        case "determined":
            eyes = (
                <>
                    {eye(-4, 1.4, 0.4)}
                    {eye(4, 1.4, 0.4)}
                    <path d="M-7 -6 l5 2 M7 -6 l-5 2" {...st} strokeWidth={1.4} />
                </>
            );
            mouth = <path d="M-4 5.4 h7 l1.4 -0.8" {...st} />;
            break;
        case "smug":
            eyes = <path d="M-6 -2 h4 M2 -2.6 h4" {...st} strokeWidth={1.6} />;
            // crooked smirk with one tooth poking out
            mouth = (
                <g>
                    <path d="M-4 5.6 q4 1.6 8 -2.4" {...st} />
                    <rect x={1.2} y={4.4} width={1.6} height={1.8} fill="#fff" stroke={INK} strokeWidth={0.45} transform="rotate(-20 2 5)" />
                </g>
            );
            break;
        case "cool":
            eyes = <path d="M-8 -4 h16 v1 q-1 3.4 -4 3.4 q-3 0 -3.4 -2.4 h-1.2 q-0.4 2.4 -3.4 2.4 q-3 0 -4 -3.4z" fill={INK} />;
            mouth = <path d="M-4 5.4 q4 1.6 8 -2" {...st} />;
            break;
        case "nervous":
            eyes = [eye(-4.6, 1.7, 0, 1.05), eye(3.4, 1.7, 0, 1.05)];
            // wobbly grimace with buck teeth
            mouth = (
                <g>
                    <path d="M-6 4.6 q1.5 -1.6 3 0 t3 0 t3 0 t3 0" {...st} />
                    <rect x={-1.6} y={4.2} width={1.6} height={2.2} fill="#fff" stroke={INK} strokeWidth={0.45} />
                    <rect x={0.2} y={4.2} width={1.6} height={2.6} fill="#fff" stroke={INK} strokeWidth={0.45} transform="rotate(8 1 4.2)" />
                </g>
            );
            break;
        case "confused":
            eyes = [eye(-4, 1.2), eye(4, 2.4, -0.4, 1.3)];
            mouth = <path d="M-4 5.6 q1 -1.6 2.4 0 t2.4 0 l3 -1.4" {...st} />;
            break;
        case "dizzy":
            eyes = <path d="M-5.4 -3.4 l2.8 2.8 M-2.6 -3.4 l-2.8 2.8 M2.6 -3.4 l2.8 2.8 M5.4 -3.4 l-2.8 2.8" {...st} />;
            mouth = (
                <g>
                    <path d="M-4 5 q1 -1.4 2 0 t2 0 t2 0 t2 0" {...st} />
                    <path d="M2 5.4 q0.6 3 2 3.6" stroke="#e0727a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
                </g>
            );
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
                    <path d="M-4.6 0 q-1 6 0 12" />
                    <path d="M4.6 0 q1 6 0 12" />
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
            <circle cx={0} cy={-2} r={16.5} fill={who === "npc" ? "#cfcfcf" : "#fff"} />
            <g transform="translate(0 -1) scale(1.32)">{faceEl(face)}</g>
            {who === "nerd" && (
                <g fill="none" strokeWidth={1.1} transform="translate(0 -1) scale(1.32)">
                    <circle cx={-4} cy={-2} r={3.6} />
                    <circle cx={4} cy={-2} r={3.6} />
                    <path d="M-0.4 -2.4 h0.8" />
                </g>
            )}
            {who === "chad" && face !== "cool" && <path transform="translate(0 -1) scale(1.32)" d="M-8 -4 h16 v1 q-1 3.4 -4 3.4 q-3 0 -3.4 -2.4 h-1.2 q-0.4 2.4 -3.4 2.4 q-3 0 -4 -3.4z" fill={INK} />}
            {who === "doomer" && (
                <g>
                    <path d="M-16.5 -4 C-18 -22 18 -22 16.5 -4 C8 -8 -8 -8 -16.5 -4z" fill="#2a2a2e" />
                </g>
            )}
        </g>
    );
};

const HAT_AT: Record<string, [number, number, number]> = {
    "captain-hat": [0, -20, 0.5],
    "chef-hat": [0, -25, 0.5],
    "wizard-hat": [0, -29, 0.54],
    crown: [0, -22, 0.4],
    "hard-hat": [0, -19, 0.5],
    "cowboy-hat": [0, -19, 0.56]
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
