import React from "react";
import { ChipPile } from "./frame";
import { Obj } from "./scene";
import { Character } from "./cast";
import { CAST, COMEBACK_CAST } from "./castList";

/**
 * Movie references (block52-chat#2): every movie / TV line is said by a
 * paper-cut-out caricature of the character who said it — flat shapes, big
 * round heads, two big touching eyes, tiny mitten hands — in the spirit of
 * cut-out TV cartoons. Parody caricatures; any likeness is for laughs.
 *
 * Each scene is drawn on the 100×76 art area. Head centre ~(50, 32).
 */
const INK = "#1d1d1d";
const L = 1.1;

type Eyes = "plain" | "angry" | "wide" | "smug" | "sad" | "closed" | "crazy";

/**
 * The cut-out head. Head SHAPE carries most of a likeness at this size, so each
 * character picks one: a block for the action hero, a tall egg dome, a long
 * wizard's face, a narrow face, a square jaw, the titan's huge chin.
 */
type Shape = "round" | "egg" | "block" | "long" | "narrow" | "square" | "jaw" | "wide";
function headPath(shape: Shape, x: number, y: number): string {
    switch (shape) {
        case "egg":
            return `M${x - 18} ${y + 4} C${x - 20} ${y - 30} ${x + 20} ${y - 30} ${x + 18} ${y + 4} C${x + 16} ${y + 19} ${x - 16} ${y + 19} ${x - 18} ${y + 4}Z`;
        case "block":
            return `M${x - 20} ${y - 15} Q${x - 21} ${y - 20} ${x - 14} ${y - 20} H${x + 14} Q${x + 21} ${y - 20} ${x + 20} ${y - 15} L${x + 22} ${y + 12} Q${x + 22} ${y + 21} ${x + 12} ${y + 21} H${x - 12} Q${x - 22} ${y + 21} ${x - 22} ${y + 12}Z`;
        case "long":
            return `M${x - 16} ${y - 4} C${x - 17} ${y - 26} ${x + 17} ${y - 26} ${x + 16} ${y - 4} C${x + 16} ${y + 14} ${x + 10} ${y + 23} ${x} ${y + 23} C${x - 10} ${y + 23} ${x - 16} ${y + 14} ${x - 16} ${y - 4}Z`;
        case "narrow":
            return `M${x - 16} ${y - 2} C${x - 17} ${y - 24} ${x + 17} ${y - 24} ${x + 16} ${y - 2} C${x + 15} ${y + 14} ${x + 8} ${y + 21} ${x} ${y + 21} C${x - 8} ${y + 21} ${x - 15} ${y + 14} ${x - 16} ${y - 2}Z`;
        case "square":
            return `M${x - 19} ${y - 8} C${x - 20} ${y - 24} ${x + 20} ${y - 24} ${x + 19} ${y - 8} L${x + 18} ${y + 10} Q${x + 16} ${y + 21} ${x + 6} ${y + 21} H${x - 6} Q${x - 16} ${y + 21} ${x - 18} ${y + 10}Z`;
        case "jaw":
            return `M${x - 16} ${y - 13} C${x - 13} ${y - 25} ${x + 13} ${y - 25} ${x + 16} ${y - 13} L${x + 23} ${y + 13} Q${x + 22} ${y + 25} ${x + 10} ${y + 26} H${x - 10} Q${x - 22} ${y + 25} ${x - 23} ${y + 13}Z`;
        case "wide":
            return `M${x - 23} ${y} C${x - 23} ${y - 22} ${x + 23} ${y - 22} ${x + 23} ${y} C${x + 23} ${y + 16} ${x + 14} ${y + 21} ${x} ${y + 21} C${x - 14} ${y + 21} ${x - 23} ${y + 16} ${x - 23} ${y}Z`;
        default:
            return "";
    }
}

const Head: React.FC<{ x?: number; y?: number; skin: string; w?: number; h?: number; chin?: boolean; shape?: Shape; ears?: boolean }> = ({ x = 50, y = 32, skin, w = 21, h = 19, chin, shape = "round", ears }) => (
    <g>
        {ears && (
            <g fill={skin} stroke={INK} strokeWidth={L}>
                <ellipse cx={x - (shape === "narrow" || shape === "long" ? 17 : 21)} cy={y + 2} rx={3} ry={4.4} />
                <ellipse cx={x + (shape === "narrow" || shape === "long" ? 17 : 21)} cy={y + 2} rx={3} ry={4.4} />
            </g>
        )}
        {shape === "round" ? <ellipse cx={x} cy={y} rx={w} ry={h} fill={skin} stroke={INK} strokeWidth={L} /> : <path d={headPath(shape, x, y)} fill={skin} stroke={INK} strokeWidth={L} />}
        {chin && <path d={`M${x - 14} ${y + 12} q14 14 28 0`} fill={skin} stroke={INK} strokeWidth={L} />}
    </g>
);

/** A small nose; `big` for the characterful ones. */
const Nose: React.FC<{ x?: number; y?: number; big?: boolean; hook?: boolean }> = ({ x = 50, y = 36, big, hook }) => (
    <path
        d={hook ? `M${x - 1} ${y - 3} q5 4 1 7 q-2 1 -3 0` : big ? `M${x - 1} ${y - 2} q5 3 1 6 q-3 1 -5 -1` : `M${x - 0.6} ${y - 1} q3 2 0.6 3.6`}
        fill="none"
        stroke={INK}
        strokeWidth={L}
        strokeLinecap="round"
    />
);

/** Extra lines that sell a face: brow ridge, cheekbones, frown lines, stubble, dimple. */
const Lines: React.FC<{ d: string; w?: number; color?: string }> = ({ d, w = L * 0.8, color = INK }) => <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />;

const Stubble: React.FC<{ x?: number; y?: number; w?: number }> = ({ x = 50, y = 46, w = 12 }) => (
    <g fill="#3a3a3a" opacity={0.55}>
        {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={x - w + ((i * 37) % (w * 2))} cy={y - 4 + ((i * 13) % 8)} r={0.45} />
        ))}
    </g>
);

/** Two big eyes touching in the middle — the cut-out signature. */
const CutEyes: React.FC<{ x?: number; y?: number; kind?: Eyes; look?: number; size?: number }> = ({ x = 50, y = 28, kind = "plain", look = 0, size = 1 }) => {
    const rx = 6.4 * size;
    const ry = 7.4 * size;
    const lid = (side: number) => {
        const cx = x + side * rx;
        if (kind === "angry") return <path d={`M${cx - rx} ${y - ry * 0.4} L${cx + rx} ${y - ry * 0.4 + side * 3}`} stroke={INK} strokeWidth={L * 1.6} />;
        if (kind === "smug") return <path d={`M${cx - rx} ${y - 1} h${rx * 2}`} stroke={INK} strokeWidth={L * 1.4} />;
        if (kind === "sad") return <path d={`M${cx - rx} ${y - ry * 0.3 + side * -3} L${cx + rx} ${y - ry * 0.3 + side * 3}`} stroke={INK} strokeWidth={L * 1.4} />;
        return null;
    };
    if (kind === "closed") {
        return (
            <g fill="none" stroke={INK} strokeWidth={L * 1.4} strokeLinecap="round">
                <path d={`M${x - rx * 1.8} ${y} q${rx * 0.8} -4 ${rx * 1.6} 0 M${x + rx * 0.2} ${y} q${rx * 0.8} -4 ${rx * 1.6} 0`} />
            </g>
        );
    }
    const p = kind === "wide" ? 0.9 : kind === "crazy" ? 1.9 : 1.6;
    return (
        <g>
            {[-1, 1].map(side => (
                <g key={side}>
                    <ellipse cx={x + side * rx} cy={y} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={L} />
                    <circle cx={x + side * (kind === "crazy" ? rx * 1.3 : rx * 0.35) + look} cy={y + (kind === "smug" ? 1.6 : 0.4)} r={p} fill={INK} />
                    {lid(side)}
                </g>
            ))}
        </g>
    );
};

