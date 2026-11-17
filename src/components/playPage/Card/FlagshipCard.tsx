import React from "react";
import { cardFace } from "../../../utils/cardFace";

/**
 * A Block52 flagship card, drawn as markup: pearl-white face, rank and small
 * suit top left, big suit bottom right, pink for hearts and diamonds. A hidden
 * or unknown code draws the gradient back with the Block52 diamond.
 */
export const FlagshipCard: React.FC<{ code?: string; back?: boolean; className?: string; style?: React.CSSProperties }> = ({ code, back, className, style }) => {
    const face = back ? null : cardFace(code);
    const extra = className ? ` ${className}` : "";
    if (!face) return <div className={`fs-card fs-back${extra}`} style={style} aria-label="Card back" />;
    return (
        <div className={`fs-card${face.red ? " fs-red" : ""}${extra}`} style={style} aria-label={`${face.rank}${face.suit}`}>
            <span className="fs-r">{face.rank}</span>
            <span className="fs-s">{face.suit}</span>
            <span className="fs-pip">{face.suit}</span>
        </div>
    );
};
