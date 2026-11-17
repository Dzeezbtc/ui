import React from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import { useStacksInBigBlinds } from "../../context/GameSettingsContext";
import { usePlayerSeatInfo } from "../../hooks/player/usePlayerSeatInfo";
import { usePlayerData } from "../../hooks/player/usePlayerData";
import { useCardsForHandStrength } from "../../hooks/player/useCardsForHandStrength";
import { isTournamentFormat } from "../../utils/gameFormatUtils";
import { bigBlindInStackUnits, formatSeatStack } from "../../utils/numberUtils";
import { hasElements } from "../../utils/guards";
import { FlagshipCard } from "./Card/FlagshipCard";

/**
 * Bad Beat's hero dock (Dzeezbtc/ui#36): your two cards big at the bottom of
 * the screen with "You $412.50 · Pair of queens" beside them, as in the
 * concept. Your cards also stay in your seat on the table, so where you sit is
 * never in doubt. Nothing shows until you are seated with cards.
 */
export const BadBeatHeroDock: React.FC = () => {
    const { currentUserSeat } = usePlayerSeatInfo();
    const { holeCards, stackValue, isFolded } = usePlayerData(currentUserSeat);
    const strength = useCardsForHandStrength(currentUserSeat);
    const { gameFormat, gameState } = useGameStateContext();
    const isTournament = isTournamentFormat(gameFormat);
    const showInBigBlinds = useStacksInBigBlinds(isTournament);
    const bigBlind = showInBigBlinds ? bigBlindInStackUnits(gameState?.gameOptions?.bigBlind, isTournament) : null;
    if (currentUserSeat <= 0 || !hasElements(holeCards)) return null;
    const mine = gameState?.nextToAct === currentUserSeat;
    return (
        <div data-part="bb-hero-dock" data-folded={isFolded ? "true" : undefined} data-mine={mine ? "true" : undefined}>
            <div data-part="bb-hero-cards">
                {holeCards.map((card, i) => (
                    <FlagshipCard key={`${i}-${card}`} code={card} className="bb-hero-card" />
                ))}
            </div>
            <div data-part="bb-hero-info">
                <span>You</span>
                <b>{formatSeatStack(stackValue, isTournament, bigBlind)}</b>
                {strength && <span className="bb-hero-strength">· {strength.descr}</span>}
            </div>
        </div>
    );
};
