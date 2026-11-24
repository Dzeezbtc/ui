import { EXPLAINER_TEXT, type ExplainerText } from "../pages/explainers/explainerText";
import { hasValue } from "./guards";

/**
 * The explainer pages' words in a player's language. Languages not written yet
 * show English, so a page is never blank.
 */
export const explainerCopy = (language: string): ExplainerText => {
    const written = EXPLAINER_TEXT[language];
    return hasValue(written) ? written : EXPLAINER_TEXT.en;
};

/** Whether the explainer pages are written in this language (not shown in English). */
export const hasExplainerTranslation = (language: string): boolean => hasValue(EXPLAINER_TEXT[language]);
