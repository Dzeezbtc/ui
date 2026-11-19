import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFindGames, treasuryAddress, type GameWithFormat } from "../../hooks/game/useFindGames";
import { useTableClubs } from "../../hooks/club/useTableClubs";
import { useDeleteGame } from "../../hooks/game/useDeleteGame";
import { useForceCloseGame } from "../../hooks/game/useForceCloseGame";
import {
    SIZE_BANDS,
    STAKE_BANDS,
    activeFilterCount,
    filterLobbyGames,
    hasBalance,
    firstSectionOf,
    groupLevels,
    groupLobbySections,
    isListedTable,
    isTableCreator,
    isTreasuryTable,
    lobbyBalanceLabel,
    othersAtLevel,
    sectionAnchorId,
    sectionCount,
    seatedTotal,
    toLobbySort,
    totalOpenSeats,
    type LobbySort,
    type SizeBand,
    type StakeBand
} from "../../utils/lobbyLayout";
import { hasContent, hasElements, hasValue, isEmpty } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import DeleteTableModal from "../modals/DeleteTableModal";
import ForceCloseTableModal from "../modals/ForceCloseTableModal";
import LobbyHero from "./LobbyHero";
import TableCard from "./TableCard";
import TablePreview from "./TablePreview";
import styles from "./Lobby.module.css";

interface LobbyProps {
    balance: string;
    address: string | null;
    onDeposit: () => void;
    onCreateTable?: () => void;
    /** The wallet panel and recent transactions, shown at the bottom of the lobby. */
    walletSlot: React.ReactNode;
}

const STAKE_NAMES: Record<StakeBand, string> = { all: "", micro: "Micro", low: "Low", mid: "Mid", high: "High" };
const SIZE_NAMES: Record<SizeBand, string> = { all: "", "heads-up": "Heads-up", "6-max": "6-max", "9-max": "9-max" };
const SORTS: readonly LobbySort[] = ["stakes-up", "stakes-down", "most-players", "most-open"];
const SORT_KEYS = { "stakes-up": "lobby.sortStakesUp", "stakes-down": "lobby.sortStakesDown", "most-players": "lobby.sortMostPlayers", "most-open": "lobby.sortMostOpen" } as const;

/** Clubs that don't come from the club service use the build's club name, as the old table list did. */
const DEFAULT_CLUB_NAME = import.meta.env.VITE_CLUB_NAME || "Texas Hodl";

/**
 * Lobby — the Block52 home page lobby (redesign). One card per stake level:
 * every table with the same game, stakes and size collapses into one card that
 * leads with the busiest table with a free seat; the rest are listed in the
 * preview ("+N more"). Sections: each cash game, then Sit & Go, then
 * Tournaments. A one-line heading with your balance, a slim Quick seat bar,
 * and a Filters button keep the tables near the top of the screen.
 */
