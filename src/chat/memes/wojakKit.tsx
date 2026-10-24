import React from "react";
import type { BustProps, StyleKit } from "./scene";
import { HANDS, Obj, SHOULDERS } from "./scene";
import type { Face, Who } from "./specs";

/**
 * The Wojak style kit (block52-chat#2): the bald meme face and its family —
 * plain wojak, the bearded pointing guy in glasses, the doomer in a beanie,
 * the blond chad, the grey NPC — plus a donkey, a whale and a fish drawn the
 * same way. Black line, pale fills.
 */
const INK = "#151515";
const W = 1.7;
const PALE = "#fdfdfb";
const TEAR = "#5aa9e6";

type EyeKind = "plain" | "sad" | "squeeze" | "wide" | "smug" | "closed" | "happy" | "x" | "heart" | "shades" | "angry" | "dots";
type MouthKind = "flat" | "smile" | "frown" | "cry" | "open" | "grin" | "smirk" | "wobble" | "teeth" | "small";

const FACE: Record<Face, { eyes: EyeKind; mouth: MouthKind; tears?: boolean; flush?: boolean }> = {
    neutral: { eyes: "plain", mouth: "flat" },
    smile: { eyes: "plain", mouth: "smile" },
    grin: { eyes: "smug", mouth: "grin" },
    laugh: { eyes: "squeeze", mouth: "open", tears: true },
    cry: { eyes: "squeeze", mouth: "cry", tears: true },
    sad: { eyes: "sad", mouth: "frown" },
    rage: { eyes: "angry", mouth: "teeth", flush: true },
    shock: { eyes: "wide", mouth: "open" },
    smug: { eyes: "smug", mouth: "smirk" },
    nervous: { eyes: "sad", mouth: "wobble" },
    sleep: { eyes: "closed", mouth: "small" },
    dizzy: { eyes: "x", mouth: "wobble" },
    cool: { eyes: "shades", mouth: "smirk" },
    confused: { eyes: "plain", mouth: "wobble" },
    calm: { eyes: "happy", mouth: "smile" },
    determined: { eyes: "angry", mouth: "flat" },
    love: { eyes: "heart", mouth: "smile" },
    wow: { eyes: "wide", mouth: "open" }
};

