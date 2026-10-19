/**
 * BlindsPanel (ui#794)
 *
 * A small, non-modal "Blinds" tab + floating panel for SNG/tournament tables.
 * Shows the blind structure (level · SB/BB · minutes) with the current level
 * highlighted and a countdown to the next level. Hidden for cash games.
 *
 * Non-modal: the wrapper paints no backdrop, so gameplay underneath stays
 * clickable. Dismisses on a second tab click, a click elsewhere, or Esc.
 *
 * The backend currently exposes only the current and next levels
 * (useBlindLevel); the full ladder needs block52/poker-vm#1734, so the panel
 * shows current+next and labels the rest as pending.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBlindLevel } from "../../hooks/game/useBlindLevel";
import { buildBlindLadder, formatBlindCountdown } from "../../utils/blindStructure";
import { isNullish } from "../../utils/guards";
import styles from "./BlindsPanel.module.css";

const STORAGE_KEY = "b52.blindsPanel.open";

const readStoredOpen = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
};

const writeStoredOpen = (open: boolean): void => {
    try {
        localStorage.setItem(STORAGE_KEY, open ? "true" : "false");
    } catch {
        // Private mode / blocked storage — remembering open/closed is optional.
    }
};

const BlindsPanel: React.FC = () => {
    const blindLevel = useBlindLevel();
    const [isOpen, setIsOpen] = useState<boolean>(readStoredOpen);
    const rootRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    // Persist open/closed (default closed) within the session.
    useEffect(() => {
        writeStoredOpen(isOpen);
    }, [isOpen]);

    // Dismiss on Esc or a click anywhere outside the tab/panel. The mousedown
    // listener does not preventDefault, so the underlying click still reaches
    // gameplay — the panel stays non-modal (AC-3).
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        const handlePointer = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                close();
            }
        };

        window.addEventListener("keydown", handleKey);
        document.addEventListener("mousedown", handlePointer);
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.removeEventListener("mousedown", handlePointer);
        };
    }, [isOpen, close]);

    // Cash games have fixed blinds — no structure to show (AC-1).
    if (!blindLevel.isActive) {
        return null;
    }

    const { rows, hasFullSchedule } = buildBlindLadder(blindLevel);

    return (
        <div ref={rootRef} className={styles.root} data-testid="blinds-panel-root">
            <button
                type="button"
                onClick={toggle}
                className={`${styles.tab} ${isOpen ? styles.tabOpen : ""}`}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                title="Show blind structure"
                data-testid="blinds-panel-tab"
            >
                Blinds
            </button>

            {isOpen && (
                <div className={styles.panel} role="dialog" aria-label="Blind structure" data-testid="blinds-panel">
                    <div className={styles.header}>
                        <span className={styles.title}>Blind Structure</span>
                        {blindLevel.hasTimer && (
                            <span
                                className={`${styles.countdown} ${blindLevel.secondsRemaining < 0 ? styles.countdownOvertime : ""}`}
                                data-testid="blinds-panel-countdown"
                            >
                                {formatBlindCountdown(blindLevel.secondsRemaining)}
                            </span>
                        )}
                    </div>

                    <div className={styles.grid}>
                        <span className={styles.colHead}>Lvl</span>
                        <span className={styles.colHead}>Small / Big</span>
                        <span className={`${styles.colHead} ${styles.cellRight}`}>Min</span>

                        {rows.map((row, index) => (
                            <React.Fragment key={row.isCurrent ? "current" : `next-${index}`}>
                                {/* contents wrapper carries the current-row highlight across all three cells */}
                                <span
                                    className={`${styles.cell} ${row.isCurrent ? styles.rowCurrent : ""}`}
                                    data-testid={row.isCurrent ? "blinds-row-current" : "blinds-row-next"}
                                >
                                    {isNullish(row.level) ? (row.isCurrent ? "Now" : "Next") : row.level}
                                </span>
                                <span className={`${styles.cell} ${row.isCurrent ? styles.rowCurrent : ""}`}>
                                    {row.blindsFormatted}
                                </span>
                                <span className={`${styles.cell} ${styles.cellRight} ${row.isCurrent ? styles.rowCurrent : ""}`}>
                                    {isNullish(row.minutes) ? "—" : row.minutes}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>

                    {!hasFullSchedule && (
                        <div className={styles.note} data-testid="blinds-panel-pending">
                            Full structure coming — only the current and next levels are available yet
                            (tracked in poker-vm#1734).
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlindsPanel;