type Mouth = "flat" | "smile" | "grin" | "shout" | "frown" | "smirk" | "o" | "teeth";
const CutMouth: React.FC<{ x?: number; y?: number; kind?: Mouth; w?: number }> = ({ x = 50, y = 43, kind = "flat", w = 1 }) => {
    switch (kind) {
        case "smile":
            return <path d={`M${x - 6 * w} ${y - 1} q${6 * w} 5 ${12 * w} 0`} fill="none" stroke={INK} strokeWidth={L * 1.3} strokeLinecap="round" />;
        case "grin":
            return (
                <g stroke={INK} strokeWidth={L}>
                    <path d={`M${x - 9 * w} ${y - 2} q${9 * w} 9 ${18 * w} 0z`} fill="#fff" />
                    <path d={`M${x - 9 * w} ${y - 2} h${18 * w} M${x - 4 * w} ${y - 2} v3.6 M${x} ${y - 2} v4.4 M${x + 4 * w} ${y - 2} v3.6`} strokeWidth={L * 0.6} />
                </g>
            );
        case "shout":
            return (
                <g stroke={INK} strokeWidth={L}>
                    <path d={`M${x - 7 * w} ${y - 3} q${7 * w} -2 ${14 * w} 0 q0 10 -${7 * w} 10 q-${7 * w} 0 -${7 * w} -10z`} fill="#5a1b1b" />
                    <path d={`M${x - 6 * w} ${y - 2.6} h${12 * w} v2 h-${12 * w}z`} fill="#fff" strokeWidth={0.5} />
                </g>
            );
        case "frown":
            return <path d={`M${x - 5 * w} ${y + 2} q${5 * w} -5 ${10 * w} 0`} fill="none" stroke={INK} strokeWidth={L * 1.3} strokeLinecap="round" />;
        case "smirk":
            return <path d={`M${x - 5 * w} ${y} q${6 * w} 2 ${10 * w} -3`} fill="none" stroke={INK} strokeWidth={L * 1.3} strokeLinecap="round" />;
        case "o":
            return <ellipse cx={x} cy={y} rx={2.6 * w} ry={3.2 * w} fill="#5a1b1b" stroke={INK} strokeWidth={L} />;
        case "teeth":
            return (
                <g stroke={INK} strokeWidth={L}>
                    <rect x={x - 8 * w} y={y - 3} width={16 * w} height={6} rx={1.4} fill="#fff" />
                    <path d={`M${x - 8 * w} ${y} h${16 * w} M${x - 4 * w} ${y - 3} v6 M${x} ${y - 3} v6 M${x + 4 * w} ${y - 3} v6`} strokeWidth={L * 0.5} />
                </g>
            );
        default:
            return <path d={`M${x - 4 * w} ${y} h${8 * w}`} stroke={INK} strokeWidth={L * 1.3} strokeLinecap="round" />;
    }
};

/** A cut-out body: jacket, optional shirt V, little mitten hands. */
const Body: React.FC<{ jacket: string; shirt?: string; skin?: string; hands?: "down" | "up" | "point" | "thumb" | "hold" | "frame" | "circle" | "snap"; hold?: React.ReactNode; tie?: string }> = ({
    jacket,
    shirt,
    skin = "#f2c9a3",
    hands = "down",
    hold,
    tie
}) => {
    const mitten = (x: number, y: number) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx={4} ry={3.6} fill={skin} stroke={INK} strokeWidth={L} />;
    const H: Record<string, [number, number][]> = {
        down: [[30, 70], [70, 70]],
        up: [[24, 30], [76, 30]],
        point: [[30, 70], [84, 46]],
        thumb: [[30, 70], [74, 52]],
        hold: [[30, 70], [74, 50]],
        frame: [[30, 46], [70, 46]],
        circle: [[30, 70], [72, 44]],
        snap: [[30, 70], [76, 34]]
    };
    const [l, r] = H[hands];
    return (
        <g>
            <path d="M28 82 C28 62 36 52 50 52 C64 52 72 62 72 82Z" fill={jacket} stroke={INK} strokeWidth={L} />
            {shirt && <path d="M44 52 L50 66 L56 52Z" fill={shirt} stroke={INK} strokeWidth={L * 0.8} />}
            {shirt && (
                <g>
                    {/* lapels and buttons */}
                    <path d="M44 52 L41 60 L46 59 L50 66z M56 52 L59 60 L54 59 L50 66z" fill="#000" fillOpacity={0.18} stroke={INK} strokeWidth={L * 0.6} />
                    <circle cx={50} cy={71} r={0.9} fill="#000" fillOpacity={0.45} />
                    <circle cx={50} cy={77} r={0.9} fill="#000" fillOpacity={0.45} />
                    <path d="M37 64 h6" stroke="#000" strokeOpacity={0.25} strokeWidth={1.2} />
                </g>
            )}
            {tie && <path d="M49 55 l-2 3 l3 12 l3 -12 l-2 -3z" fill={tie} stroke={INK} strokeWidth={L * 0.6} />}
            <path d={`M36 60 Q${(36 + l[0]) / 2 - 4} ${(60 + l[1]) / 2} ${l[0]} ${l[1]}`} fill="none" stroke={jacket} strokeWidth={6} strokeLinecap="round" />
            <path d={`M64 60 Q${(64 + r[0]) / 2 + 4} ${(60 + r[1]) / 2} ${r[0]} ${r[1]}`} fill="none" stroke={jacket} strokeWidth={6} strokeLinecap="round" />
            {hold && <g transform={`translate(${r[0]} ${r[1]})`}>{hold}</g>}
            {mitten(l[0], l[1])}
            {mitten(r[0], r[1])}
            {hands === "thumb" && <rect x={r[0] - 1.4} y={r[1] - 8} width={2.8} height={6} rx={1.4} fill={skin} stroke={INK} strokeWidth={L} />}
            {hands === "point" && <rect x={r[0] + 2} y={r[1] - 1.4} width={6} height={2.8} rx={1.4} fill={skin} stroke={INK} strokeWidth={L} />}
            {hands === "circle" && <circle cx={r[0]} cy={r[1] - 5} r={2.4} fill="none" stroke={INK} strokeWidth={L * 1.4} />}
        </g>
    );
};

const Bg: React.FC<{ fill: string; children?: React.ReactNode }> = ({ fill, children }) => (
    <>
        <rect x={-5} y={-5} width={110} height={90} fill={fill} />
        {children}
    </>
);

const SKIN = { light: "#f2c9a3", tan: "#e0ad83", olive: "#d9a27a", brown: "#9a6845", deep: "#6e4a31", purple: "#8b6aa6", yellow: "#f5d23c", grey: "#d8d4cc" };

