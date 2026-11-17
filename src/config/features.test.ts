import { features } from "./features";
import { clubApiBase } from "../utils/clubApi/chain";
import { getCustodySession, restoreWalletIfClubAccountsOff } from "../utils/custody/session";

const KEYS = ["VITE_FEATURE_CLUB_ACCOUNTS", "VITE_FEATURE_API_READS", "VITE_FEATURE_NODE_SELECTOR", "VITE_FEATURE_CLUB_LOGIN", "VITE_CLUB_SERVICE_URLS"];
const store: Record<string, string> = {};
beforeEach(() => {
    for (const k of KEYS) delete process.env[k];
    for (const k of Object.keys(store)) delete store[k];
    Object.defineProperty(global, "localStorage", {
        configurable: true,
        value: { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v), removeItem: (k: string) => delete store[k] }
    });
});

describe("feature switches", () => {
    it("unset is the app as it was: no club accounts, no API reads, node selector and club login shown", () => {
        expect(features).toMatchObject({ clubAccounts: false, apiReads: false, nodeSelector: true, clubLogin: true });
    });
    it("reads true/1/on/yes and false/0/off/no in any case, and ignores anything else", () => {
        for (const on of ["true", "1", "ON", " Yes "]) {
            process.env.VITE_FEATURE_CLUB_ACCOUNTS = on;
            expect(features.clubAccounts).toBe(true);
        }
        for (const off of ["false", "0", "Off", "no"]) {
            process.env.VITE_FEATURE_NODE_SELECTOR = off;
            expect(features.nodeSelector).toBe(false);
        }
        process.env.VITE_FEATURE_CLUB_ACCOUNTS = "maybe";
        process.env.VITE_FEATURE_NODE_SELECTOR = "";
        expect([features.clubAccounts, features.nodeSelector]).toEqual([false, true]);
    });
});

describe("switching club accounts off puts the app back", () => {
    const session = { token: "t", username: "alice", address: "b521custody" };
    it("a stored club session is not a session while the switch is off", () => {
        store.custody_session = JSON.stringify(session);
        expect(getCustodySession()).toBeNull();
        process.env.VITE_FEATURE_CLUB_ACCOUNTS = "true";
        expect(getCustodySession()).toEqual(session);
    });
    it("start-up restores the built-in wallet that was set aside at sign-in", () => {
        store.custody_session = JSON.stringify(session);
        store.user_cosmos_address = "b521custody";
        store.custody_builtin_mnemonic = "twelve words here";
        store.custody_builtin_address = "b521builtin";
        restoreWalletIfClubAccountsOff();
        expect(store.custody_session).toBeUndefined();
        expect(store.user_cosmos_address).toBe("b521builtin");
        expect(store.user_cosmos_mnemonic).toBe("twelve words here");
    });
    it("start-up leaves everything alone while the switch is on, or there is no club session", () => {
        process.env.VITE_FEATURE_CLUB_ACCOUNTS = "true";
        store.custody_session = JSON.stringify(session);
        restoreWalletIfClubAccountsOff();
        expect(store.custody_session).toBeDefined();
        process.env.VITE_FEATURE_CLUB_ACCOUNTS = "false";
        delete store.custody_session;
        store.user_cosmos_address = "b521mine";
        restoreWalletIfClubAccountsOff();
        expect(store.user_cosmos_address).toBe("b521mine");
    });
});

describe("API reads", () => {
    it("are off unless switched on AND a club service is configured; off means read the node directly", () => {
        process.env.VITE_CLUB_SERVICE_URLS = "http://api";
        expect(clubApiBase()).toBeNull();
        process.env.VITE_FEATURE_API_READS = "true";
        expect(clubApiBase()).toBe("http://api");
        delete process.env.VITE_CLUB_SERVICE_URLS;
        expect(clubApiBase()).toBeNull();
    });
});
