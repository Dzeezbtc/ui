import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import type { StakeRow } from "../../utils/lobbyLayout";
import { feltLabels, rowView, tableSizeLabel, tileTable } from "../../utils/lobbyLayout";
import { useLanguage } from "../../i18n/useLanguage";
import TableCard from "./TableCard";
import styles from "./Lobby.module.css";

interface StakePanelProps {
    row: StakeRow;
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

/**
 * A stake opened up over the page (a sheet rising from the bottom on phones):
 * its size chips, then every table being played at it in one row you swipe
 * through, with one open table at the end to start a new game. Tapping a table
 * opens it.
 */
const StakePanel: React.FC<StakePanelProps> = ({ row, gameName, selected, onToggleSize, clubOf, isTreasury, nowMs, onPick, onClose }) => {
    const { t } = useLanguage();
    const view = rowView(row, selected);
    const title = feltLabels(tileTable(row), gameName).title;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return createPortal(
        <div className={`${styles.portal} ${styles.panelPortal}`}>
            <button type="button" className={styles.panelScrim} aria-label={t("table.close")} onClick={onClose} />
            <section className={styles.panel} role="dialog" aria-modal="true" aria-label={`${title} ${gameName}`}>
                <header className={styles.panelHead}>
                    <div>
                        <h2 className={styles.mono}>{title}</h2>
                        <small>{gameName}</small>
                    </div>
                    <button type="button" className={styles.panelX} onClick={onClose} aria-label={t("table.close")}>
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
