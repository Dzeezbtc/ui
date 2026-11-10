import React, { useEffect, useRef, useState } from "react";
import { FaMusic, FaStop } from "react-icons/fa";
import { useLanguage } from "../../i18n/useLanguage";
import { isNumber, isString } from "../../utils/guards";

const KEY = "b52.table.radio";

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
 */
export const TableRadio: React.FC<{ stations: { name: string; url: string }[] }> = ({ stations }) => {
    const audio = useRef<HTMLAudioElement | null>(null);
    const [open, setOpen] = useState(false);
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
        <div className="absolute left-1/2 -top-12 z-30 -translate-x-1/2">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                title={t("club.radio")}
                aria-label={t("club.radio")}
                aria-expanded={open}
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${playing ? "border-emerald-400 text-emerald-300" : "border-white/20 text-white/80"} bg-black/60 hover:bg-black/80`}
            >
                <FaMusic size={14} />
            </button>
            {open && (
                <div className="absolute left-1/2 top-11 w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-gray-900/95 p-2 shadow-xl" role="menu">
                    {stations.map(s => (
                        <button
                            key={s.url}
                            type="button"
                            role="menuitem"
                            onClick={() => play(s.url)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${playing === s.url ? "bg-emerald-500/15 text-emerald-200" : "text-white hover:bg-white/10"}`}
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
                            className="flex-1"
                            aria-label={t("club.radioVolume")}
                        />
                    </label>
                    {error && <p className="px-3 pb-1 text-xs text-red-300">{error}</p>}
                </div>
            )}
        </div>
    );
};
