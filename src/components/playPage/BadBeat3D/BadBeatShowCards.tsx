import React from "react";
import type { Position } from "../../../config/stageGeometry";
import type { BadBeatTableState } from "../../../utils/badBeatTableState";
import { useBadBeatTable } from "../../../hooks/game/useBadBeatTable";
import { FlagshipCard } from "../Card/FlagshipCard";

interface ShownHandsProps {
    /** Per table position, where its cards lie on the felt (stageGeometry feltCards). */
    spots: Position[];
    state: BadBeatTableState;
}

interface BadBeatShowCardsProps {
    spots: Position[];
    tableSize: number;
    startIndex: number;
    dealerSeat: number | null;
}

/**
 * Bad Beat's shown hands (Dzeezbtc/ui#36): when another player shows their
 * cards, the two face-down cards at their seat are rolled over, then lift off
 * the felt flat and bigger, right where they lay, so whose they are is clear.
 */
const ShownHands: React.FC<ShownHandsProps> = ({ spots, state }) => (
    <>
        {state.seats.map((seat, i) =>
            seat.shown && seat.cards && spots[i] ? (
                <div key={`show-${i}-${seat.cards.join("")}`} data-part="bb-show-cards" style={{ left: spots[i].left, top: spots[i].top }}>
                    {seat.cards.map((code, k) => (
                        <div key={`${k}-${code}`} className="bb-show-card bb-flip" style={{ animationDelay: `${k * 120}ms` }}>
                            <div className="bb-flip-in" style={{ animationDelay: `${k * 120}ms` }}>
                                <FlagshipCard code={code} className="bb-flip-front" />
                                <FlagshipCard back className="bb-flip-back" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : null
        )}
    </>
);

/** {@link ShownHands} for the live game. */
export const BadBeatShowCards: React.FC<BadBeatShowCardsProps> = ({ spots, tableSize, startIndex, dealerSeat }) => {
    const state = useBadBeatTable(tableSize, startIndex, dealerSeat);
    return <ShownHands spots={spots} state={state} />;
};
