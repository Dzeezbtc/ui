/**
 * The table's fairness badge (ui#972). Opens a short explainer with "Verify
 * this hand" / "Verify last hand", which open the verify window.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaShieldAlt } from "react-icons/fa";
import { hasValue } from "../../../utils/guards";
import { popoverPosition, previousHand } from "../../../utils/provablyFair/presentation";
import { HandVerificationModal } from "./HandVerificationModal";
import styles from "./ProvablyFair.module.css";

const PANEL_WIDTH = 360;

export interface ProvablyFairBadgeProps {
    tableId: string;
    /** The hand on the felt (0 before the first deal). */
    handNumber: number;
    tableName?: string;
    gameLabel?: string;
    /** Icon only, for the narrow mobile header. */
    compact?: boolean;
}

export const ProvablyFairBadge: React.FC<ProvablyFairBadgeProps> = ({ tableId, handNumber, tableName, gameLabel, compact = false }) => {
    const anchorRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelAt, setPanelAt] = useState<{ top: number; left: number } | null>(null);
    const [verifyHand, setVerifyHand] = useState<number | null>(null);
    const lastHand = previousHand(handNumber);

    const togglePanel = useCallback(() => {
        if (hasValue(panelAt)) {
            setPanelAt(null);
            return;
        }
        const rect = anchorRef.current?.getBoundingClientRect();
        if (rect) setPanelAt(popoverPosition(rect, PANEL_WIDTH, window.innerWidth));
    }, [panelAt]);

    // Close the explainer on an outside click or Escape.
    useEffect(() => {
        if (!hasValue(panelAt)) return;
        const onDown = (e: MouseEvent) => {
            if (!(e.target instanceof Node)) return;
            if (!panelRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) setPanelAt(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPanelAt(null);
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [panelAt]);

    const open = useCallback((hand: number) => {
        setPanelAt(null);
        setVerifyHand(hand);
    }, []);

    return (
        <>
            <button
                ref={anchorRef}
                className={styles.badge}
                onClick={togglePanel}
                title="Check how this table deals"
                aria-expanded={hasValue(panelAt)}
                data-testid="provably-fair-badge"
            >
                <FaShieldAlt size={compact ? 12 : 14} className={styles.badgeIcon} />
                {!compact && (
                    <span className="flex flex-col items-start">
                        <span className={styles.badgeTitle}>Provably fair</span>
                        <span className={styles.badgeSub}>Deck on chain</span>
                    </span>
                )}
            </button>

            {hasValue(panelAt) &&
                createPortal(
                    <div ref={panelRef} className={styles.infoPanel} style={{ top: panelAt.top, left: panelAt.left }} data-testid="provably-fair-panel">
                        <div className={styles.infoHeading}>
                            <FaShieldAlt className={styles.badgeIcon} /> How this table deals
                        </div>
                        <p className={styles.infoText}>
                            Every hand's deck is shuffled from a seed written on chain in the transaction that deals it. When the hand ends, your
                            browser rebuilds the deck from that seed and checks it against the board and every card shown.
                        </p>
                        <p className={styles.infoText}>
                            A table's first hand is seeded by a validator's VRF, which the check proves. Later hands use a seed sent by the
                            player who starts them, so the check marks them limited.{" "}
                            <a className="underline" href="https://github.com/block52/pokerchain/issues/426" target="_blank" rel="noopener noreferrer">
                                Sealed dealing
                            </a>{" "}
                            will mix in commitments from every player and the dealer.
                        </p>
                        <div className={styles.infoRow}>
                            <span className={styles.infoRowLabel}>Current hand</span>
                            <span>{handNumber > 0 ? `#${handNumber}` : "not dealt yet"}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoRowLabel}>Deck</span>
                            <span>{handNumber > 0 ? "seeded on chain at the deal" : "—"}</span>
                        </div>
                        <button className={styles.primaryButton} onClick={() => open(handNumber)} disabled={handNumber < 1} data-testid="verify-this-hand">
                            <FaShieldAlt size={12} /> Verify this hand
                        </button>
                        <button
                            className={`${styles.secondaryButton} w-full mt-2`}
                            onClick={() => hasValue(lastHand) && open(lastHand)}
                            disabled={!hasValue(lastHand)}
                            data-testid="verify-last-hand"
                        >
                            Verify last hand{hasValue(lastHand) ? ` (#${lastHand})` : ""}
                        </button>
                    </div>,
                    document.body
                )}

            {/* Mounted only while open, so a closed badge reads nothing from the chain. */}
            {hasValue(verifyHand) && (
                <HandVerificationModal
                    isOpen
                    onClose={() => setVerifyHand(null)}
                    tableId={tableId}
                    handNumber={verifyHand}
                    tableName={tableName}
                    gameLabel={gameLabel}
                    latestHand={handNumber}
                />
            )}
        </>
    );
};
