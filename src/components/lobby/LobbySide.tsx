import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useCosmosWallet } from "../../hooks/wallet/useCosmosWallet";
import { useNetwork } from "../../context/NetworkContext";
import { useMyHandHistory } from "../../hooks/player/useMyHandHistory";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import { feltLabels, seatedTotal } from "../../utils/lobbyLayout";
import { gameTypeOf } from "../../utils/lobbyTabs";
import { lobbyPromos, playStats, recentTableIds, type PromoKind } from "../../utils/lobbySide";
import { viteEnv } from "../../utils/viteEnv";
import type { TranslationKey } from "../../i18n";
import type { GameWithFormat } from "../../utils/convertUtils";
import styles from "./Lobby.module.css";

const PROMO_TEXT: Record<PromoKind, { title: TranslationKey; body: TranslationKey; cta: TranslationKey }> = {
    newHere: { title: "lobby.promoNewTitle", body: "lobby.promoNewBody", cta: "lobby.promoNewCta" },
    runCircle: { title: "lobby.promoCircleTitle", body: "lobby.promoCircleBody", cta: "lobby.promoCircleCta" }
};

/** Each promotion's picture: four steps for New here?, rings of seats for a Circle. */
const PROMO_ART: Record<PromoKind, React.ReactNode> = {
    newHere: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M10 50h11V39h11V28h11V17h11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="15.5" cy="50" r="3.2" fill="currentColor" />
            <circle cx="26.5" cy="39" r="3.2" fill="currentColor" opacity=".8" />
            <circle cx="37.5" cy="28" r="3.2" fill="currentColor" opacity=".6" />
            <circle cx="48.5" cy="17" r="4.6" fill="#34d399" />
        </svg>
    ),
    runCircle: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.2" strokeDasharray="3 5" opacity=".7" />
            <circle cx="32" cy="32" r="11" stroke="currentColor" strokeWidth="2.4" />
            <circle cx="32" cy="10" r="4" fill="currentColor" />
            <circle cx="51" cy="21" r="4" fill="currentColor" opacity=".8" />
            <circle cx="51" cy="43" r="4" fill="currentColor" opacity=".6" />
            <circle cx="32" cy="54" r="4" fill="currentColor" opacity=".8" />
            <circle cx="13" cy="43" r="4" fill="currentColor" opacity=".6" />
            <circle cx="13" cy="21" r="4" fill="#f59e0b" />
        </svg>
    )
};

interface LobbySideProps {
    /** Every listed table, to name the tables in "Jump back in". */
    games: GameWithFormat[];
}

/**
 * The desktop lobby's right-hand column: live numbers, your play and the tables you
 * were just at, with Block52's own two promotions (New here?, Run your own Circle).
 * Hidden on phones. (Scheduled events stay in the Tournaments area only.)
 */
const LobbySide: React.FC<LobbySideProps> = ({ games }) => {
    const { t } = useLanguage();
    const wallet = useCosmosWallet();
    const { currentNetwork } = useNetwork();
    const { hands, total } = useMyHandHistory(wallet.address, `${currentNetwork.name}|${currentNetwork.rest}`, 25);
    const stats = playStats(hands, total);
    const promos = lobbyPromos(viteEnv);
    const recent = useMemo(
        () => recentTableIds(hands).map(id => games.find(g => g.gameId === id)).filter(hasValue),
        [hands, games]
    );

    return (
        <aside className={styles.side} aria-label={t("lobby.sideLabel")}>
            <section className={`${styles.sideCard} ${styles.sideLive}`}>
                <span className={styles.sideEyebrow}>
                    <span className={styles.dot} />
                    {t("lobby.liveNow")}
                </span>
                <div className={styles.sideLiveNums}>
                    <div>
                        <b>{seatedTotal(games).toLocaleString()}</b>
                        <small>{t("lobby.tilePlaying", { count: "" }).trim()}</small>
                    </div>
                    <div>
                        <b>{games.length.toLocaleString()}</b>
                        <small>{t("lobby.tileTables", { count: "" }).trim()}</small>
                    </div>
                </div>
            </section>

            <div className={styles.promos} role="region" aria-label={t("lobby.promosLabel")}>
                {promos.map(p => {
                    const text = PROMO_TEXT[p.kind];
                    const inner = (
                        <>
                            <span className={styles.promoArt}>{PROMO_ART[p.kind]}</span>
                            <span className={styles.promoText}>
                                <b>{t(text.title)}</b>
                                <small>{t(text.body)}</small>
                                <i>{t(text.cta)} →</i>
                            </span>
                        </>
                    );
                    const cls = `${styles.promo} ${p.kind === "runCircle" ? styles.promoCircle : ""}`;
                    return p.external ? (
                        <a key={p.kind} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
                            {inner}
                        </a>
                    ) : (
                        <Link key={p.kind} to={p.href} className={cls}>
                            {inner}
                        </Link>
                    );
                })}
            </div>

            {hasContent(wallet.address) ? (
                <section className={styles.sideCard}>
                    <div className={styles.sideHead}>
                        <span className={styles.sideEyebrow}>{t("lobby.yourPlay")}</span>
                        <Link to="/hands" className={styles.sideLink}>
                            {t("lobby.allMyHands")}
                        </Link>
                    </div>
                    <div className={styles.sideStats}>
                        <div>
                            <b>{stats.hands.toLocaleString()}</b>
                            <small>{t("lobby.handsPlayed")}</small>
                        </div>
                        <div>
                            <b>{stats.wonShare}%</b>
                            <small>{t("lobby.potsWon")}</small>
                        </div>
                        <div>
                            <b>{stats.tables}</b>
                            <small>{t("lobby.tablesPlayed")}</small>
                        </div>
                    </div>
                </section>
            ) : null}

            {hasElements(recent) ? (
                <section className={styles.sideCard}>
                    <span className={styles.sideEyebrow}>{t("lobby.jumpBackIn")}</span>
                    <div className={styles.sideList}>
                        {recent.map(g => (
                            <Link key={g.gameId} to={`/table/${g.gameId}`} className={styles.sideRow}>
                                <b className={styles.mono}>{feltLabels(g, gameTypeOf(g)).title}</b>
                                <small>{gameTypeOf(g)}</small>
                                <i>
                                    {g.currentPlayers}/{g.maxPlayers}
                                </i>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}
        </aside>
    );
};

export default LobbySide;
