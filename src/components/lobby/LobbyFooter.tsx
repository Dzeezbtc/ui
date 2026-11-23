import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { viteEnv } from "../../utils/viteEnv";
import { socialLinks, type SocialKind } from "../../utils/lobbySide";
import { hasValue } from "../../utils/guards";
import styles from "./Lobby.module.css";

/** Free, international help for anyone worried about their gambling. */
const RESPONSIBLE_GAMBLING_URL = "https://www.gamblingtherapy.org/";

const SOCIAL_NAMES: Record<SocialKind, string> = { x: "X", telegram: "Telegram", discord: "Discord", youtube: "YouTube", instagram: "Instagram" };

const SocialIcon: React.FC<{ kind: SocialKind }> = ({ kind }) => {
    if (kind === "x") return <path d="M4 4h4.2L20 20h-4.2L4 4zM19.5 4l-6.3 7.1M4.5 20l6.3-7.1" />;
    if (kind === "telegram") return <path d="M21 4.5L3.2 11.4c-.9.4-.8 1.1 0 1.3l4.5 1.4 1.7 5.3c.2.6.6.7 1.1.3l2.6-2.1 4.7 3.5c.6.4 1.1.2 1.3-.6l2.9-13.7c.2-1.1-.4-1.6-1-1.3zM8.3 14l9.2-6.2-6.8 7.4" />;
    if (kind === "discord") return <path d="M8.5 6.5C7 6.8 5.7 7.3 4.6 8 3 10.6 2.5 13.3 2.7 16c1.4 1 2.9 1.7 4.4 2.1l1-1.6M15.5 6.5c1.5.3 2.8.8 3.9 1.5 1.6 2.6 2.1 5.3 1.9 8-1.4 1-2.9 1.7-4.4 2.1l-1-1.6M6.5 15.5c3.6 1.6 7.4 1.6 11 0M9.3 12.5h.01M14.7 12.5h.01" />;
    if (kind === "youtube") return <path d="M2.8 8.3c.2-1.6 1.2-2.6 2.8-2.7C7.6 5.4 9.8 5.3 12 5.3s4.4.1 6.4.3c1.6.1 2.6 1.1 2.8 2.7.2 1.2.3 2.4.3 3.7s-.1 2.5-.3 3.7c-.2 1.6-1.2 2.6-2.8 2.7-2 .2-4.2.3-6.4.3s-4.4-.1-6.4-.3c-1.6-.1-2.6-1.1-2.8-2.7-.2-1.2-.3-2.4-.3-3.7s.1-2.5.3-3.7zM10 9.2v5.6l4.8-2.8L10 9.2z" />;
    return <path d="M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zM12 8.2a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zM17.3 6.7h.01" />;
};

/**
 * The front page's footer: Powered by Block52 Network, Play responsibly, Provably
 * fair and Block52's socials. A slim status bar fixed along the bottom on desktop;
 * an ordinary footer at the end of the page (above the tab bar) on phones.
 */
const LobbyFooter: React.FC = () => {
    const { t } = useLanguage();
    const socials = socialLinks(viteEnv);
    return (
        <footer className={styles.footer}>
            <div className={styles.footerSecured}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
                    <path d="M8.5 12l2.5 2.5 4.5-5" />
                </svg>
                {t("lobby.securedBy")}
            </div>
            <nav className={styles.footerBadges} aria-label={t("lobby.footerLinks")}>
                <Link to="/fairness">{t("lobby.provablyFair")}</Link>
                <span>{t("lobby.onChain")}</span>
                <a href={RESPONSIBLE_GAMBLING_URL} target="_blank" rel="noopener noreferrer">
                    {t("lobby.playResponsibly")}
                </a>
                <span className={styles.footerAge}>18+</span>
            </nav>
            <div className={styles.footerSocials}>
                {socials.map(s => {
                    const icon = (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <SocialIcon kind={s.kind} />
                        </svg>
                    );
                    // Every icon shows; one without its link yet is just the icon, not a link.
                    return hasValue(s.url) ? (
                        <a key={s.kind} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_NAMES[s.kind]} title={SOCIAL_NAMES[s.kind]}>
                            {icon}
                        </a>
                    ) : (
                        <span key={s.kind} title={SOCIAL_NAMES[s.kind]} aria-hidden="true">
                            {icon}
                        </span>
                    );
                })}
            </div>
            <div className={styles.footerMark} aria-hidden="true">
                <img src="/block52.png" alt="" />
            </div>
        </footer>
    );
};

export default LobbyFooter;
