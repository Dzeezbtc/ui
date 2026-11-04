import { signChallenge } from "./clubLogin";

/** A club as the lobby sees it (the club service's /public/clubs/:handle). */
export interface PublicClub {
    handle: string;
    name: string;
    tagline: string;
    joining: "open" | "approval" | "invite";
    kyc: string;
    members: number;
    union: string | null;
    tables: PublicClubTable[];
}

export interface PublicClubTable {
    gameId: string;
    name: string | null;
    format: string;
    variant: string;
    smallBlind: number;
    bigBlind: number;
    players: number;
    maxPlayers: number;
}

export type MembershipStatus = "active" | "pending" | "suspended" | "self-excluded" | "cool-off" | null;

/** How a club takes new members, in a sentence. */
export const joiningText = (joining: PublicClub["joining"]): string =>
    ({ open: "Anyone can join.", approval: "Ask to join; the club approves new members.", invite: "Invite only: ask the club or one of its agents for an invite." })[joining];

/** The join button's label, or null when there's no button (invite-only). */
export const joinButtonLabel = (joining: PublicClub["joining"]): string | null => (joining === "open" ? "Join club" : joining === "approval" ? "Ask to join" : null);

/** What a player's membership means, for the club page. */
export const membershipText = (status: Exclude<MembershipStatus, null>): string =>
    ({
        active: "You're a member",
        pending: "Waiting for the club to approve you",
        suspended: "Your membership is suspended",
        "self-excluded": "You've excluded yourself from this club",
        "cool-off": "You're on a cool-off break"
    })[status];

/** "$0.01/$0.02" for cash (dollars), "100/200" chips otherwise; plus the variant and format. */
export const tableSummary = (t: PublicClubTable): string => {
    const blinds = t.format === "cash" ? `$${t.smallBlind}/$${t.bigBlind}` : `${t.smallBlind}/${t.bigBlind}`;
    const variant = t.variant === "omaha" ? "Omaha" : "Hold'em";
    const format = t.format === "cash" ? "Cash" : t.format === "sit-and-go" ? "Sit & Go" : "Tournament";
    return `${variant} · ${format} · ${blinds} · ${t.players}/${t.maxPlayers} seated`;
};

/** The calls joinClub needs from the club API (ClubApi), so it can be tested with a fake. */
export interface JoinApi {
    getJoinChallenge: (address: string, club: string) => Promise<{ nonce: string; text: string }>;
    join: (body: { address: string; club: string; nonce: string; signature: string; pubkey: string; nickname?: string }) => Promise<unknown>;
}

/** Asks to join a club: the wallet signs a one-time "join @club" message, so nobody can join for someone else. */
export async function joinClub(api: JoinApi, handle: string, mnemonic: string, address: string): Promise<{ status: MembershipStatus; already?: boolean }> {
    const ch = await api.getJoinChallenge(address, handle);
    const signed = await signChallenge(mnemonic, ch.text);
    if (signed.address !== address) throw new Error("Your stored wallet doesn't match its address. Re-import it on the Wallet page.");
    return (await api.join({ address, club: handle, nonce: ch.nonce, signature: signed.signature, pubkey: signed.pubkey })) as { status: MembershipStatus; already?: boolean };
}
