import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import type { ClubMessage } from "../utils/clubMessages";
import { messageLink } from "../utils/clubMessages";
import { t } from "../i18n";
import { hasElements, isEmpty } from "../utils/guards";

/**
 * A club's posters, 1 to 3, when the player opens the lobby (block52-club#4).
 * Always skippable; once closed, those posters don't come back. Never over a table.
 */
export const ClubPosters: React.FC<{ posters: ClubMessage[]; dismiss: (id: string) => void }> = ({ posters, dismiss }) => {
    const { pathname } = useLocation();
    const [index, setIndex] = useState(0);
    // The set on screen stays put while it's open, even if new ones arrive.
    const [shown, setShown] = useState<ClubMessage[]>([]);
    const onTable = pathname.startsWith("/table/");
    const ids = posters.map(p => p.id).join(",");

    useEffect(() => {
        if (isEmpty(shown) && hasElements(posters)) {
            setShown(posters);
            setIndex(0);
        }
        // Only when the unseen set changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ids]);

    const close = () => {
        shown.forEach(p => dismiss(p.id));
        setShown([]);
    };

    useEffect(() => {
        if (isEmpty(shown)) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") setIndex(i => Math.min(i + 1, shown.length - 1));
            if (e.key === "ArrowLeft") setIndex(i => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown]);

    if (isEmpty(shown) || onTable) return null;
    const poster = shown[Math.min(index, shown.length - 1)];
    const link = messageLink(poster);
    const body = (
        <>
            {poster.image && <img src={poster.image} alt="" className="w-full max-h-[50vh] object-cover rounded-t-xl" />}
            <div className="p-5">
                {poster.headline && (
                    <h2 dir="auto" className="text-xl font-bold text-white">
                        {poster.headline}
                    </h2>
                )}
                <p dir="auto" className="mt-1 text-gray-200">
                    {poster.text}
                </p>
            </div>
        </>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            role="dialog"
            aria-modal="true"
            aria-label={poster.headline ?? poster.text}
            data-testid="club-posters"
        >
            <div className="relative w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
                <button
                    type="button"
                    onClick={close}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                    aria-label={t("table.close")}
                >
                    <FaTimes size={14} />
                </button>
                {link ? (
                    <Link to={link} onClick={close} className="block hover:opacity-95">
                        {body}
                    </Link>
                ) : (
                    body
                )}
                <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
                    <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => setIndex(i => i - 1)}
                        className="p-2 text-gray-300 disabled:opacity-30"
                        aria-label={t("club.previous")}
                    >
                        <FaChevronLeft />
                    </button>
                    <div className="flex gap-2">
                        {shown.map((p, i) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setIndex(i)}
                                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-gray-600"}`}
                                aria-label={t("club.posterOf", { n: i + 1, total: shown.length })}
                            />
                        ))}
                    </div>
                    {index < shown.length - 1 ? (
                        <button type="button" onClick={() => setIndex(i => i + 1)} className="p-2 text-gray-300" aria-label={t("club.next")}>
                            <FaChevronRight />
                        </button>
                    ) : (
                        <button type="button" onClick={close} className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">
                            {link ? t("club.close") : t("club.done")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
