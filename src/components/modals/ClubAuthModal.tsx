import React, { useState } from "react";
import { Modal } from "../common";
import { custodyRegister, custodySignIn } from "../../utils/custody/session";

interface ClubAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Where to start. */
    initialMode?: "signin" | "register";
    /** After a successful sign-in or sign-up. Default: reload, so everything that read the wallet at load starts on the new identity. */
    onSignedIn?: () => void;
}

const field = "w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-white";
const label = "block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1";

/**
 * Sign in or create a club account (block52-club#47), straight against the club API: no hop to the club's site.
 * "Advanced" on Create account takes a seed phrase or private key as one text box; the API works out which it is.
 */
const ClubAuthModal: React.FC<ClubAuthModalProps> = ({ isOpen, onClose, initialMode = "signin", onSignedIn = () => window.location.reload() }) => {
    const [mode, setMode] = useState<"signin" | "register">(initialMode);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [advanced, setAdvanced] = useState(false);
    const [secret, setSecret] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const switchTo = (m: "signin" | "register") => {
        setMode(m);
        setError("");
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            if (mode === "signin") await custodySignIn(username.trim(), password);
            else await custodyRegister(username.trim(), password, advanced ? secret : undefined);
            onSignedIn();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
            setBusy(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === "signin" ? "Sign in" : "Create account"}>
            <form onSubmit={submit} className="space-y-4" data-testid="club-auth-form">
                <div className="flex rounded-lg border border-gray-700 p-0.5 text-sm" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "signin"}
                        className={`flex-1 rounded-md px-3 py-1.5 ${mode === "signin" ? "bg-violet-600 text-white" : "text-gray-400"}`}
                        onClick={() => switchTo("signin")}
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "register"}
                        className={`flex-1 rounded-md px-3 py-1.5 ${mode === "register" ? "bg-violet-600 text-white" : "text-gray-400"}`}
                        onClick={() => switchTo("register")}
                    >
                        Create account
                    </button>
                </div>
                <label className="block">
                    <span className={label}>Username</span>
                    <input className={field} value={username} autoComplete="username" autoCapitalize="none" onChange={e => setUsername(e.target.value)} />
                </label>
                <label className="block">
                    <span className={label}>Password</span>
                    <input
                        className={field}
                        type="password"
                        value={password}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        onChange={e => setPassword(e.target.value)}
                    />
                </label>
                {mode === "register" && (
                    <div>
                        <button
                            type="button"
                            className="text-sm text-violet-300 hover:text-violet-200"
                            aria-expanded={advanced}
                            onClick={() => setAdvanced(a => !a)}
                        >
                            {advanced ? "Hide advanced" : "Advanced"}
                        </button>
                        {advanced && (
                            <label className="block mt-2">
                                <span className={label}>Seed phrase or private key (optional)</span>
                                <textarea
                                    className={`${field} font-mono text-sm`}
                                    rows={3}
                                    value={secret}
                                    spellCheck={false}
                                    autoComplete="off"
                                    onChange={e => setSecret(e.target.value)}
                                    placeholder="Paste a 12 to 24 word seed phrase, or a 64 character hex key. Leave empty to get a new account."
                                />
                            </label>
                        )}
                    </div>
                )}
                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={busy || !username.trim() || !password}
                    className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                >
                    {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
                <p className="text-center text-xs text-gray-500">
                    Block52 holds the key for a club account and signs for you. Prefer your own key? Use the built-in wallet instead.
                </p>
            </form>
        </Modal>
    );
};

export default ClubAuthModal;
