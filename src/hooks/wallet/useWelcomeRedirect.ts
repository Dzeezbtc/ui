import { hasValue } from "../../utils/guards";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustodySession } from "../../utils/custody/session";
import { WELCOME_PENDING_KEY, WELCOME_SEEN_KEY, shouldOfferWelcome } from "../../utils/welcomeSetup";

const flag = (key: string): boolean => {
    try {
        return localStorage.getItem(key) === "1";
    } catch {
        return false;
    }
};

/** useWelcomeRedirect: sends a visitor whose wallet was just made to the first-visit setup at /welcome, once. */
export const useWelcomeRedirect = (enabled: boolean): void => {
    const navigate = useNavigate();
    useEffect(() => {
        if (!enabled) return;
        if (shouldOfferWelcome({ pending: flag(WELCOME_PENDING_KEY), hasCustody: hasValue(getCustodySession()), seen: flag(WELCOME_SEEN_KEY) })) {
            navigate("/welcome", { replace: true });
        }
    }, [enabled, navigate]);
};
