/**
 * Block52 quick-chat stickers (block52-chat#2): the poker phrases a player can
 * send with one tap. Each pops up above the sender's seat (block52-chat#3).
 *
 * This is the manifest: adding a sticker is one entry here. `art` can later
 * point at designer artwork on the CDN (SVG/WebP/animated); until then the
 * sticker draws as a Block52 badge from `emoji` + `label` + the colours.
 */
export interface StickerDef {
    /** Stable id sent on the wire; never reuse a retired id. */
    id: string;
    /** The phrase, shown on the sticker and used as its accessible label. */
    label: string;
    /** The glyph at the heart of the badge. */
    emoji: string;
    /** Badge gradient, top → bottom. */
    from: string;
    to: string;
    /** Optional designer artwork URL that replaces the drawn badge. */
    art?: string;
    /** Optional sound URL played when it pops up (block52-chat#2, later). */
    sound?: string;
}

export const STICKERS: readonly StickerDef[] = [
    { id: "nice-hand", label: "Nice hand", emoji: "👏", from: "#22c55e", to: "#15803d" },
    { id: "good-game", label: "Good game", emoji: "🤝", from: "#3b82f6", to: "#1d4ed8" },
    { id: "well-played", label: "Well played", emoji: "🎯", from: "#06b6d4", to: "#0e7490" },
    { id: "good-call", label: "Good call", emoji: "🧠", from: "#8b5cf6", to: "#6d28d9" },
    { id: "nice-flop", label: "Nice flop", emoji: "🃏", from: "#14b8a6", to: "#0f766e" },
    { id: "thanks", label: "Thanks", emoji: "🙏", from: "#f59e0b", to: "#b45309" },
    { id: "running-hot", label: "Running hot", emoji: "🔥", from: "#f97316", to: "#c2410c" },
    { id: "running-bad", label: "Running bad", emoji: "🌧️", from: "#64748b", to: "#334155" },
    { id: "bad-run-out", label: "Bad run out", emoji: "💀", from: "#ef4444", to: "#991b1b" },
    { id: "finally", label: "Finally", emoji: "🙌", from: "#eab308", to: "#a16207" },
    { id: "laughing", label: "Laughing", emoji: "😂", from: "#facc15", to: "#ca8a04" },
    { id: "sad", label: "Sad", emoji: "😢", from: "#60a5fa", to: "#2563eb" },
    { id: "baby", label: "Baby", emoji: "🍼", from: "#f472b6", to: "#be185d" }
];

const BY_ID = new Map(STICKERS.map(s => [s.id, s]));

/** A sticker by id, or undefined for an unknown/retired id (ignore it). */
export const findSticker = (id: string | undefined): StickerDef | undefined => (id ? BY_ID.get(id) : undefined);
