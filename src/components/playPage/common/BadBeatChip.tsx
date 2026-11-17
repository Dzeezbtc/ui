import React from "react";
import { badBeatChipColor, type FlatChipLook } from "../../../utils/badBeatChipColor";

type BadBeatChipProps = {
    value: number;
    /** Whose chips: Bad Beat's Broadcast set, Maison 52's or Chip and a Chair's. */
    look: FlatChipLook;
    size: number;
    style?: React.CSSProperties;
};

/**
 * One 3D table's chip drawn as markup (Dzeezbtc/ui#36, #38), the chip its 3D
 * table uses: Bad Beat's Broadcast chip (skins/badbeat.css) or Maison 52's
 * gilt chip (skins/maison.css).
 */
export const BadBeatChip: React.FC<BadBeatChipProps> = React.memo(({ value, look, size, style }) => {
    const { color, slash } = badBeatChipColor(value, look);
    return <span className="bb-chip" style={{ ...style, width: size, height: size, "--c": color, "--slash": slash } as React.CSSProperties} role="img" aria-label={`${value} chip`} />;
});
BadBeatChip.displayName = "BadBeatChip";
