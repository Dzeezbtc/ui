import { custodialSigningClient, custodySignIn, custodySignOut, getCustodySession, isCustodial } from "./session";

beforeAll(() => {
    process.env.VITE_CLUB_SERVICE_URLS = "http://svc";
    process.env.VITE_FEATURE_CLUB_ACCOUNTS = "true";
    process.env.VITE_SIGNER_URL = "http://signer";
});

const store: Record<string, string> = {};
beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    Object.defineProperty(global, "localStorage", {
        configurable: true,
        value: { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v), removeItem: (k: string) => delete store[k] }
    });
});

const mockFetch = (responses: { ok: boolean; status?: number; body: unknown }[]) => {
    const calls: { url: string; init: RequestInit }[] = [];
    global.fetch = jest.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        const r = responses.shift()!;
        return { ok: r.ok, status: r.status ?? 200, statusText: "", json: async () => r.body } as Response;
    }) as unknown as typeof fetch;
    return calls;
};

describe("club account sign-in", () => {
    it("sets the custodial address, puts the built-in wallet aside, and restores it on sign-out", async () => {
        store.user_cosmos_mnemonic = "word ".repeat(12).trim();
        store.user_cosmos_address = "b521builtin";
        mockFetch([{ ok: true, body: { token: "t", username: "alice", address: "b521custody" } }]);
        await custodySignIn("alice", "pw");
        expect(isCustodial()).toBe(true);
        expect(store.user_cosmos_address).toBe("b521custody");
        expect(store.user_cosmos_mnemonic).toBeUndefined();
        custodySignOut();
        expect(isCustodial()).toBe(false);
        expect(store.user_cosmos_address).toBe("b521builtin");
        expect(store.user_cosmos_mnemonic).toBe("word ".repeat(12).trim());
    });

    it("reports the service's message when the password is wrong, and stores nothing", async () => {
        mockFetch([{ ok: false, status: 401, body: { error: "Wrong username or password." } }]);
        await expect(custodySignIn("alice", "no")).rejects.toThrow("Wrong username or password.");
        expect(getCustodySession()).toBeNull();
    });
});

describe("the club account signing client", () => {
    beforeEach(() => {
        store.custody_session = JSON.stringify({ token: "tok", username: "alice", address: "b521custody" });
    });

    it("sends each game message to the Go function (not the club API) with the player token", async () => {
        const calls = mockFetch([
            { ok: true, body: { txHash: "H1" } },
            { ok: true, body: { txHash: "H2" } },
            { ok: true, body: { txHash: "H3" } },
            { ok: true, body: { txHash: "H4" } }
        ]);
        const c = custodialSigningClient() as Record<string, (...a: unknown[]) => Promise<string>>;
        expect(await c.performActionSync("0xg", "raise", 5n, "d")).toBe("H1");
        expect(await c.joinGame("0xg", 3, 5_000_000n)).toBe("H2");
        expect(await c.leaveGame("0xg")).toBe("H3");
        expect(await c.topUp("0xg", 2_000_000n)).toBe("H4");
        const bodies = calls.map(x => JSON.parse(x.init.body as string));
        expect(bodies[0]).toMatchObject({ action: { gameId: "0xg", action: "raise", amount: "5", data: "d" } });
        expect(bodies[1]).toMatchObject({ join: { gameId: "0xg", seat: 3, buyIn: "5000000" } });
        expect(bodies[2]).toMatchObject({ leave: { gameId: "0xg" } });
        expect(bodies[3]).toMatchObject({ topUp: { gameId: "0xg", amount: "2000000" } });
        expect(new Set(bodies.map(b => b.requestId)).size).toBe(4);
        expect(calls[0].url).toBe("http://signer/Perform");
        expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Bearer tok");
    });

    it("refuses everything else, so nothing falls through to a missing key", async () => {
        const c = custodialSigningClient() as Record<string, () => Promise<unknown>>;
        await expect(c.sendTokens()).rejects.toThrow(/isn't available on a club account/);
        await expect(c.initiateWithdrawal()).rejects.toThrow();
    });
});
