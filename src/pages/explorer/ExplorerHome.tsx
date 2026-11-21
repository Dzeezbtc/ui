import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useRecentBlocks } from "../../hooks/explorer/useRecentBlocks";
import { useChainOverview } from "../../hooks/nodes/useChainOverview";
import { avgBlockSeconds, heartbeatBars, signingValidators, totalTxs } from "../../utils/explorerView";
import { searchTarget } from "../../utils/siteNav";
import { formatProposerAddress, formatTimestampRelative, truncateHash } from "../../utils/formatUtils";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import { NavGlyph } from "../../components/nav/NavGlyph";
import styles from "./ExplorerHome.module.css";

const BLOCKS = 40;
const BARS = 40;
const LIST = 12;

/** The explorer's shortcuts: [label key, sub key, link, icon, colour]. */
const TILES = [
    ["explorer.tileBlocks", "explorer.tileBlocksSub", "#latest-blocks", "explorer", "vi"],
    ["explorer.tileAccounts", "explorer.tileAccountsSub", "/explorer/accounts", "players", "cy"],
    ["explorer.tileAddress", "explorer.tileAddressSub", "/explorer/address", "search", "fu"],
    ["explorer.tileHands", "explorer.tileHandsSub", "/hands", "hands", "gold"],
    ["explorer.tilePlayers", "explorer.tilePlayersSub", "/players", "players", "good"],
    ["explorer.tileAwards", "explorer.tileAwardsSub", "/awards", "awards", "gold"]
] as const;

/**
 * Block explorer home (Flagship look): one big search, shortcuts, a live
 * heartbeat of the latest blocks (taller = busier), the chain's numbers and
 * the latest blocks. Every number is read from the chain.
 */
