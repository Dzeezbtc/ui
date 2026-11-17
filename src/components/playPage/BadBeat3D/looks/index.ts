import type { ThreeTableLook } from "../look";
import { badBeatLook } from "./badBeatLook";
import { maisonLook } from "./maisonLook";

/** The table styles drawn as a 3D table, each with its look. */
export type ThreeTableLookName = "badbeat" | "maison";

/** The look a 3D table style draws with. */
export const lookFor = (name: ThreeTableLookName): ThreeTableLook => (name === "maison" ? maisonLook : badBeatLook);
