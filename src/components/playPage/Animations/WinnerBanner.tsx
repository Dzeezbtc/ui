import React, { useEffect, useRef, useState } from "react";
import { useWinnerInfo } from "../../../hooks/game/useWinnerInfo";
import { winnerBannerText } from "../../../utils/winnerBanner";
import "./WinnerBanner.css";

/** How long the last-pot banner stays up before it fades (ms). */
const BANNER_MS = 5000;

/**
 * Last-pot winner banner (ui#848): a brief, non-intrusive readout of who won the
 * last pot and how much. Shows for a few seconds after a pot is awarded, then
 * fades — a calmer alternative to the gold celebration (ui#847) that still tells
 * you who won. Handles split pots.
 */
const WinnerBanner: React.FC = () => {
    const { winnerInfo } = useWinnerInfo();
    const [text, setText] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        const next = winnerBannerText(winnerInfo);
        if (!next) return; // no winners this frame — leave the current banner to time out
        setText(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setText(null), BANNER_MS);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [winnerInfo]);

    if (!text) return null;

    return (
        <div className="b52-winner-banner" role="status" aria-live="polite">
            <span className="b52-winner-banner__trophy" aria-hidden="true">
                🏆
            </span>
            <span className="b52-winner-banner__text">{text}</span>
        </div>
    );
};

export default WinnerBanner;
