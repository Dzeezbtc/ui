import React, { useContext, useMemo } from "react";
import { ClubApi } from "../apis/Api";
import { parseAllowList } from "../utils/clubLogin";

const ClubApiContext = React.createContext<ClubApi | null>(null);

/**
 * The club service the lobby talks to: the first of VITE_CLUB_SERVICE_URLS.
 * Without one there's no club API, and clubs simply don't show in the lobby.
 */
export const ClubApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const api = useMemo(() => {
        const [baseUrl] = parseAllowList(import.meta.env.VITE_CLUB_SERVICE_URLS);
        return baseUrl ? new ClubApi({ baseUrl, secure: false, timeout: 10_000 }) : null;
    }, []);
    return <ClubApiContext.Provider value={api}>{children}</ClubApiContext.Provider>;
};

/** The club service API, or null when this lobby has none. */
export const useClubApi = (): ClubApi | null => useContext(ClubApiContext);
