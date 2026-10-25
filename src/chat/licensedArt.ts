/**
 * Licensed artwork (block52-chat#2): sticker id → image URL. Any sticker listed
 * here shows this image instead of our drawing, in every sticker style. Empty
 * until the rights are cleared — then drop the files on the CDN (or in
 * public/chat-art/) and add one line per sticker, e.g.
 *   "rage-fffuuu": "/chat-art/rage-fffuuu.png",
 */
export const LICENSED_ART: Readonly<Record<string, string>> = {};
