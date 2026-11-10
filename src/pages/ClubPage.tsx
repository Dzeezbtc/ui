import React, { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useClubPage } from "../hooks/club/useClubPage";
import { hasElements, isEmpty } from "../utils/guards";
import { getCosmosAddress } from "../utils/cosmos/storage";
import {
    referralLink,
    canSubmitJoin,
    clubAsksForKyc,
    joinButtonLabel,
    joiningText,
    membershipText,
    offerText,
    tableSummary,
    type ClubTerms
} from "../utils/clubService";
import { safeLook, socialLabel } from "../utils/clubLook";
import { ClubProtection } from "../components/ClubProtection";
import { BrowserPush } from "../components/BrowserPush";
import { useLanguage } from "../i18n/useLanguage";

const box = "rounded-xl border border-gray-700 bg-gray-900/70";
const field = "w-full rounded-lg border border-gray-600 bg-gray-950 px-3 py-2 text-sm text-white";

/** What a player reads and agrees to before joining. */
const Agreements: React.FC<{ info: ClubTerms; terms: boolean; rules: boolean; setTerms: (v: boolean) => void; setRules: (v: boolean) => void }> = ({
    info,
    terms,
    rules,
    setTerms,
    setRules
}) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-3">
            {info.terms && (
                <div>
                    <div className="text-sm font-semibold text-white mb-1">{t("club.termsVersion", { version: info.terms.version })}</div>
                    <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-700 bg-gray-950 p-3 text-xs text-gray-300">
                        {info.terms.body}
                    </div>
                    <label className="mt-2 flex items-start gap-2 text-sm text-gray-200">
                        <input type="checkbox" className="mt-0.5" checked={terms} onChange={e => setTerms(e.target.checked)} />
                        {t("club.acceptTerms")}
                    </label>
                </div>
            )}
            {info.houseRulesAccept && (
                <div>
                    <div className="text-sm font-semibold text-white mb-1">{t("club.houseRules")}</div>
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
                        {t("club.acceptHouseRules")}
                    </label>
                </div>
            )}
        </div>
    );
};

/**
 * /club/:handle: a club's page in the lobby. Players see how the club works,
 * its open tables, and join it with their wallet. Open clubs let them in at
 * once; others put them on the club's waiting list for staff to approve.
 */
