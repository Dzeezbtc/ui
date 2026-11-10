import { CosmosApi } from "../apis/Api";

describe("CosmosApi.searchTxs", () => {
    const api = new CosmosApi({ baseUrl: "http://node.test", secure: false, timeout: 5000 });
    // HTTPClient keeps its axios instance private; read it for the assertion only.
    const client = (api as unknown as { client: { get: jest.Mock } }).client;

    it("encodes the event query, oldest first, with the limit", async () => {
        client.get = jest.fn().mockResolvedValue({ data: { txs: [], tx_responses: [] } });
        const reply = await api.searchTxs("hand_started.game_id='0xab' AND hand_started.hand_number='5'", 5);
        expect(reply).toEqual({ txs: [], tx_responses: [] });
        expect(client.get.mock.calls[0][0]).toBe(
            "/cosmos/tx/v1beta1/txs?query=hand_started.game_id%3D'0xab'%20AND%20hand_started.hand_number%3D'5'&order_by=1&limit=5"
        );
    });

    it("rejects when the node errors", async () => {
        client.get = jest.fn().mockRejectedValue(new Error("502"));
        await expect(api.searchTxs("tx.height=1", 1)).rejects.toThrow();
    });
});
