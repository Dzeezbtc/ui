import React from "react";
import { Obj } from "./scene";

/**
 * The movie cast kit (block52-chat#2): paper-cut-out caricatures of the actors
 * who said each line. A likeness at sticker size lives in four things, so each
 * is its own parameter here:
 *
 *  1. FACE SHAPE — egg dome, block jaw, long, narrow, heart, round, wide.
 *  2. HAIR — drawn the way hair actually sits: a volume layer BEHIND the head
 *     (the silhouette you see around the skull) and a layer ON the head clipped
 *     to its outline, ending at a real hairline (side part, widow's peak,
 *     receding, slicked back with comb lines, fringe, curls). Never a dome on
 *     top — that's what made everything look like a hat.
 *  3. BROWS, NOSE, FACIAL HAIR — the features that carry the person.
 *  4. COSTUME — what they wore in the scene, with the details that sell it.
 *
 * Scene space: 100×76, head centre (50, 32).
 */
const INK = "#1d1d1d";
const L = 1.1;
const CX = 50;
const CY = 32;

export const SKIN = { pale: "#f6d5bd", light: "#f2c9a3", tan: "#e0ad83", olive: "#d9a27a", brown: "#9a6845", deep: "#6e4a31", purple: "#8b6aa6", grey: "#c8c4b0" };

// ── 1. face shape ───────────────────────────────────────────────────────────

export type FaceShape = "round" | "egg" | "block" | "long" | "narrow" | "square" | "jaw" | "wide" | "heart" | "oval";

function facePath(shape: FaceShape): string {
    const x = CX;
    const y = CY;
    switch (shape) {
        case "egg": // tall dome, narrow jaw
            return `M${x - 18} ${y + 4} C${x - 20} ${y - 30} ${x + 20} ${y - 30} ${x + 18} ${y + 4} C${x + 16} ${y + 19} ${x - 16} ${y + 19} ${x - 18} ${y + 4}Z`;
        case "block": // flat top, wide square jaw
            return `M${x - 20} ${y - 15} Q${x - 21} ${y - 20} ${x - 14} ${y - 20} H${x + 14} Q${x + 21} ${y - 20} ${x + 20} ${y - 15} L${x + 22} ${y + 12} Q${x + 22} ${y + 21} ${x + 12} ${y + 21} H${x - 12} Q${x - 22} ${y + 21} ${x - 22} ${y + 12}Z`;
        case "long":
            return `M${x - 16} ${y - 4} C${x - 17} ${y - 26} ${x + 17} ${y - 26} ${x + 16} ${y - 4} C${x + 16} ${y + 14} ${x + 10} ${y + 23} ${x} ${y + 23} C${x - 10} ${y + 23} ${x - 16} ${y + 14} ${x - 16} ${y - 4}Z`;
        case "narrow":
            return `M${x - 16} ${y - 2} C${x - 17} ${y - 24} ${x + 17} ${y - 24} ${x + 16} ${y - 2} C${x + 15} ${y + 14} ${x + 8} ${y + 21} ${x} ${y + 21} C${x - 8} ${y + 21} ${x - 15} ${y + 14} ${x - 16} ${y - 2}Z`;
        case "square": // strong jaw, flat chin
            return `M${x - 19} ${y - 8} C${x - 20} ${y - 24} ${x + 20} ${y - 24} ${x + 19} ${y - 8} L${x + 18} ${y + 10} Q${x + 16} ${y + 21} ${x + 6} ${y + 21} H${x - 6} Q${x - 16} ${y + 21} ${x - 18} ${y + 10}Z`;
        case "jaw": // the titan's chin
            return `M${x - 16} ${y - 13} C${x - 13} ${y - 25} ${x + 13} ${y - 25} ${x + 16} ${y - 13} L${x + 23} ${y + 13} Q${x + 22} ${y + 25} ${x + 10} ${y + 26} H${x - 10} Q${x - 22} ${y + 25} ${x - 23} ${y + 13}Z`;
        case "wide":
            return `M${x - 23} ${y} C${x - 23} ${y - 22} ${x + 23} ${y - 22} ${x + 23} ${y} C${x + 23} ${y + 16} ${x + 14} ${y + 21} ${x} ${y + 21} C${x - 14} ${y + 21} ${x - 23} ${y + 16} ${x - 23} ${y}Z`;
        case "heart": // wide cheekbones, pointed chin
            return `M${x - 19} ${y - 4} C${x - 20} ${y - 24} ${x + 20} ${y - 24} ${x + 19} ${y - 4} C${x + 18} ${y + 8} ${x + 8} ${y + 20} ${x} ${y + 22} C${x - 8} ${y + 20} ${x - 18} ${y + 8} ${x - 19} ${y - 4}Z`;
        case "oval":
            return `M${x - 18} ${y} C${x - 18} ${y - 23} ${x + 18} ${y - 23} ${x + 18} ${y} C${x + 18} ${y + 16} ${x + 10} ${y + 22} ${x} ${y + 22} C${x - 10} ${y + 22} ${x - 18} ${y + 16} ${x - 18} ${y}Z`;
        default:
            return `M${x - 21} ${y} C${x - 21} ${y - 25} ${x + 21} ${y - 25} ${x + 21} ${y} C${x + 21} ${y + 25} ${x - 21} ${y + 25} ${x - 21} ${y}Z`;
    }
}

/** Half the face's width at ear level, per shape — ears and hair curtains attach here. */
export const HALF_WIDTH: Record<FaceShape, number> = { round: 21, egg: 18, block: 22, long: 16, narrow: 16, square: 19, jaw: 20, wide: 23, heart: 18, oval: 18 };

// ── 2. hair ─────────────────────────────────────────────────────────────────

