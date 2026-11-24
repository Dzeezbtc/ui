import { useCallback, useEffect, useMemo, useState } from "react";
import { ReleaseNotesApi } from "../../apis/Api";
import { viteEnv } from "../../utils/viteEnv";
import { parseReleaseNotes, releaseNotesUrl, type ReleaseNote } from "../../utils/releaseNotes";

/** Where the weekly release notes live (block52/cards), unless the build names another file (a blank setting counts as none). */
export const RELEASE_NOTES_URL = releaseNotesUrl(viteEnv.VITE_APP_RELEASE_NOTE_URL);

export interface UseReleaseNotesReturn {
    notes: ReleaseNote[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

/** useReleaseNotes: the weekly release notes, newest first. */
export const useReleaseNotes = (): UseReleaseNotesReturn => {
    const api = useMemo(() => new ReleaseNotesApi({ baseUrl: "", secure: false, timeout: 10000 }), []);
    const [notes, setNotes] = useState<ReleaseNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setNotes(parseReleaseNotes(await api.getNotes(RELEASE_NOTES_URL)));
        } catch (err) {
            console.error("[useReleaseNotes] Failed to load release notes:", err);
            setError(err instanceof Error ? err.message : "Failed to load release notes");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { notes, loading, error, reload };
};
