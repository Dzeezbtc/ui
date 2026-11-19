import React from "react";
import { HOLE_CARD_ROW_HEIGHT, holeCardLayout, WinnerCardHighlight } from "../../../utils/holeCardLayout";
import { useTableStyle } from "../../../context/TableStyleContext";
import { usesFlagshipLayout } from "../../../utils/tableStyle";
import { FlagshipCard } from "../Card/FlagshipCard";

export interface HoleCardImage {
    key: string;
    src: string;
    alt: string;
    /** The card code ("QH"); the flagship skin draws the card from it. Omitted for a face-down card. */
    code?: string;
    highlight?: WinnerCardHighlight;
    className?: string;
    onError?: () => void;
}

/**
 * A seat's hole cards: two for Hold'em, four (smaller, overlapped) for Omaha
 * (ui#768). The row keeps the same height either way so the avatar below it
 * does not move. The flagship skin draws its own pearl cards instead of the
 * card images, at the same size (its stylesheet resizes them per seat).
 */
export const HoleCardRow: React.FC<{ cards: HoleCardImage[] }> = ({ cards }) => {
    const { width, height, overlap } = holeCardLayout(cards.length);
    const flagship = usesFlagshipLayout(useTableStyle());
    return (
        <>
            {cards.map((card, i) => {
                const style = { marginLeft: i > 0 ? -overlap : 0, marginTop: HOLE_CARD_ROW_HEIGHT - height };
                const className = `mb-[11px]${card.className ? ` ${card.className}` : ""}${card.highlight === "lift" ? " animate-win-card" : ""}${card.highlight === "mute" ? " opacity-40" : ""}`;
                if (flagship) {
                    return <FlagshipCard key={card.key} code={card.code} back={!card.code} className={className} style={{ ...style, width, height }} />;
                }
                return <img key={card.key} src={card.src} alt={card.alt} width={width} height={height} style={style} className={className} onError={card.onError} />;
            })}
        </>
    );
};
