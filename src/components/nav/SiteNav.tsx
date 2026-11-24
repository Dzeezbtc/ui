import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useCosmosWallet } from "../../hooks/wallet/useCosmosWallet";
import { useProfileAvatar } from "../../context/profile/ProfileAvatarContext";
import { features } from "../../config/features";
import { formatMicroAsUsdc } from "../../constants/currency";
import { custodyBase, custodySignOut, getCustodySession } from "../../utils/custody/session";
import { hasContent } from "../../utils/guards";
import { lobbyBalanceLabel } from "../../utils/lobbyLayout";
import { NAV_ITEMS, activeNavItem, showsSiteNav, usdcMicroOf, type NavItem } from "../../utils/siteNav";
import { NetworkSelector } from "../NetworkSelector";
import { LanguagePicker } from "../LanguagePicker";
import { SiteLookSwitch } from "../SiteLookSwitch";
import ClubAuthModal from "../modals/ClubAuthModal";
import { NavGlyph } from "./NavGlyph";
import { WalletSheet } from "./WalletSheet";
import { MyTablesButton } from "./MyTablesButton";
import styles from "./SiteNav.module.css";

const CLUB_CONSOLE_URL = (import.meta.env.VITE_CLUB_CONSOLE_URLS ?? "").split(",")[0]?.trim().replace(/\/+$/, "");
const EXPLORE = NAV_ITEMS.filter(i => i.group === "explore");
const HELP = NAV_ITEMS.filter(i => i.group === "help");
const HANDS = NAV_ITEMS.filter(i => i.path === "/hands");

/** One link in the Explore menu, the tab bar or the More sheet. */
const NavLink: React.FC<{ item: NavItem; active: boolean; className: string; onClick?: () => void }> = ({ item, active, className, onClick }) => {
    const { t } = useLanguage();
    return (
        <Link to={item.path} className={`${className} ${active ? styles.on : ""}`} aria-current={active ? "page" : undefined} onClick={onClick}>
            <NavGlyph icon={item.icon} />
            <span>{t(item.label)}</span>
        </Link>
    );
};

/**
 * The site navigation (Flagship look), kept to the essentials.
 * DESKTOP/TV: one slim bar: the logo, Play · Fairness · Explore (menu), then
 * My wallet (with the balance; opens the Game wallet, where you add funds) and
 * your avatar (My hands, avatar, sign-in, admin, language, network, look).
 * PHONE (< 860px): logo, My wallet and avatar on top; Play · Fairness · Wallet
 * · More along the bottom. Hidden on a game table.
 */
