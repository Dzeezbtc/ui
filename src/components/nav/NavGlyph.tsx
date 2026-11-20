import React from "react";
import type { NavIcon } from "../../utils/siteNav";

type Glyph = NavIcon | "search" | "user" | "key" | "gear" | "more";

/** The line icons the site navigation draws (same set as the redesign concept). */
const PATHS: Record<Glyph, React.ReactNode> = {
    play: (
        <>
            <ellipse cx="12" cy="12" rx="9.5" ry="6.5" />
            <ellipse cx="12" cy="12" rx="5.5" ry="3" />
        </>
    ),
    wallet: (
        <>
            <rect x="3" y="6" width="18" height="13" rx="3" />
            <path d="M16 12.5h2M3 10h18" />
        </>
    ),
    hands: (
        <>
            <rect x="4" y="4" width="11" height="15" rx="2" transform="rotate(-8 9 11)" />
            <rect x="10" y="5" width="11" height="15" rx="2" transform="rotate(8 15 12)" />
        </>
    ),
    explorer: (
        <>
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
            <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </>
    ),
    distribution: <path d="M4 20V13M9.3 20V8M14.6 20v-5M20 20V4M3 20h18" />,
    nodes: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
        </>
    ),
    players: (
        <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
            <circle cx="17" cy="9" r="2.6" />
            <path d="M17 14.3c2.4.2 4 1.8 4.6 4.7" />
        </>
    ),
    awards: (
        <>
            <circle cx="12" cy="9" r="6" />
            <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
        </>
    ),
    notes: (
        <>
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M14 3v5h5M9 13h7M9 17h5" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8.5" r="4" />
            <path d="M4 21c1-4.2 4.1-6.5 8-6.5s7 2.3 8 6.5" />
        </>
    ),
    key: (
        <>
            <circle cx="8" cy="14" r="4.5" />
            <path d="M11.2 10.8L20 2M16 6l3 3M14 8l2.5 2.5" />
        </>
    ),
    gear: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
        </>
    ),
    more: (
        <>
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
        </>
    )
};

export const NavGlyph: React.FC<{ icon: Glyph }> = ({ icon }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {PATHS[icon]}
    </svg>
);
