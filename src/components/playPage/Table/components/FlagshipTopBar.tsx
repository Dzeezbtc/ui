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
    /** "$10 / $20", already formatted; shown after the game. */
    stakes: string;
    /** The shield, radio and settings buttons, shown under the balance. */
    tools: React.ReactNode;
}

/**
 * The Block52 Flagship's top bar (Dzeezbtc/ui#31): back to the lobby and the
 * game with its stakes on the left, the multi-table pills in the middle, the
 * balance on the right with the shield, radio and settings cog just under it.
 */
export const FlagshipTopBar: React.FC<FlagshipTopBarProps> = ({
    gameFormat,
    gameVariant,
    gameOptions,
    isBalanceLoading,
    balanceFormatted,
    handleLobbyClick,
    fetchAccountBalance,
    stakes,
    tools
}) => {
    const { t } = useLanguage();
    const headerSlot = useTableHeaderSlot();
    const format =
        hasValue(gameFormat) && hasValue(gameOptions) ? displayGameFormat(gameFormat, gameOptions.scheduledStartTime, formatGameFormatDisplay) : undefined;
    const game = flagshipGameTitle(format, formatTableGameDisplay(gameVariant, gameOptions?.bettingLimit), "");

    return (
        <div data-part="fs-topbar" className="fs-topbar flex-shrink-0">
            <button type="button" className="fs-topbar-back" onClick={handleLobbyClick} title={t("nav.tables")} aria-label={t("nav.tables")}>
                <FaChevronLeft size={14} />
            </button>
            <span className="fs-topbar-title" data-testid="fs-game-title" title={flagshipGameTitle(undefined, game, stakes)}>
                <span className="fs-topbar-game">{game}</span>
                <span className="fs-topbar-stakes">{stakes}</span>
            </span>
            <div className="fs-topbar-slot">{headerSlot}</div>
            <div className="fs-topbar-right">
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
                <div className="fs-topbar-tools" data-part="fs-tools">
                    {tools}
                </div>
            </div>
        </div>
    );
};
