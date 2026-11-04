/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Club consoles allowed to receive sign-in signatures; the first is the "Club login" link. */
    readonly VITE_CLUB_CONSOLE_URLS?: string;
    /** Club services the lobby may ask for sign-in challenges. */
    readonly VITE_CLUB_SERVICE_URLS?: string;
}
