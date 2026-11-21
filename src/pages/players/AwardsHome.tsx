import React, { useEffect } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { usePlayerAwards } from "../../hooks/player/usePlayerAwards";
import { AwardCard } from "../../components/players/AwardCard";
import { isEmpty } from "../../utils/guards";
import { MIN_AWARD_DECISIONS, MIN_AWARD_HANDS, MIN_AWARD_MONEY_ACTIONS } from "../../utils/playerAwards";
import styles from "./PlayersHome.module.css";

/** Player awards (Flagship look): the award cards under the flagship page heading. */
const AwardsHome: React.FC = () => {
    const { t } = useLanguage();
    const { awards, rankedPlayers, failedPlayers, loading, error, refetch } = usePlayerAwards();

    useEffect(() => {
        document.title = "Player Awards - Block52";
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <div>
                    <h1>{t("awards.title")}</h1>
                    <p>{t("awards.sub")}</p>
                </div>
                {!loading && !error && rankedPlayers > 0 ? <span className={styles.pill}>{t("awards.ranked", { n: rankedPlayers.toLocaleString() })}</span> : null}
            </header>

            {loading ? (
                <div className={styles.empty}>{t("awards.loading")}</div>
            ) : error ? (
                <div className={styles.empty}>
                    {error}{" "}
                    <button type="button" className={styles.linkBtn} onClick={refetch}>
                        {t("players.retry")}
                    </button>
                </div>
            ) : isEmpty(awards) ? (
                <div className={styles.empty}>{t("awards.none")}</div>
            ) : (
                <>
                    {failedPlayers > 0 ? <p className={styles.warn}>{t("awards.partial", { n: failedPlayers.toLocaleString() })}</p> : null}
                    <div className={styles.awards}>
                        {awards.map(award => (
                            <AwardCard key={award.id} award={award} />
                        ))}
                    </div>
                </>
            )}

            <p className={styles.note}>{t("awards.note", { decisions: MIN_AWARD_DECISIONS, money: MIN_AWARD_MONEY_ACTIONS, hands: MIN_AWARD_HANDS })}</p>
        </div>
    );
};

export default AwardsHome;
