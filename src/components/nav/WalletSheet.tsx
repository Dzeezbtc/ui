import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { WithdrawalModal, USDCDepositModal } from "../modals";
import TransactionPanel from "../TransactionPanel";
import { balanceParts, SEND_PARAM } from "../../utils/walletView";
import { truncateMiddle } from "../../utils/stringUtils";
import styles from "./WalletSheet.module.css";

interface WalletSheetProps {
    address: string;
    /** USDC balance as a decimal string ("1240.500000"). */
    usdc: string;
    onClose: () => void;
    onRefresh: () => void;
}

/**
 * Your game wallet, opened from the top bar's balance or Deposit button on any
 * page: the balance, Deposit / Withdraw / Send, your address and recent
 * activity, without leaving the page. The full Wallet page has the rest.
 */
export const WalletSheet: React.FC<WalletSheetProps> = ({ address, usdc, onClose, onRefresh }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [copied, setCopied] = useState(false);
    const big = balanceParts(usdc);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !depositing && !withdrawing) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, depositing, withdrawing]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Could not copy the address:", err);
        }
    };

    return createPortal(
        <div className={styles.portal}>
            <button type="button" className={styles.scrim} aria-label={t("table.close")} onClick={onClose} />
            <aside className={styles.sheet} role="dialog" aria-modal="true" aria-label={t("walletSheet.title")}>
                <header className={styles.head}>
                    <b>{t("walletSheet.title")}</b>
                    <button type="button" className={styles.x} onClick={onClose} aria-label={t("table.close")}>
                        ✕
                    </button>
                </header>

                <div className={styles.balance}>
                    <small>{t("wallet.balance")}</small>
                    <div className={styles.big}>
                        {big.whole}
                        <span>{big.cents}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.primary} onClick={() => setDepositing(true)}>
                        {t("wallet.deposit")}
                    </button>
                    <button type="button" className={styles.ghost} onClick={() => setWithdrawing(true)}>
                        {t("wallet.withdraw")}
                    </button>
                    <button
                        type="button"
                        className={styles.ghost}
                        onClick={() => {
                            onClose();
                            navigate(`/?${SEND_PARAM}=1`);
                        }}
                    >
                        {t("wallet.send")}
                    </button>
                </div>

                <div className={styles.addr}>
                    <span title={address}>{truncateMiddle(address, 12, 8)}</span>
                    <button type="button" onClick={copy}>
                        {copied ? t("wallet.copied") : t("wallet.copy")}
                    </button>
                </div>

                <div className={styles.activity}>
                    <TransactionPanel cosmosWalletAddress={address} usdcBalance={usdc} />
                </div>

                <Link to="/wallet" className={styles.more} onClick={onClose}>
                    {t("walletSheet.full")} →
                </Link>
            </aside>

            {depositing ? (
                <USDCDepositModal
                    isOpen={depositing}
                    onClose={() => setDepositing(false)}
                    onSuccess={() => {
                        setDepositing(false);
                        onRefresh();
                    }}
                />
            ) : null}
            {withdrawing ? <WithdrawalModal isOpen={withdrawing} onClose={() => setWithdrawing(false)} onSuccess={onRefresh} /> : null}
        </div>,
        document.body
    );
};

export default WalletSheet;
