import React from "react";
import { calculatePotBetWithVariation, PotBetVariation } from "../../utils/calculatePotBetAmount";
import { microBigIntToUsdc, roundMicroToCent } from "../../constants/currency";
import { presetExceedsMax } from "../../utils/potPresetLimits";
import type { PotSizedBetButtonsProps } from "./types";

export const PotSizedBetButtons: React.FC<PotSizedBetButtonsProps> = ({
    totalPotMicro,
    callAmountMicro,
    minAmount,
    maxAmount,
    isTournament,
    currentRound,
    previousActions,
    disabled,
    onAmountSelect,
    onAllIn,
    maxIsAllIn
}) => {
    const potBetOptions: { label: string; variation: PotBetVariation }[] = [
        { label: "1/4 Pot", variation: "1/4" },
        { label: "1/2 Pot", variation: "1/2" },
        { label: "3/4 Pot", variation: "3/4" },
        { label: "Pot", variation: "1" }
    ];

    // The preset's true size in micro-USDC (cash) or chips (tournaments).
    const presetMicro = (variation: PotBetVariation): bigint =>
        calculatePotBetWithVariation(
            {
                currentRound,
                previousActions,
                callAmount: callAmountMicro,
                pot: totalPotMicro
            },
            variation
        );

    // The preset as shown and selected: rounded to the cent (cash) or a whole chip
    // (tournaments). Never lifted to the minimum or shrunk to the max — a preset
    // outside the legal range is disabled instead (see below).
    const presetAmount = (potBetMicro: bigint): number =>
        // Tournaments deal in raw whole chips; cash converts micro-USDC (÷10^6) to dollars.
        isTournament ? Number(potBetMicro) : microBigIntToUsdc(roundMicroToCent(potBetMicro));

    // A short stack that can't afford the legal minimum can only shove, via ALL-IN.
    const cannotAffordMin = minAmount > maxAmount;

    return (
        <div className="flex justify-between gap-1 lg:gap-2 mb-1">
            {potBetOptions.map(({ label, variation }) => {
                const potBetMicro = presetMicro(variation);
                const amount = presetAmount(potBetMicro);
                // Each preset is judged on its own and greyed out rather than silently
                // resized: one below the legal minimum (one big blind to open, the min
                // raise when facing a bet), or one above the most the player may put
                // in (ui#857) — a short stack shoves with ALL-IN, not a "Pot" button.
                const belowMin = amount < minAmount;
                const aboveMax = presetExceedsMax(potBetMicro, maxAmount, isTournament);
                const aboveMaxTitle = maxIsAllIn ? "More than your stack" : "More than the pot-limit allows";
                return (
                    <button
                        key={label}
                        className="btn-pot px-1 lg:px-2 py-1 lg:py-1.5 rounded-lg w-full border shadow-md text-[10px] lg:text-xs transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                        // Capped only for cent rounding: a pot-limit Pot whose true size
                        // fits the cap can round a fraction of a cent above it.
                        onClick={() => onAmountSelect(Math.min(amount, maxAmount))}
                        disabled={disabled || cannotAffordMin || belowMin || aboveMax}
                        title={belowMin ? "Below the minimum bet" : aboveMax ? aboveMaxTitle : undefined}
                    >
                        {label}
                    </button>
                );
            })}

            <button
                className="btn-all-in px-1 lg:px-2 py-1 lg:py-1.5 rounded-lg w-full border shadow-md text-[10px] lg:text-xs transition-all duration-200 font-medium transform active:scale-105"
                onClick={onAllIn}
                // At pot-limit, Pot already is the max: ALL-IN only lights up when the
                // whole stack is less than a pot-sized bet (ui#857), never as "MAX".
                disabled={disabled || !maxIsAllIn}
                title={maxIsAllIn ? undefined : "Pot is the most you can bet at pot-limit"}
            >
                ALL-IN
            </button>
        </div>
    );
};
