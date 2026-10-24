import React from "react";
import type { StickerDef } from "../stickers";
import { MemeFrame } from "./frame";
import { MemeScene, StyleKit } from "./scene";
import { MEME_SPECS } from "./specs";
import { WOJAK } from "./wojak";
import { WOJAK_KIT } from "./wojakKit";
import { RAGE_KIT } from "./rageKit";
import { HOSE_KIT } from "./hoseKit";
import { STICKS_KIT } from "./sticksKit";
import { RAGE_SET } from "./rage";
import { HOSE_SET } from "./hose";
import { STICKS_SET } from "./sticks";

/**
 * A meme-style sticker (block52-chat#2) in one of the four drawing styles. Each
 * sticker is drawn from its plan in specs.ts by the style's kit; a few have a
 * hand-drawn version that wins over the plan.
 */
export type MemeStyleId = "wojak" | "rage" | "hose" | "sticks";

const KITS: Record<MemeStyleId, StyleKit> = { wojak: WOJAK_KIT, rage: RAGE_KIT, hose: HOSE_KIT, sticks: STICKS_KIT };
const HAND_DRAWN: Record<MemeStyleId, Record<string, () => React.ReactElement>> = { wojak: WOJAK, rage: RAGE_SET, hose: HOSE_SET, sticks: STICKS_SET };

export const MemeSticker: React.FC<{ sticker: StickerDef; style: MemeStyleId; size?: number }> = ({ sticker, style, size = 76 }) => {
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const hand = HAND_DRAWN[style][sticker.id];
    const kit = KITS[style];
    const spec = MEME_SPECS[sticker.id];
    return (
        <MemeFrame style={style === "hose" ? "hose" : style === "rage" ? "rage" : "wojak"} label={sticker.label} size={size}>
            {hand ? hand() : spec ? <MemeScene kit={kit} spec={spec} uid={uid} /> : null}
        </MemeFrame>
    );
};

export default MemeSticker;
