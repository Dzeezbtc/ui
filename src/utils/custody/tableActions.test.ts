import type { NetworkEndpoints } from "../../context/NetworkContext";
import { executeTransportAction } from "../../hooks/playerActions/transportAction";
import { withMoneyMoverRetry } from "../cosmos/client";
import { setRetryPause } from "./session";

/** Table actions for a club account go to the Go function (VITE_SIGNER_URL) through the app's own action funnels. */

const store: Record<string, string> = {};
const network = {} as NetworkEndpoints;
const GAME = "0x" + "ab".repeat(32);

type Reply = { ok: boolean; status: number; body: unknown } | "network-down";
const script = (replies: Reply[]) => {
    const calls: { url: string; body: Record<string, unknown>; auth: string }[] = [];
    global.fetch = jest.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, body: JSON.parse(init.body as string), auth: (init.headers as Record<string, string>).authorization });
        const r = replies.shift()!;
        if (r === "network-down") throw new TypeError("Failed to fetch");
        return { ok: r.ok, status: r.status, statusText: "", json: async () => r.body } as Response;
    }) as unknown as typeof fetch;
    return calls;
};
const hash = (h: string): Reply => ({ ok: true, status: 200, body: { txHash: h, gameId: GAME } });
const refuse = (status: number, code: string): Reply => ({ ok: false, status, body: { error: { code, message: `refused: ${code}` } } });

beforeAll(() => {
    process.env.VITE_FEATURE_CLUB_ACCOUNTS = "true";
    process.env.VITE_SIGNER_URL = "http://signer";
    process.env.VITE_CLUB_SERVICE_URLS = "http://api";
    setRetryPause(0);
});
beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    store.custody_session = JSON.stringify({ token: "tok", username: "alice", address: "b521custody" });
    Object.defineProperty(global, "localStorage", {
        configurable: true,
        value: { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v), removeItem: (k: string) => delete store[k] }
    });
});

describe("a poker action (call, raise, fold…)", () => {
    it("goes to the Go function with the player token, and returns the transaction hash", async () => {
        const calls = script([hash("TX1")]);
        const result = await executeTransportAction(GAME, "raise", 250_000n, network);
        expect(result).toMatchObject({ hash: "TX1", gameId: GAME, action: "raise", amount: "250000" });
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe("http://signer/Perform");
        expect(calls[0].auth).toBe("Bearer tok");
        expect(calls[0].body).toMatchObject({ action: { gameId: GAME, action: "raise", amount: "250000" } });
        expect(calls[0].body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    });
});

describe("join, leave and top-up (the money movers)", () => {
    it("join sends the seat and buy-in, leave and top-up their own messages", async () => {
        const calls = script([hash("J"), hash("L"), hash("T")]);
        expect(await withMoneyMoverRetry(network, ({ signingClient }) => signingClient.joinGame(GAME, 3, 5_000_000n))).toBe("J");
        expect(await withMoneyMoverRetry(network, ({ signingClient }) => signingClient.leaveGame(GAME))).toBe("L");
        expect(await withMoneyMoverRetry(network, ({ signingClient }) => signingClient.topUp(GAME, 2_000_000n))).toBe("T");
        expect(calls.map(c => c.url)).toEqual(["http://signer/Perform", "http://signer/Perform", "http://signer/Perform"]);
        expect(calls[0].body).toMatchObject({ join: { gameId: GAME, seat: 3, buyIn: "5000000" } });
        expect(calls[1].body).toMatchObject({ leave: { gameId: GAME } });
        expect(calls[2].body).toMatchObject({ topUp: { gameId: GAME, amount: "2000000" } });
    });
});

describe("retries never make a second action", () => {
    it("retries with the SAME request id when the function can't tell if the chain took it", async () => {
        const calls = script([refuse(502, "chain-unavailable"), "network-down", hash("TX2")]);
        const result = await executeTransportAction(GAME, "call", 0n, network);
        expect(result.hash).toBe("TX2");
        expect(calls).toHaveLength(3);
        expect(new Set(calls.map(c => c.body.requestId)).size).toBe(1);
    });
    it("waits out an in-flight duplicate with the same id", async () => {
        const calls = script([refuse(409, "in-flight"), hash("TX3")]);
        expect((await executeTransportAction(GAME, "check", 0n, network)).hash).toBe("TX3");
        expect(calls[0].body.requestId).toBe(calls[1].body.requestId);
    });
    it("gives up after the retries, and says so without the words the app's own retry looks for", async () => {
        const calls = script(["network-down", "network-down", "network-down", "network-down"]);
        const err = await executeTransportAction(GAME, "call", 0n, network).catch((e: Error) => e);
        expect((err as Error).message).toMatch(/Couldn't reach the signer/);
        expect((err as Error).message).not.toMatch(/fetch|network|connection|socket/i);
        expect(calls).toHaveLength(3);
        expect(new Set(calls.map(c => c.body.requestId)).size).toBe(1);
    });
    it("does not retry a refusal: the player's limit or the table's rules are final", async () => {
        const calls = script([refuse(403, "daily-limit"), hash("never")]);
        await expect(executeTransportAction(GAME, "call", 0n, network)).rejects.toThrow("refused: daily-limit");
        expect(calls).toHaveLength(1);
    });
    it("a second, separate action gets its own request id", async () => {
        const calls = script([hash("A"), hash("B")]);
        await executeTransportAction(GAME, "call", 0n, network);
        await executeTransportAction(GAME, "call", 0n, network);
        expect(calls[0].body.requestId).not.toBe(calls[1].body.requestId);
    });
});
