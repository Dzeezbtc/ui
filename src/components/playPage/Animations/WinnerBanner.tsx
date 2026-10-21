import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useWinnerInfo } from "../../../hooks/game/useWinnerInfo";
import { winnerBannerText, winnerBannerTop } from "../../../utils/winnerBanner";
import { useProfileAvatar } from "../../../context/profile/ProfileAvatarContext";
import { NftAvatarImage } from "../../profile/NftAvatarImage";
import "./WinnerBanner.css";

/** How long the last-pot banner rolls before it unmounts (ms); matches the CSS animation. */
const BANNER_MS = 7000;

/**
 * Last-pot winner banner (ui#848): a brief, non-intrusive readout of who won the
 * last pot and how much. After a pot is awarded it rolls right-to-left across the
 * middle of the screen above the table, then fades — a calmer alternative to
 * the gold celebration (ui#847) that still tells you who won. Handles split pots.
 */
const WinnerBanner: React.FC = () => {
    const { winnerInfo } = useWinnerInfo();
    const { getAvatarForAddress } = useProfileAvatar();
    const [text, setText] = useState<string | null>(null);
    // The sole winner's address, for their avatar/NFT; null for a split pot.
    const [winnerAddress, setWinnerAddress] = useState<string | null>(null);
    // Measured when a banner starts, so it clears the header at any window size.
    const [top, setTop] = useState<number>(() => winnerBannerTop(null));
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        const next = winnerBannerText(winnerInfo);
        if (!next) return; // no winners this frame — leave the current banner to time out
        setText(next);
        setTop(winnerBannerTop(document.querySelector(".sub-header")?.getBoundingClientRect().bottom ?? null));
        setWinnerAddress(winnerInfo && winnerInfo.length === 1 ? winnerInfo[0].address : null);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setText(null), BANNER_MS);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [winnerInfo]);

    if (!text) return null;

    // The winner's avatar (an NFT when they've linked one) leads the banner.
    const avatarUrl = winnerAddress ? getAvatarForAddress(winnerAddress) : null;

    // Portal to <body>: the banner rolls across the screen, so it must not be
    // positioned (or scaled) by the table stage it's mounted from. Keyed on the
    // text so a new pot restarts the roll.
    return createPortal(
        <div key={text} className="b52-winner-banner" style={{ top }} role="status" aria-live="polite">
            {avatarUrl && (
                <NftAvatarImage
                    src={avatarUrl}
                    alt="Winner avatar"
                    imgClassName="b52-winner-banner__avatar"
                    chipClassName="b52-winner-banner__avatar"
                    fallbackClassName="b52-winner-banner__avatar"
                />
            )}
            <span className="b52-winner-banner__trophy" aria-hidden="true">
                🏆
            </span>
            <span className="b52-winner-banner__text">{text}</span>
        </div>,
        document.body
    );
};

export default WinnerBanner;
