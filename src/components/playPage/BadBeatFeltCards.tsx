import React from "react";
import { PlayerStatus } from "@block52/poker-vm-sdk";
import type { Position } from "../../config/stageGeometry";
import { usePlayersBySeat } from "../../hooks/game/usePlayersBySeat";
import { hasElements } from "../../utils/guards";
import { FlagshipCard } from "./Card/FlagshipCard";

interface BadBeatFeltCardsProps {
    /** Per table position, where its cards lie (stageGeometry badBeatPositions). */
    spots: Position[];
    tableSize: number;
    startIndex: number;
    /** The dealer's seat, or null between hands. */
    dealerSeat: number | null;
}

/**
 * Bad Beat's cards on the felt (Dzeezbtc/ui#36): each seat's two cards lie flat
 * on the table in front of it, as in the concept (face down, or face up for you
 * and at showdown), with the white D disc beside the dealer's. They sit in the
 * felt, so they tip back with the table.
 */
export const BadBeatFeltCards: React.FC<BadBeatFeltCardsProps> = ({ spots, tableSize, startIndex, dealerSeat }) => {
    const playersBySeat = usePlayersBySeat();
    return (
        <>
            {spots.map((spot, positionIndex) => {
                const seat = ((positionIndex - startIndex + tableSize) % tableSize) + 1;
                const player = playersBySeat.get(seat);
                const cards = player?.holeCards;
                const inHand = hasElements(cards) && player?.status !== PlayerStatus.FOLDED;
                const dealer = seat === dealerSeat && !!player;
                if (!inHand && !dealer) return null;
                return (
                    <div key={`felt-${positionIndex}`} data-part="bb-felt-cards" style={{ left: spot.left, top: spot.top }}>
                        {inHand && cards.map((card, i) => <FlagshipCard key={`${i}-${card}`} code={card} className="bb-felt-card" />)}
                        {dealer && <span data-part="bb-dealer">D</span>}
                    </div>
                );
            })}
        </>
    );
};
