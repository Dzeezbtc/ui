import React from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import { isTournamentFormat, formatTableGameDisplay, toGameVariant, formatGameFormatDisplay } from "../../utils/gameFormatUtils";
import { displayGameFormat } from "../../utils/createGameType";
import { feltLabels, isInPlay, lobbyScheduleLabel } from "../../utils/lobbyLayout";
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
 * TableCard: one table as a small picture of the felt. The stakes (or buy-in)
 * and the game are written on the felt; one line above the table says In play
 * / Empty table / when it starts, and the seats taken ("3/9"). Nothing below
 * the table. Tapping opens the preview.
 */
const TableCard: React.FC<TableCardProps> = ({ game, clubName, isTreasury, nowMs, onOpen }) => {
    const { t } = useLanguage();
    const tournament = isTournamentFormat(game.gameFormat);
    const schedule = lobbyScheduleLabel(game, nowMs);
    const gameName = tournament
        ? displayGameFormat(game.gameFormat, game.scheduledStartTime, formatGameFormatDisplay)
        : formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit);
    const felt = feltLabels(game, gameName);
    const full = game.currentPlayers >= game.maxPlayers;
    return (
        <button
            type="button"
            className={`${styles.card} ${isInPlay(game) ? styles.cardLive : ""} ${game.currentPlayers === 0 ? styles.cardEmpty : ""}`}
            onClick={() => onOpen(game.gameId)}
            aria-label={`${felt.title} ${felt.sub}, ${clubName}, ${game.currentPlayers} of ${game.maxPlayers} seats taken`}
        >
            <div className={styles.cardTop}>
                {isInPlay(game) ? (
                    <span className={`${styles.pill} ${styles.pillGood}`}>
                        <span className={styles.dot} />
                        {t("lobby.inPlay")}
                    </span>
                ) : schedule ? (
                    <span className={`${styles.pill} ${styles.pillCy}`} data-testid="scheduled-start-label">
                        {schedule}
                    </span>
                ) : game.currentPlayers === 0 ? (
                    <span className={`${styles.pill} ${styles.pillCy}`}>{t("lobby.emptyTable")}</span>
                ) : isTreasury ? (
                    <span className={`${styles.pill} ${styles.pillVi}`}>{t("lobby.treasury")}</span>
                ) : (
                    <span />
                )}
                <span className={`${styles.seatsPill} ${full ? styles.seatsFull : ""}`}>
                    {game.currentPlayers}/{game.maxPlayers}
                </span>
            </div>
            <div className={styles.pic}>
                <MiniTable maxPlayers={game.maxPlayers} currentPlayers={game.currentPlayers} title={felt.title} sub={felt.sub} label={`${game.currentPlayers} of ${game.maxPlayers} seats taken`} />
            </div>
        </button>
    );
};

export default TableCard;
