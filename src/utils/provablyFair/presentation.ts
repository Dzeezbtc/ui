/**
 * Labels and tones for the verify panel (ui#972). The components only map
 * these to icons and classes.
 */
import { formatPlayerId } from "../accountUtils";
import { hasContent, isNullish } from "../guards";
import type { CheckStatus, DealtHand, OverallStatus } from "./handVerification";

export type Tone = "good" | "warn" | "bad" | "neutral";

export const CHECK_STATUS_TONE: Record<CheckStatus, Tone> = {
    pass: "good",
    limited: "warn",
    fail: "bad",
    pending: "neutral",
    unavailable: "neutral",
    na: "neutral"
};

export const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
    pass: "Passed",
    limited: "Limited",
    fail: "Failed",
    pending: "Pending",
    unavailable: "Unavailable",
    na: "Nothing to compare"
};

export const OVERALL_TONE: Record<OverallStatus, Tone> = {
    verified: "good",
    limited: "warn",
    failed: "bad",
    pending: "neutral",
    unavailable: "neutral"
};

/** "Seat 3 · b521ab…cd12", or "Player 2" when the seat map wasn't available. */
export function dealtHandLabel(hand: DealtHand, index: number): string {
    if (isNullish(hand.seat)) return `Player ${index + 1}`;
    return hasContent(hand.address) ? `Seat ${hand.seat} · ${formatPlayerId(hand.address)}` : `Seat ${hand.seat}`;
}

/** Explorer link for a tx hash or a block height, inside the app. */
export function explorerTxPath(hash: string): string {
    return `/explorer/tx/${hash}`;
}

export function explorerBlockPath(height: number): string {
    return `/explorer/block/${height}`;
}

/**
 * The hand the "verify" panel should open on a live table: the hand on the
 * felt, or the last finished one. Hand 0 / no hand → null.
 */
export function previousHand(currentHand: number): number | null {
    return currentHand > 1 ? currentHand - 1 : null;
}

/** Where the info panel opens: under its anchor, kept 12px inside the viewport. */
export function popoverPosition(anchor: { left: number; bottom: number }, width: number, viewportWidth: number): { top: number; left: number } {
    const margin = 12;
    const left = Math.max(margin, Math.min(anchor.left, viewportWidth - width - margin));
    return { top: anchor.bottom + 8, left };
}
