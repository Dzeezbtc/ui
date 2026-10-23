/**
 * BlindsPanel (ui#794)
 *
 * A small, non-modal "Blinds" tab + floating panel for SNG/tournament tables.
 * Shows this game's whole blind schedule: every level from the starting blinds to
 * a dozen levels ahead (level · SB/BB · ante when the structure has one · minutes),
 * with the current level highlighted and a countdown to the next. Hidden for cash
 * games.
 *
 * Non-modal: the wrapper paints no backdrop, so gameplay underneath stays
 * clickable. Dismisses on a second tab click, a click elsewhere, or Esc.
 *
 * The schedule comes from the table's own blind structure (or its doubling),
 * expanded level by level as the engine plays it (see buildBlindLadder).
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBlindLevel } from "../../hooks/game/useBlindLevel";
import { buildBlindLadder, formatBlindCountdown } from "../../utils/blindStructure";
import { isNullish } from "../../utils/guards";
import { formatChipCount } from "../../utils/potDisplayUtils";
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
    const currentRowRef = useRef<HTMLSpanElement>(null);

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

    // Open on the level in play: past levels sit above it in the scrollable list.
    useEffect(() => {
        if (isOpen) currentRowRef.current?.scrollIntoView?.({ block: "nearest" });
    }, [isOpen]);

    // Cash games have fixed blinds — no structure to show (AC-1).
    if (!blindLevel.isActive) {
        return null;
    }

    const { rows, hasFullSchedule, hasAnte } = buildBlindLadder(blindLevel);

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

                    <div className={`${styles.grid} ${hasAnte ? styles.gridWithAnte : ""}`}>
                        <span className={styles.colHead}>Lvl</span>
                        <span className={styles.colHead}>Small / Big</span>
                        {hasAnte && <span className={`${styles.colHead} ${styles.cellRight}`}>Ante</span>}
                        <span className={`${styles.colHead} ${styles.cellRight}`}>Min</span>

                        {rows.map((row, index) => {
                            const rowClass = row.isCurrent ? styles.rowCurrent : "";
                            const testId = row.isCurrent ? "blinds-row-current" : row.isNext ? "blinds-row-next" : row.isPast ? "blinds-row-past" : "blinds-row-upcoming";
                            return (
                                <React.Fragment key={isNullish(row.level) ? `row-${index}` : row.level}>
                                    <span ref={row.isCurrent ? currentRowRef : undefined} className={`${styles.cell} ${rowClass}`} data-testid={testId}>
                                        {isNullish(row.level) ? (row.isCurrent ? "Now" : "Next") : row.level}
                                    </span>
                                    <span className={`${styles.cell} ${rowClass}`}>{row.isBreak ? "Break" : row.blindsFormatted}</span>
                                    {hasAnte && (
                                        <span className={`${styles.cell} ${styles.cellRight} ${rowClass}`}>
                                            {row.ante > 0 && !row.isBreak ? formatChipCount(row.ante) : "—"}
                                        </span>
                                    )}
                                    <span className={`${styles.cell} ${styles.cellRight} ${rowClass}`}>
                                        {isNullish(row.minutes) ? "—" : row.minutes}
                                    </span>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {!hasFullSchedule && (
                        <div className={styles.note} data-testid="blinds-panel-partial">
                            Only the current and next levels are known for this table.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlindsPanel;
