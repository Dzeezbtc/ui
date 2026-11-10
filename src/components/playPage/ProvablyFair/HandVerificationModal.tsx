/**
 * "Verify this hand" (ui#972): the four fairness checks for one hand, the cards
 * as dealt, and every input needed to redo the checks offline. Opens over the
 * table, which stays visible behind it.
 */
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FaCheck, FaChevronLeft, FaChevronRight, FaCopy, FaDownload, FaExclamationTriangle, FaMinus, FaShieldAlt, FaSyncAlt, FaTimes } from "react-icons/fa";
import { useHandVerification } from "../../../hooks/game/useHandVerification";
import { copyToClipboard } from "../../../utils/clipboard";
import { getCardBackUrl, getCardImageUrl } from "../../../utils/cardImages";
import { downloadTextFile } from "../../../utils/downloadFile";
import { hasElements, hasValue } from "../../../utils/guards";
import { buildHandShareUrl } from "../../../utils/handReplay";
import { buildVerificationRecord, verificationRecordFileName, type CheckStatus } from "../../../utils/provablyFair/handVerification";
import { CHECK_STATUS_LABEL, CHECK_STATUS_TONE, OVERALL_TONE, dealtHandLabel, type Tone } from "../../../utils/provablyFair/presentation";
import styles from "./ProvablyFair.module.css";

const TONE_TEXT: Record<Tone, string> = { good: styles.toneGood, warn: styles.toneWarn, bad: styles.toneBad, neutral: styles.toneNeutral };
const TONE_BANNER: Record<Tone, string> = { good: styles.bannerGood, warn: styles.bannerWarn, bad: styles.bannerBad, neutral: styles.bannerNeutral };
const CHECK_ICON: Record<CheckStatus, React.ReactNode> = {
    pass: <FaCheck size={13} />,
    limited: <FaExclamationTriangle size={13} />,
    fail: <FaTimes size={13} />,
    pending: <FaMinus size={13} />,
    unavailable: <FaMinus size={13} />,
    na: <FaMinus size={13} />
};

export interface HandVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string;
    /** The hand to open on. */
    handNumber: number;
    tableName?: string;
    /** e.g. "No Limit Hold'em". */
    gameLabel?: string;
    /** The table's current hand, so the window can step forward to it; omit on history pages. */
    latestHand?: number;
}

const Card: React.FC<{ card: string; recomputed?: boolean; hidden?: boolean }> = ({ card, recomputed, hidden }) => (
    <img
        className={`${styles.card} ${recomputed && !hidden ? styles.cardRecomputed : ""}`}
        src={hidden ? getCardBackUrl("default") : getCardImageUrl(card)}
        alt={hidden ? "Hidden card" : card}
        title={hidden ? "Not shown at the table" : recomputed ? `${card} (recomputed from the seed)` : card}
    />
);

