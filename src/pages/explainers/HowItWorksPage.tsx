import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { explainerCopy } from "../../utils/explainerCopy";
import ExplainerIcon, { type ExplainerGlyph } from "./ExplainerIcon";
import styles from "./Explainer.module.css";

const STEP_GLYPHS: ExplainerGlyph[] = ["key", "deposit", "seat", "verify"];

/** How it works: four steps from signing in to checking a hand, what stays yours, and a way to the tables. */
const HowItWorksPage: React.FC = () => {
    const { language } = useLanguage();
    const copy = explainerCopy(language).how;

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

            <ol className={styles.steps}>
                {copy.steps.map((step, i) => (
                    <li key={step.title} className={`${styles.box} ${styles.step}`}>
                        <div className={styles.stepTop}>
                            <span className={styles.icon}>
                                <ExplainerIcon glyph={STEP_GLYPHS[i]} />
                            </span>
                            <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div>
                            <h3>{step.title}</h3>
                            <p>{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className={`${styles.split} ${styles.splitEven}`}>
                <section className={styles.box}>
                    <h2>{copy.keepTitle}</h2>
                    <ul className={styles.checks}>
                        {copy.keep.map(line => (
                            <li key={line}>
                                <ExplainerIcon glyph="check" />
                                {line}
                            </li>
                        ))}
                    </ul>
                </section>
                <section className={`${styles.box} ${styles.cta}`}>
                    <h2>{copy.cta}</h2>
                    <p>{copy.ctaSub}</p>
                    <div className={styles.ctaRow}>
                        <Link to="/" className={styles.btn}>
                            {copy.cta}
                            <ExplainerIcon glyph="arrow" />
                        </Link>
                        <Link to="/faq" className={styles.link}>
                            {copy.faqLink}
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HowItWorksPage;
