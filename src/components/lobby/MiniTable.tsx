import React, { useId } from "react";
import { seatFill, seatPosition, svgSafeId } from "../../utils/lobbyLayout";
import styles from "./Lobby.module.css";

interface MiniTableProps {
    maxPlayers: number;
    currentPlayers: number;
    /** Larger seats, for the preview panel. */
    large?: boolean;
    label: string;
    /** Written on the felt in place of the logo: the stakes, and the game under it. */
    title?: string;
    sub?: string;
}

/** Orb colours for taken seats, from the Block52 chip palette. */
const ORBS: readonly [string, string][] = [
    ["#F0ABFC", "#86198F"],
    ["#A5F3FC", "#0E7490"],
    ["#C4B5FD", "#5B21B6"],
    ["#FDE68A", "#B45309"],
    ["#93C5FD", "#1D4ED8"],
    ["#6EE7B7", "#047857"]
];

const CX = 170;
const CY = 100;
const RX = 124;
const RY = 64;

/**
 * MiniTable — a small picture of the felt for a lobby card: the Block52 rim,
 * the felt with the stakes and game written on it (or the logo), taken seats as coloured orbs and open seats as
 * dashed cyan rings. The lobby list only knows how many players are seated,
 * not where, so taken seats are spread evenly (see `seatFill`).
 */
const MiniTable: React.FC<MiniTableProps> = ({ maxPlayers, currentPlayers, large = false, label, title, sub }) => {
    const id = svgSafeId(useId());
    const seats = seatFill(maxPlayers, currentPlayers);
    const r = large ? 17 : 15;
    return (
        <svg className={styles.mt} viewBox={large ? "-30 -24 400 248" : "-12 -12 364 224"} role="img" aria-label={label}>
            <defs>
                <radialGradient id={`${id}felt`} cx="50%" cy="42%" r="62%">
                    <stop offset="0" stopColor="#2A2170" />
                    <stop offset=".65" stopColor="#16123F" />
                    <stop offset="1" stopColor="#0A0824" />
                </radialGradient>
                <linearGradient id={`${id}rim`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#C026D3" />
                    <stop offset=".5" stopColor="#7C3AED" />
                    <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
                {ORBS.map(([a, b], i) => (
                    <radialGradient key={a} id={`${id}orb${i}`} cx="35%" cy="30%" r="75%">
                        <stop offset="0" stopColor={a} />
                        <stop offset="1" stopColor={b} />
                    </radialGradient>
                ))}
                <filter id={`${id}soft`} x="-20%" y="-20%" width="140%" height="160%">
                    <feGaussianBlur stdDeviation="8" />
                </filter>
            </defs>
            <ellipse cx={CX} cy={CY + 14} rx={RX + 14} ry={RY + 12} fill="#000" opacity=".55" filter={`url(#${id}soft)`} />
            <ellipse cx={CX} cy={CY} rx={RX + 9} ry={RY + 9} fill={`url(#${id}rim)`} />
            <ellipse cx={CX} cy={CY} rx={RX + 5} ry={RY + 5} fill="#0B0920" />
            <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={`url(#${id}felt)`} />
            <ellipse cx={CX} cy={CY} rx={RX - 16} ry={RY - 14} fill="none" stroke="rgba(196,181,253,.12)" />
            {title ? (
                <>
                    <text x={CX} y={sub ? CY + 4 : CY + 12} textAnchor="middle" fontFamily="Unbounded, ui-sans-serif, system-ui, sans-serif" fontWeight="600" fontSize="34" fill="#F4F2FA" letterSpacing="-0.5">
                        {title}
                    </text>
                    {sub ? (
                        <text x={CX} y={CY + 30} textAnchor="middle" fontFamily="Inter, ui-sans-serif, system-ui, sans-serif" fontWeight="600" fontSize="14.5" fill="#C4B5FD">
                            {sub}
                        </text>
                    ) : null}
                </>
            ) : (
                <image href="/block52.png" x={CX - 46} y={CY - 13} width="92" height="26" opacity=".22" preserveAspectRatio="xMidYMid meet" />
            )}
            {seats.map((taken, i) => {
                const { x, y } = seatPosition(i, seats.length, CX, CY, RX + 28, RY + 26);
                return taken ? (
                    <circle key={i} cx={x} cy={y} r={r} fill={`url(#${id}orb${i % ORBS.length})`} stroke="rgba(255,255,255,.3)" />
                ) : (
                    <g key={i}>
                        <circle cx={x} cy={y} r={r - 1} fill="rgba(77,208,248,.07)" stroke="#4DD0F8" strokeWidth="1.4" strokeDasharray="3 3" opacity=".85" />
                        <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fill="#4DD0F8" opacity=".9">
                            +
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default MiniTable;
