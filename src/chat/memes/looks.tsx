import React from "react";

/**
 * Movie looks (block52-chat#2): costume overlays that dress a meme character as
 * an iconic film look, so a movie line reads instantly — shades and a leather
 * jacket for "I'll be back", a grey wizard's hat, beard and staff for "You shall
 * not pass", and so on. They're our characters in costume, not the actors or
 * the studios' character designs.
 *
 * Drawn in head-local coordinates (head centred at 0,0, radius ~18), on top of
 * the style's character. `torso` says how wide that style's body is (stick
 * figures are narrow, the rubber-hose chip has no torso at all).
 */
export type Look = "terminator" | "wizard" | "warrior" | "clown" | "titan" | "gangster" | "admiral" | "kgb" | "scouter";

const INK = "#151515";

/** Which half of the costume to draw: the body goes under the character's arms, the head bits on top. */
const PartCtx = React.createContext<"body" | "head">("head");
/** Head-side parts (hair, hats, beards, props) — drawn only in the "head" pass. */
const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (React.useContext(PartCtx) === "head" ? <>{children}</> : null);

const Torso: React.FC<{ fill: string; k: number; children?: React.ReactNode; line: number }> = ({ fill, k, children, line }) =>
    React.useContext(PartCtx) !== "body" ? null : (
    <g transform={`scale(${k} 1)`}>
        <path d="M-34 72 C-32 46 -20 34 -7 30 L7 30 C20 34 32 46 34 72Z" fill={fill} stroke={INK} strokeWidth={line} strokeLinejoin="round" />
        {children}
    </g>
);

export const LookOverlay: React.FC<{ look: Look; torso: number; line: number; part: "body" | "head" }> = ({ look, torso, line, part }) => (
    <PartCtx.Provider value={part}>
        <LookParts look={look} torso={torso} line={line} />
    </PartCtx.Provider>
);

