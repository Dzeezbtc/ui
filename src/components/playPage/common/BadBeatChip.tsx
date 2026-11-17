import React from "react";
import { badBeatChipColor } from "../../../utils/badBeatChipColor";

type BadBeatChipProps = {
    value: number;
    size: number;
    style?: React.CSSProperties;
};

/**
 * One Bad Beat chip drawn as markup (Dzeezbtc/ui#36), the "Broadcast" chip the
 * 3D table uses: a graphite face, a ring of slanted colour segments, a colour
 * core with the slanted slash. Styled in skins/badbeat.css.
 */
export const BadBeatChip: React.FC<BadBeatChipProps> = React.memo(({ value, size, style }) => {
    const { color, slash } = badBeatChipColor(value);
    return <span className="bb-chip" style={{ ...style, width: size, height: size, "--c": color, "--slash": slash } as React.CSSProperties} role="img" aria-label={`${value} chip`} />;
});
BadBeatChip.displayName = "BadBeatChip";