/** Eyes at (-9, -4) and (5, -4); mouth around (-3, 12): the wojak 3/4 face. */
function eyesEl(e: EyeKind, face: Face): React.ReactNode {
    const pupils = (dy = 0, r = 1.35) => (
        <>
            <circle cx={-9} cy={-3.4 + dy} r={r} fill={INK} stroke="none" />
            <circle cx={5} cy={-3.4 + dy} r={r} fill={INK} stroke="none" />
        </>
    );
    const bags = <path d="M-12 -0.6 q3 1.6 6 0 M2 -0.6 q3 1.6 6 0" strokeWidth={W * 0.5} />;
    const brows =
        e === "sad" || e === "squeeze"
            ? <path d="M-14 -11 q4 -3 9 0.5 M1 -10 q4 -3.5 9 -1" strokeWidth={W * 0.8} />
            : e === "angry"
              ? <path d="M-14 -12 l9 3 M10 -12 l-9 3" strokeWidth={W} />
              : e === "wide"
                ? <path d="M-14 -14 q4 -3 9 -1 M1 -15 q4 -3 9 0" strokeWidth={W * 0.8} />
                : e === "smug"
                  ? <path d="M-14 -10 q4 -1 9 0 M1 -11 q4 -2.5 9 -0.5" strokeWidth={W * 0.8} />
                  : face === "confused"
                    ? <path d="M-14 -9 l9 0.5 M1 -12 q4 -3 9 0" strokeWidth={W * 0.8} />
                    : null;
    let eyes: React.ReactNode;
    switch (e) {
        case "squeeze":
            eyes = <path d="M-13 -4 q4 3 8 0 M1 -4 q4 3 8 0" />;
            break;
        case "closed":
            eyes = <path d="M-13 -3 q4 2 8 0 M1 -3 q4 2 8 0" />;
            break;
        case "happy":
            eyes = <path d="M-13 -2 q4 -4 8 0 M1 -2 q4 -4 8 0" />;
            break;
        case "x":
            eyes = <path d="M-11.5 -6 l5 5 M-6.5 -6 l-5 5 M2.5 -6 l5 5 M7.5 -6 l-5 5" />;
            break;
        case "heart":
            eyes = (
                <g fill="#e8566f" strokeWidth={W * 0.6}>
                    <path transform="translate(-9 -3.5)" d="M0 3 C-5 -1 -3 -5 0 -2.4 C3 -5 5 -1 0 3z" />
                    <path transform="translate(5 -3.5)" d="M0 3 C-5 -1 -3 -5 0 -2.4 C3 -5 5 -1 0 3z" />
                </g>
            );
            break;
        case "shades":
            eyes = (
                <g fill={INK}>
                    <path d="M-16 -7 h30 v2 q-1 5 -6 5 q-4 0 -5 -4 h-3 q-1 4 -5 4 q-5 0 -6 -5z" strokeWidth={W * 0.6} />
                    <path d="M-12 -5 l3 -1.4 M3 -5 l3 -1.4" stroke="#fff" strokeWidth={1} />
                </g>
            );
            break;
        case "wide":
            eyes = (
                <>
                    <ellipse cx={-9} cy={-5} rx={3.6} ry={3.2} fill="#fff" strokeWidth={W * 0.8} />
                    <ellipse cx={5} cy={-5} rx={3.6} ry={3.2} fill="#fff" strokeWidth={W * 0.8} />
                    <circle cx={-10} cy={-5} r={1.3} fill={INK} stroke="none" />
                    <circle cx={4} cy={-5} r={1.3} fill={INK} stroke="none" />
                </>
            );
            break;
        case "dots":
            eyes = pupils(-1, 1.5);
            break;
        default:
            eyes = (
                <>
                    <path d={e === "smug" ? "M-13 -5 q4 -1.5 8 0 M1 -5 q4 -1.5 8 0" : "M-13 -5 q4 -3 8 0 M1 -5 q4 -3 8 0"} />
                    {pupils()}
                    {bags}
                </>
            );
    }
    return (
        <>
            {brows}
            {eyes}
        </>
    );
}

function mouthEl(m: MouthKind): React.ReactNode {
    switch (m) {
        case "smile":
            return <path d="M-7.5 12 q4 3.4 9 0" />;
        case "frown":
            return <path d="M-7 14 q4 -3 8 0" />;
        case "cry":
            return <path d="M-8 12.5 q1 -2.6 4.5 -2 q3.5 -0.6 4.5 2 q-1 3.2 -4.5 3.2 q-3.5 0 -4.5 -3.2z" fill={INK} />;
        case "open":
            return (
                <g>
                    <ellipse cx={-3} cy={12} rx={7.5} ry={6.5} fill={INK} />
                    <path d="M-8 15 q5 -4 10 0 q-2 2.4 -5 2.4 q-3 0 -5 -2.4z" fill="#e0727a" stroke="none" />
                </g>
            );
        case "grin":
            return (
                <g>
                    <path d="M-11 10 q8 9 17 0 q-8 2.4 -17 0z" fill="#fff" />
                    <path d="M-11 10 q8 2.4 17 0 M-7 10.6 v3.6 M-3 11 v4.4 M1 11 v4.2 M4 10.6 v3" strokeWidth={W * 0.6} />
                </g>
            );
        case "teeth":
            return (
                <g>
                    <rect x={-10} y={9} width={15} height={7} rx={1.5} fill="#fff" />
                    <path d="M-10 12.5 h15 M-6 9 v7 M-2.5 9 v7 M1 9 v7" strokeWidth={W * 0.55} />
                </g>
            );
        case "smirk":
            return <path d="M-7 13 q5 1 9 -2.4" />;
        case "wobble":
            return <path d="M-8 13 q1.4 -1.6 2.8 0 t2.8 0 t2.8 0 t2.8 0" strokeWidth={W * 0.8} />;
        case "small":
            return <ellipse cx={-3} cy={12.5} rx={1.6} ry={1.2} fill={INK} />;
        default:
            return <path d="M-7 13 q4 -1.4 8 0" />;
    }
}