export type Hairline = "low" | "mid" | "high" | "receding" | "widow" | "sideL" | "sideR" | "middle" | "fringe" | "bald" | "flat";
export type HairLength = "none" | "ears" | "collar" | "chin" | "shoulder" | "long";
export type Texture = "smooth" | "curly" | "spiky" | "wavy" | "slick" | "feathered" | "jheri" | "flame";

export interface HairSpec {
    color: string;
    line: Hairline;
    /** how far the hair stands off the skull, in px (0–10) */
    volume?: number;
    length?: HairLength;
    texture?: Texture;
    /** a sheen streak (slicked / jheri curls) */
    shine?: boolean;
}

/** The forehead edge of the hair: the region above it, clipped to the head, is hair. */
function hairlineRegion(line: Hairline): string {
    const top = "M0 -20 H100 V36";
    switch (line) {
        case "low":
            return `${top} L73 36 L72 27 Q50 20 28 27 L27 36 L0 36Z`;
        case "mid":
            return `${top} L72 33 L71 25 Q50 15 29 25 L28 33 L0 36Z`;
        case "high":
            return `${top} L71 30 L70 21 Q50 9 30 21 L29 30 L0 36Z`;
        case "receding":
            return `${top} L71 32 L70 22 L62 13 Q50 17 38 13 L30 22 L29 32 L0 36Z`;
        case "widow":
            return `${top} L72 32 L71 24 Q60 12 50 21 Q40 12 29 24 L28 32 L0 36Z`;
        case "sideL": // part on the left, sweep to the right
            return `${top} L72 32 L71 25 Q66 14 40 14 L38 20 Q32 20 29 27 L28 32 L0 36Z`;
        case "sideR":
            return `${top} L72 32 L71 27 Q68 20 62 20 L60 14 Q34 14 29 25 L28 32 L0 36Z`;
        case "middle": // centre part, curtains
            return `${top} L72 34 L70 24 Q62 14 50 15 Q38 14 30 24 L28 34 L0 36Z`;
        case "fringe": // bangs to the brows
            return `${top} L73 36 L72 23 L66 21 L60 23 L54 20 L48 23 L42 20 L36 23 L30 21 L28 24 L27 36 L0 36Z`;
        case "flat": // flat-top / crew cut: hair stops in a straight line
            return `${top} L72 30 L71 19 H29 L28 30 L0 36Z`;
        default:
            return "";
    }
}

/** The hairline as a line to ink (just the forehead edge, never the skull edge). */
function hairlineStroke(line: Hairline): string {
    switch (line) {
        case "low":
            return "M72 27 Q50 20 28 27";
        case "mid":
            return "M71 25 Q50 15 29 25";
        case "high":
            return "M70 21 Q50 9 30 21";
        case "receding":
            return "M70 22 L62 13 Q50 17 38 13 L30 22";
        case "widow":
            return "M71 24 Q60 12 50 21 Q40 12 29 24";
        case "sideL":
            return "M71 25 Q66 14 40 14 L38 20 Q32 20 29 27";
        case "sideR":
            return "M71 27 Q68 20 62 20 L60 14 Q34 14 29 25";
        case "middle":
            return "M70 24 Q62 14 50 15 Q38 14 30 24 M50 15 v-8";
        case "fringe":
            return "M72 23 L66 21 L60 23 L54 20 L48 23 L42 20 L36 23 L30 21 L28 24";
        case "flat":
            return "M71 19 H29";
        default:
            return "";
    }
}

/** Bumpy silhouette (curls) around an ellipse's top: circles along the arc. */
function curlRing(rx: number, ry: number, r: number, from = 200, to = 340): [number, number][] {
    const pts: [number, number][] = [];
    for (let a = from; a <= to; a += 14) {
        const t = (a * Math.PI) / 180;
        pts.push([CX + rx * Math.cos(t), CY - 4 + ry * Math.sin(t)]);
    }
    return pts;
}