const ClubPage: React.FC = () => {
    const { handle = "" } = useParams();
    const {
        missions,
        referralBonus,
        notificationsSaved,
        saveReminders,
        offers,
        races,
        claimed,
        claim,
        club,
        info,
        status,
        termsOutdated,
        welcome,
        seatRules,
        kycSent,
        hasWallet,
        busy,
        error,
        join,
        acceptNewTerms,
        sendKyc,
        proofPublished
    } = useClubPage(handle);
    const [inviteCode, setInviteCode] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedHouseRules, setAcceptedHouseRules] = useState(false);
    const [searchParams] = useSearchParams();
    const referredBy = searchParams.get("ref") ?? undefined;
    const myAddress = getCosmosAddress();
    const [reminders, setReminders] = useState(false);
    const [tableAlerts, setTableAlerts] = useState(false);
    const [messageAlerts, setMessageAlerts] = useState(false);
    const [telegramChat, setTelegramChat] = useState("");
    const [kyc, setKyc] = useState({ fullName: "", birthDate: "", country: "" });
    const { t } = useLanguage();

    if (!club)
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 text-gray-300">
                {error ? <p className="text-red-300">{error}</p> : <p>{t("club.loading")}</p>}
            </div>
        );

    const look = safeLook(club.look);
    const button = joinButtonLabel(club.joining, inviteCode);
    const ready = canSubmitJoin(info, { acceptedTerms, acceptedHouseRules });
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-gray-200">
            <div>
                {look?.logo && <img src={look.logo} alt="" className="w-16 h-16 rounded-xl object-contain mb-3" />}
                <div className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: look?.primaryColor ?? undefined }}>
                    {t("club.badge")}
                </div>
                <h1 className="text-3xl font-bold text-white mt-1">{club.name}</h1>
                <div className="text-sm text-gray-400">
                    @{club.handle}
                    {club.union && <> · {t("club.partOf", { union: club.union })}</>}
                </div>
                {club.tagline && <p className="mt-3 text-gray-300">{club.tagline}</p>}
                {proofPublished && (
                    <Link to={`/club/${encodeURIComponent(club.handle)}/proof`} className="mt-2 inline-block text-sm underline text-gray-300 hover:text-white">
                        {t("club.proofLink")}
                    </Link>
                )}
                {look && hasElements(look.socials) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        {look.socials.map(url => (
                            <a key={url} href={url} target="_blank" rel="noreferrer" className="underline" style={{ color: look.accentColor ?? undefined }}>
                                {socialLabel(url)}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                    <div className="text-xs text-gray-400">{t("club.members")}</div>
                    <div className="text-2xl font-bold text-white">{club.members.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                    <div className="text-xs text-gray-400">{t("club.openTables")}</div>
                    <div className="text-2xl font-bold text-white">{club.tables.length}</div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                    <div className="text-xs text-gray-400">{t("club.kycTitle")}</div>
                    <div className="text-2xl font-bold text-white">{club.kyc === "none" ? t("club.kycNotNeeded") : t("club.kycRequired")}</div>
                </div>
            </div>

            <div className={`${box} p-5 space-y-3`}>
                <p className="text-sm text-gray-300">{joiningText(club.joining)}</p>
                {welcome && <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{welcome}</div>}
                {status ? (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm font-medium ${status === "active" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200" : "border-amber-500/50 bg-amber-500/10 text-amber-200"}`}
                    >
                        {membershipText(status)}
                    </div>
                ) : !hasWallet ? (
                    <Link to="/wallet" className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500">
                        {t("club.setUpWallet")}
                    </Link>
                ) : (
                    <div className="space-y-3">
                        <label className="block text-sm text-gray-300">
                            {t("club.inviteCode")} {club.joining !== "invite" && <span className="text-gray-500">{t("club.optional")}</span>}
                            <input className={`${field} mt-1 max-w-xs`} value={inviteCode} maxLength={32} onChange={e => setInviteCode(e.target.value)} />
                        </label>
                        {info && (
                            <Agreements
                                info={info}
                                terms={acceptedTerms}
                                rules={acceptedHouseRules}
                                setTerms={setAcceptedTerms}
                                setRules={setAcceptedHouseRules}
                            />
                        )}
                        {button && (
                            <button
                                type="button"
                                onClick={() => join({ inviteCode, acceptedTerms, acceptedHouseRules, referredBy })}
                                disabled={busy || !ready}
                                className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                            >
                                {busy ? t("club.joiningBusy") : button}
                            </button>
                        )}
                    </div>
                )}
                {status && termsOutdated && info?.terms && (
                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 space-y-3">
                        <p className="text-sm text-amber-100">{t("club.newTerms")}</p>
                        <Agreements
                            info={{ ...info, houseRulesAccept: false }}
                            terms={acceptedTerms}
                            rules
                            setTerms={setAcceptedTerms}
                            setRules={() => undefined}
                        />
                        <button
                            type="button"
                            onClick={acceptNewTerms}
                            disabled={busy || !acceptedTerms}
                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                        >
                            {t("club.acceptNewTerms")}
                        </button>
                    </div>
                )}
                <p className="text-xs text-gray-500">{t("club.signNote")}</p>
                {error && <p className="text-sm text-red-300">{error}</p>}
            </div>

            {hasElements(missions) && (
                <div className={`${box} p-5 space-y-2`}>
                    <div className="font-semibold text-white">{t("club.missions")}</div>
                    <ul className="text-sm text-gray-200 space-y-1">
                        {missions.map(m => (
                            <li key={m.id}>
                                {m.name}: ${m.reward} ({m.length})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {status && status !== "pending" && hasWallet && <ClubProtection handle={club.handle} clubName={club.name} />}

            {status === "active" && myAddress && referralBonus > 0 && (
                <div className={`${box} p-5 space-y-2`}>
                    <div className="font-semibold text-white">{t("club.referTitle", { amount: referralBonus })}</div>
                    <p className="text-sm text-gray-300">{t("club.referText")}</p>
                    <code className="block break-all text-xs text-gray-200">{referralLink(window.location.origin, club.handle, myAddress)}</code>
                </div>
            )}

            {races.map(r => (
                <div key={r.race} className={`${box} p-5 space-y-2`}>
                    <div className="font-semibold text-white">
                        {t("club.toWin", { race: r.race === "leaderboard" ? t("club.leaderboard") : t("club.rakeRace"), pool: r.pool.toLocaleString() })}
                    </div>
                    <div className="text-xs text-gray-400">{t("club.ends", { date: r.ends })}</div>
                    {isEmpty(r.top) ? (
                        <p className="text-sm text-gray-400">{t("club.nobodyYet")}</p>
                    ) : (
                        <ol className="text-sm text-gray-200 space-y-0.5">
                            {r.top.map(p => (
                                <li key={`${p.rank}-${p.nickname}`}>
                                    {p.rank}. {p.nickname}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            ))}

            {status === "active" && hasWallet && (
                <div className={`${box} p-5 space-y-3`}>
                    <div className="font-semibold text-white">{t("club.reminders")}</div>
                    <label className="flex items-start gap-2 text-sm text-gray-200">
                        <input type="checkbox" className="mt-0.5" checked={reminders} onChange={e => setReminders(e.target.checked)} />
                        {t("club.remindTournaments")}
                    </label>
                    <label className="flex items-start gap-2 text-sm text-gray-200">
                        <input type="checkbox" className="mt-0.5" checked={tableAlerts} onChange={e => setTableAlerts(e.target.checked)} />
                        {t("club.remindTables")}
                    </label>
                    <label className="flex items-start gap-2 text-sm text-gray-200">
                        <input type="checkbox" className="mt-0.5" checked={messageAlerts} onChange={e => setMessageAlerts(e.target.checked)} />
                        {t("club.remindMessages")}
                    </label>
                    <label className="block text-sm text-gray-300">
                        {t("club.telegramChat")} <span className="text-gray-500">{t("club.optional")}</span>
                        <input
                            className={`${field} mt-1 max-w-xs`}
                            maxLength={40}
                            placeholder="@yourname"
                            value={telegramChat}
                            onChange={e => setTelegramChat(e.target.value)}
                        />
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => saveReminders({ tournaments: reminders, tables: tableAlerts, messages: messageAlerts, telegramChat })}
                            disabled={busy}
                            className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {t("club.save")}
                        </button>
                        {notificationsSaved && <span className="text-sm text-emerald-200">{t("club.saved")}</span>}
                    </div>
                    <BrowserPush handle={club.handle} />
                </div>
            )}

            {status === "active" && hasWallet && hasElements(offers) && (
                <div className={`${box} p-5 space-y-3`}>
                    <div className="font-semibold text-white">{t("club.bonuses")}</div>
                    <ul className="divide-y divide-gray-800">
                        {offers.map(o => (
                            <li key={o.id} className="py-2 flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-white">{o.name}</div>
                                    <div className="text-xs text-gray-400">{offerText(o)}</div>
                                </div>
                                {claimed.includes(o.id) ? (
                                    <span className="text-sm text-emerald-200">{t("club.sentToClub")}</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => claim(o.id)}
                                        disabled={busy}
                                        className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {t("club.askForThis")}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {status === "active" && clubAsksForKyc(club) && hasWallet && (
                <div className={`${box} p-5 space-y-3`}>
                    <div className="font-semibold text-white">{t("club.identityCheck")}</div>
                    {kycSent ? (
                        <p className="text-sm text-emerald-200">{t("club.kycSent")}</p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-300">{t("club.kycIntro")}</p>
                            <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-300">
                                <label className="block">
                                    {t("club.fullName")}
                                    <input
                                        className={`${field} mt-1`}
                                        maxLength={120}
                                        value={kyc.fullName}
                                        onChange={e => setKyc(k => ({ ...k, fullName: e.target.value }))}
                                    />
                                </label>
                                <label className="block">
                                    {t("club.birthDate")}
                                    <input
                                        type="date"
                                        className={`${field} mt-1`}
                                        value={kyc.birthDate}
                                        onChange={e => setKyc(k => ({ ...k, birthDate: e.target.value }))}
                                    />
                                </label>
                                <label className="block">
                                    {t("club.countryCode")}
                                    <input
                                        className={`${field} mt-1`}
                                        maxLength={2}
                                        placeholder="AU"
                                        value={kyc.country}
                                        onChange={e => setKyc(k => ({ ...k, country: e.target.value.toUpperCase() }))}
                                    />
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={() => sendKyc(kyc)}
                                disabled={busy || !kyc.fullName.trim() || !kyc.birthDate || kyc.country.length !== 2}
                                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                            >
                                {t("club.sendForReview")}
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className={box}>
                <div className="px-5 py-3 border-b border-gray-700 font-semibold text-white">{t("club.tables")}</div>
                {isEmpty(club.tables) ? (
                    <p className="px-5 py-4 text-sm text-gray-400">{t("club.noTables")}</p>
                ) : (
                    <ul className="divide-y divide-gray-800">
                        {club.tables.map(table => (
                            <li key={table.gameId} className="px-5 py-3 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-white truncate">{table.name ?? `${table.gameId.slice(0, 8)}…`}</div>
                                    <div className="text-xs text-gray-400">{tableSummary(table)}</div>
                                    {seatRules[table.gameId] && <div className="text-xs text-amber-300">{seatRules[table.gameId]}</div>}
                                </div>
                                <a href={`/table/${table.gameId}`} className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-800">
                                    {t("club.openTable")}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {info && (info.licence || info.privacyUrl || info.termsUrl || info.support.hours) && (
                <p className="text-xs text-gray-500">
                    {info.support.hours && <>{t("club.support", { hours: info.support.hours })} </>}
                    {info.licence && <>{info.licence}. </>}
                    {info.termsUrl && /^https:\/\//.test(info.termsUrl) && (
                        <a className="underline" href={info.termsUrl} target="_blank" rel="noreferrer">
                            {t("club.terms")}
                        </a>
                    )}{" "}
                    {info.privacyUrl && /^https:\/\//.test(info.privacyUrl) && (
                        <a className="underline" href={info.privacyUrl} target="_blank" rel="noreferrer">
                            {t("club.privacy")}
                        </a>
                    )}
                </p>
            )}
        </div>
    );
};

export default ClubPage;
