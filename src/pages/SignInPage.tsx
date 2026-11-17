import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { features } from "../config/features";
import { custodyBase, custodySignIn } from "../utils/custody/session";

/**
 * Two ways in (block52-club#47):
 *  1. The built-in wallet: what the app has always done. Your key lives in this browser.
 *  2. A club account: the username and password you made at the club's /register. Block52 holds your key and signs
 *     for you; your USDC balance shows in the header.
 */
export const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<"choose" | "club">("choose");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const clubConfigured = features.clubAccounts && !!custodyBase();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            await custodySignIn(username.trim(), password);
            // Everything that read the wallet at load (the cached clients, the header) starts clean on the new identity.
            window.location.assign("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't sign in.");
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/80 p-6 space-y-5">
                <h1 className="text-2xl font-bold text-white text-center">Sign in</h1>
                {mode === "choose" ? (
                    <div className="space-y-3">
                        <button type="button" className="w-full rounded-lg border border-gray-600 px-4 py-3 text-left hover:border-violet-400" onClick={() => navigate("/wallet")}>
                            <div className="font-semibold text-white">Use my built-in wallet</div>
                            <div className="text-sm text-gray-400">Your key stays in this browser. Create, import or back up your seed phrase.</div>
                        </button>
                        <button type="button" disabled={!clubConfigured} className="w-full rounded-lg border border-gray-600 px-4 py-3 text-left hover:border-violet-400 disabled:opacity-50" onClick={() => setMode("club")}>
                            <div className="font-semibold text-white">Sign in with my club account</div>
                            <div className="text-sm text-gray-400">{clubConfigured ? "Username and password. Block52 holds your keys and signs for you." : "No club service is configured for this app."}</div>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <label className="block">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Username</span>
                            <input className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-white" value={username} autoComplete="username" autoCapitalize="none" onChange={e => setUsername(e.target.value)} />
                        </label>
                        <label className="block">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Password</span>
                            <input className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-white" type="password" value={password} autoComplete="current-password" onChange={e => setPassword(e.target.value)} />
                        </label>
                        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                        <button type="submit" disabled={busy || !username.trim() || !password} className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
                            {busy ? "Signing in…" : "Sign in"}
                        </button>
                        <button type="button" className="w-full text-sm text-gray-400 hover:text-white" onClick={() => setMode("choose")}>
                            Back
                        </button>
                    </form>
                )}
                <p className="text-center text-xs text-gray-500">
                    No club account yet? Make one at the club's <span className="text-gray-300">/register</span> page. <Link to="/" className="text-violet-300">Home</Link>
                </p>
            </div>
        </div>
    );
};
