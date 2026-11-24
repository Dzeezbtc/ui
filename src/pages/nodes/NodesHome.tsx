import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NETWORK_PRESETS } from "../../context/NetworkContext";
import { useLanguage } from "../../i18n/useLanguage";
import { useChainOverview } from "../../hooks/nodes/useChainOverview";
import { useNodeHeights } from "../../hooks/nodes/useNodeHeights";
import { useNodeDiscovery } from "../../hooks/nodes/useNodeDiscovery";
import { useValidatorBonds } from "../../hooks/game/useValidatorBonds";
import ValidatorEarningsPanel from "../../components/explorer/ValidatorEarningsPanel";
import { NetworkInfoPanel } from "../../components/nodes/NetworkInfoPanel";
import { RunNodePanel } from "../../components/nodes/RunNodePanel";
import { BecomeValidatorPanel } from "../../components/nodes/BecomeValidatorPanel";
import { heightLabel, hostOf, isValidatorName, publicNodes, ringLayout, syncState, tipHeight } from "../../utils/nodesView";
import { hasElements } from "../../utils/guards";
import type { TranslationKey } from "../../i18n";
import styles from "./NodesHome.module.css";

type NodesTab = "nodes" | "network" | "run" | "validator";

const TABS: { id: NodesTab; label: TranslationKey }[] = [
    { id: "nodes", label: "nodes.tabNodes" },
    { id: "network", label: "nodes.tabNetwork" },
    { id: "run", label: "nodes.tabRun" },
    { id: "validator", label: "nodes.tabValidator" }
];

const NODES = publicNodes(NETWORK_PRESETS);
const W = 520;
const H = 300;
const POINTS = ringLayout(NODES.length, W / 2, H / 2, 112);

/**
 * Nodes (Flagship look): the public nodes drawn round the chain they run, live
 * heights and who is in sync, a card per node, validator earnings, peers found
 * on the network, and the Network / Run a node / Become a validator tabs.
 */
