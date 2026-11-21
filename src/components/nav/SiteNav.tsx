import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useCosmosWallet } from "../../hooks/wallet/useCosmosWallet";
import { useLatestBlockHeight } from "../../hooks/nodes/useLatestBlockHeight";
import { useProfileAvatar } from "../../context/profile/ProfileAvatarContext";
import { features } from "../../config/features";
import { formatMicroAsUsdc } from "../../constants/currency";
import { custodyBase, custodySignOut, getCustodySession } from "../../utils/custody/session";
import { hasContent } from "../../utils/guards";
import { hasBalance, lobbyBalanceLabel } from "../../utils/lobbyLayout";
import { NAV_ITEMS, activeNavItem, searchTarget, showsSiteNav, usdcMicroOf, type NavItem } from "../../utils/siteNav";
import { NetworkSelector } from "../NetworkSelector";
import { LanguagePicker } from "../LanguagePicker";
import { SiteLookSwitch } from "../SiteLookSwitch";
import ClubAuthModal from "../modals/ClubAuthModal";
import { NavGlyph } from "./NavGlyph";
import { WalletSheet } from "./WalletSheet";
import styles from "./SiteNav.module.css";

const CLUB_CONSOLE_URL = (import.meta.env.VITE_CLUB_CONSOLE_URLS ?? "").split(",")[0]?.trim().replace(/\/+$/, "");

/** One link in the rail, the tab bar or the More sheet. */
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
 * The site navigation (flagship look). DESKTOP/TV: an icon rail down the left
 * and a slim top bar (page name, search, live block, language, balance +
 * Deposit, avatar menu). PHONE (< 860px): a top bar with the logo, balance and
 * avatar, and a tab bar along the bottom (Play, Wallet, Hands, Explorer, More).
 * Hidden on a game table. Pages get room for it from `SiteNavPage`.
 */
