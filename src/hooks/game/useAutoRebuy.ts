import { useEffect, useRef, useState } from "react";
import { NonPlayerActionType, type LegalActionDTO } from "@block52/poker-vm-sdk";
import type { NetworkEndpoints } from "../../context/NetworkContext";
import { parseMicroToBigInt } from "../../constants/currency";
import { autoRebuyAmount, type AutoRebuyMode } from "../../utils/autoRebuy";
import { hasValue } from "../../utils/guards";
import { useTableTopUp } from "./useTableTopUp";

export interface UseAutoRebuyArgs {
    tableId: string;
    network: NetworkEndpoints;
    mode: AutoRebuyMode;
    /** Seated at a cash table (auto re-buy never runs in a Sit & Go or tournament). */
    active: boolean;
    handNumber: number;
    legalActions: LegalActionDTO[];
    /** Micro-unit strings, as the table has them. */
    stack: string;
    minBuyIn: string;
    maxBuyIn: string;
    wallet: string;
    /** Called after a re-buy lands (to refresh the wallet balance). */
    onRebuy?: (amount: bigint) => void;
}

/**
 * Auto re-buy: between hands, when the engine offers TOP_UP and the stack has
 * fallen under the player's line (utils/autoRebuy), top it back up to the max
 * buy-in. At most one attempt per hand number, so a failed or slow top-up never
 * repeats in a loop. Returns the last amount re-bought (for a toast/label).
 */
export const useAutoRebuy = ({ tableId, network, mode, active, handNumber, legalActions, stack, minBuyIn, maxBuyIn, wallet, onRebuy }: UseAutoRebuyArgs) => {
    const { topUp } = useTableTopUp(tableId, network);
    const triedForHand = useRef<number | null>(null);
    const [lastRebuy, setLastRebuy] = useState<bigint | null>(null);
    const canTopUp = legalActions.some(a => a.action === NonPlayerActionType.TOP_UP);

    useEffect(() => {
        if (!active || triedForHand.current === handNumber) return;
        const amount = autoRebuyAmount({
            mode,
            canTopUp,
            stack: parseMicroToBigInt(stack),
            minBuyIn: parseMicroToBigInt(minBuyIn),
            maxBuyIn: parseMicroToBigInt(maxBuyIn),
            wallet: parseMicroToBigInt(wallet)
        });
        if (!hasValue(amount)) return;
        triedForHand.current = handNumber;
        topUp(amount.toString())
            .then(() => {
                setLastRebuy(amount);
                onRebuy?.(amount);
            })
            .catch(err => console.error("Auto re-buy failed:", err));
    }, [active, handNumber, mode, canTopUp, stack, minBuyIn, maxBuyIn, wallet, topUp, onRebuy]);

    return { lastRebuy };
};
