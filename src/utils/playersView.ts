import { microToUsdc } from "../constants/currency";
import type { PlayerSortField } from "../types/players";
import type { TranslationKey } from "../i18n";

/** The Players page's sort chips, in order, with their label keys. */
export const PLAYER_SORTS: { field: PlayerSortField; label: TranslationKey }[] = [
    { field: "net_profit", label: "players.sortProfit" },
    { field: "total_hands", label: "players.sortHands" },
    { field: "vip_points", label: "players.sortVip" },
    { field: "total_rake_contributed", label: "players.sortFees" }
];

/** A stable hue (0-359) for a player's orb, from their address. */
export const orbHue = (address: string): number => {
    let h = 0;
    for (let i = 0; i < address.length; i++) h = (h * 31 + address.charCodeAt(i)) % 360;
    return h;
};

/** Two letters for a player's orb: the first two characters after the b521 prefix. */
export const orbLetters = (address: string): string => address.replace(/^b521/, "").slice(0, 2).toUpperCase();

/** Signed dollars from USDC micro-units: "+$12.40", "-$3.00", "$0.00". */
export const signedUsd = (micro: number): string => {
    const value = microToUsdc(micro);
    const abs = `$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (value > 0) return `+${abs}`;
    if (value < 0) return `-${abs}`;
    return abs;
};

/** Dollars from USDC micro-units, unsigned: "$3.72". */
export const plainUsd = (micro: number): string => "$" + Math.abs(microToUsdc(micro)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A hand count, short: 950, 1.2k, 14k. */
export const shortCount = (n: number): string => (n < 1000 ? n.toLocaleString("en-US") : n < 10000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n / 1000)}k`);
