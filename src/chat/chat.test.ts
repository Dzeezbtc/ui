import { __resetChatForTests, getChatMessages, pushChatMessage, registerChatSender, registerLocalAddress, sendChat, sendSticker, STICKER_COOLDOWN_MS } from "./chatBus";
import { STICKERS, STICKER_PACKS, findSticker } from "./stickers";
import { ribbonLines } from "./StickerArt";
import { __resetChatSettingsForTests, getChatSettings, isMessageVisible, setPlayerMuted, updateChatSettings } from "./chatSettings";
import { latestSeatMessage, SEAT_BUBBLE_MS } from "./useSeatChat";

beforeEach(() => {
    localStorage.clear();
    __resetChatForTests();
    __resetChatSettingsForTests();
});

describe("stickers (block52-chat#2)", () => {
    it("has the classics plus set v2 (#16), unique slug ids, each in a known pack", () => {
        expect(STICKERS).toHaveLength(116);
        expect(new Set(STICKERS.map(s => s.id)).size).toBe(116);
        const packs = new Set(STICKER_PACKS.map(p => p.id));
        expect(STICKERS.every(s => packs.has(s.pack))).toBe(true);
        // Ids go on the wire, so they must pass the relay's slug check.
        expect(STICKERS.every(s => /^[a-z0-9-]{1,40}$/.test(s.id))).toBe(true);
        expect(findSticker("pay-that-man")?.label).toBe("Pay that man his money");
        expect(findSticker("nope")).toBeUndefined();
    });

    it("splits long phrases over two ribbon lines at the middle space", () => {
        expect(ribbonLines("SHIP IT")).toEqual(["SHIP IT"]);
        expect(ribbonLines("SAY HELLO TO MY LITTLE FRIEND")).toEqual(["SAY HELLO TO MY", "LITTLE FRIEND"]);
    });
});

describe("chat bus", () => {
    it("echoes your sticker locally, tagged with your address, and sends it", () => {
        const sent: unknown[] = [];
        registerChatSender(out => sent.push(out));
        registerLocalAddress("b521me");
        expect(sendSticker("good-game", 1000)).toBe(true);
        expect(getChatMessages()[0]).toMatchObject({ from: "b521me", sticker: "good-game", text: "Good game", mine: true });
        expect(sent).toEqual([{ text: "Good game", sticker: "good-game" }]);
    });

    it("limits stickers to one per cooldown", () => {
        expect(sendSticker("thanks", 1000)).toBe(true);
        expect(sendSticker("thanks", 1000 + STICKER_COOLDOWN_MS - 1)).toBe(false);
        expect(sendSticker("thanks", 1000 + STICKER_COOLDOWN_MS)).toBe(true);
        expect(getChatMessages()).toHaveLength(2);
    });

    it("ignores unknown stickers and keeps an unknown inbound sticker as text", () => {
        expect(sendSticker("not-a-sticker")).toBe(false);
        pushChatMessage({ from: "b521x", text: "Hello", sticker: "future-sticker", ts: 1, mine: false });
        expect(getChatMessages()[0].sticker).toBeUndefined();
        expect(getChatMessages()[0].text).toBe("Hello");
    });

    it("sends typed text", () => {
        const sent: unknown[] = [];
        registerChatSender(out => sent.push(out));
        sendChat("  hi table  ");
        expect(sent).toEqual([{ text: "hi table" }]);
    });
});

describe("chat settings (block52-chat#5)", () => {
    const other = { from: "b521Other", mine: false };

    it("shows everything by default", () => {
        expect(isMessageVisible(other, getChatSettings())).toBe(true);
    });

    it("chat off hides everything, even your own", () => {
        updateChatSettings({ enabled: false });
        expect(isMessageVisible(other, getChatSettings())).toBe(false);
        expect(isMessageVisible({ mine: true }, getChatSettings())).toBe(false);
    });

    it("hides a muted player (case-insensitive) and remembers it", () => {
        setPlayerMuted("B521OTHER", true);
        expect(isMessageVisible(other, getChatSettings())).toBe(false);
        expect(JSON.parse(localStorage.getItem("b52.chat.settings")!).muted).toEqual(["b521other"]);
        setPlayerMuted("b521other", false);
        expect(isMessageVisible(other, getChatSettings())).toBe(true);
    });

    it("mute spectators hides people who aren't seated", () => {
        updateChatSettings({ muteSpectators: true });
        expect(isMessageVisible(other, getChatSettings(), ["b521seated"])).toBe(false);
        expect(isMessageVisible({ from: "b521seated", mine: false }, getChatSettings(), ["b521seated"])).toBe(true);
    });
});

describe("seat bubble (block52-chat#3)", () => {
    const msg = (from: string, ts: number, text = "hi") => ({ id: `${from}${ts}`, from, text, ts, mine: false });

    it("shows a player's newest message within the window", () => {
        const list = [msg("b521a", 1000, "old"), msg("b521b", 1500), msg("b521a", 2000, "new")];
        expect(latestSeatMessage(list, "B521A", 2500)?.text).toBe("new");
        expect(latestSeatMessage(list, "b521b", 2500)?.from).toBe("b521b");
    });

    it("expires after the bubble time, and is null for unknown seats", () => {
        const list = [msg("b521a", 1000)];
        expect(latestSeatMessage(list, "b521a", 1000 + SEAT_BUBBLE_MS + 1)).toBeNull();
        expect(latestSeatMessage(list, undefined, 1000)).toBeNull();
        expect(latestSeatMessage(list, "b521z", 1000)).toBeNull();
    });
});