/** The 3/4 wojak head at (0, 0). */
export const WojakHead: React.FC<{ who: Who; face: Face }> = ({ who, face }) => {
    const f = FACE[face];
    const fill = who === "npc" ? "#c9c9c9" : f.flush ? "#f4b3a6" : PALE;
    const eyes = who === "npc" && f.eyes === "plain" ? "dots" : f.eyes;
    return (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            {who === "chad" ? (
                <path d="M-18 -6 C-19 -24 -6 -30 4 -29 C17 -28 24 -18 23 -4 C23 8 21 18 16 24 C10 30 -8 30 -14 22 C-18 16 -18 6 -18 -6 Z" fill={fill} />
            ) : (
                <path d="M-18 -6 C-19 -24 -6 -30 4 -29 C17 -28 24 -18 23 -4 C22 8 18 16 12 21 C6 26 -6 26 -12 20 C-17 14 -18 6 -18 -6 Z" fill={fill} />
            )}
            <path d="M21 -7 C27 -10 29 0 22 4" fill={fill} />
            <path d="M22.5 -4 q2 1.5 0 3.5" strokeWidth={W * 0.6} />
            {who === "nerd" && (
                <g strokeWidth={W * 0.55}>
                    <path d="M-16 6 C-14 18 -6 25 2 25 C10 25 17 17 19 9" strokeWidth={W * 0.9} />
                    {[-14, -11, -8, -5, -2, 1, 4, 7, 10, 13, 16].map((bx, i) => (
                        <path key={bx} d={`M${bx} ${10 + Math.abs(bx - 1) * -0.25 + (i % 2) * 1.5} l${(i % 3) - 1} 3`} />
                    ))}
                </g>
            )}
            {who === "chad" && (
                <g>
                    <path d="M-19 -10 C-22 -30 6 -38 22 -22 C14 -26 4 -22 -2 -24 C-8 -20 -14 -18 -19 -10z" fill="#e8c262" />
                    <path d="M-12 22 q14 6 26 -2" strokeWidth={W * 0.6} strokeDasharray="1 1.6" />
                </g>
            )}
            {eyesEl(eyes, face)}
            {who === "nerd" && (
                <g strokeWidth={W * 0.75}>
                    <circle cx={-9} cy={-4} r={5.4} />
                    <circle cx={5} cy={-4} r={5.4} />
                    <path d="M-3.6 -4.6 q1.6 -1.2 3.2 0 M10.4 -5 l10 -1.6" />
                </g>
            )}
            {who === "npc" ? <path d="M-2 -1 L-5 7 H1" /> : <path d="M-2 -1 C-3 4 -5.5 6.5 -3.5 7.5 C-1.5 8.5 1 7.5 1.5 6.5" />}
            {mouthEl(f.mouth)}
            {who !== "nerd" && <path d="M-15 5 q1 4 3.5 6" strokeWidth={W * 0.5} />}
            {f.tears && (
                <g stroke={TEAR} strokeWidth={2.6}>
                    <path d="M-11 -1 q-2 9 -1 22" />
                    <path d="M7 -1 q2 9 1 22" />
                </g>
            )}
            {face === "nervous" && <path d="M14 -18 q-3 4 0 6 q3 -2 0 -6z" fill="#7cc0ee" strokeWidth={0.9} />}
            {who === "doomer" && (
                <g>
                    <path d="M-19 -9 C-20 -28 -6 -34 4 -33 C18 -32 25 -22 23.5 -9 C12 -12 -8 -12 -19 -9z" fill="#2a2a2e" />
                    <path d="M-19.5 -9 C-8 -13 12 -13 24 -9 L24 -4 C12 -8 -8 -8 -19.5 -4z" fill="#3a3a40" />
                </g>
            )}
        </g>
    );
};

