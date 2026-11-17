import React from "react";
import { formatPotLabel, potLabelParts, PotName } from "../../../../utils/potTextUtils";
import { useTableStyle } from "../../../../context/TableStyleContext";
import { usesFlagshipLayout } from "../../../../utils/tableStyle";
import { PotPill } from "./PotPill";

interface MainPotDisplayProps {
    /** Formatted pot size, for the text label. */
    amount: string;
    /** Raw pot size (micro-USDC for cash, chips for tournaments), for the chip stack. */
    rawAmount: bigint;
    isTournamentStyle: boolean;
    /** "Pot as Chips" setting (ui#772): a chip pill instead of the "Main Pot: $x" text. */
    asChips: boolean;
    /** Pot name (ui#918): "Main Pot", or "Side Pot 1" etc. when side pots are shown. */
    label?: PotName;
}

export const MainPotDisplay: React.FC<MainPotDisplayProps> = ({ amount, rawAmount, isTournamentStyle, asChips, label = "Main Pot" }) => {
    const flagship = usesFlagshipLayout(useTableStyle());
    if (asChips) {
        return (
            <div className="pot-chips-secondary">
                <PotPill amount={rawAmount} label={label} isTournament={isTournamentStyle} />
            </div>
        );
    }
    if (flagship) {
        const { name, value } = potLabelParts(label, amount, isTournamentStyle);
        return (
            <div className="pot-display-secondary" data-part="pot">
                <span className="fs-pot-name">{name}</span> <b className="fs-pot-value">{value}</b>
            </div>
        );
    }
    return (
        <div className="pot-display-secondary">
            {formatPotLabel(label, amount, isTournamentStyle)}
        </div>
    );
};
