import React, { useLayoutEffect, useRef, useState } from "react";
import "./SeatChatBubble.css";
import { useSeatChat } from "./useSeatChat";
import { findSticker } from "./stickers";
import StickerArt from "./StickerArt";

/** Room needed above the seat (header bar + the bubble); less than this flips it below. */
const MIN_SPACE_ABOVE_PX = 170;

/**
 * The speech bubble on a seated player's avatar (block52-chat#3): their latest
 * quick-chat sticker (pops in) or typed message, for a few seconds. It sits
 * above the seat, or below it for seats near the top of the screen, where
 * "above" would land under the table header. The host renders one per seat
 * inside the seat's positioned container. Never blocks clicks underneath.
 */
export const SeatChatBubble: React.FC<{ address: string | undefined }> = ({ address }) => {
    const msg = useSeatChat(address);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const [below, setBelow] = useState(false);

    // Decide above/below from where the seat actually is on screen.
    useLayoutEffect(() => {
        const seat = anchorRef.current?.parentElement;
        if (!msg || !seat) return;
        setBelow(seat.getBoundingClientRect().top < MIN_SPACE_ABOVE_PX);
    }, [msg]);

    if (!msg) return <span ref={anchorRef} hidden />;
    const sticker = findSticker(msg.sticker);
    return (
        <>
            <span ref={anchorRef} hidden />
            <div
                key={msg.id}
                className={`b52-seat-bubble ${sticker ? "b52-seat-bubble--sticker" : "b52-seat-bubble--text"}${below ? " b52-seat-bubble--below" : ""}`}
                role="status"
                aria-label={sticker ? `${sticker.label} sticker` : `Says: ${msg.text}`}
                data-testid="seat-chat-bubble"
            >
                {sticker ? <StickerArt sticker={sticker} size={104} /> : <span className="b52-seat-bubble__text">{msg.text}</span>}
            </div>
        </>
    );
};

export default SeatChatBubble;
