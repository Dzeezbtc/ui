import { PlayerStatus } from "@block52/poker-vm-sdk";

/**
 * Is this seat out of the hand by its own choice — folded, or mucked at
 * showdown?
 *
 * Engine v1.0.18 (poker-vm#2586) added `PlayerStatus.MUCKED`: a beaten player
 * who declined to show at the sequenced showdown. Internally the engine still
 * treats them as folded, and so must the UI — dimmed seat, no chips in the
 * pot-odds count, excluded from all-in equity, "you're out" copy in the footer.
 * Every folded check goes through here so the two statuses cannot drift apart.
 */
export function hasFoldedOrMucked(status: PlayerStatus | string | null | undefined): boolean {
    return status === PlayerStatus.FOLDED || status === PlayerStatus.MUCKED;
}

/**
 * Has this player been knocked out of a Sit & Go or tournament?
 *
 * Their seat is cleared from the table: no avatar, no "out" or finishing-place
 * badge, no vacant seat to join. Players still in don't need to see who went
 * out. Cash games are unaffected, because a busted cash player can top up and
 * keeps their seat.
 */
export function isEliminatedFromTournament(status: PlayerStatus | string | null | undefined, isTournament: boolean): boolean {
    return isTournament && status === PlayerStatus.BUSTED;
}
