import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useClubApi } from "../context/ClubApiContext";
import { newNotifications } from "../utils/clubService";
import { getCosmosAddress } from "../utils/cosmos/storage";

/**
 * Shows what clubs are telling this player (block52-club#26): only what they
 * opted in to. It works while the lobby is open. Telegram covers when it isn't.
 */
export const ClubNotifier: React.FC = () => {
    const api = useClubApi();
    const shown = useRef(new Set<string>());
    useEffect(() => {
        const address = getCosmosAddress();
        if (!api || !address) return;
        const check = async () => {
            try {
                const { notifications } = await api.getNotifications(address);
                for (const n of newNotifications(notifications, shown.current)) {
                    shown.current.add(n.key);
                    toast.info(`${n.title}. ${n.body}`);
                    if ("Notification" in window && Notification.permission === "granted" && document.hidden) new Notification(n.title, { body: n.body });
                }
            } catch (err) {
                console.error("Couldn't check for club notifications:", err);
            }
        };
        check();
        const timer = setInterval(check, 60_000);
        return () => clearInterval(timer);
    }, [api]);
    return null;
};
