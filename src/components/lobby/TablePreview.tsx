import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import type { GameWithFormat } from "../../utils/convertUtils";
import { isCashFormat, isTournamentFormat, formatTableGameDisplay, toGameVariant, formatGameFormatDisplay } from "../../utils/gameFormatUtils";
import { displayGameFormat } from "../../utils/createGameType";
import { truncateMiddle } from "../../utils/stringUtils";
import { copyToClipboard } from "../../utils/clipboard";
import { lobbyBuyInLabel, lobbyPhase, lobbyScheduleLabel, lobbyStakesLabel, openSeats, tableSizeLabel } from "../../utils/lobbyLayout";
import { useLanguage } from "../../i18n/useLanguage";
import { hasContent, hasElements } from "../../utils/guards";
import MiniTable from "./MiniTable";
import styles from "./Lobby.module.css";

interface TablePreviewProps {
    game: GameWithFormat;
    clubName: string;
    isCreator: boolean;
    nowMs: number;
    busy: boolean;
    /** The other tables at the same stake level, shown under the details. */
    others: GameWithFormat[];
    onPick: (gameId: string) => void;
    onClose: () => void;
    onDelete: (gameId: string) => void;
    onForceClose: (game: GameWithFormat) => void;
}

/**
 * TablePreview — the panel that opens when a lobby table is tapped: a bigger
 * picture of the table, the stakes, buy-in, seats, club and table ID, and the
 * Join button (opens the table in a new tab, as the lobby always has). The
 * table's creator also gets Delete (empty table) or Close and refund (cash
 * table with players); tournaments can't be force-closed (poker-vm#2173).
 */
const TablePreview: React.FC<TablePreviewProps> = ({ game, clubName, isCreator, nowMs, busy, others, onPick, onClose, onDelete, onForceClose }) => {
    const { t } = useLanguage();
    const tournament = isTournamentFormat(game.gameFormat);
    const open = openSeats(game);
    const cancelled = lobbyPhase(game, nowMs) === "cancelled";
    const schedule = lobbyScheduleLabel(game, nowMs);
    const name = game.name ?? truncateMiddle(game.gameId, 4, 4);
    const gameLabel = tournament
        ? displayGameFormat(game.gameFormat, game.scheduledStartTime, formatGameFormatDisplay)
        : formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Rendered on <body> so the panel sits above the site header (the lobby is its own stacking layer).
    return createPortal(
        <div className={styles.portal}>
            <div className={styles.scrim} onClick={onClose} />
            <aside className={`${styles.sheet} lobby-sheet`} role="dialog" aria-modal="true" aria-label={name}>
                <div className={styles.sheetHead}>
                    <div>
                        <div className={styles.eyebrow}>
                            {gameLabel} · {tableSizeLabel(game.maxPlayers)}
                        </div>
                        <div className={styles.sheetTitle}>
                            <span className={styles.gradText}>{tournament ? lobbyBuyInLabel(game) : lobbyStakesLabel(game)}</span>
                            {hasContent(game.name) ? ` ${game.name}` : ""}
                        </div>
                    </div>
                    <button type="button" className={styles.close} onClick={onClose} aria-label={t("table.close")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
                <div className={styles.sheetBody}>
                    <div className={styles.previewPic}>
                        <MiniTable large maxPlayers={game.maxPlayers} currentPlayers={game.currentPlayers} label={`${game.currentPlayers} of ${game.maxPlayers} seats taken`} />
                    </div>
                    {schedule ? <div className={styles.schedule}>{schedule}</div> : null}
                    <div className={styles.kv}>
                        <div>
                            <small>{tournament ? t("lobby.buyIn") : t("lobby.stakes")}</small>
                            <b>{tournament ? lobbyBuyInLabel(game) : lobbyStakesLabel(game)}</b>
                        </div>
                        {tournament ? (
                            <div>
                                <small>{t("lobby.format")}</small>
                                <b>{gameLabel}</b>
                            </div>
                        ) : (
                            <div>
                                <small>{t("lobby.buyIn")}</small>
                                <b>{lobbyBuyInLabel(game)}</b>
                            </div>
                        )}
                        <div>
                            <small>{t("lobby.players")}</small>
                            <b>
                                {game.currentPlayers} / {game.maxPlayers}
                            </b>
                        </div>
                        <div>
                            <small>{t("lobby.seats")}</small>
                            <b style={{ color: open > 0 ? "var(--cy)" : "var(--gold)" }}>{open > 0 ? t("lobby.seatsOpen", { count: open }) : t("lobby.full")}</b>
                        </div>
                        <div>
                            <small>{t("lobby.club")}</small>
                            <b style={{ fontFamily: "inherit" }}>{clubName}</b>
                        </div>
                        <div>
                            <small>{t("lobby.tableId")}</small>
                            <b title={game.gameId}>{truncateMiddle(game.gameId, 6, 4)}</b>
                            <button type="button" className={styles.linkBtn} onClick={() => copyToClipboard(game.gameId, t("lobby.idCopied"))}>
                                {t("lobby.copy")}
                            </button>
                        </div>
                    </div>
                    {hasElements(others) ? (
                        <div className={styles.levelList}>
                            <div className={styles.eyebrow}>{t("lobby.moreTables", { count: others.length })}</div>
                            {others.map(o => (
                                <button key={o.gameId} type="button" className={styles.levelRow} onClick={() => onPick(o.gameId)}>
                                    <span className={styles.levelThumb}>
                                        <MiniTable maxPlayers={o.maxPlayers} currentPlayers={o.currentPlayers} label={`${o.currentPlayers} of ${o.maxPlayers} seats taken`} />
                                    </span>
                                    <span className={styles.levelName}>{o.name ?? truncateMiddle(o.gameId, 4, 4)}</span>
                                    <span className={`${styles.mono} ${styles.muted}`}>
                                        {o.currentPlayers}/{o.maxPlayers}
                                    </span>
                                    <span className={openSeats(o) > 0 ? styles.open : `${styles.open} ${styles.openFull}`}>
                                        {openSeats(o) > 0 ? t("lobby.openShort", { count: openSeats(o) }) : t("lobby.full")}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                    {isCreator ? (
                        <div className={styles.ownerTools}>
                            <span className={styles.muted} style={{ fontSize: 13, marginRight: "auto" }}>
                                {t("lobby.yourTable")}
                            </span>
                            {game.currentPlayers === 0 ? (
                                <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`} disabled={busy} onClick={() => onDelete(game.gameId)}>
                                    {t("lobby.deleteTable")}
                                </button>
                            ) : isCashFormat(game.gameFormat) ? (
                                <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`} disabled={busy} onClick={() => onForceClose(game)}>
                                    {t("lobby.closeRefund")}
                                </button>
                            ) : (
                                <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} disabled title={t("lobby.noForceClose")}>
                                    {t("lobby.closeRefund")}
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
                <div className={styles.sheetFoot}>
                    <button type="button" className={`${styles.btn} ${styles.btnXl} ${styles.btnGhost}`} onClick={onClose}>
                        {t("table.close")}
                    </button>
                    <a
                        href={`/table/${game.gameId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.btn} ${styles.btnXl} ${open > 0 && !cancelled ? styles.btnGrad : styles.btnGhost}`}
                        aria-label={`Join ${gameLabel} table with ${game.currentPlayers} of ${game.maxPlayers} players`}
                    >
                        {cancelled ? t("lobby.cancelled") : open > 0 ? t("lobby.joinTable") : t("lobby.full")}
                    </a>
                </div>
            </aside>
        </div>,
        document.body
    );
};

export default TablePreview;
