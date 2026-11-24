import { renderHook, waitFor } from "@testing-library/react";
import { useReleaseNotes, RELEASE_NOTES_URL } from "./useReleaseNotes";

const mockGetNotes = jest.fn();
jest.mock("../../apis/Api", () => ({
    ReleaseNotesApi: jest.fn().mockImplementation(() => ({ getNotes: (url: string) => mockGetNotes(url) }))
}));

describe("useReleaseNotes", () => {
    beforeEach(() => mockGetNotes.mockReset());

    it("loads and parses the notes", async () => {
        mockGetNotes.mockResolvedValue([{ id: "a", date: "2026-11-20", title: "Week", tags: [], highlights: ["x"] }]);
        const { result } = renderHook(() => useReleaseNotes());
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.notes.map(n => n.id)).toEqual(["a"]);
        expect(result.current.error).toBeNull();
        expect(mockGetNotes).toHaveBeenCalledWith(RELEASE_NOTES_URL);
    });

    it("reports an error when the file cannot be read", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockGetNotes.mockRejectedValue(new Error("offline"));
        const { result } = renderHook(() => useReleaseNotes());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("offline");
        spy.mockRestore();
    });
});
