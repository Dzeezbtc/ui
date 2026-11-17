import React from "react";
import { b52ChipColor, b52ChipLabel } from "../../../utils/b52Chips";
import "./B52Chip.css";

type B52ChipProps = {
    value: number;
    isTournament: boolean;
    size: number;
    style?: React.CSSProperties;
};

/**
 * One Block52 chip, drawn as markup (the flagship skin's chips): a neon
 * gradient face, white edge spots, the value and the 52 mark. Tournament chips
 * get a striped edge and no currency, so they never pass for cash.
 */
export const B52Chip: React.FC<B52ChipProps> = React.memo(({ value, isTournament, size, style }) => {
    const color = b52ChipColor(value);
    const label = b52ChipLabel(value, isTournament);
    const vars = {
        ...style,
        width: size,
        height: size,
        "--a": color.a,
        "--b": color.b,
        "--glow": color.glow
    } as React.CSSProperties;
    return (
        <span
            className={`b52-chip${isTournament ? " b52-chip-t" : ""}`}
            data-long={label.length > 3 ? "true" : undefined}
            data-light={color.light ? "true" : undefined}
            style={vars}
            role="img"
            aria-label={`${label} chip`}
        >
            <span className="b52-chip-ring" aria-hidden="true" />
            <span className="b52-chip-v">{label}</span>
        </span>
    );
});
B52Chip.displayName = "B52Chip";
