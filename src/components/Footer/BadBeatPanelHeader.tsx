import React from "react";
import { potOddsPercent } from "../../utils/potOdds";
import { turnStatus } from "../../utils/turnStatus";
import { hasValue } from "../../utils/guards";

interface BadBeatPanelHeaderProps {
    /** The amount to call (display units), 0 when you can check. */
    toCall: number;
    /** The pot (display units). */
    pot: number;
    /** The call amount as the table shows money ("$10.00" / "200"). */
    callLabel: string;
    /** The pot as the table shows money. */
    potLabel: string;
}

/**
 * Bad Beat's action panel header (Dzeezbtc/ui#36), shown on your turn: "Your
 * turn" with what it costs to call, and under the buttons' presets, the pot
 * and the pot odds (the equity a call needs). Only the Bad Beat style draws it.
 */
export const BadBeatPanelHeader: React.FC<BadBeatPanelHeaderProps> = ({ toCall, pot, callLabel, potLabel }) => {
    const odds = potOddsPercent(toCall, pot);
    return (
        <>
            <div data-part="bb-panel-head">
                <b>Your turn</b>
                <span>{toCall > 0 ? `${callLabel} to call` : "Check or bet"}</span>
            </div>
            <div data-part="bb-panel-odds">
                <span>
                    Pot <b>{potLabel}</b>
                </span>
                {hasValue(odds) && (
                    <span>
                        Pot odds <b>{odds}%</b> · need that much equity
                    </span>
                )}
            </div>
        </>
    );
};

/**
 * Bad Beat's panel header while you wait (Dzeezbtc/ui#36): "Waiting (Seat 7's
 * turn)" where "Your turn" goes, as in the concept. Nothing between hands or
 * when you are not seated.
 */
export const BadBeatWaitingHeader: React.FC<{ nextToAct: number; mySeat: number }> = ({ nextToAct, mySeat }) => {
    const status = turnStatus(nextToAct, mySeat);
    if (!status || status.mine) return null;
    return (
        <div data-part="bb-panel-head" data-waiting="true" role="status" aria-live="polite">
            <b>{status.title}</b>
            <span>{status.detail}</span>
        </div>
    );
};
