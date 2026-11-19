import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaMusic, FaStop } from "react-icons/fa";
import { useLanguage } from "../../i18n/useLanguage";
import { hasValue, isNumber, isString } from "../../utils/guards";
import { popoverPosition } from "../../utils/provablyFair/presentation";
import styles from "./ProvablyFair/ProvablyFair.module.css";
import { useTableStyle } from "../../context/TableStyleContext";

const KEY = "b52.table.radio";
const PANEL_WIDTH = 224;

/** Last station and volume, kept in this browser only. */
export function readRadioPrefs(): { url: string | null; volume: number } {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as { url?: unknown; volume?: unknown };
        const volume = isNumber(raw.volume) && raw.volume >= 0 && raw.volume <= 1 ? raw.volume : 0.5;
        return { url: isString(raw.url) ? raw.url : null, volume };
    } catch {
        return { url: null, volume: 0.5 };
    }
}
function saveRadioPrefs(p: { url: string | null; volume: number }) {
    try {
        localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
        // Private mode: just don't remember.
    }
}

/**
 * The table radio (block52-club#46): the club's stations, played in the page.
 * Never starts by itself; stops when the player leaves the table.
 * Sits in the table header beside the provably fair shield and matches it.
 */
export const TableRadio: React.FC<{ stations: { name: string; url: string }[] }> = ({ stations }) => {
    const look = useTableStyle();
    const audio = useRef<HTMLAudioElement | null>(null);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelAt, setPanelAt] = useState<{ top: number; left: number } | null>(null);
    const [playing, setPlaying] = useState<string | null>(null);
    const [volume, setVolume] = useState(() => readRadioPrefs().volume);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();
    const last = readRadioPrefs().url;

    useEffect(
        () => () => {
            audio.current?.pause();
            audio.current = null;
        },
        []
    );

    const toggle = useCallback(() => {
        if (hasValue(panelAt)) return setPanelAt(null);
        const rect = anchorRef.current?.getBoundingClientRect();
        if (rect) setPanelAt(popoverPosition(rect, PANEL_WIDTH, window.innerWidth));
    }, [panelAt]);

    // Close the list on an outside click or Escape; the music keeps playing.
    useEffect(() => {
        if (!hasValue(panelAt)) return;
        const onDown = (e: MouseEvent) => {
            if (!(e.target instanceof Node)) return;
            if (!panelRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) setPanelAt(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPanelAt(null);
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [panelAt]);

    const stop = () => {
        audio.current?.pause();
        audio.current = null;
        setPlaying(null);
    };
    const play = (url: string) => {
        if (playing === url) return stop();
        stop();
        setError(null);
        const a = new Audio(url);
        a.volume = volume;
        audio.current = a;
        a.play().then(
            () => setPlaying(url),
            () => {
                setError(t("club.radioFailed"));
                audio.current = null;
            }
        );
        saveRadioPrefs({ url, volume });
    };

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                onClick={toggle}
                title={t("club.radio")}
                aria-label={t("club.radio")}
                aria-expanded={hasValue(panelAt)}
                aria-haspopup="menu"
                className={styles.badge}
                data-testid="table-radio"
                data-playing={playing ? "true" : undefined}
                style={playing ? { borderColor: "#a78bfa" } : undefined}
            >
                <FaMusic size={12} className={`${styles.badgeIcon} ${playing ? "animate-pulse" : ""}`} />
            </button>
            {panelAt &&
                createPortal(
                    <div
                        ref={panelRef}
                        data-look={look}
                        className="fs-radio-panel fixed z-[10000] w-56 rounded-xl border border-white/10 bg-[rgba(13,11,23,0.55)] p-2 shadow-xl backdrop-blur-[3px]"
                        style={{ top: panelAt.top, left: panelAt.left }}
                        role="menu"
                        data-testid="table-radio-menu"
                    >
                        {stations.map(s => (
                            <button
                                key={s.url}
                                type="button"
                                role="menuitem"
                                onClick={() => play(s.url)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${playing === s.url ? "bg-violet-500/20 text-violet-200" : "text-white hover:bg-white/10"}`}
                            >
                                <span>
                                    {s.name}
                                    {!playing && last === s.url && <span className="ml-1 text-xs text-white/40">{t("club.radioLast")}</span>}
                                </span>
                                {playing === s.url && <FaStop size={10} />}
                            </button>
                        ))}
                        <label className="mt-1 flex items-center gap-2 px-3 py-1 text-xs text-white/60">
                            {t("club.volume")}
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={volume}
                                onChange={e => {
                                    const v = Number(e.target.value);
                                    setVolume(v);
                                    if (audio.current) audio.current.volume = v;
                                    saveRadioPrefs({ url: playing ?? last, volume: v });
                                }}
                                className="flex-1 accent-violet-400"
                                aria-label={t("club.radioVolume")}
                            />
                        </label>
                        {error && <p className="px-3 pb-1 text-xs text-red-300">{error}</p>}
                    </div>,
                    document.body
                )}
        </>
    );
};
