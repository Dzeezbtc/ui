import { useCallback, useEffect, useState } from "react";
import { useClubApi } from "../../context/ClubApiContext";
import { httpErrorMessage } from "../../apis/HTTPClient";
import { getCosmosAddress, getCosmosMnemonic } from "../../utils/cosmos/storage";
import { claimBonus, joinClub, saveNotifications, submitKyc, type ClubMission, type ClubOffer, type ClubRace, type ClubTerms, type JoinChoices, type JoinResult, type KycDetails, type MembershipStatus, type PublicClub } from "../../utils/clubService";

export interface ClubPageState {
    club: PublicClub | null;
    info: ClubTerms | null;
    status: MembershipStatus;
    termsOutdated: boolean;
    welcome: string | null;
    /** Why this wallet can't sit at each of the club's tables. */
    seatRules: Record<string, string>;
    kycSent: boolean;
    offers: ClubOffer[];
    races: ClubRace[];
    missions: ClubMission[];
    referralBonus: number;
    claimed: string[];
    claim: (offerId: string) => Promise<void>;
    notificationsSaved: boolean;
    saveReminders: (choice: { tournaments: boolean; telegramChat?: string }) => Promise<void>;
    hasWallet: boolean;
    busy: boolean;
    error: string | null;
    join: (choices: JoinChoices) => Promise<void>;
    acceptNewTerms: () => Promise<void>;
    sendKyc: (details: KycDetails) => Promise<void>;
}

/** A club's public page and the player's membership of it, plus joining with their wallet. */
export const useClubPage = (handle: string): ClubPageState => {
    const api = useClubApi();
    const address = getCosmosAddress();
    const mnemonic = getCosmosMnemonic();
    const [club, setClub] = useState<PublicClub | null>(null);
    const [info, setInfo] = useState<ClubTerms | null>(null);
    const [status, setStatus] = useState<MembershipStatus>(null);
    const [termsOutdated, setTermsOutdated] = useState(false);
    const [welcome, setWelcome] = useState<string | null>(null);
    const [seatRules, setSeatRules] = useState<Record<string, string>>({});
    const [kycSent, setKycSent] = useState(false);
    const [offers, setOffers] = useState<ClubOffer[]>([]);
    const [races, setRaces] = useState<ClubRace[]>([]);
    const [missions, setMissions] = useState<ClubMission[]>([]);
    const [referralBonus, setReferralBonus] = useState(0);
    const [notificationsSaved, setNotificationsSaved] = useState(false);
    const [claimed, setClaimed] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!api) {
            setError("This lobby isn't connected to a club service.");
            return;
        }
        const load = async () => {
            try {
                const loaded = (await api.getClub(handle)) as PublicClub;
                setClub(loaded);
                setInfo((await api.getClubTerms(handle)) as ClubTerms);
                setOffers((await api.getClubOffers(handle)).offers);
                setRaces((await api.getClubRaces(handle)).races);
                const goals = await api.getClubMissions(handle);
                setMissions(goals.missions);
                setReferralBonus(goals.referralBonus);
                if (address) {
                    const member = (await api.getMembership(handle, address)) as { status: MembershipStatus; termsOutdated?: boolean };
                    setStatus(member.status);
                    setTermsOutdated(!!member.termsOutdated);
                    const answers = await Promise.all(loaded.tables.map(async t => [t.gameId, await api.canSit(handle, address, t.gameId).catch(() => null)] as const));
                    setSeatRules(Object.fromEntries(answers.filter(([, a]) => a && !a.allowed).map(([id, a]) => [id, a?.reason ?? "You can't sit here yet."])));
                }
            } catch (err) {
                console.error("Failed to load club:", err);
                setError(httpErrorMessage(err, "Couldn't load the club."));
            }
        };
        load();
    }, [api, handle, address, status]);

    const attempt = useCallback(async (fallback: string, work: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try {
            await work();
        } catch (err) {
            console.error(fallback, err);
            setError(httpErrorMessage(err, fallback));
        } finally {
            setBusy(false);
        }
    }, []);

    const join = useCallback(
        (choices: JoinChoices) =>
            attempt("Couldn't join the club.", async () => {
                if (!api || !mnemonic || !address) return;
                const result: JoinResult = await joinClub(api, handle, mnemonic, address, { ...choices, termsVersion: info?.terms?.version });
                setStatus(result.status);
                setWelcome(result.welcome ?? null);
            }),
        [api, handle, mnemonic, address, info, attempt]
    );

    // Going through join again records the acceptance for someone already in the club.
    const acceptNewTerms = useCallback(
        () =>
            attempt("Couldn't accept the new terms.", async () => {
                if (!api || !mnemonic || !address) return;
                await joinClub(api, handle, mnemonic, address, { acceptedTerms: true, termsVersion: info?.terms?.version });
                setTermsOutdated(false);
            }),
        [api, handle, mnemonic, address, info, attempt]
    );

    const sendKyc = useCallback(
        (details: KycDetails) =>
            attempt("Couldn't send your details.", async () => {
                if (!api || !mnemonic || !address) return;
                await submitKyc(api, handle, mnemonic, address, details);
                setKycSent(true);
            }),
        [api, handle, mnemonic, address, attempt]
    );

    const claim = useCallback(
        (offerId: string) =>
            attempt("Couldn't ask for the bonus.", async () => {
                if (!api || !mnemonic || !address) return;
                await claimBonus(api, handle, mnemonic, address, offerId);
                setClaimed(c => [...c, offerId]);
            }),
        [api, handle, mnemonic, address, attempt]
    );

    const saveReminders = useCallback(
        (choice: { tournaments: boolean; telegramChat?: string }) =>
            attempt("Couldn't save your choice.", async () => {
                if (!api || !mnemonic || !address) return;
                await saveNotifications(api, handle, mnemonic, address, choice);
                setNotificationsSaved(true);
                // The browser asks once, and it's fine if they say no: Telegram still works.
                if (choice.tournaments && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
            }),
        [api, handle, mnemonic, address, attempt]
    );

    return { missions, referralBonus, notificationsSaved, saveReminders, offers, races, claimed, claim, club, info, status, termsOutdated, welcome, seatRules, kycSent, hasWallet: !!mnemonic && !!address, busy, error, join, acceptNewTerms, sendKyc };
};
