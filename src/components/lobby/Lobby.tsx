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
    inviteOnlyTables,
    filterLobbyGames,
    groupStakeRows,
    stakeLevels,
    rowSizeSelection,
    toggleRowSize,
    isListedTable,
    isTableCreator,
    isTreasuryTable,
    othersAtLevel,
    occupiedTables,
    similarOpenTable,
    toggleBand,
    seatedTotal,
    type SizeBand,
    type StakeBand,
    type ScreenBox
} from "../../utils/lobbyLayout";
import {
    LOBBY_TABS,
    shortGameType,
    activeGameType,
    activeTabs,
    gameTypesIn,
    gamesFor,
    isLobbyTab,
    tabCounts,
    toggleTab,
    type GameTypeChip,
    type LobbyTab
} from "../../utils/lobbyTabs";
import { hasContent, hasElements, hasValue, isEmpty } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import type { TranslationKey } from "../../i18n";
import DeleteTableModal from "../modals/DeleteTableModal";
import ForceCloseTableModal from "../modals/ForceCloseTableModal";
import UpcomingEvents from "./UpcomingEvents";
import LobbySide from "./LobbySide";
import LevelCard from "./LevelCard";
import LobbyFooter from "./LobbyFooter";
import StakeTile, { ReadyTile } from "./StakeTile";
import StakePanel from "./StakePanel";
import TablePreview from "./TablePreview";
import { useWelcomeRedirect } from "../../hooks/wallet/useWelcomeRedirect";
import styles from "./Lobby.module.css";

interface LobbyProps {
    address: string | null;
    /** Opens Create table; a ready tile passes its level's stakes so the form starts on them. */
    onCreateTable?: (stakes?: { smallBlind: number; bigBlind: number }) => void;
}

