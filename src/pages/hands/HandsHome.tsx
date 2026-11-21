import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isTournamentFormat } from "@block52/poker-vm-sdk";
import { useLanguage } from "../../i18n/useLanguage";
import { useCosmosWallet } from "../../hooks/wallet";
import { useNetwork } from "../../context/NetworkContext";
import { useMyHandHistory } from "../../hooks/player/useMyHandHistory";
import { useIndexerStatus } from "../../hooks/player/useIndexerStatus";
import { useTableFormats } from "../../hooks/player/useTableFormats";
import { describeHandOutcome, describeIndexing, handKey } from "../../utils/handHistory";
import { formatTimestampRelative } from "../../utils/formatUtils";
import { formatAmount } from "../../utils/accountUtils";
import { truncateMiddle } from "../../utils/stringUtils";
import { hasElements, hasValue, isEmpty } from "../../utils/guards";
import { HANDS_FILTERS, HANDS_FILTER_LABELS, HandsFilter, biggestWin, filterHands, handsCounts, replayUrlFor, winShare } from "../../utils/handsView";
import type { PlayerHand } from "../../types/players";
import { FlagshipCard } from "../../components/playPage/Card/FlagshipCard";
import { HandVerificationModal } from "../../components/playPage/ProvablyFair/HandVerificationModal";
import styles from "./HandsHome.module.css";

const PAGE_SIZE = 25;

/**
 * My hands (Flagship look): every indexed hand this wallet played, newest
 * first, as rows with the board drawn as cards; a few totals up top and
 * chips to show only the pots won, lost or folded. Each hand opens its replay.
 */
