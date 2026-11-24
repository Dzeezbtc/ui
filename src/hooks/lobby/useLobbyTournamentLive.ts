import { useEffect, useState } from "react";
import { useCosmosApi } from "../../context/CosmosApiContext";
import { parseGameRecordResponse } from "../../utils/handReplay";
import { toLobbyTournamentLive, type LobbyTournamentLive } from "../../utils/tournamentDetail";

/** How often the open panel re-reads the table (payouts grow as players register). */
export const LOBBY_TOURNAMENT_POLL_MS = 15_000;

/**
 * The live part of a tournament's lobby panel: the engine's payouts, whether it
 * has started, late registration and the level in play. Read from the table's
 * own record while the panel is open (`gameId` set), every 15 s; undefined until
 * the first read lands or when it fails (the panel then shows the lobby record
 * alone).
 */
export const useLobbyTournamentLive = (gameId: string | undefined): LobbyTournamentLive | undefined => {
    const api = useCosmosApi();
    const [live, setLive] = useState<LobbyTournamentLive | undefined>(undefined);

    useEffect(() => {
        setLive(undefined);
        if (!gameId) return;
        let stopped = false;
        const read = async () => {
            try {
                const parsed = parseGameRecordResponse(await api.getGame(gameId));
                if (!stopped) setLive(toLobbyTournamentLive(parsed.state, Date.now()));
            } catch (err) {
                console.error("[useLobbyTournamentLive] Failed to read table", gameId, err);
            }
        };
        void read();
        const timer = window.setInterval(read, LOBBY_TOURNAMENT_POLL_MS);
        return () => {
            stopped = true;
            window.clearInterval(timer);
        };
    }, [api, gameId]);

    return live;
};
