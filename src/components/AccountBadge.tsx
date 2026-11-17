import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNetwork } from "../context/NetworkContext";
import { formatMicroAsUsdc } from "../constants/currency";
import { getCosmosBalance } from "../utils/cosmosAccountUtils";
import { custodySignOut, getCustodySession } from "../utils/custody/session";

/**
 * Header: who you are and, for a club account, the USDC balance. A built-in wallet shows a plain "Sign in" link.
 * The balance is the chain's, read by the same address the wallet uses, so it is the player's real balance.
 */
export const AccountBadge: React.FC = () => {
    const { currentNetwork } = useNetwork();
    const session = getCustodySession();
    const [balance, setBalance] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    const refresh = useCallback(async () => {
        try {
            setBalance(formatMicroAsUsdc(await getCosmosBalance(currentNetwork, "usdc"), 2));
            setFailed(false);
        } catch {
            setFailed(true);
        }
    }, [currentNetwork]);

    useEffect(() => {
        if (!session) return;
        void refresh();
        const id = setInterval(refresh, 15_000);
        return () => clearInterval(id);
    }, [session, refresh]);

    if (!session)
        return (
            <Link to="/signin" className="px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80">
                Sign in
            </Link>
        );
    return (
        <div className="flex items-center gap-3 text-sm" data-testid="account-badge">
            <span className="text-gray-300" title={session.address}>
                {session.username}
            </span>
            <span className="font-semibold text-emerald-300" title="Your USDC balance">
                {balance !== null ? `${balance} USDC` : failed ? "balance unavailable" : "…"}
            </span>
            <button
                type="button"
                className="text-gray-400 hover:text-white"
                onClick={() => {
                    custodySignOut();
                    window.location.assign("/");
                }}
            >
                Sign out
            </button>
        </div>
    );
};
