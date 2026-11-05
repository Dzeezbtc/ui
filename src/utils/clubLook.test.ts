import { safeLook, socialLabel, tableStyleFor } from "./clubLook";

describe("safeLook", () => {
    it("keeps what's safe", () => {
        expect(safeLook({ logo: "https://x.test/l.png", primaryColor: "#112233", accentColor: "#445566", felt: "dark", cardBack: "https://x.test/b.png", language: "es", socials: ["https://t.me/c"] })).toEqual({ logo: "https://x.test/l.png", primaryColor: "#112233", accentColor: "#445566", felt: "dark", cardBack: "https://x.test/b.png", language: "es", socials: ["https://t.me/c"] });
    });

    it("drops anything else", () => {
        const look = safeLook({ logo: "javascript:alert(1)", primaryColor: "red", felt: "<b>", cardBack: "javascript:alert(1)", socials: ["http://x.test", 'https://x.test/"x', "https://ok.test"] });
        expect(look).toMatchObject({ logo: null, primaryColor: null, felt: "classic", cardBack: "default", socials: ["https://ok.test"] });
    });

    it("is nothing for an ordinary table", () => {
        expect(safeLook(null)).toBeNull();
    });
});

it("maps a felt to a table style", () => {
    expect(tableStyleFor("classic")).toBe("classic");
    expect(tableStyleFor("dark")).toBe("modern");
    expect(tableStyleFor("logo")).toBe("modern");
});

it("names social links", () => {
    expect(socialLabel("https://t.me/club")).toBe("Telegram");
    expect(socialLabel("https://x.com/club")).toBe("X");
    expect(socialLabel("https://discord.gg/abc")).toBe("Discord");
    expect(socialLabel("https://www.myclub.com/")).toBe("myclub.com");
});
