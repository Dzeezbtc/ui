import { ClubMessage, markMessageSeen, messageLink, nextMessage, readSeenMessages } from "./clubMessages";

const message = (over: Partial<ClubMessage>): ClubMessage => ({ id: "a", kind: "banner", club: "block52", text: "Hallo", headline: null, jump: { type: "none" }, sentAt: "2026-11-04T01:00:00Z", ...over });

describe("nextMessage", () => {
    const older = message({ id: "older", sentAt: "2026-11-04T01:00:00Z" });
    const newer = message({ id: "newer", sentAt: "2026-11-04T02:00:00Z" });

    it("takes the oldest unseen one", () => {
        expect(nextMessage([newer, older], "banner", [])?.id).toBe("older");
        expect(nextMessage([newer, older], "banner", ["older"])?.id).toBe("newer");
    });

    it("only looks at the kind asked for", () => {
        expect(nextMessage([older], "dropdown", [])).toBeNull();
    });

    it("is null when everything's been seen, or there's nothing", () => {
        expect(nextMessage([older], "banner", ["older"])).toBeNull();
        expect(nextMessage([], "banner", [])).toBeNull();
    });
});

describe("seen messages", () => {
    beforeEach(() => localStorage.clear());

    it("remembers them once each", () => {
        markMessageSeen("a");
        markMessageSeen("b");
        markMessageSeen("a");
        expect(readSeenMessages()).toEqual(["b", "a"]);
    });

    it("keeps only the latest 300", () => {
        for (let i = 0; i < 305; i++) markMessageSeen(`m${i}`);
        const seen = readSeenMessages();
        expect(seen).toHaveLength(300);
        expect(seen[0]).toBe("m5");
    });

    it("treats bad stored data as nothing seen", () => {
        localStorage.setItem("b52.club.messages.seen", "{not json");
        expect(readSeenMessages()).toEqual([]);
        localStorage.setItem("b52.club.messages.seen", '{"a":1}');
        expect(readSeenMessages()).toEqual([]);
    });
});

describe("messageLink", () => {
    it("links to the club or the table, or nowhere", () => {
        expect(messageLink(message({ jump: { type: "club" } }))).toBe("/club/block52");
        expect(messageLink(message({ jump: { type: "table", gameId: "0xabc", name: "x" } }))).toBe("/table/0xabc");
        expect(messageLink(message({}))).toBeNull();
    });
});
