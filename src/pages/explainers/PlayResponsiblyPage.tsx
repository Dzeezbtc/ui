import React, { useEffect } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { explainerCopy } from "../../utils/explainerCopy";
import { HELP_SERVICES } from "./explainerText";
import ExplainerIcon, { type ExplainerGlyph } from "./ExplainerIcon";
import styles from "./Explainer.module.css";

/** The first habit (18+) shows text instead of an icon. */
const HABIT_GLYPHS: (ExplainerGlyph | "18+")[] = ["18+", "limit", "clock", "loop", "split", "chart"];

/** Play responsibly: six habits, the warning signs, and free help services. */
const PlayResponsiblyPage: React.FC = () => {
    const { language } = useLanguage();
    const copy = explainerCopy(language).care;

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

            <div className={styles.habits}>
                {copy.habits.map((habit, i) => {
                    const glyph = HABIT_GLYPHS[i];
                    return (
                        <section key={habit.title} className={`${styles.box} ${styles.habit}`}>
                            <span className={styles.icon}>{glyph === "18+" ? <span className={styles.iconText}>18+</span> : <ExplainerIcon glyph={glyph} />}</span>
                            <div>
                                <h3>{habit.title}</h3>
                                <p>{habit.body}</p>
                            </div>
                        </section>
                    );
                })}
            </div>

            <div className={styles.split}>
                <section className={styles.box}>
                    <h2>{copy.signsTitle}</h2>
                    <ul className={styles.signs}>
                        {copy.signs.map(sign => (
                            <li key={sign}>{sign}</li>
                        ))}
                    </ul>
                </section>
                <section className={styles.box}>
                    <h2>{copy.helpTitle}</h2>
                    <p>{copy.helpSub}</p>
                    <div className={styles.services}>
                        {HELP_SERVICES.map((service, i) => (
                            <a key={service.name} href={service.url} target="_blank" rel="noopener noreferrer" className={styles.service}>
                                <span>
                                    <b>{service.name}</b>
                                    <small>{copy.regions[i]}</small>
                                </span>
                                <span>{copy.visit} ↗</span>
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PlayResponsiblyPage;
