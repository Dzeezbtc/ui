import { useEffect, useState } from "react";

/**
 * Who's who at the table (block52-chat#1): the host tells chat each seated
 * player's seat, avatar and (when we have one) name, so chat never shows a raw
 * wallet address. A player is shown as their avatar, else their name, else
 * "Seat N"; anyone not seated is a "Spectator".
 */
export interface TablePlayer {
    address: string;
    seat: number;
    avatar?: string | null;
    name?: string | null;
}

let players = new Map<string, TablePlayer>();
const listeners = new Set<() => void>();

/** Called by the host whenever the seated players change. */
export function registerTablePlayers(list: readonly TablePlayer[]): void {
    const next = new Map<string, TablePlayer>();
    for (const p of list) if (p.address) next.set(p.address.toLowerCase(), p);
    const same =
        next.size === players.size &&
        [...next].every(([k, v]) => {
            const o = players.get(k);
            return o && o.seat === v.seat && (o.avatar ?? null) === (v.avatar ?? null) && (o.name ?? null) === (v.name ?? null);
        });
    if (same) return;
    players = next;
    listeners.forEach(l => l());
}

export function getTablePlayer(address: string | undefined): TablePlayer | undefined {
    return address ? players.get(address.toLowerCase()) : undefined;
}

export function getTablePlayers(): TablePlayer[] {
    return [...players.values()].sort((a, b) => a.seat - b.seat);
}

/** A player's name for chat text: their name, else "Seat N", else "Spectator". */
export function playerLabel(address: string | undefined, mine = false): string {
    if (mine) return "You";
    const p = getTablePlayer(address);
    if (!p) return "Spectator";
    return p.name?.trim() || `Seat ${p.seat}`;
}

/** Re-render when the seated players change. */
export function useTablePlayers(): TablePlayer[] {
    const [, bump] = useState(0);
    useEffect(() => {
        const l = () => bump(n => n + 1);
        listeners.add(l);
        return () => {
            listeners.delete(l);
        };
    }, []);
    return getTablePlayers();
}

export function __resetPlayersForTests(): void {
    players = new Map();
    listeners.clear();
}
