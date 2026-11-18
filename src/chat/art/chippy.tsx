import React from "react";
import { C, Label, Shine } from "./ink";

/**
 * Chippy — the Block52 mascot (block52-chat#2): a purple poker chip with a
 * face. Every feeling in chat is Chippy pulling a face, so the set reads as
 * one cast. Drawn on the 64 grid at (32, 36), radius 22, leaving the top
 * ~12 units free for an overlay prop (rain cloud, steam, question marks…).
 */
export type Expression =
    | "happy"
    | "joy"
    | "laugh"
    | "cry"
    | "sad"
    | "money"
    | "cool"
    | "angry"
    | "fuming"
    | "forced"
    | "meh"
    | "hero"
    | "determined"
    | "brow"
    | "smirk"
    | "grimace"
    | "dizzy"
    | "melting"
    | "confused"
    | "npc"
    | "shocked"
    | "clown"
    | "calm"
    | "wink"
    | "love";

export const EXPRESSIONS: readonly Expression[] = [
    "happy", "joy", "laugh", "cry", "sad", "money", "cool", "angry", "fuming", "forced", "meh", "hero", "determined",
    "brow", "smirk", "grimace", "dizzy", "melting", "confused", "npc", "shocked", "clown", "calm", "wink", "love"
];

const CX = 32;
const CY = 36;
const R = 22;

/** Round ink eyes with a glint. */
const DotEyes: React.FC<{ dy?: number; ry?: number }> = ({ dy = 0, ry = 3.6 }) => (
    <>
        {[26, 38].map(x => (
            <g key={x}>
                <ellipse cx={x} cy={33 + dy} rx={2.7} ry={ry} fill={C.ink} stroke="none" />
                <circle cx={x + 0.9} cy={31.6 + dy} r={0.95} fill={C.white} stroke="none" />
            </g>
        ))}
    </>
);

const Arc: React.FC<{ d: string; w?: number }> = ({ d, w = 2.4 }) => <path d={d} fill="none" strokeWidth={w} />;

