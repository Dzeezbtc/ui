import { __resetChatForTests, getChatMessages, pushChatMessage, registerChatSender, registerLocalAddress, sendChat, sendSticker, sendThrow, throwStatus, STICKER_COOLDOWN_MS } from "./chatBus";
import { STICKERS, STICKER_PACKS, findSticker } from "./stickers";
import { ribbonLines } from "./StickerArt";
import { __resetChatSettingsForTests, getChatSettings, isMessageVisible, setPlayerMuted, updateChatSettings } from "./chatSettings";
import { bubbleMs, latestSeatMessage, SEAT_BUBBLE_MS, STICKER_BUBBLE_MS } from "./useSeatChat";
import { __resetFavouritesForTests, getFavourites, isFavourite, toggleFavourite } from "./favourites";

beforeEach(() => {
    localStorage.clear();
    __resetChatForTests();
    __resetChatSettingsForTests();
    __resetFavouritesForTests();
});

describe("stickers (block52-chat#2)", () => {
    it("has the classics plus set v2 (#16), unique slug ids, each in a known pack", () => {
        expect(STICKERS).toHaveLength(229);
        expect(new Set(STICKERS.map(s => s.id)).size).toBe(229);
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
        expect(latestSeatMessage(list, "b521a", 1000 + bubbleMs(list[0]) + 1)).toBeNull();
        expect(latestSeatMessage(list, "b521a", 1000 + bubbleMs(list[0]))?.text).toBe("hi");
        expect(latestSeatMessage(list, undefined, 1000)).toBeNull();
        expect(latestSeatMessage(list, "b521z", 1000)).toBeNull();
    });
});

describe("bubble time", () => {
    it("gives stickers 5s and typed text 3-7s by length", () => {
        expect(bubbleMs({ sticker: "ship-it", text: "Ship it" })).toBe(STICKER_BUBBLE_MS);
        expect(bubbleMs({ text: "gg" })).toBe(3120);
        expect(bubbleMs({ text: "x".repeat(300) })).toBe(SEAT_BUBBLE_MS);
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

describe("meme sticker styles (block52-chat#2)", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToStaticMarkup } = require("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MemeSticker } = require("./memes/MemeSticker");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MEME_SPECS } = require("./memes/specs");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isKnownArt } = require("./art/Art");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { STICKERS } = require("./stickers");

    it("has a plan for every sticker, using only real art", () => {
        for (const s of STICKERS.filter((x: { pack: string }) => x.pack !== "movies" && x.pack !== "rage-faces")) {
            const spec = MEME_SPECS[s.id];
            expect([s.id, !!spec]).toEqual([s.id, true]);
            for (const art of [spec.prop, spec.side, spec.above, spec.hat].filter(Boolean)) expect([s.id, art, isKnownArt(art)]).toEqual([s.id, art, true]);
        }
    });

    it.each(["wojak", "rage", "hose", "sticks"])("draws all stickers in the %s style", style => {
        for (const s of STICKERS.filter((x: { pack: string }) => x.pack !== "movies" && x.pack !== "rage-faces")) {
            const html = renderToStaticMarkup(React.createElement(MemeSticker, { sticker: s, style, size: 76 }));
            expect(html).toContain("<svg");
            expect(html).toContain("<text");
            expect((html.match(/<(path|ellipse|circle)/g) ?? []).length).toBeGreaterThanOrEqual(5);
        }
    });
});

describe("who's who (seats and avatars, not addresses)", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { registerTablePlayers, playerLabel, getTablePlayers, __resetPlayersForTests } = require("./players");
    beforeEach(() => __resetPlayersForTests());

    it("names seated players by name, else seat; others are spectators", () => {
        registerTablePlayers([
            { address: "b521AAA", seat: 2, avatar: "https://x/a.png" },
            { address: "b521bbb", seat: 1, name: "Dzee" }
        ]);
        expect(playerLabel("b521aaa")).toBe("Seat 2");
        expect(playerLabel("B521BBB")).toBe("Dzee");
        expect(playerLabel("b521zzz")).toBe("Spectator");
        expect(playerLabel("b521aaa", true)).toBe("You");
        expect(getTablePlayers().map((p: { seat: number }) => p.seat)).toEqual([1, 2]);
    });
});

describe("movie references pack", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MOVIE_ART, MOVIE_SPEAKERS } = require("./memes/movies");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { STICKERS } = require("./stickers");
    it("gives every movie line a character who says it", () => {
        const movies = STICKERS.filter((s: { pack: string }) => s.pack === "movies");
        expect(movies.length).toBe(101);
        for (const s of movies) expect([s.id, !!MOVIE_ART[s.id], !!MOVIE_SPEAKERS[s.id]]).toEqual([s.id, true, true]);
    });
});

