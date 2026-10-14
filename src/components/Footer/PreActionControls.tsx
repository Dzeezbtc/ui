import React from "react";
import { PreAction } from "../../utils/preActions";

interface PreActionControlsProps {
    /** Which pre-action is armed, or null. */
    armed: PreAction | null;
    /** Arm a pre-action, or null to disarm. Arming is mutually exclusive. */
    onArm: (action: PreAction | null) => void;
    /** Whether checking is currently free (decides the middle button's identity). */
    facingNoBet: boolean;
    /** Formatted current call amount, e.g. "$3" — shown on the middle button when facing a bet. */
    callAmountLabel: string;
    isMobileLandscape?: boolean;
}

/**
 * CoinPoker-style pre-action bar (ui#388): three tick-to-arm buttons shown while
 * it is not the player's turn. Left is always Check/Fold, right is always Call Any,
 * and the middle adapts — Check when checking is free, Call {amount} when facing a
 * bet. Arming one fires it the instant the player's turn comes (no betting bar).
 */
export const PreActionControls: React.FC<PreActionControlsProps> = ({ armed, onArm, facingNoBet, callAmountLabel, isMobileLandscape }) => {
    const buttons: { action: PreAction; label: string; title: string }[] = [
        {
            action: "check-fold",
            label: "Check/Fold",
            title: "Checks when your turn comes if checking is free; folds if someone bets first."
        },
        facingNoBet
            ? { action: "check", label: "Check", title: "Checks when your turn comes. Clears if someone bets first." }
            : { action: "call-exact", label: `Call ${callAmountLabel}`, title: "Calls this exact amount when your turn comes. Clears if the bet is raised." },
        {
            action: "call-any",
            label: "Call Any",
            title: "Calls whatever the bet is when your turn comes."
        }
    ];

    return (
        <div className="flex justify-center gap-2">
            {buttons.map(({ action, label, title }) => {
                const isArmed = armed === action;
                return (
                    <button
                        key={action}
                        type="button"
                        role="checkbox"
                        aria-checked={isArmed}
                        aria-label={`Pre-select ${label} for your turn`}
                        title={title}
                        onClick={() => onArm(isArmed ? null : action)}
                        className={`flex items-center gap-2 rounded-lg border font-semibold transition-colors ${
                            isMobileLandscape ? "px-3 py-1 text-xs" : "px-4 py-3 text-sm lg:text-base"
                        } ${
                            isArmed
                                ? "bg-green-600 border-green-500 text-white"
                                : "bg-gray-800/80 border-gray-600 text-gray-200 hover:bg-gray-700"
                        }`}
                    >
                        <span
                            className={`flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] leading-none ${
                                isArmed ? "bg-white border-white text-green-600" : "border-gray-400 text-transparent"
                            }`}
                        >
                            ✓
                        </span>
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};
