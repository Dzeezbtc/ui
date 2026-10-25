import React from "react";
import type { BustProps, StyleKit } from "./scene";
import { HANDS, Obj } from "./scene";
import type { Face, Who } from "./specs";

/**
 * The stick-figure style kit (block52-chat#2), in the Cyanide & Happiness-style look:
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

/**
 * Faces in the webcomic's own vocabulary: small tall solid dot eyes, short
 * straight brows, a thin mouth line or a solid black open mouth — no teeth, no
 * tongues, no shading. Extremes come from mouth size and eye shape.
 */
function faceEl(face: Face): React.ReactNode {
    const eye = (x: number, ry = 1.9, dy = 0, rx = 1.05) => <ellipse key={x} cx={x} cy={-2 + dy} rx={rx} ry={ry} fill={INK} stroke="none" />;
    const st = { fill: "none", stroke: INK, strokeWidth: 1.1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    const hole = (d: string) => <path d={d} fill={INK} stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />;
    let eyes: React.ReactNode = [eye(-3.8), eye(3.8)];
    let mouth: React.ReactNode = <path d="M-3 5.4 h6" {...st} />;
    switch (face) {
        case "smile":
            mouth = <path d="M-5.4 3.6 q5.4 4.4 10.8 0" {...st} />;
            break;
        case "calm":
            eyes = <path d="M-5.6 -1.8 q1.8 -1.8 3.6 0 M2 -1.8 q1.8 -1.8 3.6 0" {...st} />;
            mouth = <path d="M-3.6 4.4 q3.6 2.6 7.2 0" {...st} />;
            break;
        case "love":
            mouth = <path d="M-5 3.6 q5 4.6 10 0" {...st} />;
            eyes = (
                <g fill="#e0383e" stroke="none">
                    <path transform="translate(-4 -2.4) scale(0.6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                    <path transform="translate(4 -2.4) scale(0.6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                </g>
            );
            break;
        case "grin":
            // the huge flat-topped black half-moon grin
            mouth = hole("M-8.4 2.2 H8.4 C8.4 9 4 11.4 0 11.4 C-4 11.4 -8.4 9 -8.4 2.2z");
            break;
        case "laugh":
            eyes = <path d="M-5.6 -1.4 l1.8 -1.8 l1.8 1.8 M2 -1.4 l1.8 -1.8 l1.8 1.8" {...st} strokeWidth={1.2} />;
            mouth = hole("M-9 1.4 H9 C9 10 4.4 12.8 0 12.8 C-4.4 12.8 -9 10 -9 1.4z");
            break;
        case "wow":
            eyes = [eye(-3.8, 1.3, -0.6, 1.3), eye(3.8, 1.3, -0.6, 1.3)];
            mouth = hole("M-3.4 7 a3.4 4.4 0 1 0 6.8 0 a3.4 4.4 0 1 0 -6.8 0z");
            break;
        case "shock":
            eyes = [eye(-3.8, 0.8, -1, 0.8), eye(3.8, 0.8, -1, 0.8)];
            mouth = hole("M-4.6 8 a4.6 6 0 1 0 9.2 0 a4.6 6 0 1 0 -9.2 0z");
            break;
        case "cry":
            eyes = <path d="M-6 -1.2 q2 -1.6 4 0 M2 -1.2 q2 -1.6 4 0" {...st} strokeWidth={1.2} />;
            // wailing: wide black mouth, corners pulled down
            mouth = hole("M-7.6 10.4 C-6 3 6 3 7.6 10.4 Q0 8.6 -7.6 10.4z");
            break;
        case "sad":
            eyes = [eye(-3.8, 1.9, 0.6), eye(3.8, 1.9, 0.6), <path key="b" d="M-6 -5.6 l3.6 -1.2 M6 -5.6 l-3.6 -1.2" {...st} />];
            mouth = <path d="M-4 7 q4 -3.4 8 0" {...st} />;
            break;
        case "rage":
            eyes = (
                <>
                    {eye(-3.6, 1.4, 0.6)}
                    {eye(3.6, 1.4, 0.6)}
                    <path d="M-7.2 -6.8 L-1.6 -3.6 M7.2 -6.8 L1.6 -3.6" {...st} strokeWidth={1.5} />
                </>
            );
            // screaming: a wide black mouth, square-ish
            mouth = hole("M-7.4 3 Q0 1.6 7.4 3 L6.4 10.6 Q0 12.4 -6.4 10.6z");
            break;
        case "determined":
            eyes = (
                <>
                    {eye(-3.6, 1.5, 0.6)}
                    {eye(3.6, 1.5, 0.6)}
                    <path d="M-6.6 -6 l4.6 1.8 M6.6 -6 l-4.6 1.8" {...st} strokeWidth={1.3} />
                </>
            );
            mouth = <path d="M-3.6 5.4 h7.2" {...st} />;
            break;
        case "smug":
            // half-lidded: a lid line across the top of each dot
            eyes = (
                <>
                    {eye(-3.8, 1.3, 0.6)}
                    {eye(3.8, 1.3, 0.6)}
                    <path d="M-5.6 -2 h3.6 M2 -2 h3.6" {...st} strokeWidth={1.3} />
                </>
            );
            mouth = <path d="M-3.4 5.6 q4.6 1 7.6 -2.6" {...st} />;
            break;
        case "cool":
            eyes = <path d="M-8 -4 h16 v1 q-1 3.4 -4 3.4 q-3 0 -3.4 -2.4 h-1.2 q-0.4 2.4 -3.4 2.4 q-3 0 -4 -3.4z" fill={INK} />;
            mouth = <path d="M-3.4 5.4 q3.6 1.4 7 -1.6" {...st} />;
            break;
        case "nervous":
            eyes = [eye(-3.8, 1.9, 0, 1.05), eye(3.8, 1.9, 0, 1.05)];
            mouth = <path d="M-5.4 5 l1.8 -1.2 l1.8 1.2 l1.8 -1.2 l1.8 1.2 l1.8 -1.2 l1.8 1.2" {...st} />;
            break;
        case "confused":
            eyes = [eye(-3.8, 1.2, 0.4), eye(3.8, 2.4, -0.4, 1.3)];
            mouth = <path d="M-3.6 5.6 l7.2 -1.6" {...st} />;
            break;
        case "dizzy":
            // dead-eyed: X eyes and a little open mouth
            eyes = <path d="M-5.4 -3.6 l3 3 M-2.4 -3.6 l-3 3 M2.4 -3.6 l3 3 M5.4 -3.6 l-3 3" {...st} strokeWidth={1.2} />;
            mouth = hole("M-1.6 6 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0z");
            break;
        case "sleep":
            eyes = <path d="M-5.6 -1.6 h3.6 M2 -1.6 h3.6" {...st} />;
            mouth = hole("M-1 5.6 a1 1.2 0 1 0 2 0 a1 1.2 0 1 0 -2 0z");
            break;
    }
    return (
        <g>
            {eyes}
            {mouth}
            {face === "cry" && (
                <g stroke={TEAR} strokeWidth={1.4} fill="none" strokeLinecap="round">
                    <path d="M-4 0 v12" />
                    <path d="M4 0 v12" />
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
            <ellipse cx={0} cy={-2} rx={17.6} ry={16} fill={who === "npc" ? "#cfcfcf" : "#fff"} />
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

export const SticksBust: React.FC<BustProps> = ({ who, face, pose, hat, hold, costumed }) => {
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
                {!costumed && <path d="M-9 44 L-8 17 Q0 13 8 17 L9 44 Z" fill={SHIRT[who]} strokeWidth={W * 0.8} />}
            </g>
            <Head who={who} face={face} />
            {hat && <Obj spec={hat} x={HAT_AT[hat][0]} y={HAT_AT[hat][1]} s={HAT_AT[hat][2]} />}
            {showArms && hold && <g transform={`translate(${rh[0]} ${rh[1]}) scale(0.8)`}>{hold}</g>}
        </g>
    );
};

/** The stick style uses a flat pastel background tied to who's in it. */
export const sticksBg = (who: Who): string => BG[who];

export const STICKS_KIT: StyleKit = { ink: INK, line: W, bg: "#fde9cf", bgFor: sticksBg, lookTorso: 0.55, Bust: SticksBust };
