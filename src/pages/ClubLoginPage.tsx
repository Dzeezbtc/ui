import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCosmosAddress, getCosmosMnemonic } from "../utils/cosmos/storage";
import { handoffUrl, parseAllowList, readClubLoginRequest, signChallenge } from "../utils/clubLogin";
import { ClubApi } from "../apis/Api";
import { httpErrorMessage } from "../apis/HTTPClient";

/**
 * /club-login: signs a club staff member into the club console with the
 * wallet they already use here. The console sent them; we ask the club
 * service for a one-time challenge, the player approves, the wallet signs,
 * and we send them back to the console to finish.
 */
const ClubLoginPage: React.FC = () => {
    const location = useLocation();
    const consoles = parseAllowList(import.meta.env.VITE_CLUB_CONSOLE_URLS);
    const services = parseAllowList(import.meta.env.VITE_CLUB_SERVICE_URLS);
    const parsed = useMemo(() => readClubLoginRequest(location.search, consoles, services), [location.search, consoles, services]);
    const address = getCosmosAddress();
    const hasWallet = !!getCosmosMnemonic() && !!address;
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const approve = async () => {
        if (!parsed.ok || !address) return;
        setBusy(true);
        setError(null);
        try {
            // The console named the club service (checked against the allow-list above).
            const body = await new ClubApi({ baseUrl: parsed.request.api, secure: false, timeout: 10_000 }).getSignInChallenge(address, parsed.request.club);
            const signed = await signChallenge(getCosmosMnemonic()!, body.text);
            if (signed.address !== address) throw new Error("Your stored wallet doesn't match its address. Re-import it on the Wallet page.");
            window.location.href = handoffUrl(parsed.request.returnTo, { club: parsed.request.club, address, nonce: body.nonce, signature: signed.signature, pubkey: signed.pubkey });
        } catch (e) {
            console.error("Club login failed:", e);
            setError(httpErrorMessage(e, "The club service didn't answer."));
            setBusy(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/80 p-6 text-gray-200">
                <h1 className="text-2xl font-bold text-white">Club login</h1>
                {!parsed.ok ? (
                    <p className="mt-4 text-sm text-red-300">{parsed.error}</p>
                ) : !hasWallet ? (
                    <div className="mt-4 space-y-3 text-sm">
                        <p>You need your Block52 wallet on this device to sign in to a club console.</p>
                        <Link to="/wallet" className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500">
                            Open your wallet
                        </Link>
                    </div>
                ) : (
                    <div className="mt-4 space-y-4 text-sm">
                        <p>
                            Sign in to the <b>@{parsed.request.club}</b> club console at <span className="font-mono text-xs">{new URL(parsed.request.returnTo).origin}</span>?
                        </p>
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 px-3 py-2">
                            <div className="text-xs text-gray-400">Your wallet</div>
                            <div className="font-mono text-xs break-all">{address}</div>
                        </div>
                        <p className="text-xs text-gray-400">Your wallet signs a one-time message. It proves you own this wallet, never moves funds and costs nothing. Your role comes from the club's staff list.</p>
                        {error && <p className="text-red-300">{error}</p>}
                        <div className="flex gap-2">
                            <button type="button" onClick={approve} disabled={busy} className="flex-1 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50">
                                {busy ? "Signing…" : "Sign in"}
                            </button>
                            <Link to="/" className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">
                                Cancel
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClubLoginPage;
