/**
 * Tech notes (Flagship look, Dzeezbtc/ui#96): the weekly release notes, read from block52/cards,
 * checked, searched, and labelled the way people read them.
 */

import { hasContent, hasElements, isRecord, isString } from "./guards";

export interface ReleaseNote {
    id: string;
    /** ISO date, e.g. "2026-11-20". */
    date: string;
    title: string;
    version?: string;
    tags: string[];
    highlights: string[];
    features: string[];
    bugFixes: string[];
    improvements: string[];
    tests: string[];
    body?: string;
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isString) : []);

/** The notes in a release-notes file, newest first; entries without an id, date or title are dropped. */
export const parseReleaseNotes = (raw: unknown): ReleaseNote[] => {
    if (!Array.isArray(raw)) throw new Error("Release notes are not a list");
    return raw
        .filter(isRecord)
        .flatMap((n): ReleaseNote[] =>
            isString(n.id) && isString(n.date) && isString(n.title)
                ? [
                      {
                          id: n.id,
                          date: n.date,
                          title: n.title,
                          version: isString(n.version) ? n.version : undefined,
                          tags: strings(n.tags),
                          highlights: strings(n.highlights),
                          features: strings(n.features),
                          bugFixes: strings(n.bugFixes),
                          improvements: strings(n.improvements),
                          tests: strings(n.tests),
                          body: isString(n.body) ? n.body : undefined
                      }
                  ]
                : []
        )
        .sort((a, b) => b.date.localeCompare(a.date));
};

/** "Engine v1.0.38", "Chain v0.1.211", "SDK v1.4.0" from the version tags; other tags are left out. */
export const componentVersions = (tags: string[]): string[] =>
    tags
        .map(tag => {
            const engine = tag.match(/^poker-vm@pvm\/go\/engine\/(v[\w.]+)$/);
            if (engine) return `Engine ${engine[1]}`;
            const sdk = tag.match(/^poker-vm@sdk-(v[\w.]+)$/);
            if (sdk) return `SDK ${sdk[1]}`;
            const chain = tag.match(/^pokerchain@(v[\w.]+)$/);
            if (chain) return `Chain ${chain[1]}`;
            return "";
        })
        .filter(v => v !== "");

/** How many features, fixes, improvements and tests a note lists. */
export const noteCounts = (n: ReleaseNote): { features: number; bugFixes: number; improvements: number; tests: number } => ({
    features: n.features.length,
    bugFixes: n.bugFixes.length,
    improvements: n.improvements.length,
    tests: n.tests.length
});

/** Whether a note has more than its highlights to show. */
export const hasDetail = (n: ReleaseNote): boolean => hasElements(n.features) || hasElements(n.bugFixes) || hasElements(n.improvements) || hasElements(n.tests);

/** Notes whose words contain every word of the query (case-insensitive); all notes for an empty query. */
export const searchNotes = (notes: ReleaseNote[], query: string): ReleaseNote[] => {
    const words = query.toLowerCase().split(/\s+/).filter(w => w !== "");
    if (words.length === 0) return notes;
    return notes.filter(n => {
        const text = [n.title, n.body ?? "", ...n.highlights, ...n.features, ...n.bugFixes, ...n.improvements, ...n.tests].join(" ").toLowerCase();
        return words.every(w => text.includes(w));
    });
};

/** "20 Nov 2026" for an ISO date (read as a calendar date, not shifted by time zone). */
export const noteDate = (iso: string, locale: string = "en-GB"): string => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

/** The block52/cards release-notes file. */
export const DEFAULT_RELEASE_NOTES_URL = "https://raw.githubusercontent.com/block52/cards/refs/heads/main/release-notes/release-notes.json";

/** The configured release-notes URL, or the block52/cards file when the setting is missing or blank. */
export const releaseNotesUrl = (configured: string | undefined): string => (hasContent(configured?.trim()) ? configured.trim() : DEFAULT_RELEASE_NOTES_URL);
