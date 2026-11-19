/**
 * Custodial sign-in (block52-club#47, #54). A player signs in to the club API with a username and password and gets a
 * player token; Block52 holds their key. This is the browser's side: the token, the address, and a signing client that
 * sends the four game messages to the Go function (the signer) with that token. The function signs and broadcasts to
 * the node over gRPC; nothing is signed here and the club API is not in the game path.
 *
 * Built-in wallet mode is untouched. Signing in custodially sets the stored address to the custodial one and puts the
 * built-in wallet's mnemonic and address aside (it is not deleted); signing out puts them back.
 */
import { parseAllowList } from "../clubLogin";
import { features } from "../../config/features";
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

/** The club API (TypeScript): sign-up, sign-in, balances and everything that is not a game action. */
export const custodyBase = (): string | null => parseAllowList(viteEnv.VITE_CLUB_SERVICE_URLS)[0] ?? null;

/** The Go functions (the signer): game actions only. Called straight from the browser with the player token. */
export const signerBase = (): string | null => parseAllowList(viteEnv.VITE_SIGNER_URL)[0] ?? null;

export const getCustodySession = (): CustodySession | null => {
    // Switched off (VITE_FEATURE_CLUB_ACCOUNTS): there is no club account, whatever is stored. Every caller then takes
    // the built-in wallet path.
    if (!features.clubAccounts) return null;
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

/** An error from the club API or the signer: the HTTP status (0 = never reached) and the signer's rule code, if it sent one. */
export class CustodyError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
    }
}

const post = async <T>(base: string | null, what: string, path: string, body: unknown, token?: string): Promise<T> => {
    if (!base) throw new CustodyError(`No ${what} is configured.`, 0);
    let res: Response;
    try {
        res = await fetch(`${base}${path}`, {
            method: "POST",
            headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(body)
        });
    } catch {
        // The words "fetch" and "network" are left out on purpose: the app's money-mover retry re-sends on messages that
        // contain them, and a re-send here must reuse the request id (see perform), not start a new action.
        throw new CustodyError(`Couldn't reach the ${what}. Try again in a moment.`, 0, "unreachable");
    }
    const json = (await res.json().catch(() => ({}))) as { error?: string | { code?: string; message?: string } };
    if (!res.ok) {
        const e = json.error;
        const message = (typeof e === "string" ? e : e?.message) ?? `${res.status} ${res.statusText}`;
        throw new CustodyError(message, res.status, typeof e === "object" ? e?.code : undefined);
    }
    return json as T;
};

/** Keeps a club account as this browser's identity. The built-in wallet is set aside (once), not deleted, until sign-out. */
function adoptSession(s: CustodySession): CustodySession {
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

/** Signs in with the club username and password. Replaces the stored wallet identity until sign-out. */
export async function custodySignIn(username: string, password: string): Promise<CustodySession> {
    return adoptSession(await post<CustodySession>(custodyBase(), "club service (VITE_CLUB_SERVICE_URLS)", "/auth/password", { username, password }));
}

/**
 * Makes a club account (the API's POST /auth/register) and signs in as it. `secret` is the optional "Advanced" paste: a seed
 * phrase or a private key, which the API tells apart by shape; left out, the API makes a new key.
 */
export async function custodyRegister(username: string, password: string, secret?: string): Promise<CustodySession> {
    const body: Record<string, string> = { username, password };
    if (secret?.trim()) body.secret = secret.trim();
    return adoptSession(await post<CustodySession>(custodyBase(), "club service (VITE_CLUB_SERVICE_URLS)", "/auth/register", body));
}

/**
 * Run at start-up. If club accounts were switched off while someone was signed in to one, put their built-in wallet back
 * (it was set aside, not deleted) so the app is not left with a club address and no key. Nothing to do otherwise.
 */
export function restoreWalletIfClubAccountsOff(): void {
    if (features.clubAccounts) return;
    try {
        if (localStorage.getItem(SESSION_KEY)) custodySignOut();
    } catch {
        // private mode: nothing was kept
    }
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

/** A game call: to the Go function, with the player token. The club API is not in this path. */
const authed = <T>(path: string, body: unknown): Promise<T> => {
    const s = getCustodySession();
    if (!s) return Promise.reject(new Error("Sign in first."));
    return post<T>(signerBase(), "signer (VITE_SIGNER_URL)", path, body, s.token);
};

/**
 * Whether the same action may be sent again with the same request id: the function never saw it, or is still on it, or
 * could not tell whether the chain took it. The function claims the request id, so a repeat returns the first result and
 * never broadcasts twice. Policy and chain rejections are final and are not retried.
 */
const retryable = (e: unknown): boolean => e instanceof CustodyError && (e.code === "unreachable" || e.code === "in-flight" || e.code === "chain-unavailable");

const RETRIES = 2;
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** One game action. The request id is made once, so every retry of this action carries the same id. */
const perform = async (payload: Record<string, unknown>): Promise<string> => {
    const requestId = crypto.randomUUID();
    for (let attempt = 0; ; attempt++) {
        try {
            return (await authed<{ txHash: string }>("/Perform", { requestId, ...payload })).txHash;
        } catch (e) {
            if (attempt >= RETRIES || !retryable(e)) throw e;
            await pause(RETRY_PAUSE_MS * (attempt + 1));
        }
    }
};
let RETRY_PAUSE_MS = 400;
/** For tests. */
export const setRetryPause = (ms: number) => {
    RETRY_PAUSE_MS = ms;
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
    authed("/WsAuth", {});
