import React from "react";
import { parseEmotes } from "./emotes";
import ArtIcon from "./art/Art";

/** A chat message with its ":emote:" shortcodes drawn as Block52 emotes. */
export const RichText: React.FC<{ text: string; size?: number }> = ({ text, size = 20 }) => (
    <>
        {parseEmotes(text).map((p, i) =>
            "emote" in p ? (
                <ArtIcon key={i} spec={p.emote.art} size={size} label={p.emote.label} className="b52-emote" />
            ) : (
                <React.Fragment key={i}>{p.text}</React.Fragment>
            )
        )}
    </>
);

export default RichText;
