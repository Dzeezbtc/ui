import React from "react";

/**
 * Rage faces (block52-chat#2): the classic rage-comic reactions — the guy at his
 * computer, FFFUUU, Y U NO, Me Gusta, Forever Alone, Okay, Poker Face and the
 * rest — drawn in thin black line like the originals' look, each with its
 * catchphrase. These are our drawings of the expressions; if the originals are
 * ever licensed, a sticker's `art` URL swaps in the real image with no code
 * change. 100×76 art area.
 */
const I = "#111";
const W = 1.3;
const RED = "#e8483e";
const TEAR = "#5aa9e6";
const st = { stroke: I, strokeWidth: W, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

const Head: React.FC<{ d?: string; fill?: string }> = ({ d = "M22 34 C22 12 36 2 50 2 C64 2 78 12 78 34 C78 58 66 72 50 72 C34 72 22 58 22 34z", fill = "#fff" }) => <path d={d} fill={fill} stroke={I} strokeWidth={W} />;
const Dot: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 1.2 }) => <circle cx={x} cy={y} r={r} fill={I} />;
const Text: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string; rot?: number }> = ({ x, y, size, children, fill = I, rot = 0 }) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', Impact, sans-serif" fontWeight={900} fontSize={size} fill={fill} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
        {children}
    </text>
);

/** A stick-figure body under a head, with arms given as a path. */
const Stick: React.FC<{ arms?: string; y?: number }> = ({ arms = "M50 74 l-14 10 M50 74 l14 10", y = 72 }) => (
    <g {...st}>
        <path d={`M50 ${y} V84`} strokeWidth={W * 1.4} />
        <path d={arms} strokeWidth={W * 1.4} />
    </g>
);

/** A computer desk with a monitor, seen from the side (the screen faces left). */
const Desk: React.FC<{ screen?: React.ReactNode }> = ({ screen }) => (
    <g {...st}>
        <path d="M56 60 h44 M60 60 v20 M96 60 v20" />
        <rect x={66} y={22} width={30} height={26} rx={2} fill="#fff" />
        <rect x={69} y={25} width={24} height={20} fill="#e8eef6" stroke="none" />
        {screen}
        <path d="M80 48 v8 M74 56 h12" />
        <path d="M60 58 h18 l-2 2 h-14z" fill="#ddd" />
    </g>
);