export const HandVerificationModal: React.FC<HandVerificationModalProps> = ({ isOpen, onClose, tableId, handNumber, tableName, gameLabel, latestHand }) => {
    const [hand, setHand] = useState(handNumber);
    const [showRecomputed, setShowRecomputed] = useState(false);
    const { evidence, result, node, isLoading, error, reload } = useHandVerification({ tableId, handNumber: hand, enabled: isOpen });

    useEffect(() => {
        if (isOpen) setHand(handNumber);
    }, [isOpen, handNumber]);

    useEffect(() => {
        setShowRecomputed(false);
    }, [hand]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const handleDownload = useCallback(() => {
        if (!evidence || !result) return;
        downloadTextFile(verificationRecordFileName(tableId, hand), buildVerificationRecord(evidence, result, new Date().toISOString()));
    }, [evidence, result, tableId, hand]);

    if (!isOpen) return null;

    const overallTone = result ? OVERALL_TONE[result.overall] : "neutral";
    const hasHidden = result ? result.dealt.some(d => !d.shown) : false;
    const canStepForward = hasValue(latestHand) ? hand < latestHand : true;

    return createPortal(
        <div className={styles.overlay} onClick={onClose} data-testid="hand-verification">
            <div className={styles.window} role="dialog" aria-modal="true" aria-label={`Verify hand ${hand}`} onClick={e => e.stopPropagation()}>
                <div className={styles.windowBar}>
                    <span className="flex items-center gap-2">
                        <FaShieldAlt className={styles.toneGood} /> Verify this hand
                    </span>
                    <span className="flex items-center gap-1">
                        <button className={styles.closeButton} onClick={() => setHand(h => h - 1)} disabled={hand <= 1} title="Previous hand">
                            <FaChevronLeft size={12} />
                        </button>
                        <button className={styles.closeButton} onClick={() => setHand(h => h + 1)} disabled={!canStepForward} title="Next hand">
                            <FaChevronRight size={12} />
                        </button>
                        <button className={styles.closeButton} onClick={reload} title="Check again" disabled={isLoading}>
                            <FaSyncAlt size={12} className={isLoading ? styles.spin : ""} />
                        </button>
                        <button className={styles.closeButton} onClick={onClose} title="Close" data-testid="hand-verification-close">
                            <FaTimes size={14} />
                        </button>
                    </span>
                </div>

                <div className={styles.windowBody}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className={styles.handTitle}>
                                Hand #{hand}
                                {tableName ? ` · ${tableName}` : ""}
                            </div>
                            <div className={styles.handMeta}>
                                {gameLabel ? `${gameLabel} · ` : ""}
                                {evidence?.start?.time ? `${new Date(evidence.start.time).toLocaleString()} · ` : ""}
                                <a href={buildHandShareUrl(window.location.origin, tableId, hand)} target="_blank" rel="noopener noreferrer">
                                    replay
                                </a>
                            </div>
                        </div>
                        <button className={styles.secondaryButton} onClick={handleDownload} disabled={!result || isLoading} data-testid="download-record">
                            <FaDownload size={12} /> Download record
                        </button>
                    </div>

                    {isLoading && !result && <div className={`${styles.banner} ${styles.bannerNeutral}`}>Reading the hand's records from the chain…</div>}
                    {error && <div className={`${styles.banner} ${styles.bannerBad}`}>{error}</div>}

                    {result && (
                        <>
                            <div className={`${styles.banner} ${TONE_BANNER[overallTone]}`} data-testid="verification-banner" data-status={result.overall}>
                                <FaShieldAlt className="mt-0.5 flex-shrink-0" />
                                <span>{result.headline}</span>
                            </div>

                            {result.checks.map(check => (
                                <div key={check.id} className={styles.check} data-testid={`check-${check.id}`} data-status={check.status}>
                                    <span className={`${styles.checkIcon} ${TONE_TEXT[CHECK_STATUS_TONE[check.status]]}`}>{CHECK_ICON[check.status]}</span>
                                    <div className="min-w-0">
                                        <div className={styles.checkTitle}>
                                            {check.title}
                                            <span className={`${styles.checkStatus} ${TONE_TEXT[CHECK_STATUS_TONE[check.status]]}`}>{CHECK_STATUS_LABEL[check.status]}</span>
                                        </div>
                                        <div className={styles.checkDetail}>{check.detail}</div>
                                    </div>
                                </div>
                            ))}

                            {(hasElements(result.dealt) || hasElements(result.board)) && (
                                <>
                                    <div className={styles.sectionTitle}>Cards as dealt</div>
                                    <div className={styles.sectionNote}>
                                        Rebuilt from the seed in the order the engine deals: one card to each player per pass, then the board.
                                        {hasHidden && " Hands nobody showed stay face down unless you choose to see them."}
                                    </div>
                                    {result.dealt.map((d, i) => (
                                        <div key={`${d.seat}-${i}`} className={styles.dealRow}>
                                            <span className={styles.dealLabel} title={d.address}>
                                                {dealtHandLabel(d, i)}
                                            </span>
                                            <span className={styles.dealCards}>
                                                {d.cards.map(c => (
                                                    <Card key={c} card={c} recomputed={!d.shown} hidden={!d.shown && !showRecomputed} />
                                                ))}
                                            </span>
                                            {!d.shown && <span className={styles.tag}>{showRecomputed ? "recomputed" : "not shown"}</span>}
                                        </div>
                                    ))}
                                    {hasElements(result.board) && (
                                        <div className={styles.dealRow}>
                                            <span className={styles.dealLabel}>Board</span>
                                            <span className={styles.dealCards}>
                                                {result.board.map(c => (
                                                    <Card key={c} card={c} />
                                                ))}
                                            </span>
                                        </div>
                                    )}
                                    {hasHidden && (
                                        <button className={`${styles.secondaryButton} mt-3`} onClick={() => setShowRecomputed(v => !v)} data-testid="toggle-recomputed">
                                            {showRecomputed ? "Hide hands nobody showed" : "Show hands nobody showed (recomputed)"}
                                        </button>
                                    )}
                                </>
                            )}

                            <div className={styles.sectionTitle}>Inputs</div>
                            <div className={styles.sectionNote}>
                                Everything needed to redo the checks yourself, offline. The record download has the same values as JSON
                                {hasValue(node) ? `. Read from ${node}.` : "."}
                            </div>
                            <div className={styles.inputs}>
                                {result.inputs.map(input => (
                                    <div key={input.label} className={styles.inputRow}>
                                        <span className={styles.inputLabel}>{input.label}</span>
                                        <span className={styles.inputValue}>
                                            {input.href ? (
                                                <Link to={input.href} target="_blank" rel="noopener noreferrer">
                                                    {input.value}
                                                </Link>
                                            ) : (
                                                input.value
                                            )}
                                        </span>
                                        {input.copy ? (
                                            <button className={styles.copyButton} onClick={() => copyToClipboard(input.value, `${input.label} copied`)} title={`Copy ${input.label}`}>
                                                <FaCopy size={11} />
                                            </button>
                                        ) : (
                                            <span />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
