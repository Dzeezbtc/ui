/**
 * Chip movement on the felt (Dan's UI #3, #4, #7).
 *
 * - A bet, call or raise slides the seat's chips out from the player to the bet
 *   spot (#3).
 * - When a betting round closes, each seat's bet flies into the pot (#4).
 * - An ante appears at the seat's bet spot and flies straight into the pot (#7).
 *
 * Pure helpers; PlayerChipDisplay and ChipFlight run the motion.
 */
import { NonPlayerActionType, type ActionDTO } from "@block52/poker-vm-sdk";
import type { BetSide } from "../config/stageGeometry";
import { isBlank, isString } from "./guards";

/** How far, in px, chips start towards the player before sliding to the bet spot. */
export const SLIDE_DISTANCE_PX = 28;
/** The pause before an ante chip leaves for the pot, ms. */
export const ANTE_PAUSE_MS = 150;

const asAmount = (value: string | undefined): bigint => {
    if (!isString(value) || isBlank(value)) return 0n;
    try {
        return BigInt(value);
    } catch {
        return 0n;
    }
};

/** What a change in a seat's bet calls for: chips sliding in, the bet sweeping to the pot, or nothing. */
export function chipChange(previous: string | undefined, next: string | undefined): "slideIn" | "sweep" | null {
    const before = asAmount(previous);
    const after = asAmount(next);
    if (after > before && after > 0n) return "slideIn";
    if (before > 0n && after === 0n) return "sweep";
    return null;
}

/** Where sliding chips start: a short step from the bet spot towards the seat on that edge. */
export function slideStart(side: BetSide | undefined, distance = SLIDE_DISTANCE_PX): { x: number; y: number } {
    switch (side) {
        case "bottom":
            return { x: 0, y: distance };
        case "top":
            return { x: 0, y: -distance };
        case "left":
            return { x: -distance, y: 0 };
        case "right":
            return { x: distance, y: 0 };
        default:
            return { x: 0, y: distance };
    }
}

/** The move from an element's centre to its container's centre (the pot). */
export function towardCentre(element: { left: number; top: number; width: number; height: number }, container: { left: number; top: number; width: number; height: number }): { dx: number; dy: number } {
    return {
        dx: container.left + container.width / 2 - (element.left + element.width / 2),
        dy: container.top + container.height / 2 - (element.top + element.height / 2)
    };
}

/** The antes this seat posted among the given actions, as amounts. */
export function antesFor(seat: number, actions: readonly Pick<ActionDTO, "seat" | "action" | "amount">[]): string[] {
    return actions.filter(a => a.seat === seat && a.action === NonPlayerActionType.ANTE && asAmount(a.amount) > 0n).map(a => a.amount);
}
