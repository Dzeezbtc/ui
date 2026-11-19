import React from "react";
import { isTournamentFormat, formatTableGameDisplay, toGameVariant, formatGameFormatDisplay } from "../../utils/gameFormatUtils";
import { displayGameFormat } from "../../utils/createGameType";
import { isInPlay, lobbyBuyInLabel, lobbyScheduleLabel, lobbyStakesLabel, openSeats, tableSizeLabel, type StakeLevel } from "../../utils/lobbyLayout";
import { hasContent } from "../../utils/guards";
import { useLanguage } from "../../i18n/useLanguage";
import MiniTable from "./MiniTable";
import styles from "./Lobby.module.css";

interface TableCardProps {
    level: StakeLevel;
    clubName: string;
    isTreasury: boolean;
    nowMs: number;
    onOpen: (gameId: string) => void;
}

/**
 * TableCard — one stake level in the lobby. It shows the level's lead table
 * (the busiest one with a free seat) as a small picture of the felt, with the
 * stakes as the title, the game and size, the club, and how many seats are
 * free. "+N more" means more tables at the same stakes; they are listed in the
 * preview that opens on tap.
 */
const TableCard: React.FC<TableCardProps> = ({ level, clubName, isTreasury, nowMs, onOpen }) => {
    const { t } = useLanguage();
    const game = level.lead;
    const tournament = isTournamentFormat(game.gameFormat);
    const open = openSeats(game);
    const schedule = lobbyScheduleLabel(game, nowMs);
    const more = level.tables.length - 1;
    const gameLabel = tournament
        ? displayGameFormat(game.gameFormat, game.scheduledStartTime, formatGameFormatDisplay)
        : formatTableGameDisplay(toGameVariant(game.gameVariant), game.bettingLimit);
    const title = tournament ? lobbyBuyInLabel(game) : lobbyStakesLabel(game);
    return (
        <button
            type="button"
            className={`${styles.card} ${isInPlay(game) ? styles.cardLive : ""}`}
            onClick={() => onOpen(game.gameId)}
            aria-label={`${title} ${gameLabel}, ${game.currentPlayers} of ${game.maxPlayers} seats taken${more > 0 ? `, ${more} more tables at this level` : ""}`}
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
                    {more > 0 ? <span className={styles.more}>{t("lobby.moreAtStake", { count: more })}</span> : null}
                </div>
            </div>
        </button>
    );
};

export default TableCard;
