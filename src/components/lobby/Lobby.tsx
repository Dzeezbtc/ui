import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    hasBalance,
    firstSectionOf,
    groupLevels,
    groupLobbySections,
    isListedTable,
    isTableCreator,
    isTreasuryTable,
    lobbyBalanceLabel,
    othersAtLevel,
    occupiedTables,
    inPlayTables,
    similarOpenTable,
    toggleBand,
    lobbyStakesLabel,
    lobbyBuyInLabel,
    tableSizeLabel,
    isCashTable,
    sectionAnchorId,
    sectionCount,
    seatedTotal,
    toLobbySort,
    totalOpenSeats,
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
const SORTS: readonly ("stakes-up" | "stakes-down" | "most-players" | "most-open")[] = ["stakes-up", "stakes-down", "most-players", "most-open"];
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
    // Stakes, sizes, sort and treasury-only are remembered between visits; search is not.
    const [prefs, setPrefs] = useLobbyPrefs({ stakes: [], sizes: [], sort: "stakes-up", treasuryOnly: hasContent(treasuryAddress) });
    const { stakes, sizes, sort, treasuryOnly } = prefs;
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

    const rawGames = useMemo(() => allGames.filter(g => isListedTable(g, nowMs)), [allGames, nowMs]);
    const clubNames = useMemo(() => Object.fromEntries(Object.entries(tableClubs).map(([id, c]) => [id, c.name])), [tableClubs]);
    const games = useMemo(
        () => filterLobbyGames(rawGames, { query, stakes, sizes, treasuryOnly, treasuryAddress, clubNames }),
        [rawGames, query, stakes, sizes, treasuryOnly, clubNames]
    );
    const sections = useMemo(() => groupLobbySections(games, sort).map(s => ({ ...s, levels: groupLevels(s.games) })), [games, sort]);
    const cashSections = useMemo(() => groupLobbySections(rawGames, "stakes-up").filter(s => s.kind === "cash"), [rawGames]);
    const preview = hasContent(previewId) ? rawGames.find(g => g.gameId === previewId) : undefined;
    const filterCount = activeFilterCount({ query, stakes, sizes });

    const clubOf = useCallback((gameId: string) => tableClubs[gameId]?.name ?? DEFAULT_CLUB_NAME, [tableClubs]);
    const jump = (kind: "cash" | "sit-and-go" | "tournament") => {
        const s = firstSectionOf(sections, kind);
        if (hasValue(s)) document.getElementById(sectionAnchorId(s.key))?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
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
                    return (
                        <section key={section.key} id={sectionAnchorId(section.key)} className={styles.section}>
                            <div className={styles.sectionHead}>
                                <div>
                                    <h2>{title}</h2>
                                    <small>{t("lobby.sectionCount", { count: section.games.length, open: totalOpenSeats(section.games) })}</small>
                                </div>
                            </div>
                            {section.levels.map(level => (
                                <div key={level.key} className={styles.levelBlock}>
                                    <div className={styles.levelHead}>
                                        <b className={styles.mono}>{isCashTable(level.lead) ? lobbyStakesLabel(level.lead) : lobbyBuyInLabel(level.lead)}</b>
                                        <span>{tableSizeLabel(level.lead.maxPlayers)}</span>
                                        <span className={styles.levelStat}>{t("lobby.levelInPlay", { count: inPlayTables(level.tables).length })}</span>
                                        <span className={styles.levelStat}>{t("lobby.openShort", { count: level.open })}</span>
                                    </div>
                                    <div className={styles.row}>
                                        {level.shown.map(g => (
                                            <TableCard key={g.gameId} game={g} clubName={clubOf(g.gameId)} isTreasury={isTreasuryTable(g, treasuryAddress)} nowMs={nowMs} onOpen={setPreviewId} />
                                        ))}
                                    </div>
                                </div>
                            ))}
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
