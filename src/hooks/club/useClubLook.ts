import { useEffect, useLayoutEffect, useState } from "react";
import { useClubApi } from "../../context/ClubApiContext";
import { safeLook, type ClubLook } from "../../utils/clubLook";
import { applyBrandOverride } from "../../utils/brandOverride";
import { colors } from "../../utils/colorConfig";
import { showClubLanguage } from "../../i18n";

/** A table's club look, or null for an ordinary table or when there's no club service. */
export const useClubLook = (gameId: string | undefined): ClubLook | null => {
    const api = useClubApi();
    const [look, setLook] = useState<ClubLook | null>(null);
    useEffect(() => {
        if (!api || !gameId) return;
        let on = true;
        api.getTableLook(gameId).then(
            r => {
                if (on) setLook(safeLook(r.look));
            },
            err => console.error("Couldn't load the club's look:", err)
        );
        return () => {
            on = false;
        };
    }, [api, gameId]);
    return look;
};

/**
 * Wears a club's colours and default language while its page or table is open
 * (block52-club#39), and puts the lobby's back on leaving. Returns a number
 * that changes when the colours do, so the caller re-renders with them.
 */
export const useClubBranding = (look: ClubLook | null): number => {
    const [applied, setApplied] = useState(0);
    const primary = look?.primaryColor ?? null;
    const accent = look?.accentColor ?? null;
    useLayoutEffect(() => {
        if (!primary && !accent) return;
        const restore = applyBrandOverride(colors, primary, accent);
        setApplied(n => n + 1);
        return () => {
            restore();
            setApplied(n => n + 1);
        };
    }, [primary, accent]);
    const language = look?.language;
    useEffect(() => (language ? showClubLanguage(language) : undefined), [language]);
    return applied;
};
