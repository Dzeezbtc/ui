import { useEffect, useState } from "react";
import { useClubApi } from "../../context/ClubApiContext";

export interface TableClub {
    handle: string;
    name: string;
}

/** gameId → the club hosting that table, refreshed every minute. Empty when the lobby has no club service. */
export const useTableClubs = (): Record<string, TableClub> => {
    const api = useClubApi();
    const [tables, setTables] = useState<Record<string, TableClub>>({});

    useEffect(() => {
        if (!api) return;
        let on = true;
        const load = async () => {
            try {
                const r = await api.getTableClubs();
                if (on) setTables(r.tables);
            } catch (err) {
                console.error("Failed to load club tables:", err);
            }
        };
        load();
        const timer = setInterval(load, 60_000);
        return () => {
            on = false;
            clearInterval(timer);
        };
    }, [api]);

    return tables;
};