const HairBack: React.FC<{ h: HairSpec; topClip: string; hw: number }> = ({ h, topClip, hw }) => {
    const v = h.volume ?? 2;
    const st = { fill: h.color, stroke: INK, strokeWidth: L };
    const len = h.length ?? "none";
    const drop = { none: 0, ears: 38, collar: 48, chin: 52, shoulder: 62, long: 76 }[len];
    const curls = h.texture === "curly" || h.texture === "jheri";
    const parts: React.ReactNode[] = [];
    // Long hair hangs as two curtains beside the face — never a block under the chin.
    if (drop) {
        const out = hw + 4 + v * 0.6;
        for (const side of [-1, 1]) {
            const xo = CX + side * out;
            const xi = CX + side * (hw - 3);
            const wave = curls ? 3 : h.texture === "wavy" ? 1.6 : 0.4;
            let d = `M${CX + side * (hw - 1)} 14 Q${xo + side * 1} 14 ${xo} 26`;
            for (let y = 26; y < drop; y += 8) d += ` q${side * wave} 4 0 8`;
            d += ` L${xi + side * 2} ${drop} Q${xi} ${drop - 6} ${xi} ${drop - 12} L${xi} 30 Z`;
            parts.push(<path key={`curtain${side}`} d={d} {...st} />);
            if (curls)
                for (let y = 30; y < drop - 2; y += 6)
                    parts.push(<path key={`cl${side}${y}`} d={`M${xo - side * 2} ${y} q${side * 2} 2 0 4`} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={0.7} />);
            else parts.push(<path key={`st${side}`} d={`M${xo - side * 3} 28 Q${xo - side * 2} ${(28 + drop) / 2} ${xo - side * 4} ${drop - 4}`} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={0.7} />);
        }
    }
    // Volume: hair standing off the skull, only ever visible ABOVE the temples.
    const vol: React.ReactNode[] = [];
    if (h.line !== "bald" && v > 0) {
        if (curls) {
            // one scalloped mass: the outline bumps outward between points along the arc
            const pts = curlRing(hw + v * 0.5, 20 + v * 0.6, 0, 186, 354);
            const bump = 2.4 + v * 0.35;
            let d = `M${CX - hw} ${CY + 2} L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
            for (let i = 1; i < pts.length; i++) {
                const [x0, y0] = pts[i - 1];
                const [x1, y1] = pts[i];
                const mx = (x0 + x1) / 2;
                const my = (y0 + y1) / 2;
                const nx = mx - CX;
                const ny = my - (CY - 4);
                const n = Math.hypot(nx, ny) || 1;
                d += ` Q${(mx + (nx / n) * bump).toFixed(1)} ${(my + (ny / n) * bump).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
            }
            d += ` L${CX + hw} ${CY + 2}Z`;
            vol.push(<path key="curls" d={d} {...st} />);
        } else if (h.texture === "spiky" || h.texture === "flame") {
            const n = h.texture === "flame" ? 7 : 9;
            const tall = h.texture === "flame" ? 18 + v * 2 : 3 + v;
            let d = `M${CX - hw} ${CY - 2}`;
            for (let i = 0; i <= n; i++) {
                const a2 = Math.PI + (Math.PI * i) / n;
                const k = 1 - Math.abs(i - n / 2) / n;
                d += ` L${(CX + (hw + 1) * Math.cos(a2)).toFixed(1)} ${(CY - 2 + 21 * Math.sin(a2)).toFixed(1)} L${(CX + (hw + 1 + tall * k) * Math.cos(a2 + 0.12)).toFixed(1)} ${(CY - 2 + (21 + tall * k) * Math.sin(a2 + 0.12)).toFixed(1)}`;
            }
            d += ` L${CX + hw} ${CY - 2}Z`;
            vol.push(<path key="sp" d={d} {...st} />);
        } else {
            vol.push(<ellipse key="vol" cx={CX} cy={CY - 3} rx={hw + v} ry={20 + v * 1.1} {...st} />);
        }
    }
    return (
        <g>
            {parts}
            <g clipPath={`url(#${topClip})`}>{vol}</g>
        </g>
    );
};

