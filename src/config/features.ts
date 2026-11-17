/**
 * Feature switches for the club-API work (block52-club#54), read from the build environment so each can be turned off
 * without touching code. The defaults below are the app as it was before that work, so a build with none of these set
 * behaves exactly as it always did; a deployment turns the new behaviour on in its .env.
 *
 *   VITE_FEATURE_CLUB_ACCOUNTS  club username/password sign-in and signing through the Go function. Off: built-in wallet only.
 *   VITE_FEATURE_API_READS      balance and table list come from the club API. Off: the app reads the node directly.
 *   VITE_FEATURE_NODE_SELECTOR  the node dropdown and block height in the header. On by default.
 *   VITE_FEATURE_CLUB_LOGIN     the header's "Club login" link to the admin console (also needs VITE_CLUB_CONSOLE_URLS). On by default.
 *   VITE_FEATURE_CLUB_AUTH_MODAL  a Sign in / Create account modal in the header that talks to the club API directly (needs
 *                               VITE_FEATURE_CLUB_ACCOUNTS and VITE_CLUB_SERVICE_URLS). Off by default; when on it replaces the
 *                               header's "Club login" link to the console.
 *
 * A switch is "on" for true, 1, on or yes (any case); anything else, including unset, falls to its default.
 */
import { viteEnv } from "../utils/viteEnv";

const flag = (name: string, fallback: boolean): boolean => {
    const v = viteEnv[name]?.trim().toLowerCase();
    if (v === undefined || v === "") return fallback;
    if (["true", "1", "on", "yes"].includes(v)) return true;
    if (["false", "0", "off", "no"].includes(v)) return false;
    return fallback;
};

/** Read on every call, not once at load: cheap, and a test or a hot-reloaded .env sees the change. */
export const features = {
    get clubAccounts() {
        return flag("VITE_FEATURE_CLUB_ACCOUNTS", false);
    },
    get apiReads() {
        return flag("VITE_FEATURE_API_READS", false);
    },
    get nodeSelector() {
        return flag("VITE_FEATURE_NODE_SELECTOR", true);
    },
    get clubLogin() {
        return flag("VITE_FEATURE_CLUB_LOGIN", true);
    },
    get clubAuthModal() {
        return flag("VITE_FEATURE_CLUB_AUTH_MODAL", false);
    }
};
