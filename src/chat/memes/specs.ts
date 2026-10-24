/**
 * What every meme sticker shows (block52-chat#2), independent of the drawing
 * style: who is in it, their face, what they're doing, what they're holding,
 * and any effects. Each style (Wojak, rage comic, rubber hose, stick figures)
 * draws the same plan its own way, so the jokes match across styles.
 *
 * `prop` / `side` / `above` are Chip Crew art specs (see art/Art.tsx) used as
 * objects in the scene; characters and faces belong to each style.
 */
export type Who = "guy" | "nerd" | "doomer" | "chad" | "npc" | "donkey" | "whale" | "fish";
export type Face =
    | "neutral" | "smile" | "grin" | "laugh" | "cry" | "sad" | "rage" | "shock" | "smug" | "nervous"
    | "sleep" | "dizzy" | "cool" | "confused" | "calm" | "determined" | "love" | "wow";
export type Pose = "none" | "point" | "up" | "hold" | "shrug" | "facepalm" | "pray" | "push" | "clap" | "salute" | "thumb" | "chin" | "cheeks";
export type Fx =
    | "flames" | "sweat" | "steam" | "sparkles" | "rain" | "zzz" | "question" | "motion" | "hearts" | "stars" | "spotlight" | "chips" | "ice" | "money" | "bubble";
export type Hat = "captain-hat" | "chef-hat" | "wizard-hat" | "crown" | "hard-hat" | "cowboy-hat";

export interface MemeSpec {
    who: Who;
    face: Face;
    pose?: Pose;
    /** held in the hand when the pose is "hold" (an art spec) */
    prop?: string;
    /** a big object beside the character (an art spec) */
    side?: string;
    /** an object above the character's head (an art spec) */
    above?: string;
    hat?: Hat;
    fx?: Fx[];
    /** short sign or label text in the scene (e.g. "ALL IN") */
    sign?: string;
    /** panel background colour */
    bg?: string;
}

const S = (who: Who, face: Face, rest: Partial<MemeSpec> = {}): MemeSpec => ({ who, face, ...rest });

