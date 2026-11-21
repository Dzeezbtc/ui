/** A USDC balance (decimal string, e.g. "1240.5") split for the big balance: "$1,240" and ".50". */
export const balanceParts = (usdc: string): { whole: string; cents: string } => {
    const n = Number(usdc);
    const fixed = (Number.isFinite(n) ? n : 0).toFixed(2);
    const [w, c] = fixed.split(".");
    return { whole: `$${Number(w).toLocaleString("en-US")}`, cents: `.${c}` };
};

/** A recovery phrase as numbered words, for the word grid. */
export const phraseWords = (mnemonic: string): string[] => mnemonic.trim().split(/\s+/).filter(Boolean);

/** The query flag that asks the lobby to open the Send window (the Wallet page's Send button). */
export const SEND_PARAM = "send";
