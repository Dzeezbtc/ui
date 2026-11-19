import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useClubApi } from "../context/ClubApiContext";
import { httpErrorMessage } from "../apis/HTTPClient";
import { payoutLabel, type ClubProof } from "../utils/clubService";
import { useLanguage } from "../i18n/useLanguage";
import { isEmpty } from "../utils/guards";

const box = "rounded-xl border border-gray-700 bg-gray-900/70";
const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** A club's numbers, each payout linked to its transaction, so anyone can check them without signing in (block52-club#27). */
const ClubProofPage: React.FC = () => {
    const { handle = "" } = useParams();
    const api = useClubApi();
    const [proof, setProof] = useState<ClubProof | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (!api) {
            setError(t("club.noService"));
            return;
        }
        api.getClubProof(handle).then(setProof, err => setError(httpErrorMessage(err, t("club.proofFailed"))));
    }, [api, handle, t]);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
                <Link to={`/club/${encodeURIComponent(handle)}`} className="text-sm text-gray-400 hover:text-white">
                    {t("club.backToClub")}
                </Link>
                {error && <p className="text-sm text-rose-300">{error}</p>}
                {proof && (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold">{t("club.proofTitle", { club: proof.club.name })}</h1>
                            <p className="mt-1 text-sm text-gray-400">{t("club.proofIntro")}</p>
                        </div>
                        {proof.demo && (
                            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{t("club.proofDemo")}</p>
                        )}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className={`${box} p-4`}>
                                <div className="text-2xl font-semibold tabular-nums">{proof.totals.hands.toLocaleString("en-US")}</div>
                                <div className="text-xs text-gray-400">{t("club.handsTotal")}</div>
                            </div>
                            <div className={`${box} p-4`}>
                                <div className="text-2xl font-semibold tabular-nums">{money(proof.totals.rake)}</div>
                                <div className="text-xs text-gray-400">{t("club.rakeTaken")}</div>
                            </div>
                            <div className={`${box} p-4`}>
                                <div className="text-2xl font-semibold tabular-nums">{money(proof.totals.paidOut)}</div>
                                <div className="text-xs text-gray-400">{t("club.paidBackPct", { pct: proof.totals.paidOutPct })}</div>
                            </div>
                        </div>
                        <div className={`${box} overflow-x-auto p-4`}>
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-500">
                                    <tr>
                                        <th className="text-left font-normal pb-2">{t("club.month")}</th>
                                        <th className="text-right font-normal">{t("club.hands")}</th>
                                        <th className="text-right font-normal">{t("club.rake")}</th>
                                        <th className="text-right font-normal">{t("club.paidBack")}</th>
                                    </tr>
                                </thead>
                                <tbody className="tabular-nums">
                                    {proof.months.map(m => (
                                        <tr key={m.month} className="border-t border-gray-800">
                                            <td className="py-2">{m.month}</td>
                                            <td className="text-right">{m.hands.toLocaleString("en-US")}</td>
                                            <td className="text-right">{money(m.rake)}</td>
                                            <td className="text-right">{money(m.paidOut)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={`${box} p-4`}>
                            <h2 className="text-sm font-semibold mb-2">{t("club.latestPayouts")}</h2>
                            {isEmpty(proof.payouts) ? (
                                <p className="text-sm text-gray-400">{t("club.noPayouts")}</p>
                            ) : (
                                <ul className="divide-y divide-gray-800 text-sm">
                                    {proof.payouts.map(p => (
                                        <li key={`${p.txHash}-${p.kind}`} className="flex items-center gap-3 py-2">
                                            <span className="w-24 text-gray-500 tabular-nums">{p.day}</span>
                                            <span className="flex-1 text-gray-300">{payoutLabel(p.kind)}</span>
                                            <span className="tabular-nums">{money(p.amount)}</span>
                                            <Link
                                                className="font-mono text-xs text-violet-300 hover:text-violet-200"
                                                to={`/explorer/tx/${encodeURIComponent(p.txHash)}`}
                                            >
                                                {p.txHash.slice(0, 8)}…
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClubProofPage;
