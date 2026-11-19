import React from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import { isTournamentFormat, formatTableGameDisplay, toGameVariant, formatGameFormatDisplay } from "../../utils/gameFormatUtils";
import { displayGameFormat } from "../../utils/createGameType";
import { isInPlay, lobbyBuyInLabel, lobbyScheduleLabel, lobbyStakesLabel, openSeats, tableSizeLabel } from "../../utils/lobbyLayout";
import { hasContent } from "../../utils/guards";
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
 * TableCard — one table in a stake level's row: a small picture of the felt
 * with taken and open seats, the stakes as the title, the game and size, the
 * club, and seats open or Full. An empty table (the one spare a row keeps so
 * there is always somewhere to start) says so. Tapping opens the preview.
 */
const TableCard: React.FC<TableCardProps> = ({ game, clubName, isTreasury, nowMs, onOpen }) => {
    const { t } = useLanguage();
    const tournament = isTournamentFormat(game.gameFormat);
    const open = openSeats(game);
    const schedule = lobbyScheduleLabel(game, nowMs);
    const gameLabel = tournament
        ? displayGameFormat(game.gameFormat, game.scheduledStartTime, formatGameFormatDisplay)
        : formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit);
    const title = tournament ? lobbyBuyInLabel(game) : lobbyStakesLabel(game);
    return (
        <button
            type="button"
            className={`${styles.card} ${isInPlay(game) ? styles.cardLive : ""} ${game.currentPlayers === 0 ? styles.cardEmpty : ""}`}
            onClick={() => onOpen(game.gameId)}
            aria-label={`${title} ${gameLabel}, ${game.currentPlayers} of ${game.maxPlayers} seats taken`}
        >
            <div className={styles.pic}>
                <MiniTable maxPlayers={game.maxPlayers} currentPlayers={game.currentPlayers} label={`${game.currentPlayers} of ${game.maxPlayers} seats taken`} />
            </div>
            <div className={styles.badges}>
                {isInPlay(game) ? (
                    <span className={`${styles.pill} ${styles.pillGood}`}>
                        <span className={styles.dot} />
                        {t("lobby.inPlay")}
                    </span>
                ) : game.currentPlayers === 0 ? (
                    <span className={`${styles.pill} ${styles.pillCy}`}>{t("lobby.emptyTable")}</span>
                ) : isTreasury ? (
                    <span className={`${styles.pill} ${styles.pillVi}`}>{t("lobby.treasury")}</span>
                ) : (
                    <span />
                )}
                {schedule ? <span className={`${styles.pill} ${styles.pillCy}`}>{t("lobby.scheduled")}</span> : null}
            </div>
            <div className={styles.body}>
                <div className={`${styles.stake} ${styles.mono}`}>{title}</div>
                <div className={styles.game} data-testid="lobby-game">
                    {gameLabel} · {tableSizeLabel(game.maxPlayers)}
                </div>
                <div className={styles.club}>
                    <i className={styles.clubMark} />
                    {hasContent(game.name) ? `${game.name} · ${clubName}` : clubName}
                </div>
                {schedule ? (
                    <div className={styles.schedule} data-testid="scheduled-start-label">
                        {schedule}
                    </div>
                ) : null}
                <div className={styles.foot}>
                    {open > 0 ? (
                        <span className={styles.open}>
                            <span className={styles.dot} />
                            {t("lobby.openShort", { count: open })}
                        </span>
                    ) : (
                        <span className={`${styles.open} ${styles.openFull}`}>{t("lobby.full")}</span>
                    )}
                    <span className={`${styles.mono} ${styles.muted}`} style={{ fontSize: 12.5 }}>
                        {game.currentPlayers}/{game.maxPlayers}
                    </span>
                </div>
            </div>
        </button>
    );
};

export default TableCard;
