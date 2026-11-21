import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFindGames, treasuryAddress, type GameWithFormat } from "../../hooks/game/useFindGames";
import { useTableClubs } from "../../hooks/club/useTableClubs";
import { useDeleteGame } from "../../hooks/game/useDeleteGame";
import { useForceCloseGame } from "../../hooks/game/useForceCloseGame";
import { useLobbyPrefs } from "../../hooks/lobby/useLobbyPrefs";
import {
    SIZE_BANDS,
    STAKE_BANDS,
    activeFilterCount,
    filterLobbyGames,
    sectionRows,
    rowSizeSelection,
    rowView,
    toggleRowSize,
    quietStakeTable,
    isListedTable,
    isTableCreator,
    isTreasuryTable,
    othersAtLevel,
    occupiedTables,
    similarOpenTable,
    toggleBand,
    lobbyStakesLabel,
    lobbyBuyInLabel,
    tableSizeLabel,
    isCashTable,
    seatedTotal,
    toLobbySort,
    type SizeBand,
    type StakeBand
} from "../../utils/lobbyLayout";
import { LOBBY_TABS, activeGameType, activeTab, gameTypesIn, gamesFor, isLobbyTab, tabCounts, type LobbyTab } from "../../utils/lobbyTabs";
import { hasContent, hasElements, hasValue, isEmpty } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import type { TranslationKey } from "../../i18n";
import DeleteTableModal from "../modals/DeleteTableModal";
import ForceCloseTableModal from "../modals/ForceCloseTableModal";
import UpcomingEvents from "./UpcomingEvents";
import TableCard from "./TableCard";
import TablePreview from "./TablePreview";
import styles from "./Lobby.module.css";

interface LobbyProps {
    address: string | null;
    onCreateTable?: () => void;
}

const STAKE_NAMES: Record<StakeBand, string> = { all: "", micro: "Micro", low: "Low", mid: "Mid", high: "High" };
const SIZE_NAMES: Record<SizeBand, string> = { all: "", "heads-up": "Heads-up", "6-max": "6-max", "9-max": "9-max" };
const SORTS: readonly ("stakes-up" | "stakes-down" | "most-players" | "most-open")[] = ["stakes-up", "stakes-down", "most-players", "most-open"];
const SORT_KEYS = { "stakes-up": "lobby.sortStakesUp", "stakes-down": "lobby.sortStakesDown", "most-players": "lobby.sortMostPlayers", "most-open": "lobby.sortMostOpen" } as const;
const TAB_KEYS: Record<LobbyTab, TranslationKey> = { cash: "lobby.cashGames", "sit-and-go": "lobby.sitAndGo", tournament: "lobby.tournaments" };

/** Clubs that don't come from the club service use the build's club name, as the old table list did. */
const DEFAULT_CLUB_NAME = import.meta.env.VITE_CLUB_NAME || "Texas Hodl";

/**
 * Lobby (Flagship look). Three tabs (Cash games, Sit & Go, Tournaments), the
 * game types of the open tab as one row of chips with search and filters at
 * its end, then that game's tables as stake rows. Tournaments also lists the
 * upcoming scheduled events. Search, filters and Create table sit together at
 * the end of the game-type row; the wallet lives in the site top bar. The tab and game type are remembered.
 */