const Lobby: React.FC<LobbyProps> = ({ balance, address, onDeposit, onCreateTable, walletSlot }) => {
    const { t } = useLanguage();
    const tableClubs = useTableClubs();
    const { games: allGames, isLoading, error, refetch } = useFindGames();
    const { deleteGame, isDeleting } = useDeleteGame();
    const { forceCloseGame, isClosing } = useForceCloseGame();

    const [query, setQuery] = useState("");
    const [stake, setStake] = useState<StakeBand>("all");
    const [size, setSize] = useState<SizeBand>("all");
    const [sort, setSort] = useState<LobbySort>("stakes-up");
    const [treasuryOnly, setTreasuryOnly] = useState<boolean>(hasContent(treasuryAddress));
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [forceCloseTarget, setForceCloseTarget] = useState<GameWithFormat | null>(null);

    // Schedule labels change by the minute, so the lobby ticks every 30 seconds.
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 30_000);
        return () => clearInterval(id);
    }, []);

    const rawGames = useMemo(() => allGames.filter(g => isListedTable(g, nowMs)), [allGames, nowMs]);
    const clubNames = useMemo(() => Object.fromEntries(Object.entries(tableClubs).map(([id, c]) => [id, c.name])), [tableClubs]);
    const games = useMemo(
        () => filterLobbyGames(rawGames, { query, stake, size, treasuryOnly, treasuryAddress, clubNames }),
        [rawGames, query, stake, size, treasuryOnly, clubNames]
    );
    const sections = useMemo(() => groupLobbySections(games, sort).map(s => ({ ...s, levels: groupLevels(s.games) })), [games, sort]);
    const cashSections = useMemo(() => groupLobbySections(rawGames, "stakes-up").filter(s => s.kind === "cash"), [rawGames]);
    const preview = hasContent(previewId) ? rawGames.find(g => g.gameId === previewId) : undefined;
    const filterCount = activeFilterCount({ query, stake, size });

    const clubOf = useCallback((gameId: string) => tableClubs[gameId]?.name ?? DEFAULT_CLUB_NAME, [tableClubs]);
    const jump = (kind: "cash" | "sit-and-go" | "tournament") => {
        const s = firstSectionOf(sections, kind);
        if (hasValue(s)) document.getElementById(sectionAnchorId(s.key))?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const clearFilters = () => {
        setQuery("");
        setStake("all");
        setSize("all");
    };

    const handleDelete = useCallback(async () => {
        if (!hasContent(deleteId)) return;
        if (await deleteGame(deleteId)) {
            setPreviewId(null);
            refetch();
        }
    }, [deleteId, deleteGame, refetch]);

    const handleForceClose = useCallback(async () => {
        if (!hasValue(forceCloseTarget)) return;
        if (await forceCloseGame(forceCloseTarget.gameId)) {
            setPreviewId(null);
            refetch();
        }
    }, [forceCloseTarget, forceCloseGame, refetch]);

    const hasFunds = hasBalance(balance);

    return (
        <div className={styles.lobby}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
                <i />
            </div>

            <div className={styles.hello}>
                <h1 className={styles.h1}>
                    {t("lobby.heading")} <span className={styles.gradText}>{t("lobby.headingAccent")}</span>
                </h1>
                <div className={styles.ticker}>
                    <span className={styles.live}>
                        <span className={styles.dot} />
                        {t("lobby.liveNow")}
                    </span>
                    <span>{t("lobby.tablesRunning", { count: rawGames.length })}</span>
                    <span>{t("lobby.playersSeated", { count: seatedTotal(rawGames) })}</span>
                </div>
                <div className={styles.balancePill}>
                    <button type="button" className={styles.balanceText} onClick={() => document.getElementById("lobby-wallet")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        <small>{t("lobby.balance")}</small>
                        <b className={styles.mono}>{lobbyBalanceLabel(balance)}</b>
                    </button>
                    <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnGrad}`} onClick={onDeposit} disabled={!hasContent(address)} title={hasContent(address) ? "" : t("lobby.noWallet")}>
                        {hasFunds ? t("lobby.deposit") : t("lobby.addFunds")}
                    </button>
                </div>
            </div>

            <LobbyHero games={rawGames} cashSections={cashSections} onOpenTable={setPreviewId} onCreateTable={onCreateTable} />

            <div className={styles.toolbarWrap}>
                <div className={styles.toolbar}>
                    <div className={styles.seg}>
                        <button type="button" onClick={() => jump("cash")} disabled={sectionCount(sections, "cash") === 0}>
                            {t("lobby.cashGames")} <i>{sectionCount(sections, "cash")}</i>
                        </button>
                        <button type="button" onClick={() => jump("sit-and-go")} disabled={sectionCount(sections, "sit-and-go") === 0}>
                            {t("lobby.sitAndGo")} <i>{sectionCount(sections, "sit-and-go")}</i>
                        </button>
                        <button type="button" onClick={() => jump("tournament")} disabled={sectionCount(sections, "tournament") === 0}>
                            {t("lobby.tournaments")} <i>{sectionCount(sections, "tournament")}</i>
                        </button>
                    </div>
                    <div className={styles.toolbarRight}>
                        <div className={styles.search}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" />
                            </svg>
                            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t("lobby.search")} aria-label={t("lobby.search")} />
                        </div>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost} ${filtersOpen ? styles.btnOn : ""}`}
                            onClick={() => setFiltersOpen(v => !v)}
                            aria-expanded={filtersOpen}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M4 6h16M7 12h10M10 18h4" />
                            </svg>
                            {t("lobby.filters")}
                            {filterCount > 0 ? <span className={styles.badgeCount}>{filterCount}</span> : null}
                        </button>
                        {onCreateTable ? (
                            <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.hidePhone}`} onClick={onCreateTable}>
                                {t("lobby.createTable")}
                            </button>
                        ) : null}
                    </div>
                </div>
                {filtersOpen ? (
                    <div className={styles.filters}>
                        <div className={styles.chips}>
                            <span className={styles.chipLabel}>{t("lobby.stakes")}</span>
                            {STAKE_BANDS.map(b => (
                                <button key={b} type="button" className={`${styles.chip} ${stake === b ? styles.chipOn : ""}`} onClick={() => setStake(b)} aria-pressed={stake === b}>
                                    {b === "all" ? t("lobby.all") : STAKE_NAMES[b]}
                                </button>
                            ))}
                        </div>
                        <div className={styles.chips}>
                            <span className={styles.chipLabel}>{t("lobby.seats")}</span>
                            {SIZE_BANDS.map(b => (
                                <button key={b} type="button" className={`${styles.chip} ${size === b ? styles.chipOn : ""}`} onClick={() => setSize(b)} aria-pressed={size === b}>
                                    {b === "all" ? t("lobby.all") : SIZE_NAMES[b]}
                                </button>
                            ))}
                        </div>
                        <div className={styles.sel} style={{ width: 190 }}>
                            <select value={sort} onChange={e => setSort(toLobbySort(e.target.value) ?? sort)} aria-label="Sort tables">
                                {SORTS.map(s => (
                                    <option key={s} value={s}>
                                        {t(SORT_KEYS[s])}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {hasContent(treasuryAddress) ? (
                            <button type="button" role="switch" aria-checked={treasuryOnly} className={`${styles.switch} ${treasuryOnly ? styles.switchOn : ""}`} onClick={() => setTreasuryOnly(v => !v)}>
                                <i />
                                {t("lobby.treasuryOnly")}
                            </button>
                        ) : null}
                        {onCreateTable ? (
                            <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost} ${styles.showPhone}`} onClick={onCreateTable}>
                                {t("lobby.createTable")}
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {isLoading && isEmpty(allGames) ? (
                <div className={`${styles.box} ${styles.state}`}>
                    <div className={styles.spinner} />
                    <p>{t("lobby.loading")}</p>
                </div>
            ) : hasValue(error) ? (
                <div className={`${styles.box} ${styles.state}`}>
                    <p>{error.message}</p>
                    <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={refetch}>
                        {t("lobby.retry")}
                    </button>
                </div>
            ) : !hasElements(sections) ? (
                <div className={`${styles.box} ${styles.state}`}>
                    <p style={{ color: "var(--fg)", fontWeight: 600 }}>{filterCount > 0 ? t("lobby.noMatchFilters") : t("lobby.noTables")}</p>
                    {filterCount > 0 ? (
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>
                            {t("lobby.clearFilters")}
                        </button>
                    ) : (
                        <>
                            <p>{t("lobby.createFirst")}</p>
                            {onCreateTable ? (
                                <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={onCreateTable}>
                                    {t("lobby.createTable")}
                                </button>
                            ) : null}
                        </>
                    )}
                </div>
            ) : (
                sections.map(section => {
                    const title = section.kind === "cash" ? section.title : section.kind === "sit-and-go" ? t("lobby.sitAndGo") : t("lobby.tournaments");
                    const all = expanded[section.key] === true;
                    return (
                        <section key={section.key} id={sectionAnchorId(section.key)} className={styles.section}>
                            <div className={styles.sectionHead}>
                                <div>
                                    <h2>{title}</h2>
                                    <small>{t("lobby.sectionCount", { count: section.games.length, open: totalOpenSeats(section.games) })}</small>
                                </div>
                                {section.levels.length > 2 ? (
                                    <button type="button" className={`${styles.linkBtn} ${styles.seeAll}`} onClick={() => setExpanded(e => ({ ...e, [section.key]: !all }))}>
                                        {all ? t("lobby.showLess") : t("lobby.seeAll")}
                                    </button>
                                ) : null}
                            </div>
                            <div className={`${styles.grid} ${all ? styles.gridAll : ""}`}>
                                {section.levels.map(level => (
                                    <TableCard
                                        key={level.key}
                                        level={level}
                                        clubName={clubOf(level.lead.gameId)}
                                        isTreasury={isTreasuryTable(level.lead, treasuryAddress)}
                                        nowMs={nowMs}
                                        onOpen={setPreviewId}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                })
            )}

            <section id="lobby-wallet" className={styles.section}>
                <div className={styles.sectionHead}>
                    <h2>{t("lobby.wallet")}</h2>
                </div>
                <div className={styles.walletArea}>{walletSlot}</div>
            </section>

            {hasValue(preview) ? (
                <TablePreview
                    game={preview}
                    clubName={clubOf(preview.gameId)}
                    isCreator={isTableCreator(preview, address)}
                    nowMs={nowMs}
                    busy={isDeleting || isClosing}
                    others={othersAtLevel(rawGames, preview)}
                    onPick={setPreviewId}
                    onClose={() => setPreviewId(null)}
                    onDelete={setDeleteId}
                    onForceClose={setForceCloseTarget}
                />
            ) : null}

            <DeleteTableModal isOpen={hasContent(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete} gameId={deleteId ?? ""} />
            <ForceCloseTableModal
                isOpen={hasValue(forceCloseTarget)}
                onClose={() => setForceCloseTarget(null)}
                onConfirm={handleForceClose}
                gameId={forceCloseTarget?.gameId ?? ""}
                seatedPlayerCount={forceCloseTarget?.currentPlayers ?? 0}
            />
        </div>
    );
};

export default Lobby;