const DonkeyHead: React.FC<{ face: Face }> = ({ face }) => {
    const f = FACE[face];
    return (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(-46 -36)">
            <path d="M30 22 C27 6 31 -2 35 0 C39 3 38 14 37 22z" fill="#d9d6cf" />
            <path d="M50 20 C52 4 58 -2 61 1 C64 5 59 14 55 22z" fill="#d9d6cf" />
            <path d="M28 30 C26 16 38 12 46 13 C56 14 62 22 61 32 C60 38 64 42 64 50 C64 60 56 64 46 64 C36 64 28 60 28 52 C28 44 30 40 28 30z" fill="#d9d6cf" />
            <path d="M30 44 C32 40 60 40 62 44" strokeWidth={W * 0.6} />
            <ellipse cx={38} cy={52} rx={2} ry={2.6} fill={INK} stroke="none" />
            <ellipse cx={54} cy={52} rx={2} ry={2.6} fill={INK} stroke="none" />
            <g transform="translate(49 32)">{eyesEl(f.eyes, face)}</g>
            {f.mouth === "grin" || f.mouth === "smile" || f.mouth === "smirk" ? (
                <>
                    <path d="M36 58 q10 6 20 0 v3 q-10 5 -20 0z" fill="#fff" strokeWidth={W * 0.8} />
                    <path d="M41 59.6 v3.4 M46 60.4 v3.6 M51 59.6 v3.4" strokeWidth={W * 0.6} />
                </>
            ) : (
                <g transform="translate(49 47)">{mouthEl(f.mouth)}</g>
            )}
        </g>
    );
};

const WhaleBody: React.FC<{ face: Face }> = ({ face }) => (
    <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" fill="none" transform="translate(-26 -14)">
        <path d="M2 50 C2 32 18 24 34 26 C46 28 50 38 48 48 C47 56 40 60 30 60 C18 61 3 60 2 50z" fill="#8fb3d6" />
        <path d="M48 46 l8 -8 l-1 10 l5 4 l-11 -1z" fill="#8fb3d6" />
        <path d="M6 52 q20 4 40 -2" strokeWidth={W * 0.7} />
        <g transform="translate(18 42) scale(0.7)">{eyesEl(FACE[face].eyes, face)}</g>
        <g transform="translate(18 40) scale(0.7)">{mouthEl(FACE[face].mouth)}</g>
        <rect x={20} y={12} width={12} height={13} fill="#1d1d1d" />
        <rect x={16} y={24} width={20} height={3} rx={1} fill="#1d1d1d" />
    </g>
);

const FishHead: React.FC<{ face: Face }> = ({ face }) => (
    <g stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" fill="none">
        <path d="M-20 4 C-20 -18 0 -28 14 -20 C24 -14 26 0 22 10 C18 20 4 26 -8 24 C-16 22 -20 14 -20 4z" fill="#f2a65a" />
        <path d="M-4 -24 q6 -10 14 -4" fill="#f2a65a" />
        <path d="M22 6 q4 0 4 3 q-4 2 -5 -1" fill="#e0727a" />
        <path d="M-12 -4 q4 6 0 12 M-6 -4 q4 6 0 12" strokeWidth={W * 0.5} />
        <g transform="translate(8 2)">{eyesEl(FACE[face].eyes, face)}</g>
    </g>
);

