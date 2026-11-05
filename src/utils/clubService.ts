import { signChallenge } from "./clubLogin";
import type { ClubLook } from "./clubLook";

/** A club as the lobby sees it (the club service's /public/clubs/:handle). */
export interface PublicClub {
    handle: string;
    name: string;
    tagline: string;
    joining: "open" | "approval" | "invite";
    kyc: string;
    mainTablesKyc?: string;
    members: number;
    union: string | null;
    tables: PublicClubTable[];
    look?: Partial<ClubLook>;
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

/** "restricted": the public route won't say why (self-exclusion and suspension stay private). */
export type MembershipStatus = "active" | "pending" | "restricted" | null;

/** What a player reads before joining: /public/clubs/:handle/terms. */
export interface ClubTerms {
    terms: { version: number; hash: string; body: string; publishedAt: string } | null;
    termsUrl: string | null;
    privacyUrl: string | null;
    licence: string | null;
    houseRulesAccept: boolean;
    houseRules: { title: string; rules: string[] }[];
    support: { hours: string; channels: string[] };
}

export interface JoinChoices {
    inviteCode?: string;
    country?: string;
    acceptedTerms: boolean;
    acceptedHouseRules: boolean;
}

/** Whether the join button can be pressed: everything the club asks for has been ticked. */
export const canSubmitJoin = (info: ClubTerms | null, choices: Pick<JoinChoices, "acceptedTerms" | "acceptedHouseRules">): boolean =>
    !!info && (!info.terms || choices.acceptedTerms) && (!info.houseRulesAccept || choices.acceptedHouseRules);

/** How a club takes new members, in a sentence. */
export const joiningText = (joining: PublicClub["joining"]): string =>
    ({ open: "Anyone can join.", approval: "Ask to join; the club approves new members. An invite code lets you skip the wait.", invite: "Invite only: enter a code from the club or one of its agents." })[joining];

/** The join button's label; invite-only clubs have no button until there's a code. */
export const joinButtonLabel = (joining: PublicClub["joining"], inviteCode = ""): string | null => (inviteCode.trim() ? "Join with this code" : joining === "open" ? "Join club" : joining === "approval" ? "Ask to join" : null);

/** What a player's membership means, for the club page. */
export const membershipText = (status: Exclude<MembershipStatus, null>): string =>
    ({
        active: "You're a member",
        pending: "Waiting for the club to approve you",
        restricted: "Your membership doesn't allow you to play right now. Ask the club if you're not sure why."
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
    join: (body: { address: string; club: string; nonce: string; signature: string; pubkey: string; nickname?: string; inviteCode?: string; country?: string; acceptTerms?: number; acceptHouseRules?: boolean }) => Promise<unknown>;
}

export interface JoinResult {
    status: MembershipStatus;
    already?: boolean;
    welcome?: string;
}

/**
 * Asks to join a club: the wallet signs a one-time "join @club" message, so
 * nobody can join for someone else. When the club has terms, that message
 * names their fingerprint, so signing it is the acceptance.
 */
export async function joinClub(api: JoinApi, handle: string, mnemonic: string, address: string, choices?: Partial<JoinChoices> & { termsVersion?: number }): Promise<JoinResult> {
    const ch = await api.getJoinChallenge(address, handle);
    const signed = await signChallenge(mnemonic, ch.text);
    if (signed.address !== address) throw new Error("Your stored wallet doesn't match its address. Re-import it on the Wallet page.");
    const code = choices?.inviteCode?.trim();
    const country = choices?.country?.trim();
    return (await api.join({
        address,
        club: handle,
        nonce: ch.nonce,
        signature: signed.signature,
        pubkey: signed.pubkey,
        ...(code ? { inviteCode: code } : {}),
        ...(country ? { country } : {}),
        ...(choices?.acceptedTerms && choices.termsVersion !== undefined ? { acceptTerms: choices.termsVersion } : {}),
        ...(choices?.acceptedHouseRules ? { acceptHouseRules: true } : {})
    })) as JoinResult;
}

export interface KycDetails {
    fullName: string;
    birthDate: string;
    country: string;
}

/** The calls submitKyc needs from the club API. */
export interface KycApi {
    getKycChallenge: (address: string, club: string) => Promise<{ nonce: string; text: string }>;
    submitKyc: (body: KycDetails & { address: string; club: string; nonce: string; signature: string; pubkey: string }) => Promise<unknown>;
}

/** Whether this club asks its players for an identity check. */
export const clubAsksForKyc = (club: Pick<PublicClub, "kyc" | "mainTablesKyc">): boolean => club.kyc !== "none" || (!!club.mainTablesKyc && club.mainTablesKyc !== "none");

/** Sends a member's details for the club to review, signed by their wallet. */
export async function submitKyc(api: KycApi, handle: string, mnemonic: string, address: string, details: KycDetails): Promise<void> {
    const ch = await api.getKycChallenge(address, handle);
    const signed = await signChallenge(mnemonic, ch.text);
    if (signed.address !== address) throw new Error("Your stored wallet doesn't match its address. Re-import it on the Wallet page.");
    await api.submitKyc({ ...details, address, club: handle, nonce: ch.nonce, signature: signed.signature, pubkey: signed.pubkey });
}

/** The calls seatRefusal needs from the club API. */
export interface SeatApi {
    getTableClubs: () => Promise<{ tables: Record<string, { handle: string; name: string }> }>;
    canSit: (handle: string, address: string, gameId: string) => Promise<{ allowed: boolean; reason?: string }>;
}

/**
 * Why this wallet can't sit at this table, or null if it can. Tables outside a
 * club have no rules here. If the club service can't be reached, this doesn't
 * stop anyone sitting: it's the lobby being helpful, and the chain has the
 * final say once x/club is live.
 */
export async function seatRefusal(api: SeatApi | null, gameId: string | undefined, address: string | null | undefined): Promise<string | null> {
    if (!api || !gameId || !address) return null;
    try {
        const club = (await api.getTableClubs()).tables[gameId];
        if (!club) return null;
        const answer = await api.canSit(club.handle, address, gameId);
        return answer.allowed ? null : (answer.reason ?? "This club's rules don't let you sit here.");
    } catch (err) {
        console.error("Couldn't check the club's seat rules:", err);
        return null;
    }
}

/** A leaderboard or rake race now, for the club page: names and places only. */
export interface ClubRace {
    race: "leaderboard" | "rake-race";
    pool: number;
    ends: string;
    top: { rank: number; nickname: string }[];
}

/** A bonus a club offers: /public/clubs/:handle/offers. */
export interface ClubOffer {
    id: string;
    name: string;
    matchPct: number;
    maxBonus: number;
    minDeposit: number;
    rakePerDollar: number;
    expiryDays: number;
}

/** A bonus in a sentence, for the club page. */
export const offerText = (o: ClubOffer): string => {
    const amount = o.matchPct > 0 ? `${o.matchPct}% of your deposit, up to $${o.maxBonus}${o.minDeposit > 0 ? `, from a $${o.minDeposit} deposit` : ""}` : `$${o.maxBonus}`;
    return `${amount}. Unlocks at $${o.rakePerDollar} of rake per $1, within ${o.expiryDays} days.`;
};

/** The calls claimBonus needs from the club API. */
export interface ClaimApi {
    getClaimChallenge: (address: string, club: string, offerId: string) => Promise<{ nonce: string; text: string }>;
    claimBonus: (body: { address: string; club: string; offerId: string; nonce: string; signature: string; pubkey: string }) => Promise<unknown>;
}

/** Asks the club for a bonus, signed by the player's wallet. Staff decide. */
export async function claimBonus(api: ClaimApi, handle: string, mnemonic: string, address: string, offerId: string): Promise<void> {
    const ch = await api.getClaimChallenge(address, handle, offerId);
    const signed = await signChallenge(mnemonic, ch.text);
    if (signed.address !== address) throw new Error("Your stored wallet doesn't match its address. Re-import it on the Wallet page.");
    await api.claimBonus({ address, club: handle, offerId, nonce: ch.nonce, signature: signed.signature, pubkey: signed.pubkey });
}
