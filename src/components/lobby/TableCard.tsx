import React from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import { isTournamentFormat, formatTableGameDisplay, toGameVariant, formatGameFormatDisplay } from "../../utils/gameFormatUtils";
import { displayGameFormat } from "../../utils/createGameType";
import { truncateMiddle } from "../../utils/stringUtils";
import { lobbyBuyInLabel, lobbyPhase, lobbyScheduleLabel, lobbyStakesLabel, openSeats, tableSizeLabel } from "../../utils/lobbyLayout";
import { useLanguage } from "../../i18n/useLanguage";
import MiniTable from "./MiniTable";
import styles from "./Lobby.module.css";

interface TableCardProps {
    game: GameWithFormat;
    clubName: string;
    isTreasury: boolean;
    nowMs: number;
    onOpen: (gameId: string) => void;
}

/**
 * TableCard — one table in the lobby: a picture of the felt with taken and
 * open seats, the stakes in big type, the game and club, and how many seats
 * are free. Tapping it opens the table preview.
 */
const TableCard: React.FC<TableCardProps> = ({ game, clubName, isTreasury, nowMs, onOpen }) => {
    const { t } = useLanguage();
    const tournament = isTournamentFormat(game.gameFormat);
    const open = openSeats(game);
    const cancelled = lobbyPhase(game, nowMs) === "cancelled";
    const schedule = lobbyScheduleLabel(game, nowMs);
    const name = game.name ?? truncateMiddle(game.gameId, 4, 4);
    const gameLabel = tournament
        ? displayGameFormat(game.gameFormat, game.scheduledStartTime, formatGameFormatDisplay)
        : formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit);
    return (
        <button type="button" className={styles.card} onClick={() => onOpen(game.gameId)} aria-label={`${name}, ${gameLabel}, ${game.currentPlayers} of ${game.maxPlayers} seats taken`}>
            <div className={styles.pic}>
                <MiniTable maxPlayers={game.maxPlayers} currentPlayers={game.currentPlayers} label={`${game.currentPlayers} of ${game.maxPlayers} seats taken`} />
            </div>
            <div className={styles.badges}>
                {isTreasury ? <span className={`${styles.pill} ${styles.pillVi}`}>{t("lobby.treasury")}</span> : <span />}
                {schedule ? <span className={`${styles.pill} ${styles.pillCy}`}>{t("lobby.scheduled")}</span> : null}
            </div>
            <div className={styles.body}>
                <div className={styles.nameRow}>
                    <h3 className={styles.name} title={game.gameId}>
                        {name}
                    </h3>
                    <span className={styles.game} data-testid="lobby-game">
                        {tournament ? gameLabel : `${gameLabel} · ${tableSizeLabel(game.maxPlayers)}`}
                    </span>
                </div>
                <div className={`${styles.stake} ${styles.mono}`}>{tournament ? lobbyBuyInLabel(game) : lobbyStakesLabel(game)}</div>
                <div className={styles.club}>
                    <i className={styles.clubMark} />
                    {clubName}
                </div>
                {schedule ? (
                    <div className={styles.schedule} data-testid="scheduled-start-label">
                        {schedule}
                    </div>
                ) : null}
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <small>{t("lobby.players")}</small>
                        <b>
                            {game.currentPlayers}/{game.maxPlayers}
                        </b>
                    </div>
                    <div className={styles.stat}>
                        <small>{t("lobby.buyIn")}</small>
                        <b title={lobbyBuyInLabel(game)}>{lobbyBuyInLabel(game)}</b>
                    </div>
                </div>
                <div className={styles.foot}>
                    {cancelled ? (
                        <span className={`${styles.open} ${styles.openCancelled}`}>{t("lobby.cancelled")}</span>
                    ) : open > 0 ? (
                        <span className={styles.open}>
                            <span className={styles.dot} />
                            <span className={styles.long}>{t("lobby.seatsOpen", { count: open })}</span>
                            <span className={styles.short}>{t("lobby.openShort", { count: open })}</span>
                        </span>
                    ) : (
                        <span className={`${styles.open} ${styles.openFull}`}>{t("lobby.full")}</span>
                    )}
                    <span className={`${styles.btn} ${styles.btnSm} ${open > 0 && !cancelled ? styles.btnGrad : styles.btnGhost}`}>{t("lobby.joinTable")}</span>
                </div>
            </div>
        </button>
    );
};

export default TableCard;
