import { Secp256k1HdWallet } from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64 } from "@cosmjs/encoding";
import { signedBytes } from "./clubLogin";
import { payoutLabel, referralLink, newNotifications, saveNotifications, type NotificationApi, canSubmitJoin, claimBonus, clubAsksForKyc, offerText, type ClaimApi, joinButtonLabel, joinClub, joiningText, membershipText, seatRefusal, submitKyc, tableSummary, type ClubTerms, type JoinApi, type KycApi, type PublicClubTable, type SeatApi } from "./clubService";

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

const info = (over: Partial<ClubTerms> = {}): ClubTerms => ({ terms: null, termsUrl: null, privacyUrl: null, licence: null, houseRulesAccept: false, houseRules: [], support: { hours: "24/7", channels: [] }, ...over });
const terms = { version: 3, hash: "abc", body: "Be nice", publishedAt: "2026-11-05" };

describe("joining with the club's rules", () => {
    const send = async (choices: Parameters<typeof joinClub>[4]) => {
        const sent: Record<string, unknown>[] = [];
        const api: JoinApi = { getJoinChallenge: async () => ({ nonce: "n", text: "Join a Block52 club" }), join: async body => (sent.push(body), { status: "active", welcome: "Hi" }) };
        const real = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, { prefix: "b52" });
        const [{ address }] = await real.getAccounts();
        const result = await joinClub(api, "block52", MNEMONIC, address, choices);
        return { body: sent[0], result };
    };

    it("sends what the player accepted, the terms by version, and hands back the welcome", async () => {
        const { body, result } = await send({ acceptedTerms: true, acceptedHouseRules: true, termsVersion: 3, inviteCode: " ABC1 " });
        expect(body).toMatchObject({ acceptTerms: 3, acceptHouseRules: true, inviteCode: "ABC1" });
        expect(result.welcome).toBe("Hi");
    });

    it("passes on who referred them", async () => {
        const { body } = await send({ acceptedTerms: false, acceptedHouseRules: false, referredBy: "b521friend" });
        expect(body).toMatchObject({ referredBy: "b521friend" });
        expect(referralLink("https://x.test", "my club", "b521a")).toBe("https://x.test/club/my%20club?ref=b521a");
    });

    it("doesn't claim acceptance that wasn't given", async () => {
        const { body } = await send({ acceptedTerms: false, acceptedHouseRules: false, termsVersion: 3, inviteCode: "  " });
        expect(body).not.toHaveProperty("acceptTerms");
        expect(body).not.toHaveProperty("acceptHouseRules");
        expect(body).not.toHaveProperty("inviteCode");
    });

    it("only lets the button work when everything is ticked", () => {
        const none = { acceptedTerms: false, acceptedHouseRules: false };
        expect(canSubmitJoin(null, none)).toBe(false);
        expect(canSubmitJoin(info(), none)).toBe(true);
        expect(canSubmitJoin(info({ terms }), none)).toBe(false);
        expect(canSubmitJoin(info({ terms }), { ...none, acceptedTerms: true })).toBe(true);
        expect(canSubmitJoin(info({ houseRulesAccept: true }), none)).toBe(false);
        expect(canSubmitJoin(info({ terms, houseRulesAccept: true }), { acceptedTerms: true, acceptedHouseRules: false })).toBe(false);
        expect(canSubmitJoin(info({ terms, houseRulesAccept: true }), { acceptedTerms: true, acceptedHouseRules: true })).toBe(true);
    });

    it("offers a button on invite-only clubs once there's a code", () => {
        expect(joinButtonLabel("invite", "ABC")).toBe("Join with this code");
        expect(joinButtonLabel("invite", "  ")).toBeNull();
    });

    it("says little about a restricted membership", () => {
        expect(membershipText("restricted")).not.toMatch(/exclu|suspend|cool/i);
    });
});

describe("identity checks", () => {
    it("knows when a club asks", () => {
        expect(clubAsksForKyc({ kyc: "none" })).toBe(false);
        expect(clubAsksForKyc({ kyc: "none", mainTablesKyc: "none" })).toBe(false);
        expect(clubAsksForKyc({ kyc: "basic" })).toBe(true);
        expect(clubAsksForKyc({ kyc: "none", mainTablesKyc: "full" })).toBe(true);
    });

    it("signs and sends the details", async () => {
        const sent: { signature: string; fullName: string }[] = [];
        const api: KycApi = { getKycChallenge: async () => ({ nonce: "n", text: "Submit identity details to a Block52 club" }), submitKyc: async b => sent.push(b) };
        const real = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, { prefix: "b52" });
        const [{ address }] = await real.getAccounts();
        await submitKyc(api, "block52", MNEMONIC, address, { fullName: "A B", birthDate: "1990-01-01", country: "AU" });
        expect(sent[0].fullName).toBe("A B");
        expect(sent[0].signature).toBeTruthy();
        await expect(submitKyc(api, "block52", MNEMONIC, "b521someoneelse", { fullName: "A", birthDate: "1990-01-01", country: "AU" })).rejects.toThrow(/doesn't match/);
    });
});

