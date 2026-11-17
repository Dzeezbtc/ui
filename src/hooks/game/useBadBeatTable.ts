import { useMemo } from "react";
import { useGameData } from "../../context/gameState/GameDataContext";
import { usePlayersBySeat } from "./usePlayersBySeat";
import { badBeatTableState, type BadBeatTableState } from "../../utils/badBeatTableState";

/**
 * The live game as Bad Beat's 3D table draws it (Dzeezbtc/ui#36): per table
 * position its cards and bet, the dealer disc and the pot. Reads the rendered
 * track, like every other visual.
 */
export const useBadBeatTable = (tableSize: number, startIndex: number, dealerSeat: number | null): BadBeatTableState => {
    const { gameState } = useGameData();
    const playersBySeat = usePlayersBySeat();
    const round = gameState?.round;
    const previousActions = gameState?.previousActions;
    const pots = gameState?.pots;
    const smallBlind = gameState?.gameOptions?.smallBlind;
    return useMemo(
        () => badBeatTableState({ playersBySeat, tableSize, startIndex, dealerSeat, round, previousActions: previousActions ?? [], pots, smallBlind }),
        [playersBySeat, tableSize, startIndex, dealerSeat, round, previousActions, pots, smallBlind]
    );
};
