import { useCallback, useState } from "react";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { parseLobbyPrefs, type LobbyPrefs } from "../../utils/lobbyLayout";

/** Read the saved lobby filters; storage can be blocked (private mode), so failures fall back to the defaults. */
const readPrefs = (defaults: LobbyPrefs): LobbyPrefs => {
    try {
        return parseLobbyPrefs(localStorage.getItem(STORAGE_KEYS.lobbyFilters), defaults);
    } catch (err) {
        console.error("Could not read saved lobby filters:", err);
        return defaults;
    }
};

/**
 * useLobbyPrefs — the lobby's stake / size / sort / treasury filters, kept in
 * localStorage so a player who never wants to see, say, micro stakes only has
 * to switch them off once. Search is not saved.
 */
export const useLobbyPrefs = (defaults: LobbyPrefs): [LobbyPrefs, (next: Partial<LobbyPrefs>) => void] => {
    const [prefs, setPrefs] = useState<LobbyPrefs>(() => readPrefs(defaults));
    const update = useCallback((next: Partial<LobbyPrefs>) => {
        setPrefs(prev => {
            const merged = { ...prev, ...next };
            try {
                localStorage.setItem(STORAGE_KEYS.lobbyFilters, JSON.stringify(merged));
            } catch (err) {
                console.error("Could not save lobby filters:", err);
            }
            return merged;
        });
    }, []);
    return [prefs, update];
};
