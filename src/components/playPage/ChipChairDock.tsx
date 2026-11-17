import React from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import { useStacksInBigBlinds } from "../../context/GameSettingsContext";
import { usePlayerSeatInfo } from "../../hooks/player/usePlayerSeatInfo";
import { usePlayerData } from "../../hooks/player/usePlayerData";
import { useCardsForHandStrength } from "../../hooks/player/useCardsForHandStrength";
import { isTournamentFormat } from "../../utils/gameFormatUtils";
import { bigBlindInStackUnits, formatSeatStack } from "../../utils/numberUtils";
import { hasElements } from "../../utils/guards";
import { turnStatus } from "../../utils/turnStatus";
import { FlagshipCard } from "./Card/FlagshipCard";
import { TimeBankClock } from "./common/TimeBankClock";
import ActionsLog from "../ActionsLog";

/**
 * Chip and a Chair's "You" panel (Dzeezbtc/ui#40), as in the concept: your
 * seat's tile, "You", your stack, the time bank as a goofy alarm clock, your
 * big cards, your hand and whose turn it is, then "This hand". On a big screen
 * and a phone held sideways it heads the column on the right (the action panel
 * sits at the column's foot); on an upright phone it is the blue bar over the
 * bet buttons, and your cards stay at your seat (skins/chipchair.css).
 */
export const ChipChairDock: React.FC<{ tableId: string | undefined }> = ({ tableId }) => {
    const { currentUserSeat } = usePlayerSeatInfo();
    const { holeCards, stackValue, isFolded } = usePlayerData(currentUserSeat);
    const strength = useCardsForHandStrength(currentUserSeat);
    const { gameFormat, gameState } = useGameStateContext();
    const isTournament = isTournamentFormat(gameFormat);
    const showInBigBlinds = useStacksInBigBlinds(isTournament);
    const bigBlind = showInBigBlinds ? bigBlindInStackUnits(gameState?.gameOptions?.bigBlind, isTournament) : null;
    const seated = currentUserSeat > 0;
    const status = turnStatus(gameState?.nextToAct ?? 0, currentUserSeat);
    return (
        <aside data-part="cc-dock" data-mine={status?.mine ? "true" : undefined} data-folded={isFolded ? "true" : undefined} data-seated={seated ? "true" : undefined}>
            <div data-part="cc-you">
                {seated && (
                    <div className="cc-you-row">
                        <span className="cc-tile">{currentUserSeat}</span>
                        <span className="cc-you-name">You</span>
                        <b className="cc-you-stack">{formatSeatStack(stackValue, isTournament, bigBlind)}</b>
                    </div>
                )}
                {seated && <TimeBankClock tableId={tableId} seat={currentUserSeat} />}
                {seated && hasElements(holeCards) && (
                    <div data-part="cc-hero-cards">
                        {holeCards.map((card, i) => (
                            <FlagshipCard key={`${i}-${card}`} code={card} className="cc-hero-card" />
                        ))}
                    </div>
                )}
                {strength && <span className="cc-strength">{strength.descr}</span>}
                {status && (
                    <span className="cc-status" role="status" aria-live="polite">
                        <b>{status.title}</b>
                        {status.detail && <span> {status.detail}</span>}
                    </span>
                )}
            </div>
            <div data-part="cc-log">
                <h3>This hand</h3>
                <ActionsLog />
            </div>
        </aside>
    );
};
