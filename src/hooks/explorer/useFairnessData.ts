import { useCallback, useEffect, useState } from "react";
import { useIndexerApi } from "../../context/IndexerApiContext";
import type { CardStats, IndexerStatus, RandomnessReport } from "../../pages/explorer/types";

/**
 * What the Fairness page shows, from the indexer: every card's count, the
 * randomness checks (cards, suits, ranks) and how far the indexer has read.
 * The card counts are required; the checks and status are shown when available.
 */
export const useFairnessData = (): {
    cards: CardStats[];
    report: RandomnessReport | null;
    status: IndexerStatus | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
} => {
    const api = useIndexerApi();
    const [cards, setCards] = useState<CardStats[]>([]);
    const [report, setReport] = useState<RandomnessReport | null>(null);
    const [status, setStatus] = useState<IndexerStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCards((await api.getCardStats()) as CardStats[]);
        } catch (err) {
            console.error("Could not load card counts:", err);
            setError("The card counter (indexer) can't be reached right now. Try again shortly.");
            setLoading(false);
            return;
        }
        try {
            setReport((await api.getRandomnessAnalysis()) as RandomnessReport);
        } catch (err) {
            console.error("Could not load the randomness checks:", err);
        }
        try {
            setStatus((await api.getSyncStatus()) as IndexerStatus);
        } catch (err) {
            console.error("Could not load the indexer status:", err);
        }
        setLoading(false);
    }, [api]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { cards, report, status, loading, error, reload };
};
