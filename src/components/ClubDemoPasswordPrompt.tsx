import React, { useCallback, useEffect, useState } from "react";
import { onClubDemoPasswordNeeded, setClubDemoPassword } from "../utils/clubDemoAccess";
import { hasContent } from "../utils/guards";

/**
 * Asks for the club demo's password when the club service refuses a request
 * (utils/clubDemoAccess), saves it in this browser and reloads, so every club
 * screen tries again with it.
 */
export const ClubDemoPasswordPrompt: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");

    useEffect(() => onClubDemoPasswordNeeded(() => setOpen(true)), []);

    const save = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!hasContent(password.trim())) return;
            setClubDemoPassword(password.trim());
            window.location.reload();
        },
        [password]
    );

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="club-demo-password-title">
            <form onSubmit={save} className="w-full max-w-sm rounded-xl border border-gray-700 bg-gray-900 p-6 text-white shadow-2xl">
                <h2 id="club-demo-password-title" className="mb-2 text-lg font-semibold">
                    Club demo password
                </h2>
                <p className="mb-4 text-sm text-gray-300">The club features on this site use a password-protected demo. Enter the demo password to see them.</p>
                <input
                    type="password"
                    autoFocus
                    aria-label="Demo password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mb-4 w-full rounded-lg border border-gray-600 bg-gray-950 px-3 py-2 text-white"
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                        Not now
                    </button>
                    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
};
