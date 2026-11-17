import React from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import { useStacksInBigBlinds } from "../../context/GameSettingsContext";
import { usePlayerSeatInfo } from "../../hooks/player/usePlayerSeatInfo";
import { usePlayerData } from "../../hooks/player/usePlayerData";
import { useCardsForHandStrength } from "../../hooks/player/useCardsForHandStrength";
import { isTournamentFormat } from "../../utils/gameFormatUtils";
import { bigBlindInStackUnits, formatSeatStack } from "../../utils/numberUtils";
import { hasElements } from "../../utils/guards";
import { turnStatus, whoseTurn } from "../../utils/turnStatus";
import { FlagshipCard } from "./Card/FlagshipCard";

/**
 * Maison 52's dock (Dzeezbtc/ui#38, layout A), as in the concept: your two
 * cards, "You", your stack and your hand, then whose turn it is. The action
 * panel sits at its right end (skins/maison.css). A full-width bar along the
 * bottom on a big screen, a column on the right of a phone held sideways, a
 * block along the bottom of an upright phone; the table never sits under it.
 */
export const MaisonDock: React.FC = () => {
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
        <div data-part="maison-dock" data-mine={status?.mine ? "true" : undefined} data-folded={isFolded ? "true" : undefined}>
            {seated && hasElements(holeCards) && (
                <div data-part="maison-hero-cards">
                    {holeCards.map((card, i) => (
                        <FlagshipCard key={`${i}-${card}`} code={card} className="maison-hero-card" />
                    ))}
                </div>
            )}
            {seated && (
                <div data-part="maison-you">
                    <span className="maison-eyebrow">You</span>
                    <b>{formatSeatStack(stackValue, isTournament, bigBlind)}</b>
                    {strength && <i>{strength.descr}</i>}
                </div>
            )}
            {status && (
                <div data-part="maison-status" role="status" aria-live="polite">
                    {status.mine ? (
                        <b>Your turn</b>
                    ) : (
                        <>
                            <b>{status.title}</b> <span>— {whoseTurn(gameState?.nextToAct ?? 0)}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
