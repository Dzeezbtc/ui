import React, { useEffect, useMemo, useState } from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import type { LobbySection } from "../../utils/lobbyLayout";
import { openSeats, pickQuickSeat, stakeOptions } from "../../utils/lobbyLayout";
import { cashBlind } from "../../utils/blindsLabel";
import { formatMicroAsUsdc } from "../../constants/currency";
import { useSngSchedule } from "../../hooks/useSngSchedule";
import { formatCountdown, formatLocalLabel, getUpcomingSngs } from "../../utils/sngSchedule";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import styles from "./Lobby.module.css";

interface LobbyHeroProps {
    games: GameWithFormat[];
    cashSections: LobbySection[];
    onOpenTable: (gameId: string) => void;
    onCreateTable?: () => void;
}

/**
 * LobbyHero — one slim bar above the tables: Quick seat (pick a game and
 * stake, open the liveliest table with a free seat) and the next scheduled
 * Sit & Go with a live countdown (the same remote schedule as the welcome
 * pop-up).
 */
const LobbyHero: React.FC<LobbyHeroProps> = ({ games, cashSections, onOpenTable, onCreateTable }) => {
    const { t } = useLanguage();
    // A one-second tick for the Sit & Go countdown, kept here so only this bar re-renders each second.
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const [sectionKey, setSectionKey] = useState<string>("");
    const [bigBlind, setBigBlind] = useState<string>("");
    const activeKey = hasContent(sectionKey) ? sectionKey : (cashSections[0]?.key ?? "");
    const stakes = useMemo(() => stakeOptions(games, activeKey), [games, activeKey]);
    const activeStake = stakes.includes(bigBlind) ? bigBlind : (stakes[0] ?? "");
    const match = hasContent(activeStake) ? pickQuickSeat(games, activeKey, activeStake) : undefined;

    const { tournaments } = useSngSchedule(true);
    const next = useMemo(() => (hasElements(tournaments) ? getUpcomingSngs(tournaments, new Date(), 1)[0] : undefined), [tournaments]);

    return (
        <div className={styles.quickBar}>
            <div className={`${styles.box} ${styles.quick}`}>
                <span className={styles.quickLabel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                    </svg>
                    {t("lobby.quickSeat")}
                </span>
                <div className={styles.sel}>
                    <select value={activeKey} onChange={e => setSectionKey(e.target.value)} disabled={!hasElements(cashSections)} aria-label={t("lobby.game")}>
                        {cashSections.map(s => (
                            <option key={s.key} value={s.key}>
                                {s.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.sel}>
                    <select value={activeStake} onChange={e => setBigBlind(e.target.value)} disabled={!hasElements(stakes)} aria-label={t("lobby.stakes")}>
                        {stakes.map(bb => (
                            <option key={bb} value={bb}>
                                {cashBlind(formatMicroAsUsdc(bb, 2))} BB
                            </option>
                        ))}
                    </select>
                </div>
                {hasValue(match) ? (
                    <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={() => onOpenTable(match.gameId)} title={t("lobby.openShort", { count: openSeats(match) })}>
                        {t("lobby.findSeat")}
                    </button>
                ) : onCreateTable ? (
                    <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCreateTable} title={t("lobby.noMatch")}>
                        {t("lobby.createTable")}
                    </button>
                ) : null}
            </div>
            {hasValue(next) ? (
                <div className={`${styles.box} ${styles.nextSng}`}>
                    <div style={{ minWidth: 0 }}>
                        <div className={styles.eyebrow} style={{ fontSize: 10.5 }}>
                            {t("lobby.nextSng")} · {next.buyIn}
                        </div>
                        <div className={styles.nextName} title={t("lobby.yourTime", { time: formatLocalLabel(next.nextStart) })}>
                            {next.name}
                        </div>
                    </div>
                    <div className={styles.countdownSm}>{formatCountdown(next.nextStart.getTime() - nowMs)}</div>
                    <a className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} href={next.link}>
                        {t("lobby.register")}
                    </a>
                </div>
            ) : null}
        </div>
    );
};

export default LobbyHero;