const STAKE_NAMES: Record<StakeBand, string> = { all: "", micro: "Micro", low: "Low", mid: "Mid", high: "High" };
const SIZE_NAMES: Record<SizeBand, string> = { all: "", "heads-up": "Heads-up", "6-max": "6-max", "9-max": "9-max" };
const LEVEL_KEYS: Record<"micro" | "low" | "mid" | "high" | "buy-in", TranslationKey> = {
    micro: "lobby.levelMicro",
    low: "lobby.levelLow",
    mid: "lobby.levelMid",
    high: "lobby.levelHigh",
    "buy-in": "lobby.levelBuyIns"
};
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
    // A first-time visitor with no wallet goes to the setup first (once).
    useWelcomeRedirect(true);
    const { t } = useLanguage();
    const tableClubs = useTableClubs();
    const { games: allGames, isLoading, error, refetch } = useFindGames();
    const { deleteGame, isDeleting } = useDeleteGame();
    const { forceCloseGame, isClosing } = useForceCloseGame();

    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    // Stakes, sizes, treasury-only, tab and game type are remembered between visits; search is not.
    const [prefs, setPrefs] = useLobbyPrefs({
        stakes: [],
        sizes: [],
        sort: "most-players",
        treasuryOnly: hasContent(treasuryAddress),
        inviteOnly: false,
        hideFull: false,
        hideEmpty: false,
        rowSizes: {},
        tab: "cash",
        types: {}
    });
    const { stakes, sizes, treasuryOnly, inviteOnly, hideFull, hideEmpty, rowSizes } = prefs;
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
    const inviteTables = useMemo(() => inviteOnlyTables(tableClubs), [tableClubs]);
    const clubNames = useMemo(() => Object.fromEntries(Object.entries(tableClubs).map(([id, c]) => [id, c.name])), [tableClubs]);
    const games = useMemo(
        () =>
            filterLobbyGames(rawGames, {
                query,
                stakes,
                sizes,
                treasuryOnly,
                treasuryAddress,
                clubNames,
                hideFull,
                hideEmpty,
                showInviteOnly: inviteOnly,
                inviteOnly: inviteTables
            }),
        [rawGames, query, stakes, sizes, treasuryOnly, clubNames, hideFull, hideEmpty, inviteOnly, inviteTables]
    );
    const counts = useMemo(() => tabCounts(rawGames), [rawGames]);
    // The areas switched on (Cash games, Sit & Go, Tournaments); several stack one under another.
    const tabs = activeTabs(counts, prefs.tabs, isLobbyTab(prefs.tab) ? prefs.tab : undefined);
    const multi = tabs.length > 1;
    // Each area: its game-type chips, the chosen type, and that game's stakes as tiles grouped by level.
    const sections = useMemo(
        () =>
            tabs.map(tb => {
                const chips = gameTypesIn(rawGames, tb);
                const type = activeGameType(chips, prefs.types[tb]);
                return { tab: tb, chips, type, rows: groupStakeRows(gamesFor(games, tb, type)) };
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tabs.join(","), rawGames, games, prefs.types]
    );
    const [openStake, setOpenStake] = useState<string | null>(null);
    const [openFrom, setOpenFrom] = useState<ScreenBox | null>(null);
    const openSection = sections.find(sec => sec.rows.some(r => r.key === openStake));
    const openRow = openSection?.rows.find(r => r.key === openStake);
    const preview = hasContent(previewId) ? rawGames.find(g => g.gameId === previewId) : undefined;
    const filterCount = activeFilterCount({ query, stakes, sizes, hideFull, hideEmpty, inviteOnly });

    const clubOf = useCallback((gameId: string) => tableClubs[gameId]?.name ?? DEFAULT_CLUB_NAME, [tableClubs]);
    const clearFilters = () => {
        setQuery("");
        setPrefs({ stakes: [], sizes: [], inviteOnly: false, hideFull: false, hideEmpty: false });
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

            {/* One control bar on desktop (areas, game types, tools); stacked rows on phones. */}
            <div className={styles.controlBar}>
                <div className={styles.tabBar}>
                    <span className={styles.liveLine}>
                        <span className={styles.dot} />
                        {t("lobby.liveLine", { tables: rawGames.length, players: seatedTotal(rawGames) })}
                    </span>
                    <div className={styles.tabs} role="group" aria-label={t("lobby.areas")}>
                        {LOBBY_TABS.map(tb => (
                            <button
                                key={tb}
                                type="button"
                                aria-pressed={tabs.includes(tb)}
                                className={tabs.includes(tb) ? styles.tabOn : styles.tab}
                                onClick={() => setPrefs({ tabs: toggleTab(tabs, tb) })}
                            >
                                {t(TAB_KEYS[tb])}
                                <i>{counts[tb]}</i>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Game types of the open tab, with search and filters at the end of the row. */}
                <div className={styles.typeRow}>
                    {multi ? (
                        <span />
                    ) : (
                        <TypeChips
                            chips={sections[0].chips}
                            type={sections[0].type}
                            onPick={c => setPrefs({ types: { ...prefs.types, [sections[0].tab]: c } })}
                        />
                    )}
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
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => setSearchOpen(true)}
                                aria-label={t("lobby.search")}
                                title={t("lobby.search")}
                            >
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
                            <button
                                type="button"
                                className={`${styles.createBtn} ${styles.hidePhone}`}
                                onClick={() => onCreateTable?.()}
                                aria-label={t("lobby.createTable")}
                                title={t("lobby.createTable")}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                <span>{t("lobby.createTable")}</span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {filtersOpen ? (
                <div className={styles.filters}>
                    <div className={styles.chips}>
                        <span className={styles.chipLabel}>{t("lobby.stakes")}</span>
                        {STAKE_BANDS.map(b => {
                            const on = b === "all" ? !hasElements(stakes) : stakes.some(x => x === b);
                            return (
                                <button
                                    key={b}
                                    type="button"
                                    className={`${styles.chip} ${on ? styles.chipOn : ""}`}
                                    onClick={() => setPrefs({ stakes: toggleBand(stakes, b) })}
                                    aria-pressed={on}
                                >
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
                                <button
                                    key={b}
                                    type="button"
                                    className={`${styles.chip} ${on ? styles.chipOn : ""}`}
                                    onClick={() => setPrefs({ sizes: toggleBand(sizes, b) })}
                                    aria-pressed={on}
                                >
                                    {b === "all" ? t("lobby.all") : SIZE_NAMES[b]}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.chips}>
                        <span className={styles.chipLabel}>{t("lobby.showLabel")}</span>
                        <button
                            type="button"
                            className={`${styles.chip} ${inviteOnly ? styles.chipOn : ""}`}
                            onClick={() => setPrefs({ inviteOnly: !inviteOnly })}
                            aria-pressed={inviteOnly}
                        >
                            {t("lobby.inviteOnly")}
                        </button>
                        <button
                            type="button"
                            className={`${styles.chip} ${hideFull ? styles.chipOn : ""}`}
                            onClick={() => setPrefs({ hideFull: !hideFull })}
                            aria-pressed={hideFull}
                        >
                            {t("lobby.hideFull")}
                        </button>
                        <button
                            type="button"
                            className={`${styles.chip} ${hideEmpty ? styles.chipOn : ""}`}
                            onClick={() => setPrefs({ hideEmpty: !hideEmpty })}
                            aria-pressed={hideEmpty}
                        >
                            {t("lobby.hideEmpty")}
                        </button>
                    </div>
                    {hasContent(treasuryAddress) ? (
                        <button
                            type="button"
                            role="switch"
                            aria-checked={treasuryOnly}
                            className={`${styles.switch} ${treasuryOnly ? styles.switchOn : ""}`}
                            onClick={() => setPrefs({ treasuryOnly: !treasuryOnly })}
                        >
                            <i />
                            {t("lobby.treasuryOnly")}
                        </button>
                    ) : null}
                    {onCreateTable ? (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost} ${styles.showPhone}`}
                            onClick={() => onCreateTable?.()}
                        >
                            {t("lobby.createTable")}
                        </button>
                    ) : null}
                </div>
            ) : null}

            {/* Desktop: the areas on the left, your corner (wallet, play, recent tables, upcoming) on the right. */}
            <div className={styles.deskGrid}>
                <div className={styles.deskMain}>
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
                    ) : (
                        sections.map(sec => (
                            <section key={sec.tab} className={multi ? styles.area : undefined} aria-label={t(TAB_KEYS[sec.tab])}>
                                {multi ? (
                                    <div className={styles.areaHead}>
                                        <h2>{t(TAB_KEYS[sec.tab])}</h2>
                                        <TypeChips chips={sec.chips} type={sec.type} onPick={c => setPrefs({ types: { ...prefs.types, [sec.tab]: c } })} />
                                    </div>
                                ) : null}
                                {sec.tab === "tournament" ? (
                                    <div className={styles.mainUpcoming}>
                                        <UpcomingEvents />
                                    </div>
                                ) : null}
                                {!hasElements(sec.rows) ? (
                                    <div className={`${styles.box} ${styles.state}`}>
                                        <p style={{ color: "var(--fg)", fontWeight: 600 }}>
                                            {filterCount > 0 ? t("lobby.noMatchFilters") : t("lobby.noTablesHere")}
                                        </p>
                                        {filterCount > 0 ? (
                                            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={clearFilters}>
                                                {t("lobby.clearFilters")}
                                            </button>
                                        ) : onCreateTable ? (
                                            <button type="button" className={`${styles.btn} ${styles.btnGrad}`} onClick={() => onCreateTable?.()}>
                                                {t("lobby.createTable")}
                                            </button>
                                        ) : null}
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.board} aria-label={sec.type}>
                                            {stakeLevels(sec.rows, sec.tab === "cash" && !hasElements(stakes) && !hideEmpty).map(group => (
                                                <LevelCard
                                                    key={group.level}
                                                    level={group.level}
                                                    title={t(LEVEL_KEYS[group.level])}
                                                    rows={group.rows}
                                                    gameName={shortGameType(sec.type ?? "")}
                                                    onOpen={(key, from) => {
                                                        setOpenFrom(from);
                                                        setOpenStake(key);
                                                    }}
                                                    onSit={onCreateTable}
                                                />
                                            ))}
                                        </div>
                                        <div className={styles.levels} aria-label={sec.type}>
                                            {stakeLevels(sec.rows, sec.tab === "cash" && !hasElements(stakes) && !hideEmpty).map(group => (
                                                <section key={group.level} className={styles.levelGroup}>
                                                    <h3 className={styles.subHead}>{t(LEVEL_KEYS[group.level])}</h3>
                                                    <div className={styles.tiles}>
                                                        {group.rows.map(row => (
                                                            <StakeTile
                                                                key={row.key}
                                                                row={row}
                                                                gameName={shortGameType(sec.type ?? "")}
                                                                onOpen={(key, from) => {
                                                                    setOpenFrom(from);
                                                                    setOpenStake(key);
                                                                }}
                                                            />
                                                        ))}
                                                        {!hasElements(group.rows) && group.level !== "buy-in" ? (
                                                            <ReadyTile level={group.level} onSit={onCreateTable} />
                                                        ) : null}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </section>
                        ))
                    )}
                </div>
                <LobbySide games={rawGames} />
            </div>

            <LobbyFooter />

            {hasValue(openRow) ? (
                <StakePanel
                    row={openRow}
                    from={openFrom}
                    gameName={shortGameType(openSection?.type ?? "")}
                    selected={rowSizeSelection(openRow, rowSizes[openRow.key])}
                    onToggleSize={size =>
                        setPrefs({ rowSizes: { ...rowSizes, [openRow.key]: toggleRowSize(rowSizeSelection(openRow, rowSizes[openRow.key]), size) } })
                    }
                    clubOf={clubOf}
                    isTreasury={gameId => rawGames.some(g => g.gameId === gameId && isTreasuryTable(g, treasuryAddress))}
                    nowMs={nowMs}
                    onPick={setPreviewId}
                    onClose={() => setOpenStake(null)}
                />
            ) : null}

            {hasValue(preview) ? (
                <TablePreview
                    game={preview}
                    clubName={clubOf(preview.gameId)}
                    isCreator={isTableCreator(preview, address)}
                    nowMs={nowMs}
                    busy={isDeleting || isClosing}
                    others={occupiedTables(othersAtLevel(rawGames, preview))}
                    similar={similarOpenTable(rawGames, preview)}
                    onCreateSimilar={() => onCreateTable?.()}
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

/** A tab's game-type chips ("Texas Hold'em 13", "PLO 5"); short names on phones. */
const TypeChips: React.FC<{ chips: GameTypeChip[]; type: string | undefined; onPick: (type: string) => void }> = ({ chips, type, onPick }) => {
    const { t } = useLanguage();
    return (
        <div className={styles.types} role="group" aria-label={t("lobby.game")}>
            {chips.map(c => (
                <button
                    key={c.type}
                    type="button"
                    aria-pressed={c.type === type}
                    className={c.type === type ? styles.typeOn : styles.type}
                    onClick={() => onPick(c.type)}
                >
                    <span>{shortGameType(c.type)}</span>
                    <i>{c.tables}</i>
                </button>
            ))}
        </div>
    );
};

export default Lobby;
