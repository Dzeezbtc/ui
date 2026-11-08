import { useEffect, useState } from "react";
import { useClubApi } from "../../context/ClubApiContext";
import { safeLook, type ClubLook } from "../../utils/clubLook";

/** A table's club look, or null for an ordinary table or when there's no club service. */
export const useClubLook = (gameId: string | undefined): ClubLook | null => {
    const api = useClubApi();
    const [look, setLook] = useState<ClubLook | null>(null);
    useEffect(() => {
        if (!api || !gameId) return;
        let on = true;
        api.getTableLook(gameId).then(
            r => {
                if (on) setLook(safeLook(r.look));
            },
            err => console.error("Couldn't load the club's look:", err)
        );
        return () => {
            on = false;
        };
    }, [api, gameId]);
    return look;
};