export const RAGE_FACES: Record<string, { label: string; draw: () => React.ReactElement }> = {
    "rage-fffuuu": {
        label: "FFFUUUUU",
        draw: () => (
            <g>
                <Head fill={RED} d="M20 38 C20 14 34 5 50 5 C66 5 80 14 80 38 C80 62 68 75 50 75 C32 75 20 62 20 38z" />
                <g {...st}>
                    <path d="M28 18 l14 8 M72 18 l-14 8" strokeWidth={W * 2.2} />
                    <path d="M30 28 q6 -4 11 1 M59 29 q5 -5 11 -1" />
                    <Dot x={35} y={28} r={1} />
                    <Dot x={65} y={28} r={1} />
                    <path d="M28 42 h44 q-2 26 -22 26 q-20 0 -22 -26z" fill="#fff" />
                    <path d="M28 42 h44 M28.6 50 h42.8 M31 58 h38 M35 64 h30 M36 42 v20 M44 42 v24 M50 42 v26 M56 42 v24 M64 42 v20" strokeWidth={W * 0.8} />
                    <path d="M76 10 l3 -3 M22 12 l-3 -3 M84 30 l5 -2 M16 30 l-5 -2" />
                </g>
            </g>
        )
    },
    "rage-y-u-no": {
        label: "Y U NO fold?!",
        draw: () => (
            <g>
                <g {...st} strokeWidth={W * 1.4}>
                    <path d="M34 54 L14 18 M66 54 L86 18" />
                    <path d="M14 18 l-4 -4 M14 18 l-1 -6 M14 18 l3 -5 M86 18 l4 -4 M86 18 l1 -6 M86 18 l-3 -5" />
                </g>
                <Head d="M28 40 C28 18 38 8 50 8 C62 8 72 18 72 40 C72 60 62 72 50 72 C38 72 28 60 28 40z" />
                <g {...st}>
                    <path d="M34 28 l10 5 M66 28 l-10 5" strokeWidth={W * 1.8} />
                    <Dot x={40} y={36} />
                    <Dot x={60} y={36} />
                    <path d="M38 50 q12 -6 24 0 q-2 14 -12 14 q-10 0 -12 -14z" fill={I} />
                </g>
            </g>
        )
    },
    "rage-me-gusta": {
        label: "Me gusta",
        draw: () => (
            <g>
                <Head d="M20 38 C20 14 34 2 50 2 C68 2 80 14 80 38 C80 62 66 74 50 74 C34 74 20 62 20 38z" />
                <g {...st}>
                    {/* heavy-lidded, too-wide eyes with tiny pupils */}
                    <ellipse cx={37} cy={32} rx={10} ry={9} fill="#fff" />
                    <ellipse cx={63} cy={32} rx={10} ry={9} fill="#fff" />
                    <path d="M27 30 q10 -4 20 0 M53 30 q10 -4 20 0" strokeWidth={W * 1.6} />
                    <circle cx={37} cy={35} r={3.4} fill={I} />
                    <circle cx={63} cy={35} r={3.4} fill={I} />
                    <path d="M28 42 q9 4 18 0 M54 42 q9 4 18 0 M30 46 q7 3 14 0 M56 46 q7 3 14 0" strokeWidth={W * 0.6} />
                    {/* the little satisfied pucker */}
                    <path d="M42 58 q8 5 16 0 q-8 2 -16 0z" fill="#fff" />
                    <path d="M40 57 q-2 -2 -1 -4 M60 57 q2 -2 1 -4" strokeWidth={W * 0.7} />
                    <path d="M48 46 q2 4 0 6" strokeWidth={W * 0.8} />
                </g>
            </g>
        )
    },
    "rage-forever-alone": {
        label: "Forever alone",
        draw: () => (
            <g>
                <Head d="M16 44 C14 18 30 4 50 4 C70 4 86 18 84 44 C84 62 76 72 66 74 C60 76 40 76 34 74 C24 72 16 62 16 44z" />
                <g {...st}>
                    <path d="M28 34 q8 -6 14 0 M58 34 q8 -6 14 0" />
                    <path d="M28 36 q7 5 14 0 M58 36 q7 5 14 0" />
                    <path d="M40 58 q10 -3 20 0" />
                    <path d="M36 62 q14 6 28 0" strokeWidth={W * 0.7} />
                    <path d="M48 42 q-2 6 2 8" strokeWidth={W * 0.8} />
                </g>
                <g stroke={TEAR} strokeWidth={2.2} fill="none">
                    <path d="M32 40 q-2 8 0 16" />
                    <path d="M68 40 q2 8 0 16" />
                </g>
            </g>
        )
    },
    "rage-okay": {
        label: "Okay.",
        draw: () => (
            <g>
                <Head d="M30 38 C30 10 38 2 50 2 C62 2 70 10 70 38 C70 64 62 76 50 76 C38 76 30 64 30 38z" />
                <g {...st}>
                    <path d="M36 30 l10 3 M64 30 l-10 3" />
                    <path d="M37 38 q5 3 9 0 M54 38 q5 3 9 0" />
                    <path d="M45 62 q5 -2 10 0" />
                    <path d="M50 44 q-2 6 1 8" strokeWidth={W * 0.8} />
                </g>
            </g>
        )
    },
    "rage-challenge-accepted": {
        label: "Challenge accepted",
        draw: () => (
            <g>
                <g {...st} strokeWidth={W * 1.4}>
                    <path d="M50 66 V84 M30 74 L66 70 M70 74 L34 70" />
                </g>
                <Head d="M26 36 C26 14 38 4 50 4 C62 4 74 14 74 36 C74 56 64 66 50 66 C36 66 26 56 26 36z" />
                <g {...st}>
                    <path d="M33 26 q7 -4 13 0 M54 25 q7 -4 13 1" strokeWidth={W * 1.4} />
                    <path d="M34 32 h11 M55 32 h11" strokeWidth={W * 1.4} />
                    <Dot x={41} y={34} />
                    <Dot x={61} y={34} />
                    <path d="M38 50 q12 8 24 -4" strokeWidth={W * 1.4} />
                    <path d="M62 46 l3 -1" />
                </g>
            </g>
        )
    },
    "rage-poker-face": {
        label: "Poker face",
        draw: () => (
            <g>
                <Head d="M26 38 C26 14 36 4 50 4 C64 4 74 14 74 38 C74 60 64 72 50 72 C36 72 26 60 26 38z" />
                <g {...st}>
                    <ellipse cx={40} cy={34} rx={5} ry={4} fill="#fff" />
                    <ellipse cx={60} cy={34} rx={5} ry={4} fill="#fff" />
                    <Dot x={40} y={34} r={1.6} />
                    <Dot x={60} y={34} r={1.6} />
                    <path d="M36 28 h9 M55 28 h9" />
                    <path d="M42 56 h16" strokeWidth={W * 1.4} />
                    <path d="M28 46 q2 6 6 8 M72 46 q-2 6 -6 8" strokeWidth={W * 0.7} />
                </g>
            </g>
        )
    },
    "rage-cereal-guy": {
        label: "Wait… what?!",
        draw: () => (
            <g>
                <Desk screen={<path d="M72 30 h18 M72 34 h14 M72 38 h16" stroke="#7a8aa0" strokeWidth={1} />} />
                {/* sitting at the desk with a bowl and spoon */}
                <g {...st} strokeWidth={W * 1.4}>
                    <path d="M28 52 V72 M28 72 l-6 8 M28 72 l8 8 M28 58 l14 -2 l4 -6 M28 60 l12 4" />
                    <path d="M14 62 h22 v4 h-22z M18 66 v14 M32 66 v14" />
                </g>
                <path d="M40 66 q6 6 12 0z" fill="#fff" stroke={I} strokeWidth={W} />
                <Head d="M10 30 C10 12 20 4 30 4 C40 4 50 12 50 30 C50 46 40 54 30 54 C20 54 10 46 10 30z" />
                <g {...st}>
                    <ellipse cx={26} cy={22} rx={4} ry={4.4} fill="#fff" />
                    <ellipse cx={38} cy={22} rx={4} ry={4.4} fill="#fff" />
                    <Dot x={27} y={22} r={0.9} />
                    <Dot x={39} y={22} r={0.9} />
                    <path d="M22 15 q4 -3 8 -1 M34 14 q4 -2 8 1" />
                    <ellipse cx={34} cy={38} rx={7} ry={6} fill={I} />
                </g>
                {/* the spray of milk and cereal at the screen */}
                <g fill="#fff" stroke={I} strokeWidth={0.8}>
                    {[[46, 34], [52, 30], [56, 36], [60, 28], [63, 34], [48, 40], [58, 41]].map(([x, y]) => (
                        <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} />
                    ))}
                </g>
                <g fill="#e8b84a" stroke={I} strokeWidth={0.6}>
                    <circle cx={54} cy={26} r={1.4} />
                    <circle cx={62} cy={40} r={1.4} />
                    <circle cx={50} cy={36} r={1.2} />
                </g>
                <path d="M44 30 l4 -3 M44 38 h5 M44 44 l4 3" {...st} strokeWidth={W * 0.8} />
            </g>
        )
    },
    "rage-quit": {
        label: "Rage quit",
        draw: () => (
            <g>
                <Desk screen={<Text x={81} y={35} size={7} fill={RED}>BUST</Text>} />
                <g {...st} strokeWidth={W * 1.4}>
                    <path d="M30 50 V70 M30 70 l-6 10 M30 70 l8 10 M30 54 L14 34 M30 54 L48 40" />
                </g>
                {/* the keyboard flying */}
                <g transform="translate(8 26) rotate(-30)">
                    <rect x={-10} y={-3} width={20} height={6} rx={1} fill="#ddd" stroke={I} strokeWidth={W} />
                    <path d="M-8 -1 h16 M-8 1 h16" stroke={I} strokeWidth={0.5} />
                </g>
                <Head fill={RED} d="M14 26 C14 10 22 2 32 2 C42 2 50 10 50 26 C50 42 42 50 32 50 C22 50 14 42 14 26z" />
                <g {...st}>
                    <path d="M20 14 l9 4 M44 14 l-9 4" strokeWidth={W * 1.8} />
                    <Dot x={25} y={22} r={1} />
                    <Dot x={39} y={22} r={1} />
                    <path d="M20 30 h24 q0 14 -12 14 q-12 0 -12 -14z" fill="#fff" />
                    <path d="M20 30 h24 M20.6 36 h22.8 M26 30 v12 M32 30 v14 M38 30 v12" strokeWidth={W * 0.7} />
                </g>
                <path d="M50 18 l5 -3 M51 26 h6" {...st} />
            </g>
        )
    },
    "rage-true-story": {
        label: "True story.",
        draw: () => (
            <g>
                <Stick arms="M50 70 l-16 4 l6 -12 M50 70 l14 2 l2 -10" />
                <Head d="M26 36 C26 14 38 4 50 4 C62 4 74 14 74 36 C74 56 64 68 50 68 C36 68 26 56 26 36z" />
                <path d="M28 28 h44 v3 q-1 8 -9 8 q-7 0 -9 -6 h-4 q-2 6 -9 6 q-8 0 -9 -8z" fill={I} />
                <path d="M32 31 l5 -2 M56 31 l5 -2" stroke="#fff" strokeWidth={1.2} />
                <path d="M40 54 q10 6 20 -2" {...st} strokeWidth={W * 1.4} />
            </g>
        )
    },
    "rage-f-yea": {
        label: "F*ck yea!",
        draw: () => (
            <g>
                <g {...st} strokeWidth={W * 1.4}>
                    <path d="M34 60 L18 74 M66 60 L82 74" />
                </g>
                <circle cx={18} cy={74} r={4} fill="#fff" stroke={I} strokeWidth={W} />
                <circle cx={82} cy={74} r={4} fill="#fff" stroke={I} strokeWidth={W} />
                <Head d="M24 36 C24 14 36 2 50 2 C64 2 76 14 76 36 C76 58 64 70 50 70 C36 70 24 58 24 36z" />
                <g {...st}>
                    <path d="M30 22 q6 -4 12 0 M58 22 q6 -4 12 0" strokeWidth={W * 1.4} />
                    <path d="M31 30 q5 -4 10 0 M59 30 q5 -4 10 0" strokeWidth={W * 1.6} />
                    <path d="M34 44 q16 18 32 0z" fill="#fff" />
                    <path d="M34 44 h32" strokeWidth={W * 0.8} />
                    <path d="M28 40 q2 2 5 1 M72 40 q-2 2 -5 1" strokeWidth={W * 0.7} />
                </g>
            </g>
        )
    },
    "rage-kidding-me": {
        label: "Are you kidding me?",
        draw: () => (
            <g>
                <Head d="M24 38 C24 14 36 4 50 4 C64 4 76 14 76 38 C76 60 64 72 50 72 C36 72 24 60 24 38z" />
                <g {...st}>
                    <path d="M30 22 l12 -4 M58 16 q6 -4 12 2" strokeWidth={W * 1.6} />
                    <circle cx={38} cy={32} r={6} fill="#fff" />
                    <circle cx={62} cy={30} r={8} fill="#fff" />
                    <Dot x={38} y={32} r={0.9} />
                    <Dot x={62} y={30} r={0.9} />
                    <ellipse cx={50} cy={56} rx={8} ry={9} fill={I} />
                    <path d="M44 62 q6 -4 12 0 q-2 4 -6 4 q-4 0 -6 -4z" fill="#e0727a" stroke="none" />
                </g>
            </g>
        )
    },
    "rage-derp": {
        label: "Derp",
        draw: () => (
            <g>
                <Head d="M24 38 C24 14 36 4 50 4 C64 4 76 14 76 38 C76 60 64 72 50 72 C36 72 24 60 24 38z" />
                <g {...st}>
                    <circle cx={38} cy={32} r={7} fill="#fff" />
                    <circle cx={62} cy={30} r={5} fill="#fff" />
                    <Dot x={42} y={34} r={1.6} />
                    <Dot x={58} y={29} r={1.4} />
                    <path d="M36 52 q14 8 28 -2" strokeWidth={W * 1.4} />
                    <path d="M52 54 q2 8 8 6 q2 -4 -2 -8" fill="#e0727a" />
                </g>
            </g>
        )
    },
    "rage-lol": {
        label: "LOL",
        draw: () => (
            <g>
                <Head d="M20 36 C20 12 34 2 50 2 C66 2 80 12 80 36 C80 60 66 74 50 74 C34 74 20 60 20 36z" />
                <g {...st}>
                    <path d="M28 24 q7 -6 14 0 M58 24 q7 -6 14 0" strokeWidth={W * 1.6} />
                    <path d="M26 34 q24 40 48 0z" fill={I} />
                    <path d="M28 34 h44 v4 h-44z" fill="#fff" strokeWidth={W * 0.7} />
                    <path d="M40 58 q10 -6 20 0 q-4 6 -10 6 q-6 0 -10 -6z" fill="#e0727a" stroke="none" />
                </g>
                <g stroke={TEAR} strokeWidth={2} fill="none">
                    <path d="M24 28 q-6 4 -6 10" />
                    <path d="M76 28 q6 4 6 10" />
                </g>
            </g>
        )
    },
    "rage-sweet-jesus": {
        label: "Sweet Jesus",
        draw: () => (
            <g>
                <Head d="M24 38 C24 14 36 4 50 4 C64 4 76 14 76 38 C76 60 64 72 50 72 C36 72 24 60 24 38z" />
                <g {...st}>
                    <path d="M30 22 l12 4 M70 22 l-12 4" strokeWidth={W * 0.9} />
                    <ellipse cx={38} cy={32} rx={6} ry={5} fill="#fff" />
                    <ellipse cx={62} cy={32} rx={6} ry={5} fill="#fff" />
                    <Dot x={38} y={31} r={2.4} />
                    <Dot x={62} y={31} r={2.4} />
                    <path d="M34 46 h32 q-2 14 -16 14 q-14 0 -16 -14z" fill="#fff" />
                    <path d="M34 46 h32 M38 46 v10 M44 46 v13 M50 46 v14 M56 46 v13 M62 46 v10" strokeWidth={W * 0.6} />
                    <path d="M18 30 l-4 -2 M18 38 h-5 M82 30 l4 -2 M82 38 h5" />
                </g>
                <g stroke={TEAR} strokeWidth={1.6} fill="none">
                    <path d="M32 36 q-2 6 0 10" />
                    <path d="M68 36 q2 6 0 10" />
                </g>
            </g>
        )
    },
    "rage-mother-of-god": {
        label: "Mother of God",
        draw: () => (
            <g>
                <Head d="M26 40 C26 16 36 4 50 4 C64 4 74 16 74 40 C74 62 64 74 50 74 C36 74 26 62 26 40z" />
                <g {...st}>
                    <path d="M30 18 q10 -6 18 0 M52 18 q10 -6 18 0" strokeWidth={W * 1.6} />
                    <ellipse cx={40} cy={30} rx={6} ry={7} fill="#fff" />
                    <ellipse cx={60} cy={30} rx={6} ry={7} fill="#fff" />
                    <Dot x={40} y={31} r={1} />
                    <Dot x={60} y={31} r={1} />
                    <path d="M33 40 q7 4 14 0 M53 40 q7 4 14 0 M31 46 q9 5 18 0 M51 46 q9 5 18 0" strokeWidth={W * 0.6} />
                    <ellipse cx={50} cy={60} rx={6} ry={8} fill={I} />
                    <path d="M14 20 l6 4 M86 20 l-6 4 M12 40 h8 M80 40 h8 M16 58 l6 -3 M84 58 l-6 -3" />
                </g>
            </g>
        )
    },
    "rage-problem": {
        label: "Problem?",
        draw: () => (
            <g>
                {/* our own smug grin — not a copy of any one face */}
                <Head d="M18 34 C18 10 34 2 52 2 C70 2 84 12 84 34 C84 56 72 74 52 74 C32 74 18 56 18 34z" />
                <g {...st}>
                    <path d="M28 24 q8 -8 18 -2 M60 22 q8 -6 16 2" strokeWidth={W * 1.6} />
                    <path d="M30 30 q7 -3 14 1 M62 31 q7 -4 14 0" strokeWidth={W * 1.4} />
                    <Dot x={38} y={32} r={1.2} />
                    <Dot x={68} y={32} r={1.2} />
                    <path d="M24 42 Q52 80 82 40 Q52 58 24 42z" fill="#fff" />
                    <path d="M28 46 Q52 60 78 44 M34 50 v8 M42 53 v10 M50 54 v11 M58 54 v10 M66 51 v9 M74 47 v6" strokeWidth={W * 0.6} />
                    <path d="M22 40 q-2 4 2 6 M84 38 q2 4 -2 6" strokeWidth={W * 0.8} />
                </g>
            </g>
        )
    },
    "rage-pfftch": {
        label: "Pfftch",
        draw: () => (
            <g>
                <Head d="M26 38 C26 14 36 4 50 4 C64 4 74 14 74 38 C74 60 64 72 50 72 C36 72 26 60 26 38z" />
                <g {...st}>
                    <path d="M34 30 h12 M54 30 h12" strokeWidth={W * 1.4} />
                    <Dot x={42} y={27} r={1.6} />
                    <Dot x={62} y={27} r={1.6} />
                    <path d="M44 56 q6 -4 12 0 q-6 4 -12 0z" fill="#fff" />
                    <g fill="#bfe3ff" stroke={I} strokeWidth={0.6}>
                        <circle cx={60} cy={56} r={1.2} />
                        <circle cx={64} cy={54} r={1} />
                        <circle cx={63} cy={59} r={0.9} />
                    </g>
                </g>
            </g>
        )
    },
    "rage-better-than-expected": {
        label: "Everything went better than expected",
        draw: () => (
            <g>
                <Head d="M24 38 C24 14 36 4 50 4 C64 4 76 14 76 38 C76 60 64 72 50 72 C36 72 24 60 24 38z" />
                <g {...st}>
                    <path d="M32 32 q6 -5 12 0 M56 32 q6 -5 12 0" strokeWidth={W * 1.4} />
                    <path d="M34 48 q16 14 32 0" strokeWidth={W * 1.4} />
                    <path d="M30 42 q3 2 6 1 M70 42 q-3 2 -6 1" stroke="#e8566f" />
                </g>
            </g>
        )
    },
    "rage-close-enough": {
        label: "Close enough",
        draw: () => (
            <g>
                <Head d="M26 38 C26 14 36 4 50 4 C64 4 74 14 74 38 C74 60 64 72 50 72 C36 72 26 60 26 38z" />
                <g {...st}>
                    <path d="M33 30 h12 M55 30 h12" strokeWidth={W * 1.6} />
                    <Dot x={39} y={33} />
                    <Dot x={61} y={33} />
                    <path d="M36 50 q14 -8 28 0 q-8 4 -14 2 q-6 2 -14 -2z" fill={I} />
                    <path d="M42 60 q8 4 16 -2" strokeWidth={W * 1.2} />
                </g>
            </g>
        )
    },
    "rage-aww-yea": {
        label: "Aww yea",
        draw: () => (
            <g>
                <Stick arms="M50 70 l-14 -6 M50 70 l16 -10" />
                <Head d="M26 36 C26 14 38 4 50 4 C62 4 74 14 74 36 C74 56 64 68 50 68 C36 68 26 56 26 36z" />
                <path d="M28 28 h44 v3 q-1 8 -9 8 q-7 0 -9 -6 h-4 q-2 6 -9 6 q-8 0 -9 -8z" fill={I} />
                <path d="M38 50 q12 10 24 0z" fill="#fff" stroke={I} strokeWidth={W} />
                <path d="M38 50 h24" stroke={I} strokeWidth={W * 0.6} />
            </g>
        )
    },
    "rage-oh-crap": {
        label: "Oh crap",
        draw: () => (
            <g>
                <Head d="M24 38 C24 14 36 4 50 4 C64 4 76 14 76 38 C76 60 64 72 50 72 C36 72 24 60 24 38z" />
                <g {...st}>
                    <circle cx={38} cy={32} r={7} fill="#fff" />
                    <circle cx={62} cy={32} r={7} fill="#fff" />
                    <Dot x={38} y={32} r={1} />
                    <Dot x={62} y={32} r={1} />
                    <path d="M30 22 l10 -2 M70 22 l-10 -2" />
                    <ellipse cx={50} cy={56} rx={3} ry={4} fill={I} />
                </g>
                <g fill="#7cc0ee" stroke={I} strokeWidth={0.8}>
                    <path d="M76 18 q-3 4 0 6 q3 -2 0 -6z" />
                    <path d="M82 28 q-3 4 0 6 q3 -2 0 -6z" />
                </g>
            </g>
        )
    }
};