/** Teddy KGB: the shared base for his three lines. */
const Kgb: React.FC<{ eyes?: Eyes; mouth?: Mouth; hold?: React.ReactNode; hands?: "down" | "hold" | "point" }> = ({ eyes = "smug", mouth = "smirk", hold, hands = "hold" }) => (
    <>
        <Bg fill="#2f4a3a">
            <ellipse cx={50} cy={6} rx={30} ry={8} fill="#f4e6a8" opacity={0.25} />
        </Bg>
        <Body jacket="#3b3f6b" shirt="#f2f2f2" hands={hands} hold={hold} />
        <path d="M30 78 L28 82 M70 78 L72 82" stroke="#fff" strokeWidth={2} />
        <Head skin={SKIN.light} shape="egg" ears />
        <Nose big />
        <Lines d="M38 46 q2 2 1 4 M62 46 q-2 2 -1 4 M42 12 q8 -3 16 0" />
        {/* bald on top, slicked dark sides */}
        <path d="M29 30 C28 20 32 16 34 26z M71 30 C72 20 68 16 66 26z" fill="#3a2b22" stroke={INK} strokeWidth={L} />
        <CutEyes kind={eyes} />
        <path d="M43 20 l6 2 M57 20 l-6 2" stroke={INK} strokeWidth={L * 1.4} />
        <CutMouth kind={mouth} />
    </>
);

const Oreo = (
    <g>
        <circle r={5} fill="#2b1d16" stroke={INK} strokeWidth={L} />
        <circle r={3.6} fill="#f2ede4" />
        <circle r={3.6} fill="none" stroke="#2b1d16" strokeWidth={0.8} strokeDasharray="0.8 0.8" />
    </g>
);

const Thanos: React.FC<{ hold: React.ReactNode; hands: "snap" | "hold" }> = ({ hold, hands }) => (
    <>
        <Bg fill="#1d1638">
            {[[12, 10], [88, 14], [20, 60], [84, 58], [64, 8], [8, 36]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r={0.9} fill="#fff" />
            ))}
        </Bg>
        <Body jacket="#3e4a8a" skin={SKIN.purple} hands={hands} hold={hold} />
        <path d="M30 60 C34 54 42 52 46 54 L40 64z M70 60 C66 54 58 52 54 54 L60 64z" fill="#d6a531" stroke={INK} strokeWidth={L} />
        <Head skin={SKIN.purple} shape="jaw" />
        <Lines d="M36 18 q14 -6 28 0 M30 34 q4 2 6 0 M64 34 q4 2 6 0" color="#4f2f6e" />
        <Nose />
        <path d="M44 48 v4 M48 49 v5 M52 49 v5 M56 48 v4" stroke="#4f2f6e" strokeWidth={L} />
        <CutEyes kind="smug" />
        <CutMouth kind="smirk" y={42} />
    </>
);

