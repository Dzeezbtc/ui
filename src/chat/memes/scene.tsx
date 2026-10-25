import React from "react";
import { ArtLayers } from "../art/Art";
import { ChipPile, Flame } from "./frame";
import type { Face, Fx, Hat, MemeSpec, Pose, Who } from "./specs";
import { LookOverlay } from "./looks";

/**
 * Lays out a meme sticker from its plan (specs.ts) in a given style. The style
 * supplies the character (head, face, body, arms); the layout, objects and
 * effects are shared so every style tells the same joke.
 *
 * Characters are drawn in local coordinates with the head centred at (0, 0),
 * head radius ~18, body running down past the bottom of the panel. Hands sit at
 * {@link HANDS} for each pose.
 */
export interface BustProps {
    who: Who;
    face: Face;
    pose: Pose;
    hat?: Hat;
    hold?: React.ReactNode;
    /** wearing a movie costume: the style skips its own shirt so the costume shows */
    costumed?: boolean;
}

export interface StyleKit {
    ink: string;
    line: number;
    bg: string;
    /** a per-character background (stick figures use flat pastels) */
    bgFor?: (who: Who) => string;
    /** an SVG filter for borrowed objects, so they sit in the style (sepia, greyscale…) */
    propFilter?: React.ReactNode;
    /** how wide this style's body is for costumes (0 = no torso) */
    lookTorso: number;
    Bust: React.FC<BustProps>;
}

/** Where each hand is for a pose: [left, right] in head-local coordinates. */
export const HANDS: Record<Pose, [[number, number], [number, number]]> = {
    none: [[-22, 54], [22, 54]],
    point: [[-22, 54], [34, 6]],
    up: [[-30, -20], [30, -20]],
    hold: [[-22, 54], [28, 14]],
    shrug: [[-34, 18], [34, 18]],
    facepalm: [[-22, 54], [4, -2]],
    pray: [[-2, 30], [2, 30]],
    push: [[-16, 44], [16, 44]],
    clap: [[-3, 30], [3, 30]],
    salute: [[-22, 54], [14, -16]],
    thumb: [[-22, 54], [26, 24]],
    chin: [[-22, 54], [4, 22]],
    cheeks: [[-17, 8], [17, 8]]
};

/** Shoulders, for drawing arms. */
export const SHOULDERS: [[number, number], [number, number]] = [[-17, 30], [17, 30]];

/** A borrowed Chip Crew object, centred at (x, y), `s` = scale of its 64 grid. */
export const Obj: React.FC<{ spec: string; x: number; y: number; s?: number; filter?: string; rot?: number }> = ({ spec, x, y, s = 0.5, filter, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-32 -32)`} filter={filter ? `url(#${filter})` : undefined}>
        <ArtLayers spec={spec} />
    </g>
);

const Drop: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -4 q-3 4 -3 6 a3 3 0 0 0 6 0 q0 -2 -3 -6z" fill="#7cc0ee" stroke="#111" strokeWidth={0.9} />
);

function fxBack(fx: Fx[], cx: number): React.ReactNode {
    return (
        <>
            {fx.includes("spotlight") && <path d={`M${cx - 6} -4 L${cx - 30} 82 H${cx + 30} L${cx + 6} -4z`} fill="#fff6b0" opacity={0.75} />}
            {fx.includes("flames") && (
                <>
                    <Flame x={10} y={78} k={1.3} />
                    <Flame x={90} y={78} k={1.35} />
                    <Flame x={14} y={34} k={0.75} />
                    <Flame x={87} y={30} k={0.7} />
                </>
            )}
        </>
    );
}

