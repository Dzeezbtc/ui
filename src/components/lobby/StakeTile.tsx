import React from "react";
import type { StakeRow } from "../../utils/lobbyLayout";
import { feltLabels, tableSizeLabel, tileTable } from "../../utils/lobbyLayout";
import { useLanguage } from "../../i18n/useLanguage";
import MiniTable from "./MiniTable";
import styles from "./Lobby.module.css";

interface StakeTileProps {
    row: StakeRow;
    /** The game as the lobby names it ("Texas Hold'em", "Sit & Go"). */
    gameName: string;
    onOpen: (key: string) => void;
}

/**
 * One stake as a tile: a picture of its busiest table with the stakes on the
 * felt and the sizes on offer under them, how many are playing and how many
 * tables. Tapping it opens the stake's panel with every table.
 */
const StakeTile: React.FC<StakeTileProps> = ({ row, gameName, onOpen }) => {
    const { t } = useLanguage();
    const table = tileTable(row);
    const title = feltLabels(table, gameName).title;
    const sizes = row.sizes.map(s => tableSizeLabel(s.size)).join(" · ");
    const tables = row.sizes.reduce((n, s) => n + s.tables.length, 0);
    return (
        <button
            type="button"
            className={`${styles.card} ${styles.tile} ${row.seated > 0 ? styles.cardLive : styles.cardEmpty}`}
            onClick={() => onOpen(row.key)}
            aria-label={`${title}, ${sizes}, ${t("lobby.tilePlaying", { count: row.seated })}`}
        >
            <div className={styles.cardTop}>
                {row.seated > 0 ? (
                    <span className={`${styles.pill} ${styles.pillGood}`}>
                        <span className={styles.dot} />
                        {t("lobby.tilePlaying", { count: row.seated })}
                    </span>
                ) : (
                    <span className={`${styles.pill} ${styles.pillCy}`}>{t("lobby.tileFirst")}</span>
                )}
                <span className={styles.seatsPill}>{t("lobby.tileTables", { count: tables })}</span>
            </div>
            <div className={styles.pic}>
                <MiniTable maxPlayers={table.maxPlayers} currentPlayers={table.currentPlayers} title={title} sub={sizes} label={`${table.currentPlayers} of ${table.maxPlayers} seats taken`} />
            </div>
        </button>
    );
};

export default StakeTile;
