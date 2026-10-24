import React from "react";
import type { BustProps, StyleKit } from "./scene";
import { HANDS, Obj } from "./scene";
import type { Face, Who } from "./specs";

/**
 * The rage-comic style kit (block52-chat#2): big oval faces in thin black line
 * pulling extreme expressions — veins and clenched teeth, the jaw on the floor,
 * waterfall tears — on stick-figure bodies. White ground, colour only where it
 * shouts (the red rage face, blue tears).
 */
const INK = "#111";
const W = 1.3;
const RAGE = "#e8483e";
const TEAR = "#5aa9e6";

/** Face features inside an oval head (rx 19, ry 22) centred at (0, 0). */
function features(face: Face, who: Who): React.ReactNode {
    const dot = (x: number, y: number, r = 1.2) => <circle cx={x} cy={y} r={r} fill={INK} stroke="none" />;
    const shades = (
        <g>
            <path d="M-16 -8 h32 v2 q-1 6 -7 6 q-5 0 -6 -5 h-6 q-1 5 -6 5 q-6 0 -7 -6z" fill={INK} />
            <path d="M-12 -6 l3 -1.4 M4 -6 l3 -1.4" stroke="#fff" strokeWidth={1} />
        </g>
    );
    switch (face) {
        case "rage":
            return (
                <g>
                    <path d="M-15 -14 l10 5 M15 -14 l-10 5" strokeWidth={W * 1.8} />
                    <path d="M-12 -6 q4 -3 7 1 M5 -5 q3 -4 7 -1" />
                    {dot(-8.5, -4.6, 1)}
                    {dot(8.5, -4.6, 1)}
                    <path d="M-13 3 h26 q0 15 -13 15 q-13 0 -13 -15z" fill="#fff" />
                    <path d="M-13 3 h26 M-13 9 h25 M-10 14.5 h20 M-7 3 v13 M0 3 v15 M7 3 v13" strokeWidth={W * 0.8} />
                    <path d="M12 -20 l2 -3 l1 3 l3 -1 l-2 3" strokeWidth={W * 0.9} />
                </g>
            );
        case "grin":
            return (
                <g>
                    <path d="M-14 -8 q6 -4 11 0 M3 -8 q6 -4 11 0" strokeWidth={W * 1.2} />
                    {dot(-8, -6)}
                    {dot(8, -6)}
                    <path d="M-17 0 C-12 18 12 18 17 0 C10 6 -10 6 -17 0z" fill="#fff" />
                    <path d="M-15 4 C-6 9 6 9 15 4 M-11 3.6 v7 M-5.6 5 v8.6 M0 5.4 v9 M5.6 5 v8.6 M11 3.6 v7" strokeWidth={W * 0.7} />
                </g>
            );
        case "laugh":
            return (
                <g>
                    <path d="M-14 -6 q5 -5 10 0 M4 -6 q5 -5 10 0" strokeWidth={W * 1.4} />
                    <ellipse cx={0} cy={9} rx={12} ry={10} fill={INK} />
                    <path d="M-7 15 q7 -6 14 0 q-2 3 -7 3 q-5 0 -7 -3z" fill="#e0727a" stroke="none" />
                    <path d="M-17 -2 q-4 6 -2 12 M17 -2 q4 6 2 12" stroke={TEAR} strokeWidth={2.4} />
                </g>
            );
        case "cry":
            return (
                <g>
                    <path d="M-14 -12 q6 -5 11 -1 M3 -13 q6 -4 11 1" />
                    <path d="M-14 -5 q6 4 11 0 M3 -5 q6 4 11 0" strokeWidth={W * 1.4} />
                    <path d="M-10 13 C-8 4 8 4 10 13 C8 10 4 9 0 9 C-4 9 -8 10 -10 13z" fill={INK} />
                    <g stroke={TEAR} strokeWidth={3}>
                        <path d="M-9 -2 C-16 4 -24 12 -28 40" />
                        <path d="M9 -2 C16 4 24 12 28 40" />
                    </g>
                </g>
            );
        case "sad":
        case "nervous":
            return (
                <g>
                    <path d="M-14 -11 l9 -3 M14 -11 l-9 -3" />
                    {dot(-8, -5)}
                    {dot(8, -5)}
                    {face === "sad" ? <path d="M-7 12 q7 -6 14 0" /> : <path d="M-9 10 q2 -2 4 0 t4 0 t4 0 t4 0" />}
                    {face === "nervous" && <path d="M16 -22 q-4 5 0 8 q4 -3 0 -8z" fill="#7cc0ee" strokeWidth={0.9} />}
                </g>
            );
        case "shock":
        case "wow":
            return (
                <g>
                    <circle cx={-8} cy={-8} r={6} fill="#fff" />
                    <circle cx={8} cy={-8} r={6} fill="#fff" />
                    {dot(-8, -8, 1)}
                    {dot(8, -8, 1)}
                    <path d="M-15 -17 q6 -4 11 -1 M4 -18 q6 -3 11 1" />
                    <ellipse cx={0} cy={11} rx={6} ry={face === "shock" ? 10 : 7} fill={INK} />
                    <path d="M-4 17 q4 -4 8 0 q-1 3 -4 3 q-3 0 -4 -3z" fill="#e0727a" stroke="none" />
                </g>
            );
        case "smug":
            return (
                <g>
                    <path d="M-15 -8 h10 M5 -8 h10" strokeWidth={W * 1.2} />
                    {dot(-9, -6)}
                    {dot(9, -6)}
                    <path d="M-8 8 q9 4 16 -4" strokeWidth={W * 1.3} />
                    <path d="M-15 2 q2 2 5 1 M10 2 q2 2 5 1" stroke="#e8566f" strokeWidth={1} />
                </g>
            );
        case "sleep":
            return (
                <g>
                    <path d="M-14 -5 q6 3 11 0 M3 -5 q6 3 11 0" />
                    <ellipse cx={0} cy={9} rx={2.4} ry={2} fill={INK} />
                </g>
            );
        case "dizzy":
            return (
                <g>
                    <path d="M-12 -9 l6 6 M-6 -9 l-6 6 M6 -9 l6 6 M12 -9 l-6 6" />
                    <path d="M-9 10 q2 -2 4 0 t4 0 t4 0 t4 0" />
                </g>
            );
        case "cool":
            return (
                <g>
                    {shades}
                    <path d="M-6 9 q7 3 12 -2" strokeWidth={W * 1.2} />
                </g>
            );
        case "confused":
            return (
                <g>
                    <circle cx={-8} cy={-6} r={2.4} fill="#fff" />
                    {dot(-8, -6, 1)}
                    <circle cx={8} cy={-7} r={5} fill="#fff" />
                    {dot(8, -7, 1.2)}
                    <path d="M-12 -12 l8 1 M3 -16 q5 -3 10 1" />
                    <path d="M-7 10 q3 -3 6 0 t6 0" />
                </g>
            );
        case "calm":
        case "smile":
        case "love":
            return (
                <g>
                    {face === "love" ? (
                        <g fill="#e8566f" strokeWidth={0.8}>
                            <path transform="translate(-8 -6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                            <path transform="translate(8 -6)" d="M0 3.4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 3.4z" />
                        </g>
                    ) : face === "calm" ? (
                        <path d="M-13 -5 q5 -5 10 0 M3 -5 q5 -5 10 0" strokeWidth={W * 1.2} />
                    ) : (
                        <>
                            {dot(-8, -6)}
                            {dot(8, -6)}
                        </>
                    )}
                    <path d="M-11 5 q11 12 22 0" strokeWidth={W * 1.2} />
                </g>
            );
        case "determined":
            return (
                <g>
                    <path d="M-15 -12 l10 3 M15 -12 l-10 3" strokeWidth={W * 1.6} />
                    {dot(-8, -6)}
                    {dot(8, -6)}
                    <path d="M-7 10 h14" strokeWidth={W * 1.4} />
                </g>
            );
        default:
            return (
                <g>
                    {dot(-8, -6, who === "npc" ? 1.5 : 1.2)}
                    {dot(8, -6, who === "npc" ? 1.5 : 1.2)}
                    <path d="M-6 9 h12" />
                </g>
            );
    }
}

