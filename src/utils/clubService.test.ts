import { Secp256k1HdWallet } from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64 } from "@cosmjs/encoding";
import { signedBytes } from "./clubLogin";
import { joinButtonLabel, joinClub, joiningText, membershipText, tableSummary, type JoinApi, type PublicClubTable } from "./clubService";

// The standard BIP-39 test phrase: a throwaway wallet, never funded.
const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const table = (over: Partial<PublicClubTable> = {}): PublicClubTable => ({ gameId: "0x1", name: "nlh", format: "cash", variant: "texas-holdem", smallBlind: 0.01, bigBlind: 0.02, players: 3, maxPlayers: 6, ...over });

describe("club page wording", () => {
    it("explains each way of joining, with a button only where one applies", () => {
        expect(joiningText("open")).toBe("Anyone can join.");
        expect(joinButtonLabel("open")).toBe("Join club");
        expect(joinButtonLabel("approval")).toBe("Ask to join");
        expect(joinButtonLabel("invite")).toBeNull();
        expect(joiningText("invite")).toMatch(/invite/i);
    });

    it("says what a membership means", () => {
        expect(membershipText("active")).toBe("You're a member");
        expect(membershipText("pending")).toMatch(/approve/);
    });

    it("summarises a table, dollars for cash and chips otherwise", () => {
        expect(tableSummary(table())).toBe("Hold'em · Cash · $0.01/$0.02 · 3/6 seated");
        expect(tableSummary(table({ format: "sit-and-go", variant: "omaha", smallBlind: 25, bigBlind: 50 }))).toBe("Omaha · Sit & Go · 25/50 · 3/6 seated");
    });
});

describe("joinClub", () => {
    it("signs the club service's join message with the player's wallet", async () => {
        const sent: { address: string; signature: string; pubkey: string; nonce: string }[] = [];
        const text = "Join a Block52 club\nClub: @block52\nWallet: x\nNonce: n1\nIssued: 2026-10-30T00:00Z";
        const api: JoinApi = {
            getJoinChallenge: async () => ({ nonce: "n1", text }),
            join: async body => {
                sent.push(body);
                return { status: "pending" };
            }
        };
        // The wallet's own address, as the lobby stores it.
        const real = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, { prefix: "b52" });
        const [{ address: mine }] = await real.getAccounts();

        const r = await joinClub(api, "block52", MNEMONIC, mine);
        expect(r.status).toBe("pending");
        const [body] = sent;
        expect(body).toMatchObject({ address: mine, nonce: "n1" });
        const ok = await Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(fromBase64(body.signature)), sha256(signedBytes(mine, text)), fromBase64(body.pubkey));
        expect(ok).toBe(true);
    });

    it("refuses when the stored address isn't the mnemonic's", async () => {
        const api: JoinApi = { getJoinChallenge: async () => ({ nonce: "n", text: "Join a Block52 club" }), join: async () => ({ status: "active" }) };
        await expect(joinClub(api, "block52", MNEMONIC, "b521someoneelse")).rejects.toThrow(/doesn't match/);
    });
});
