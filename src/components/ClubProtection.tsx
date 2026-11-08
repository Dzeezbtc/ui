import React, { useState } from "react";
import { useClubApi } from "../context/ClubApiContext";
import { httpErrorMessage } from "../apis/HTTPClient";
import { getCosmosAddress, getCosmosMnemonic } from "../utils/cosmos/storage";
import { protect, protectionText, type ProtectionRequest, type ProtectionState } from "../utils/clubService";

const field = "rounded-lg border border-gray-600 bg-gray-950 px-3 py-2 text-sm text-white";
const button = "rounded-lg border border-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-40";

/** A member's own deposit limit, breaks and self-exclusion at a club (block52-club#13). Each change is signed by their wallet. */
export const ClubProtection: React.FC<{ handle: string; clubName: string }> = ({ handle, clubName }) => {
    const api = useClubApi();
    const address = getCosmosAddress();
    const mnemonic = getCosmosMnemonic();
    const [state, setState] = useState<ProtectionState | null>(null);
    const [limit, setLimit] = useState("");
    const [days, setDays] = useState<1 | 7 | 30>(7);
    const [months, setMonths] = useState<6 | 12 | 60 | "permanent">(6);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = async (request: ProtectionRequest, confirmText?: string) => {
        if (!api || !address || !mnemonic) return;
        if (confirmText && !window.confirm(confirmText)) return;
        setBusy(true);
        setError(null);
        try {
            setState(await protect(api, handle, mnemonic, address, request));
        } catch (err) {
            setError(httpErrorMessage(err, "That didn't work. Try again."));
        } finally {
            setBusy(false);
        }
    };

    if (!api || !address || !mnemonic) return null;
    const blocked = state && state.status !== "active" && state.status !== "pending";
    const money = (n: number | null) => (n === null ? "none" : `$${n}/day`);

    return (
        <details className="rounded-xl border border-gray-700 bg-gray-900/70 p-4" onToggle={e => (e.currentTarget.open && !state ? send({ action: "view" }) : undefined)}>
            <summary className="cursor-pointer text-sm font-semibold text-white">Your limits and breaks</summary>
            <div className="mt-3 space-y-4 text-sm">
                <p className="text-gray-400">Look after your play at {clubName}. A tighter limit counts straight away; loosening it takes a day. Breaks and self-exclusion can't be ended early, by you or the club.</p>
                {error && <p className="text-red-300">{error}</p>}
                {!state && busy && <p className="text-gray-400">Loading…</p>}
                {state && (
                    <>
                        <p className={blocked ? "text-amber-200" : "text-gray-300"}>{protectionText(state)}</p>
                        <div>
                            <div className="text-gray-300">
                                Daily deposit limit: <b>{money(state.depositLimit.counts)}</b>
                                {state.depositLimit.club !== null && state.depositLimit.yours !== null && <span className="text-gray-500"> (the lower of yours and the club's)</span>}
                            </div>
                            {state.depositLimit.waiting && (
                                <div className="text-xs text-gray-500">
                                    Changing to {money(state.depositLimit.waiting.depositPerDay)} on {new Date(state.depositLimit.waiting.from).toLocaleString()}.
                                </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                                <input className={`${field} w-32`} inputMode="decimal" placeholder="$ per day" value={limit} onChange={e => setLimit(e.target.value.replace(/[^0-9.]/g, ""))} aria-label="Daily deposit limit" />
                                <button type="button" className={button} disabled={busy || !limit} onClick={() => send({ action: "limit", depositPerDay: Number(limit) }).then(() => setLimit(""))}>
                                    Set limit
                                </button>
                                {state.depositLimit.yours !== null && (
                                    <button type="button" className={button} disabled={busy} onClick={() => send({ action: "limit", depositPerDay: null })}>
                                        Remove my limit
                                    </button>
                                )}
                            </div>
                        </div>
                        {!blocked && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-300">Take a break for</span>
                                <select className={field} value={days} onChange={e => setDays(Number(e.target.value) as 1 | 7 | 30)} aria-label="Break length">
                                    <option value={1}>1 day</option>
                                    <option value={7}>7 days</option>
                                    <option value={30}>30 days</option>
                                </select>
                                <button type="button" className={button} disabled={busy} onClick={() => send({ action: "cool-off", days }, `Take a ${days}-day break from ${clubName}? You won't be able to play at its tables until it ends, and it can't be ended early.`)}>
                                    Start break
                                </button>
                            </div>
                        )}
                        {state.status !== "self-excluded" || state.until ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-300">Exclude myself for</span>
                                <select className={field} value={String(months)} onChange={e => setMonths(e.target.value === "permanent" ? "permanent" : (Number(e.target.value) as 6 | 12 | 60))} aria-label="Self-exclusion length">
                                    <option value="6">6 months</option>
                                    <option value="12">12 months</option>
                                    <option value="60">5 years</option>
                                    <option value="permanent">Permanently</option>
                                </select>
                                <button
                                    type="button"
                                    className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-200 hover:bg-red-950 disabled:opacity-40"
                                    disabled={busy}
                                    onClick={() => send({ action: "exclude", months }, `Exclude yourself from ${clubName} ${months === "permanent" ? "permanently" : `for ${months} months`}? This can't be undone or shortened.`)}
                                >
                                    Exclude me
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </details>
    );
};
