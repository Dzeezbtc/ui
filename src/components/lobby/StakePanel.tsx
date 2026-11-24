import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ScreenBox, StakeRow } from "../../utils/lobbyLayout";
import { feltLabels, growFrom, rowView, tableSizeLabel, tileTable } from "../../utils/lobbyLayout";
import { useLanguage } from "../../i18n/useLanguage";
import TableCard from "./TableCard";
import styles from "./Lobby.module.css";

interface StakePanelProps {
    row: StakeRow;
    /** Where the tile that opened it sits on screen: the panel grows out of it and shrinks back into it. */
    from?: ScreenBox | null;
    gameName: string;
    /** Sizes switched on (the size chips). */
    selected: number[];
    onToggleSize: (size: number) => void;
    clubOf: (gameId: string) => string;
    isTreasury: (gameId: string) => boolean;
    nowMs: number;
    onPick: (gameId: string) => void;
    onClose: () => void;
}

const GROW_MS = 300;
const GROW_EASE = "cubic-bezier(0.2, 0.9, 0.25, 1.05)";

/**
 * A stake opened up in the middle of the screen. It grows out of the tile that was
 * tapped and, on close (✕, Escape or a tap outside), shrinks back into that tile:
 * its size chips, then every table being played at it in one row you swipe
 * through, with one open table at the end to start a new game. Tapping a table
 * opens it.
 */
const StakePanel: React.FC<StakePanelProps> = ({ row, from, gameName, selected, onToggleSize, clubOf, isTreasury, nowMs, onPick, onClose }) => {
    const { t } = useLanguage();
    const view = rowView(row, selected);
    const title = feltLabels(tileTable(row), gameName).title;

    const panelRef = useRef<HTMLElement>(null);
    const scrimRef = useRef<HTMLButtonElement>(null);
    const closing = useRef(false);
    const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Grow out of the tile into the middle.
    useLayoutEffect(() => {
        const panel = panelRef.current;
        if (!panel || !from || still || !panel.animate) return;
        panel.animate([{ transform: growFrom(from, panel.getBoundingClientRect()), opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: GROW_MS, easing: GROW_EASE });
        scrimRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: GROW_MS, easing: "ease-out" });
        // Only on open: the tile's spot is fixed for this panel.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Shrink back into the tile, then close.
    const close = useCallback(() => {
        const panel = panelRef.current;
        if (closing.current) return;
        closing.current = true;
        if (!panel || !from || still || !panel.animate) return onClose();
        scrimRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: GROW_MS * 0.8, easing: "ease-in", fill: "forwards" });
        const anim = panel.animate([{ transform: "none", opacity: 1 }, { transform: growFrom(from, panel.getBoundingClientRect()), opacity: 0.3 }], { duration: GROW_MS * 0.8, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" });
        anim.onfinish = () => onClose();
    }, [from, still, onClose]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [close]);

    return createPortal(
        <div className={`${styles.portal} ${styles.panelPortal}`}>
            <button ref={scrimRef} type="button" className={styles.panelScrim} aria-label={t("table.close")} onClick={close} />
            <section ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-label={`${title} ${gameName}`}>
                <header className={styles.panelHead}>
                    <div>
                        <h2 className={styles.mono}>{title}</h2>
                        <small>{gameName}</small>
                    </div>
                    <button type="button" className={styles.panelX} onClick={close} aria-label={t("table.close")}>
                        ✕
                    </button>
                </header>
                <div className={styles.sizeChips} role="group" aria-label={t("lobby.seats")}>
                    {row.sizes.map(sz => {
                        const on = selected.includes(sz.size);
                        return (
                            <button key={sz.size} type="button" className={`${styles.sizeChip} ${on ? styles.sizeChipOn : ""}`} aria-pressed={on} onClick={() => onToggleSize(sz.size)}>
                                {sz.inPlay > 0 ? <i className={styles.sizeDot} /> : null}
                                {tableSizeLabel(sz.size)}
                            </button>
                        );
                    })}
                </div>
                <div className={`${styles.row} ${styles.panelRow}`}>
                    {view.cards.map(g => (
                        <TableCard key={g.gameId} game={g} clubName={clubOf(g.gameId)} isTreasury={isTreasury(g.gameId)} nowMs={nowMs} onOpen={onPick} />
                    ))}
                </div>
            </section>
        </div>,
        document.body
    );
};

export default StakePanel;
