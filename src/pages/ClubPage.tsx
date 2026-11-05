import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useClubPage } from "../hooks/club/useClubPage";
import { isEmpty } from "../utils/guards";
import { canSubmitJoin, clubAsksForKyc, joinButtonLabel, joiningText, membershipText, tableSummary, type ClubTerms } from "../utils/clubService";

const box = "rounded-xl border border-gray-700 bg-gray-900/70";
const field = "w-full rounded-lg border border-gray-600 bg-gray-950 px-3 py-2 text-sm text-white";

/** What a player reads and agrees to before joining. */
const Agreements: React.FC<{ info: ClubTerms; terms: boolean; rules: boolean; setTerms: (v: boolean) => void; setRules: (v: boolean) => void }> = ({ info, terms, rules, setTerms, setRules }) => (
    <div className="space-y-3">
        {info.terms && (
            <div>
                <div className="text-sm font-semibold text-white mb-1">Terms (version {info.terms.version})</div>
                <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-700 bg-gray-950 p-3 text-xs text-gray-300">{info.terms.body}</div>
                <label className="mt-2 flex items-start gap-2 text-sm text-gray-200">
                    <input type="checkbox" className="mt-0.5" checked={terms} onChange={e => setTerms(e.target.checked)} />
                    I've read and accept these terms
                </label>
            </div>
        )}
        {info.houseRulesAccept && (
            <div>
                <div className="text-sm font-semibold text-white mb-1">House rules</div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-gray-950 p-3 text-xs text-gray-300 space-y-2">
                    {info.houseRules.map(g => (
                        <div key={g.title}>
                            <div className="font-semibold text-gray-200">{g.title}</div>
                            <ul className="list-disc pl-4">
                                {g.rules.map(r => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <label className="mt-2 flex items-start gap-2 text-sm text-gray-200">
                    <input type="checkbox" className="mt-0.5" checked={rules} onChange={e => setRules(e.target.checked)} />
                    I've read and accept the house rules
                </label>
            </div>
        )}
    </div>
);

/**
 * /club/:handle: a club's page in the lobby. Players see how the club works,
 * its open tables, and join it with their wallet. Open clubs let them in at
 * once; others put them on the club's waiting list for staff to approve.
 */
const ClubPage: React.FC = () => {
    const { handle = "" } = useParams();
    const { club, info, status, termsOutdated, welcome, seatRules, kycSent, hasWallet, busy, error, join, acceptNewTerms, sendKyc } = useClubPage(handle);
    const [inviteCode, setInviteCode] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedHouseRules, setAcceptedHouseRules] = useState(false);
    const [kyc, setKyc] = useState({ fullName: "", birthDate: "", country: "" });

    if (!club)
        return <div className="min-h-[60vh] flex items-center justify-center px-4 text-gray-300">{error ? <p className="text-red-300">{error}</p> : <p>Loading the club…</p>}</div>;

    const button = joinButtonLabel(club.joining, inviteCode);
    const ready = canSubmitJoin(info, { acceptedTerms, acceptedHouseRules });
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

            <div className={`${box} p-5 space-y-3`}>
                <p className="text-sm text-gray-300">{joiningText(club.joining)}</p>
                {welcome && <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{welcome}</div>}
                {status ? (
                    <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${status === "active" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200" : "border-amber-500/50 bg-amber-500/10 text-amber-200"}`}>{membershipText(status)}</div>
                ) : !hasWallet ? (
                    <Link to="/wallet" className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500">
                        Set up your wallet to join
                    </Link>
                ) : (
                    <div className="space-y-3">
                        <label className="block text-sm text-gray-300">
                            Invite code {club.joining !== "invite" && <span className="text-gray-500">(optional)</span>}
                            <input className={`${field} mt-1 max-w-xs`} value={inviteCode} maxLength={32} onChange={e => setInviteCode(e.target.value)} />
                        </label>
                        {info && <Agreements info={info} terms={acceptedTerms} rules={acceptedHouseRules} setTerms={setAcceptedTerms} setRules={setAcceptedHouseRules} />}
                        {button && (
                            <button type="button" onClick={() => join({ inviteCode, acceptedTerms, acceptedHouseRules })} disabled={busy || !ready} className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                                {busy ? "Joining…" : button}
                            </button>
                        )}
                    </div>
                )}
                {status && termsOutdated && info?.terms && (
                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 space-y-3">
                        <p className="text-sm text-amber-100">The club has new terms. Please read and accept them.</p>
                        <Agreements info={{ ...info, houseRulesAccept: false }} terms={acceptedTerms} rules setTerms={setAcceptedTerms} setRules={() => undefined} />
                        <button type="button" onClick={acceptNewTerms} disabled={busy || !acceptedTerms} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                            Accept the new terms
                        </button>
                    </div>
                )}
                <p className="text-xs text-gray-500">Joining signs a one-time message with your wallet. It never moves funds and costs nothing. Your money stays in your own wallet.</p>
                {error && <p className="text-sm text-red-300">{error}</p>}
            </div>

            {status === "active" && clubAsksForKyc(club) && hasWallet && (
                <div className={`${box} p-5 space-y-3`}>
                    <div className="font-semibold text-white">Identity check</div>
                    {kycSent ? (
                        <p className="text-sm text-emerald-200">Sent. The club will review your details.</p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-300">This club checks who its players are. Skip this if you've already been verified. Your details go only to this club, signed by your wallet.</p>
                            <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-300">
                                <label className="block">
                                    Full name
                                    <input className={`${field} mt-1`} maxLength={120} value={kyc.fullName} onChange={e => setKyc(k => ({ ...k, fullName: e.target.value }))} />
                                </label>
                                <label className="block">
                                    Date of birth
                                    <input type="date" className={`${field} mt-1`} value={kyc.birthDate} onChange={e => setKyc(k => ({ ...k, birthDate: e.target.value }))} />
                                </label>
                                <label className="block">
                                    Country code
                                    <input className={`${field} mt-1`} maxLength={2} placeholder="AU" value={kyc.country} onChange={e => setKyc(k => ({ ...k, country: e.target.value.toUpperCase() }))} />
                                </label>
                            </div>
                            <button type="button" onClick={() => sendKyc(kyc)} disabled={busy || !kyc.fullName.trim() || !kyc.birthDate || kyc.country.length !== 2} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                                Send for review
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className={box}>
                <div className="px-5 py-3 border-b border-gray-700 font-semibold text-white">Club tables</div>
                {isEmpty(club.tables) ? (
                    <p className="px-5 py-4 text-sm text-gray-400">No tables open right now.</p>
                ) : (
                    <ul className="divide-y divide-gray-800">
                        {club.tables.map(t => (
                            <li key={t.gameId} className="px-5 py-3 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-white truncate">{t.name ?? `${t.gameId.slice(0, 8)}…`}</div>
                                    <div className="text-xs text-gray-400">{tableSummary(t)}</div>
                                    {seatRules[t.gameId] && <div className="text-xs text-amber-300">{seatRules[t.gameId]}</div>}
                                </div>
                                <a href={`/table/${t.gameId}`} className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-800">
                                    Open table
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {info && (info.licence || info.privacyUrl || info.termsUrl || info.support.hours) && (
                <p className="text-xs text-gray-500">
                    {info.support.hours && <>Support: {info.support.hours}. </>}
                    {info.licence && <>{info.licence}. </>}
                    {info.termsUrl && /^https:\/\//.test(info.termsUrl) && (
                        <a className="underline" href={info.termsUrl} target="_blank" rel="noreferrer">
                            Terms
                        </a>
                    )}{" "}
                    {info.privacyUrl && /^https:\/\//.test(info.privacyUrl) && (
                        <a className="underline" href={info.privacyUrl} target="_blank" rel="noreferrer">
                            Privacy policy
                        </a>
                    )}
                </p>
            )}
        </div>
    );
};

export default ClubPage;
