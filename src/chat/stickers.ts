/**
 * Block52 quick-chat stickers (block52-chat#2, set v2 #16): the phrases a
 * player can send with one tap, grouped into packs. Each pops up above the sender's seat (block52-chat#3).
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
    /** Optional sound URL played when it pops up (block52-chat#15). */
    sound?: string;
    /** The pack (group) it belongs to in the Quick chat grid (block52-chat#10). */
    pack: string;
}

export interface StickerPack {
    id: string;
    label: string;
}

/** Packs in display order (block52-chat#10). */
export const STICKER_PACKS: readonly StickerPack[] = [
    { id: "classics", label: "Classics" },
    { id: "hype", label: "Hype & wins" },
    { id: "bad-beats", label: "Bad beats & tilt" },
    { id: "calls", label: "Calls & folds" },
    { id: "folklore", label: "Folklore & memes" },
    { id: "banter", label: "Table banter" },
    { id: "pop-culture", label: "Pop culture" },
];

export const STICKERS: readonly StickerDef[] = [
    // Classics
    { id: "nice-hand", label: "Nice hand", emoji: "👏", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "good-game", label: "Good game", emoji: "🤝", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "well-played", label: "Well played", emoji: "🎯", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "good-call", label: "Good call", emoji: "🧠", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "nice-flop", label: "Nice flop", emoji: "🃏", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "thanks", label: "Thanks", emoji: "🙏", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "running-hot", label: "Running hot", emoji: "🔥", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "running-bad", label: "Running bad", emoji: "🌧️", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "bad-run-out", label: "Bad run out", emoji: "💀", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "finally", label: "Finally", emoji: "🙌", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "laughing", label: "Laughing", emoji: "😂", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "sad", label: "Sad", emoji: "😢", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "baby", label: "Baby", emoji: "🍼", from: "#22c55e", to: "#15803d", pack: "classics" },
    // Hype & wins
    { id: "all-in-baby", label: "All in, baby", emoji: "🚀", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "ship-it", label: "Ship it", emoji: "🚢", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "pay-that-man", label: "Pay that man his money", emoji: "💵", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "daddy-new-stack", label: "Daddy needs a new stack", emoji: "🤑", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "bink", label: "Bink!", emoji: "🎰", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "nutted", label: "Nutted", emoji: "🥜", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "big-stack-energy", label: "Big stack energy", emoji: "💪", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "gets-there", label: "Gets there", emoji: "🏁", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "pay-day", label: "Pay day", emoji: "💰", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "easy-game", label: "Easy game", emoji: "😎", from: "#f59e0b", to: "#b45309", pack: "hype" },
    // Bad beats & tilt
    { id: "rigged", label: "Rigged", emoji: "🎲", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "rivered-again", label: "Rivered again", emoji: "🌊", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "runner-runner", label: "Runner runner", emoji: "🏃", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "cooler", label: "Cooler", emoji: "🧊", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "thats-poker", label: "That's poker", emoji: "🤷", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "cruel-game", label: "Poker is a cruel game", emoji: "💔", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "variance-myth", label: "Variance is a myth (said nobody)", emoji: "📉", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "tilted", label: "Tilted", emoji: "😡", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "not-tilted", label: "I'm not tilted", emoji: "🙂", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "card-dead", label: "Card dead", emoji: "⚰️", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    // Calls & folds
    { id: "snap-call", label: "Snap call", emoji: "⚡", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "hero-call", label: "Hero call", emoji: "🦸", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "hero-fold", label: "Hero fold", emoji: "🫡", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "snap-fold", label: "Snap fold", emoji: "🗑️", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "had-to-call", label: "I had to call", emoji: "📞", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "put-you-on-that", label: "I put you on that", emoji: "🎯", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "solver-says-call", label: "Solver says call", emoji: "🤖", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "trust-the-math", label: "Trust the math", emoji: "🧮", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "never-folding", label: "Never folding", emoji: "🙅", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "tank-time", label: "Tank time", emoji: "⏳", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    // Folklore & memes
    { id: "dont-tap-the-glass", label: "Don't tap the glass", emoji: "🐟", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "the-hammer", label: "The Hammer (7-2)", emoji: "🔨", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "seven-deuce", label: "Seven deuce never loses", emoji: "7️⃣", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "big-blind-special", label: "Big blind special", emoji: "🎁", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "one-time-dealer", label: "One time, dealer", emoji: "☝️", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "run-it-twice", label: "Run it twice", emoji: "✌️", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "looks-good-never-wins", label: "Looks good, never wins", emoji: "🎾", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "coin-flip", label: "Coin flip", emoji: "🪙", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "bubble-boy", label: "Bubble boy", emoji: "🫧", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "min-cash-king", label: "Min-cash king", emoji: "👑", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "splash-the-pot", label: "Splash the pot", emoji: "💦", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "nyet", label: "Nyet.", emoji: "🍪", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "spot-the-sucker", label: "Can't spot the sucker? It's you", emoji: "🍭", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "ten-deuce", label: "The ten-deuce", emoji: "🔟", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "see-a-flop", label: "Can I see a flop?", emoji: "🙏", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "last-hand", label: "Last hand, I swear", emoji: "🤞", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "deck-hates-me", label: "The deck hates me", emoji: "😤", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "shove-and-pray", label: "Shove and pray", emoji: "🙏", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "gutshot-gang", label: "Gutshot gang", emoji: "🎯", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "min-raise", label: "Did you just min-raise?", emoji: "🤨", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "show-me-the-money", label: "Show me the money", emoji: "💸", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "hold-my-chips", label: "Hold my chips", emoji: "🍺", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    // Table banter
    { id: "nit-alert", label: "Nit alert", emoji: "🚨", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "fish-on", label: "Fish on", emoji: "🎣", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "whale-spotted", label: "Whale spotted", emoji: "🐋", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "donk-bet", label: "Donk bet", emoji: "🫏", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "slow-roll", label: "Slow roll much?", emoji: "🐌", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "show-one", label: "Show one?", emoji: "👀", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "respect-the-raise", label: "Respect the raise", emoji: "🫡", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "speech", label: "Speech!", emoji: "🎤", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "gg-no-re", label: "GG no re", emoji: "🏳️", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "chip-and-a-chair", label: "Chip and a chair", emoji: "🪑", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    // Pop culture
    { id: "must-be-nice", label: "Must be nice", emoji: "😏", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "another-one", label: "Another one", emoji: "☝️", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "major-key", label: "Major key", emoji: "🔑", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "this-is-fine", label: "This is fine", emoji: "🔥", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "im-in-danger", label: "I'm in danger", emoji: "😬", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "not-great", label: "Not great, not terrible", emoji: "☢️", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "its-a-trap", label: "It's a trap!", emoji: "🪤", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "stonks", label: "Stonks", emoji: "📈", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "big-mistake", label: "Big mistake. Huge.", emoji: "🛍️", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "shall-not-pass", label: "You shall not pass", emoji: "🧙", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "one-does-not-simply", label: "One does not simply fold aces", emoji: "💍", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "ill-be-back", label: "I'll be back", emoji: "🤖", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "little-friend", label: "Say hello to my little friend", emoji: "💥", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "inevitable", label: "I am inevitable", emoji: "🧤", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "why-so-serious", label: "Why so serious?", emoji: "🃏", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "head-out", label: "Ight, imma head out", emoji: "🚪", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "let-him-cook", label: "Let him cook", emoji: "👨‍🍳", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "emotional-damage", label: "Emotional damage", emoji: "💔", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "chicken-dinner", label: "Winner winner chicken dinner", emoji: "🍗", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "luck-box", label: "Luck box", emoji: "🍀", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "skill-issue", label: "Skill issue", emoji: "🎮", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "caught-in-4k", label: "Caught in 4K", emoji: "📸", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "copium", label: "Copium", emoji: "🫁", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "touch-grass", label: "Touch grass", emoji: "🌱", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "mission-failed", label: "Mission failed, we'll get 'em next time", emoji: "🎖️", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "built-different", label: "Built different", emoji: "🏗️", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "rent-free", label: "Living rent free", emoji: "🏠", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "down-bad", label: "Down bad", emoji: "📉", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "task-failed", label: "Task failed successfully", emoji: "✅", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "over-9000", label: "It's over 9000!", emoji: "💯", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
];

const BY_ID = new Map(STICKERS.map(s => [s.id, s]));

/** A sticker by id, or undefined for an unknown/retired id (ignore it). */
export const findSticker = (id: string | undefined): StickerDef | undefined => (id ? BY_ID.get(id) : undefined);
