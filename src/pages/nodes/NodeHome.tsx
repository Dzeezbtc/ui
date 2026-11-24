import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { NETWORK_PRESETS, useNetwork, type NetworkEndpoints } from "../../context/NetworkContext";
import { useLanguage } from "../../i18n/useLanguage";
import { useNodeStatus } from "../../hooks/nodes/useNodeStatus";
import { useNodeHeights } from "../../hooks/nodes/useNodeHeights";
import { useChainOverview } from "../../hooks/nodes/useChainOverview";
import { agoText, findNode } from "../../utils/nodeDetail";
import { heightLabel, hostOf, isValidatorName, publicNodes, syncState, tipHeight } from "../../utils/nodesView";
import { copyToClipboard } from "../../utils/clipboard";
import { hasValue, isRecord } from "../../utils/guards";
import type { TranslationKey } from "../../i18n";
import styles from "./NodeHome.module.css";

const NODES = publicNodes(NETWORK_PRESETS);

/**
 * One node (Flagship look): online or not, validator or sync, in sync or how
 * far behind, latest block with a live pulse of recent heights, chain and
 * software, and its addresses with Copy and "Use this node".
 */
const NodeHome: React.FC = () => {
    const { t } = useLanguage();
    const { name = "" } = useParams<{ name: string }>();
    const location = useLocation();
    const { discoveredNetworks, currentNetwork, setNetwork } = useNetwork();
    const linked = isRecord(location.state) && isRecord(location.state.network) ? (location.state.network as unknown as NetworkEndpoints) : undefined;
    const node = findNode(decodeURIComponent(name), NETWORK_PRESETS, discoveredNetworks, linked);
    const { snapshot, online, loading, checkedAt, pulse } = useNodeStatus(node);
    const heights = useNodeHeights(NODES);
    const { overview } = useChainOverview();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);
    useEffect(() => {
        document.title = `${node?.name ?? "Node"} - Block52`;
    }, [node]);

    const ago = (ms: number) => agoText(ms, now, t);

    if (!node) {
        return (
            <div className={styles.page}>
                <Link to="/nodes" className={styles.crumb}>
                    ← {t("nav.nodes")}
                </Link>
                <p className={styles.notFound}>{t("node.notFound", { name: decodeURIComponent(name) })}</p>
            </div>
        );
    }

    const validator = isValidatorName(node.name, (overview?.validators ?? []).map(v => v.moniker));
    const tip = tipHeight([...NODES.map(n => heights[n.name]?.height ?? null), snapshot?.height ?? null]);
    const sync = syncState(snapshot?.height ?? null, tip);
    const isCurrent = currentNetwork.rest === node.rest;
    const endpoints: { key: TranslationKey; value: string }[] = [
        { key: "node.rest", value: node.rest },
        { key: "node.rpc", value: node.rpc },
        { key: "node.ws", value: node.ws }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>
            <Link to="/nodes" className={styles.crumb}>
                ← {t("nav.nodes")}
            </Link>

            <header className={styles.head}>
                <div className={styles.titleRow}>
                    <span className={loading ? styles.orbWait : online ? styles.orbOn : styles.orbOff} aria-hidden="true" />
                    <h1>{node.name}</h1>
                </div>
                <div className={styles.chips}>
                    <span className={loading ? styles.chipWait : online ? styles.chipOn : styles.chipOff}>
                        {loading ? t("node.checking") : online ? t("node.online") : t("node.offline")}
                    </span>
                    <span className={validator ? styles.chipVal : styles.chipSync}>{validator ? t("nodes.validator") : t("nodes.sync")}</span>
                    {snapshot?.catchingUp ? (
                        <span className={styles.chipWarn}>{t("node.catchingUp")}</span>
                    ) : sync.kind === "behind" ? (
                        <span className={styles.chipWarn}>{t("nodes.behind", { n: sync.blocks.toLocaleString() })}</span>
                    ) : sync.kind === "synced" ? (
                        <span className={styles.chipOn}>{t("nodes.inSync")}</span>
                    ) : null}
                    {hasValue(checkedAt) ? <span className={styles.checked}>{t("node.checked", { ago: ago(checkedAt) })}</span> : null}
                </div>
                {!online && !loading ? <p className={styles.warn}>{t("node.noAnswer")}</p> : null}
            </header>

            <section className={styles.tiles}>
                <div className={styles.tileBig}>
                    <small>{t("nodes.latestBlock")}</small>
                    <b>{snapshot?.height ? heightLabel(snapshot.height) : "—"}</b>
                    <span>{snapshot?.blockTime ? ago(Date.parse(snapshot.blockTime)) : ""}</span>
                    <div className={styles.pulse} aria-label={t("node.pulse")}>
                        {pulse.map((h, i) => (
                            <i key={h} style={{ opacity: 0.35 + (0.65 * (i + 1)) / pulse.length }} title={heightLabel(h)} />
                        ))}
                    </div>
                </div>
                <div>
                    <small>{t("node.chain")}</small>
                    <b>{snapshot?.chainId ?? "—"}</b>
                    <span>{snapshot?.moniker ? t("node.moniker", { name: snapshot.moniker }) : ""}</span>
                </div>
                <div>
                    <small>{t("node.software")}</small>
                    <b>{snapshot?.version ?? "—"}</b>
                    <span>{snapshot?.sdkVersion ? t("node.sdk", { v: snapshot.sdkVersion }) : ""}</span>
                </div>
            </section>

            <section className={styles.connect}>
                <div className={styles.connectHead}>
                    <div>
                        <h2>{t("node.connectTitle")}</h2>
                        <p>{t("node.connectSub", { host: hostOf(node.rest) })}</p>
                    </div>
                    {isCurrent ? (
                        <span className={styles.chipOn}>{t("node.inUse")}</span>
                    ) : (
                        <button type="button" className={styles.use} onClick={() => setNetwork(node)}>
                            {t("node.useThis")}
                        </button>
                    )}
                </div>
                <dl className={styles.endpoints}>
                    {endpoints.map(e => (
                        <React.Fragment key={e.key}>
                            <dt>{t(e.key)}</dt>
                            <dd>
                                <code>{e.value}</code>
                                <button type="button" onClick={() => void copyToClipboard(e.value)}>
                                    {t("node.copy")}
                                </button>
                            </dd>
                        </React.Fragment>
                    ))}
                </dl>
            </section>
        </div>
    );
};

export default NodeHome;
