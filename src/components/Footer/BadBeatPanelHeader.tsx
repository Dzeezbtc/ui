import React from "react";
import { potOddsPercent } from "../../utils/potOdds";

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
                {odds !== null && (
                    <span>
                        Pot odds <b>{odds}%</b> · need that much equity
                    </span>
                )}
            </div>
        </>
    );
};