function eyes(e: Expression): React.ReactNode {
    switch (e) {
        case "joy":
        case "laugh":
            return <Arc d="M22.5 34 q3.5 -4.5 7 0 M34.5 34 q3.5 -4.5 7 0" />;
        case "calm":
            return <Arc d="M22.5 32.5 q3.5 3.5 7 0 M34.5 32.5 q3.5 3.5 7 0" />;
        case "cry":
            return <Arc d="M22.5 31.5 q3.5 4 7 0 M34.5 31.5 q3.5 4 7 0" />;
        case "wink":
            return (
                <>
                    <ellipse cx={26} cy={33} rx={2.7} ry={3.6} fill={C.ink} stroke="none" />
                    <Arc d="M34.5 33.5 q3.5 -4 7 0" />
                </>
            );
        case "money":
            return (
                <>
                    <Label x={26} y={33} size={10} fill={C.green} outline>$</Label>
                    <Label x={38} y={33} size={10} fill={C.green} outline>$</Label>
                </>
            );
        case "love":
            return (
                <>
                    {[26, 38].map(x => (
                        <path key={x} transform={`translate(${x} 33)`} d="M0 3.5 C-5.5 -1 -4 -5.5 0 -2.6 C4 -5.5 5.5 -1 0 3.5z" fill={C.red} strokeWidth={1.4} />
                    ))}
                </>
            );
        case "cool":
            return (
                <>
                    <path d="M19 30 h26 v2 q-1 6 -6 6 h-2 q-4 0 -5 -4 q-1 4 -5 4 h-2 q-5 0 -6 -6z" fill={C.ink} strokeWidth={1.6} />
                    <path d="M22 32 l3 -1.5 M35 32 l3 -1.5" stroke={C.white} strokeWidth={1.4} />
                </>
            );
        case "hero":
            return (
                <>
                    <path d="M17 29 q15 -5 30 0 l-1 8 q-6 2 -9 -1 q-5 -2 -10 0 q-3 3 -9 1z" fill={C.red} strokeWidth={2.2} />
                    <ellipse cx={26.5} cy={32.6} rx={2.6} ry={2.2} fill={C.white} strokeWidth={1.4} />
                    <ellipse cx={37.5} cy={32.6} rx={2.6} ry={2.2} fill={C.white} strokeWidth={1.4} />
                </>
            );
        case "dizzy":
            return <Arc d="M23.5 30.5 l5 5 M28.5 30.5 l-5 5 M35.5 30.5 l5 5 M40.5 30.5 l-5 5" />;
        case "npc":
            return (
                <>
                    <circle cx={26} cy={33} r={1.6} fill={C.ink} stroke="none" />
                    <circle cx={38} cy={33} r={1.6} fill={C.ink} stroke="none" />
                </>
            );
        case "shocked":
            return (
                <>
                    {[26, 38].map(x => (
                        <g key={x}>
                            <circle cx={x} cy={32.5} r={4.4} fill={C.white} strokeWidth={2} />
                            <circle cx={x} cy={32.5} r={1.6} fill={C.ink} stroke="none" />
                        </g>
                    ))}
                </>
            );
        case "meh":
        case "smirk":
            return (
                <>
                    <DotEyes ry={2.6} dy={0.6} />
                    <Arc d="M22.5 30.5 h7 M34.5 30.5 h7" w={2.2} />
                </>
            );
        case "brow":
            return (
                <>
                    <DotEyes />
                    <Arc d="M22.5 28.5 q3.5 -1 7 0.5 M34.5 26 q3.5 -2.5 7 0" w={2.2} />
                </>
            );
        case "angry":
        case "fuming":
        case "determined":
            return (
                <>
                    <DotEyes dy={0.8} ry={3} />
                    <Arc d="M22.5 28 l7 2.8 M41.5 28 l-7 2.8" w={2.6} />
                </>
            );
        case "sad":
        case "grimace":
        case "forced":
        case "confused":
            return (
                <>
                    <DotEyes dy={0.6} />
                    {e === "confused" ? (
                        <Arc d="M22.5 28.5 l7 -1.5 M34.5 27 q3.5 -2 7 1" w={2.2} />
                    ) : e === "forced" ? null : (
                        <Arc d="M22.5 29.5 l7 -2.2 M41.5 29.5 l-7 -2.2" w={2.2} />
                    )}
                </>
            );
        default:
            return <DotEyes />;
    }
}

function mouth(e: Expression): React.ReactNode {
    switch (e) {
        case "happy":
        case "wink":
        case "love":
        case "money":
        case "calm":
            return <Arc d="M26 40.5 q6 6 12 0" />;
        case "joy":
        case "laugh":
        case "hero":
            return (
                <g strokeWidth={2.2}>
                    <path d="M24.5 39.5 h15 q0 9 -7.5 9 q-7.5 0 -7.5 -9z" fill={C.ink} />
                    <path d="M28 45.5 q4 -3 8 0 q-1 2.4 -4 2.4 q-3 0 -4 -2.4z" fill={C.red} stroke="none" />
                </g>
            );
        case "cool":
        case "smirk":
            return <Arc d="M27 42.5 q6 2.5 11 -3" />;
        case "cry":
        case "sad":
            return <Arc d="M27 45 q5 -5 10 0" />;
        case "angry":
        case "determined":
            return <Arc d="M27 43.5 h10" w={2.6} />;
        case "fuming":
            return (
                <g strokeWidth={2}>
                    <rect x={25} y={40} width={14} height={6.5} rx={2} fill={C.white} />
                    <path d="M29.5 40 v6.5 M34.5 40 v6.5 M25 43.2 h14" fill="none" strokeWidth={1.4} />
                </g>
            );
        case "grimace":
        case "forced":
            return (
                <g strokeWidth={2}>
                    <rect x={24} y={39.5} width={16} height={7} rx={3} fill={C.white} />
                    <path d="M28 39.5 v7 M32 39.5 v7 M36 39.5 v7" fill="none" strokeWidth={1.4} />
                </g>
            );
        case "meh":
        case "npc":
            return <Arc d="M27.5 43 h9" />;
        case "brow":
            return <Arc d="M27 43.5 q5 -1.5 10 0.5" />;
        case "dizzy":
        case "confused":
            return <Arc d="M25.5 43 q2 -2.4 4 0 t4 0 t4 0" w={2.2} />;
        case "melting":
            return <Arc d="M25 42 q7 5 14 -1" />;
        case "shocked":
            return <ellipse cx={32} cy={44} rx={3.6} ry={4.4} fill={C.ink} strokeWidth={1.6} />;
        case "clown":
            return <Arc d="M24.5 40 q7.5 9 15 0" />;
    }
}