export const SiteNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const shown = showsSiteNav(location.pathname);
    const wallet = useCosmosWallet();
    const block = useLatestBlockHeight(shown);
    const { selectedAvatar, openDrawer } = useProfileAvatar();
    const [query, setQuery] = useState("");
    const [noMatch, setNoMatch] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [walletOpen, setWalletOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // "/" jumps to the search box, as on most sites with one.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (e.key !== "/" || el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
            e.preventDefault();
            searchRef.current?.focus();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Escape closes the avatar menu and the More sheet.
    useEffect(() => {
        if (!menuOpen && !moreOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            setMenuOpen(false);
            setMoreOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen, moreOpen]);

    if (!shown) return null;

    const active = activeNavItem(location.pathname);
    const balance = formatMicroAsUsdc(usdcMicroOf(wallet.balance), 6);
    const hasWallet = hasContent(wallet.address);
    const clubAuth = features.clubAuthModal && features.clubAccounts && !!custodyBase();
    const clubSession = clubAuth ? getCustodySession() : null;

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const to = searchTarget(query);
        setNoMatch(!to);
        if (!to) return;
        setQuery("");
        setMoreOpen(false);
        navigate(to);
    };

    // The balance and Deposit open the game wallet panel here, on any page.
    const deposit = () => setWalletOpen(true);

    const signOutClub = () => {
        custodySignOut();
        window.location.reload();
    };

    const search = (
        <form className={styles.search} role="search" onSubmit={submitSearch}>
            <NavGlyph icon="search" />
            <input
                ref={searchRef}
                value={query}
                onChange={e => {
                    setQuery(e.target.value);
                    setNoMatch(false);
                }}
                placeholder={t("nav.search")}
                title={t("nav.search")}
                aria-label={t("nav.searchShort")}
                aria-invalid={noMatch}
                aria-describedby={noMatch ? "site-search-hint" : undefined}
                autoComplete="off"
                spellCheck={false}
            />
            <kbd>/</kbd>
            {noMatch ? (
                <span id="site-search-hint" className={styles.searchHint} role="status">
                    {t("nav.searchNoMatch")}
                </span>
            ) : null}
        </form>
    );

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
                        <div className={styles.menuLook}>
                            <SiteLookSwitch wide />
                        </div>
                    </div>
                </>
            ) : null}
        </span>
    );

    return (
        <>
            <nav className={styles.rail} aria-label={t("nav.main")}>
                <Link to="/" className={styles.mark} aria-label="Block52">
                    <img src="/logo1080.png" alt="" />
                </Link>
                {NAV_ITEMS.filter(i => i.group === "main").map(i => (
                    <NavLink key={i.path} item={i} active={active === i} className={styles.ri} />
                ))}
                <span className={styles.sep} />
                {NAV_ITEMS.filter(i => i.group === "data").map(i => (
                    <NavLink key={i.path} item={i} active={active === i} className={styles.ri} />
                ))}
                <span className={styles.grow} />
                {NAV_ITEMS.filter(i => i.group === "foot").map(i => (
                    <NavLink key={i.path} item={i} active={active === i} className={styles.ri} />
                ))}
            </nav>

            <header className={styles.top}>
                <Link to="/" className={styles.wordmark} aria-label="Block52">
                    <img src="/logo1080.png" alt="" />
                </Link>
                <span className={styles.title}>{active ? t(active.label) : ""}</span>
                <div className={styles.searchSlot}>{search}</div>
                {hasContent(block.height) ? (
                    <Link to={`/explorer/block/${block.height}`} className={styles.blk} title={t("nav.latestBlock")}>
                        <span className={`${styles.dot} ${block.hasError ? styles.dotBad : ""}`} />
                        <span>#{Number(block.height).toLocaleString("en-US")}</span>
                    </Link>
                ) : null}
                {features.nodeSelector ? (
                    <span className={styles.desktopOnly}>
                        <NetworkSelector />
                    </span>
                ) : null}
                <span className={styles.lang}>
                    <LanguagePicker variant="icon" />
                </span>
                <div className={styles.bal}>
                    <button type="button" className={styles.balText} onClick={deposit} disabled={!hasWallet} aria-label={t("walletSheet.title")}>
                        <small>{t("lobby.balance")}</small>
                        <b>{lobbyBalanceLabel(balance)}</b>
                    </button>
                    <button type="button" className={styles.dep} onClick={deposit} disabled={!hasWallet} title={hasWallet ? "" : t("lobby.noWallet")}>
                        <span className={styles.depLong}>{hasBalance(balance) ? t("lobby.deposit") : t("lobby.addFunds")}</span>
                        <span className={styles.depShort}>{t("lobby.deposit")}</span>
                    </button>
                </div>
                {avatar}
            </header>

            <nav className={styles.tabbar} aria-label={t("nav.main")}>
                {NAV_ITEMS.filter(i => i.tab).map(i => (
                    <NavLink key={i.path} item={i} active={active === i} className={styles.tab} />
                ))}
                <button type="button" className={`${styles.tab} ${active && !active.tab ? styles.on : ""}`} onClick={() => setMoreOpen(true)} aria-expanded={moreOpen}>
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
                              {search}
                              <div className={styles.moreGrid}>
                                  {NAV_ITEMS.filter(i => !i.tab).map(i => (
                                      <NavLink key={i.path} item={i} active={active === i} className={styles.moreItem} onClick={() => setMoreOpen(false)} />
                                  ))}
                              </div>
                              <div className={styles.moreRow}>
                                  <LanguagePicker variant="row" />
                                  <SiteLookSwitch wide />
                                  {features.nodeSelector ? <NetworkSelector /> : null}
                              </div>
                          </div>
                      </div>,
                      document.body
                  )
                : null}

            {walletOpen && hasContent(wallet.address) ? (
                <WalletSheet address={wallet.address} usdc={balance} onClose={() => setWalletOpen(false)} onRefresh={wallet.refreshBalance} />
            ) : null}

            {clubAuth ? createPortal(<ClubAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />, document.body) : null}
        </>
    );
};

/** Wraps the pages so they clear the rail (DESKTOP) or the tab bar (PHONE). Plain on a game table and in the Traditional look. */
export const SiteNavPage: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
    const { pathname } = useLocation();
    return <div className={enabled && showsSiteNav(pathname) ? styles.page : undefined}>{children}</div>;
};

export default SiteNav;