const HairFront: React.FC<{ h: HairSpec; clipId: string }> = ({ h, clipId }) => {
    if (h.line === "bald") return null;
    const region = hairlineRegion(h.line);
    const tex = h.texture ?? "smooth";
    return (
        <g>
            <g clipPath={`url(#${clipId})`}>
                <path d={region} fill={h.color} />
                {/* strand detail so it reads as hair */}
                {tex === "slick" && <path d="M34 22 q8 -10 18 -11 M40 22 q8 -9 18 -9 M48 21 q7 -7 15 -6 M56 21 q5 -5 11 -3" fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={0.7} />}
                {(tex === "smooth" || tex === "feathered") && <path d="M38 20 q6 -6 14 -6 M54 18 q6 -2 12 3 M33 24 q3 -5 8 -7" fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={0.7} />}
                {tex === "wavy" && <path d="M33 22 q3 -4 6 0 t6 0 t6 0 t6 0 t6 0" fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={0.7} />}
                {(tex === "curly" || tex === "jheri") && [[36, 18], [44, 14], [52, 13], [60, 16], [66, 21], [33, 25], [48, 19], [57, 20]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={2.2} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={0.6} />)}
                {h.shine && <path d="M40 15 q8 -5 16 -3" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
            </g>
            <path d={hairlineStroke(h.line)} fill="none" stroke={INK} strokeWidth={L} strokeLinejoin="round" />
        </g>
    );
};

// ── 3. features ─────────────────────────────────────────────────────────────

export type Brows = "none" | "straight" | "thick" | "thin" | "arched" | "angry" | "worried" | "raised" | "bushy" | "devil";
export type EyeKind = "plain" | "angry" | "wide" | "smug" | "sad" | "closed" | "crazy" | "squint" | "shades" | "aviators" | "almond" | "droopy" | "narrow";
export type MouthKind = "flat" | "smile" | "grin" | "shout" | "frown" | "smirk" | "o" | "teeth" | "pout" | "bigGrin";
export type NoseKind = "small" | "big" | "hook" | "button" | "wide" | "long" | "pointy" | "bulb" | "roman" | "upturned" | "flat";
export type Facial = "mustache" | "chevron" | "pencil" | "handlebar" | "goatee" | "beard" | "fullBeard" | "stubble" | "sideburns" | "chops" | "soulPatch";

const browPath: Record<Exclude<Brows, "none">, [string, number]> = {
    straight: ["M37 18 h10 M53 18 h10", 1.6],
    thick: ["M36 18 q6 -2 11 0 M53 18 q5 -2 11 0", 3.2],
    thin: ["M38 18 q5 -1.4 9 0 M53 18 q4 -1.4 9 0", 1],
    arched: ["M37 19 q5 -5 10 -1 M53 18 q5 -4 10 1", 1.6],
    angry: ["M36 15 L47 20 M64 15 L53 20", 2.6],
    worried: ["M37 19 L47 15 M63 19 L53 15", 1.8],
    raised: ["M37 18 h10 M53 15 q5 -4 10 0", 1.8],
    bushy: ["M35 18 q6 -4 12 -1 M53 17 q6 -3 12 1", 4],
    devil: ["M36 20 L47 14 M64 20 L53 14", 2]
};

const Eyes: React.FC<{ kind: EyeKind; look?: number }> = ({ kind, look = 0 }) => {
    if (kind === "shades") return <path d="M32 23 h36 v4 q-2 8 -9 8 q-6 0 -8 -5 h-2 q-2 5 -8 5 q-7 0 -9 -8z" fill="#111" />;
    if (kind === "aviators")
        return (
            <g stroke="#8a7a50" strokeWidth={1}>
                <path d="M33 23 h14 q1 9 -6 10 q-8 -1 -8 -10z M53 23 h14 q0 9 -8 10 q-7 -1 -6 -10z" fill="#3a4a5a" fillOpacity={0.85} />
                <path d="M47 24 h6" fill="none" />
            </g>
        );
    if (kind === "closed")
        return <path d="M37 27 q6 -4 11 0 M52 27 q6 -4 11 0" fill="none" stroke={INK} strokeWidth={L * 1.4} strokeLinecap="round" />;
    if (kind === "almond")
        return (
            <g>
                {[-1, 1].map(s => (
                    <g key={s}>
                        <path d={`M${CX + s * 6.4 - 6} 28 q6 -4.6 12 0 q-6 3 -12 0z`} fill="#fff" stroke={INK} strokeWidth={L} />
                        <circle cx={CX + s * 6.4 + s * 1.6} cy={27.6} r={1.5} fill={INK} />
                    </g>
                ))}
            </g>
        );
    const rx = kind === "squint" ? 6.2 : kind === "narrow" ? 6 : 6.4;
    const ry = kind === "squint" ? 3.4 : kind === "narrow" ? 4.6 : kind === "wide" ? 8 : 7.2;
    const pr = kind === "wide" ? 0.9 : kind === "crazy" ? 1.9 : 1.6;
    return (
        <g>
            {[-1, 1].map(s => (
                <g key={s}>
                    <ellipse cx={CX + s * rx} cy={28} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={L} />
                    <circle cx={CX + s * (kind === "crazy" ? rx * 1.25 : rx * 0.35) + look} cy={28 + (kind === "smug" ? 1.6 : 0.4)} r={pr} fill={INK} />
                    {(kind === "smug" || kind === "droopy") && <path d={`M${CX + s * rx - rx} ${kind === "droopy" ? 26 : 27} h${rx * 2}`} stroke={INK} strokeWidth={L * 1.4} />}
                    {kind === "droopy" && <path d={`M${CX + s * rx - rx} 22 q${rx} -3 ${rx * 2} 0 v4 h-${rx * 2}z`} fill="#000" fillOpacity={0.12} stroke="none" />}
                    {kind === "sad" && <path d={`M${CX + s * rx - rx} ${25 - s * 2} L${CX + s * rx + rx} ${25 + s * 2}`} stroke={INK} strokeWidth={L * 1.3} />}
                    {kind === "angry" && <path d={`M${CX + s * rx - rx} ${24 + s * 1.6} L${CX + s * rx + rx} ${24 - s * 1.6}`} stroke={INK} strokeWidth={L * 1.5} />}
                </g>
            ))}
        </g>
    );
};

const Mouth: React.FC<{ kind: MouthKind; y?: number; w?: number }> = ({ kind, y = 44, w = 1 }) => {
    const st = { fill: "none", stroke: INK, strokeWidth: L * 1.3, strokeLinecap: "round" as const };
    switch (kind) {
        case "smile":
            return <path d={`M${CX - 6 * w} ${y - 1} q${6 * w} 5 ${12 * w} 0`} {...st} />;
        case "grin":
        case "bigGrin": {
            const k = kind === "bigGrin" ? 1.3 : 1;
            return (
                <g stroke={INK} strokeWidth={L}>
                    <path d={`M${CX - 9 * w * k} ${y - 2} q${9 * w * k} ${9 * k} ${18 * w * k} 0z`} fill="#fff" />
                    <path d={`M${CX - 9 * w * k} ${y - 2} h${18 * w * k} M${CX - 4 * w} ${y - 2} v${3.6 * k} M${CX} ${y - 2} v${4.4 * k} M${CX + 4 * w} ${y - 2} v${3.6 * k}`} strokeWidth={L * 0.6} />
                </g>
            );
        }
        case "shout":
            return (
                <g stroke={INK} strokeWidth={L}>
                    <path d={`M${CX - 7 * w} ${y - 3} q${7 * w} -2 ${14 * w} 0 q0 10 -${7 * w} 10 q-${7 * w} 0 -${7 * w} -10z`} fill="#5a1b1b" />
                    <path d={`M${CX - 6 * w} ${y - 2.6} h${12 * w} v2 h-${12 * w}z`} fill="#fff" strokeWidth={0.5} />
                </g>
            );
        case "frown":
            return <path d={`M${CX - 5 * w} ${y + 2} q${5 * w} -5 ${10 * w} 0`} {...st} />;
        case "smirk":
            return <path d={`M${CX - 5 * w} ${y} q${6 * w} 2 ${10 * w} -3`} {...st} />;
        case "o":
            return <ellipse cx={CX} cy={y} rx={2.6 * w} ry={3.2 * w} fill="#5a1b1b" stroke={INK} strokeWidth={L} />;
        case "pout":
            return <path d={`M${CX - 4} ${y} q4 -3 8 0 q-4 3 -8 0z`} fill="#c66" stroke={INK} strokeWidth={0.8} />;
        case "teeth":
            return (
                <g stroke={INK} strokeWidth={L}>
                    <rect x={CX - 8 * w} y={y - 3} width={16 * w} height={6} rx={1.4} fill="#fff" />
                    <path d={`M${CX - 8 * w} ${y} h${16 * w} M${CX - 4 * w} ${y - 3} v6 M${CX} ${y - 3} v6 M${CX + 4 * w} ${y - 3} v6`} strokeWidth={L * 0.5} />
                </g>
            );
        default:
            return <path d={`M${CX - 4 * w} ${y} h${8 * w}`} {...st} />;
    }
};

const Nose: React.FC<{ kind: NoseKind }> = ({ kind }) => {
    const d =
        kind === "big"
            ? "M49 33 q5 3 1 7 q-3 1 -5 -1"
            : kind === "hook"
              ? "M49 31 q6 5 1 9 q-2 1 -3 0"
              : kind === "wide"
                ? "M46 38 q4 3 8 0 M47 33 q-1 3 -1 5 M53 33 q1 3 1 5"
                : kind === "long"
                  ? "M49.4 30 q3 7 1 10 q-2 1 -4 -1"
                  : kind === "button"
                    ? "M48 37 q2 2 4 0"
                    : kind === "pointy"
                      ? "M49 32 l4 7 l-4 0.6"
                      : kind === "bulb"
                        ? "M49 33 q1 3 -1 5 q2 3 5 1 q2 -3 -1 -4"
                        : kind === "roman"
                          ? "M48.6 30 q4 2 3 8 q-1 2 -4 1"
                          : kind === "upturned"
                            ? "M49 34 q2 3 4 2 q-1 2 -4 1.6"
                            : kind === "flat"
                              ? "M46 38 h8 M47 36 q3 -1 6 0"
                              : "M49.4 35 q3 2 0.6 3.6";
    return <path d={d} fill="none" stroke={INK} strokeWidth={L} strokeLinecap="round" />;
};

const FacialHair: React.FC<{ kinds: Facial[]; color: string }> = ({ kinds, color }) => (
    <g>
        {kinds.map(k => {
            const st = { fill: color, stroke: INK, strokeWidth: L * 0.7 };
            switch (k) {
                case "stubble":
                    return (
                        <g key={k} fill={color} opacity={0.6}>
                            {Array.from({ length: 30 }, (_, i) => (
                                <circle key={i} cx={36 + ((i * 37) % 28)} cy={42 + ((i * 13) % 10)} r={0.5} />
                            ))}
                        </g>
                    );
                case "mustache":
                    return <path key={k} d="M42 40 q8 -4 16 0 q-8 2.6 -16 0z" {...st} />;
                case "chevron":
                    return <path key={k} d="M40 41 q10 -6 20 0 l-2 2 q-8 -3 -16 0z" {...st} />;
                case "pencil":
                    return <path key={k} d="M43 40.4 q7 -2.4 14 0" fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" />;
                case "handlebar":
                    return <path key={k} d="M41 41 q9 -5 18 0 q3 -1 3 -4 q1 5 -4 6 q-8 -3 -16 0 q-5 -1 -4 -6 q0 3 3 4z" {...st} />;
                case "goatee":
                    return <path key={k} d="M45 48 q5 8 10 0 q-5 2 -10 0z" {...st} />;
                case "soulPatch":
                    return <path key={k} d="M48.6 48 h2.8 v3 h-2.8z" {...st} />;
                case "sideburns":
                    return <path key={k} d="M29 27 h3.4 v11 h-3.4z M67.6 27 h3.4 v11 h-3.4z" {...st} />;
                case "chops":
                    return <path key={k} d="M28.6 26 h4 l2 18 q-4 2 -6 -2z M71.4 26 h-4 l-2 18 q4 2 6 -2z" {...st} />;
                case "beard":
                    return <path key={k} d="M31 36 C32 50 42 56 50 56 C58 56 68 50 69 36 C62 46 56 48 50 48 C44 48 38 46 31 36z" {...st} />;
                case "fullBeard":
                    return <path key={k} d="M29 30 C28 52 40 62 50 62 C60 62 72 52 71 30 C68 42 60 48 50 48 C40 48 32 42 29 30z" {...st} />;
                default:
                    return null;
            }
        })}
    </g>
);

// ── 4. costume ──────────────────────────────────────────────────────────────

export type CostumeKind =
    | "suit" | "tux" | "navyWhites" | "marine" | "jersey" | "polo" | "vest" | "tracksuit" | "robe" | "leather" | "tee" | "tank"
    | "dress" | "bare" | "armor" | "hoodie" | "cardigan" | "racing" | "gi" | "prison" | "jumpsuit" | "trench" | "doublet" | "safari" | "uniform" | "army";

export interface Costume {
    kind: CostumeKind;
    color: string;
    shirt?: string;
    tie?: string;
    accent?: string;
    text?: string;
}

type Hands = "down" | "up" | "point" | "thumb" | "hold" | "frame" | "circle" | "snap" | "fists" | "pinky" | "spread";
const HAND_POS: Record<Hands, [[number, number], [number, number]]> = {
    down: [[30, 70], [70, 70]],
    up: [[22, 28], [78, 28]],
    point: [[30, 70], [84, 46]],
    thumb: [[30, 70], [74, 52]],
    hold: [[30, 70], [74, 50]],
    frame: [[30, 46], [70, 46]],
    circle: [[30, 70], [72, 44]],
    snap: [[30, 70], [76, 34]],
    fists: [[34, 54], [66, 54]],
    pinky: [[30, 70], [58, 46]],
    spread: [[14, 50], [86, 50]]
};

const Torso: React.FC<{ c: Costume; skin: string; hands: Hands; hold?: React.ReactNode }> = ({ c, skin, hands, hold }) => {
    const st = { stroke: INK, strokeWidth: L, strokeLinejoin: "round" as const };
    const torso = "M28 82 C28 62 36 52 50 52 C64 52 72 62 72 82Z";
    const sleeve = c.kind === "bare" || c.kind === "tank" ? skin : c.color;
    const [l, r] = HAND_POS[hands];
    const arm = (sx: number, h: [number, number]) => (
        <>
            <path d={`M${sx} 60 Q${(sx + h[0]) / 2 + (h[0] > 50 ? 4 : -4)} ${(60 + h[1]) / 2} ${h[0]} ${h[1]}`} fill="none" stroke={INK} strokeWidth={8.4} strokeLinecap="round" />
            <path d={`M${sx} 60 Q${(sx + h[0]) / 2 + (h[0] > 50 ? 4 : -4)} ${(60 + h[1]) / 2} ${h[0]} ${h[1]}`} fill="none" stroke={sleeve} strokeWidth={6} strokeLinecap="round" />
        </>
    );
    const lapels = (fill = "#000", op = 0.18) => <path d="M44 52 L40 61 L46 60 L50 68z M56 52 L60 61 L54 60 L50 68z" fill={fill} fillOpacity={op} stroke={INK} strokeWidth={L * 0.6} />;
    let body: React.ReactNode;
    switch (c.kind) {
        case "suit":
        case "tux":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 L50 68 L56 52Z" fill={c.shirt ?? "#fff"} {...st} strokeWidth={L * 0.8} />
                    {lapels(c.kind === "tux" ? "#000" : "#000", c.kind === "tux" ? 0.5 : 0.18)}
                    {c.kind === "tux" ? <path d="M45 54 l5 2.4 l5 -2.4 v5 l-5 -2.4 l-5 2.4z" fill="#111" /> : c.tie && <path d="M49 55 l-2 3 l3 12 l3 -12 l-2 -3z" fill={c.tie} stroke={INK} strokeWidth={0.6} />}
                    <circle cx={50} cy={72} r={0.9} fill="#000" fillOpacity={0.5} />
                    <circle cx={50} cy={78} r={0.9} fill="#000" fillOpacity={0.5} />
                    <path d="M37 64 h6" stroke="#fff" strokeOpacity={c.accent ? 0.8 : 0} strokeWidth={1.4} />
                </>
            );
            break;
        case "navyWhites":
            body = (
                <>
                    <path d={torso} fill="#f7f7f4" {...st} />
                    <path d="M42 52 h16 v4 h-16z" fill="#f7f7f4" {...st} />
                    {[58, 64, 70, 76].map(y => (
                        <circle key={y} cx={50} cy={y} r={1.1} fill="#d6a531" stroke={INK} strokeWidth={0.4} />
                    ))}
                    <path d="M30 58 l9 -3 v4 l-9 3z M70 58 l-9 -3 v4 l9 3z" fill="#111" />
                    <path d="M31 59.5 l7 -2.4 M69 59.5 l-7 -2.4" stroke="#d6a531" strokeWidth={0.8} />
                    <path d="M54 62 h8 v2 h-8z M54 65 h8 v2 h-8z" fill="#2f6fc0" stroke={INK} strokeWidth={0.3} />
                </>
            );
            break;
        case "marine":
            body = (
                <>
                    <path d={torso} fill="#4b5a3a" {...st} />
                    <path d="M44 52 L50 66 L56 52Z" fill="#c8b78f" {...st} strokeWidth={L * 0.8} />
                    <path d="M49 55 l-2 3 l3 11 l3 -11 l-2 -3z" fill="#5a4b2a" stroke={INK} strokeWidth={0.5} />
                    {lapels("#000", 0.15)}
                    {["#c8232c", "#2f6fc0", "#d6a531", "#3f8a4e", "#e8e8e8", "#c8232c"].map((col, i) => (
                        <rect key={i} x={56 + (i % 3) * 3.4} y={60 + Math.floor(i / 3) * 2.6} width={3.2} height={2.4} fill={col} stroke={INK} strokeWidth={0.25} />
                    ))}
                    <circle cx={42} cy={56} r={1.2} fill="#d6a531" />
                    <circle cx={58} cy={56} r={1.2} fill="#d6a531" />
                </>
            );
            break;
        case "jersey":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M29 66 C36 62 64 62 71 66 L71 70 C64 66 36 66 29 70z" fill={c.accent ?? "#e8b84a"} />
                    <path d="M44 52 q6 4 12 0" fill="none" stroke={c.accent ?? "#e8b84a"} strokeWidth={2.4} />
                    {c.text && (
                        <text x={50} y={76} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', sans-serif" fontWeight={900} fontSize={8} fill={c.accent ?? "#e8b84a"} stroke={INK} strokeWidth={0.5} paintOrder="stroke">
                            {c.text}
                        </text>
                    )}
                </>
            );
            break;
        case "polo":
        case "vest":
            body = (
                <>
                    <path d={torso} fill={c.kind === "vest" ? c.shirt ?? "#fff" : c.color} {...st} />
                    {c.kind === "vest" && <path d="M34 62 C36 56 42 53 46 54 L50 72 L54 54 C58 53 64 56 66 62 L66 82 H34Z" fill={c.color} {...st} />}
                    <path d="M42 52 l-4 6 l7 1 l5 -5 l5 5 l7 -1 l-4 -6z" fill={c.shirt ?? c.color} {...st} strokeWidth={L * 0.7} />
                    <path d="M50 54 v8" stroke={INK} strokeWidth={0.6} />
                </>
            );
            break;
        case "tracksuit":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M50 52 V82" stroke="#ccc" strokeWidth={1} />
                    <path d="M34 58 l-4 24 M66 58 l4 24" stroke="#fff" strokeWidth={2} />
                    <path d="M44 52 q6 6 12 0" fill="none" stroke="#d6a531" strokeWidth={1.2} />
                </>
            );
            break;
        case "robe":
            body = (
                <>
                    <path d="M24 82 C26 60 36 50 50 50 C64 50 74 60 76 82Z" fill={c.color} {...st} />
                    <path d="M42 50 L50 82 M58 50 L50 82" stroke="#000" strokeOpacity={0.25} strokeWidth={1.4} />
                    {c.accent && <path d="M36 70 h28" stroke={c.accent} strokeWidth={2} />}
                </>
            );
            break;
        case "leather":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 L38 62 L46 60 L50 70 L54 60 L62 62 L56 52" fill="#2c2c30" {...st} strokeWidth={L * 0.7} />
                    <path d="M52 60 l-2 22" stroke="#8a8a8a" strokeWidth={0.8} />
                    {c.shirt && <path d="M46 53 L50 62 L54 53z" fill={c.shirt} />}
                </>
            );
            break;
        case "tank":
            body = (
                <>
                    <path d={torso} fill={skin} {...st} />
                    <path d="M37 82 C38 66 40 58 42 54 Q50 60 58 54 C60 58 62 66 63 82Z" fill={c.color} {...st} />
                </>
            );
            break;
        case "dress":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M42 52 q8 8 16 0" fill={skin} {...st} strokeWidth={L * 0.6} />
                    {c.accent && <path d="M30 70 h40" stroke={c.accent} strokeWidth={1.6} />}
                </>
            );
            break;
        case "bare":
            body = (
                <>
                    <path d="M22 82 C22 60 30 50 40 50 L60 50 C70 50 78 60 78 82Z" fill={c.color} {...st} />
                    <path d={torso} fill={skin} {...st} />
                    <path d="M42 62 q8 3 16 0 M44 68 h12 M44 74 h12 M50 62 v16" fill="none" stroke="#8a5a3a" strokeWidth={0.8} />
                </>
            );
            break;
        case "armor":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M30 60 C34 54 42 52 46 54 L40 64z M70 60 C66 54 58 52 54 54 L60 64z" fill={c.accent ?? "#d6a531"} {...st} />
                    <path d="M40 66 h20 M40 72 h20" stroke="#000" strokeOpacity={0.3} strokeWidth={1.2} />
                </>
            );
            break;
        case "hoodie":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M38 54 q12 10 24 0" fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={1.6} />
                    <path d="M46 60 v8 M54 60 v8" stroke="#eee" strokeWidth={0.8} />
                    <path d="M40 72 h20 v8 h-20z" fill="#000" fillOpacity={0.12} />
                </>
            );
            break;
        case "cardigan":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 L50 82 L56 52" fill={c.shirt ?? "#fff"} {...st} strokeWidth={L * 0.6} />
                    <path d="M30 66 h12 M58 66 h12 M30 72 h12 M58 72 h12" stroke={c.accent ?? "#5a3a22"} strokeWidth={1.4} strokeDasharray="2 1.4" />
                </>
            );
            break;
        case "racing":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 h12 v3 h-12z" fill={c.color} {...st} />
                    <rect x={38} y={62} width={10} height={5} rx={1} fill="#fff" stroke={INK} strokeWidth={0.5} />
                    <rect x={54} y={62} width={10} height={5} rx={1} fill={c.accent ?? "#e8b84a"} stroke={INK} strokeWidth={0.5} />
                    <circle cx={43} cy={64.5} r={1.4} fill="#c8232c" />
                    <circle cx={50} cy={74} r={3} fill="#fff" stroke={INK} strokeWidth={0.5} />
                </>
            );
            break;
        case "gi":
            body = (
                <>
                    <path d={torso} fill="#f7f7f4" {...st} />
                    <path d="M42 52 L54 70 M58 52 L46 70" stroke={INK} strokeWidth={L} />
                    <path d="M30 74 h40" stroke={c.color} strokeWidth={3} />
                </>
            );
            break;
        case "prison":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 L50 62 L56 52" fill="none" {...st} />
                    <rect x={55} y={62} width={11} height={4} fill="#fff" stroke={INK} strokeWidth={0.4} />
                    <text x={60.5} y={64.2} textAnchor="middle" dominantBaseline="central" fontSize={3} fill="#111">{c.text ?? "37927"}</text>
                </>
            );
            break;
        case "jumpsuit":
        case "uniform":
        case "safari":
        case "army":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 l-4 6 l6 1 l4 -4 l4 4 l6 -1 l-4 -6z" fill={c.color} {...st} strokeWidth={L * 0.7} />
                    <path d="M50 56 V82" stroke="#000" strokeOpacity={0.25} strokeWidth={0.8} />
                    <rect x={36} y={62} width={9} height={7} rx={1} fill="#000" fillOpacity={0.12} stroke={INK} strokeWidth={0.4} />
                    <rect x={55} y={62} width={9} height={7} rx={1} fill="#000" fillOpacity={0.12} stroke={INK} strokeWidth={0.4} />
                    {c.kind === "jumpsuit" && <circle cx={59.5} cy={58} r={2.4} fill="#fff" stroke="#2f6fc0" strokeWidth={0.8} />}
                    {c.kind === "army" && <rect x={56} y={58} width={6} height={3} fill="#3f5a2a" />}
                    {c.accent && <path d="M36 58 h8" stroke={c.accent} strokeWidth={1.4} />}
                </>
            );
            break;
        case "trench":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M40 52 L36 64 L46 60 L50 82 L54 60 L64 64 L60 52" fill="#000" fillOpacity={0.15} {...st} strokeWidth={L * 0.6} />
                    <path d="M30 70 h40" stroke="#5a3a22" strokeWidth={2.4} />
                </>
            );
            break;
        case "doublet":
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    {[58, 63, 68, 73, 78].map(y => (
                        <path key={y} d={`M47 ${y} h6`} stroke={c.accent ?? "#d6a531"} strokeWidth={1.4} />
                    ))}
                    <path d="M42 52 q8 4 16 0" fill="none" stroke="#f2f2f2" strokeWidth={2.4} />
                </>
            );
            break;
        default:
            body = (
                <>
                    <path d={torso} fill={c.color} {...st} />
                    <path d="M44 52 q6 4 12 0" fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={1.4} />
                    {c.text && (
                        <text x={50} y={70} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', sans-serif" fontSize={6} fill={c.accent ?? "#fff"}>
                            {c.text}
                        </text>
                    )}
                </>
            );
    }
    const mitten = (h: [number, number]) => <ellipse cx={h[0]} cy={h[1]} rx={4} ry={3.6} fill={skin} stroke={INK} strokeWidth={L} />;
    return (
        <g>
            {body}
            {arm(36, l)}
            {arm(64, r)}
            {hold && <g transform={`translate(${r[0]} ${r[1]})`}>{hold}</g>}
            {mitten(l)}
            {mitten(r)}
            {hands === "thumb" && <rect x={r[0] - 1.4} y={r[1] - 8} width={2.8} height={6} rx={1.4} fill={skin} stroke={INK} strokeWidth={L} />}
            {hands === "point" && <rect x={r[0] + 2} y={r[1] - 1.4} width={6} height={2.8} rx={1.4} fill={skin} stroke={INK} strokeWidth={L} />}
            {hands === "pinky" && <rect x={r[0] - 0.8} y={r[1] - 7} width={1.8} height={5} rx={0.9} fill={skin} stroke={INK} strokeWidth={L * 0.8} />}
            {hands === "circle" && <circle cx={r[0]} cy={r[1] - 5} r={2.4} fill="none" stroke={INK} strokeWidth={L * 1.4} />}
        </g>
    );
};

