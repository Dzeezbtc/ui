import React, { useContext, useMemo } from "react";
import { ClubApi } from "../apis/Api";
import { parseAllowList } from "../utils/clubLogin";
import { clubDemoHeaders, requestClubDemoPassword } from "../utils/clubDemoAccess";
import { ClubDemoPasswordPrompt } from "../components/ClubDemoPasswordPrompt";

const ClubApiContext = React.createContext<ClubApi | null>(null);

/**
 * The club service the lobby talks to: the first of VITE_CLUB_SERVICE_URLS.
 * Without one there's no club API, and clubs simply don't show in the lobby.
 * A password-protected demo service answers 401 until the viewer types its
 * password in (utils/clubDemoAccess).
 */
export const ClubApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const api = useMemo(() => {
        const [baseUrl] = parseAllowList(import.meta.env.VITE_CLUB_SERVICE_URLS);
        return baseUrl
            ? new ClubApi({ baseUrl, secure: false, timeout: 10_000, headers: clubDemoHeaders, onErrorStatus: status => status === 401 && requestClubDemoPassword() })
            : null;
    }, []);
    return (
        <ClubApiContext.Provider value={api}>
            {children}
            {api && <ClubDemoPasswordPrompt />}
        </ClubApiContext.Provider>
    );
};

/** The club service API, or null when this lobby has none. */
export const useClubApi = (): ClubApi | null => useContext(ClubApiContext);
