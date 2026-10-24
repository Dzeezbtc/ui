import type { ArtSpec } from "./art/Art";

/**
 * Block52 emotes (block52-chat#2): our own small art for the composer's emoji
 * picker, in place of system emoji. Picking one inserts its shortcode, e.g.
 * ":laugh:", and chat renders the shortcode as the art (see richText).
 */
export interface EmoteDef {
    id: string;
    label: string;
    art: ArtSpec;
}

export const EMOTES: readonly EmoteDef[] = [
    { id: "happy", label: "Happy", art: "chippy:happy" },
    { id: "laugh", label: "Laughing", art: "chippy:laugh" },
    { id: "cool", label: "Cool", art: "chippy:cool" },
    { id: "wink", label: "Wink", art: "chippy:wink" },
    { id: "love", label: "Love it", art: "chippy:love" },
    { id: "smirk", label: "Smirk", art: "chippy:smirk" },
    { id: "money", label: "Money", art: "chippy:money" },
    { id: "shocked", label: "Shocked", art: "chippy:shocked" },
    { id: "confused", label: "Confused", art: "chippy:confused" },
    { id: "cry", label: "Crying", art: "chippy:cry" },
    { id: "angry", label: "Angry", art: "chippy:angry" },
    { id: "melting", label: "Melting", art: "chippy:melting" },
    { id: "dizzy", label: "Dizzy", art: "chippy:dizzy" },
    { id: "clown", label: "Clown", art: "chippy:clown" },
    { id: "thumbs-up", label: "Thumbs up", art: "thumbs-up" },
    { id: "thumbs-down", label: "Thumbs down", art: "thumbs-down" },
    { id: "clap", label: "Clap", art: "clap" },
    { id: "pray", label: "Please", art: "pray" },
    { id: "fire", label: "Fire", art: "flame" },
    { id: "eyes", label: "Eyes", art: "eyes" },
    { id: "crown", label: "Crown", art: "crown" },
    { id: "lucky", label: "Lucky", art: "clover" },
    { id: "bag", label: "Money bag", art: "money-bag" },
    { id: "spade", label: "Spade", art: "suit:s" },
    { id: "heart", label: "Heart", art: "suit:h" },
    { id: "diamond", label: "Diamond", art: "suit:d" },
    { id: "club", label: "Club", art: "suit:c" }
];

const BY_ID = new Map(EMOTES.map(e => [e.id, e]));

export function findEmote(id: string | undefined): EmoteDef | undefined {
    return id ? BY_ID.get(id) : undefined;
}

export type RichPart = { text: string } | { emote: EmoteDef };

/** Splits a message into text and known ":emote:" shortcodes (unknown ones stay text). */
export function parseEmotes(text: string): RichPart[] {
    const parts: RichPart[] = [];
    const re = /:([a-z0-9-]+):/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        const emote = BY_ID.get(m[1]);
        if (!emote) continue;
        if (m.index > last) parts.push({ text: text.slice(last, m.index) });
        parts.push({ emote });
        last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
}