const NodesHome: React.FC = () => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<NodesTab>("nodes");
    const { overview, isLoading, error, refresh } = useChainOverview();
    const heights = useNodeHeights(NODES);
    const discovery = useNodeDiscovery(NODES);
    const bonds = useValidatorBonds();

    useEffect(() => {
        document.title = "Nodes - Block52";
    }, []);

    const monikers = (overview?.validators ?? []).map(v => v.moniker);
    const tip = tipHeight(NODES.map(n => heights[n.name]?.height ?? null));
    const online = NODES.filter(n => heights[n.name]?.status === "online").length;

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <header className={styles.head}>
                <div>
                    <h1>{t("nav.nodes")}</h1>
                    <p>{t("nodes.sub")}</p>
                </div>
                {overview ? <span className={styles.pill}>{overview.chainId}</span> : null}
            </header>

            <div className={styles.tabs} role="tablist">
                {TABS.map(x => (
                    <button
                        key={x.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === x.id}
                        className={tab === x.id ? styles.tabOn : styles.tab}
                        onClick={() => setTab(x.id)}
                    >
                        {t(x.label)}
                    </button>
                ))}
            </div>

            {tab === "nodes" ? (
                <>
                    <div className={styles.stats}>
                        <div>
                            <b>
                                {online}
                                <span>/{NODES.length}</span>
                            </b>
                            <small>{t("nodes.online")}</small>
                        </div>
                        <div>
                            <b>{tip !== null ? heightLabel(tip) : "—"}</b>
                            <small>{t("nodes.latestBlock")}</small>
                        </div>
                        <div>
                            <b>{overview ? overview.validators.length : "—"}</b>
                            <small>{t("nodes.validators")}</small>
                        </div>
                    </div>
                    <section className={styles.hero}>
                        <svg className={styles.map} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("nodes.mapLabel", { online, total: NODES.length })}>
                            <defs>
                                <radialGradient id="nodesCore" cx="50%" cy="45%" r="60%">
                                    <stop offset="0%" stopColor="#c026d3" />
                                    <stop offset="60%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </radialGradient>
                            </defs>
                            <circle cx={W / 2} cy={H / 2} r={112} className={styles.orbit} />
                            {NODES.map((n, i) => (
                                <line
                                    key={`l-${n.name}`}
                                    x1={W / 2}
                                    y1={H / 2}
                                    x2={POINTS[i].x}
                                    y2={POINTS[i].y}
                                    className={heights[n.name]?.status === "online" ? styles.linkOn : styles.linkOff}
                                />
                            ))}
                            <circle cx={W / 2} cy={H / 2} r={46} className={styles.coreGlow} />
                            <circle cx={W / 2} cy={H / 2} r={36} fill="url(#nodesCore)" />
                            <text x={W / 2} y={H / 2 - 3} className={styles.coreName}>
                                Block52
                            </text>
                            <text x={W / 2} y={H / 2 + 13} className={styles.coreHeight}>
                                {tip !== null ? heightLabel(tip) : "…"}
                            </text>
                            {NODES.map((n, i) => {
                                const h = heights[n.name];
                                const validator = isValidatorName(n.name, monikers);
                                const below = POINTS[i].y >= H / 2;
                                return (
                                    <g
                                        key={n.name}
                                        className={h?.status === "online" ? styles.nodeOn : h?.status === "offline" ? styles.nodeOff : styles.nodeWait}
                                    >
                                        <circle cx={POINTS[i].x} cy={POINTS[i].y} r={validator ? 17 : 13} className={styles.nodeHalo} />
                                        <circle cx={POINTS[i].x} cy={POINTS[i].y} r={validator ? 11 : 8} className={styles.nodeDot} />
                                        <text x={POINTS[i].x} y={POINTS[i].y + (below ? 34 : -24)} className={styles.nodeName}>
                                            {n.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                        <div className={styles.cards}>
                            {NODES.map(n => {
                                const h = heights[n.name];
                                const sync = syncState(h?.height ?? null, tip);
                                const validator = isValidatorName(n.name, monikers);
                                return (
                                    <Link key={n.name} to={`/node/${encodeURIComponent(n.name)}`} className={styles.card}>
                                        <div className={styles.cardTop}>
                                            <span
                                                className={h?.status === "online" ? styles.dotOn : h?.status === "offline" ? styles.dotOff : styles.dotWait}
                                            />
                                            <b>{n.name}</b>
                                            <span className={validator ? styles.roleVal : styles.roleSync}>
                                                {validator ? t("nodes.validator") : t("nodes.sync")}
                                            </span>
                                        </div>
                                        <div className={styles.cardHeight}>
                                            {h?.height ? heightLabel(h.height) : h?.status === "offline" ? t("nodes.offline") : "…"}
                                        </div>
                                        <div className={styles.cardMeta}>
                                            <span>
                                                {sync.kind === "synced"
                                                    ? t("nodes.inSync")
                                                    : sync.kind === "behind"
                                                      ? t("nodes.behind", { n: sync.blocks.toLocaleString() })
                                                      : t("nodes.noAnswer")}
                                            </span>
                                            <span className={styles.host}>{hostOf(n.rest)}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <ValidatorEarningsPanel bonds={bonds.bonds} hasQuery={bonds.hasQuery} isLoading={bonds.isLoading} />
                    </section>

                    <section className={styles.peers}>
                        <div className={styles.peersHead}>
                            <div>
                                <h2>{t("nodes.peersTitle")}</h2>
                                <p>{t("nodes.peersSub")}</p>
                            </div>
                            <button type="button" className={styles.btn} disabled={discovery.phase !== "idle"} onClick={() => void discovery.discover()}>
                                {discovery.phase === "discovering"
                                    ? t("nodes.finding")
                                    : discovery.phase === "probing"
                                      ? t("nodes.checking")
                                      : t("nodes.findPeers")}
                            </button>
                        </div>
                        {hasElements(discovery.nodes) ? (
                            <div className={styles.peerList}>
                                {discovery.nodes.map(p => (
                                    <div key={p.id} className={styles.peer}>
                                        <span
                                            className={
                                                p.probeStatus === "reachable" ? styles.dotOn : p.probeStatus === "unreachable" ? styles.dotOff : styles.dotWait
                                            }
                                        />
                                        <b>{p.moniker}</b>
                                        <span className={styles.host}>{p.endpoints ? hostOf(p.endpoints.rest) : p.remoteIp}</span>
                                        {p.blockHeight ? <span className={styles.mono}>{heightLabel(Number(p.blockHeight))}</span> : null}
                                        {p.endpoints && p.probeStatus === "reachable" ? (
                                            discovery.isAdded(p) ? (
                                                <span className={styles.added}>{t("nodes.added")}</span>
                                            ) : (
                                                <button type="button" className={styles.btnSm} onClick={() => discovery.add(p)}>
                                                    {t("nodes.addToPicker")}
                                                </button>
                                            )
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.empty}>{t("nodes.noPeers")}</p>
                        )}
                    </section>
                </>
            ) : (
                <section className={styles.panel}>
                    {isLoading && !overview ? <div className={styles.spinner} /> : null}
                    {error ? <p className={styles.error}>{t("nodes.chainError", { error })}</p> : null}
                    {overview && tab === "network" ? <NetworkInfoPanel overview={overview} /> : null}
                    {overview && tab === "run" ? <RunNodePanel overview={overview} /> : null}
                    {overview && tab === "validator" ? <BecomeValidatorPanel overview={overview} onBonded={refresh} /> : null}
                </section>
            )}
        </div>
    );
};

export default NodesHome;