/** A line-art hand at (x, y). */
const Hand: React.FC<{ x: number; y: number; kind?: "fist" | "point" | "thumb" | "open"; rot?: number }> = ({ x, y, kind = "open", rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" fill={PALE}>
        {kind === "point" ? (
            <>
                <path d="M-5 -4 h6 l9 -1 q2.4 0 2.4 2 q0 2 -2.4 2 h-6 l0.6 4 q-0.4 2.4 -3 2.4 h-6 q-3 0 -3 -5z" />
                <path d="M2 1 h-3 M1 4 h-3" strokeWidth={W * 0.5} />
            </>
        ) : kind === "thumb" ? (
            <>
                <path d="M-5 -2 q0 -3 3 -3 l1 -6 q0.4 -2.4 2.4 -2 q2 0.6 1.6 3 l-1 5 h5 q2.6 0 2.4 2.6 l-1 8 q-0.4 2 -2.6 2 h-8 q-3 0 -3 -3z" />
                <path d="M3 0 h5 M3 3.6 h4.6" strokeWidth={W * 0.5} />
            </>
        ) : (
            <>
                <ellipse cx={0} cy={0} rx={5.4} ry={5} />
                <path d="M-2 -3 v3 M1 -3.4 v3.4 M4 -2.6 v2.6" strokeWidth={W * 0.5} />
            </>
        )}
    </g>
);

const SHIRT: Record<Who, string> = {
    guy: "#ffffff",
    nerd: "#a8b5a4",
    doomer: "#26262b",
    chad: "#222222",
    npc: "#bdbdbd",
    donkey: "#8fb0d8",
    whale: "#8fb3d6",
    fish: "#d9d1c4"
};

const HAT_AT: Record<string, [number, number, number]> = {
    "captain-hat": [0, -30, 0.5],
    "chef-hat": [0, -36, 0.5],
    "wizard-hat": [0, -42, 0.55],
    crown: [0, -34, 0.42],
    "hard-hat": [0, -30, 0.52],
    "cowboy-hat": [0, -30, 0.6]
};

export const WojakBust: React.FC<BustProps> = ({ who, face, pose, hat, hold }) => {
    if (who === "whale") return <WhaleBody face={face} />;
    const [lh, rh] = HANDS[pose];
    const [ls, rs] = SHOULDERS;
    const sleeve = SHIRT[who];
    const arm = (s: [number, number], h: [number, number]) => {
        const d = `M${s[0]} ${s[1]} Q${(s[0] + h[0]) / 2 + (h[0] > 0 ? 8 : -8)} ${(s[1] + h[1]) / 2 + 6} ${h[0]} ${h[1]}`;
        return (
            <>
                <path d={d} fill="none" stroke={INK} strokeWidth={9.4} strokeLinecap="round" />
                <path d={d} fill="none" stroke={sleeve} strokeWidth={6.6} strokeLinecap="round" />
            </>
        );
    };
    const showArms = pose !== "none";
    const rightKind = pose === "point" ? "point" : pose === "thumb" ? "thumb" : "open";
    return (
        <g>
            <path d="M-36 70 C-34 44 -22 33 -7 29 L7 29 C22 33 34 44 36 70Z" fill={sleeve} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
            {who === "doomer" && <path d="M-8 29 q8 8 16 0" fill="none" stroke="#555" strokeWidth={W} />}
            {who === "donkey" ? <DonkeyHead face={face} /> : who === "fish" ? <FishHead face={face} /> : <WojakHead who={who} face={face} />}
            {hat && <Obj spec={hat} x={HAT_AT[hat][0]} y={HAT_AT[hat][1]} s={HAT_AT[hat][2]} />}
            {showArms && (
                <>
                    {arm(ls, lh)}
                    {arm(rs, rh)}
                    {hold && <g transform={`translate(${rh[0]} ${rh[1]})`}>{hold}</g>}
                    <Hand x={lh[0]} y={lh[1]} rot={pose === "up" ? -20 : 0} />
                    <Hand x={rh[0]} y={rh[1]} kind={rightKind} rot={pose === "point" ? -10 : pose === "up" ? 20 : 0} />
                </>
            )}
        </g>
    );
};

export const WOJAK_KIT: StyleKit = { ink: INK, line: W, bg: "#ffffff", Bust: WojakBust };