export const MOVIE_ART: Record<string, () => React.ReactElement> = {
    "pay-that-man": () => <Kgb eyes="smug" mouth="smirk" hold={<Obj spec="cash" x={0} y={-6} s={0.34} />} />,
    nyet: () => <Kgb eyes="angry" mouth="frown" hold={Oreo} />,
    "splash-the-pot": () => (
        <>
            <Kgb eyes="crazy" mouth="grin" hands="point" />
            <ChipPile x={82} y={74} k={0.8} />
        </>
    ),
    "spot-the-sucker": () => (
        <>
            <Bg fill="#1f4f3a" />
            <Body jacket="#6d7f96" shirt="#f2f2f2" hands="hold" hold={<g transform="rotate(10)"><rect x={-5} y={-12} width={8} height={11} rx={1} fill="#fff" stroke={INK} strokeWidth={L} /><rect x={-1} y={-11} width={8} height={11} rx={1} fill="#fff" stroke={INK} strokeWidth={L} /></g>} />
            <Head skin={SKIN.light} shape="round" ears />
            <Nose />
            <Lines d="M49 50 v2" />
            <path d="M29 26 C28 10 44 8 52 12 C60 8 72 12 71 26 C66 18 56 16 50 18 C42 16 34 18 29 26z" fill="#8a5a33" stroke={INK} strokeWidth={L} />
            <CutEyes kind="smug" look={1.4} />
            <CutMouth kind="smirk" />
        </>
    ),
    "show-me-the-money": () => (
        <>
            <Bg fill="#5c86b5">
                {[[16, 14, -20], [84, 12, 15], [86, 50, 30], [12, 52, -10]].map(([x, y, r]) => (
                    <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
                        <rect x={-7} y={-4} width={14} height={8} rx={1} fill="#6cc78a" stroke={INK} strokeWidth={0.8} />
                        <text x={0} y={0.4} textAnchor="middle" dominantBaseline="central" fontSize={6} fontWeight={900} fill="#1d5e33">$</text>
                    </g>
                ))}
            </Bg>
            <Body jacket="#2e2f36" shirt="#ffffff" tie="#8a1f2b" hands="hold" hold={<g><rect x={-3} y={-12} width={6} height={13} rx={1.5} fill="#1d1d1d" /></g>} />
            {/* the famous grin: all teeth, eyes too wide */}
            <Head skin={SKIN.light} shape="square" ears />
            <Nose />
            <Lines d="M33 40 q2 4 4 5 M67 40 q-2 4 -4 5" />
            <path d="M30 24 C28 8 46 4 56 8 C66 6 74 14 70 26 C66 18 60 14 54 16 C46 12 36 16 30 24z" fill="#3a2717" stroke={INK} strokeWidth={L} />
            <CutEyes kind="crazy" size={1.05} />
            <CutMouth kind="grin" y={44} w={1.15} />
        </>
    ),
    "ill-be-back": () => (
        <>
            <Bg fill="#c7642a">
                <rect x={-5} y={50} width={110} height={40} fill="#5a3a26" />
            </Bg>
            <Body jacket="#1a1a1c" shirt="#2c2c30" hands="thumb" />
            <Head skin={SKIN.tan} shape="block" ears />
            <Nose big />
            <Lines d="M34 38 q2 5 6 7 M66 38 q-2 5 -6 7 M44 50 h12" />
            {/* flat-top */}
            <path d="M30 22 L30 12 L70 12 L70 22 C62 18 38 18 30 22z" fill="#4a3426" stroke={INK} strokeWidth={L} />
            <path d="M32 24 h36 v4 q-2 7 -9 7 q-6 0 -8 -5 h-2 q-2 5 -8 5 q-7 0 -9 -7z" fill="#111" />
            <circle cx={60} cy={28} r={1.6} fill="#ff3b30" />
            <CutMouth kind="flat" y={44} />
        </>
    ),
    "little-friend": () => (
        <>
            <Bg fill="#e8a6b5">
                <path d="M-5 60 h110 v30 h-110z" fill="#f2f2f2" />
            </Bg>
            <Body jacket="#f4f1ea" shirt="#b3212b" hands="hold" hold={<g transform="translate(0 -4)"><ChipPile x={0} y={6} k={0.9} /></g>} />
            <Head skin={SKIN.olive} shape="narrow" />
            <Nose hook />
            <Stubble y={47} w={11} />
            <path d="M30 24 C28 10 46 6 56 8 C68 8 74 16 70 26 C64 16 50 16 42 18 C36 18 32 22 30 24z" fill="#161616" stroke={INK} strokeWidth={L} />
            <CutEyes kind="crazy" />
            <path d="M34 34 l6 6" stroke="#9b3b3b" strokeWidth={1.4} />
            <CutMouth kind="shout" y={43} />
        </>
    ),
    "shall-not-pass": () => (
        <>
            <Bg fill="#2b1a14">
                <ellipse cx={50} cy={86} rx={60} ry={16} fill="#e8592a" opacity={0.6} />
            </Bg>
            <Body jacket="#8d8d93" skin={SKIN.light} hands="up" />
            <path d="M24 30 V82" stroke="#7a5230" strokeWidth={3} />
            <circle cx={24} cy={27} r={3.6} fill="#e8f4ff" stroke={INK} strokeWidth={L} />
            <Head skin={SKIN.light} shape="long" />
            <Nose big y={37} />
            <path d="M32 36 C30 56 44 74 50 80 C56 74 70 56 68 36 C60 44 40 44 32 36z" fill="#e4e4e4" stroke={INK} strokeWidth={L} />
            <path d="M26 18 C36 12 64 12 76 18 C64 16 36 16 26 18z" fill="#8d8d93" stroke={INK} strokeWidth={L} />
            <path d="M36 16 C40 6 48 -6 58 -12 C58 0 62 8 64 16z" fill="#8d8d93" stroke={INK} strokeWidth={L} />
            <path d="M38 21 l8 3 M62 21 l-8 3" stroke="#bdbdbd" strokeWidth={2.4} strokeLinecap="round" />
            <CutEyes kind="angry" y={28} />
            <CutMouth kind="shout" y={42} w={0.8} />
        </>
    ),
    "one-does-not-simply": () => (
        <>
            <Bg fill="#8c8a80" />
            <Body jacket="#6b4a2f" skin={SKIN.light} hands="circle" />
            <path d="M30 58 C36 52 64 52 70 58 C64 56 36 56 30 58z" fill="#cdb48c" stroke={INK} strokeWidth={L} />
            <Head skin={SKIN.light} shape="long" />
            <Nose y={37} />
            <Lines d="M38 16 q4 -2 8 0" />
            <path d="M29 30 C24 44 28 56 32 58 L34 30z M71 30 C76 44 72 56 68 58 L66 30z" fill="#6b4a2f" stroke={INK} strokeWidth={L} />
            <path d="M30 24 C30 10 70 10 70 24 C62 16 38 16 30 24z" fill="#6b4a2f" stroke={INK} strokeWidth={L} />
            <path d="M36 40 C38 50 46 52 50 52 C54 52 62 50 64 40 C58 46 42 46 36 40z" fill="#7a5532" stroke={INK} strokeWidth={L} />
            <CutEyes kind="sad" />
            <CutMouth kind="flat" y={43} />
        </>
    ),
    "why-so-serious": () => (
        <>
            <Bg fill="#3a3550" />
            <Body jacket="#6b3f8f" shirt="#5fae5a" hands="down" />
            <Head skin="#f4f1ea" shape="narrow" />
            <Nose />
            <path d="M28 26 l-6 -6 l7 0 l-3 -8 l7 4 l2 -8 l4 7 l5 -8 l3 8 l5 -7 l1 8 l6 -4 l-2 8 l7 0 l-6 6 C60 18 40 18 28 26z" fill="#5fae5a" stroke={INK} strokeWidth={L} />
            <ellipse cx={43.6} cy={28} rx={8} ry={9} fill="#2a2a3a" opacity={0.75} />
            <ellipse cx={56.4} cy={28} rx={8} ry={9} fill="#2a2a3a" opacity={0.75} />
            <CutEyes kind="crazy" size={0.9} />
            <path d="M34 40 C40 48 60 48 66 38 C60 44 40 46 34 40z" fill="#c8232c" opacity={0.9} />
            <path d="M34 40 l-3 -3 M66 38 l3 -3" stroke="#c8232c" strokeWidth={1.6} />
        </>
    ),
    inevitable: () => <Thanos hands="snap" hold={<g><path d="M-6 4 h12 v-10 q-6 -4 -12 0z" fill="#d6a531" stroke={INK} strokeWidth={L} />{["#e8566f", "#3d7fd6", "#5fae5a", "#f2b632", "#8a5fb3"].map((c, i) => <circle key={c} cx={-4 + i * 2} cy={-4} r={0.9} fill={c} />)}</g>} />,
    "perfectly-balanced": () => <Thanos hands="hold" hold={<Obj spec="scales" x={0} y={-8} s={0.3} />} />,
    "its-a-trap": () => (
        <>
            <Bg fill="#5d6a78">
                <rect x={-5} y={-5} width={110} height={14} fill="#3e4855" />
            </Bg>
            <Body jacket="#eeeeee" skin="#d97b46" hands="down" />
            {/* the admiral: orange, bulging side eyes */}
            <ellipse cx={50} cy={30} rx={18} ry={22} fill="#d97b46" stroke={INK} strokeWidth={L} />
            <ellipse cx={33} cy={24} rx={7} ry={8} fill="#f5d23c" stroke={INK} strokeWidth={L} />
            <ellipse cx={67} cy={24} rx={7} ry={8} fill="#f5d23c" stroke={INK} strokeWidth={L} />
            <circle cx={31} cy={24} r={2.6} fill={INK} />
            <circle cx={69} cy={24} r={2.6} fill={INK} />
            <path d="M42 44 q8 6 16 0" fill="none" stroke={INK} strokeWidth={L * 1.4} />
            <path d="M40 12 q10 -4 20 0" fill="none" stroke="#b4602f" strokeWidth={1.2} />
        </>
    ),
    "big-mistake": () => (
        <>
            <Bg fill="#f3eee6">
                <rect x={-5} y={56} width={110} height={30} fill="#d8cdbb" />
            </Bg>
            <Body jacket="#ffffff" skin={SKIN.light} hands="hold" hold={<Obj spec="shopping-bag" x={0} y={-6} s={0.32} />} />
            {/* big red curls */}
            <path d="M26 40 C18 20 30 4 50 4 C70 4 82 20 74 40 C72 52 66 56 64 46 C60 30 40 30 36 46 C34 56 28 52 26 40z" fill="#a8432b" stroke={INK} strokeWidth={L} />
            <Head skin={SKIN.light} w={18} h={18} />
            <Nose />
            <Lines d="M36 40 q1 3 3 4 M64 40 q-1 3 -3 4" />
            <path d="M34 20 C40 10 60 10 66 20 C58 14 42 14 34 20z" fill="#a8432b" stroke={INK} strokeWidth={L} />
            <CutEyes kind="smug" size={0.9} />
            <CutMouth kind="grin" y={42} w={1.2} />
        </>
    ),
    "captain-now": () => (
        <>
            <Bg fill="#3b6d8f">
                <path d="M-5 64 q20 -6 40 0 t40 0 t40 0 v30 h-120z" fill="#24506e" />
            </Bg>
            <Body jacket="#6d8a5a" skin={SKIN.deep} hands="point" />
            <Head skin={SKIN.deep} shape="narrow" ears />
            <Nose />
            <Lines d="M37 36 q2 3 4 3 M63 36 q-2 3 -4 3" color="#3d281a" />
            <path d="M34 18 C36 10 64 10 66 18 C58 14 42 14 34 18z" fill="#1d1d1d" stroke={INK} strokeWidth={L} />
            <CutEyes kind="wide" size={1.05} />
            <CutMouth kind="flat" y={45} />
        </>
    ),
    "not-great": () => (
        <>
            <Bg fill="#5e6a5a">
                <rect x={6} y={6} width={22} height={14} rx={2} fill="#2c332b" stroke={INK} strokeWidth={L} />
                <text x={17} y={13.5} textAnchor="middle" dominantBaseline="central" fontFamily="'Courier New', monospace" fontWeight={900} fontSize={8} fill="#ffb03a">3.6</text>
            </Bg>
            <Body jacket="#2e3138" shirt="#ffffff" tie="#5a4636" hands="down" />
            <Head skin={SKIN.light} shape="wide" ears />
            <Nose big />
            <Lines d="M30 42 q3 4 7 5 M70 42 q-3 4 -7 5" />
            <path d="M30 24 C30 14 70 14 70 24 C64 20 36 20 30 24z" fill="#8f8a80" stroke={INK} strokeWidth={L} />
            <CutEyes kind="smug" />
            <CutMouth kind="flat" y={43} />
        </>
    ),
    "over-9000": () => (
        <>
            <Bg fill="#4d7bb8" />
            <Body jacket="#2a3f8a" skin={SKIN.light} hands="down" />
            <path d="M30 60 C34 54 42 52 46 54 L40 64z M70 60 C66 54 58 52 54 54 L60 64z" fill="#f2f2f2" stroke={INK} strokeWidth={L} />
            <Head skin={SKIN.light} shape="narrow" />
            <Nose />
            {/* the tall flame of hair and the widow's peak */}
            <path d="M28 26 L22 -2 L34 10 L36 -12 L44 6 L50 -16 L56 6 L64 -12 L66 10 L78 -2 L72 26 C66 20 56 18 50 24 C44 18 34 20 28 26z" fill="#151515" stroke={INK} strokeWidth={L} />
            <CutEyes kind="angry" />
            <rect x={56} y={22} width={12} height={10} rx={1.5} fill="#5fd36a" opacity={0.6} stroke={INK} strokeWidth={L} />
            <CutMouth kind="teeth" y={43} w={0.8} />
        </>
    ),
    "absolute-cinema": () => (
        <>
            <Bg fill="#1a1a1a">
                <path d="M30 -5 L10 90 H90 L70 -5z" fill="#fff6c2" opacity={0.18} />
            </Bg>
            <Body jacket="#2a2a2e" shirt="#ffffff" skin={SKIN.light} hands="frame" />
            <Head skin={SKIN.light} shape="round" ears />
            <Nose big y={37} />
            <path d="M30 24 C30 12 70 12 70 24 C64 18 36 18 30 24z" fill="#cfcac0" stroke={INK} strokeWidth={L} />
            <CutEyes kind="closed" />
            <path d="M34 18 q8 -5 14 0 M52 18 q8 -5 14 0" stroke="#2a2a2a" strokeWidth={3} strokeLinecap="round" fill="none" />
            <g fill="none" stroke={INK} strokeWidth={L * 1.2}>
                <rect x={36} y={22} width={12} height={10} rx={3} />
                <rect x={52} y={22} width={12} height={10} rx={3} />
            </g>
            <CutMouth kind="smile" y={43} />
        </>
    ),
    "chicken-dinner": () => (
        <>
            <Bg fill="#7a1f2b">
                {[[12, 12], [88, 10], [20, 58], [84, 60]].map(([x, y]) => (
                    <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} fill="#f2c94c" />
                ))}
            </Bg>
            <Body jacket="#151515" shirt="#ffffff" tie="#151515" hands="hold" hold={<Obj spec="drumstick" x={0} y={-6} s={0.32} />} />
            <Head skin={SKIN.light} shape="round" ears />
            <Nose />
            <path d="M30 24 C28 10 70 8 70 24 C62 16 40 16 30 24z" fill="#3a2717" stroke={INK} strokeWidth={L} />
            <CutEyes kind="smug" />
            <CutMouth kind="grin" y={43} />
        </>
    )
};