function extras(e: Expression): React.ReactNode {
    switch (e) {
        case "laugh":
        case "cry":
            return (
                <g fill={C.sky} strokeWidth={1.6}>
                    <path d="M20.5 36 q-3 5 0 7 q3 -2 0 -7z" />
                    <path d="M43.5 36 q-3 5 0 7 q3 -2 0 -7z" />
                </g>
            );
        case "forced":
        case "grimace":
            return <path d="M46 22 q-4 6 0 8.5 q4 -2.5 0 -8.5z" fill={C.sky} strokeWidth={1.6} />;
        case "love":
        case "joy":
        case "happy":
        case "wink":
            return (
                <g fill={C.pink} stroke="none" opacity={0.75}>
                    <ellipse cx={20.5} cy={40} rx={3} ry={1.8} />
                    <ellipse cx={43.5} cy={40} rx={3} ry={1.8} />
                </g>
            );
        case "fuming":
        case "angry":
            return (
                <g fill={C.red} strokeWidth={1.8}>
                    <path d="M44 20 l3 -3 l1.5 3.5 l3.5 -1 l-1.2 3.6 l3 1.8 l-3.6 1.4z" />
                </g>
            );
        case "clown":
            return (
                <>
                    <circle cx={32} cy={37} r={3.6} fill={C.red} strokeWidth={2} />
                    <g fill={C.sky} strokeWidth={1.4}>
                        <path d="M26 28 l-1.8 -3 l3.6 0z" />
                        <path d="M38 28 l-1.8 -3 l3.6 0z" />
                    </g>
                </>
            );
        case "money":
            return null;
        default:
            return null;
    }
}

/** The chip body: purple with white edge spots and a cream face. */
export const ChipBody: React.FC<{ face?: boolean; fill?: string; cx?: number; cy?: number; r?: number }> = ({ face = true, fill = C.purple, cx = CX, cy = CY, r = R }) => (
    <g>
        <circle cx={cx} cy={cy} r={r} fill={fill} />
        {Array.from({ length: 8 }, (_, i) => (
            <rect
                key={i}
                x={cx - 3}
                y={cy - r + 0.5}
                width={6}
                height={5.5}
                rx={1.4}
                fill={C.white}
                stroke="none"
                transform={`rotate(${i * 45 + 22.5} ${cx} ${cy})`}
            />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.72} fill={face ? C.cream : C.white} strokeWidth={2.2} />
        <Shine d={`M${cx - r * 0.62} ${cy - r * 0.42} a${r * 0.75} ${r * 0.75} 0 0 1 ${r * 0.4} -${r * 0.36}`} />
    </g>
);

/** Chippy pulling a face. */
export const Chippy: React.FC<{ expression: Expression }> = ({ expression }) => {
    if (expression === "melting") {
        return (
            <g>
                <path
                    d="M10 40 a22 22 0 0 1 44 0 q0 6 -3 8 q-2 6 -5 1 q-3 9 -7 2 q-4 8 -8 0 q-4 7 -7 -1 q-3 5 -6 -1 q-6 -1 -8 -9z"
                    fill={C.purple}
                />
                <circle cx={32} cy={38} r={15} fill={C.cream} strokeWidth={2.2} />
                {eyes("happy")}
                {mouth("melting")}
                <path d="M41 44 q1 5 -1 7 q-2 -2 1 -7z" fill={C.sky} strokeWidth={1.4} />
            </g>
        );
    }
    return (
        <g>
            <ChipBody />
            {eyes(expression)}
            {mouth(expression)}
            {extras(expression)}
        </g>
    );
};
