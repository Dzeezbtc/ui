/**
 * Block52 quick-chat stickers (block52-chat#2, set v2 #16): the phrases a
 * player can send with one tap, grouped into packs. Each pops up above the sender's seat (block52-chat#3).
 *
 * This is the manifest: adding a sticker is one entry here. `art` can later
 * point at designer artwork on the CDN (SVG/WebP/animated); until then the
 * sticker draws in the Block52 Chip Crew style from `icon` + `label` + the colours.
 */
export interface StickerDef {
    /** Stable id sent on the wire; never reuse a retired id. */
    id: string;
    /** The phrase, shown on the sticker and used as its accessible label. */
    label: string;
    /** Our own art at the heart of the sticker (an ArtSpec, see art/Art.tsx). */
    icon: string;
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
    { id: "movies", label: "Movie references" },
    { id: "hype", label: "Hype & wins" },
    { id: "bad-beats", label: "Bad beats & tilt" },
    { id: "calls", label: "Calls & folds" },
    { id: "folklore", label: "Folklore & memes" },
    { id: "banter", label: "Table banter" },
    { id: "pop-culture", label: "Pop culture" },
];

export const STICKERS: readonly StickerDef[] = [
    // Classics
    { id: "nice-hand", label: "Nice hand", icon: "clap", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "good-game", label: "Good game", icon: "handshake", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "well-played", label: "Well played", icon: "target", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "good-call", label: "Good call", icon: "brain", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "nice-flop", label: "Nice flop", icon: "cards-fan", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "thanks", label: "Thanks", icon: "pray", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "running-hot", label: "Running hot", icon: "chippy:joy+flames-sides", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "running-bad", label: "Running bad", icon: "chippy:sad+rain-cloud-top", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "bad-run-out", label: "Bad run out", icon: "skull", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "finally", label: "Finally", icon: "hands-up", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "laughing", label: "Laughing", icon: "chippy:laugh", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "sad", label: "Sad", icon: "chippy:cry", from: "#22c55e", to: "#15803d", pack: "classics" },
    { id: "baby", label: "Baby", icon: "bottle", from: "#22c55e", to: "#15803d", pack: "classics" },
    // Hype & wins
    { id: "all-in-baby", label: "All in, baby", icon: "rocket", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "ship-it", label: "Ship it", icon: "ship", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "pay-that-man", label: "Pay that man his money", icon: "cash", from: "#f59e0b", to: "#b45309", pack: "movies" },
    { id: "daddy-new-stack", label: "Daddy needs a new stack", icon: "chippy:money+cash-top", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "bink", label: "Bink!", icon: "slot", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "nutted", label: "Nutted", icon: "peanut", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "big-stack-energy", label: "Big stack energy", icon: "chip-stack", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "gets-there", label: "Gets there", icon: "chequered-flag", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "pay-day", label: "Pay day", icon: "money-bag", from: "#f59e0b", to: "#b45309", pack: "hype" },
    { id: "easy-game", label: "Easy game", icon: "chippy:cool", from: "#f59e0b", to: "#b45309", pack: "hype" },
    // Bad beats & tilt
    { id: "rigged", label: "Rigged", icon: "dice", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "rivered-again", label: "Rivered again", icon: "wave", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "runner-runner", label: "Runner runner", icon: "sneaker", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "cooler", label: "Cooler", icon: "ice-cube", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "thats-poker", label: "That's poker", icon: "chippy:meh+shrug-sides", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "cruel-game", label: "Poker is a cruel game", icon: "broken-heart", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "variance-myth", label: "Variance is a myth (said nobody)", icon: "chart-down", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "tilted", label: "Tilted", icon: "chippy:fuming+steam-top", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "not-tilted", label: "I'm not tilted", icon: "chippy:forced", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    { id: "card-dead", label: "Card dead", icon: "tombstone", from: "#ef4444", to: "#991b1b", pack: "bad-beats" },
    // Calls & folds
    { id: "snap-call", label: "Snap call", icon: "bolt", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "hero-call", label: "Hero call", icon: "chippy:hero+stars-top", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "hero-fold", label: "Hero fold", icon: "chippy:determined+salute-side", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "snap-fold", label: "Snap fold", icon: "trash", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "had-to-call", label: "I had to call", icon: "phone", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "put-you-on-that", label: "I put you on that", icon: "chippy:wink", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "solver-says-call", label: "Solver says call", icon: "robot", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "trust-the-math", label: "Trust the math", icon: "calculator", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "never-folding", label: "Never folding", icon: "nope", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    { id: "tank-time", label: "Tank time", icon: "hourglass", from: "#3b82f6", to: "#1d4ed8", pack: "calls" },
    // Folklore & memes
    { id: "dont-tap-the-glass", label: "Don't tap the glass", icon: "fishbowl", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "the-hammer", label: "The Hammer (7-2)", icon: "hammer", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "seven-deuce", label: "Seven deuce never loses", icon: "cards-72", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "big-blind-special", label: "Big blind special", icon: "gift", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "one-time-dealer", label: "One time, dealer", icon: "finger-one", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "run-it-twice", label: "Run it twice", icon: "finger-two", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "looks-good-never-wins", label: "Looks good, never wins", icon: "cards-qj", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "coin-flip", label: "Coin flip", icon: "coin", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "bubble-boy", label: "Bubble boy", icon: "bubble", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "min-cash-king", label: "Min-cash king", icon: "crown", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "splash-the-pot", label: "Splash the pot", icon: "splash", from: "#8b5cf6", to: "#6d28d9", pack: "movies" },
    { id: "nyet", label: "Nyet.", icon: "chippy:determined", from: "#8b5cf6", to: "#6d28d9", pack: "movies" },
    { id: "spot-the-sucker", label: "Can't spot the sucker? It's you", icon: "lollipop", from: "#8b5cf6", to: "#6d28d9", pack: "movies" },
    { id: "ten-deuce", label: "The ten-deuce", icon: "cards-102", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "see-a-flop", label: "Can I see a flop?", icon: "chippy:calm+stars-top", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "last-hand", label: "Last hand, I swear", icon: "fingers-crossed", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "deck-hates-me", label: "The deck hates me", icon: "chippy:angry+rain-cloud-top", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "shove-and-pray", label: "Shove and pray", icon: "pray", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "gutshot-gang", label: "Gutshot gang", icon: "target", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "min-raise", label: "Did you just min-raise?", icon: "chippy:brow", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    { id: "show-me-the-money", label: "Show me the money", icon: "money-wings", from: "#8b5cf6", to: "#6d28d9", pack: "movies" },
    { id: "hold-my-chips", label: "Hold my chips", icon: "beer", from: "#8b5cf6", to: "#6d28d9", pack: "folklore" },
    // Table banter
    { id: "nit-alert", label: "Nit alert", icon: "siren", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "fish-on", label: "Fish on", icon: "fishing-rod", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "whale-spotted", label: "Whale spotted", icon: "whale", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "donk-bet", label: "Donk bet", icon: "donkey", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "slow-roll", label: "Slow roll much?", icon: "snail", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "show-one", label: "Show one?", icon: "eyes", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "respect-the-raise", label: "Respect the raise", icon: "chippy:cool+salute-side", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "speech", label: "Speech!", icon: "microphone", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "gg-no-re", label: "GG no re", icon: "white-flag", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    { id: "chip-and-a-chair", label: "Chip and a chair", icon: "chair", from: "#14b8a6", to: "#0f766e", pack: "banter" },
    // Pop culture
    { id: "must-be-nice", label: "Must be nice", icon: "chippy:smirk", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "another-one", label: "Another one", icon: "trophy", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "major-key", label: "Major key", icon: "key", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "this-is-fine", label: "This is fine", icon: "chippy:calm+flames-sides", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "im-in-danger", label: "I'm in danger", icon: "chippy:grimace", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "not-great", label: "Not great, not terrible", icon: "radiation", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "its-a-trap", label: "It's a trap!", icon: "mousetrap", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "stonks", label: "Stonks", icon: "chart-up", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "big-mistake", label: "Big mistake. Huge.", icon: "shopping-bag", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "shall-not-pass", label: "You shall not pass", icon: "wizard-hat", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "one-does-not-simply", label: "One does not simply fold aces", icon: "ring", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "ill-be-back", label: "I'll be back", icon: "thumbs-up", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "little-friend", label: "Say hello to my little friend", icon: "boom", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "inevitable", label: "I am inevitable", icon: "gauntlet", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "why-so-serious", label: "Why so serious?", icon: "joker-card", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "head-out", label: "Ight, imma head out", icon: "door", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "let-him-cook", label: "Let him cook", icon: "chef-hat", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "emotional-damage", label: "Emotional damage", icon: "chippy:dizzy+stars-top", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "chicken-dinner", label: "Winner winner chicken dinner", icon: "drumstick", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "luck-box", label: "Luck box", icon: "clover", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "skill-issue", label: "Skill issue", icon: "gamepad", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "caught-in-4k", label: "Caught in 4K", icon: "camera", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "copium", label: "Copium", icon: "canister", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "touch-grass", label: "Touch grass", icon: "grass", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "mission-failed", label: "Mission failed, we'll get 'em next time", icon: "medal", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "built-different", label: "Built different", icon: "hard-hat", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "rent-free", label: "Living rent free", icon: "chippy:love", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "down-bad", label: "Down bad", icon: "chippy:sad", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "task-failed", label: "Task failed successfully", icon: "check", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "over-9000", label: "It's over 9000!", icon: "burst-9000", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "call-an-ambulance", label: "Call an ambulance", icon: "ambulance", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "perfectly-balanced", label: "Perfectly balanced, as all things should be", icon: "scales", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "not-like-this", label: "Not like this", icon: "chippy:shocked", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "absolute-cinema", label: "Absolute cinema", icon: "clapper", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "so-over", label: "It's so over", icon: "chippy:melting", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "so-back", label: "We're so back", icon: "arrow-up", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "captain-now", label: "I'm the captain now", icon: "captain-hat", from: "#ec4899", to: "#be185d", pack: "movies" },
    { id: "free-real-estate", label: "Free real estate", icon: "house", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "visible-confusion", label: "Visible confusion", icon: "chippy:confused+question-top", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "npc-behaviour", label: "NPC behaviour", icon: "chippy:npc", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "chat-is-this-real", label: "Chat, is this real?", icon: "tv", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "chose-violence", label: "Bro chose violence", icon: "boxing-glove", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "the-audacity", label: "The audacity", icon: "chippy:shocked+steam-top", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "no-crumbs", label: "Ate and left no crumbs", icon: "plate", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "plot-twist", label: "Plot twist", icon: "swirl", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "took-it-personally", label: "And I took that personally", icon: "chippy:angry", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "delulu", label: "Delulu", icon: "unicorn", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "main-character", label: "Main character energy", icon: "star", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "thought-main-character", label: "Bro thought he was the main character", icon: "chippy:clown", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "this-is-a-wendys", label: "Sir, this is a Wendy's", icon: "burger", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
    { id: "kinda-sus", label: "Kinda sus", icon: "magnifier", from: "#ec4899", to: "#be185d", pack: "pop-culture" },
];

const BY_ID = new Map(STICKERS.map(s => [s.id, s]));

/** A sticker by id, or undefined for an unknown/retired id (ignore it). */
export const findSticker = (id: string | undefined): StickerDef | undefined => (id ? BY_ID.get(id) : undefined);