describe("limits survive a reload (per wallet)", () => {
    it("restores the throw count for the same wallet after a reload", () => {
        localStorage.clear();
        __resetChatForTests();
        registerLocalAddress("b521me");
        expect(sendThrow("fish", "b521a", 1000)).toBe(true);
        expect(sendThrow("fish", "b521a", 2000)).toBe(true);
        // "reload": in-memory state is gone (localStorage survives), the wallet registers again
        registerLocalAddress(undefined);
        registerLocalAddress("b521me");
        expect(throwStatus(3000).remaining).toBe(1);
        // a different wallet starts fresh
        registerLocalAddress("b521other");
        expect(throwStatus(3000).remaining).toBe(3);
    });
});

describe("movie comebacks", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { REPLIES } = require("./memes/castList");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MOVIE_ART } = require("./memes/movies");
    it("every setup and every comeback is a real sticker, and every movie line has its character", () => {
        for (const [setup, reply] of Object.entries(REPLIES)) {
            expect([setup, !!findSticker(setup)]).toEqual([setup, true]);
            expect([reply, !!findSticker(reply as string)]).toEqual([reply, true]);
        }
        for (const s of STICKERS.filter(x => x.pack === "movies")) expect([s.id, !!MOVIE_ART[s.id]]).toEqual([s.id, true]);
    });
});

describe("rage faces pack", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToStaticMarkup } = require("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RAGE_FACES } = require("./memes/rageFaces");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { STICKERS } = require("./stickers");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { StickerArt } = require("./StickerArt");

    it("draws every rage-face sticker, and every drawing has a sticker", () => {
        const pack = STICKERS.filter((s: { pack: string }) => s.pack === "rage-faces");
        expect(pack.length).toBe(Object.keys(RAGE_FACES).length);
        for (const s of pack) {
            expect([s.id, !!RAGE_FACES[s.id]]).toEqual([s.id, true]);
            const html = renderToStaticMarkup(React.createElement(StickerArt, { sticker: s, size: 76 }));
            expect(html).toContain("<svg");
        }
    });
});

describe("Texas Hodl brand", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToStaticMarkup } = require("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { configureChatBrand } = require("./brand");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MemeSticker } = require("./memes/MemeSticker");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { StickerArt, CartoonSticker } = require("./StickerArt");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { STICKERS, findSticker } = require("./stickers");
    afterAll(() => configureChatBrand("block52"));

    it("gives every style its own Texas Hodl treatment", () => {
        configureChatBrand("texashodl");
        const s = findSticker("rivered-again");
        const marks: Record<string, string> = { wojak: "<pattern", rage: "stroke:url(#g", hose: "<feFuncR type=\"table\"", sticks: "type=\"discrete\"" };
        for (const [style, mark] of Object.entries(marks)) {
            const html = renderToStaticMarkup(React.createElement(MemeSticker, { sticker: s, style, size: 76 }));
            expect([style, html.includes(mark)]).toEqual([style, true]);
        }
        const chip = renderToStaticMarkup(React.createElement(CartoonSticker, { sticker: s, size: 76 }));
        expect(chip).toContain("M18 2 H90");
        for (const m of STICKERS.filter((x: { pack: string }) => x.pack === "movies").slice(0, 5)) {
            expect(renderToStaticMarkup(React.createElement(StickerArt, { sticker: m, size: 76 }))).toContain("stroke:url(#g");
        }
    });
});
