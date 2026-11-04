import { useCallback, useEffect, useState } from "react";
import { useClubApi } from "../../context/ClubApiContext";
import { useLanguage } from "../../i18n/useLanguage";
import { getCosmosAddress } from "../../utils/cosmos/storage";
import { ClubMessage, markMessageSeen, nextMessage, readSeenMessages } from "../../utils/clubMessages";

const POLL_MS = 60_000;

/**
 * What the player's clubs have sent them, in the player's language. A language
 * change fetches again, so a message on screen switches with it.
 */
export function useClubMessages() {
    const api = useClubApi();
    const { language } = useLanguage();
    const [messages, setMessages] = useState<ClubMessage[]>([]);
    const [seen, setSeen] = useState<string[]>(readSeenMessages);
    const address = getCosmosAddress();

    useEffect(() => {
        if (!api || !address) return;
        const load = async () => {
            try {
                const res = await api.getPlayerMessages(address, language);
                setMessages(res.messages);
            } catch (err) {
                console.error("Could not load club messages:", err);
            }
        };
        load();
        const interval = setInterval(load, POLL_MS);
        return () => clearInterval(interval);
    }, [api, address, language]);

    const dismiss = useCallback((id: string) => {
        markMessageSeen(id);
        setSeen(readSeenMessages());
    }, []);

    return { banner: nextMessage(messages, "banner", seen), dropdown: nextMessage(messages, "dropdown", seen), dismiss };
}
