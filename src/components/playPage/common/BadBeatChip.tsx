import React from "react";
import { badBeatChipColor, flatChipFaceLabel, isPaleChip, type FlatChipLook } from "../../../utils/badBeatChipColor";

type BadBeatChipProps = {
    value: number;
    /** Whose chips: Bad Beat's Broadcast set, Maison 52's salon plaques or Chip and a Chair's sticker chips. */
    look: FlatChipLook;
    size: number;
    style?: React.CSSProperties;
};

/** From this size (px) up, a salon plaque's face carries the M52 monogram over its value. */
const MONOGRAM_MIN_SIZE = 40;

/**
 * One chip drawn as markup (Dzeezbtc/ui#36, #38, #40): Bad Beat's Broadcast
 * chip (skins/badbeat.css), Maison 52's salon plaque (skins/maison.css) or
 * Chip and a Chair's sticker chip (skins/chipchair.css). The plaques and the
 * sticker chips carry their value on a face in the middle.
 */
export const BadBeatChip: React.FC<BadBeatChipProps> = React.memo(({ value, look, size, style }) => {
    const { color, slash } = badBeatChipColor(value, look);
    const hasFace = look !== "badbeat";
    const label = flatChipFaceLabel(value);
    return (
        <span
            className="bb-chip"
            data-look-chip={look}
            data-pale={isPaleChip(color) ? "true" : undefined}
            style={{ ...style, width: size, height: size, "--c": color, "--slash": slash, "--chip": `${size}px` } as React.CSSProperties}
            role="img"
            aria-label={`${value} chip`}
        >
            {hasFace && (
                <span className="bb-chip-face" data-len={Math.min(label.length, 4)} aria-hidden="true">
                    {look === "maison" && size >= MONOGRAM_MIN_SIZE && <small className="bb-chip-mono">M52</small>}
                    <b>{label}</b>
                </span>
            )}
        </span>
    );
});
BadBeatChip.displayName = "BadBeatChip";