function fxFront(fx: Fx[], cx: number, ink: string, line: number): React.ReactNode {
    const st = { stroke: ink, strokeWidth: line, fill: "none", strokeLinecap: "round" as const };
    return (
        <>
            {fx.includes("rain") && (
                <g>
                    <path d={`M${cx - 18} 10 a6 6 0 0 1 4 -9 a8 8 0 0 1 15 -2 a6 6 0 0 1 9 6 a5 5 0 0 1 -2 9 h-22 a4 4 0 0 1 -4 -4z`} fill="#9aa3ad" stroke={ink} strokeWidth={line} />
                    {[-12, -4, 4, 12].map(dx => (
                        <path key={dx} d={`M${cx + dx} 18 l-1.5 5`} stroke="#5aa9e6" strokeWidth={1.6} strokeLinecap="round" />
                    ))}
                </g>
            )}
            {fx.includes("sweat") && <Drop x={cx + 22} y={14} s={1.2} />}
            {fx.includes("steam") && (
                <g fill="#fff" stroke={ink} strokeWidth={line * 0.8}>
                    <path d={`M${cx - 30} 18 a4 4 0 0 1 3 -6 a5 5 0 0 1 8 1 a4 4 0 0 1 -1 7 h-7 a3 3 0 0 1 -3 -2z`} />
                    <path d={`M${cx + 20} 14 a4 4 0 0 1 3 -6 a5 5 0 0 1 8 1 a4 4 0 0 1 -1 7 h-7 a3 3 0 0 1 -3 -2z`} />
                </g>
            )}
            {fx.includes("zzz") && (
                <g fill={ink} fontFamily="'Arial Black', sans-serif" fontWeight={900}>
                    <text x={cx + 20} y={16} fontSize={7}>z</text>
                    <text x={cx + 25} y={10} fontSize={9}>z</text>
                    <text x={cx + 31} y={4} fontSize={11}>Z</text>
                </g>
            )}
            {fx.includes("question") && (
                <g fill="#f2b632" stroke={ink} strokeWidth={line * 0.7} fontFamily="'Arial Black', sans-serif" fontWeight={900}>
                    <text x={cx - 30} y={16} fontSize={14} paintOrder="stroke">?</text>
                    <text x={cx + 22} y={12} fontSize={17} paintOrder="stroke">?</text>
                </g>
            )}
            {fx.includes("sparkles") && (
                <g fill="#ffd23f" stroke={ink} strokeWidth={line * 0.6}>
                    {[[cx - 30, 10, 1.3], [cx + 30, 8, 1.1], [cx + 34, 40, 0.9], [cx - 34, 44, 0.8]].map(([x, y, s]) => (
                        <path key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -5 Q1 -1 5 0 Q1 1 0 5 Q-1 1 -5 0 Q-1 -1 0 -5z" />
                    ))}
                </g>
            )}
            {fx.includes("stars") && (
                <g fill="#ffd23f" stroke={ink} strokeWidth={line * 0.6}>
                    {[-14, 0, 14].map((dx, i) => (
                        <path key={dx} transform={`translate(${cx + dx} ${8 - (i === 1 ? 4 : 0)})`} d="M0 -3.4 L1 -1 L3.4 -0.8 L1.6 0.8 L2 3.2 L0 2 L-2 3.2 L-1.6 0.8 L-3.4 -0.8 L-1 -1z" />
                    ))}
                </g>
            )}
            {fx.includes("hearts") && (
                <g fill="#e8566f" stroke={ink} strokeWidth={line * 0.6}>
                    {[[cx - 28, 14], [cx + 28, 10], [cx + 30, 34]].map(([x, y]) => (
                        <path key={`${x}${y}`} transform={`translate(${x} ${y})`} d="M0 4 C-6 -1 -4 -6 0 -3 C4 -6 6 -1 0 4z" />
                    ))}
                </g>
            )}
            {fx.includes("motion") && <path d={`M${cx - 34} 30 h-8 M${cx - 32} 38 h-10 M${cx + 34} 30 h8 M${cx + 32} 38 h10`} {...st} />}
            {fx.includes("money") && (
                <g>
                    {[[cx - 30, 14, -20], [cx + 30, 10, 15], [cx + 34, 44, 30]].map(([x, y, r]) => (
                        <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
                            <rect x={-7} y={-4} width={14} height={8} rx={1} fill="#6cc78a" stroke={ink} strokeWidth={line * 0.7} />
                            <text x={0} y={0.4} textAnchor="middle" dominantBaseline="central" fontSize={6} fontWeight={900} fill="#1d5e33">$</text>
                        </g>
                    ))}
                </g>
            )}
            {fx.includes("chips") && <ChipPile x={cx} y={82} k={1.1} line={line * 0.8} />}
            {fx.includes("ice") && <rect x={cx - 26} y={-6} width={52} height={88} rx={4} fill="#cfe9f7" fillOpacity={0.55} stroke={ink} strokeWidth={line} />}
            {fx.includes("bubble") && (
                <g>
                    <circle cx={cx} cy={40} r={32} fill="#bfe3ff" fillOpacity={0.3} stroke={ink} strokeWidth={line * 0.8} />
                    <path d={`M${cx - 22} 26 a24 24 0 0 1 14 -14`} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
                </g>
            )}
        </>
    );
}

export const MemeScene: React.FC<{ kit: StyleKit; spec: MemeSpec; uid: string }> = ({ kit, spec, uid }) => {
    const fx = spec.fx ?? [];
    const pose = spec.pose ?? "none";
    const hasSide = !!spec.side;
    const cx = hasSide ? 34 : 50;
    const k = spec.who === "whale" ? 1 : hasSide ? 0.88 : 1;
    const filterId = kit.propFilter ? `pf${uid}` : undefined;
    const hold = spec.prop && pose === "hold" ? <Obj spec={spec.prop} x={0} y={-8} s={0.56} filter={filterId} /> : undefined;
    return (
        <g>
            {kit.propFilter && <defs><filter id={`pf${uid}`} colorInterpolationFilters="sRGB">{kit.propFilter}</filter></defs>}
            <rect className="b52-bg" x={-5} y={-5} width={110} height={90} fill={spec.bg ?? kit.bgFor?.(spec.who) ?? kit.bg} />
            {fxBack(fx, cx)}
            {hasSide && <Obj spec={spec.side!} x={75} y={46} s={0.64} filter={filterId} />}
            <g transform={`translate(${cx} 36) scale(${k})`}>
                {spec.look && <LookOverlay look={spec.look} torso={kit.lookTorso} line={kit.line} part="body" />}
                <kit.Bust who={spec.who} face={spec.face} pose={pose} hat={spec.hat} hold={hold} costumed={!!spec.look && kit.lookTorso > 0} />
                {spec.look && <LookOverlay look={spec.look} torso={kit.lookTorso} line={kit.line} part="head" />}
            </g>
            {spec.above && <Obj spec={spec.above} x={cx + 22} y={10} s={0.34} filter={filterId} />}
            {fxFront(fx, cx, kit.ink, kit.line)}
            {spec.sign && (
                <g>
                    <rect x={66} y={4} width={30} height={13} rx={2} fill="#d23c32" stroke={kit.ink} strokeWidth={kit.line} />
                    <text x={81} y={10.8} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', sans-serif" fontWeight={900} fontSize={7.6} fill="#fff">
                        {spec.sign}
                    </text>
                </g>
            )}
        </g>
    );
};
