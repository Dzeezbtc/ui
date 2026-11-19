import React, { useEffect, useMemo, useState } from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import type { LobbySection } from "../../utils/lobbyLayout";
import { lobbyBalanceLabel, openSeats, pickQuickSeat, stakeOptions } from "../../utils/lobbyLayout";
import { cashBlind } from "../../utils/blindsLabel";
import { formatMicroAsUsdc } from "../../constants/currency";
import { useSngSchedule } from "../../hooks/useSngSchedule";
import { formatCountdown, formatLocalLabel, formatUtcLabel, getUpcomingSngs } from "../../utils/sngSchedule";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import { truncateMiddle } from "../../utils/stringUtils";
import { useLanguage } from "../../i18n/useLanguage";
import styles from "./Lobby.module.css";

interface LobbyHeroProps {
    games: GameWithFormat[];
    cashSections: LobbySection[];
    balance: string;
    address: string | null;
    onDeposit: () => void;
    onWallet: () => void;
    onOpenTable: (gameId: string) => void;
    onCreateTable?: () => void;
}

/**
 * LobbyHero — the three cards at the top of the lobby: your balance with
 * Deposit, Quick seat (pick a game and stake, get the liveliest open table),
 * and the next scheduled Sit & Go with a live countdown (from the same
 * remote schedule the welcome pop-up uses).
 */
const LobbyHero: React.FC<LobbyHeroProps> = ({ games, cashSections, balance, address, onDeposit, onWallet, onOpenTable, onCreateTable }) => {
    const { t } = useLanguage();
    // A one-second tick for the Sit & Go countdown, kept here so only this card re-renders each second.
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
        <div className={styles.hero}>
            <div className={`${styles.box} ${styles.hcard}`}>
                <div className={styles.hrow}>
                    <span className={styles.eyebrow}>{t("lobby.balance")}</span>
                    <span className={`${styles.pill} ${styles.pillCy}`}>USDC</span>
                </div>
                <div className={`${styles.bigNum} ${styles.mono}`}>{lobbyBalanceLabel(balance)}</div>
                {hasContent(address) ? (
                    <div className={styles.address}>
                        <span>{address}</span>
                    </div>
                ) : (
                    <p className={styles.result} style={{ margin: 0 }}>
                        {t("lobby.noWallet")}
                    </p>
                )}
                <div className={styles.actions}>
                    <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={onDeposit} disabled={!hasContent(address)}>
                        {t("lobby.deposit")}
                    </button>
                    <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onWallet}>
                        {t("lobby.wallet")}
                    </button>
                </div>
            </div>

            <div className={`${styles.box} ${styles.hcard}`}>
                <div className={styles.hrow}>
                    <span className={styles.eyebrow}>{t("lobby.quickSeat")}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{t("lobby.quickSeatTitle")}</div>
                <div className={styles.two}>
                    <div>
                        <label className={styles.fieldLabel} htmlFor="qs-game">
                            {t("lobby.game")}
                        </label>
                        <div className={styles.sel}>
                            <select id="qs-game" value={activeKey} onChange={e => setSectionKey(e.target.value)} disabled={!hasElements(cashSections)}>
                                {cashSections.map(s => (
                                    <option key={s.key} value={s.key}>
                                        {s.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={styles.fieldLabel} htmlFor="qs-stake">
                            {t("lobby.stakes")}
                        </label>
                        <div className={styles.sel}>
                            <select id="qs-stake" value={activeStake} onChange={e => setBigBlind(e.target.value)} disabled={!hasElements(stakes)}>
                                {stakes.map(bb => (
                                    <option key={bb} value={bb}>
                                        {cashBlind(formatMicroAsUsdc(bb, 2))} BB
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className={styles.result}>
                    {hasValue(match) ? (
                        t("lobby.bestMatch", { table: match.name ?? truncateMiddle(match.gameId, 4, 4), open: openSeats(match) })
                    ) : (
                        t("lobby.noMatch")
                    )}
                </div>
                <div className={styles.actions}>
                    {hasValue(match) ? (
                        <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={() => onOpenTable(match.gameId)}>
                            {t("lobby.findSeat")}
                        </button>
                    ) : onCreateTable ? (
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCreateTable}>
                            {t("lobby.createTable")}
                        </button>
                    ) : null}
                </div>
            </div>

            <div className={`${styles.box} ${styles.hcard}`}>
                <div className={styles.hrow}>
                    <span className={styles.eyebrow}>{t("lobby.nextSng")}</span>
                    {hasValue(next) ? <span className={`${styles.pill} ${styles.pillGold}`}>{next.buyIn}</span> : null}
                </div>
                {hasValue(next) ? (
                    <>
                        <div style={{ fontWeight: 600, fontSize: 17 }}>{next.name}</div>
                        <div className={styles.muted} style={{ fontSize: 13, lineHeight: 1.5 }}>
                            {formatUtcLabel(next.nextStart)}
                            <br />
                            {t("lobby.yourTime", { time: formatLocalLabel(next.nextStart) })}
                        </div>
                        <div>
                            <div className={styles.eyebrow} style={{ fontSize: 10.5 }}>
                                {t("lobby.startsIn")}
                            </div>
                            <div className={styles.countdown}>{formatCountdown(next.nextStart.getTime() - nowMs)}</div>
                        </div>
                        <div className={styles.actions}>
                            <a className={`${styles.btn} ${styles.btnGhost}`} href={next.link}>
                                {t("lobby.register")} · {next.buyIn}
                            </a>
                        </div>
                    </>
                ) : (
                    <p className={styles.result} style={{ margin: 0 }}>
                        {t("lobby.noSchedule")}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LobbyHero;
