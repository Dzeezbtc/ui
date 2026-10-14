import React from "react";
import { PreAction } from "../../utils/preActions";

interface PreActionControlsProps {
    /** Which pre-action is armed, or null. */
    armed: PreAction | null;
    /** Arm a pre-action, or null to disarm. Arming is mutually exclusive. */
    onArm: (action: PreAction | null) => void;
    /** Whether the player will be able to check when action returns to them. */
    canCheck: boolean;
    /** Chips owed to call right now (0 when even — e.g. the aggressor waiting on a raise). */
    amountToCallMicro: bigint;
    /** Formatted owed amount, e.g. "$3" — shown on the middle button when a bet is owed. */
    callAmountLabel: string;
    isMobileLandscape?: boolean;
}

interface Btn {
    action: PreAction;
    label: string;
    title: string;
}

/**
 * CoinPoker-style pre-action bar (ui#388): tick-to-arm buttons shown while it is not
 * the player's turn. The set adapts to what the player will actually be able to do
 * when action returns to them:
 *
 *   - can check  →  Check/Fold · Check · Call Any
 *   - owe a bet  →  Fold · Call {amount} · Call Any
 *   - committed, only a raise can return action  →  Fold · Call Any
 *
 * Arming one fires it the instant the player's turn comes (no betting bar).
 */
export const PreActionControls: React.FC<PreActionControlsProps> = ({ armed, onArm, canCheck, amountToCallMicro, callAmountLabel, isMobileLandscape }) => {
    const callAny: Btn = { action: "call-any", label: "Call Any", title: "Calls whatever the bet is when your turn comes." };

    let buttons: Btn[];
    if (canCheck) {
        buttons = [
            { action: "check-fold", label: "Check/Fold", title: "Checks when your turn comes if checking is free; folds if someone bets first." },
            { action: "check", label: "Check", title: "Checks when your turn comes. Clears if someone bets first." },
            callAny
        ];
    } else if (amountToCallMicro > BigInt(0)) {
        buttons = [
            { action: "fold", label: "Fold", title: "Folds your hand when your turn comes." },
            { action: "call-exact", label: `Call ${callAmountLabel}`, title: "Calls this exact amount when your turn comes. Clears if the bet is raised." },
            callAny
        ];
    } else {
        // Committed this round (you bet/called) — action only returns via a raise, so
        // there is no concrete amount to show; only fold-to-a-raise or call-any apply.
        buttons = [
            { action: "fold", label: "Fold", title: "Folds if you get raised." },
            callAny
        ];
    }

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
