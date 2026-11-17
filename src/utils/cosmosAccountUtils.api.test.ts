import type { NetworkEndpoints } from "./cosmos/urls";
import { getCosmosBalance } from "./cosmosAccountUtils";

jest.mock("./cosmos/client", () => ({ getCosmosClient: jest.fn(() => ({ getBalance: jest.fn(async () => 777n) })) }));

const network = {} as NetworkEndpoints;
const store: Record<string, string> = { user_cosmos_address: "b521mine" };

beforeEach(() => {
    delete process.env.VITE_FEATURE_API_READS;
    process.env.VITE_CLUB_SERVICE_URLS = "http://api";
    Object.defineProperty(global, "localStorage", { configurable: true, value: { getItem: (k: string) => store[k] ?? null, setItem: () => undefined, removeItem: () => undefined } });
    global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ amount: "12340000" }) }) as Response) as unknown as typeof fetch;
});

describe("the balance on the table page and its header", () => {
    it("comes from the club API when API reads are on", async () => {
        process.env.VITE_FEATURE_API_READS = "true";
        expect(await getCosmosBalance(network, "usdc")).toBe("12340000");
        expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe("http://api/chain/balance/b521mine?denom=usdc");
    });
    it("still reads the node directly with the switch off, and for other denoms", async () => {
        expect(await getCosmosBalance(network, "usdc")).toBe("777");
        process.env.VITE_FEATURE_API_READS = "true";
        expect(await getCosmosBalance(network, "stake")).toBe("777");
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