export const SiteNav: React.FC = () => {
    const location = useLocation();
    const { t } = useLanguage();
    const shown = showsSiteNav(location.pathname);
    const wallet = useCosmosWallet();
    const { selectedAvatar, openDrawer } = useProfileAvatar();
    const [menuOpen, setMenuOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [walletOpen, setWalletOpen] = useState(false);
    const exploreRef = useRef<HTMLDivElement>(null);

    // Escape closes the menus and the More sheet.
    useEffect(() => {
        if (!menuOpen && !moreOpen && !exploreOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            setMenuOpen(false);
            setMoreOpen(false);
            setExploreOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen, moreOpen, exploreOpen]);

    // The Explore menu closes on an outside click.
    useEffect(() => {
        if (!exploreOpen) return;
        const onDown = (e: MouseEvent) => {
            if (e.target instanceof Node && !exploreRef.current?.contains(e.target)) setExploreOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [exploreOpen]);

    if (!shown) return null;

    const active = activeNavItem(location.pathname);
    const inExplore = active?.group === "explore" || active?.group === "help";
    const balance = formatMicroAsUsdc(usdcMicroOf(wallet.balance), 6);
    const hasWallet = hasContent(wallet.address);
    const clubAuth = features.clubAuthModal && features.clubAccounts && !!custodyBase();
    const clubSession = clubAuth ? getCustodySession() : null;

    // The balance and Deposit open the game wallet panel here, on any page.
    const openWallet = () => setWalletOpen(true);

    const signOutClub = () => {
        custodySignOut();
        window.location.reload();
    };

    const avatar = (
        <span className={styles.meWrap}>
            <button type="button" className={styles.me} onClick={() => setMenuOpen(o => !o)} aria-label={t("nav.account")} aria-expanded={menuOpen} aria-haspopup="menu">
                {selectedAvatar?.imageUrl ? <img src={selectedAvatar.imageUrl} alt="" /> : <NavGlyph icon="user" />}
            </button>
            {menuOpen ? (
                <>
                    <button type="button" className={styles.menuScrim} aria-label={t("table.close")} onClick={() => setMenuOpen(false)} />
                    <div className={styles.menu} role="menu">
                        <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); openDrawer(); }}>
                            <NavGlyph icon="user" />
                            {t("nav.changeAvatar")}
                        </button>
                        <Link role="menuitem" to="/hands" onClick={() => setMenuOpen(false)}>
                            <NavGlyph icon="hands" />
                            {t("hands.title")}
                        </Link>
                        {clubAuth ? (
                            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); if (clubSession) signOutClub(); else setAuthOpen(true); }}>
                                <NavGlyph icon="key" />
                                {clubSession ? `${clubSession.username} · ${t("nav.signOut")}` : t("nav.signIn")}
                            </button>
                        ) : null}
                        {!clubAuth && features.clubLogin && hasContent(CLUB_CONSOLE_URL) ? (
                            <a role="menuitem" href={`${CLUB_CONSOLE_URL}/login`}>
                                <NavGlyph icon="key" />
                                {t("nav.clubLogin")}
                            </a>
                        ) : null}
                        <Link role="menuitem" to="/admin" onClick={() => setMenuOpen(false)}>
                            <NavGlyph icon="gear" />
                            {t("nav.admin")}
                        </Link>
                        <div className={styles.menuSettings}>
                            <LanguagePicker variant="row" />
                            {features.nodeSelector ? (
                                <div className={styles.menuRow}>
                                    <span>{t("nav.network")}</span>
                                    <NetworkSelector />
                                </div>
                            ) : null}
                            <SiteLookSwitch wide />
                        </div>
                    </div>
                </>
            ) : null}
        </span>
    );

    return (
        <>
            <header className={styles.top}>
                <Link to="/" className={styles.wordmark} aria-label="Block52">
                    <img src="/logo1080.png" alt="" />
                </Link>

                <nav className={styles.links} aria-label={t("nav.main")}>
                    {NAV_ITEMS.filter(i => i.top).map(i => (
                        <Link key={i.path} to={i.path} className={`${styles.link} ${active === i ? styles.linkOn : ""}`} aria-current={active === i ? "page" : undefined}>
                            {t(i.label)}
                        </Link>
                    ))}
                    <div className={styles.exploreWrap} ref={exploreRef}>
                        <button type="button" className={`${styles.link} ${inExplore ? styles.linkOn : ""}`} onClick={() => setExploreOpen(o => !o)} aria-expanded={exploreOpen} aria-haspopup="menu">
                            {t("nav.explore")}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        {exploreOpen ? (
                            <div className={styles.exploreMenu} role="menu">
                                {EXPLORE.map(i => (
                                    <NavLink key={i.path} item={i} active={active === i} className={styles.exploreItem} onClick={() => setExploreOpen(false)} />
                                ))}
                                <span className={styles.exploreLabel}>{t("nav.help")}</span>
                                {HELP.map(i => (
                                    <NavLink key={i.path} item={i} active={active === i} className={styles.exploreItem} onClick={() => setExploreOpen(false)} />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </nav>

                <div className={styles.right}>
                    <button type="button" className={styles.wallet} onClick={openWallet} disabled={!hasWallet} title={hasWallet ? "" : t("lobby.noWallet")}>
                        <NavGlyph icon="wallet" />
                        <span>{t("nav.myWallet")}</span>
                        <b>{lobbyBalanceLabel(balance)}</b>
                    </button>
                    {avatar}
                </div>
            </header>

            <nav className={styles.tabbar} aria-label={t("nav.main")}>
                {NAV_ITEMS.filter(i => i.tab).map(i => (
                    <NavLink key={i.path} item={i} active={active === i} className={styles.tab} />
                ))}
                <button type="button" className={`${styles.tab} ${inExplore || active?.path === "/hands" ? styles.on : ""}`} onClick={() => setMoreOpen(true)} aria-expanded={moreOpen}>
                    <NavGlyph icon="more" />
                    <span>{t("nav.more")}</span>
                </button>
            </nav>

            {moreOpen
                ? createPortal(
                      <div className={styles.portal}>
                          <button type="button" className={styles.scrim} aria-label={t("table.close")} onClick={() => setMoreOpen(false)} />
                          <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={t("nav.more")}>
                              <span className={styles.grab} />
                              <div className={styles.moreGrid}>
                                  {[...HANDS, ...EXPLORE, ...HELP].map(i => (
                                      <NavLink key={i.path} item={i} active={active === i} className={styles.moreItem} onClick={() => setMoreOpen(false)} />
                                  ))}
                              </div>
                          </div>
                      </div>,
                      document.body
                  )
                : null}

            {walletOpen && hasContent(wallet.address) ? (
                <WalletSheet address={wallet.address} usdc={balance} onClose={() => setWalletOpen(false)} onRefresh={wallet.refreshBalance} />
            ) : null}

            <MyTablesButton />

            {clubAuth ? createPortal(<ClubAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />, document.body) : null}
        </>
    );
};

/** Wraps the pages so they clear the tab bar (PHONE). Plain on a game table and in the Traditional look. */
export const SiteNavPage: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
    const { pathname } = useLocation();
    return <div className={enabled && showsSiteNav(pathname) ? styles.page : undefined}>{children}</div>;
};

export default SiteNav;
