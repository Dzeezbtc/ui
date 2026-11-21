import React from "react";
import { turnStatus } from "../../utils/turnStatus";
import { getViewportMode } from "../../config/stageGeometry";

/**
 * "Your turn" / "Waiting (Seat 5's turn)" in the corner opposite the hand
 * strength (the Block52 flagship's status line).
 */
export const TurnStatusLabel: React.FC<{ nextToAct: number; mySeat: number; inline?: boolean }> = React.memo(({ nextToAct, mySeat, inline }) => {
    const status = turnStatus(nextToAct, mySeat);
    if (!status) return null;
    // Inline: stacked in the left column with the sit-out boxes (desktop), so they never overlap.
    if (inline) {
        return (
            <div data-part="turn-status" data-mine={status.mine ? "true" : undefined} role="status" aria-live="polite">
                <b>{status.title}</b>
                {status.detail && <span> {status.detail}</span>}
            </div>
        );
    }
    const mode = getViewportMode();
    const compact = mode === "mobile-portrait" || mode === "mobile-landscape";
    const style = compact ? { bottom: "calc(env(safe-area-inset-bottom) + 169px)" } : { bottom: "168px" };
    return (
        <div data-part="turn-status" data-mine={status.mine ? "true" : undefined} style={style} className="fixed left-4 z-50" role="status" aria-live="polite">
            <b>{status.title}</b>
            {status.detail && <span> {status.detail}</span>}
        </div>
    );
});
TurnStatusLabel.displayName = "TurnStatusLabel";
