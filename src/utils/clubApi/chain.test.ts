import { fetchTables, fetchUsdcBalance } from "./chain";

const reply = (ok: boolean, status: number, body: unknown) => {
    global.fetch = jest.fn(async () => ({ ok, status, json: async () => body }) as Response) as unknown as typeof fetch;
    return global.fetch as jest.Mock;
};

describe("fetchUsdcBalance", () => {
    beforeAll(() => {
        process.env.VITE_CLUB_SERVICE_URLS = "http://api";
    });

    it("asks the club API for the address's usdc and returns the micro-amount", async () => {
        const f = reply(true, 200, { address: "b521x", denom: "usdc", amount: "12340000" });
        expect(await fetchUsdcBalance("b521x")).toBe("12340000");
        expect(f.mock.calls[0][0]).toBe("http://api/chain/balance/b521x?denom=usdc");
    });
    it("throws the API's message instead of showing a made-up balance", async () => {
        reply(false, 503, { error: "The chain didn't answer. Try again in a moment." });
        await expect(fetchUsdcBalance("b521x")).rejects.toThrow("The chain didn't answer");
        reply(true, 200, {});
        await expect(fetchUsdcBalance("b521x")).rejects.toThrow("no balance");
    });
});

describe("fetchTables", () => {
    beforeAll(() => {
        process.env.VITE_CLUB_SERVICE_URLS = "http://api";
    });
    it("lists the tables from the club API", async () => {
        const f = reply(true, 200, { games: [{ gameId: "0xa", currentPlayers: "3" }] });
        expect(await fetchTables()).toEqual([{ gameId: "0xa", currentPlayers: "3" }]);
        expect(f.mock.calls[0][0]).toBe("http://api/chain/tables");
    });
    it("throws instead of showing an empty lobby when the API fails or sends no list", async () => {
        reply(false, 503, { error: "The chain didn't answer. Try again in a moment." });
        await expect(fetchTables()).rejects.toThrow("The chain didn't answer");
        reply(true, 200, {});
        await expect(fetchTables()).rejects.toThrow("no table list");
    });
});
