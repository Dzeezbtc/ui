import { __resetChatForTests, getChatMessages, pushChatMessage, registerChatSender, registerLocalAddress, sendChat, sendSticker, sendThrow, throwStatus, STICKER_COOLDOWN_MS } from "./chatBus";
import { STICKERS, STICKER_PACKS, findSticker } from "./stickers";
import { ribbonLines } from "./StickerArt";
import { __resetChatSettingsForTests, getChatSettings, isMessageVisible, setPlayerMuted, updateChatSettings } from "./chatSettings";
import { latestSeatMessage, SEAT_BUBBLE_MS } from "./useSeatChat";
import { __resetFavouritesForTests, getFavourites, isFavourite, toggleFavourite } from "./favourites";

beforeEach(() => {
    localStorage.clear();
    __resetChatForTests();
    __resetChatSettingsForTests();
    __resetFavouritesForTests();
});

describe("stickers (block52-chat#2)", () => {
    it("has the classics plus set v2 (#16), unique slug ids, each in a known pack", () => {
        expect(STICKERS).toHaveLength(126);
        expect(new Set(STICKERS.map(s => s.id)).size).toBe(126);
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

describe("favourites (block52-chat#17)", () => {
    it("pins and unpins stickers, in the order added, and remembers them", () => {
        toggleFavourite("ship-it");
        toggleFavourite("emotional-damage");
        expect(getFavourites()).toEqual(["ship-it", "emotional-damage"]);
        expect(isFavourite("ship-it")).toBe(true);
        toggleFavourite("ship-it");
        expect(getFavourites()).toEqual(["emotional-damage"]);
        expect(JSON.parse(localStorage.getItem("b52.chat.favourites")!)).toEqual(["emotional-damage"]);
    });

    it("ignores unknown ids, and drops stale or duplicate ids on load", () => {
        toggleFavourite("not-a-sticker");
        expect(getFavourites()).toEqual([]);
        localStorage.setItem("b52.chat.favourites", JSON.stringify(["ship-it", "gone-sticker", "ship-it", 7]));
        __resetFavouritesForTests();
        expect(getFavourites()).toEqual(["ship-it"]);
    });
});

import { hasStrongLanguage } from "./strongLanguage";

describe("strong language prompt (block52-chat#13)", () => {
    it("spots strong words, with suffixes and masking", () => {
        expect(hasStrongLanguage("what the fuck")).toBe(true);
        expect(hasStrongLanguage("Shitty river")).toBe(true);
        expect(hasStrongLanguage("f*ck that")).toBe(true);
        expect(hasStrongLanguage("you absolute DICKHEAD")).toBe(true);
    });

    it("leaves ordinary words alone (no Scunthorpe problem)", () => {
        expect(hasStrongLanguage("nice hand, well played")).toBe(false);
        expect(hasStrongLanguage("Scunthorpe classic")).toBe(false);
        expect(hasStrongLanguage("I folded the dickens out of that")).toBe(false);
        expect(hasStrongLanguage("shiitake mushrooms")).toBe(false);
    });
});

describe("send limits", () => {
    beforeEach(() => {
        __resetChatForTests();
        registerLocalAddress("b521me");
    });

    it("lets stickers go 5 a minute, 1.5s apart", () => {
        expect(sendSticker("thanks", 0)).toBe(true);
        expect(sendSticker("thanks", 1000)).toBe(false);
        for (let i = 1; i <= 4; i++) expect(sendSticker("thanks", i * 1500)).toBe(true);
        expect(sendSticker("thanks", 30_000)).toBe(false);
        expect(sendSticker("thanks", 60_000)).toBe(true);
    });

    it("lets throws go 3 every 3 minutes, two in a row, max 2 at one player", () => {
        expect(sendThrow("fish", "b521a", 0)).toBe(true);
        expect(sendThrow("fish", "b521a", 1000)).toBe(true);
        expect(sendThrow("fish", "b521a", 2000)).toBe(false); // same target cap
        expect(throwStatus("b521b", 2000)).toEqual({ waitMs: 0, remaining: 1 });
        expect(sendThrow("chip", "b521b", 2000)).toBe(true);
        expect(sendThrow("chip", "b521c", 3000)).toBe(false); // 3 used
        expect(throwStatus("b521c", 3000).waitMs).toBe(177_000);
        expect(sendThrow("chip", "b521c", 180_000)).toBe(true);
    });

    it("refuses a throw at yourself or an unknown item", () => {
        expect(sendThrow("fish", "B521ME", 0)).toBe(false);
        expect(sendThrow("nope", "b521a", 0)).toBe(false);
    });
});

describe("seat bubble ignores throws", () => {
    it("shows the last chat, not a throw", () => {
        const base = { mine: false, from: "b521a", ts: 1000 };
        const msgs = [
            { ...base, id: "1", text: "hi" },
            { ...base, id: "2", text: "Fish", throwId: "fish", to: "b521b" }
        ];
        expect(latestSeatMessage(msgs, "b521a", 1500)?.id).toBe("1");
    });
});
