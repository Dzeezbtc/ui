import { useCallback, useEffect, useState } from "react";
import { useClubApi } from "../../context/ClubApiContext";
import { httpErrorMessage } from "../../apis/HTTPClient";
import { getCosmosAddress, getCosmosMnemonic } from "../../utils/cosmos/storage";
import { joinClub, type MembershipStatus, type PublicClub } from "../../utils/clubService";

export interface ClubPageState {
    club: PublicClub | null;
    status: MembershipStatus;
    hasWallet: boolean;
    busy: boolean;
    error: string | null;
    join: () => Promise<void>;
}

/** A club's public page and the player's membership of it, plus joining with their wallet. */
export const useClubPage = (handle: string): ClubPageState => {
    const api = useClubApi();
    const address = getCosmosAddress();
    const mnemonic = getCosmosMnemonic();
    const [club, setClub] = useState<PublicClub | null>(null);
    const [status, setStatus] = useState<MembershipStatus>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!api) {
            setError("This lobby isn't connected to a club service.");
            return;
        }
        const load = async () => {
            try {
                setClub((await api.getClub(handle)) as PublicClub);
                if (address) setStatus(((await api.getMembership(handle, address)) as { status: MembershipStatus }).status);
            } catch (err) {
                console.error("Failed to load club:", err);
                setError(httpErrorMessage(err, "Couldn't load the club."));
            }
        };
        load();
    }, [api, handle, address]);

    const join = useCallback(async () => {
        if (!api || !mnemonic || !address) return;
        setBusy(true);
        setError(null);
        try {
            setStatus((await joinClub(api, handle, mnemonic, address)).status);
        } catch (err) {
            console.error("Failed to join club:", err);
            setError(httpErrorMessage(err, "Couldn't join the club."));
        } finally {
            setBusy(false);
        }
    }, [api, handle, mnemonic, address]);

    return { club, status, hasWallet: !!mnemonic && !!address, busy, error, join };
};
