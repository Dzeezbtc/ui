import { DEFAULT_RELEASE_NOTES_URL, releaseNotesUrl, componentVersions, hasDetail, noteCounts, noteDate, parseReleaseNotes, searchNotes } from "./releaseNotes";

const RAW = [
    { id: "w46", date: "2026-11-15", title: "Older week", tags: ["weekly"], highlights: ["Blinds fixed"], features: [], bugFixes: ["Ante bug"] },
    { id: "w47", date: "2026-11-20", title: "Gasless deposits", tags: ["poker-vm@pvm/go/engine/v1.0.38", "pokerchain@v0.1.211", "weekly"], highlights: ["Gasless USDC"], features: ["A", "B"], improvements: ["C"] },
    { id: "bad", title: "no date" },
    "not a note"
];

describe("parseReleaseNotes", () => {
    it("keeps valid notes, newest first, with every list present", () => {
        const notes = parseReleaseNotes(RAW);
        expect(notes.map(n => n.id)).toEqual(["w47", "w46"]);
        expect(notes[1].features).toEqual([]);
        expect(notes[1].tests).toEqual([]);
    });
    it("throws when the file is not a list", () => {
        expect(() => parseReleaseNotes({})).toThrow("Release notes are not a list");
    });
});

describe("componentVersions", () => {
    it("names engine, chain and SDK versions and drops other tags", () => {
        expect(componentVersions(["poker-vm@pvm/go/engine/v1.0.38", "pokerchain@v0.1.211", "poker-vm@sdk-v1.4.0", "weekly"])).toEqual([
            "Engine v1.0.38",
            "Chain v0.1.211",
            "SDK v1.4.0"
        ]);
    });
});

describe("noteCounts + hasDetail", () => {
    it("counts each list and knows when there is more than highlights", () => {
        const [w47, w46] = parseReleaseNotes(RAW);
        expect(noteCounts(w47)).toEqual({ features: 2, bugFixes: 0, improvements: 1, tests: 0 });
        expect(hasDetail(w46)).toBe(true);
        expect(hasDetail({ ...w46, bugFixes: [] })).toBe(false);
    });
});

describe("searchNotes", () => {
    const notes = parseReleaseNotes(RAW);
    it("matches every word anywhere in a note, ignoring case", () => {
        expect(searchNotes(notes, "gasless USDC").map(n => n.id)).toEqual(["w47"]);
        expect(searchNotes(notes, "ante").map(n => n.id)).toEqual(["w46"]);
        expect(searchNotes(notes, "ante gasless")).toEqual([]);
    });
    it("returns all notes for an empty query", () => {
        expect(searchNotes(notes, "  ")).toHaveLength(2);
    });
});

describe("noteDate", () => {
    it("formats a calendar date without shifting it", () => {
        expect(noteDate("2026-11-20")).toBe("20 Nov 2026");
        expect(noteDate("nonsense")).toBe("nonsense");
    });
});

describe("releaseNotesUrl", () => {
    it("uses a configured URL and falls back when it is missing or blank", () => {
        expect(releaseNotesUrl("https://x.example/notes.json")).toBe("https://x.example/notes.json");
        expect(releaseNotesUrl("")).toBe(DEFAULT_RELEASE_NOTES_URL);
        expect(releaseNotesUrl("  ")).toBe(DEFAULT_RELEASE_NOTES_URL);
        expect(releaseNotesUrl(undefined)).toBe(DEFAULT_RELEASE_NOTES_URL);
    });
});
