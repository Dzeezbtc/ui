/**
 * TableBoard Component
 *
 * Displays the central playing surface including:
 * - Club logo
 * - Pot displays (total pot, main pot, and each side pot when a player is all-in)
 * - Community cards
 * - Sit & Go waiting state
 */

import React, { useMemo } from "react";
import { TableStyle, dealsFaceDown, usesFlagshipLayout } from "../../../../utils/tableStyle";
import { getCardImageUrl, getCardBackUrl, CardBackStyle } from "../../../../utils/cardImages";
import { PotDisplayValues } from "../../../../utils/potDisplayUtils";
import { useCardAnimations } from "../../../../hooks/animations/useCardAnimations";
import { useGameSettings } from "../../../../context/GameSettingsContext";
import OppositePlayerCards from "../../Card/OppositePlayerCards";
import { TotalPotDisplay } from "./TotalPotDisplay";
import { MainPotDisplay } from "./MainPotDisplay";
import { NounsGlasses } from "./NounsGlasses";
import { FlagshipCard } from "../../Card/FlagshipCard";
import flagshipMark from "../../../../assets/flagship/mark.svg";
import flagshipWordmark from "../../../../assets/flagship/wordmark.png";


export interface TableBoardProps {
    // Display data
    clubLogo: string;
    potDisplayValues: PotDisplayValues;
    communityCards: string[];

    // State flags
    isSitAndGoWaitingForPlayers: boolean;

    // Styling
    cardBackStyle: CardBackStyle;
    tableTheme?: TableStyle;

    // Winning hand cards — cards in this set get the lift animation
    winnerCards?: Set<string>;
}

