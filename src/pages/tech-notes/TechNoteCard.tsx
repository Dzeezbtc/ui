import React, { useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { componentVersions, hasDetail, noteCounts, noteDate, type ReleaseNote } from "../../utils/releaseNotes";
import { hasElements, hasContent } from "../../utils/guards";
import type { TranslationKey } from "../../i18n";
import styles from "./TechNotesHome.module.css";

interface TechNoteCardProps {
    note: ReleaseNote;
    /** The newest note: drawn large, with everything open. */
    latest?: boolean;
}

const SECTIONS: { key: "features" | "bugFixes" | "improvements" | "tests"; label: TranslationKey; tone: string }[] = [
    { key: "features", label: "techNotes.features", tone: styles.toneNew },
    { key: "bugFixes", label: "techNotes.fixes", tone: styles.toneFix },
    { key: "improvements", label: "techNotes.improvements", tone: styles.toneUp },
    { key: "tests", label: "techNotes.tests", tone: styles.toneTest }
];

/** One week's release note: date, title, versions, highlights, and (opened) features, fixes, improvements and tests. */
const TechNoteCard: React.FC<TechNoteCardProps> = ({ note, latest = false }) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(latest);
    const counts = noteCounts(note);
    const versions = componentVersions(note.tags);

    return (
        <article className={latest ? styles.latest : styles.note}>
            <div className={styles.noteHead}>
                <span className={styles.date}>
                    {latest ? <b>{t("techNotes.latest")}</b> : null}
                    {noteDate(note.date)}
                </span>
                {hasElements(versions) ? (
                    <span className={styles.versions}>
                        {versions.map(v => (
                            <span key={v}>{v}</span>
                        ))}
                    </span>
                ) : null}
            </div>
            <h2 className={styles.noteTitle}>{note.title}</h2>
            {hasElements(note.highlights) ? (
                <ul className={styles.highlights}>
                    {note.highlights.map(h => (
                        <li key={h}>{h}</li>
                    ))}
                </ul>
            ) : hasContent(note.body) ? (
                <p className={styles.body}>{note.body.trim()}</p>
            ) : null}
            {hasDetail(note) ? (
                <>
                    <div className={styles.counts}>
                        {SECTIONS.filter(s => counts[s.key] > 0).map(s => (
                            <span key={s.key} className={s.tone}>
                                {counts[s.key]} {t(s.label)}
                            </span>
                        ))}
                        <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen(v => !v)}>
                            {open ? t("techNotes.showLess") : t("techNotes.showAll")}
                        </button>
                    </div>
                    {open ? (
                        <div className={styles.sections}>
                            {SECTIONS.filter(s => counts[s.key] > 0).map(s => (
                                <section key={s.key} className={`${styles.section} ${s.tone}`}>
                                    <h3>{t(s.label)}</h3>
                                    <ul>
                                        {note[s.key].map(item => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    ) : null}
                </>
            ) : null}
        </article>
    );
};

export default TechNoteCard;
