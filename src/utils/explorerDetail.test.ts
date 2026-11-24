import { webcrypto } from "crypto";
import { blockLabel, base64ToHex, fieldLabel, isChainAddress, messageFields, msgName, txHashFromBase64, txSentence } from "./explorerDetail";

const ADDR = "b521glxskc00xaf2ygrlw3zhke4jl3rrj6r7paju38";

describe("msgName + isChainAddress", () => {
    it("takes the bare message name", () => {
        expect(msgName("/pokerchain.poker.v1.MsgJoinGame")).toBe("MsgJoinGame");
    });
    it("knows Block52 addresses", () => {
        expect(isChainAddress(ADDR)).toBe(true);
        expect(isChainAddress("0x5a67")).toBe(false);
        expect(isChainAddress("b521short")).toBe(false);
    });
});

describe("txSentence", () => {
    it("says what each known message did", () => {
        expect(txSentence({ "@type": "/pokerchain.poker.v1.MsgRecordEthBlockHeight", eth_block_height: "26483023" })).toBe("Recorded Ethereum block 26,483,023");
        expect(txSentence({ "@type": "/pokerchain.poker.v1.MsgPerformAction", action: "raise", game_id: "0x5a6700000000000000d001" })).toBe("Raise at table 0x5a67...d001");
        expect(txSentence({ "@type": "/pokerchain.poker.v1.MsgJoinGame", game_id: "0xabc", seat: 3 })).toBe("Joined table 0xabc in seat 3");
        expect(txSentence({ "@type": "/pokerchain.poker.v1.MsgLeaveGame", game_id: "0xabc" })).toBe("Left table 0xabc");
        expect(txSentence({ "@type": "/pokerchain.poker.v1.MsgCreateGame" })).toBe("Created a table");
        expect(txSentence({ "@type": "/cosmos.bank.v1beta1.MsgSend", amount: [{ denom: "usdc", amount: "12500000" }], to_address: ADDR })).toBe("Sent $12.50 to b521gl...ju38");
    });
    it("falls back to the spaced message name", () => {
        expect(txSentence({ "@type": "/cosmos.staking.v1beta1.MsgDelegate" })).toBe("Delegate");
        expect(txSentence({})).toBe("Transaction");
    });
});

describe("fieldLabel + messageFields", () => {
    it("turns field names into words", () => {
        expect(fieldLabel("cosmos_block_height")).toBe("Cosmos block height");
        expect(fieldLabel("gameId")).toBe("Game id");
    });
    it("lists fields without the type, marking addresses and long values", () => {
        const fields = messageFields({ "@type": "x", submitter: ADDR, proposer_pubkey: "bXndSoRw3VvlbpIs4HoprlKhyuZYgAfj6AMKfG9ucC0=", seat: 2, cards: ["As", "Kd"] });
        expect(fields.map(f => [f.key, f.kind])).toEqual([
            ["submitter", "address"],
            ["proposer_pubkey", "long"],
            ["seat", "text"],
            ["cards", "text"]
        ]);
        expect(fields[2].value).toBe("2");
        expect(fields[3].value).toBe('["As","Kd"]');
    });
});

describe("tx hashes", () => {
    beforeAll(() => {
        if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
    });
    it("decodes base64 to hex", () => {
        expect(base64ToHex("AQL/")).toBe("0102ff");
    });
    it("hashes the bytes with SHA-256, upper case", async () => {
        // SHA-256 of "abc"
        expect(await txHashFromBase64("YWJj")).toBe("BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD");
    });
});

describe("blockLabel", () => {
    it("formats a height with a hash and commas", () => {
        expect(blockLabel(1217700)).toBe("#1,217,700");
    });
});
