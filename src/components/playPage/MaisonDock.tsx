import React from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import { useStacksInBigBlinds } from "../../context/GameSettingsContext";
import { usePlayerSeatInfo } from "../../hooks/player/usePlayerSeatInfo";
import { usePlayerData } from "../../hooks/player/usePlayerData";
import { useCardsForHandStrength } from "../../hooks/player/useCardsForHandStrength";
import { useWinnerInfo } from "../../hooks/game/useWinnerInfo";
import { isTournamentFormat } from "../../utils/gameFormatUtils";
import { bigBlindInStackUnits, formatSeatStack } from "../../utils/numberUtils";
import { hasElements, safeLength } from "../../utils/guards";
import { dockAmount, hasFreeSeat, maisonDockLine } from "../../utils/maisonDock";
import { openFirstFreeSeat } from "../../utils/freeSeat";
import { FlagshipCard } from "./Card/FlagshipCard";

/**
 * Maison 52's dock (Dzeezbtc/ui#38, layout A), as in the concept: your two
 * cards, "You", your stack and your hand, then whose turn it is. The action
 * panel sits at its right end (skins/maison.css). A full-width bar along the
 * bottom on a big screen, a column on the right of a phone held sideways, a
 * block along the bottom of an upright phone; the table never sits under it.
 *
 * Watching, it says so, whose turn it is and the street, with "Take a seat"
 * while a seat is free; between hands it names the winner. It is never an
 * empty band.
 */
export const MaisonDock: React.FC = () => {
    const { currentUserSeat } = usePlayerSeatInfo();
    const { holeCards, stackValue, isFolded } = usePlayerData(currentUserSeat);
    const strength = useCardsForHandStrength(currentUserSeat);
    const { gameFormat, gameState } = useGameStateContext();
    const { winnerInfo } = useWinnerInfo();
    const isTournament = isTournamentFormat(gameFormat);
    const showInBigBlinds = useStacksInBigBlinds(isTournament);
    const bigBlind = showInBigBlinds ? bigBlindInStackUnits(gameState?.gameOptions?.bigBlind, isTournament) : null;
    const seated = currentUserSeat > 0;
    const winner = hasElements(winnerInfo) ? { seat: winnerInfo[0].seat, amount: dockAmount(winnerInfo[0].formattedAmount, isTournament), hand: winnerInfo[0].description } : null;
    const line = maisonDockLine(currentUserSeat, gameState?.nextToAct ?? 0, gameState?.round, winner);
    const canSit = !seated && hasFreeSeat(safeLength(gameState?.players), gameState?.gameOptions?.maxPlayers);
    return (
        <div data-part="maison-dock" data-mine={line?.mine ? "true" : undefined} data-folded={isFolded ? "true" : undefined} data-watching={seated ? undefined : "true"}>
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
            {line && (
                <div data-part="maison-status" role="status" aria-live="polite">
                    <b>{line.title}</b>
                    {line.detail && <span>{line.detail}</span>}
                </div>
            )}
            {canSit && (
                <button type="button" data-part="maison-take-seat" onClick={() => openFirstFreeSeat(document)}>
                    Take a seat
                </button>
            )}
        </div>
    );
};