const ExplorerHome: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { blocks, loading, error } = useRecentBlocks(BLOCKS, 6000);
    const { overview } = useChainOverview();
    const [query, setQuery] = useState("");
    const [noMatch, setNoMatch] = useState(false);

    useEffect(() => {
        document.title = "Block Explorer - Block52 Chain";
    }, []);

    const latest = blocks[0];
    const avg = avgBlockSeconds(blocks);
    const bars = heartbeatBars(blocks, BARS);
    const vals = hasValue(overview) ? signingValidators(overview.validators) : null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const to = searchTarget(query);
        setNoMatch(!to);
        if (to) navigate(to);
    };

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <h1>{t("explorer.title")}</h1>
                <p>{t("explorer.sub")}</p>
            </header>

            <form className={styles.search} role="search" onSubmit={submit}>
                <NavGlyph icon="search" />
                <input
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setNoMatch(false);
                    }}
                    placeholder={t("explorer.searchPlaceholder")}
                    aria-label={t("explorer.searchLabel")}
                    aria-invalid={noMatch}
                    autoComplete="off"
                    spellCheck={false}
                />
                <button type="submit">{t("explorer.searchGo")}</button>
            </form>
            {noMatch ? <p className={styles.hint}>{t("nav.searchNoMatch")}</p> : null}

            <nav className={styles.tiles} aria-label={t("explorer.shortcuts")}>
                {TILES.map(([label, sub, to, icon, colour]) =>
                    to.startsWith("#") ? (
                        <a key={label} className={styles.tile} href={to}>
                            <span className={`${styles.ic} ${styles[colour]}`}>
                                <NavGlyph icon={icon} />
                            </span>
                            <b>{t(label)}</b>
                            <small>{t(sub)}</small>
                        </a>
                    ) : (
                        <Link key={label} className={styles.tile} to={to}>
                            <span className={`${styles.ic} ${styles[colour]}`}>
                                <NavGlyph icon={icon} />
                            </span>
                            <b>{t(label)}</b>
                            <small>{t(sub)}</small>
                        </Link>
                    )
                )}
            </nav>

            <section className={`${styles.box} ${styles.beat}`}>
                <div className={styles.beatHead}>
                    <span className={error && !hasElements(blocks) ? styles.pillBad : styles.pillGood}>
                        <span className={styles.dot} />
                        {error && !hasElements(blocks) ? t("explorer.down") : t("explorer.live")}
                    </span>
                    <span className={styles.muted}>{hasValue(avg) ? t("explorer.beatSub", { s: avg.toFixed(1) }) : t("explorer.beatSubPlain")}</span>
                </div>
                <div className={styles.track} aria-hidden="true">
                    {bars.map((b, i) => (
                        <Link
                            key={b.height}
                            to={`/explorer/block/${b.height}`}
                            className={`${styles.bar} ${i === bars.length - 1 ? styles.barNew : ""}`}
                            style={{ height: `${Math.round(b.level * 100)}%` }}
                            title={t("explorer.barTitle", { h: b.height.toLocaleString(), n: b.txs })}
                            tabIndex={-1}
                        />
                    ))}
                </div>
            </section>

            <div className={styles.kpis}>
                <div className={styles.kpi}>
                    <small>{t("explorer.kLatest")}</small>
                    <b>{hasValue(latest) ? `#${latest.height.toLocaleString()}` : "—"}</b>
                    <span>{hasValue(latest) ? formatTimestampRelative(latest.time) : t("explorer.height")}</span>
                </div>
                <div className={styles.kpi}>
                    <small>{t("explorer.kTime")}</small>
                    <b>{hasValue(avg) ? `${avg.toFixed(1)}s` : "—"}</b>
                    <span>{t("explorer.kTimeSub", { n: blocks.length })}</span>
                </div>
                <div className={styles.kpi}>
                    <small>{t("explorer.kActions")}</small>
                    <b>{totalTxs(blocks).toLocaleString()}</b>
                    <span>{t("explorer.kActionsSub", { n: blocks.length })}</span>
                </div>
                <div className={styles.kpi}>
                    <small>{t("explorer.kValidators")}</small>
                    <b>{hasValue(vals) ? `${vals.live} / ${vals.total}` : "—"}</b>
                    <span>{hasValue(vals) && vals.live === vals.total ? t("explorer.allSigning") : t("explorer.bonded")}</span>
                </div>
            </div>

            <section className={styles.box} id="latest-blocks">
                <div className={styles.panelHead}>
                    <h2>{t("explorer.latestBlocks")}</h2>
                    {error && hasElements(blocks) ? <span className={styles.warn}>{t("explorer.stale")}</span> : null}
                </div>
                {loading && !hasElements(blocks) ? (
                    <p className={styles.empty}>{t("explorer.loading")}</p>
                ) : error && !hasElements(blocks) ? (
                    <p className={styles.empty}>{error}</p>
                ) : (
                    <ul className={styles.blist}>
                        {blocks.slice(0, LIST).map(b => (
                            <li key={b.height}>
                                <Link to={`/explorer/block/${b.height}`} className={styles.brow}>
                                    <span className={styles.cube}>
                                        <NavGlyph icon="explorer" />
                                    </span>
                                    <span className={styles.bmain}>
                                        <b>#{b.height.toLocaleString()}</b>
                                        <small className={styles.mono}>{truncateHash(b.hash, 10)}</small>
                                    </span>
                                    <span className={b.txs > 0 ? styles.txs : styles.txsNone}>{b.txs === 1 ? t("explorer.actionOne") : t("explorer.actions", { n: b.txs })}</span>
                                    <span className={`${styles.prop} ${styles.mono}`}>{hasContent(b.proposer) ? truncateHash(formatProposerAddress(b.proposer), 8) : ""}</span>
                                    <span className={styles.when}>{formatTimestampRelative(b.time)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className={styles.links}>
                <Link to="/explorer/distribution" className={styles.btnO}>
                    {t("explorer.linkDistribution")}
                </Link>
                <Link to="/explorer/accounts" className={styles.btnO}>
                    {t("explorer.linkAccounts")}
                </Link>
                <Link to="/nodes" className={styles.btnO}>
                    {t("explorer.linkNodes")}
                </Link>
            </div>
        </div>
    );
};

export default ExplorerHome;
