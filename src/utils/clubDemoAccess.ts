/**
 * The hosted club demo's password (Dzeezbtc/block52-club hosted site).
 *
 * That back office is password-protected. The lobby lives on another site, so
 * it can't share the back office's sign-in cookie: whoever views the demo types
 * the password in once, the lobby keeps it in this browser and sends it with
 * every club request. A club service without a password never asks.
 */

export const CLUB_SITE_PASSWORD_HEADER = "x-site-password";
const STORAGE_KEY = "b52.clubDemoPassword";

export function getClubDemoPassword(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function setClubDemoPassword(password: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, password);
    } catch {
        // storage blocked: the prompt will ask again next time
    }
}

export function clearClubDemoPassword(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // nothing stored
    }
}

/** The header that carries the saved password, if there is one. */
export const clubDemoHeaders = (): Record<string, string> => {
    const password = getClubDemoPassword();
    return password ? { [CLUB_SITE_PASSWORD_HEADER]: password } : {};
};

type Listener = () => void;
const listeners = new Set<Listener>();

/** The club service answered 401: ask whoever's looking for the demo password. */
export function requestClubDemoPassword(): void {
    // A saved password the service refused is stale.
    clearClubDemoPassword();
    listeners.forEach(listener => listener());
}

export function onClubDemoPasswordNeeded(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
