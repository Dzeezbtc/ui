import React, { useState } from "react";
import { useClubApi } from "../context/ClubApiContext";
import { httpErrorMessage } from "../apis/HTTPClient";
import { getCosmosAddress, getCosmosMnemonic } from "../utils/cosmos/storage";
import { enablePush, pushSupported } from "../utils/clubService";

/** "Also tell me when the lobby is closed": the browser's own notifications (block52-club#26). */
export const BrowserPush: React.FC<{ handle: string }> = ({ handle }) => {
    const api = useClubApi();
    const address = getCosmosAddress();
    const mnemonic = getCosmosMnemonic();
    const [state, setState] = useState<"idle" | "busy" | "on" | "blocked">(() => (pushSupported() && Notification.permission === "denied" ? "blocked" : "idle"));
    const [error, setError] = useState<string | null>(null);
    if (!api || !address || !mnemonic || !pushSupported()) return null;

    const turnOn = async () => {
        setState("busy");
        setError(null);
        try {
            setState(await enablePush(api, handle, mnemonic, address));
        } catch (err) {
            setState("idle");
            setError(httpErrorMessage(err, "Couldn't turn on browser notifications."));
        }
    };

    return (
        <div className="text-sm">
            {state === "on" ? (
                <p className="text-emerald-200">This browser will show them, even with the lobby closed.</p>
            ) : state === "blocked" ? (
                <p className="text-gray-400">Notifications are blocked for this site in your browser's settings.</p>
            ) : (
                <button type="button" onClick={turnOn} disabled={state === "busy"} className="rounded-lg border border-gray-600 px-3 py-1.5 text-white hover:bg-gray-800 disabled:opacity-50">
                    Also show them when the lobby is closed
                </button>
            )}
            {error && <p className="mt-1 text-red-300">{error}</p>}
        </div>
    );
};
