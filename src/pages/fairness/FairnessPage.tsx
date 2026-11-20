import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useFairnessData } from "../../hooks/explorer/useFairnessData";
import { cardsCounted, checkVerdict, heatColour, heatGrid, maxOffPercent, overallVerdict, RANKS } from "../../utils/fairnessView";
import { hasElements, hasValue } from "../../utils/guards";
import type { TranslationKey } from "../../i18n";
import styles from "./FairnessPage.module.css";

const SUIT_GLYPH: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
const VERDICT_HEAD: Record<string, TranslationKey> = { pass: "fair.verdictPass", marginal: "fair.verdictMarginal", fail: "fair.verdictFail" };
const VERDICT_PILL: Record<string, TranslationKey> = { pass: "fair.pass", marginal: "fair.marginal", fail: "fair.fail" };

/**
 * Is the deck fair? (Flagship look): every card dealt on Block52 counted and
 * checked against a fair shuffle. A plain verdict, the three checks the
 * indexer runs (cards, suits, ranks), how far the counter has read, and every
 * card as a heat map. The detailed chart stays on Card distribution.
 */
const FairnessPage: React.FC = () => {
    const { t } = useLanguage();
    const { cards, report, status, loading, error, reload } = useFairnessData();

    useEffect(() => {
        document.title = "Is the deck fair? - Block52";
    }, []);

    const grid = heatGrid(cards);
    const off = maxOffPercent(grid);
    const scale = Math.max(...grid.flat().map(c => Math.abs(c.off)), 0.0001);
    const checks = hasValue(report)
        ? ([
              ["fair.cards", "fair.cardsSub", report.card_chi_squared],
              ["fair.suits", "fair.suitsSub", report.suit_chi_squared],
              ["fair.ranks", "fair.ranksSub", report.rank_chi_squared]
          ] as const)
        : null;
    const verdict = hasValue(checks) ? overallVerdict(checks.map(c => c[2])) : null;

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <Link to="/explorer" className={styles.crumb}>
                ← {t("nav.explorerShort")}
            </Link>
            <header className={styles.head}>
                <h1>{t("fair.title")}</h1>
                <p>{t("fair.sub")}</p>
            </header>

            {loading && !hasElements(cards) ? (
                <div className={styles.empty}>{t("fair.loading")}</div>
            ) : error ? (
                <div className={styles.empty}>
                    {error}{" "}
                    <button type="button" className={styles.linkBtn} onClick={reload}>
                        {t("lobby.retry")}
                    </button>
                </div>
            ) : (
                <>
                    <section className={`${styles.box} ${styles.verdict} ${hasValue(verdict) ? styles[verdict] : ""}`}>
                        <span className={styles.seal} aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                        </span>
                        <div>
                            <h2>{hasValue(verdict) ? t(VERDICT_HEAD[verdict]) : t("fair.verdictUnknown")}</h2>
                            <p>
                                {t("fair.checked", {
                                    hands: hasValue(report) ? report.summary.total_hands.toLocaleString() : "—",
                                    cards: cardsCounted(cards).toLocaleString(),
                                    off
                                })}
                            </p>
                        </div>
                        <Link to="/explorer/distribution" className={styles.btnO}>
                            {t("fair.chart")}
                        </Link>
                    </section>

                    {hasValue(checks) ? (
                        <div className={styles.checks}>
                            {checks.map(([title, sub, r]) => {
                                const v = checkVerdict(r);
                                return (
                                    <section key={title} className={styles.box}>
                                        <div className={styles.row}>
                                            <h3>{t(title)}</h3>
                                            <span className={`${styles.pill} ${styles[v]}`}>{t(VERDICT_PILL[v])}</span>
                                        </div>
                                        <p className={styles.muted}>{t(sub)}</p>
                                        <span className={styles.mono}>
                                            χ² {r.chi_squared.toFixed(1)} · {t("fair.df", { n: r.degrees_of_freedom })} · p {r.p_value >= 0.1 ? "≥ 0.10" : r.p_value.toFixed(2)}
                                        </span>
                                    </section>
                                );
                            })}
                        </div>
                    ) : null}

                    {hasValue(status) ? (
                        <section className={`${styles.box} ${styles.sync}`}>
                            <span className={`${styles.pill} ${status.percent_complete >= 99.9 ? styles.pass : styles.marginal}`}>
                                {status.percent_complete >= 99.9 ? t("fair.upToDate") : t("fair.catchingUp")}
                            </span>
                            <b>{t("fair.counter")}</b>
                            <span className={styles.fill}>
                                <i style={{ width: `${Math.min(100, status.percent_complete)}%` }} />
                            </span>
                            <span className={styles.mono}>{t("fair.lastBlock", { n: status.last_block_indexed.toLocaleString() })}</span>
                        </section>
                    ) : null}

                    <section className={styles.box}>
                        <div className={styles.secHead}>
                            <h2>{t("fair.heatTitle")}</h2>
                            <p>{t("fair.heatSub")}</p>
                        </div>
                        <div className={styles.heatWrap}>
                            <div className={styles.heat} role="table" aria-label={t("fair.heatTitle")}>
                                <span />
                                {RANKS.map(r => (
                                    <span key={r} className={styles.colHead}>
                                        {r === "T" ? "10" : r}
                                    </span>
                                ))}
                                {grid.map(row => (
                                    <React.Fragment key={row[0].suit}>
                                        <span className={`${styles.rowHead} ${row[0].suit === "h" || row[0].suit === "d" ? styles.red : ""}`}>{SUIT_GLYPH[row[0].suit]}</span>
                                        {row.map(c => (
                                            <span
                                                key={c.card}
                                                className={styles.cell}
                                                style={{ background: heatColour(c.off, scale) }}
                                                title={t("fair.cellTitle", { card: c.card, n: c.count.toLocaleString(), pct: (c.off * 100).toFixed(1) })}
                                            >
                                                {c.count.toLocaleString()}
                                            </span>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className={styles.legend}>
                            <span>{t("fair.less")}</span>
                            <span className={styles.bar} />
                            <span>{t("fair.more")}</span>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default FairnessPage;
