/**
 * Poker throwables (block52-chat#7): things a player can toss at another
 * player's seat — it flies across the table and lands with a bounce. Defined
 * here as a manifest; each draws in the Block52 Chip Crew style (no system emoji).
 */
export interface ThrowableDef {
    /** Stable id sent on the wire. */
    id: string;
    label: string;
    /** Our own art (an ArtSpec, see art/Art.tsx). */
    art: string;
    /** Spin while flying (chips, buttons) or fly flat (signs, towels). */
    spin: boolean;
}

export const THROWABLES: readonly ThrowableDef[] = [
    { id: "chip", label: "Chip", art: "chip", spin: true },
    { id: "fish", label: "Fish", art: "fish", spin: true },
    { id: "whale", label: "Whale", art: "whale", spin: false },
    { id: "crown", label: "Crown", art: "crown", spin: false },
    { id: "rocket", label: "Rocket (AA)", art: "rocket", spin: false },
    { id: "cowboy-hat", label: "Cowboy hat (KK)", art: "cowboy-hat", spin: true },
    { id: "hammer", label: "The Hammer (7-2)", art: "hammer", spin: true },
    { id: "handkerchief", label: "Handkerchief", art: "handkerchief", spin: false },
    { id: "calculator", label: "Calculator", art: "calculator", spin: true },
    { id: "tilt-sign", label: "TILT sign", art: "tilt-sign", spin: false },
    { id: "card-protector", label: "Lucky card protector", art: "clover", spin: true },
    { id: "dealer-button", label: "Dealer button", art: "dealer-button", spin: true }
];

const BY_ID = new Map(THROWABLES.map(t => [t.id, t]));

export const findThrowable = (id: string | undefined): ThrowableDef | undefined => (id ? BY_ID.get(id) : undefined);