const Head: React.FC<{ who: Who; face: Face }> = ({ who, face }) => {
    const fill = face === "rage" ? RAGE : who === "npc" ? "#c9c9c9" : "#fff";
    if (who === "donkey") {
        return (
            <g>
                <path d="M-14 -16 C-18 -32 -14 -38 -10 -35 C-6 -32 -7 -24 -8 -18z M10 -18 C12 -32 18 -38 20 -34 C22 -30 17 -24 14 -18z" fill="#fff" />
                <path d="M-20 -8 C-22 -22 -8 -26 2 -26 C14 -26 22 -20 20 -6 C19 2 24 6 24 14 C24 24 14 28 2 28 C-10 28 -22 24 -22 14 C-22 6 -20 2 -20 -8z" fill="#fff" />
                <ellipse cx={-6} cy={-1} rx={1.4} ry={2} fill={INK} stroke="none" />
                <ellipse cx={10} cy={-1} rx={1.4} ry={2} fill={INK} stroke="none" />
                <g transform="translate(2 -6) scale(0.8)">{features(face, who)}</g>
            </g>
        );
    }
    if (who === "whale") {
        return (
            <g transform="translate(-26 -16)">
                <path d="M2 54 C2 38 16 30 30 32 C42 34 46 42 44 52 C43 58 36 62 26 62 C14 62 2 62 2 54z" fill="#bcd4ea" />
                <path d="M44 50 l7 -7 l-1 9 l5 4 l-10 -1z" fill="#bcd4ea" />
                <g transform="translate(16 46) scale(0.5)">{features(face, who)}</g>
                <path d="M24 30 q-2 -8 -6 -10 M24 30 q2 -8 6 -10" stroke={TEAR} strokeWidth={1.8} />
            </g>
        );
    }
    if (who === "fish") {
        return (
            <g>
                <path d="M-22 2 C-22 -18 0 -28 14 -20 C24 -14 26 0 22 10 C18 20 4 26 -8 24 C-18 22 -22 14 -22 2z" fill="#f2a65a" />
                <path d="M22 6 q4 0 4 3 q-4 2 -5 -1" fill="#e0727a" />
                <g transform="translate(4 0) scale(0.85)">{features(face, who)}</g>
            </g>
        );
    }
    return (
        <g>
            <path d={who === "chad" ? "M-19 -4 C-19 -18 -10 -24 0 -24 C10 -24 19 -18 19 -4 L17 12 C15 22 8 24 0 24 C-8 24 -15 22 -17 12z" : "M-19 0 C-19 -14 -10 -23 0 -23 C10 -23 19 -14 19 0 C19 14 10 23 0 23 C-10 23 -19 14 -19 0z"} fill={fill} />
            {who === "chad" && <path d="M-19 -8 C-20 -26 10 -32 20 -14 C12 -20 0 -18 -4 -20 C-8 -16 -14 -14 -19 -8z" fill="#e8c262" />}
            {features(face, who)}
            {who === "nerd" && (
                <g strokeWidth={W * 0.8}>
                    <circle cx={-8} cy={-6} r={6.4} />
                    <circle cx={8} cy={-6} r={6.4} />
                    <path d="M-1.6 -6.6 h3.2" />
                    <path d="M-14 12 l-1 3 M-10 16 l-0.6 3 M10 16 l0.6 3 M14 12 l1 3 M-4 19 v3 M4 19 v3" strokeWidth={W * 0.6} />
                </g>
            )}
            {who === "doomer" && (
                <g>
                    <path d="M-20 -6 C-21 -22 -10 -28 0 -28 C10 -28 21 -22 20 -6 C10 -10 -10 -10 -20 -6z" fill="#2a2a2e" />
                    <path d="M-20.5 -6 C-10 -10 10 -10 20.5 -6 V-2 C10 -6 -10 -6 -20.5 -2z" fill="#3a3a40" />
                </g>
            )}
        </g>
    );
};

