import { Secp256k1HdWallet, serializeSignDoc, type StdSignDoc } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";

/**
 * "Club login" hand-off (block52-club): the club console sends staff here,
 * the lobby's wallet signs the club service's one-time challenge with
 * ADR-036, and the signature goes back to the console, which completes the
 * sign-in with the service.
 *
 * Safety: we only talk to services and return to consoles on the allow-list,
 * so a lookalike link can't collect a signature for another site, and the
 * player approves every sign-in on screen.
 */

export interface ClubLoginRequest {
    club: string;
    api: string;
    returnTo: string;
}

/** Comma-separated origins, e.g. "https://club.block52.xyz,http://localhost:5198". */
export const parseAllowList = (raw: string | undefined): string[] =>
    (raw ?? "")
        .split(",")
        .map(s => s.trim().replace(/\/+$/, ""))
        .filter(Boolean);

const originOf = (url: string): string | null => {
    try {
        const u = new URL(url);
        return u.protocol === "https:" || u.hostname === "localhost" || u.hostname === "127.0.0.1" ? u.origin : null;
    } catch {
        return null;
    }
};

/** Reads ?club=&api=&return= and refuses anything not on the allow-lists. */
export function readClubLoginRequest(search: string, allowedConsoles: string[], allowedServices: string[]): { ok: true; request: ClubLoginRequest } | { ok: false; error: string } {
    const p = new URLSearchParams(search);
    const club = (p.get("club") ?? "").toLowerCase();
    const api = p.get("api") ?? "";
    const returnTo = p.get("return") ?? "";
    if (!/^[a-z0-9-]{1,32}$/.test(club)) return { ok: false, error: "This sign-in link doesn't name a valid club." };
    const apiOrigin = originOf(api);
    const returnOrigin = originOf(returnTo);
    if (!apiOrigin || !allowedServices.includes(apiOrigin)) return { ok: false, error: "This sign-in link points at a club service Block52 doesn't recognise, so it was blocked." };
    if (!returnOrigin || !allowedConsoles.includes(returnOrigin)) return { ok: false, error: "This sign-in link would send your signature to a site Block52 doesn't recognise, so it was blocked." };
    return { ok: true, request: { club, api: apiOrigin, returnTo } };
}

/** The ADR-036 sign doc for arbitrary text (what Keplr's signArbitrary signs). */
export function adr36SignDoc(signer: string, data: string): StdSignDoc {
    return {
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: { gas: "0", amount: [] },
        msgs: [{ type: "sign/MsgSignData", value: { signer, data: toBase64(new TextEncoder().encode(data)) } }],
        memo: ""
    };
}

/** Signs the challenge text with the player's wallet. Returns the base64 signature and public key. */
export async function signChallenge(mnemonic: string, text: string): Promise<{ address: string; signature: string; pubkey: string }> {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "b52" });
    const [account] = await wallet.getAccounts();
    const { signature } = await wallet.signAmino(account.address, adr36SignDoc(account.address, text));
    return { address: account.address, signature: signature.signature, pubkey: signature.pub_key.value };
}

/** Where to send the player back: the console's /login with the signed parts in the fragment (never sent to servers). */
export const handoffUrl = (returnTo: string, parts: { club: string; address: string; nonce: string; signature: string; pubkey: string }): string =>
    `${returnTo.split("#")[0]}#${new URLSearchParams(parts).toString()}`;

/** Kept so tests can check exactly what was signed. */
export const signedBytes = (signer: string, text: string) => serializeSignDoc(adr36SignDoc(signer, text));
