import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { GameFormat, GameOptionsDTO, GameVariant } from "@block52/poker-vm-sdk";
import { useTableHeaderSlot } from "../../../../context/TableHeaderSlotContext";
import { useLanguage } from "../../../../i18n/useLanguage";
import { displayGameFormat } from "../../../../utils/createGameType";
import { formatGameFormatDisplay, formatTableGameDisplay } from "../../../../utils/gameFormatUtils";
import { hasValue } from "../../../../utils/guards";
import { flagshipGameTitle } from "../../../../utils/tableSettingsMenu";

interface FlagshipTopBarProps {
    gameFormat: GameFormat | null;
    gameVariant: GameVariant | undefined;
    gameOptions: GameOptionsDTO | null | undefined;
    isBalanceLoading: boolean;
    balanceFormatted: string;
    handleLobbyClick: () => void;
    fetchAccountBalance: () => void;
}

/**
 * The Block52 Flagship's top bar (Dzeezbtc/ui#31): back to the lobby and the
 * game on the left, the multi-table pills in the middle, the balance on the
 * right. Everything else lives in the settings cog under the table.
 */
export const FlagshipTopBar: React.FC<FlagshipTopBarProps> = ({
    gameFormat,
    gameVariant,
    gameOptions,
    isBalanceLoading,
    balanceFormatted,
    handleLobbyClick,
    fetchAccountBalance
}) => {
    const { t } = useLanguage();
    const headerSlot = useTableHeaderSlot();
    const format =
        hasValue(gameFormat) && hasValue(gameOptions) ? displayGameFormat(gameFormat, gameOptions.scheduledStartTime, formatGameFormatDisplay) : undefined;
    const title = flagshipGameTitle(format, formatTableGameDisplay(gameVariant, gameOptions?.bettingLimit));

    return (
        <div data-part="fs-topbar" className="fs-topbar flex-shrink-0">
            <button type="button" className="fs-topbar-back" onClick={handleLobbyClick} title={t("nav.tables")} aria-label={t("nav.tables")}>
                <FaChevronLeft size={14} />
            </button>
            <span className="fs-topbar-title" data-testid="fs-game-title">
                {title}
            </span>
            <div className="fs-topbar-slot">{headerSlot}</div>
            <button type="button" className="fs-topbar-balance" onClick={fetchAccountBalance} disabled={isBalanceLoading} title="Refresh balance">
                {isBalanceLoading ? (
                    t("table.loading")
                ) : (
                    <>
                        ${balanceFormatted}
                        <span className="fs-topbar-unit">USDC</span>
                    </>
                )}
            </button>
        </div>
    );
};
