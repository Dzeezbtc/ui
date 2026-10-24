/**
 * Poker throwables (block52-chat#7): things a player can toss at another
 * player's seat — it flies across the table and lands with a bounce. Defined
 * here as a manifest, so new ones need no code change (artwork/sound later).
 */
export interface ThrowableDef {
    /** Stable id sent on the wire. */
    id: string;
    label: string;
    emoji: string;
    /** Spin while flying (chips, buttons) or fly flat (signs, towels). */
    spin: boolean;
}

export const THROWABLES: readonly ThrowableDef[] = [
    { id: "chip", label: "Chip", emoji: "🪙", spin: true },
    { id: "fish", label: "Fish", emoji: "🐟", spin: true },
    { id: "whale", label: "Whale", emoji: "🐋", spin: false },
    { id: "crown", label: "Crown", emoji: "👑", spin: false },
    { id: "rocket", label: "Rocket (AA)", emoji: "🚀", spin: false },
    { id: "cowboy-hat", label: "Cowboy hat (KK)", emoji: "🤠", spin: true },
    { id: "hammer", label: "The Hammer (7-2)", emoji: "🔨", spin: true },
    { id: "handkerchief", label: "Handkerchief", emoji: "🤧", spin: false },
    { id: "calculator", label: "Calculator", emoji: "🧮", spin: true },
    { id: "tilt-sign", label: "TILT sign", emoji: "🪧", spin: false },
    { id: "card-protector", label: "Lucky card protector", emoji: "🍀", spin: true },
    { id: "dealer-button", label: "Dealer button", emoji: "🔘", spin: true }
];

const BY_ID = new Map(THROWABLES.map(t => [t.id, t]));

export const findThrowable = (id: string | undefined): ThrowableDef | undefined => (id ? BY_ID.get(id) : undefined);