export const MEME_SPECS: Record<string, MemeSpec> = {
    // Classics
    "nice-hand": S("guy", "smile", { pose: "clap", fx: ["sparkles"] }),
    "good-game": S("guy", "smile", { side: "handshake" }),
    "well-played": S("chad", "smug", { pose: "thumb" }),
    "good-call": S("nerd", "smug", { pose: "point", above: "brain" }),
    "nice-flop": S("guy", "wow", { side: "cards-fan" }),
    thanks: S("guy", "calm", { pose: "pray" }),
    "running-hot": S("chad", "cool", { fx: ["flames"] }),
    "running-bad": S("doomer", "sad", { fx: ["rain"] }),
    "bad-run-out": S("guy", "dizzy", { side: "skull" }),
    finally: S("guy", "laugh", { pose: "up", fx: ["sparkles"] }),
    laughing: S("guy", "laugh", { fx: ["motion"] }),
    sad: S("guy", "cry"),
    baby: S("nerd", "cry", { pose: "hold", prop: "bottle" }),
    // Hype & wins
    "all-in-baby": S("chad", "grin", { pose: "push", fx: ["chips"], sign: "ALL IN" }),
    "ship-it": S("chad", "grin", { hat: "captain-hat", side: "ship" }),
    "pay-that-man": S("guy", "smug", { pose: "hold", prop: "cash" }),
    "daddy-new-stack": S("guy", "nervous", { pose: "pray", above: "chip-stack" }),
    bink: S("nerd", "wow", { pose: "up", side: "slot" }),
    nutted: S("chad", "smug", { pose: "hold", prop: "peanut" }),
    "big-stack-energy": S("chad", "cool", { side: "chip-stack" }),
    "gets-there": S("guy", "smile", { pose: "hold", prop: "chequered-flag" }),
    "pay-day": S("guy", "grin", { pose: "hold", prop: "money-bag", fx: ["money"] }),
    "easy-game": S("chad", "cool", { pose: "thumb" }),
    rigged: S("guy", "rage", { pose: "point", side: "dice", fx: ["steam"] }),
    "rivered-again": S("doomer", "sad", { side: "wave" }),
    "runner-runner": S("guy", "shock", { side: "sneaker", fx: ["motion"] }),
    cooler: S("guy", "shock", { fx: ["ice"] }),
    "thats-poker": S("guy", "neutral", { pose: "shrug" }),
    "cruel-game": S("guy", "cry", { above: "broken-heart" }),
    "variance-myth": S("nerd", "smug", { pose: "point", side: "chart-down" }),
    tilted: S("guy", "rage", { fx: ["steam"] }),
    "not-tilted": S("guy", "nervous", { fx: ["sweat", "steam"] }),
    "card-dead": S("doomer", "sleep", { side: "tombstone", fx: ["zzz"] }),
    // Calls & folds
    "snap-call": S("chad", "determined", { pose: "push", fx: ["motion"], side: "bolt" }),
    "hero-call": S("chad", "determined", { pose: "up", fx: ["sparkles"] }),
    "hero-fold": S("guy", "determined", { pose: "salute" }),
    "snap-fold": S("guy", "neutral", { side: "trash", fx: ["motion"] }),
    "had-to-call": S("guy", "nervous", { pose: "hold", prop: "phone", fx: ["sweat"] }),
    "put-you-on-that": S("nerd", "smug", { pose: "point" }),
    "solver-says-call": S("nerd", "neutral", { side: "robot" }),
    "trust-the-math": S("nerd", "smug", { pose: "hold", prop: "calculator" }),
    "never-folding": S("chad", "determined", { side: "nope" }),
    "tank-time": S("guy", "confused", { pose: "chin", side: "hourglass" }),
    // Folklore & memes
    "dont-tap-the-glass": S("guy", "smug", { pose: "point", side: "fishbowl" }),
    "the-hammer": S("chad", "grin", { pose: "hold", prop: "hammer", side: "cards-72" }),
    "seven-deuce": S("chad", "smug", { side: "cards-72" }),
    "big-blind-special": S("guy", "wow", { side: "gift" }),
    "one-time-dealer": S("guy", "nervous", { pose: "pray", fx: ["sweat"] }),
    "run-it-twice": S("guy", "smile", { side: "finger-two" }),
    "looks-good-never-wins": S("doomer", "sad", { side: "cards-qj" }),
    "coin-flip": S("guy", "nervous", { side: "coin", fx: ["sweat"] }),
    "bubble-boy": S("guy", "nervous", { fx: ["bubble", "sweat"] }),
    "min-cash-king": S("guy", "smug", { hat: "crown" }),
    "splash-the-pot": S("chad", "grin", { pose: "push", side: "splash" }),
    nyet: S("doomer", "determined", { side: "nope" }),
    "spot-the-sucker": S("nerd", "confused", { side: "lollipop", fx: ["question"] }),
    "ten-deuce": S("chad", "grin", { side: "cards-102" }),
    "see-a-flop": S("guy", "nervous", { pose: "pray", side: "cards-fan" }),
    "last-hand": S("guy", "nervous", { side: "fingers-crossed", fx: ["sweat"] }),
    "deck-hates-me": S("guy", "rage", { side: "cards-fan", fx: ["steam"] }),
    "shove-and-pray": S("guy", "nervous", { pose: "pray", fx: ["chips", "sweat"] }),
    "gutshot-gang": S("chad", "cool", { side: "target" }),
    // Table banter
    "min-raise": S("nerd", "confused", { fx: ["question"], side: "chip" }),
    "show-me-the-money": S("guy", "wow", { pose: "up", fx: ["money"] }),
    "hold-my-chips": S("chad", "grin", { pose: "hold", prop: "beer" }),
    "nit-alert": S("guy", "shock", { side: "siren" }),
    "fish-on": S("guy", "grin", { pose: "hold", prop: "fishing-rod" }),
    "whale-spotted": S("nerd", "wow", { pose: "point" }),
    "donk-bet": S("donkey", "grin", { pose: "push", fx: ["chips"], sign: "ALL IN" }),
    "slow-roll": S("guy", "rage", { side: "snail" }),
    "show-one": S("guy", "nervous", { side: "eyes" }),
    "respect-the-raise": S("chad", "determined", { pose: "salute" }),
    speech: S("guy", "wow", { pose: "hold", prop: "microphone" }),
    "gg-no-re": S("doomer", "neutral", { pose: "hold", prop: "white-flag" }),
    "chip-and-a-chair": S("guy", "determined", { side: "chair" }),
    "must-be-nice": S("doomer", "smug", { side: "money-bag" }),
    "another-one": S("chad", "grin", { pose: "hold", prop: "trophy" }),
    "major-key": S("chad", "cool", { pose: "hold", prop: "key" }),
    // Pop culture
    "this-is-fine": S("guy", "calm", { fx: ["flames"] }),
    "im-in-danger": S("guy", "nervous", { fx: ["sweat"], side: "siren" }),
    "not-great": S("guy", "neutral", { side: "radiation" }),
    "its-a-trap": S("guy", "shock", { side: "mousetrap" }),
    stonks: S("npc", "smug", { side: "chart-up" }),
    "big-mistake": S("chad", "smug", { pose: "hold", prop: "shopping-bag" }),
    "shall-not-pass": S("guy", "determined", { hat: "wizard-hat", pose: "up" }),
    "one-does-not-simply": S("guy", "neutral", { pose: "chin", side: "ring" }),
    "ill-be-back": S("chad", "cool", { pose: "thumb" }),
    "little-friend": S("guy", "grin", { side: "boom" }),
    inevitable: S("chad", "smug", { pose: "hold", prop: "gauntlet" }),
    "why-so-serious": S("guy", "grin", { side: "joker-card" }),
    "head-out": S("guy", "neutral", { side: "door" }),
    "let-him-cook": S("guy", "smug", { hat: "chef-hat" }),
    "emotional-damage": S("guy", "dizzy", { fx: ["stars"], above: "broken-heart" }),
    "chicken-dinner": S("chad", "grin", { pose: "hold", prop: "drumstick" }),
    "luck-box": S("guy", "grin", { side: "clover", fx: ["sparkles"] }),
    "skill-issue": S("nerd", "smug", { pose: "hold", prop: "gamepad" }),
    "caught-in-4k": S("guy", "shock", { side: "camera" }),
    copium: S("doomer", "calm", { side: "canister" }),
    "touch-grass": S("npc", "neutral", { side: "grass" }),
    "mission-failed": S("guy", "sad", { pose: "salute", side: "medal" }),
    "built-different": S("chad", "cool", { hat: "hard-hat" }),
    "rent-free": S("guy", "smile", { above: "house" }),
    "down-bad": S("doomer", "sad", { fx: ["rain"] }),
    "task-failed": S("guy", "smile", { side: "check" }),
    "over-9000": S("nerd", "shock", { side: "burst-9000" }),
    "call-an-ambulance": S("chad", "smug", { side: "ambulance" }),
    "perfectly-balanced": S("guy", "calm", { side: "scales" }),
    "not-like-this": S("guy", "shock", { pose: "cheeks" }),
    "absolute-cinema": S("guy", "wow", { pose: "up", side: "clapper" }),
    "so-over": S("guy", "cry"),
    "so-back": S("chad", "grin", { pose: "up", side: "arrow-up" }),
    "captain-now": S("chad", "smug", { hat: "captain-hat", pose: "point" }),
    "free-real-estate": S("guy", "grin", { side: "house" }),
    "visible-confusion": S("guy", "confused", { fx: ["question"] }),
    "npc-behaviour": S("npc", "neutral"),
    "chat-is-this-real": S("nerd", "shock", { side: "tv" }),
    "chose-violence": S("guy", "rage", { side: "boxing-glove" }),
    "the-audacity": S("guy", "shock", { pose: "cheeks" }),
    "no-crumbs": S("chad", "smug", { side: "plate" }),
    "plot-twist": S("guy", "shock", { side: "swirl" }),
    "took-it-personally": S("guy", "rage", { pose: "point", fx: ["steam"] }),
    delulu: S("guy", "love", { side: "unicorn", fx: ["hearts"] }),
    "main-character": S("chad", "cool", { fx: ["spotlight"] }),
    "thought-main-character": S("npc", "smile", { fx: ["spotlight"], above: "star" }),
    "this-is-a-wendys": S("npc", "neutral", { side: "burger" }),
    "kinda-sus": S("nerd", "smug", { pose: "hold", prop: "magnifier" })
};
