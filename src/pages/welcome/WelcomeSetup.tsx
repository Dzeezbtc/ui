import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "../../i18n/useLanguage";
import { useWalletSetup, type NewWallet } from "../../hooks/wallet/useWalletSetup";
import { phraseWords, pickCheckPositions, wordsMatch } from "../../utils/welcomeSetup";
import { copyToClipboard } from "../../utils/clipboard";
import styles from "./WelcomeSetup.module.css";

type Step = "start" | "restore" | "address" | "words" | "check" | "money" | "table";

/** The five steps the dots along the top count; restoring skips the words. */
const DOTS: Step[] = ["address", "words", "check", "money", "table"];

/**
 * First-visit setup (Flagship look). The app has already made this visitor a
 * wallet (block52/ui#377); here they see its address, write down and check the
 * 24 recovery words, add money or skip, then go to a first table. They can
 * restore a wallet they already have instead. Nothing leaves the device.
 */
const WelcomeSetup: React.FC = () => {
    const { t } = useLanguage();
    const setup = useWalletSetup();
    const [step, setStep] = useState<Step>("start");
    const [wallet, setWallet] = useState<NewWallet | null>(null);
    const [restored, setRestored] = useState(false);
    const [phrase, setPhrase] = useState("");
    const [revealed, setRevealed] = useState(false);
    const [answers, setAnswers] = useState<string[]>([]);
    const [wrong, setWrong] = useState(false);

    useEffect(() => {
        document.title = "Welcome - Block52";
    }, []);

    const words = useMemo(() => phraseWords(wallet?.mnemonic ?? ""), [wallet]);
    const positions = useMemo(() => pickCheckPositions(words.length), [words]);

    const begin = async () => {
        const w = setup.current() ?? (await setup.create());
        if (w) {
            setWallet(w);
            setStep("address");
        }
    };
    const restore = async () => {
        const w = await setup.restore(phrase);
        if (w) {
            setup.save(w);
            setWallet(w);
            setRestored(true);
            setStep("address");
        }
    };
    const check = () => {
        if (wallet && wordsMatch(words, positions, answers)) {
            setup.save(wallet);
            setWrong(false);
            setStep("money");
        } else {
            setWrong(true);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <i />
                <i />
                <i />
            </div>
            <main className={styles.card}>
                {DOTS.includes(step) ? (
                    <ol className={styles.dots} aria-label={t("welcome.progress")}>
                        {DOTS.filter(d => !(restored && (d === "words" || d === "check"))).map(d => (
                            <li key={d} className={d === step ? styles.dotOn : DOTS.indexOf(d) < DOTS.indexOf(step) ? styles.dotDone : styles.dot} />
                        ))}
                    </ol>
                ) : null}

                {step === "start" ? (
                    <section className={styles.step}>
                        <div className={styles.suits} aria-hidden="true">
                            <span>♠</span>
                            <span>♥</span>
                            <span>♦</span>
                            <span>♣</span>
                        </div>
                        <h1>{t("welcome.title")}</h1>
                        <p>{t("welcome.lead")}</p>
                        <button type="button" className={styles.primary} disabled={setup.busy} onClick={() => void begin()}>
                            {setup.busy ? t("welcome.making") : t("welcome.create")}
                        </button>
                        <button type="button" className={styles.secondary} onClick={() => setStep("restore")}>
                            {t("welcome.haveOne")}
                        </button>
                        {setup.error === "create" ? <p className={styles.error}>{t("welcome.createError")}</p> : null}
                        <Link to="/" className={styles.skip} onClick={setup.markSeen}>
                            {t("welcome.lookAround")}
                        </Link>
                    </section>
                ) : null}

                {step === "restore" ? (
                    <section className={styles.step}>
                        <h1>{t("welcome.restoreTitle")}</h1>
                        <p>{t("welcome.restoreLead")}</p>
                        <textarea
                            className={styles.phrase}
                            value={phrase}
                            onChange={e => setPhrase(e.target.value)}
                            rows={4}
                            spellCheck={false}
                            autoComplete="off"
                            placeholder={t("welcome.restorePlaceholder")}
                            aria-label={t("welcome.restoreTitle")}
                        />
                        {setup.error === "phrase" ? <p className={styles.error}>{t("welcome.phraseError")}</p> : null}
                        <button type="button" className={styles.primary} disabled={setup.busy} onClick={() => void restore()}>
                            {t("welcome.restore")}
                        </button>
                        <button type="button" className={styles.link} onClick={() => setStep("start")}>
                            {t("welcome.back")}
                        </button>
                    </section>
                ) : null}

                {step === "address" && wallet ? (
                    <section className={styles.step}>
                        <h1>{t("welcome.addressTitle")}</h1>
                        <p>{t("welcome.addressLead")}</p>
                        <div className={styles.qr}>
                            <QRCodeSVG value={wallet.address} size={168} level="M" bgColor="#ffffff" fgColor="#120f1f" />
                        </div>
                        <button type="button" className={styles.address} onClick={() => void copyToClipboard(wallet.address, t("welcome.copied"))}>
                            <code>{wallet.address}</code>
                            <span>{t("welcome.copy")}</span>
                        </button>
                        <button type="button" className={styles.primary} onClick={() => setStep(restored ? "money" : "words")}>
                            {t("welcome.next")}
                        </button>
                    </section>
                ) : null}

                {step === "words" ? (
                    <section className={styles.step}>
                        <h1>{t("welcome.wordsTitle")}</h1>
                        <p>{t("welcome.wordsLead")}</p>
                        <div className={styles.wordsWrap}>
                            <ol className={revealed ? styles.words : `${styles.words} ${styles.hidden}`}>
                                {words.map((w, i) => (
                                    <li key={i}>
                                        <small>{i + 1}</small>
                                        {w}
                                    </li>
                                ))}
                            </ol>
                            {revealed ? null : (
                                <button type="button" className={styles.reveal} onClick={() => setRevealed(true)}>
                                    {t("welcome.showWords")}
                                </button>
                            )}
                        </div>
                        <p className={styles.warn}>{t("welcome.wordsWarn")}</p>
                        <button type="button" className={styles.primary} disabled={!revealed} onClick={() => setStep("check")}>
                            {t("welcome.wroteThem")}
                        </button>
                    </section>
                ) : null}

                {step === "check" ? (
                    <section className={styles.step}>
                        <h1>{t("welcome.checkTitle")}</h1>
                        <p>{t("welcome.checkLead")}</p>
                        <div className={styles.checks}>
                            {positions.map((p, i) => (
                                <label key={p}>
                                    <span>{t("welcome.wordN", { n: p + 1 })}</span>
                                    <input
                                        value={answers[i] ?? ""}
                                        onChange={e => setAnswers(a => Object.assign([...a], { [i]: e.target.value }))}
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                    />
                                </label>
                            ))}
                        </div>
                        {wrong ? <p className={styles.error}>{t("welcome.checkWrong")}</p> : null}
                        <button type="button" className={styles.primary} onClick={check}>
                            {t("welcome.check")}
                        </button>
                        <button type="button" className={styles.link} onClick={() => setStep("words")}>
                            {t("welcome.seeAgain")}
                        </button>
                    </section>
                ) : null}

                {step === "money" ? (
                    <section className={styles.step}>
                        <h1>{t("welcome.moneyTitle")}</h1>
                        <p>{t("welcome.moneyLead")}</p>
                        <a href="/?deposit=1" className={styles.primary}>
                            {t("welcome.addMoney")}
                        </a>
                        <button type="button" className={styles.secondary} onClick={() => setStep("table")}>
                            {t("welcome.later")}
                        </button>
                    </section>
                ) : null}

                {step === "table" ? (
                    <section className={styles.step}>
                        <div className={styles.felt} aria-hidden="true">
                            <i />
                        </div>
                        <h1>{t("welcome.tableTitle")}</h1>
                        <p>{t("welcome.tableLead")}</p>
                        <a href="/" className={styles.primary}>
                            {t("welcome.toTables")}
                        </a>
                    </section>
                ) : null}
            </main>
        </div>
    );
};

export default WelcomeSetup;
