/**
 * Spots strong language in a chat message (block52-chat#13) so the other
 * players can be offered a one-tap Block. It NEVER changes or hides a message —
 * players can say what they want; others decide whether to see it.
 *
 * A short list of strong words and slurs, matched as whole words (with common
 * suffixes) and with simple masking like f*ck or f**k.
 */
const STEMS = [
    "fuck",
    "shit",
    "cunt",
    "bitch",
    "bastard",
    "asshole",
    "dick",
    "prick",
    "twat",
    "wanker",
    "motherfucker",
    "bullshit",
    "dickhead",
    "slut",
    "whore",
    "retard"
];

// A stem with each inner letter optionally masked (* or _), plus optional suffixes.
const pattern = STEMS.map(stem => stem[0] + stem.slice(1).split("").map(c => `[${c}*_]`).join("")).join("|");
const STRONG = new RegExp(`(^|[^a-z])(${pattern})(s|es|ed|er|ers|ing|in|y|ty)?(?=$|[^a-z])`, "i");

export const hasStrongLanguage = (text: string): boolean => STRONG.test(text);
