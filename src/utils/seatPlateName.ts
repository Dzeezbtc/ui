import { hasContent } from "./guards";
import { truncateMiddle } from "./stringUtils";

/**
 * The name on a seat's plate where a skin shows one (Maison 52): the chain only
 * knows players by wallet address, so it is the short address ("b521…9f3c").
 * Undefined with no address, so the plate keeps "Seat N".
 */
export const seatPlateName = (address: string | null | undefined): string | undefined => (hasContent(address) ? truncateMiddle(address, 4, 4, "…") : undefined);