const LookParts: React.FC<{ look: Look; torso: number; line: number }> = ({ look, torso, line }) => {
    const hasTorso = torso > 0;
    const st = { stroke: INK, strokeWidth: line, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
    switch (look) {
        case "terminator":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#1d1d1f" k={torso} line={line}>
                            <path d="M-7 30 L-14 44 L-4 40 L0 56 L4 40 L14 44 L7 30" fill="#2c2c30" {...st} />
                            <path d="M-24 50 q4 -4 8 -2 M22 52 q-4 -4 -8 -2" fill="none" stroke="#5a5a60" strokeWidth={line * 0.7} />
                        </Torso>
                    )}
                    <H>
                    <circle cx={6} cy={-4} r={1.6} fill="#ff3b30" />
                    </H>
                </g>
            );
        case "wizard":
            return (
                <g>
                    {hasTorso && <Torso fill="#8d8d93" k={torso} line={line} />}
                    <H>
                    {/* staff */}
                    <path d="M34 -30 V74" stroke="#7a5230" strokeWidth={3.4} strokeLinecap="round" />
                    <path d="M34 -30 V74" stroke={INK} strokeWidth={0.6} />
                    <circle cx={34} cy={-33} r={4.4} fill="#e8f4ff" stroke={INK} strokeWidth={line * 0.8} />
                    <path d="M30 -38 l-3 -3 M38 -38 l3 -3 M34 -40 v-4" stroke="#bfe3ff" strokeWidth={1.4} />
                    {/* long grey beard */}
                    <path d="M-16 8 C-18 28 -6 46 0 56 C6 46 18 28 16 8 C9 16 -8 16 -16 8z" fill="#e4e4e4" {...st} />
                    <path d="M-6 22 q2 10 2 20 M4 22 q-1 10 -3 20" fill="none" stroke="#a9a9a9" strokeWidth={line * 0.6} />
                    {/* grey pointed hat */}
                    <path d="M-26 -14 C-12 -20 14 -20 28 -12 C14 -16 -12 -16 -26 -14z" fill="#8d8d93" {...st} />
                    <path d="M-15 -16 C-8 -32 2 -48 10 -60 C10 -44 14 -28 17 -15z" fill="#8d8d93" {...st} />
                    </H>
                </g>
            );
        case "warrior":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#6b4a2f" k={torso} line={line}>
                            <path d="M-30 46 C-22 30 22 30 30 46 C20 40 -20 40 -30 46z" fill="#cdb48c" {...st} />
                        </Torso>
                    )}
                    <H>
                    {/* long hair and a short beard */}
                    <path d="M-19 -8 C-24 6 -22 20 -16 26 L-12 8z M19 -8 C24 6 22 20 16 26 L12 8z" fill="#6b4a2f" {...st} />
                    <path d="M-14 12 C-12 24 -4 28 0 28 C4 28 12 24 14 12 C8 18 -8 18 -14 12z" fill="#7a5532" {...st} />
                    </H>
                </g>
            );
        case "clown":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#6b3f8f" k={torso} line={line}>
                            <path d="M-7 30 L0 50 L7 30" fill="#5fae5a" {...st} />
                        </Torso>
                    )}
                    <H>
                    {/* green hair, white greasepaint, a smeared red grin */}
                    <path d="M-20 -6 l-6 -8 l7 1 l-3 -9 l7 4 l1 -9 l5 7 l4 -8 l3 8 l6 -6 l-1 9 l7 -3 l-4 8 l6 2 l-6 4z" fill="#5fae5a" {...st} />
                    <ellipse cx={-2} cy={-2} rx={15} ry={14} fill="#ffffff" opacity={0.55} />
                    <path d="M-15 8 C-8 18 6 18 13 6 C8 12 -6 14 -15 8z" fill="#c8232c" opacity={0.85} />
                    <path d="M-12 -8 l-1 6 M3 -8 l1 6" stroke="#2a3f7a" strokeWidth={1.6} opacity={0.7} />
                    </H>
                </g>
            );
        case "titan":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#3e4a8a" k={torso} line={line}>
                            <path d="M-34 50 C-30 38 -20 32 -10 32 L-14 44z M34 50 C30 38 20 32 10 32 L14 44z" fill="#d6a531" {...st} />
                        </Torso>
                    )}
                    <H>
                    {/* purple skin, the ridged chin */}
                    <ellipse cx={1} cy={0} rx={21} ry={25} fill="#8a5fb3" opacity={0.42} style={{ mixBlendMode: "multiply" }} />
                    <path d="M-6 16 v6 M-2 17 v7 M2 17 v7 M6 16 v6" stroke="#4f2f6e" strokeWidth={line * 0.7} />
                    </H>
                </g>
            );
        case "gangster":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#f4f1ea" k={torso} line={line}>
                            <path d="M-7 30 L-12 46 L0 42 L12 46 L7 30" fill="#151515" {...st} />
                            <path d="M-7 30 L0 46 L7 30" fill="#b3212b" stroke="none" />
                        </Torso>
                    )}
                    <H>
                    {/* slicked-back hair */}
                    <path d="M-19 -8 C-20 -28 4 -36 22 -18 C10 -24 -4 -24 -19 -8z" fill="#1d1d1d" {...st} />
                    </H>
                </g>
            );
        case "admiral":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#eeeeee" k={torso} line={line}>
                            <path d="M-20 44 h8 M-20 48 h8" stroke="#d6a531" strokeWidth={2} />
                            <circle cx={0} cy={44} r={1.4} fill="#d6a531" />
                            <circle cx={0} cy={52} r={1.4} fill="#d6a531" />
                        </Torso>
                    )}
                    <H>
                    <path d="M-20 -14 C-18 -26 18 -28 22 -14 C10 -18 -10 -18 -20 -14z" fill="#f4f4f4" {...st} />
                    <path d="M-20 -14 C-8 -10 10 -10 22 -14 L22 -11 C10 -7 -8 -7 -20 -11z" fill="#1d1d1d" {...st} />
                    <circle cx={1} cy={-20} r={2} fill="#d6a531" />
                    </H>
                </g>
            );
        case "kgb":
            return (
                <g>
                    {hasTorso && (
                        <Torso fill="#3d3f6b" k={torso} line={line}>
                            <path d="M-26 48 L-22 72 M26 48 L22 72" stroke="#ffffff" strokeWidth={2} />
                            <path d="M-6 30 L0 42 L6 30" fill="#ffffff" {...st} />
                        </Torso>
                    )}
                    <H>
                    <path d="M-19 -8 C-20 -28 4 -36 22 -18 C10 -24 -4 -24 -19 -8z" fill="#2a2a2a" {...st} />
                    {/* the cookie */}
                    <g transform="translate(-30 20)">
                        <circle r={6} fill="#2b1d16" stroke={INK} strokeWidth={line * 0.8} />
                        <circle r={4.4} fill="#f2ede4" />
                        <circle r={4.4} fill="none" stroke="#2b1d16" strokeWidth={1} strokeDasharray="1 1" />
                    </g>
                    </H>
                </g>
            );
        case "scouter":
            return (
                <g>
                    <H>
                    <rect x={-17} y={-9} width={11} height={9} rx={1.5} fill="#5fd36a" opacity={0.55} stroke={INK} strokeWidth={line * 0.7} />
                    <path d="M-6 -6 h20 v6" fill="none" stroke={INK} strokeWidth={line} />
                    <rect x={12} y={-2} width={6} height={8} rx={1} fill="#c8cbd0" stroke={INK} strokeWidth={line * 0.7} />
                    </H>
                </g>
            );
    }
};

/** How wide each style's body is for the costume (0 = no torso). */
export const LOOK_TORSO: Record<string, number> = { wojak: 1, rage: 0.8, sticks: 0.55, hose: 0 };
