import React from "react";
import { ChipPile } from "./frame";
import { Obj } from "./scene";

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

/** The cut-out head: a wide, slightly squashed circle. */
const Head: React.FC<{ x?: number; y?: number; skin: string; w?: number; h?: number; chin?: boolean }> = ({ x = 50, y = 32, skin, w = 21, h = 19, chin }) => (
    <g>
        <ellipse cx={x} cy={y} rx={w} ry={h} fill={skin} stroke={INK} strokeWidth={L} />
        {chin && <path d={`M${x - 14} ${y + 12} q14 14 28 0`} fill={skin} stroke={INK} strokeWidth={L} />}
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
        <Head skin={SKIN.light} />
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
        <Head skin={SKIN.purple} h={20} chin />
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
            <Head skin={SKIN.light} />
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
            <Head skin={SKIN.light} />
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
            <Head skin={SKIN.tan} w={22} h={19} chin />
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
            <Head skin={SKIN.olive} />
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
            <Head skin={SKIN.light} />
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
            <Head skin={SKIN.light} />
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
            <Head skin="#f4f1ea" />
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
            <Head skin={SKIN.deep} w={18} h={21} />
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
            <Head skin={SKIN.light} />
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
            <Head skin={SKIN.light} />
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
            <Head skin={SKIN.light} />
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
            <Head skin={SKIN.light} />
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
