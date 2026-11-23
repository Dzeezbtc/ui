import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useCosmosWallet } from "../../hooks/wallet/useCosmosWallet";
import { useNetwork } from "../../context/NetworkContext";
import { useMyHandHistory } from "../../hooks/player/useMyHandHistory";
import { formatMicroAsUsdc } from "../../constants/currency";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import { usdcMicroOf } from "../../utils/siteNav";
import { lobbyBalanceLabel, feltLabels, seatedTotal } from "../../utils/lobbyLayout";
import { gameTypeOf } from "../../utils/lobbyTabs";
import { playStats, recentTableIds } from "../../utils/lobbySide";
import type { GameWithFormat } from "../../utils/convertUtils";
import { WalletSheet } from "../nav/WalletSheet";
import UpcomingEvents from "./UpcomingEvents";
import styles from "./Lobby.module.css";

interface LobbySideProps {
    /** Every listed table, to name the tables in "Jump back in". */
    games: GameWithFormat[];
}

/**
 * The desktop lobby's right-hand column: your wallet, your play, the tables you
 * were just at, and the next scheduled Sit & Go / tournaments. Hidden on phones.
 */
const LobbySide: React.FC<LobbySideProps> = ({ games }) => {
    const { t } = useLanguage();
    const wallet = useCosmosWallet();
    const { currentNetwork } = useNetwork();
    const [walletOpen, setWalletOpen] = useState(false);
    const { hands, total } = useMyHandHistory(wallet.address, `${currentNetwork.name}|${currentNetwork.rest}`, 25);
    const balance = formatMicroAsUsdc(usdcMicroOf(wallet.balance), 6);
    const stats = playStats(hands, total);
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
            <section className={`${styles.sideCard} ${styles.sideWallet}`}>
                <span className={styles.sideEyebrow}>{t("lobby.myWallet")}</span>
                <b className={styles.sideBalance}>{lobbyBalanceLabel(balance)}</b>
                <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={() => setWalletOpen(true)} disabled={!hasContent(wallet.address)}>
                    {t("lobby.deposit")}
                </button>
            </section>

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

            <div className={styles.sideUpcoming}>
                <UpcomingEvents />
            </div>

            {walletOpen && hasContent(wallet.address) ? <WalletSheet address={wallet.address} usdc={balance} onClose={() => setWalletOpen(false)} onRefresh={wallet.refreshBalance} /> : null}
        </aside>
    );
};

export default LobbySide;