describe("seat rules", () => {
    const api = (over: Partial<SeatApi> = {}): SeatApi => ({
        getTableClubs: async () => ({ tables: { "0x1": { handle: "block52", name: "B" } } }),
        canSit: async () => ({ allowed: true }),
        getSeatChallenge: async () => ({ nonce: "n", text: "Check a seat at a Block52 club table" }),
        checkSeat: async () => ({ allowed: true }),
        ...over
    });

    it("lets anyone sit without a club service, a wallet or a club table", async () => {
        expect(await seatRefusal(null, "0x1", "b521a")).toBeNull();
        expect(await seatRefusal(api(), "0x1", null)).toBeNull();
        expect(await seatRefusal(api(), "0xother", "b521a")).toBeNull();
    });

    it("gives the club's reason when it says no", async () => {
        expect(await seatRefusal(api({ canSit: async () => ({ allowed: false, reason: "Join first." }) }), "0x1", "b521a")).toBe("Join first.");
        expect(await seatRefusal(api({ canSit: async () => ({ allowed: false }) }), "0x1", "b521a")).toMatch(/rules/);
        expect(await seatRefusal(api(), "0x1", "b521a")).toBeNull();
    });

    it("passes on a same-network or same-place refusal", async () => {
        const refusing = api({ checkSeat: async () => ({ allowed: false, reason: "Same place." }) });
        expect(await seatRefusal(refusing, "0x1", "b521a", MNEMONIC)).toBe("Same place.");
        expect(await seatRefusal(refusing, "0x1", "b521a")).toBeNull();
    });

    it("only asks for location when the club needs it, and sends it", async () => {
        const sent: { lat?: number }[] = [];
        const needs = api({
            checkSeat: async b => {
                sent.push(b);
                return b.lat === undefined ? { allowed: false, locationNeeded: true, reason: "Needs location." } : { allowed: true };
            }
        });
        const where = jest.fn(async () => ({ lat: 1, lon: 2 }));
        expect(await seatRefusal(needs, "0x1", "b521a", MNEMONIC, where)).toBeNull();
        expect(where).toHaveBeenCalledTimes(1);
        expect(sent[1].lat).toBe(1);

        const unused = jest.fn(async () => ({ lat: 1, lon: 2 }));
        expect(await seatRefusal(api(), "0x1", "b521a", MNEMONIC, unused)).toBeNull();
        expect(unused).not.toHaveBeenCalled();
    });

    it("refuses when the player won't share a location the club needs", async () => {
        const needs = api({ checkSeat: async () => ({ allowed: false, locationNeeded: true, reason: "Needs location." }) });
        expect(await seatRefusal(needs, "0x1", "b521a", MNEMONIC, async () => null)).toBe("Needs location.");
    });

    it("doesn't stop play when the club service is down", async () => {
        const quiet = jest.spyOn(console, "error").mockImplementation(() => undefined);
        expect(await seatRefusal(api({ getTableClubs: async () => { throw new Error("down"); } }), "0x1", "b521a")).toBeNull();
        expect(await seatRefusal(api({ canSit: async () => { throw new Error("down"); } }), "0x1", "b521a")).toBeNull();
        quiet.mockRestore();
    });
});

describe("bonuses", () => {
    const offer = { id: "o", name: "Welcome", matchPct: 100, maxBonus: 50, minDeposit: 10, rakePerDollar: 3, expiryDays: 60 };

    it("describes an offer", () => {
        expect(offerText(offer)).toBe("100% of your deposit, up to $50, from a $10 deposit. Unlocks at $3 of rake per $1, within 60 days.");
        expect(offerText({ ...offer, matchPct: 0, maxBonus: 20 })).toMatch(/^\$20\. /);
    });

    it("signs the request with the player's wallet", async () => {
        const sent: { offerId: string; signature: string }[] = [];
        const api: ClaimApi = { getClaimChallenge: async () => ({ nonce: "n", text: "Ask for a bonus from a Block52 club" }), claimBonus: async b => sent.push(b) };
        const real = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, { prefix: "b52" });
        const [{ address }] = await real.getAccounts();
        await claimBonus(api, "block52", MNEMONIC, address, "o");
        expect(sent[0].offerId).toBe("o");
        expect(sent[0].signature).toBeTruthy();
        await expect(claimBonus(api, "block52", MNEMONIC, "b521someoneelse", "o")).rejects.toThrow(/doesn't match/);
    });
});

describe("notifications", () => {
    const n = (key: string) => ({ key, title: key, body: "", created_at: "" });

    it("shows only what's new, oldest first", () => {
        expect(newNotifications([n("c"), n("b"), n("a")], new Set(["b"])).map(x => x.key)).toEqual(["a", "c"]);
        expect(newNotifications([n("a")], new Set(["a"]))).toEqual([]);
    });

    it("signs the player's choice", async () => {
        const sent: { tournaments: boolean; signature: string }[] = [];
        const api: NotificationApi = { getNotificationChallenge: async () => ({ nonce: "n", text: "Choose notifications from a Block52 club" }), saveNotifications: async b => sent.push(b) };
        const real = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, { prefix: "b52" });
        const [{ address }] = await real.getAccounts();
        await saveNotifications(api, "block52", MNEMONIC, address, { tournaments: true });
        expect(sent[0].tournaments).toBe(true);
        expect(sent[0].signature).toBeTruthy();
    });
});

describe("proof page labels", () => {
    it("names each kind of payout, and passes unknown ones through", () => {
        expect(payoutLabel("rakeback")).toBe("Rakeback");
        expect(payoutLabel("agent-payout")).toBe("Agent payout");
        expect(payoutLabel("something-new")).toBe("something-new");
    });
});