const HandsHome: React.FC = () => {
    const { t } = useLanguage();
    const { address } = useCosmosWallet();
    const { currentNetwork } = useNetwork();
    const indexerStatus = useIndexerStatus();
    const { hands, total, loading, error, hasMore, loadMore, reload } = useMyHandHistory(address, `${currentNetwork.name}|${currentNetwork.rest}`, PAGE_SIZE);
    const formats = useTableFormats(useMemo(() => hands.map(h => h.game_id), [hands]));
    const [filter, setFilter] = useState<HandsFilter>("all");
    const [verifying, setVerifying] = useState<PlayerHand | null>(null);

    useEffect(() => {
        document.title = "My Hands - Block52";
        return () => {
            document.title = "Block52 Chain";
        };
    }, []);

    const counts = handsCounts(hands);
    const shown = filterHands(hands, filter);
    // Biggest cash pot: chip wins in tournaments don't compare with dollars.
    const best = biggestWin(hands, h => {
        const f = formats.get(h.game_id);
        return hasValue(f) && !isTournamentFormat(f);
    });
    const bestLabel = hasValue(best) ? formatAmount(String(best.won_amount), undefined, false) : "—";

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <div>
                    <h1>{t("hands.title")}</h1>
                    <p>{t("hands.sub")}</p>
                </div>
                {hasValue(address) ? (
                    <button type="button" className={styles.btnO} onClick={reload} disabled={loading}>
                        {loading ? t("hands.loading") : t("hands.reload")}
                    </button>
                ) : null}
            </header>

            {!hasValue(address) ? (
                <div className={styles.empty}>
                    {t("hands.noWallet")}{" "}
                    <Link to="/wallet">{t("hands.noWalletLink")}</Link>
                </div>
            ) : (
                <>
                    <div className={styles.kpis}>
                        <div className={styles.kpi}>
                            <small>{t("hands.played")}</small>
                            <b>{total.toLocaleString()}</b>
                            <span>{t("hands.playedSub")}</span>
                        </div>
                        <div className={styles.kpi}>
                            <small>{t("hands.potsWon")}</small>
                            <b className={styles.up}>{counts.won.toLocaleString()}</b>
                            <span>{t("hands.potsWonSub", { pct: winShare(hands), count: hands.length })}</span>
                        </div>
                        <div className={styles.kpi}>
                            <small>{t("hands.biggest")}</small>
                            <b>{bestLabel}</b>
                            <span>{hasValue(best) ? t("hands.biggestSub", { hand: best.hand_number }) : t("hands.noWinsYet")}</span>
                        </div>
                    </div>

                    <div className={styles.toolbar}>
                        <div className={styles.chips} role="group" aria-label={t("hands.show")}>
                            {HANDS_FILTERS.map(f => (
                                <button key={f} type="button" aria-pressed={filter === f} className={filter === f ? styles.chipOn : styles.chip} onClick={() => setFilter(f)}>
                                    {t(HANDS_FILTER_LABELS[f])} <i>{counts[f]}</i>
                                </button>
                            ))}
                        </div>
                        {indexerStatus ? <p className={styles.note}>{describeIndexing(indexerStatus)}</p> : null}
                    </div>

                    {error && isEmpty(hands) ? (
                        <div className={styles.empty}>{error}</div>
                    ) : loading && isEmpty(hands) ? (
                        <div className={styles.empty}>{t("hands.loading")}</div>
                    ) : isEmpty(hands) ? (
                        <div className={styles.empty}>{t("hands.none")}</div>
                    ) : isEmpty(shown) ? (
                        <div className={styles.empty}>{t("hands.noneHere")}</div>
                    ) : (
                        <ul className={styles.list}>
                            {shown.map(hand => {
                                const outcome = describeHandOutcome(hand, formats.get(hand.game_id));
                                return (
                                    <li key={handKey(hand)} className={styles.row}>
                                        <Link to={replayUrlFor(hand)} className={styles.rowMain}>
                                            <div className={styles.rowHead}>
                                                <b>{t("hands.hand", { n: hand.hand_number })}</b>
                                                <span className={`${styles.pill} ${styles[outcome.tone]}`}>{outcome.label}</span>
                                            </div>
                                            <p className={styles.meta}>
                                                {t("hands.seat", { n: hand.seat })} · <span className={styles.mono}>{truncateMiddle(hand.game_id, 8, 6)}</span> ·{" "}
                                                {hand.ended_at ? formatTimestampRelative(hand.ended_at) : t("hands.block", { n: hand.block_height.toLocaleString() })}
                                            </p>
                                        </Link>
                                        <div className={styles.board} aria-label={hasElements(hand.community_cards) ? hand.community_cards.join(" ") : t("hands.noBoard")}>
                                            {hasElements(hand.community_cards) ? (
                                                hand.community_cards.map((c, i) => <FlagshipCard key={i} code={c.toUpperCase()} className={styles.card} />)
                                            ) : (
                                                <span className={styles.noBoard}>{t("hands.noBoard")}</span>
                                            )}
                                        </div>
                                        <div className={styles.actions}>
                                            <Link to={replayUrlFor(hand)} className={styles.btnGrad}>
                                                {t("hands.replay")}
                                            </Link>
                                            <Link to={`/explorer/hand/${hand.game_id}/${hand.hand_number}`} className={styles.btnO}>
                                                {t("hands.details")}
                                            </Link>
                                            <button type="button" className={styles.btnO} onClick={() => setVerifying(hand)} data-testid="verify-hand">
                                                {t("hands.verify")}
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {hasElements(hands) ? (
                        <div className={styles.more}>
                            {error ? <p className={styles.err}>{error}</p> : null}
                            <p className={styles.note}>{t("hands.showing", { shown: hands.length.toLocaleString(), total: total.toLocaleString() })}</p>
                            {hasMore ? (
                                <button type="button" className={styles.btnO} onClick={loadMore} disabled={loading}>
                                    {loading ? t("hands.loading") : t("hands.loadMore")}
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </>
            )}

            {verifying ? <HandVerificationModal isOpen onClose={() => setVerifying(null)} tableId={verifying.game_id} handNumber={verifying.hand_number} /> : null}
        </div>
    );
};

export default HandsHome;
