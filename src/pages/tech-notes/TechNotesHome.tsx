import React, { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { useReleaseNotes } from "../../hooks/explorer/useReleaseNotes";
import { searchNotes } from "../../utils/releaseNotes";
import { isEmpty } from "../../utils/guards";
import { NavGlyph } from "../../components/nav/NavGlyph";
import TechNoteCard from "./TechNoteCard";
import styles from "./TechNotesHome.module.css";

/**
 * Tech notes (Flagship look): the weekly release notes. The newest week is
 * drawn large with everything open; older weeks run down a timeline, each with
 * its highlights and a button for the full list. A search box narrows them.
 */
const TechNotesHome: React.FC = () => {
    const { t } = useLanguage();
    const { notes, loading, error, reload } = useReleaseNotes();
    const [query, setQuery] = useState("");

    useEffect(() => {
        document.title = "Tech notes - Block52";
    }, []);

    const shown = searchNotes(notes, query);
    const searching = query.trim() !== "";
    const [first, ...rest] = shown;

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <div>
                    <h1>{t("nav.techNotes")}</h1>
                    <p>{t("techNotes.sub")}</p>
                </div>
                <label className={styles.search}>
                    <NavGlyph icon="search" />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t("techNotes.search")} aria-label={t("techNotes.search")} />
                </label>
            </header>

            {loading ? <div className={styles.spinner} /> : null}
            {error ? (
                <div className={styles.error}>
                    <p>{t("techNotes.error")}</p>
                    <button type="button" onClick={() => void reload()}>
                        {t("techNotes.retry")}
                    </button>
                </div>
            ) : null}
            {!loading && !error && isEmpty(shown) ? <p className={styles.empty}>{searching ? t("techNotes.noMatch") : t("techNotes.none")}</p> : null}

            {first ? <TechNoteCard key={first.id} note={first} latest={!searching} /> : null}
            {rest.length > 0 ? (
                <div className={styles.timeline}>
                    {rest.map(n => (
                        <TechNoteCard key={n.id} note={n} />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default TechNotesHome;