// ── the character ───────────────────────────────────────────────────────────

export interface CastSpec {
    who: string;
    skin: string;
    face?: FaceShape;
    hair: HairSpec;
    brows?: Brows;
    browColor?: string;
    eyes?: EyeKind;
    mouth?: MouthKind;
    nose?: NoseKind;
    facial?: Facial[];
    facialColor?: string;
    lashes?: boolean;
    lips?: boolean;
    glasses?: "round" | "square" | "thick";
    costume: Costume;
    hands?: Hands;
    /** an art spec (art/Art.tsx) held in the right hand */
    hold?: string;
    /** a hat or helmet art spec on the head */
    hat?: string;
    bg: string;
    /** extra drawing over everything (scars, props, effects) */
    over?: React.ReactNode;
    /** extra drawing behind the character (scenery) */
    scene?: React.ReactNode;
    ears?: boolean;
}

export const Character: React.FC<{ c: CastSpec }> = ({ c }) => {
    const id = `hc${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const face = facePath(c.face ?? "round");
    const hw = HALF_WIDTH[c.face ?? "round"];
    const longHair = ["shoulder", "long", "chin"].includes(c.hair.length ?? "none");
    const showEars = c.ears ?? (!longHair && !(c.hair.texture === "jheri" || c.hair.texture === "curly") && (c.hair.volume ?? 2) < 6);
    return (
        <g>
            <defs>
                <clipPath id={id}>
                    <path d={face} />
                </clipPath>
                <clipPath id={`${id}t`}>
                    <rect x={-10} y={-40} width={120} height={70} />
                </clipPath>
            </defs>
            <rect x={-5} y={-5} width={110} height={90} fill={c.bg} />
            {c.scene}
            <Torso c={c.costume} skin={c.skin} hands={c.hands ?? (c.hold ? "hold" : "down")} hold={c.hold ? <Obj spec={c.hold} x={0} y={-6} s={0.3} /> : undefined} />
            <HairBack h={c.hair} topClip={`${id}t`} hw={hw} />
            {showEars && (
                <g fill={c.skin} stroke={INK} strokeWidth={L}>
                    <path d={`M${CX - hw + 1} 29 q-4.6 -1 -4.4 4.6 q0.4 5 4.4 4.6`} />
                    <path d={`M${CX + hw - 1} 29 q4.6 -1 4.4 4.6 q-0.4 5 -4.4 4.6`} />
                </g>
            )}
            <path d={face} fill={c.skin} stroke={INK} strokeWidth={L} />
            <HairFront h={c.hair} clipId={id} />
            {c.brows && c.brows !== "none" && <path d={browPath[c.brows][0]} fill="none" stroke={c.browColor ?? c.hair.color} strokeWidth={browPath[c.brows][1]} strokeLinecap="round" />}
            <Eyes kind={c.eyes ?? "plain"} />
            {c.lashes && <path d="M37 21 l-2 -3 M40 20 l-1 -3 M43 20 l0 -3 M57 20 l0 -3 M60 20 l1 -3 M63 21 l2 -3" stroke={INK} strokeWidth={0.9} strokeLinecap="round" />}
            {c.glasses && (
                <g fill="none" stroke={INK} strokeWidth={c.glasses === "thick" ? L * 2.2 : L * 1.2}>
                    {c.glasses === "round" ? (
                        <>
                            <circle cx={43.6} cy={28} r={6.6} />
                            <circle cx={56.4} cy={28} r={6.6} />
                        </>
                    ) : (
                        <>
                            <rect x={36} y={22} width={13} height={11} rx={2.4} />
                            <rect x={51} y={22} width={13} height={11} rx={2.4} />
                        </>
                    )}
                </g>
            )}
            <Nose kind={c.nose ?? "small"} />
            {c.facial && <FacialHair kinds={c.facial} color={c.facialColor ?? c.hair.color} />}
            <Mouth kind={c.mouth ?? "flat"} />
            {c.lips && <path d="M45 43 q5 3 10 0 q-5 -2 -10 0z" fill="#d0556a" stroke={INK} strokeWidth={0.6} />}
            {c.hat && <Obj spec={c.hat} x={50} y={6} s={0.44} />}
            {c.over}
        </g>
    );
};
