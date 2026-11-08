import { hasValue } from "../utils/guards";

/** The languages a player can choose, each named in its own script. */
export const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "it", name: "Italiano" },
    { code: "ru", name: "Русский" },
    { code: "tr", name: "Türkçe" },
    { code: "ar", name: "العربية" },
    { code: "hi", name: "हिन्दी" },
    { code: "zh", name: "简体中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "th", name: "ไทย" },
    { code: "id", name: "Bahasa Indonesia" },
    { code: "fil", name: "Tagalog" },
    { code: "el", name: "Ελληνικά" },
    { code: "sv", name: "Svenska" },
    { code: "da", name: "Dansk" },
    { code: "nb", name: "Norsk" },
    { code: "fi", name: "Suomi" },
    { code: "is", name: "Íslenska" }
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const isLanguageCode = (code: string | null | undefined): code is LanguageCode => hasValue(code) && LANGUAGES.some(l => l.code === code);

const BROWSER_ALIASES: Record<string, string> = { no: "nb", nn: "nb", tl: "fil" };

/** The first browser language we support ("de-AT" counts as "de"), else English. */
export function matchBrowserLanguage(browserLanguages: readonly string[]): LanguageCode {
    for (const tag of browserLanguages) {
        const base = tag.toLowerCase().split("-")[0];
        // Browsers name some of these differently: Norwegian as no/nn, Tagalog as tl.
        const code = BROWSER_ALIASES[base] ?? base;
        if (isLanguageCode(code)) return code;
    }
    return DEFAULT_LANGUAGE;
}
