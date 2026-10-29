import React from "react";
import { Link, useParams } from "react-router-dom";
import { useClubPage } from "../hooks/club/useClubPage";
import { joinButtonLabel, joiningText, membershipText, tableSummary } from "../utils/clubService";

/**
 * /club/:handle: a club's page in the lobby. Players see how the club works,
 * its open tables, and join it with their wallet. Open clubs let them in at
 * once; others put them on the club's waiting list for staff to approve.
 */
const ClubPage: React.FC = () => {
    const { handle = "" } = useParams();
    const { club, status, hasWallet, busy, error, join } = useClubPage(handle);

    if (!club)
        return <div className="min-h-[60vh] flex items-center justify-center px-4 text-gray-300">{error ? <p className="text-red-300">{error}</p> : <p>Loading the club…</p>}</div>;

    const button = joinButtonLabel(club.joining);
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-gray-200">
            <div>
                <div className="text-xs uppercase tracking-[0.2em] text-violet-300/80 font-semibold">♣ Club</div>
                <h1 className="text-3xl font-bold text-white mt-1">{club.name}</h1>
                <div className="text-sm text-gray-400">
                    @{club.handle}
                    {club.union && <> · part of {club.union}</>}
                </div>
                {club.tagline && <p className="mt-3 text-gray-300">{club.tagline}</p>}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                    <div className="text-xs text-gray-400">Members</div>
                    <div className="text-2xl font-bold text-white">{club.members.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                    <div className="text-xs text-gray-400">Open tables</div>
                    <div className="text-2xl font-bold text-white">{club.tables.length}</div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                    <div className="text-xs text-gray-400">ID check (KYC)</div>
                    <div className="text-2xl font-bold text-white">{club.kyc === "none" ? "Not needed" : "Required"}</div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-5 space-y-3">
                <p className="text-sm text-gray-300">{joiningText(club.joining)}</p>
                {status ? (
                    <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${status === "active" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200" : "border-amber-500/50 bg-amber-500/10 text-amber-200"}`}>{membershipText(status)}</div>
                ) : !hasWallet ? (
                    <Link to="/wallet" className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500">
                        Set up your wallet to join
                    </Link>
                ) : (
                    button && (
                        <button type="button" onClick={join} disabled={busy} className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                            {busy ? "Joining…" : button}
                        </button>
                    )
                )}
                <p className="text-xs text-gray-500">Joining signs a one-time message with your wallet. It never moves funds and costs nothing. Your money stays in your own wallet.</p>
                {error && <p className="text-sm text-red-300">{error}</p>}
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900/70">
                <div className="px-5 py-3 border-b border-gray-700 font-semibold text-white">Club tables</div>
                {club.tables.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-gray-400">No tables open right now.</p>
                ) : (
                    <ul className="divide-y divide-gray-800">
                        {club.tables.map(t => (
                            <li key={t.gameId} className="px-5 py-3 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-white truncate">{t.name ?? `${t.gameId.slice(0, 8)}…`}</div>
                                    <div className="text-xs text-gray-400">{tableSummary(t)}</div>
                                </div>
                                <a href={`/table/${t.gameId}`} className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-800">
                                    Open table
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ClubPage;
