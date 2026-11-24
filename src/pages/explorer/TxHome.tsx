import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useTxDetail } from "../../hooks/explorer/useTxDetail";
import { blockLabel, messageFields, txSentence } from "../../utils/explorerDetail";
import { sumUsdcTransferEvents } from "../../utils/transactionUtils";
import { formatTimestampRelative } from "../../utils/formatUtils";
import { truncateMiddle } from "../../utils/stringUtils";

import { copyToClipboard } from "../../utils/clipboard";
import { formatMicroAsUsdc } from "../../constants/currency";
import { hasContent, hasElements, hasValue } from "../../utils/guards";
import styles from "./ExplorerDetail.module.css";

/**
 * A transaction (Flagship look): what it did in a sentence, whether it went
 * through, its block and time, each message's fields with readable names
 * (addresses linked, long values shortened), and the raw data folded away.
 */
const TxHome: React.FC = () => {
    const { t } = useLanguage();
    const { hash = "" } = useParams<{ hash: string }>();
    const { tx, loading, error } = useTxDetail(hash);

    useEffect(() => {
        document.title = `Tx ${hash.slice(0, 8)} - Block52`;
    }, [hash]);

    const res = tx?.tx_response;
    const messages = tx?.tx.body.messages ?? [];
    const moved = res ? sumUsdcTransferEvents(res.events ?? []) : undefined;
    const ok = res?.code === 0;

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>
            <Link to="/explorer" className={styles.crumb}>
                ← {t("explorerDetail.explorer")}
            </Link>

            {loading ? <div className={styles.spinner} /> : null}
            {error ? <p className={styles.error}>{t("explorerDetail.txError", { error })}</p> : null}

            {res ? (
                <>
                    <header className={styles.head}>
                        <div>
                            <div className={styles.eyebrow}>{t("explorerDetail.transaction")}</div>
                            <h1 className={styles.sentence}>{hasElements(messages) ? txSentence(messages[0]) : t("explorerDetail.transaction")}</h1>
                            {messages.length > 1 ? <p className={styles.sub}>{t("explorerDetail.andMore", { n: messages.length - 1 })}</p> : null}
                        </div>
                        <span className={ok ? styles.okPill : styles.badPill}>
                            <i />
                            {ok ? t("explorerDetail.succeeded") : t("explorerDetail.failed")}
                        </span>
                    </header>

                    <section className={styles.facts}>
                        <div>
                            <small>{t("explorerDetail.block")}</small>
                            <b>
                                <Link to={`/explorer/block/${res.height}`}>{blockLabel(Number(res.height))}</Link>
                            </b>
                            <span>{hasContent(res.timestamp) ? formatTimestampRelative(res.timestamp) : ""}</span>
                        </div>
                        <div>
                            <small>{t("explorerDetail.moved")}</small>
                            <b>{hasValue(moved) ? `$${formatMicroAsUsdc(moved, 2)}` : "—"}</b>
                            <span>{hasValue(moved) ? t("explorerDetail.usdc") : t("explorerDetail.noMoney")}</span>
                        </div>
                        <div>
                            <small>{t("explorerDetail.work")}</small>
                            <b>{Number(res.gas_used).toLocaleString("en-US")}</b>
                            <span>{t("explorerDetail.gasUsed")}</span>
                        </div>
                    </section>

                    {messages.map((m, i) => (
                        <section key={i} className={styles.msg}>
                            {messages.length > 1 ? <h2>{txSentence(m)}</h2> : null}
                            <dl className={styles.fields}>
                                {messageFields(m).map(f => (
                                    <React.Fragment key={f.key}>
                                        <dt>{f.label}</dt>
                                        <dd>
                                            {f.kind === "address" ? (
                                                <Link to={`/explorer/address/${f.value}`} className={styles.mono}>
                                                    {truncateMiddle(f.value, 10, 6)}
                                                </Link>
                                            ) : f.kind === "long" ? (
                                                <>
                                                    <span className={styles.mono} title={f.value}>
                                                        {truncateMiddle(f.value, 12, 8)}
                                                    </span>
                                                    <button type="button" onClick={() => void copyToClipboard(f.value)}>
                                                        {t("explorerDetail.copy")}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={styles.mono}>{f.value}</span>
                                            )}
                                        </dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </section>
                    ))}

                    <details className={styles.tech}>
                        <summary>{t("explorerDetail.technical")}</summary>
                        <dl>
                            <dt>{t("explorerDetail.txHash")}</dt>
                            <dd>
                                <code>{res.txhash}</code>
                                <button type="button" onClick={() => void copyToClipboard(res.txhash)}>
                                    {t("explorerDetail.copy")}
                                </button>
                            </dd>
                            <dt>{t("explorerDetail.gas")}</dt>
                            <dd>
                                <code>
                                    {res.gas_used} / {res.gas_wanted}
                                </code>
                            </dd>
                        </dl>
                        <pre>{JSON.stringify({ messages, events: res.events }, null, 2)}</pre>
                    </details>
                </>
            ) : null}
        </div>
    );
};

export default TxHome;
