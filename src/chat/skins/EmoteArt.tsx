import React from "react";
import { useChatBrand, tableSkinOf } from "../brand";
import ArtIcon from "../art/Art";
import { findEmote } from "../emotes";
import { SkinIcon } from "./paint";
import { EMOTE_GLYPHS } from "./emoteGlyphs";

/**
 * A composer emoji (block52-chat#2) in the chat's current look: the table
 * skin's own drawing when a skin is on, otherwise the Block52 Chip Crew art.
 */
export const EmoteArt: React.FC<{ id: string; size?: number; label?: string; className?: string }> = ({ id, size = 24, label, className }) => {
    const skin = tableSkinOf(useChatBrand());
    const glyph = skin ? EMOTE_GLYPHS[id] : undefined;
    if (skin && glyph) return <SkinIcon skin={skin} glyph={glyph} size={size} label={label} className={className} />;
    const emote = findEmote(id);
    return emote ? <ArtIcon spec={emote.art} size={size} label={label} className={className} /> : null;
};

export default EmoteArt;
