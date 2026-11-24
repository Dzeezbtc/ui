import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useBlockDetail } from "../../hooks/explorer/useBlockDetail";
import { formatProposerAddress, formatTimestampRelative } from "../../utils/formatUtils";
import { truncateMiddle } from "../../utils/stringUtils";

import { copyToClipboard } from "../../utils/clipboard";
import { blockLabel } from "../../utils/explorerDetail";
import { hasContent, hasElements, isEmpty } from "../../utils/guards";
import styles from "./ExplorerDetail.module.css";

/**
 * A block (Flagship look): its height with previous / next, when it was made
 * and by whom, every transaction in plain words, and the hashes folded away.
 */
const BlockHome: React.FC = () => {
    const { t } = useLanguage();
    const { height: param } = useParams<{ height: string }>();
    const height = Number(param);
    const { block, loading, error } = useBlockDetail(height);

    useEffect(() => {
        document.title = `Block ${param ?? ""} - Block52`;
    }, [param]);

    const proposer = block ? formatProposerAddress(block.proposer, "b521valcons") : "";

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>
            <Link to="/explorer" className={styles.crumb}>
                ← {t("explorerDetail.explorer")}
            </Link>

            <header className={styles.head}>
                <div>
                    <div className={styles.eyebrow}>{t("explorerDetail.block")}</div>
                    <h1>{height > 0 ? blockLabel(height) : param}</h1>
                </div>
                {height > 0 ? (
                    <nav className={styles.stepper} aria-label={t("explorerDetail.otherBlocks")}>
                        {height > 1 ? (
                            <Link to={`/explorer/block/${height - 1}`} aria-label={t("explorerDetail.prevBlock")}>
                                ←
                            </Link>
                        ) : null}
                        <Link to={`/explorer/block/${height + 1}`} aria-label={t("explorerDetail.nextBlock")}>
                            →
                        </Link>
                    </nav>
                ) : null}
            </header>

            {loading ? <div className={styles.spinner} /> : null}
            {error ? <p className={styles.error}>{t("explorerDetail.blockError", { error })}</p> : null}

            {block ? (
                <>
                    <section className={styles.facts}>
                        <div>
                            <small>{t("explorerDetail.made")}</small>
                            <b>{hasContent(block.time) ? formatTimestampRelative(block.time) : "—"}</b>
                            <span>{hasContent(block.time) ? new Date(block.time).toLocaleString() : ""}</span>
                        </div>
                        <div>
                            <small>{t("explorerDetail.transactions")}</small>
                            <b>{block.txs.length}</b>
                            <span>{isEmpty(block.txs) ? t("explorerDetail.quietBlock") : t("explorerDetail.inThisBlock")}</span>
                        </div>
                        <div>
                            <small>{t("explorerDetail.madeBy")}</small>
                            <b className={styles.mono}>{hasContent(proposer) ? truncateMiddle(proposer, 10, 6) : "—"}</b>
                            <span>{t("explorerDetail.validator")}</span>
                        </div>
                    </section>

                    {hasElements(block.txs) ? (
                        <section className={styles.list}>
                            <h2>{t("explorerDetail.whatHappened")}</h2>
                            {block.txs.map((tx, i) => (
                                <Link key={tx.hash} to={`/explorer/tx/${tx.hash}`} className={styles.row}>
                                    <span className={styles.rowNum}>{i + 1}</span>
                                    <span className={styles.rowLabel}>{tx.label ?? t("explorerDetail.transaction")}</span>
                                    <span className={styles.rowHash}>{truncateMiddle(tx.hash, 6, 6)}</span>
                                    <span className={styles.rowGo}>→</span>
                                </Link>
                            ))}
                        </section>
                    ) : (
                        <p className={styles.empty}>{t("explorerDetail.noTxs")}</p>
                    )}

                    <details className={styles.tech}>
                        <summary>{t("explorerDetail.technical")}</summary>
                        <dl>
                            <dt>{t("explorerDetail.blockHash")}</dt>
                            <dd>
                                <code>{block.hash}</code>
                                <button type="button" onClick={() => void copyToClipboard(block.hash)}>
                                    {t("explorerDetail.copy")}
                                </button>
                            </dd>
                            <dt>{t("explorerDetail.appHash")}</dt>
                            <dd>
                                <code>{block.appHash}</code>
                            </dd>
                            <dt>{t("explorerDetail.chain")}</dt>
                            <dd>
                                <code>{block.chainId}</code>
                            </dd>
                            <dt>{t("explorerDetail.proposerRaw")}</dt>
                            <dd>
                                <code>{block.proposer}</code>
                            </dd>
                        </dl>
                    </details>
                </>
            ) : null}
        </div>
    );
};

export default BlockHome;
