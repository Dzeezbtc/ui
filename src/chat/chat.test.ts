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

    it("lets stickers go 2 every 5 minutes, 2s apart", () => {
        expect(sendSticker("thanks", 0)).toBe(true);
        expect(sendSticker("thanks", 1000)).toBe(false); // too soon
        expect(sendSticker("thanks", 2000)).toBe(true);
        expect(sendSticker("thanks", 60_000)).toBe(false); // 2 used
        expect(sendSticker("thanks", 300_000)).toBe(true);
    });

    it("lets throws go 3 every 10 minutes, at anyone", () => {
        expect(sendThrow("fish", "b521a", 0)).toBe(true);
        expect(sendThrow("fish", "b521a", 1000)).toBe(true);
        expect(sendThrow("fish", "b521a", 2000)).toBe(true); // same player is fine
        expect(throwStatus(3000)).toEqual({ waitMs: 597_000, remaining: 0 });
        expect(sendThrow("chip", "b521b", 3000)).toBe(false);
        expect(sendThrow("chip", "b521b", 600_000)).toBe(true);
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

describe("Chip Crew art (block52-chat#2)", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isKnownArt } = require("./art/Art");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { THROWABLES } = require("./throwables");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EMOTES, parseEmotes } = require("./emotes");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { STICKERS } = require("./stickers");
    const EMOJI = /\p{Extended_Pictographic}/u;

    it("draws every sticker, throwable and emote from our own art", () => {
        for (const s of STICKERS) expect([s.id, isKnownArt(s.icon)]).toEqual([s.id, true]);
        for (const t of THROWABLES) expect([t.id, isKnownArt(t.art)]).toEqual([t.id, true]);
        for (const e of EMOTES) expect([e.id, isKnownArt(e.art)]).toEqual([e.id, true]);
    });

    it("has no system emoji left in the manifests", () => {
        for (const s of STICKERS) expect(EMOJI.test(JSON.stringify(s))).toBe(false);
        for (const t of THROWABLES) expect(EMOJI.test(JSON.stringify(t))).toBe(false);
    });

    it("rejects unknown art", () => {
        expect(isKnownArt("chippy:nope")).toBe(false);
        expect(isKnownArt("rocket+nothing")).toBe(false);
        expect(isKnownArt("chippy:sad+rain-cloud-top")).toBe(true);
    });

    it("turns :shortcodes: into emotes and leaves unknown ones as text", () => {
        const parts = parseEmotes("gg :laugh: :nope: wp :fire:");
        expect(parts.map((p: { text?: string; emote?: { id: string } }) => p.text ?? `[${p.emote?.id}]`)).toEqual(["gg ", "[laugh]", " :nope: wp ", "[fire]"]);
    });
});
