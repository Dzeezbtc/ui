/**
 * Custodial sign-in (block52-club#47). A player signs in to the club service with a username and password; the
 * service holds their key and signs for them. This is the browser's side: the player token, the address, and a signing
 * client that sends the four game messages to the club service instead of signing here.
 *
 * Built-in wallet mode is untouched. Signing in custodially sets the stored address to the custodial one and puts the
 * built-in wallet's mnemonic and address aside (it is not deleted); signing out puts them back.
 */
import { parseAllowList } from "../clubLogin";
import { viteEnv } from "../viteEnv";
import { STORAGE_COSMOS_ADDRESS, STORAGE_COSMOS_MNEMONIC } from "../cosmos/storage";

const SESSION_KEY = "custody_session";
const BACKUP_MNEMONIC = "custody_builtin_mnemonic";
const BACKUP_ADDRESS = "custody_builtin_address";

export interface CustodySession {
    token: string;
    username: string;
    address: string;
}

export const custodyBase = (): string | null => parseAllowList(viteEnv.VITE_CLUB_SERVICE_URLS)[0] ?? null;

export const getCustodySession = (): CustodySession | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw) as Partial<CustodySession>;
        return typeof s.token === "string" && typeof s.address === "string" && typeof s.username === "string" ? (s as CustodySession) : null;
    } catch {
        return null;
    }
};

export const isCustodial = (): boolean => getCustodySession() !== null;

const post = async <T>(path: string, body: unknown, token?: string): Promise<T> => {
    const base = custodyBase();
    if (!base) throw new Error("No club service is configured (VITE_CLUB_SERVICE_URLS).");
    const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string | { message?: string } };
    if (!res.ok) {
        const e = json.error;
        throw new Error((typeof e === "string" ? e : e?.message) ?? `${res.status} ${res.statusText}`);
    }
    return json as T;
};

/** Signs in with the club username and password. Replaces the stored wallet identity until sign-out. */
export async function custodySignIn(username: string, password: string): Promise<CustodySession> {
    const s = await post<CustodySession>("/auth/password", { username, password });
    const previousMnemonic = localStorage.getItem(STORAGE_COSMOS_MNEMONIC);
    // Only back up a built-in wallet once: signing in again as another player must not overwrite it with a custodial address.
    if (!getCustodySession() && previousMnemonic) {
        localStorage.setItem(BACKUP_MNEMONIC, previousMnemonic);
        const previousAddress = localStorage.getItem(STORAGE_COSMOS_ADDRESS);
        if (previousAddress) localStorage.setItem(BACKUP_ADDRESS, previousAddress);
    }
    localStorage.removeItem(STORAGE_COSMOS_MNEMONIC);
    localStorage.setItem(STORAGE_COSMOS_ADDRESS, s.address);
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return s;
}

/** Back to the built-in wallet (the one set aside at sign-in), or none if there wasn't one. */
export function custodySignOut(): void {
    localStorage.removeItem(SESSION_KEY);
    const mnemonic = localStorage.getItem(BACKUP_MNEMONIC);
    const address = localStorage.getItem(BACKUP_ADDRESS);
    localStorage.removeItem(STORAGE_COSMOS_MNEMONIC);
    localStorage.removeItem(STORAGE_COSMOS_ADDRESS);
    if (mnemonic) localStorage.setItem(STORAGE_COSMOS_MNEMONIC, mnemonic);
    if (address) localStorage.setItem(STORAGE_COSMOS_ADDRESS, address);
    localStorage.removeItem(BACKUP_MNEMONIC);
    localStorage.removeItem(BACKUP_ADDRESS);
}

const authed = <T>(path: string, body: unknown): Promise<T> => {
    const s = getCustodySession();
    if (!s) return Promise.reject(new Error("Sign in first."));
    return post<T>(path, body, s.token);
};

const perform = async (payload: Record<string, unknown>): Promise<string> => {
    const r = await authed<{ txHash: string }>("/custody/Perform", { requestId: crypto.randomUUID(), ...payload });
    return r.txHash;
};

/**
 * The few things a custodial player can sign: the four game messages. Every other method a built-in wallet's signing
 * client has (sending tokens, withdrawing, creating games…) throws, so nothing falls through to a missing key.
 */
const custodialMethods = {
    performActionSync: (gameId: string, action: string, amount: bigint, data?: string) =>
        perform({ action: { gameId, action, amount: amount.toString(), data: data ?? "" } }),
    joinGame: (gameId: string, seat: number, buyIn: bigint) => perform({ join: { gameId, seat, buyIn: buyIn.toString() } }),
    leaveGame: (gameId: string) => perform({ leave: { gameId } }),
    topUp: (gameId: string, amount: bigint) => perform({ topUp: { gameId, amount: amount.toString() } })
};

export const custodialSigningClient = (): object =>
    new Proxy(custodialMethods, {
        get: (target, name) => {
            if (name in target) return target[name as keyof typeof target];
            if (name === "then") return undefined; // not a thenable: it is awaited as part of { signingClient }
            return () => Promise.reject(new Error(`"${String(name)}" isn't available on a club account: Block52 signs game actions for you here.`));
        }
    });

/** The table WebSocket's query signature, made by the signer. */
export const custodyWsAuth = (): Promise<{ playerAddress: string; timestamp: number; signature: string }> =>
    authed("/custody/WsAuth", {});