/** Which stickers are movie / TV lines, and who says them (for the a11y label and docs). */
export const MOVIE_SPEAKERS: Record<string, string> = {
    "pay-that-man": "Teddy KGB",
    nyet: "Teddy KGB",
    "splash-the-pot": "Teddy KGB",
    "spot-the-sucker": "Mike McDermott",
    "show-me-the-money": "Jerry Maguire",
    "ill-be-back": "The Terminator",
    "little-friend": "Tony Montana",
    "shall-not-pass": "Gandalf",
    "one-does-not-simply": "Boromir",
    "why-so-serious": "The Joker",
    inevitable: "Thanos",
    "perfectly-balanced": "Thanos",
    "its-a-trap": "Admiral Ackbar",
    "big-mistake": "Vivian",
    "captain-now": "Muse",
    "not-great": "Dyatlov",
    "over-9000": "Vegeta",
    "absolute-cinema": "Martin Scorsese",
    "chicken-dinner": "a Vegas card counter"
};

// ── The big movie-line set: quick cut-out characters from a few traits ────────

type Hair = "short" | "long" | "bald" | "slick" | "curly" | "spiky" | "side" | "messy" | "receding" | "afro" | "shaggy" | "girl" | "crop" | "bob";
type Extra = "shades" | "glasses" | "beard" | "stubble" | "mustache" | "thinstache" | "scar" | "visor" | "lashes" | "lips" | "jowls" | "rose" | "bowtie";
interface Who2 {
    skin: string;
    hair: Hair;
    hairCol?: string;
    jacket: string;
    shirt?: string;
    tie?: string;
    eyes?: Eyes;
    mouth?: Mouth;
    shape?: Shape;
    extras?: Extra[];
    hat?: string;
    hold?: string;
    hands?: "down" | "up" | "point" | "thumb" | "hold" | "frame";
    bg: string;
    custom?: () => React.ReactElement;
}

const HAIR = (h: Hair, c: string): React.ReactNode => {
    const st = { fill: c, stroke: INK, strokeWidth: L };
    switch (h) {
        case "long":
            return <path d="M28 34 C22 14 34 6 50 6 C66 6 78 14 72 34 C70 52 66 58 64 44 C62 22 38 22 36 44 C34 58 30 52 28 34z" {...st} />;
        case "slick":
            // combed straight back, hairline high, comb grooves — hair, not a cap
            return (
                <g>
                    <path d="M30 22 C30 12 40 9 50 9 C60 9 70 12 70 22 C66 18 60 16 50 16 C40 16 34 18 30 22z" {...st} />
                    <path d="M36 16 q6 -5 14 -5 M42 15 q6 -4 14 -3 M54 15 q6 -3 12 0" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.6} />
                </g>
            );
        case "curly":
            return <path d="M27 30 C20 18 30 4 42 8 C46 2 56 2 60 8 C72 4 80 18 73 30 C68 18 32 18 27 30z" {...st} />;
        case "spiky":
            return <path d="M29 24 l-4 -12 l9 6 l2 -12 l7 9 l7 -12 l5 12 l8 -9 l1 12 l9 -6 l-4 12 C62 18 38 18 29 24z" {...st} />;
        case "side":
            return <path d="M29 26 C28 10 44 8 52 12 C60 8 72 12 71 26 C66 18 56 16 50 18 C42 16 34 18 29 26z" {...st} />;
        case "messy":
            return <path d="M28 26 l-3 -8 l6 2 l0 -8 l6 5 l4 -8 l4 7 l6 -8 l3 8 l7 -5 l-1 8 l6 -1 l-4 8 C62 18 38 18 28 26z" {...st} />;
        case "receding":
            return <path d="M29 30 C28 20 32 16 35 26z M71 30 C72 20 68 16 65 26z M42 12 q8 -3 16 0" {...st} />;
        case "bald":
            return null;
        case "afro":
            // a short, tight afro: close to the head, bumpy edge
            return (
                <g>
                    <path d="M28 26 C26 12 36 4 50 4 C64 4 74 12 72 26 C70 20 62 17 50 17 C38 17 30 20 28 26z" {...st} />
                    {[[33, 12], [40, 8], [48, 6], [56, 7], [63, 10], [68, 16], [30, 18], [44, 12], [54, 11]].map(([x, y]) => (
                        <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} fill="none" stroke="#000" strokeWidth={0.5} opacity={0.45} />
                    ))}
                </g>
            );
        case "shaggy":
            // shaggy, over the ears and forehead
            return <path d="M27 34 C24 14 36 6 50 6 C64 6 76 14 73 34 L69 30 L68 24 L63 22 L60 26 L56 21 L52 25 L48 20 L44 25 L40 21 L37 26 L33 22 L31 30z" {...st} />;
        case "girl":
            // long hair with a side part and fringe, falling past the shoulders
            return (
                <g>
                    <path d="M27 30 C22 12 36 4 50 4 C64 4 78 12 73 30 C74 46 72 60 66 62 C66 46 64 34 62 26 C56 18 46 16 38 24 C36 34 34 46 34 62 C28 60 26 46 27 30z" {...st} />
                    <path d="M38 24 C44 14 58 12 66 20" fill="none" stroke="#000" strokeWidth={0.6} opacity={0.4} />
                </g>
            );
        case "bob":
            return <path d="M27 32 C24 14 36 5 50 5 C64 5 76 14 73 32 L72 42 C70 44 67 44 66 42 L64 22 C56 16 44 16 36 22 L34 42 C33 44 30 44 28 42z" {...st} />;
        case "crop":
            // close-cropped: a thin layer with a ragged fringe (Bond)
            return <path d="M30 22 C30 12 40 8 50 8 C60 8 70 12 70 22 L67 20 L64 22 L61 19 L58 21 L55 18 L52 21 L49 18 L46 21 L43 18 L40 21 L37 19 L34 22z" {...st} />;
        case "short":
            return <path d="M29 23 C29 11 40 7 50 7 C60 7 71 11 71 23 L68 20 L64 21 L60 18 L56 20 L52 17 L48 20 L44 17 L40 20 L36 18 L32 21z" {...st} />;
        default:
            return <path d="M29 24 C28 12 70 10 71 24 C64 17 36 17 29 24z" {...st} />;
    }
};

