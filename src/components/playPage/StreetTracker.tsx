import React from "react";
import { STREET_LABELS, streetIndex } from "../../utils/streetTracker";

/**
 * Bad Beat's street tracker: Pre / Flop / Turn / River under the top bar, the
 * current street lit, the ones played dimmed, the ones to come faint.
 */
export const StreetTracker: React.FC<{ round: string | undefined }> = React.memo(({ round }) => {
    const at = streetIndex(round);
    return (
        <div data-part="street-tracker" className="fixed left-1/2 -translate-x-1/2 z-40" aria-label="Street">
            {STREET_LABELS.map((label, i) => (
                <span key={label} data-state={i === at ? "now" : i < at ? "done" : "next"} aria-current={i === at ? "step" : undefined}>
                    {label}
                </span>
            ))}
        </div>
    );
});
StreetTracker.displayName = "StreetTracker";
