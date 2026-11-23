import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import type { LobbySection } from "../../utils/lobbyLayout";
import { openSeats, pickQuickSeat, stakeOptions } from "../../utils/lobbyLayout";
import { cashBlind } from "../../utils/blindsLabel";
import { formatMicroAsUsdc } from "../../constants/currency";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import styles from "./Lobby.module.css";

interface QuickSeatProps {
    games: GameWithFormat[];
    cashSections: LobbySection[];
    onOpenTable: (gameId: string) => void;
    onCreateTable?: () => void;
}

/**
 * Quick seat: one button by the tabs. It opens a small chooser (game, stakes)
 * and opens the liveliest table at those stakes with a free seat.
 */
const QuickSeat: React.FC<QuickSeatProps> = ({ games, cashSections, onOpenTable, onCreateTable }) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [sectionKey, setSectionKey] = useState("");
    const [bigBlind, setBigBlind] = useState("");
    const wrap = useRef<HTMLDivElement>(null);

    const activeKey = hasContent(sectionKey) ? sectionKey : (cashSections[0]?.key ?? "");
    const stakes = useMemo(() => stakeOptions(games, activeKey), [games, activeKey]);
    const activeStake = stakes.includes(bigBlind) ? bigBlind : (stakes[0] ?? "");
    const match = hasContent(activeStake) ? pickQuickSeat(games, activeKey, activeStake) : undefined;

    // Close on an outside click or Escape.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (e.target instanceof Node && !wrap.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className={styles.quickWrap} ref={wrap}>
            <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="dialog">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                </svg>
                {t("lobby.quickSeat")}
            </button>
            {open ? (
                <div className={styles.quickPop} role="dialog" aria-label={t("lobby.quickSeat")}>
                    <label className={styles.popLabel}>
                        {t("lobby.game")}
                        <span className={styles.sel}>
                            <select value={activeKey} onChange={e => setSectionKey(e.target.value)} disabled={!hasElements(cashSections)}>
                                {cashSections.map(s => (
                                    <option key={s.key} value={s.key}>
                                        {s.title}
                                    </option>
                                ))}
                            </select>
                        </span>
                    </label>
                    <label className={styles.popLabel}>
                        {t("lobby.stakes")}
                        <span className={styles.sel}>
                            <select value={activeStake} onChange={e => setBigBlind(e.target.value)} disabled={!hasElements(stakes)}>
                                {stakes.map(bb => (
                                    <option key={bb} value={bb}>
                                        {cashBlind(formatMicroAsUsdc(bb, 2))} BB
                                    </option>
                                ))}
                            </select>
                        </span>
                    </label>
                    {hasValue(match) ? (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGrad}`}
                            onClick={() => {
                                setOpen(false);
                                onOpenTable(match.gameId);
                            }}
                            title={t("lobby.openShort", { count: openSeats(match) })}
                        >
                            {t("lobby.findSeat")}
                        </button>
                    ) : onCreateTable ? (
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCreateTable} title={t("lobby.noMatch")}>
                            {t("lobby.createTable")}
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

export default QuickSeat;
