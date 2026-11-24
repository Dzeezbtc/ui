import React from "react";

export type ExplainerGlyph = "key" | "deposit" | "seat" | "verify" | "check" | "plus" | "limit" | "clock" | "loop" | "split" | "chart" | "help" | "heart" | "arrow";

/** Line icons for the explainer pages. */
const PATHS: Record<ExplainerGlyph, React.ReactNode> = {
    key: (
        <>
            <circle cx="8" cy="15" r="4" />
            <path d="M11 12l8-8M16 7l2 2M14 9l2 2" />
        </>
    ),
    deposit: (
        <>
            <rect x="3" y="7" width="18" height="12" rx="3" />
            <path d="M12 3v8M9 8l3 3 3-3M16 13.5h2" />
        </>
    ),
    seat: (
        <>
            <ellipse cx="12" cy="12" rx="9.5" ry="6.5" />
            <ellipse cx="12" cy="12" rx="5.5" ry="3" />
        </>
    ),
    verify: (
        <>
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
        </>
    ),
    check: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.7 2.7L16 9.8" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    limit: (
        <>
            <path d="M4 16a8 8 0 1116 0" />
            <path d="M12 16l4-5M4 19h16" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    loop: (
        <>
            <path d="M4 12a8 8 0 0113.7-5.6L20 9" />
            <path d="M20 4v5h-5M4.5 4.5l15 15" />
        </>
    ),
    split: (
        <>
            <rect x="3" y="4" width="7" height="16" rx="2" />
            <rect x="14" y="4" width="7" height="16" rx="2" />
        </>
    ),
    chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    help: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1.2-1.5 2.3M12 17h.01" />
        </>
    ),
    heart: <path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0112 7a4.5 4.5 0 017.5 3c0 5.5-7.5 10-7.5 10z" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />
};

const ExplainerIcon: React.FC<{ glyph: ExplainerGlyph }> = ({ glyph }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {PATHS[glyph]}
    </svg>
);

export default ExplainerIcon;