const EXTRA = (e: Extra): React.ReactNode => {
    switch (e) {
        case "shades":
            return <path d="M32 24 h36 v4 q-2 7 -9 7 q-6 0 -8 -5 h-2 q-2 5 -8 5 q-7 0 -9 -7z" fill="#111" />;
        case "glasses":
            return (
                <g fill="none" stroke={INK} strokeWidth={L * 1.2}>
                    <rect x={36} y={22} width={12} height={10} rx={3} />
                    <rect x={52} y={22} width={12} height={10} rx={3} />
                </g>
            );
        case "beard":
            return <path d="M32 38 C34 52 44 56 50 56 C56 56 66 52 68 38 C60 46 40 46 32 38z" fill="#5a3f2a" stroke={INK} strokeWidth={L} />;
        case "stubble":
            return <Stubble y={46} w={11} />;
        case "mustache":
            return <path d="M42 39 q8 -4 16 0 q-8 2 -16 0z" fill="#3a2717" stroke={INK} strokeWidth={L * 0.6} />;
        case "scar":
            return <path d="M30 14 l10 10 M33 13 l1 3 M36 16 l1 3" stroke="#9b3b3b" strokeWidth={1.4} />;
        case "thinstache":
            return <path d="M43 39.5 q7 -2.4 14 0" fill="none" stroke="#5a5a5a" strokeWidth={1.4} strokeLinecap="round" />;
        case "jowls":
            return <path d="M32 38 q2 8 8 11 M68 38 q-2 8 -8 11 M42 45 q-3 2 -2 5 M58 45 q3 2 2 5" fill="none" stroke={INK} strokeWidth={0.8} strokeLinecap="round" opacity={0.7} />;
        case "rose":
            return (
                <g>
                    <circle cx={60} cy={60} r={2.6} fill="#c8232c" stroke={INK} strokeWidth={0.6} />
                    <path d="M59 58.6 q1 1.4 2 0" fill="none" stroke="#7a1218" strokeWidth={0.5} />
                    <path d="M61.5 62 l2 2" stroke="#3f6a3a" strokeWidth={0.9} />
                </g>
            );
        case "bowtie":
            return <path d="M45 54 l5 2.4 l5 -2.4 v5 l-5 -2.4 l-5 2.4z" fill="#111" stroke={INK} strokeWidth={0.5} />;
        case "lashes":
            return <path d="M37 21 l-2 -3 M40 20 l-1 -3 M43 20 l0 -3 M57 20 l0 -3 M60 20 l1 -3 M63 21 l2 -3" stroke={INK} strokeWidth={0.9} strokeLinecap="round" />;
        case "lips":
            return <path d="M45 42 q5 3 10 0 q-5 -2 -10 0z" fill="#d0556a" stroke={INK} strokeWidth={0.6} />;
        case "visor":
            return <path d="M30 20 q20 -8 40 0 l4 4 q-24 -6 -48 0z" fill="#5f8f5a" stroke={INK} strokeWidth={L} />;
    }
};

function quick(w: Who2): () => React.ReactElement {
    if (w.custom) return w.custom;
    return () => (
        <>
            <Bg fill={w.bg} />
            <Body jacket={w.jacket} shirt={w.shirt} tie={w.tie} skin={w.skin} hands={w.hands ?? (w.hold ? "hold" : "down")} hold={w.hold ? <Obj spec={w.hold} x={0} y={-6} s={0.3} /> : undefined} />
            <Head skin={w.skin} shape={w.shape ?? "round"} ears={!["afro", "long", "girl", "bob", "shaggy", "curly"].includes(w.hair)} />
            <Nose />
            {HAIR(w.hair, w.hairCol ?? "#3a2717")}
            <CutEyes kind={w.eyes ?? "plain"} />
            {(w.extras ?? []).map(e => (
                <React.Fragment key={e}>{EXTRA(e)}</React.Fragment>
            ))}
            <CutMouth kind={w.mouth ?? "flat"} />
            {w.hat && <Obj spec={w.hat} x={50} y={8} s={0.42} />}
        </>
    );
}

