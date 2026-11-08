import React, { useState } from "react";
import { useClubApi } from "../context/ClubApiContext";
import { httpErrorMessage } from "../apis/HTTPClient";
import { getCosmosAddress, getCosmosMnemonic } from "../utils/cosmos/storage";
import { protect, protectionText, type ProtectionRequest, type ProtectionState } from "../utils/clubService";
import { useLanguage } from "../i18n/useLanguage";
import { hasValue, isNullish } from "../utils/guards";

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
    const { t } = useLanguage();

    const send = async (request: ProtectionRequest, confirmText?: string) => {
        if (!api || !address || !mnemonic) return;
        if (confirmText && !window.confirm(confirmText)) return;
        setBusy(true);
        setError(null);
        try {
            setState(await protect(api, handle, mnemonic, address, request));
        } catch (err) {
            setError(httpErrorMessage(err, t("club.tryAgain")));
        } finally {
            setBusy(false);
        }
    };

    if (!api || !address || !mnemonic) return null;
    const blocked = state && state.status !== "active" && state.status !== "pending";
    const money = (n: number | null) => (isNullish(n) ? t("club.none") : t("club.perDay", { amount: n }));

    return (
        <details
            className="rounded-xl border border-gray-700 bg-gray-900/70 p-4"
            onToggle={e => (e.currentTarget.open && !state ? send({ action: "view" }) : undefined)}
        >
            <summary className="cursor-pointer text-sm font-semibold text-white">{t("club.limitsTitle")}</summary>
            <div className="mt-3 space-y-4 text-sm">
                <p className="text-gray-400">{t("club.limitsIntro", { club: clubName })}</p>
                {error && <p className="text-red-300">{error}</p>}
                {!state && busy && <p className="text-gray-400">{t("club.loadingShort")}</p>}
                {state && (
                    <>
                        <p className={blocked ? "text-amber-200" : "text-gray-300"}>{protectionText(state)}</p>
                        <div>
                            <div className="text-gray-300">
                                {t("club.dailyLimit")} <b>{money(state.depositLimit.counts)}</b>
                                {hasValue(state.depositLimit.club) && hasValue(state.depositLimit.yours) && (
                                    <span className="text-gray-500"> {t("club.lowerOfBoth")}</span>
                                )}
                            </div>
                            {state.depositLimit.waiting && (
                                <div className="text-xs text-gray-500">
                                    {t("club.limitChanging", {
                                        limit: money(state.depositLimit.waiting.depositPerDay),
                                        date: new Date(state.depositLimit.waiting.from).toLocaleString()
                                    })}
                                </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                                <input
                                    className={`${field} w-32`}
                                    inputMode="decimal"
                                    placeholder={t("club.perDayPlaceholder")}
                                    value={limit}
                                    onChange={e => setLimit(e.target.value.replace(/[^0-9.]/g, ""))}
                                    aria-label={t("club.dailyLimit")}
                                />
                                <button
                                    type="button"
                                    className={button}
                                    disabled={busy || !limit}
                                    onClick={() => send({ action: "limit", depositPerDay: Number(limit) }).then(() => setLimit(""))}
                                >
                                    {t("club.setLimit")}
                                </button>
                                {hasValue(state.depositLimit.yours) && (
                                    <button type="button" className={button} disabled={busy} onClick={() => send({ action: "limit", depositPerDay: null })}>
                                        {t("club.removeLimit")}
                                    </button>
                                )}
                            </div>
                        </div>
                        {!blocked && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-300">{t("club.breakFor")}</span>
                                <select
                                    className={field}
                                    value={days}
                                    onChange={e => setDays(Number(e.target.value) as 1 | 7 | 30)}
                                    aria-label={t("club.breakLength")}
                                >
                                    <option value={1}>{t("club.oneDay")}</option>
                                    <option value={7}>{t("club.days", { n: 7 })}</option>
                                    <option value={30}>{t("club.days", { n: 30 })}</option>
                                </select>
                                <button
                                    type="button"
                                    className={button}
                                    disabled={busy}
                                    onClick={() => send({ action: "cool-off", days }, t("club.confirmBreak", { days, club: clubName }))}
                                >
                                    {t("club.startBreak")}
                                </button>
                            </div>
                        )}
                        {state.status !== "self-excluded" || state.until ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-300">{t("club.excludeFor")}</span>
                                <select
                                    className={field}
                                    value={String(months)}
                                    onChange={e => setMonths(e.target.value === "permanent" ? "permanent" : (Number(e.target.value) as 6 | 12 | 60))}
                                    aria-label={t("club.exclusionLength")}
                                >
                                    <option value="6">{t("club.months", { n: 6 })}</option>
                                    <option value="12">{t("club.months", { n: 12 })}</option>
                                    <option value="60">{t("club.fiveYears")}</option>
                                    <option value="permanent">{t("club.permanently")}</option>
                                </select>
                                <button
                                    type="button"
                                    className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-200 hover:bg-red-950 disabled:opacity-40"
                                    disabled={busy}
                                    onClick={() =>
                                        send(
                                            { action: "exclude", months },
                                            months === "permanent"
                                                ? t("club.confirmExcludeForever", { club: clubName })
                                                : t("club.confirmExcludeMonths", { club: clubName, months })
                                        )
                                    }
                                >
                                    {t("club.excludeMe")}
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </details>
    );
};