const Lobby: React.FC<LobbyProps> = ({ address, onCreateTable }) => {
    const { t } = useLanguage();
    const tableClubs = useTableClubs();
    const { games: allGames, isLoading, error, refetch } = useFindGames();
    const { deleteGame, isDeleting } = useDeleteGame();
    const { forceCloseGame, isClosing } = useForceCloseGame();

    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    // Stakes, sizes, sort, treasury-only, tab and game type are remembered between visits; search is not.
    const [prefs, setPrefs] = useLobbyPrefs({ stakes: [], sizes: [], sort: "most-players", treasuryOnly: hasContent(treasuryAddress), rowSizes: {}, tab: "cash", types: {} });
    const { stakes, sizes, sort, treasuryOnly, rowSizes } = prefs;
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [forceCloseTarget, setForceCloseTarget] = useState<GameWithFormat | null>(null);

    // Schedule labels change by the minute, so the lobby ticks every 30 seconds.
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 30_000);
        return () => clearInterval(id);
    }, []);
    useEffect(() => {
        if (searchOpen) searchRef.current?.focus();
    }, [searchOpen]);

    const rawGames = useMemo(() => allGames.filter(g => isListedTable(g, nowMs)), [allGames, nowMs]);
    const clubNames = useMemo(() => Object.fromEntries(Object.entries(tableClubs).map(([id, c]) => [id, c.name])), [tableClubs]);
    const games = useMemo(
        () => filterLobbyGames(rawGames, { query, stakes, sizes, treasuryOnly, treasuryAddress, clubNames }),
        [rawGames, query, stakes, sizes, treasuryOnly, clubNames]
    );
    const counts = useMemo(() => tabCounts(rawGames), [rawGames]);
    const tab = activeTab(counts, isLobbyTab(prefs.tab) ? prefs.tab : undefined);
    const typeChips = useMemo(() => gameTypesIn(rawGames, tab), [rawGames, tab]);
    const type = activeGameType(typeChips, prefs.types[tab]);
    const shown = useMemo(() => gamesFor(games, tab, type), [games, tab, type]);
    const { active, quiet } = useMemo(() => sectionRows(shown, sort), [shown, sort]);
    const preview = hasContent(previewId) ? rawGames.find(g => g.gameId === previewId) : undefined;
    const filterCount = activeFilterCount({ query, stakes, sizes });

    const clubOf = useCallback((gameId: string) => tableClubs[gameId]?.name ?? DEFAULT_CLUB_NAME, [tableClubs]);
    const clearFilters = () => {
        setQuery("");
        setPrefs({ stakes: [], sizes: [] });
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

    return (
        <div className={styles.lobby}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
                <i />
            </div>

            {/* Tabs: the three areas, a live count, Quick seat and Create table. */}
            <div className={styles.tabBar}>
                <div className={styles.tabs} role="tablist" aria-label={t("lobby.areas")}>
                    {LOBBY_TABS.map(tb => (
                        <button key={tb} type="button" role="tab" aria-selected={tab === tb} className={tab === tb ? styles.tabOn : styles.tab} onClick={() => setPrefs({ tab: tb })}>
                            {t(TAB_KEYS[tb])}
                            <i>{counts[tb]}</i>
                        </button>
                    ))}
                </div>
                <span className={styles.liveLine}>
                    <span className={styles.dot} />
                    {t("lobby.liveLine", { tables: rawGames.length, players: seatedTotal(rawGames) })}
                </span>
            </div>

            {/* Game types of the open tab, with search and filters at the end of the row. */}
            <div className={styles.typeRow}>
                <div className={styles.types} role="group" aria-label={t("lobby.game")}>
                    {typeChips.map(c => (
                        <button
                            key={c.type}
                            type="button"
                            aria-pressed={c.type === type}
                            className={c.type === type ? styles.typeOn : styles.type}
                            onClick={() => setPrefs({ types: { ...prefs.types, [tab]: c.type } })}
                        >
                            {c.type}
                            <i>{c.tables}</i>
                        </button>
                    ))}
                </div>
                <div className={styles.typeTools}>
                    {searchOpen || hasContent(query) ? (
                        <div className={styles.search}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" />
                            </svg>
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onBlur={() => setSearchOpen(false)}
                                placeholder={t("lobby.search")}
                                aria-label={t("lobby.search")}
                            />
                        </div>
                    ) : (
                        <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label={t("lobby.search")} title={t("lobby.search")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" />
                            </svg>
                        </button>
                    )}
                    <button
                        type="button"
                        className={`${styles.iconBtn} ${filtersOpen ? styles.iconBtnOn : ""}`}
                        onClick={() => setFiltersOpen(v => !v)}
                        aria-expanded={filtersOpen}
                        aria-label={t("lobby.filters")}
                        title={t("lobby.filters")}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M4 6h16M7 12h10M10 18h4" />
                        </svg>
                        {filterCount > 0 ? <span className={styles.badgeCount}>{filterCount}</span> : null}
                    </button>
                    {onCreateTable ? (
                        <button type="button" className={styles.createBtn} onClick={onCreateTable} aria-label={t("lobby.createTable")} title={t("lobby.createTable")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            <span>{t("lobby.createTable")}</span>
                        </button>
                    ) : null}
                </div>
            </div>

            {filtersOpen ? (
                <div className={styles.filters}>
                    <div className={styles.chips}>
                        <span className={styles.chipLabel}>{t("lobby.stakes")}</span>
                        {STAKE_BANDS.map(b => {
                            const on = b === "all" ? !hasElements(stakes) : stakes.some(x => x === b);
                            return (
                                <button key={b} type="button" className={`${styles.chip} ${on ? styles.chipOn : ""}`} onClick={() => setPrefs({ stakes: toggleBand(stakes, b) })} aria-pressed={on}>
                                    {b === "all" ? t("lobby.all") : STAKE_NAMES[b]}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.chips}>
                        <span className={styles.chipLabel}>{t("lobby.seats")}</span>
                        {SIZE_BANDS.map(b => {
                            const on = b === "all" ? !hasElements(sizes) : sizes.some(x => x === b);
                            return (
                                <button key={b} type="button" className={`${styles.chip} ${on ? styles.chipOn : ""}`} onClick={() => setPrefs({ sizes: toggleBand(sizes, b) })} aria-pressed={on}>
                                    {b === "all" ? t("lobby.all") : SIZE_NAMES[b]}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.sel} style={{ width: 190 }}>
                        <select value={sort} onChange={e => setPrefs({ sort: toLobbySort(e.target.value) ?? sort })} aria-label="Sort tables">
                            {SORTS.map(s => (
                                <option key={s} value={s}>
                                    {t(SORT_KEYS[s])}
                                </option>
                            ))}
                        </select>
                    </div>
                    {hasContent(treasuryAddress) ? (
                        <button type="button" role="switch" aria-checked={treasuryOnly} className={`${styles.switch} ${treasuryOnly ? styles.switchOn : ""}`} onClick={() => setPrefs({ treasuryOnly: !treasuryOnly })}>
                            <i />
                            {t("lobby.treasuryOnly")}
                        </button>
                    ) : null}
                </div>
            ) : null}

            {tab === "tournament" ? <UpcomingEvents /> : null}

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
            ) : !hasElements(active) && !hasElements(quiet) ? (
                <div className={`${styles.box} ${styles.state}`}>
                    <p style={{ color: "var(--fg)", fontWeight: 600 }}>{filterCount > 0 ? t("lobby.noMatchFilters") : t("lobby.noTablesHere")}</p>
                    {filterCount > 0 ? (
                        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>
                            {t("lobby.clearFilters")}
                        </button>
                    ) : onCreateTable ? (
                        <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={onCreateTable}>
                            {t("lobby.createTable")}
                        </button>
                    ) : null}
                </div>
            ) : (
                <section className={styles.section} aria-label={type}>
                    {active.map(row => {
                        const selected = rowSizeSelection(row, rowSizes[row.key]);
                        const view = rowView(row, selected);
                        return (
                            <div key={row.key} className={styles.levelBlock}>
                                <div className={styles.levelHead}>
                                    <b className={styles.mono}>{isCashTable(row.sample) ? lobbyStakesLabel(row.sample) : lobbyBuyInLabel(row.sample)}</b>
                                    <span className={styles.sizeChips} role="group" aria-label={t("lobby.seats")}>
                                        {row.sizes.map(sz => {
                                            const on = selected.includes(sz.size);
                                            return (
                                                <button
                                                    key={sz.size}
                                                    type="button"
                                                    className={`${styles.sizeChip} ${on ? styles.sizeChipOn : ""}`}
                                                    aria-pressed={on}
                                                    onClick={() => setPrefs({ rowSizes: { ...rowSizes, [row.key]: toggleRowSize(selected, sz.size) } })}
                                                >
                                                    {sz.inPlay > 0 ? <i className={styles.sizeDot} /> : null}
                                                    {tableSizeLabel(sz.size)}
                                                </button>
                                            );
                                        })}
                                    </span>
                                    <span className={styles.levelStats}>
                                        <span>{t("lobby.levelInPlay", { count: view.inPlay })}</span>
                                        <span className={styles.levelStat}>{t("lobby.openShort", { count: view.open })}</span>
                                    </span>
                                </div>
                                <div className={styles.row}>
                                    {view.cards.map(g => (
                                        <TableCard key={g.gameId} game={g} clubName={clubOf(g.gameId)} isTreasury={isTreasuryTable(g, treasuryAddress)} nowMs={nowMs} onOpen={setPreviewId} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {hasElements(quiet) ? (
                        <div className={styles.quiet}>
                            <span className={styles.quietLabel}>{t("lobby.quietStakes")}</span>
                            {quiet.map(row => (
                                <button key={row.key} type="button" className={styles.quietChip} onClick={() => setPreviewId(quietStakeTable(row).gameId)}>
                                    {isCashTable(row.sample) ? lobbyStakesLabel(row.sample) : lobbyBuyInLabel(row.sample)}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </section>
            )}

            {hasValue(preview) ? (
                <TablePreview
                    game={preview}
                    clubName={clubOf(preview.gameId)}
                    isCreator={isTableCreator(preview, address)}
                    nowMs={nowMs}
                    busy={isDeleting || isClosing}
                    others={occupiedTables(othersAtLevel(rawGames, preview))}
                    similar={similarOpenTable(rawGames, preview)}
                    onCreateSimilar={onCreateTable}
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
