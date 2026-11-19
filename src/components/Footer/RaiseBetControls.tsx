import React from "react";
import { RaiseSlider } from "./RaiseSlider";
import { PotSizedBetButtons } from "./PotSizedBetButtons";
import type { RaiseBetControlsProps } from "./types";
import { hasSingleBetAmount } from "../../utils/pockerActionUtils";
import { useTableStyle } from "../../context/TableStyleContext";
import { isThreeTableStyle } from "../../utils/tableStyle";

export const RaiseBetControls: React.FC<RaiseBetControlsProps> = ({
    amount,
    minAmount,
    maxAmount,
    formattedMaxAmount,
    displayOffset,
    totalPotMicro,
    callAmountMicro,
    isInvalid,
    isMobileLandscape,
    isTournament,
    currentRound,
    previousActions,
    disabled,
    onAmountChange,
    onIncrement,
    onDecrement,
    onAllIn,
    maxIsAllIn,
    allowBlindMultiples
}) => {
    // Bad Beat keeps its bet-size row on a phone held sideways too: its panel is a column with room (ui#36)
    const badBeat = isThreeTableStyle(useTableStyle());
    // A fixed-limit bet or raise has one amount (ui#883): the action button
    // carries it, so there is nothing to slide or preset.
    if (hasSingleBetAmount(minAmount, maxAmount)) {
        return null;
    }
    return (
        <>
            {/* Slider Row */}
            <RaiseSlider
                value={amount}
                min={minAmount}
                max={maxAmount}
                formattedMax={formattedMaxAmount}
                displayOffset={displayOffset}
                isInvalid={isInvalid}
                disabled={disabled}
                isMobileLandscape={isMobileLandscape}
                isTournament={isTournament}
                isAllIn={maxIsAllIn && amount >= maxAmount}
                onChange={onAmountChange}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
            />

            {/* Pot-Sized Bet Buttons - Hide in mobile landscape to save space (not on Bad Beat) */}
            {(!isMobileLandscape || badBeat) && (
                <PotSizedBetButtons
                    totalPotMicro={totalPotMicro}
                    callAmountMicro={callAmountMicro}
                    minAmount={minAmount}
                    maxAmount={maxAmount}
                    isTournament={isTournament}
                    currentRound={currentRound}
                    previousActions={previousActions}
                    disabled={disabled}
                    onAmountSelect={onAmountChange}
                    onAllIn={onAllIn}
                    maxIsAllIn={maxIsAllIn}
                    allowBlindMultiples={allowBlindMultiples}
                />
            )}
        </>
    );
};