const HAT_AT: Record<string, [number, number, number]> = {
    "captain-hat": [0, -26, 0.52],
    "chef-hat": [0, -32, 0.52],
    "wizard-hat": [0, -38, 0.56],
    crown: [0, -30, 0.42],
    "hard-hat": [0, -26, 0.54],
    "cowboy-hat": [0, -26, 0.6]
};

export const RageBust: React.FC<BustProps> = ({ who, face, pose, hat, hold }) => {
    if (who === "whale") return <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none"><Head who={who} face={face} /></g>;
    const [lh, rh] = HANDS[pose];
    const neck: [number, number] = [0, 26];
    const sh: [number, number] = [0, 34];
    const showArms = pose !== "none";
    return (
        <g stroke={INK} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M${neck[0]} ${neck[1]} V60`} strokeWidth={W * 1.4} />
            {!showArms && <path d="M0 34 l-10 12 M0 34 l10 12" strokeWidth={W * 1.4} />}
            {showArms && (
                <>
                    <path d={`M${sh[0]} ${sh[1]} Q${lh[0] / 2 - 6} ${(sh[1] + lh[1]) / 2 + 4} ${lh[0]} ${lh[1]}`} strokeWidth={W * 1.4} />
                    <path d={`M${sh[0]} ${sh[1]} Q${rh[0] / 2 + 6} ${(sh[1] + rh[1]) / 2 + 4} ${rh[0]} ${rh[1]}`} strokeWidth={W * 1.4} />
                </>
            )}
            <Head who={who} face={face} />
            {hat && <Obj spec={hat} x={HAT_AT[hat][0]} y={HAT_AT[hat][1]} s={HAT_AT[hat][2]} />}
            {showArms && hold && <g transform={`translate(${rh[0]} ${rh[1]})`}>{hold}</g>}
            {showArms && pose === "point" && <path d={`M${rh[0]} ${rh[1]} l6 -1.4 M${rh[0]} ${rh[1]} l2 3`} strokeWidth={W * 1.4} />}
            {showArms && pose === "thumb" && <path d={`M${rh[0]} ${rh[1]} v-6 M${rh[0] - 3} ${rh[1]} h6`} strokeWidth={W * 1.6} />}
        </g>
    );
};

export const RAGE_KIT: StyleKit = {
    ink: INK,
    line: W,
    bg: "#ffffff",
    propFilter: <feColorMatrix type="saturate" values="0.75" />,
    Bust: RageBust
};
