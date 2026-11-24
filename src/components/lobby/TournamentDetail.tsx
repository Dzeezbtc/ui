import React from "react";
import type { GameWithFormat } from "../../utils/convertUtils";
import { computeSngEntryBreakdown } from "../../utils/buyInUtils";
import { formatStartsAt } from "../../utils/scheduledSng";
import { formatChipCount } from "../../utils/potDisplayUtils";
import {
    countdownLabel,
    ladderBlinds,
    lobbyBlindLadder,
    lobbyBlindStructure,
    payoutBarPercent,
    placeLabel,
    prizeMoney,
    startingStackLabel,
    tournamentPrize,
    tournamentStatus,
    tournamentStatusText,
    tournamentStatusTone,
    type LobbyTournamentLive
} from "../../utils/tournamentDetail";
import { useLanguage } from "../../i18n/useLanguage";
import { hasElements, hasValue } from "../../utils/guards";
import styles from "./Lobby.module.css";

interface TournamentDetailProps {
    game: GameWithFormat;
    live: LobbyTournamentLive | undefined;
    nowMs: number;
}

/**
 * The tournament half of the lobby's table panel: a prize ticket (first prize,
 * live status, entries / pool / places paid), the payout bars, the key facts and
 * the blind ladder.
 */
const TournamentDetail: React.FC<TournamentDetailProps> = ({ game, live, nowMs }) => {
    const { t } = useLanguage();
    const prize = tournamentPrize(game, live?.payouts);
    const status = tournamentStatus(game, live, nowMs);
    const structure = lobbyBlindStructure(game);
    const ladder = lobbyBlindLadder(structure, live?.level ?? game.blindLevel);
    const stack = startingStackLabel(game.startingStack, ladder[0]?.bigBlind);
    const fees = computeSngEntryBreakdown(game.minBuyIn, game.entryFee, game.protocolFeeBps);
    const hasAnte = ladder.some(r => r.ante > 0);
    const levelMinutes = ladder[0]?.minutes;
    const tone = { live: styles.tdLive, bad: styles.tdBad, quiet: styles.tdMuted, soon: "" }[tournamentStatusTone(status)];

    return (
        <div className={styles.td}>
            <div className={styles.tdTicket}>
                <div className={styles.tdTicketMain}>
                    <div className={styles.eyebrow}>{hasValue(prize.first) ? t("lobby.tdFirstPrize") : t("lobby.tdPoolSoFar")}</div>
                    <div className={styles.tdBig}>
                        <span className={styles.gradText}>{prizeMoney(prize.first ?? prize.pool)}</span>
                    </div>
                    <span className={`${styles.tdStatus} ${tone}`}>
                        <i />
                        {tournamentStatusText(status, t)}
                    </span>
                </div>
                <div className={styles.tdStub}>
                    <div>
                        <b>
                            {game.currentPlayers}
                            <span className={styles.faint}>/{game.maxPlayers}</span>
                        </b>
                        <small>{t("lobby.tdEntries")}</small>
                    </div>
                    <div>
                        <b>{prizeMoney(prize.pool)}</b>
                        <small>{t("lobby.tdPool")}</small>
                    </div>
                    <div>
                        <b>{hasElements(prize.places) ? prize.places.length : "—"}</b>
                        <small>{t("lobby.tdPaid")}</small>
                    </div>
                </div>
            </div>

            {hasElements(prize.places) ? (
                <div className={styles.tdPayouts}>
                    <div className={styles.eyebrow}>{t("lobby.tdPayouts")}</div>
                    {prize.places.map(p => (
                        <div key={p.place} className={`${styles.tdPayRow} ${p.place === 1 ? styles.tdPayFirst : ""}`}>
                            <span className={styles.tdPlace}>{placeLabel(p.place)}</span>
                            <span className={styles.tdBar}>
                                <i style={{ width: `${payoutBarPercent(p.amount, prize.first)}%` }} />
                            </span>
                            <span className={styles.tdAmt}>{prizeMoney(p.amount)}</span>
                            <span className={styles.tdPct}>{p.percent}%</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.tdNote}>{t("lobby.tdPayoutsLater")}</p>
            )}

            <div className={styles.kv}>
                <div>
                    <small>{t("lobby.tdStartingStack")}</small>
                    <b>{stack || "—"}</b>
                </div>
                <div>
                    <small>{t("lobby.tdLevels")}</small>
                    <b>{hasValue(levelMinutes) ? t("lobby.tdEveryMin", { min: levelMinutes }) : "—"}</b>
                </div>
                <div>
                    <small>{t("lobby.tdLateRegRow")}</small>
                    <b>
                        {hasValue(game.lateRegistrationLevels) && game.lateRegistrationLevels > 0
                            ? t("lobby.tdUntilLevel", { level: game.lateRegistrationLevels })
                            : t("lobby.tdNone")}
                    </b>
                </div>
                <div>
                    <small>{t("lobby.tdStart")}</small>
                    <b>{hasValue(game.scheduledStartTime) ? formatStartsAt(game.scheduledStartTime, nowMs) : t("lobby.tdWhenFull")}</b>
                </div>
                <div className={styles.kvWide}>
                    <small>{t("lobby.tdWhereBuyInGoes")}</small>
                    <b>
                        {prizeMoney(fees.prizePoolPortion)} {t("lobby.tdToPool")}
                        {fees.protocolCut > 0n ? ` · ${prizeMoney(fees.protocolCut)} ${t("lobby.tdNetworkFee")}` : ""}
                        {fees.ownerFee > 0n ? ` · ${prizeMoney(fees.ownerFee)} ${t("lobby.tdHostFee")}` : ""}
                    </b>
                </div>
            </div>

            {hasElements(ladder) ? (
                <details className={styles.tdLadder}>
                    <summary>
                        <span className={styles.eyebrow}>{t("lobby.tdBlindLadder")}</span>
                        <span className={styles.tdLadderHint}>{t("lobby.tdLadderStarts", { blinds: ladderBlinds(ladder[0]) })}</span>
                    </summary>
                    <table>
                        <thead>
                            <tr>
                                <th>{t("lobby.tdLevel")}</th>
                                <th>{t("lobby.tdBlinds")}</th>
                                {hasAnte ? <th>{t("lobby.tdAnte")}</th> : null}
                                <th>{t("lobby.tdMin")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ladder.map(r => (
                                <tr key={r.level} className={r.isCurrent ? styles.tdNow : undefined}>
                                    <td>{r.level}</td>
                                    <td>{r.isBreak ? t("lobby.tdBreak") : ladderBlinds(r)}</td>
                                    {hasAnte ? <td>{r.ante > 0 ? formatChipCount(r.ante) : "—"}</td> : null}
                                    <td>{r.minutes ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </details>
            ) : null}
        </div>
    );
};

export default TournamentDetail;
