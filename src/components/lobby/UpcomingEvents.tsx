import React, { useEffect, useMemo, useState } from "react";
import { useSngSchedule } from "../../hooks/useSngSchedule";
import { formatCountdown, formatLocalLabel, getUpcomingSngs } from "../../utils/sngSchedule";
import { hasElements } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import styles from "./Lobby.module.css";

/** Upcoming scheduled events (the remote schedule, e.g. Ten Dollar Tuesdays), with live countdowns. Lives in the Tournaments tab. */
const UpcomingEvents: React.FC = () => {
    const { t } = useLanguage();
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const { tournaments } = useSngSchedule(true);
    const upcoming = useMemo(() => (hasElements(tournaments) ? getUpcomingSngs(tournaments, new Date(), 4) : []), [tournaments]);

    if (!hasElements(upcoming)) return null;
    return (
        <section className={styles.upcoming} aria-label={t("lobby.upcoming")}>
            <h3 className={styles.subHead}>{t("lobby.upcoming")}</h3>
            <div className={styles.events}>
                {upcoming.map(ev => (
                    <div key={`${ev.id}-${ev.nextStart.getTime()}`} className={`${styles.box} ${styles.event}`}>
                        <div className={styles.eventMain}>
                            <span className={styles.eyebrow}>{ev.buyIn}</span>
                            <b>{ev.name}</b>
                            <small>{formatLocalLabel(ev.nextStart)}</small>
                        </div>
                        <span className={styles.countdownSm}>{formatCountdown(ev.nextStart.getTime() - nowMs)}</span>
                        <a className={`${styles.btn} ${styles.btnSm} ${styles.btnGrad}`} href={ev.link}>
                            {t("lobby.register")}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingEvents;
