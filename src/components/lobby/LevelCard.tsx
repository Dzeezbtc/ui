import React from "react";
import type { ScreenBox, StakeLevel, StakeRow } from "../../utils/lobbyLayout";
import { LEVEL_DEFAULT_STAKES, busiestRow, feltLabels, levelSummary, lobbyBuyInLabel, tileSizesLabel, tileTable } from "../../utils/lobbyLayout";
import { cashBlind } from "../../utils/blindsLabel";
import { hasElements, hasValue } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import type { TranslationKey } from "../../i18n";
import MiniTable from "./MiniTable";
import styles from "./Lobby.module.css";

const RANGE_KEYS: Record<StakeLevel, TranslationKey> = {
    micro: "lobby.levelRangeMicro",
    low: "lobby.levelRangeLow",
    mid: "lobby.levelRangeMid",
    high: "lobby.levelRangeHigh"
};

interface LevelCardProps {
    /** A cash level, or "buy-in" for Sit & Go / tournaments. */
    level: StakeLevel | "buy-in";
    title: string;
    rows: StakeRow[];
    gameName: string;
    onOpen: (key: string, from: ScreenBox) => void;
    /** Opens Create table on a level's usual stakes (a level nobody plays yet). */
    onSit?: (stakes: { smallBlind: number; bigBlind: number }) => void;
}

/**
 * One stake level on desktop: a plain felt (seats and players, no writing) of its
 * busiest stake on the left, and the stake details listed once on the right
 * (stakes, players, tables, sizes, buy-in).
 * A level nobody plays yet shows an open table at its usual stakes instead.
 */
const LevelCard: React.FC<LevelCardProps> = ({ level, title, rows, gameName, onOpen, onSit }) => {
    const { t } = useLanguage();
    const lead = busiestRow(rows);
    const summary = levelSummary(rows);
    const ready = level !== "buy-in" ? LEVEL_DEFAULT_STAKES[level] : undefined;
    const readyTitle = hasValue(ready) ? `${cashBlind(String(ready.smallBlind))} / ${cashBlind(String(ready.bigBlind))}` : "";
    const leadTable = hasValue(lead) ? tileTable(lead) : undefined;

    return (
        <section className={styles.levelCard}>
            <header className={styles.levelCardHead}>
                <div>
                    <h3>{title}</h3>
                    {level !== "buy-in" ? <small>{t(RANGE_KEYS[level])}</small> : null}
                </div>
                {summary.seated > 0 ? (
                    <span className={`${styles.pill} ${styles.pillGood}`}>
                        <span className={styles.dot} />
                        {t("lobby.tilePlaying", { count: summary.seated })}
                    </span>
                ) : (
                    <span className={`${styles.pill} ${styles.pillCy}`}>{t("lobby.seatsOpen", { count: 9 })}</span>
                )}
            </header>

            <div className={styles.levelCardBody}>
                {hasValue(lead) && hasValue(leadTable) ? (
                    <button type="button" className={styles.levelFelt} onClick={e => onOpen(lead.key, e.currentTarget.getBoundingClientRect())} aria-label={feltLabels(leadTable, gameName).title}>
                        <MiniTable maxPlayers={leadTable.maxPlayers} currentPlayers={leadTable.currentPlayers} label={`${leadTable.currentPlayers} of ${leadTable.maxPlayers} seats taken`} />
                    </button>
                ) : hasValue(ready) ? (
                    <button type="button" className={styles.levelFelt} onClick={() => onSit?.(ready)} aria-label={readyTitle}>
                        <MiniTable maxPlayers={9} currentPlayers={0} label={t("lobby.seatsOpen", { count: 9 })} />
                    </button>
                ) : null}

                <div className={styles.levelList}>
                    {hasElements(rows) ? (
                        rows.map(row => {
                            const table = tileTable(row);
                            const tables = row.sizes.reduce((n, s) => n + s.tables.length, 0);
                            return (
                                <button
                                    key={row.key}
                                    type="button"
                                    className={`${styles.levelLine} ${row.seated > 0 ? styles.levelLineLive : ""}`}
                                    onClick={e => onOpen(row.key, e.currentTarget.getBoundingClientRect())}
                                >
                                    <b>{feltLabels(table, gameName).title}</b>
                                    <span className={styles.levelLineSub}>
                                        {level === "buy-in" ? tileSizesLabel(row.sizes.map(s => s.size)) : `${tileSizesLabel(row.sizes.map(s => s.size))} · ${lobbyBuyInLabel(table)}`}
                                    </span>
                                    <span className={styles.levelLineNums}>
                                        {row.seated > 0 ? (
                                            <em>
                                                <span className={styles.dot} />
                                                {row.seated}
                                            </em>
                                        ) : null}
                                        <i>{t("lobby.tileTables", { count: tables })}</i>
                                    </span>
                                </button>
                            );
                        })
                    ) : hasValue(ready) ? (
                        <button type="button" className={styles.levelLine} onClick={() => onSit?.(ready)}>
                            <b>{readyTitle}</b>
                            <span className={styles.levelLineSub}>{tileSizesLabel([9, 6, 2])}</span>
                            <span className={styles.levelLineNums}>
                                <i className={styles.levelLineGo}>{t("lobby.openTable")}</i>
                            </span>
                        </button>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default LevelCard;
