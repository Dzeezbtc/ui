import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { loadPersisted } from "../../context/tableSessions/TableSessionsContext";
import type { OpenTable } from "../../context/tableSessions/sessionsModel";
import { useFindGames } from "../../hooks/game/useFindGames";
import { useLanguage } from "../../i18n/useLanguage";
import { hasValue, isEmpty } from "../../utils/guards";
import { myTableItems } from "../../utils/myTables";
import styles from "./MyTablesButton.module.css";

const readOpen = (): OpenTable[] => loadPersisted()?.openTables ?? [];

/** The list inside the open button (loads the game list only while it is open). */
const MyTablesList: React.FC<{ tables: OpenTable[]; onPick: () => void }> = ({ tables, onPick }) => {
    const { t } = useLanguage();
    const { games } = useFindGames();
    return (
        <div className={styles.panel} role="dialog" aria-label={t("nav.openTables")}>
            <span className={styles.head}>{t("nav.openTables")}</span>
            {myTableItems(tables, games).map(item => (
                <Link key={item.id} to={`/table/${item.id}`} className={styles.row} onClick={onPick}>
                    <span className={styles.felt} aria-hidden="true" />
                    <span className={styles.text}>
                        <b>{item.title}</b>
                        {item.sub ? <small>{item.sub}</small> : null}
                    </span>
                    {hasValue(item.seats) ? <i>{item.seats}</i> : null}
                    <span className={styles.go} aria-hidden="true">
                        →
                    </span>
                </Link>
            ))}
        </div>
    );
};

/**
 * The floating Tables button (from the CoinPoker review): on every site page,
 * while you have tables open, one tap lists them and takes you back to any of
 * them. Reads the multi-table workspace's saved tables; hidden with none open.
 */
export const MyTablesButton: React.FC = () => {
    const { t } = useLanguage();
    const { pathname } = useLocation();
    const wrapRef = useRef<HTMLDivElement>(null);
    const [tables, setTables] = useState<OpenTable[]>(readOpen);
    const [open, setOpen] = useState(false);

    // Re-read on every page change and when another tab changes the saved tables.
    useEffect(() => {
        setTables(readOpen());
        setOpen(false);
    }, [pathname]);
    useEffect(() => {
        const onStorage = () => setTables(readOpen());
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Close on an outside click or Escape.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (e.target instanceof Node && !wrapRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    if (isEmpty(tables)) return null;

    return (
        <div className={styles.wrap} ref={wrapRef}>
            {open ? <MyTablesList tables={tables} onPick={() => setOpen(false)} /> : null}
            <button type="button" className={`${styles.button} ${open ? styles.on : ""}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <ellipse cx="12" cy="12" rx="9.5" ry="6.5" />
                    <ellipse cx="12" cy="12" rx="5.5" ry="3" />
                </svg>
                <span>{t("nav.myTables")}</span>
                <b>{tables.length}</b>
            </button>
        </div>
    );
};