export const TableBoard: React.FC<TableBoardProps> = ({
    clubLogo,
    potDisplayValues,
    communityCards,
    isSitAndGoWaitingForPlayers,
    cardBackStyle,
    tableTheme = "modern",
    winnerCards
}) => {
    // Phase 5 pilot: mounting useCardAnimations here (the always-mounted board)
    // drives the WS-bus animation ack — when the staggered flop/turn/river reveal
    // completes it calls bus.ackAnimation, releasing the drain's next commit. The
    // per-slot flags gate each card's drop-in below: a freshly-dealt card drops
    // into place when its staggered flag turns on, one after another. Late mount /
    // replay reveals already-dealt slots immediately.
    const { revealedSlots } = useCardAnimations();
    const { potAsChips } = useGameSettings();

    // Memoize community cards rendering
    const communityCardsElements = useMemo(() => {
        // Count how many contiguous real cards exist from position 0.
        // Prevents out-of-order reveals when the backend sends intermediate states
        // (e.g. turn revealed before flop during all-in runout).
        let contiguousCount = 0;
        for (let i = 0; i < 5; i++) {
            const c = communityCards[i];
            if (c && c !== "??" && c !== "XX") {
                contiguousCount = i + 1;
            } else {
                break;
            }
        }

        const hasWinningCards = (winnerCards?.size ?? 0) > 0;

        return Array.from({ length: 5 }).map((_, idx) => {
            const card = communityCards[idx];
            // A card shows only once its slot has been revealed by the staggered
            // deal (see useCardAnimations); until then the slot is an empty
            // placeholder, so the flop's cards drop in one after the other.
            const isDealt = idx < contiguousCount && card && card !== "??" && card !== "XX";
            const isVisible = isDealt && revealedSlots[idx] === true;
            const isWinCard = isVisible && hasWinningCards && (winnerCards!.has(card));
            const shouldMute = isVisible && hasWinningCards && !winnerCards!.has(card);

            if (isVisible) {
                // Card drops into place (animate-fall) when its slot flag flips.
                // The stagger comes from the flag timing, so no per-index delay.
                return (
                    <div
                        key={`${idx}-${card}`}
                        className={`card${dealsFaceDown(tableTheme) ? "" : " animate-fall"}${isWinCard ? " animate-win-card" : ""}${shouldMute ? " opacity-40" : ""}`}
                    >
                        {dealsFaceDown(tableTheme) ? (
                            // Bad Beat, Maison 52, Chip and a Chair: the card lands face down on the felt, is rolled over, then lifts up flat (ui#36)
                            <div className="bb-flip">
                                <div className="bb-flip-in">
                                    <FlagshipCard code={card} className="fs-board bb-flip-front" />
                                    <FlagshipCard back className="fs-board bb-flip-back" />
                                </div>
                            </div>
                        ) : usesFlagshipLayout(tableTheme) ? (
                            <FlagshipCard code={card} className="fs-board" />
                        ) : (
                            <OppositePlayerCards frontSrc={getCardImageUrl(card)} backSrc={getCardBackUrl(cardBackStyle)} flipped />
                        )}
                    </div>
                );
            } else {
                return (
                    <div
                        key={idx}
                        data-part="board-slot"
                        className="w-[85px] h-[127px] aspect-square border-[0.5px] border-dashed border-white rounded-[5px] "
                        style={{ borderColor: "rgba(255,255,255,0.35)" }}
                    />
                );
            }
        });
    }, [communityCards, cardBackStyle, winnerCards, revealedSlots, tableTheme]);

    return (
        <>
            {/* Club Logo (Maison 52 draws its wordmark on the 3D felt) */}
            {tableTheme === "maison" ? null : tableTheme === "chipchair" ? (
                // Chip and a Chair's felt: its name, big and faint, as in the concept
                <div className="table-logo cc-logo" aria-hidden="true">
                    <span className="cc-wordmark">Chip and a Chair</span>
                </div>
            ) : tableTheme === "badbeat" ? (
                // Bad Beat's felt: the broadcast wordmark, slanted, "BEAT" in crimson.
                <div className="table-logo fs-logo bb-logo" aria-hidden="true">
                    <span className="bb-wordmark">
                        <span>BAD</span> <b>BEAT</b>
                    </span>
                </div>
            ) : tableTheme === "flagship" ? (
                // The Block52 flagship felt: the wordmark across the table, the
                // mark alone on the upright phone table (the skin picks one).
                <div className="table-logo fs-logo" aria-hidden="true">
                    <span className="fs-wordmark" style={{ WebkitMaskImage: `url(${flagshipWordmark})`, maskImage: `url(${flagshipWordmark})` }} />
                    <img className="fs-mark" src={flagshipMark} alt="" />
                </div>
            ) : (
                <div className={`table-logo ${tableTheme === "nouns" ? "table-logo-nouns" : ""}`}>
                    {tableTheme === "nouns" ? <NounsGlasses width={300} className="nouns-glasses-logo" /> : <img src={clubLogo} alt="Club Logo" />}
                </div>
            )}

            {/* Central Display Area */}
            <div data-part="board-column" className="flex flex-col items-center justify-center -mt-8">
                {/* Hide pot display when sit-and-go is waiting for players */}
                {/* Fixed-height pot slot (ui#918): the pots grow upward from its bottom edge, so the
                    community cards never move with the pot count, pot-as-chips or street. */}
                <div className="pot-slot" data-testid="pot-slot">
                {!isSitAndGoWaitingForPlayers && (
                    <div className="pot-stack flex flex-col items-center">
                        {potDisplayValues.showTotalPot && (
                            <TotalPotDisplay
                                amount={potDisplayValues.totalPot}
                                rawAmount={potDisplayValues.totalPotRaw}
                                isTournamentStyle={potDisplayValues.isTournamentStyle}
                                hasMainPot={potDisplayValues.showMainPot || potDisplayValues.showSidePots}
                                asChips={potAsChips}
                            />
                        )}
                        {/* Main Pot only post-flop, and only when it differs from Total Pot (#639) */}
                        {potDisplayValues.showMainPot && (
                            <MainPotDisplay
                                amount={potDisplayValues.mainPot}
                                rawAmount={potDisplayValues.mainPotRaw}
                                isTournamentStyle={potDisplayValues.isTournamentStyle}
                                asChips={potAsChips}
                            />
                        )}
                        {/* Side pots (ui#918): one pill per pot, main pot first */}
                        {potDisplayValues.showSidePots && (
                            <div className="side-pots-row" data-count={potDisplayValues.pots.length} data-testid="side-pots">
                                {potDisplayValues.pots.map(pot => (
                                    <MainPotDisplay
                                        key={pot.label}
                                        label={pot.label}
                                        amount={pot.amount}
                                        rawAmount={pot.raw}
                                        isTournamentStyle={potDisplayValues.isTournamentStyle}
                                        asChips={potAsChips}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                </div>

                {/* Community Cards */}
                <div className="flex gap-2 mt-8">{communityCardsElements}</div>
            </div>
        </>
    );
};
