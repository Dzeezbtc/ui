/**
 * Favourite quick-chat stickers (block52-chat#17): a player's own shortlist,
 * shown first in Quick chat so they don't have to scroll past stickers they
 * never use. Stored on this device, in the order they were added.
 */
import { useEffect, useState } from "react";
import { findSticker } from "./stickers";

const LS_KEY = "b52.chat.favourites";

function load(): string[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        // Drop ids that aren't (or are no longer) stickers, and duplicates.
        return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === "string" && !!findSticker(id)))] : [];
    } catch {
        return [];
    }
}

let favourites: string[] = load();
const listeners = new Set<(f: string[]) => void>();

function save(next: string[]): void {
    favourites = next;
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
        /* blocked storage: favourites still work this session */
    }
    listeners.forEach(l => l(favourites));
}

export const getFavourites = (): string[] => favourites;

export const isFavourite = (id: string): boolean => favourites.includes(id);

/** Add or remove a sticker from favourites. New favourites go to the end. */
export function toggleFavourite(id: string): void {
    if (!findSticker(id)) return;
    save(isFavourite(id) ? favourites.filter(f => f !== id) : [...favourites, id]);
}

/** React hook: the favourite sticker ids, in the order added. */
export function useFavourites(): string[] {
    const [f, setF] = useState<string[]>(favourites);
    useEffect(() => {
        listeners.add(setF);
        setF(favourites);
        return () => {
            listeners.delete(setF);
        };
    }, []);
    return f;
}

/** Test helper. */
export function __resetFavouritesForTests(): void {
    favourites = load();
    listeners.clear();
}
