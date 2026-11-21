import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "../../i18n/useLanguage";
import { useCosmosWallet } from "../../hooks/wallet/useCosmosWallet";
import useUserWalletConnect from "../../hooks/wallet/useUserWalletConnect";
import { WithdrawalModal, USDCDepositModal } from "../../components/modals";
import TransactionPanel from "../../components/TransactionPanel";
import CosmosWalletPage from "../../components/CosmosWalletPage";
import { formatMicroAsUsdc } from "../../constants/currency";
import { clearCosmosData, getCosmosMnemonic } from "../../utils/cosmos";
import { clearCosmosClient } from "../../utils/cosmos/client";
import { hasContent } from "../../utils/guards";
import { usdcMicroOf } from "../../utils/siteNav";
import { SEND_PARAM, balanceParts, phraseWords } from "../../utils/walletView";
import { NavGlyph } from "../../components/nav/NavGlyph";
import styles from "./WalletHome.module.css";

/**
 * The Wallet page (Flagship look): the balance with Deposit / Withdraw / Send,
 * your Block52 address (copy, QR), the recovery phrase behind a warning, the
 * Web3 wallet, and your recent activity. With no wallet on this device it shows
 * the create / import screen.
 */
const WalletHome: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const wallet = useCosmosWallet();
    const { open: openWeb3, disconnect: disconnectWeb3, isConnected: web3Connected, address: web3Address } = useUserWalletConnect();
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [showPhrase, setShowPhrase] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    if (!hasContent(wallet.address)) return <CosmosWalletPage />;

    const address = wallet.address;
    const usdc = formatMicroAsUsdc(usdcMicroOf(wallet.balance), 6);
    const big = balanceParts(usdc);
    const mnemonic = getCosmosMnemonic();

    const copy = async (text: string, what: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(what);
            window.setTimeout(() => setCopied(null), 1600);
        } catch (err) {
            console.error("Could not copy:", err);
        }
    };

    const switchWallet = () => {
        if (!window.confirm(t("wallet.switchConfirm"))) return;
        clearCosmosData();
        clearCosmosClient();
        window.location.reload();
    };

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
            </div>

            <div className={styles.top}>
                <section className={`${styles.box} ${styles.balance}`}>
                    <div className={styles.eyebrow}>{t("wallet.balance")}</div>
                    <div className={styles.bignum}>
                        {big.whole}
                        <small>{big.cents}</small>
                    </div>
                    <p className={styles.muted}>{t("wallet.balanceSub")}</p>
                    <div className={styles.actions}>
                        <button type="button" className={styles.act} onClick={() => setShowDeposit(true)}>
                            <span className={`${styles.ic} ${styles.icGood}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 4v13M6 11l6 6 6-6M5 20h14" />
                                </svg>
                            </span>
                            <b>{t("wallet.deposit")}</b>
                            <small>{t("wallet.depositSub")}</small>
                        </button>
                        <button type="button" className={styles.act} onClick={() => setShowWithdraw(true)}>
                            <span className={`${styles.ic} ${styles.icVi}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 20V7M6 13l6-6 6 6M5 4h14" />
                                </svg>
                            </span>
                            <b>{t("wallet.withdraw")}</b>
                            <small>{t("wallet.withdrawSub")}</small>
                        </button>
                        <button type="button" className={styles.act} onClick={() => navigate(`/?${SEND_PARAM}=1`)}>
                            <span className={`${styles.ic} ${styles.icCy}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
                                </svg>
                            </span>
                            <b>{t("wallet.send")}</b>
                            <small>{t("wallet.sendSub")}</small>
                        </button>
                    </div>
                </section>

                <div className={styles.col}>
                    <section className={styles.box}>
                        <div className={styles.row}>
                            <div className={styles.eyebrow}>{t("wallet.address")}</div>
                            <span className={styles.pill}>{t("wallet.onlyYou")}</span>
                        </div>
                        <div className={styles.addr}>
                            <span>{address}</span>
                            <button type="button" className={styles.copy} onClick={() => copy(address, "address")}>
                                {copied === "address" ? t("wallet.copied") : t("wallet.copy")}
                            </button>
                        </div>
                        <div className={styles.btns}>
                            <button type="button" className={styles.btnO} onClick={() => setShowQr(s => !s)} aria-expanded={showQr}>
                                {showQr ? t("wallet.hideQr") : t("wallet.showQr")}
                            </button>
                        </div>
                        {showQr ? (
                            <div className={styles.qr}>
                                <QRCodeSVG value={address} size={180} level="M" bgColor="#ffffff" fgColor="#07060d" />
                            </div>
                        ) : null}
                    </section>

                    <section className={styles.box}>
                        <div className={styles.eyebrow}>{t("wallet.web3")}</div>
                        {web3Connected && hasContent(web3Address) ? (
                            <>
                                <div className={styles.addr}>
                                    <span>{web3Address}</span>
                                    <button type="button" className={styles.copy} onClick={() => copy(web3Address, "web3")}>
                                        {copied === "web3" ? t("wallet.copied") : t("wallet.copy")}
                                    </button>
                                </div>
                                <div className={styles.btns}>
                                    <button type="button" className={styles.btnO} onClick={() => disconnectWeb3()}>
                                        {t("wallet.disconnect")}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={styles.muted}>{t("wallet.web3Sub")}</p>
                                <div className={styles.btns}>
                                    <button type="button" className={styles.btnGrad} onClick={() => openWeb3()}>
                                        {t("wallet.connect")}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>

                    {hasContent(mnemonic) ? (
                        <section className={styles.box}>
                            <div className={styles.row}>
                                <div className={styles.eyebrow}>{t("wallet.phrase")}</div>
                                <NavGlyph icon="key" />
                            </div>
                            <p className={styles.warn}>{t("wallet.phraseWarn")}</p>
                            {showPhrase ? (
                                <ol className={styles.words}>
                                    {phraseWords(mnemonic).map((w, i) => (
                                        <li key={i}>
                                            <i>{i + 1}</i>
                                            {w}
                                        </li>
                                    ))}
                                </ol>
                            ) : null}
                            <div className={styles.btns}>
                                <button type="button" className={styles.btnO} onClick={() => setShowPhrase(s => !s)} aria-expanded={showPhrase}>
                                    {showPhrase ? t("wallet.hidePhrase") : t("wallet.showPhrase")}
                                </button>
                                {showPhrase ? (
                                    <button type="button" className={styles.btnO} onClick={() => copy(mnemonic, "phrase")}>
                                        {copied === "phrase" ? t("wallet.copied") : t("wallet.copy")}
                                    </button>
                                ) : null}
                                <button type="button" className={styles.btnText} onClick={switchWallet}>
                                    {t("wallet.switch")}
                                </button>
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>

            <section className={styles.activity}>
                <div className={styles.secHead}>
                    <h2>{t("wallet.activity")}</h2>
                    <p>{t("wallet.activitySub")}</p>
                </div>
                <TransactionPanel cosmosWalletAddress={address} usdcBalance={usdc} />
            </section>

            {showDeposit ? (
                <USDCDepositModal
                    isOpen={showDeposit}
                    onClose={() => setShowDeposit(false)}
                    onSuccess={() => {
                        setShowDeposit(false);
                        wallet.refreshBalance();
                    }}
                />
            ) : null}
            {showWithdraw ? <WithdrawalModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} onSuccess={() => wallet.refreshBalance()} /> : null}
        </div>
    );
};

export default WalletHome;
