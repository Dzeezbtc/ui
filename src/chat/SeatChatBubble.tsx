import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./SeatChatBubble.css";
import { useSeatChat } from "./useSeatChat";
import { findSticker } from "./stickers";
import StickerArt from "./StickerArt";
import { registerSeat } from "./seatRegistry";
import RichText from "./RichText";

/**
 * The speech bubble above a seated player's avatar (block52-chat#3): their
 * latest quick-chat sticker (pops in) or typed message, for a few seconds.
 *
 * The host renders this inside each seat's positioned container; it measures
 * that seat and draws the bubble in a top layer (a portal) just above it, so it
 * sits on top of everything on the table — banners included — and is never
 * clipped by the table's own layers. It may run off the top edge for top
 * seats; that's accepted. Never blocks clicks underneath.
 */
export const SeatChatBubble: React.FC<{ address: string | undefined }> = ({ address }) => {
    const msg = useSeatChat(address);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

    // Tell throwables (#7) where this player's seat is.
    useLayoutEffect(() => registerSeat(address, anchorRef.current?.parentElement ?? null), [address]);

    // Track the seat's on-screen position while a bubble is up.
    useLayoutEffect(() => {
        const seat = anchorRef.current?.parentElement;
        if (!msg || !seat) {
            setPos(null);
            return;
        }
        const place = () => {
            const r = seat.getBoundingClientRect();
            setPos({ x: r.left + r.width / 2, y: r.top });
        };
        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [msg]);

    const sticker = msg ? findSticker(msg.sticker) : undefined;
    return (
        <>
            <span ref={anchorRef} hidden />
            {msg &&
                pos &&
                createPortal(
                    <div className="b52-seat-bubble-layer" style={{ left: pos.x, top: pos.y }}>
                        <div
                            key={msg.id}
                            className={`b52-seat-bubble ${sticker ? "b52-seat-bubble--sticker" : "b52-seat-bubble--text"}`}
                            role="status"
                            aria-label={sticker ? `${sticker.label} sticker` : `Says: ${msg.text}`}
                            data-testid="seat-chat-bubble"
                        >
                            {sticker ? <StickerArt sticker={sticker} size={76} /> : <span className="b52-seat-bubble__text"><RichText text={msg.text} size={18} /></span>}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default SeatChatBubble;