const S2 = SKIN;
/** id → [label, who says it, look]. Pairs: the comeback's id ends in "-reply". */
export const MOVIE_LINES_2: [string, string, string, Who2][] = [
    ["breakfast", "I eat pieces of shit like you for breakfast", "Shooter McGavin", { skin: S2.light, hair: "side", hairCol: "#2a1d14", jacket: "#2f3f66", shirt: "#f2f2f2", eyes: "angry", mouth: "smirk", bg: "#7fae6a", extras: ["mustache"] }],
    ["breakfast-reply", "You eat pieces of shit for breakfast?", "Happy Gilmore", { skin: S2.light, hair: "shaggy", hairCol: "#5a3a22", jacket: "#151515", shirt: "#e8b84a", eyes: "wide", mouth: "o", bg: "#7fae6a", hold: "chip" }],
    ["want-the-truth", "I want the truth!", "Lt. Kaffee", { skin: S2.light, hair: "side", hairCol: "#2a1d14", jacket: "#f4f4f4", shirt: "#ffffff", tie: "#111", eyes: "angry", mouth: "shout", shape: "square", bg: "#7a5a3a" }],
    ["want-the-truth-reply", "You can't handle the truth!", "Col. Jessup", { skin: S2.light, hair: "receding", hairCol: "#8f8a80", jacket: "#2e3d2a", shirt: "#c8b78f", eyes: "angry", mouth: "shout", bg: "#7a5a3a" }],
    [
        "your-father",
        "I am your father",
        "Darth Vader",
        {
            skin: "#111",
            hair: "bald",
            jacket: "#111",
            bg: "#2a2f45",
            custom: () => (
                <>
                    <Bg fill="#2a2f45" />
                    <Body jacket="#111" skin="#111" hands="point" />
                    <path d="M28 40 C26 14 40 6 50 6 C60 6 74 14 72 40 L66 52 H34 Z" fill="#151515" stroke="#555" strokeWidth={L} />
                    <path d="M38 26 l8 0 l-2 6 h-6z M62 26 l-8 0 l2 6 h6z" fill="#3a3f4a" />
                    <path d="M44 40 l6 10 l6 -10 M46 44 h8" fill="none" stroke="#777" strokeWidth={L} />
                </>
            )
        }
    ],
    ["your-father-reply", "Noooooo!", "Luke Skywalker", { skin: S2.light, hair: "side", hairCol: "#d9b26a", jacket: "#2a2a2a", eyes: "sad", mouth: "shout", bg: "#2a2f45", hands: "up" }],
    ["big-deal", "I'm kind of a big deal", "Ron Burgundy", { skin: S2.light, hair: "side", hairCol: "#5a3f2a", jacket: "#8a2f2f", shirt: "#ffffff", tie: "#d6a531", extras: ["mustache"], eyes: "smug", mouth: "smirk", bg: "#3b5a8a" }],
    ["big-deal-reply", "Really?", "Veronica Corningstone", { skin: S2.light, hair: "girl", hairCol: "#e8c47a", extras: ["lashes", "lips"], jacket: "#c46a8a", eyes: "smug", mouth: "flat", bg: "#3b5a8a" }],
    ["find-you", "I will find you", "Bryan Mills", { skin: S2.light, hair: "short", hairCol: "#5a5a5a", jacket: "#1d1d1f", eyes: "angry", mouth: "flat", shape: "long", bg: "#2c3a40", hold: "phone" }],
    ["find-you-reply", "Good luck.", "Marko", { skin: S2.light, hair: "slick", hairCol: "#1d1d1d", jacket: "#3a3a3a", eyes: "smug", mouth: "smirk", bg: "#2c3a40", extras: ["stubble"] }],
    ["inconceivable", "Inconceivable!", "Vizzini", { skin: S2.light, hair: "receding", hairCol: "#3a2717", jacket: "#8a2f2f", eyes: "crazy", mouth: "shout", shape: "wide", bg: "#7d8f5a" }],
    ["inconceivable-reply", "You keep using that word…", "Inigo Montoya", { skin: S2.olive, hair: "long", hairCol: "#1d1d1d", jacket: "#2a2a2a", extras: ["mustache"], eyes: "smug", mouth: "flat", bg: "#7d8f5a" }],
    ["fetch", "That's so fetch!", "Gretchen Wieners", { skin: S2.light, hair: "girl", hairCol: "#5a3a22", extras: ["lashes", "lips"], jacket: "#e8a6c0", eyes: "wide", mouth: "smile", bg: "#f2c6d8" }],
    ["fetch-reply", "Stop trying to make fetch happen", "Regina George", { skin: S2.light, hair: "girl", hairCol: "#f0d27a", extras: ["lashes", "lips"], jacket: "#e85c8a", eyes: "smug", mouth: "frown", bg: "#f2c6d8" }],
    ["say-what", "Say 'what' again, motherf**ker!", "Jules", { skin: S2.brown, hair: "afro", hairCol: "#1d1d1d", jacket: "#151515", shirt: "#ffffff", tie: "#151515", extras: ["mustache"], eyes: "angry", mouth: "shout", bg: "#c79a3a", hands: "point" }],
    ["say-what-reply", "What?", "Brett", { skin: S2.light, hair: "side", hairCol: "#3a2717", jacket: "#6d8a9a", eyes: "wide", mouth: "o", bg: "#c79a3a" }],
    ["best-friends", "Did we just become best friends?", "Brennan", { skin: S2.light, hair: "side", hairCol: "#6b4a2f", jacket: "#5f7d9a", eyes: "wide", mouth: "grin", bg: "#e8c48a" }],
    ["best-friends-reply", "Yup!", "Dale", { skin: S2.light, hair: "short", hairCol: "#3a2717", jacket: "#8a5a3a", eyes: "wide", mouth: "grin", shape: "wide", bg: "#e8c48a", hands: "thumb" }],
    ["bigger-boat", "We're gonna need a bigger boat", "Chief Brody", { skin: S2.light, hair: "receding", hairCol: "#8f8a80", jacket: "#c8b78f", eyes: "wide", mouth: "flat", bg: "#3a7fb0", extras: ["glasses"] }],
    ["feel-lucky", "Do you feel lucky, punk?", "Harry Callahan", { skin: S2.tan, hair: "side", hairCol: "#7a5532", jacket: "#5a5a5a", tie: "#2a2a2a", shirt: "#ffffff", eyes: "angry", mouth: "flat", shape: "long", bg: "#7a6a5a", hands: "point" }],
    ["talkin-to-me", "You talkin' to me?", "Travis Bickle", { skin: S2.light, hair: "spiky", hairCol: "#2a1d14", jacket: "#5a4a2f", eyes: "angry", mouth: "smirk", shape: "narrow", bg: "#2f2f3a", hands: "point" }],
    ["cant-refuse", "An offer he can't refuse", "Vito Corleone", { skin: S2.light, hair: "slick", hairCol: "#a8a39a", jacket: "#141414", shirt: "#ffffff", extras: ["thinstache", "jowls", "bowtie", "rose"], eyes: "smug", mouth: "frown", shape: "jaw", bg: "#3a2a1d" }],
    ["entertained", "Are you not entertained?!", "Maximus", { skin: S2.tan, hair: "short", hairCol: "#2a1d14", jacket: "#7a5532", eyes: "angry", mouth: "shout", extras: ["beard"], bg: "#c79a5a", hands: "up" }],
    [
        "sparta",
        "This is Sparta!",
        "Leonidas",
        {
            skin: S2.tan,
            hair: "bald",
            jacket: "#8a1f1f",
            bg: "#c76a2a",
            custom: () => (
                <>
                    <Bg fill="#d9894a">
                        <ellipse cx={86} cy={82} rx={22} ry={8} fill="#2a1a10" />
                    </Bg>
                    {/* red cape behind, bronze-skinned body */}
                    <path d="M26 50 C20 64 18 76 20 82 H80 C82 76 80 64 74 50z" fill="#9a1f1f" stroke={INK} strokeWidth={L} />
                    <path d="M36 54 C36 66 40 76 44 82 H56 C60 76 64 66 64 54z" fill={S2.tan} stroke={INK} strokeWidth={L} />
                    <path d="M44 62 q6 3 12 0 M45 68 q5 2 10 0" fill="none" stroke="#8a5a3a" strokeWidth={0.8} />
                    {/* the kick: one leg straight out at the pit */}
                    <path d="M54 76 L84 66" stroke={INK} strokeWidth={9.6} strokeLinecap="round" />
                    <path d="M54 76 L84 66" stroke={S2.tan} strokeWidth={7} strokeLinecap="round" />
                    <path d="M82 62 l8 2 l-2 6 l-8 -1z" fill="#6b4a2f" stroke={INK} strokeWidth={L} />
                    <path d="M88 60 l4 -3 M90 66 h5 M88 72 l4 3" stroke={INK} strokeWidth={1.1} strokeLinecap="round" />
                    {/* arm out with a spear */}
                    <path d="M36 58 L18 40" stroke={INK} strokeWidth={7.4} strokeLinecap="round" />
                    <path d="M36 58 L18 40" stroke={S2.tan} strokeWidth={5} strokeLinecap="round" />
                    {/* no helmet in the kick: long dark hair, full beard, roaring */}
                    <path d="M28 34 C22 12 34 4 50 4 C66 4 78 12 72 34 C72 50 70 58 66 58 C66 42 64 30 60 24 C54 18 46 18 40 24 C36 30 34 42 34 58 C30 58 28 50 28 34z" fill="#1d1612" stroke={INK} strokeWidth={L} />
                    <Head skin={S2.tan} shape="square" />
                    <path d="M30 22 C32 10 44 6 50 6 C58 6 68 10 70 22 C64 16 56 14 50 14 C42 14 36 16 30 22z" fill="#1d1612" stroke={INK} strokeWidth={L} />
                    <path d="M32 36 C32 54 42 62 50 62 C58 62 68 54 68 36 C62 46 56 48 50 48 C44 48 38 46 32 36z" fill="#2a1d14" stroke={INK} strokeWidth={L} />
                    <CutEyes kind="angry" />
                    <Nose />
                    <CutMouth kind="shout" y={46} w={0.8} />
                </>
            )
        }
    ],
    ["not-leaving", "I'm not f**king leaving!", "Jordan Belfort", { skin: S2.light, hair: "slick", hairCol: "#8a5a33", jacket: "#2a2f45", shirt: "#ffffff", tie: "#8a1f2b", eyes: "crazy", mouth: "shout", bg: "#2f4a6a", hands: "hold", hold: "microphone" }],
    ["your-opinion", "That's just, like, your opinion, man", "The Dude", { skin: S2.light, hair: "long", hairCol: "#7a5532", jacket: "#c4a77a", extras: ["beard"], eyes: "smug", mouth: "flat", bg: "#8a6a9a" }],
    ["nearly-killed-me", "That last hand… nearly killed me", "James Bond", { skin: S2.light, hair: "crop", hairCol: "#d6b77a", jacket: "#151515", shirt: "#ffffff", tie: "#151515", eyes: "smug", mouth: "flat", shape: "square", bg: "#2a4a3a" }],
    ["in-or-out", "You're either in or you're out", "Danny Ocean", { skin: S2.light, hair: "short", hairCol: "#7a7a7a", jacket: "#2a2a2e", shirt: "#ffffff", eyes: "smug", mouth: "smirk", bg: "#5a2a3a", extras: ["stubble"] }],
    ["the-odds", "Never tell me the odds!", "Han Solo", { skin: S2.light, hair: "side", hairCol: "#5a3f2a", jacket: "#2a2a2a", shirt: "#f2f2f2", eyes: "smug", mouth: "smirk", bg: "#1d2440" }],
    ["droids", "These aren't the droids you're looking for", "Obi-Wan Kenobi", { skin: S2.light, hair: "short", hairCol: "#e4e4e4", jacket: "#a08060", extras: ["beard"], eyes: "smug", mouth: "flat", bg: "#c9a46a", hands: "frame" }],
    ["hasta-la-vista", "Hasta la vista, baby", "The T-800", { skin: S2.tan, hair: "short", hairCol: "#4a3426", jacket: "#1a1a1c", extras: ["shades"], mouth: "smirk", shape: "block", bg: "#c7642a", hands: "thumb" }],
    ["one-million", "One MILLION dollars", "Dr. Evil", { skin: S2.light, hair: "bald", jacket: "#8a8a8a", extras: ["scar"], eyes: "smug", mouth: "smirk", bg: "#3a3a5a", hands: "point" }],
    ["filthy-animal", "Keep the change, ya filthy animal", "Johnny (Home Alone)", { skin: S2.light, hair: "slick", hairCol: "#1d1d1d", jacket: "#3a3a3a", hat: "cowboy-hat", eyes: "angry", mouth: "smirk", bg: "#3a3a3a", hold: "cash" }],
    ["finds-a-way", "Life, uh, finds a way", "Ian Malcolm", { skin: S2.light, hair: "curly", hairCol: "#1d1d1d", jacket: "#151515", extras: ["glasses"], eyes: "smug", mouth: "smirk", bg: "#3f6a3a" }],
    ["king-of-the-world", "I'm the king of the world!", "Jack Dawson", { skin: S2.light, hair: "side", hairCol: "#c8a86a", jacket: "#f2f2f2", eyes: "wide", mouth: "grin", bg: "#5aa0d0", hands: "up" }],
    ["center-for-ants", "What is this? A center for ants?!", "Derek Zoolander", { skin: S2.light, hair: "slick", hairCol: "#c8a86a", jacket: "#e8e8e8", eyes: "angry", mouth: "shout", shape: "narrow", bg: "#d8d0c0" }],
    ["first-or-last", "If you ain't first, you're last", "Ricky Bobby", { skin: S2.light, hair: "short", hairCol: "#6b4a2f", jacket: "#2f6fc0", eyes: "wide", mouth: "grin", bg: "#e85c2a", hands: "thumb" }],
    ["bad-choice", "Milk was a bad choice", "Ron Burgundy", { skin: S2.light, hair: "side", hairCol: "#5a3f2a", jacket: "#8a2f2f", shirt: "#ffffff", tie: "#d6a531", extras: ["mustache"], eyes: "sad", mouth: "frown", bg: "#e8e0c8" }],
    ["dumber", "We are all now dumber for having listened to it", "The principal", { skin: S2.light, hair: "receding", hairCol: "#8f8a80", jacket: "#5a5a5a", shirt: "#ffffff", tie: "#2a2a2a", extras: ["glasses"], eyes: "smug", mouth: "frown", bg: "#c8c0a8" }],
    ["price-is-wrong", "The price is wrong, bitch!", "Happy Gilmore", { skin: S2.light, hair: "shaggy", hairCol: "#5a3a22", jacket: "#151515", shirt: "#e8b84a", eyes: "angry", mouth: "shout", bg: "#e8b84a", hands: "up" }],
    ["world-burn", "Some men just want to watch the world burn", "Alfred", { skin: S2.light, hair: "receding", hairCol: "#e4e4e4", jacket: "#151515", shirt: "#ffffff", tie: "#151515", extras: ["glasses"], eyes: "sad", mouth: "flat", bg: "#c75a2a" }],
    ["my-precious", "My precious", "Gollum", { skin: "#c8c4b0", hair: "bald", jacket: "#8a8070", eyes: "crazy", mouth: "teeth", shape: "egg", bg: "#3a3a2a", hold: "chip" }],
    ["them-apples", "How do you like them apples?", "Will Hunting", { skin: S2.light, hair: "short", hairCol: "#6b4a2f", jacket: "#6d7f96", eyes: "smug", mouth: "grin", bg: "#8a3a2a" }]
];

for (const [id, , speaker, who] of MOVIE_LINES_2) {
    MOVIE_ART[id] = quick(who);
    MOVIE_SPEAKERS[id] = speaker;
}

// The cast kit (cast.tsx) supersedes the quick drawings above for everyone it covers.
for (const [id, spec] of [...Object.entries(CAST), ...Object.entries(COMEBACK_CAST)]) {
    MOVIE_ART[id] = () => <Character c={spec} />;
    MOVIE_SPEAKERS[id] = spec.who;
}
