/**
 * @jest-environment node
 *
 * Real Block52 mainnet hands, read from node1 and checked end to end (ui#972):
 * VRF-dealt first hands, player-seeded hands, 2- to 9-handed, Hold'em and Omaha.
 * Needs the network, so it is an e2e test (excluded from `yarn test`); run it
 * with `npx jest --testPathIgnorePatterns=/node_modules/ -- src/utils/provablyFair/mainnetHands.e2e.test.ts`.
 * Nodes keep ~30 days of history, so old hands here will eventually be pruned.
 */
import { loadHandEvidence, EvidenceSources } from "./loadHandEvidence";
import { verifyHand } from "./handVerification";
import { GAME_STATE_PUBLIC_PATH, parseGameStateJson } from "../handReplay";
import { encodeStringField1, parseAbciStringResponse } from "../abciQuery";
const REST = "https://node1.block52.xyz",
    RPC = "https://node1.block52.xyz/rpc";
const get = async (u: string) => {
    const r = await fetch(u);
    return r.json();
};
const src = (game: string): EvidenceSources => ({
    searchTxs: (q, l) => get(`${REST}/cosmos/tx/v1beta1/txs?query=${encodeURIComponent(q)}&order_by=1&limit=${l}`),
    block: h => get(`${RPC}/block?height=${h}`),
    publicStateAt: async h =>
        parseGameStateJson(
            parseAbciStringResponse(
                await get(`${RPC}/abci_query?path=${encodeURIComponent(`"${GAME_STATE_PUBLIC_PATH}"`)}&data=${encodeStringField1(game)}&height=${h}`)
            )
        ).state
});
const cases: Array<[string, number]> = [
    ["0x26431671517c237aeea8b5a523aead8a4fb72747857066c1d9ef258abd41a14c", 10],
    ["0x26431671517c237aeea8b5a523aead8a4fb72747857066c1d9ef258abd41a14c", 8],
    ["0x29f65a4c5c355935e18b6a227f27f79840c17710e4214c5b2aeba33da5712d31", 1],
    ["0x4ae6f59325c35017078c097bcca4d706867a93ea5e3660d36d6a244bacaf1ac9", 1],
    ["0x1ffef1aee58c3e9057426939429334a41ac0ef42f36fb7a6286dde6a14d7fcf4", 1],
    ["0x85152c519a42d8cc36a6b5aaa19193672b9980233ab760e8044e7dce10734fb7", 1],
    ["0x8ee2025c2f9f2a47d5fe60be65212bf0fe5225cd8dbd8d8e950d8af98130e6cf", 1],
    ["0xd2a5271cbe3114c514a65a3a72e0f3948dec467018a77f9b6d6dc1125cd34ff4", 68],
    ["0xd2a5271cbe3114c514a65a3a72e0f3948dec467018a77f9b6d6dc1125cd34ff4", 2]
];
jest.setTimeout(180000);

test.each(cases)("mainnet table %s hand %i verifies", async (game, hand) => {
    const ev = await loadHandEvidence(src(game), game, hand);
    const r = verifyHand(ev);
    expect(r.overall).not.toBe("failed");
    expect(r.checks.find(c => c.id === "deck")?.status).toBe("pass");
    expect(r.source).toBe(hand === 1 ? "validator-vrf" : "player-seed");
    if (hand === 1) expect(r.overall).toBe("verified");
});
