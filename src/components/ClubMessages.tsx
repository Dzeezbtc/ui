import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useClubMessages } from "../hooks/club/useClubMessages";
import { messageLink } from "../utils/clubMessages";
import { t } from "../i18n";
import "./ClubMessages.css";

/** A banner scrolls past 4 times (promos.bannerPasses); a drop-down stays a minute. */
const BANNER_PASS_MS = 15_000;
const BANNER_PASSES = 4;
const DROPDOWN_MS = 60_000;

/** Banners from the player's clubs along the top of the lobby, and drop-downs on any page. */
export const ClubMessages: React.FC = () => {
    const { banner, dropdown, dismiss } = useClubMessages();
    const { pathname } = useLocation();
    const onTable = pathname.startsWith("/table/") && pathname !== "/table/admin";
    const bannerLink = banner ? messageLink(banner) : null;
    const dropdownLink = dropdown ? messageLink(dropdown) : null;

    const dropdownId = dropdown?.id;
    useEffect(() => {
        if (!dropdownId) return;
        const timer = setTimeout(() => dismiss(dropdownId), DROPDOWN_MS);
        return () => clearTimeout(timer);
    }, [dropdownId, dismiss]);

    return (
        <>
            {banner && !onTable && (
                <div className="b52-club-banner" data-testid="club-banner">
                    <div
                        key={banner.id}
                        className="b52-club-banner__text"
                        dir="auto"
                        style={{ animationDuration: `${BANNER_PASS_MS}ms`, animationIterationCount: BANNER_PASSES }}
                        onAnimationEnd={() => dismiss(banner.id)}
                    >
                        {bannerLink ? <Link to={bannerLink}>{banner.text}</Link> : banner.text}
                    </div>
                    <button type="button" className="b52-club-banner__close" onClick={() => dismiss(banner.id)} aria-label={t("table.close")}>
                        <FaTimes size={11} />
                    </button>
                </div>
            )}
            {dropdown && (
                <div className="b52-club-dropdown" role="status" data-testid="club-dropdown">
                    <p dir="auto" className="b52-club-dropdown__text">
                        {dropdownLink ? <Link to={dropdownLink}>{dropdown.text}</Link> : dropdown.text}
                    </p>
                    <button type="button" className="b52-club-dropdown__close" onClick={() => dismiss(dropdown.id)} aria-label={t("table.close")}>
                        <FaTimes size={12} />
                    </button>
                </div>
            )}
        </>
    );
};
