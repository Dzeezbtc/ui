import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { usePlayersDirectory } from "../../hooks/player/usePlayersDirectory";
import { Pagination } from "../../components/common";
import { VipBadge } from "../../components/players/VipBadge";
import { NavGlyph } from "../../components/nav/NavGlyph";
import { isEmpty } from "../../utils/guards";
import { truncateMiddle } from "../../utils/stringUtils";
import { microToUsdc } from "../../constants/currency";
import { PLAYER_SORTS, orbHue, orbLetters, plainUsd, shortCount, signedUsd } from "../../utils/playersView";
import type { PlayerSortField } from "../../types/players";
import styles from "./PlayersHome.module.css";

const PAGE_SIZE = 24;

/**
 * Players (Flagship look): everyone with an account, as cards (an orb from
 * their address, VIP tier, hands, net profit, network fees). Search by address,
 * sort with chips, tap a card for the player's public history.
 */
const PlayersHome: React.FC = () => {
    const { t } = useLanguage();
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<PlayerSortField>("net_profit");
    const [page, setPage] = useState(1);

    useEffect(() => setPage(1), [search, sort]);
    useEffect(() => {
        document.title = "Players - Block52";
    }, []);

    const params = useMemo(() => ({ search, sort, order: "desc" as const, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }), [search, sort, page]);
    const { players, total, loading, error, refetch } = usePlayersDirectory(params);

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <div>
                    <h1>{t("players.title")}</h1>
                    <p>{t("players.sub")}</p>
                </div>
                {total > 0 ? <span className={styles.pill}>{t("players.count", { n: total.toLocaleString() })}</span> : null}
            </header>

            <div className={styles.toolbar}>
                <form
                    className={styles.search}
                    role="search"
                    onSubmit={e => {
                        e.preventDefault();
                        setSearch(input.trim());
                    }}
                >
                    <NavGlyph icon="search" />
                    <input
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            if (!e.target.value.trim()) setSearch("");
                        }}
                        placeholder={t("players.search")}
                        aria-label={t("players.search")}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </form>
                <div className={styles.chips} role="group" aria-label={t("players.sortBy")}>
                    {PLAYER_SORTS.map(s => (
                        <button key={s.field} type="button" aria-pressed={sort === s.field} className={sort === s.field ? styles.chipOn : styles.chip} onClick={() => setSort(s.field)}>
                            {t(s.label)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={styles.empty}>{t("players.loading")}</div>
            ) : error ? (
                <div className={styles.empty}>
                    {error}{" "}
                    <button type="button" className={styles.linkBtn} onClick={refetch}>
                        {t("players.retry")}
                    </button>
                </div>
            ) : isEmpty(players) ? (
                <div className={styles.empty}>{search ? t("players.noMatch") : t("players.none")}</div>
            ) : (
                <div className={styles.grid}>
                    {players.map(p => {
                        const hue = orbHue(p.player_address);
                        const profit = microToUsdc(p.net_profit);
                        return (
                            <Link key={p.player_address} to={`/players/${p.player_address}`} className={styles.card}>
                                <span className={styles.orb} style={{ background: `radial-gradient(circle at 32% 28%, #fff6, transparent 42%), linear-gradient(135deg, hsl(${hue} 80% 58%), hsl(${(hue + 60) % 360} 75% 45%))` }}>
                                    {orbLetters(p.player_address)}
                                </span>
                                <span className={styles.addr} title={p.player_address}>
                                    {truncateMiddle(p.player_address, 10, 6)}
                                </span>
                                <VipBadge tier={p.vip_tier} rakebackPct={p.rakeback_pct} />
                                <span className={styles.m3}>
                                    <span>
                                        <small>{t("players.hands")}</small>
                                        <b>{shortCount(p.total_hands)}</b>
                                    </span>
                                    <span>
                                        <small>{t("players.profit")}</small>
                                        <b className={profit > 0 ? styles.up : profit < 0 ? styles.down : undefined}>{signedUsd(p.net_profit)}</b>
                                    </span>
                                    <span>
                                        <small>{t("players.fees")}</small>
                                        <b>{plainUsd(p.total_rake_contributed)}</b>
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!loading && total > PAGE_SIZE ? (
                <div className={styles.pager}>
                    <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                </div>
            ) : null}
        </div>
    );
};

export default PlayersHome;
