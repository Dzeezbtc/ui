import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { explainerCopy } from "../../utils/explainerCopy";
import ExplainerIcon from "./ExplainerIcon";
import styles from "./Explainer.module.css";

/** FAQ: the questions players ask most, opened one at a time, with links to the other guides. */
const FaqPage: React.FC = () => {
    const { language, t } = useLanguage();
    const copy = explainerCopy(language).faq;

    useEffect(() => {
        document.title = `${copy.title} - Block52`;
    }, [copy.title]);

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <span className={styles.kicker}>{copy.kicker}</span>
                <h1>{copy.title}</h1>
                <p>{copy.sub}</p>
            </header>

            <div className={styles.faqGrid}>
                <div className={styles.faqList}>
                    {copy.items.map((item, i) => (
                        <details key={item.q} className={styles.qa} open={i === 0}>
                            <summary>
                                {item.q}
                                <ExplainerIcon glyph="plus" />
                            </summary>
                            <p>{item.a}</p>
                        </details>
                    ))}
                </div>

                <aside className={`${styles.box} ${styles.side}`}>
                    <h3>{copy.sideTitle}</h3>
                    <p>{copy.sideBody}</p>
                    <div className={styles.sideLinks}>
                        <Link to="/how-it-works" className={styles.sideLink}>
                            <span className={styles.icon}>
                                <ExplainerIcon glyph="seat" />
                            </span>
                            {t("nav.howItWorks")}
                        </Link>
                        <Link to="/fairness" className={styles.sideLink}>
                            <span className={styles.icon}>
                                <ExplainerIcon glyph="verify" />
                            </span>
                            {t("nav.fairness")}
                        </Link>
                        <Link to="/play-responsibly" className={styles.sideLink}>
                            <span className={styles.icon}>
                                <ExplainerIcon glyph="heart" />
                            </span>
                            {t("nav.playResponsibly")}
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FaqPage;
