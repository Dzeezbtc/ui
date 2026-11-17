/**
 * Stage Geometry Engine
 *
 * Calculates all table layout positions from the spec's stadium-intersection model.
 * Replaces ~1700 lines of hardcoded position arrays with calculated positions.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * HOW IT WORKS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. SPEC COORDINATES (from issue #142)
 *    TexasHODL provided exact seat positions on a 1600×850 "stage" using
 *    a stadium-intersection model (radial angles from table center).
 *
 * 2. COORDINATE CONVERSION
 *    stageToTable() converts those absolute stage coordinates into
 *    positions relative to the 900×450 table div:
 *      Stage (1282.2, 683.5) → Table-relative { left: "932.2px", top: "373.5px" }
 *
 * 3. DERIVED POSITIONS
 *    Chips, dealer buttons, and animations are calculated from seat positions:
 *      - Chips:      40% from seat toward table center (adjust CHIP_DISTANCE)
 *      - Dealer:     30% from seat toward table center (adjust DEALER_DISTANCE)
 *      - Turn anim:  seat position + 80px down (adjust TURN_ANIM_Y_OFFSET)
 *      - Win anim:   same as seat position
 *
 * 4. VIEWPORT SCALING
 *    Positions are FIXED on the table. Screen-size adaptation is handled by
 *    zoom/scale on the table container (calculateZoom + getTableTransform).
 *
 * ═══════════════════════════════════════════════════════════════════════
 * HOW TO FINE-TUNE POSITIONS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * To move ALL chips/dealers/animations globally:
 *   → Change the distance constants: CHIP_DISTANCE, DEALER_DISTANCE, TURN_ANIM_Y_OFFSET
 *
 * To nudge ONE specific seat's element by a few pixels:
 *   → Add an entry to GLOBAL_OFFSETS (applies on all screen sizes)
 *     Example: GLOBAL_OFFSETS = { 9: { chips: { 3: { dx: -5, dy: 10 } } } }
 *
 * To nudge ONE specific seat on ONE specific screen size:
 *   → Add an entry to VIEWPORT_OFFSETS
 *     Example: VIEWPORT_OFFSETS["mobile-portrait"] = { 9: { chips: { 5: { dy: -8 } } } }
 *
 * dx = horizontal offset (positive = right, negative = left)
 * dy = vertical offset (positive = down, negative = up)
 *
 * References:
 * - Issue #142: https://github.com/block52/ui/issues/142
 * - Issue #46:  https://github.com/block52/ui/issues/46
 */

import { BADBEAT_CAMERA, MAISON_CAMERA, badBeatScene, seatAngle, type TableCameraSpec } from "../utils/badBeatScene";

// ─── Types ───────────────────────────────────────────────────────────

export interface Position {
    left: string;
    top: string;
    color?: string;
}

/** Which edge of the felt a seat sits on, for bet and dealer-button placement (ui#835). */
export type BetSide = "top" | "bottom" | "left" | "right";

export interface ChipPosition {
    left: string;
    bottom: string;
    /** Set by {@link placeBetSpots}: the bet group is centred on (left, top). */
    top?: string;
    /** Set by {@link placeBetSpots}: the seat's felt edge; picks the dealer button's side. */
    side?: BetSide;
}

/**
 * Where a seat's two hole cards are drawn, as the CENTRE of each 60×80 card in
 * table-div coordinates (ui#21). Derived from the seat position exactly the way
 * `Player` / `OppositePlayer` lay their cards out: a two-card row with a 4px gap
 * at the top of the 160×140 seat box. The dealing animation flies card backs
 * from {@link DECK_ORIGIN} to these points, so they must match the components'
 * static render — tune with the debug markers (key 7), not by guessing.
 */
export interface HoleCardSlotPosition {
    first: Position;
    second: Position;
}

// ─── Stage Constants (from spec) ─────────────────────────────────────

export const STAGE_WIDTH = 1600;
export const STAGE_HEIGHT = 850;
export const TABLE_WIDTH = 1000;
export const TABLE_HEIGHT = 500;
export const TABLE_SURFACE_HEIGHT = 500; // Match spec: table surface fills the full table div
export const TABLE_CENTER_X = 800;
export const TABLE_CENTER_Y = 535;
export const SEAT_OFFSET = 72;

// Table div origin in stage coordinates
export const TABLE_ORIGIN_X = TABLE_CENTER_X - TABLE_WIDTH / 2;   // 300
export const TABLE_ORIGIN_Y = TABLE_CENTER_Y - TABLE_HEIGHT / 2;  // 285

// ─── Stage Orientation ───────────────────────────────────────────────
//
// Portrait viewports get a REAL portrait stage — a vertical stadium with its
// own seat ring — instead of the old approach of rotating the landscape stage
// 90° (which rendered every seat label and card sideways and was hidden
// behind the "Rotate to Play" gate).

export type StageOrientation = "landscape" | "portrait";

export interface StageDims {
    stageWidth: number;
    stageHeight: number;
    /** Felt div width/height (the table surface). */
    tableWidth: number;
    tableHeight: number;
    /** Table centre in stage coordinates. */
    centerX: number;
    centerY: number;
    /** Felt div origin in stage coordinates. */
    originX: number;
    originY: number;
}

export const STAGE_DIMS: Record<StageOrientation, StageDims> = {
    landscape: {
        stageWidth: STAGE_WIDTH,
        stageHeight: STAGE_HEIGHT,
        tableWidth: TABLE_WIDTH,
        tableHeight: TABLE_HEIGHT,
        centerX: TABLE_CENTER_X,
        centerY: TABLE_CENTER_Y,
        originX: TABLE_ORIGIN_X,
        originY: TABLE_ORIGIN_Y
    },
    portrait: {
        stageWidth: 850,
        stageHeight: 1600,
        tableWidth: 500,
        tableHeight: 1000,
        centerX: 425,
        centerY: 800,
        originX: 175,
        originY: 300
    }
};

/**
 * The stage's shape. "standard" is every table style's ring; "flagship" (the
 * Block52 Flagship skin) swaps the tall 1:2 portrait pill for the flagship's
 * wide oval on phones. Landscape is the same for both. Set by the table when
 * its style changes ({@link setStageShape}); the layout cache is keyed on it.
 */
export type StageShape = "standard" | "flagship" | "badbeat" | "maison" | "chipchair";
let stageShape: StageShape = "standard";

/** Switch the stage shape. Returns true when it changed (the caller re-lays out). */
export function setStageShape(shape: StageShape): boolean {
    if (shape === stageShape) return false;
    stageShape = shape;
    return true;
}

export function getStageShape(): StageShape {
    return stageShape;
}

/** The flagship's phone stage: the concept's table exactly — a 0.7 (714×1020)
 *  rail tipped back 12° under a perspective of 1.45× its width (the skin
 *  draws it) — on a 900×1460 stage. You sit low enough that the rim runs
 *  through the middle of your cards. */
export const FLAGSHIP_PORTRAIT_DIMS: StageDims = {
    stageWidth: 900,
    stageHeight: 1460,
    tableWidth: 654,
    tableHeight: 960,
    centerX: 450,
    centerY: 730,
    originX: 123,
    originY: 250
};

/**
 * Chip and a Chair's phone stage (Dzeezbtc/ui#40): the concept's round,
 * overly table — a 720×960 oval, a little taller than it is wide — on a 900×1240
 * stage, its seats round the rim ({@link chipChairPortraitSeats}).
 */
export const CHIPCHAIR_PORTRAIT_DIMS: StageDims = {
    stageWidth: 900,
    stageHeight: 1240,
    tableWidth: 720,
    tableHeight: 960,
    centerX: 450,
    centerY: 630,
    originX: 90,
    originY: 150
};
/** Chip and a Chair's controls column on the right (TV, desktop) and on a phone held sideways (px). */
export const CHIPCHAIR_COLUMN = { desktop: 400, phone: 290 } as const;
/** …and its block along the bottom of an upright phone (px): the blue "You" bar, the bet sizes and the buttons. */
export const CHIPCHAIR_PORTRAIT_DOCK = 250;
/** How far (px) outside the oval's rim a plate's centre sits, upright. */
export const CHIPCHAIR_SEAT_OUT = 18;

/**
 * Chip and a Chair's upright seats: evenly round the oval, you at the bottom,
 * each plate centred just outside the rim, as in the concept.
 */
export function chipChairPortraitSeats(tableSize: number): [number, number][] {
    const d = CHIPCHAIR_PORTRAIT_DIMS;
    const rx = d.tableWidth / 2 + 30 + CHIPCHAIR_SEAT_OUT;
    const ry = d.tableHeight / 2 + 30 + CHIPCHAIR_SEAT_OUT;
    return Array.from({ length: tableSize }, (_, i) => {
        const a = Math.PI / 2 + (i * 2 * Math.PI) / tableSize;
        return [Math.round((d.centerX + Math.cos(a) * rx) * 10) / 10, Math.round((d.centerY + Math.sin(a) * ry) * 10) / 10];
    });
}

/** True on the flagship's shapes: the flagship itself and Bad Beat (the same table, its own fit on phones). */
function isFlagshipShape(): boolean {
    return stageShape !== "standard";
}

function isFlagshipPortrait(): boolean {
    return isFlagshipShape() && getStageOrientation() === "portrait";
}

/**
 * Bad Beat on a phone held sideways: the bet buttons sit in a column down the
 * right ({@link BADBEAT_SIDE_COLUMN} px), so the table fills the height and the
 * width left of it instead of sitting small above a full-width button bar.
 */
export const BADBEAT_SIDE_COLUMN = 290;
/** …and keeps this much (px) clear at the bottom for your plate and its clock. */
export const BADBEAT_SIDE_BOTTOM = 28;
/** Bad Beat on an upright phone: the table rises this far (px) into the gap under the top bar. */
export const BADBEAT_PORTRAIT_LIFT = 60;

/** Maison 52's dock (layout A): a bar this tall (px) along the bottom on a big screen… */
export const MAISON_DOCK_HEIGHT = 156;
/** …a column this wide (px) on the right on a phone held sideways… */
export const MAISON_SIDE_COLUMN = 290;
/** …and a block this tall (px) along the bottom on an upright phone. */
export const MAISON_PORTRAIT_DOCK = 200;

/** The camera of a stage drawn as a 3D table (Bad Beat, Maison 52), or null for a flat one. */
export function threeTableCamera(shape: StageShape = stageShape): TableCameraSpec | null {
    if (shape === "badbeat") return BADBEAT_CAMERA;
    if (shape === "maison") return MAISON_CAMERA;
    return null;
}

/** On a phone held sideways, how wide (px) the controls' column on the right is (0 when there is none). */
function sideColumnWidth(mode: ViewportMode): number {
    if (stageShape === "chipchair") return mode === "mobile-landscape" ? CHIPCHAIR_COLUMN.phone : mode === "mobile-portrait" ? 0 : CHIPCHAIR_COLUMN.desktop;
    if (mode !== "mobile-landscape") return 0;
    if (stageShape === "badbeat") return BADBEAT_SIDE_COLUMN;
    if (stageShape === "maison") return MAISON_SIDE_COLUMN;
    return 0;
}

/** What the stage keeps clear (px) at the bottom: the footer, a 3D table's dock, or just room for your plate beside a column. */
function bottomReserve(mode: ViewportMode, footerOverlay: number): number {
    if (stageShape === "chipchair" && mode === "mobile-portrait") return CHIPCHAIR_PORTRAIT_DOCK;
    if (sideColumnWidth(mode) > 0) return BADBEAT_SIDE_BOTTOM;
    if (stageShape === "maison") return mode === "mobile-portrait" ? MAISON_PORTRAIT_DOCK : MAISON_DOCK_HEIGHT;
    return footerOverlay;
}

export function getStageOrientation(): StageOrientation {
    return getViewportMode() === "mobile-portrait" ? "portrait" : "landscape";
}

export function getStageDims(): StageDims {
    if (isFlagshipPortrait()) return stageShape === "chipchair" ? CHIPCHAIR_PORTRAIT_DIMS : FLAGSHIP_PORTRAIT_DIMS;
    return STAGE_DIMS[getStageOrientation()];
}

// ─── Seat Colors ─────────────────────────────────────────────────────

const SEAT_COLORS_2 = ["#4ade80", "#3b82f6"];

const SEAT_COLORS_4 = [
    "#4ade80", "#f97316", "#3b82f6", "#ec4899"
];

const SEAT_COLORS_6 = [
    "#4ade80", "#f97316", "#ef4444",
    "#3b82f6", "#8b5cf6", "#ec4899"
];

const SEAT_COLORS_9 = [
    "#4ade80", "#f97316", "#ef4444",
    "#3b82f6", "#8b5cf6", "#212529",
    "#FFD700", "#ec4899", "#6b7280"
];

const SEAT_COLORS: Record<number, string[]> = {
    2: SEAT_COLORS_2,
    4: SEAT_COLORS_4,
    6: SEAT_COLORS_6,
    9: SEAT_COLORS_9
};

// ─── Seat Coordinates (from spec JSON, stage px) ─────────────────────

// Each entry is [stageX, stageY] from the issue #142 spec files
export const SEAT_COORDS: Record<number, [number, number][]> = {
    2: [
        [800, 832],      // seat 1 bottom
        [800, 238]       // seat 2 top
    ],
    4: [
        [800, 832],     // Seat 1 - bottom-center
        [317.8, 535],  // Seat 2 - left-center
        [800, 238],     // Seat 3 - top-center
        [1282.2, 535]    // Seat 4 - right-center
    ],
    6: [
        [800, 832],      // seat 1 bottom
        [317.8, 683.5],  // seat 2 lower-left
        [317.8, 386.5],  // seat 3 upper-left
        [800, 238],      // seat 4 top
        [1282.2, 386.5], // seat 5 upper-right
        [1282.2, 683.5]  // seat 6 lower-right
    ],
    9: [
        [800, 842],     // Seat 1 - bottom-center
        [575, 832],     // Seat 2 - bottom-left
        [295.9, 636.6], // Seat 3 - left arc +70deg
        [384.1, 307.5], // Seat 4 - left arc +140deg
        [680, 238],     // Seat 5 - top-left
        [920, 238],     // Seat 6 - top-right
        [1215.9, 307.5],// Seat 7 - right arc +140deg
        [1304.1, 636.6],// Seat 8 - right arc +70deg
        [1025, 832]     // Seat 9 - bottom-right
    ]
};

// Portrait seat rings on the 850×1600 stage: a vertical stadium (felt spans
// x 175–675, y 300–1300; end half-circles r=250 centred at y=550 and y=1050).
// Same seat ORDER as landscape — index 0 is the hero at 6 o'clock, then
// clockwise (lower-left, up the left side, across the top, down the right).
// Tuned against the felt rim the way the landscape spec seats are: side seats
// sit ON the straight rim, arc seats ~25px outside the end circles.
const PORTRAIT_SEAT_COORDS: Record<number, [number, number][]> = {
    2: [
        [425, 1362],    // seat 1 bottom
        [425, 238]      // seat 2 top
    ],
    4: [
        [425, 1362],    // Seat 1 - bottom-center
        [170, 800],     // Seat 2 - left-center
        [425, 238],     // Seat 3 - top-center
        [680, 800]      // Seat 4 - right-center
    ],
    6: [
        [425, 1362],    // seat 1 bottom
        [170, 1075],    // seat 2 lower-left
        [170, 525],     // seat 3 upper-left
        [425, 238],     // seat 4 top
        [680, 525],     // seat 5 upper-right
        [680, 1075]     // seat 6 lower-right
    ],
    // Angular distribution matters on the narrow felt: the first cut put the
    // arc seats at ±45°, which left the 12-o'clock region empty and read as two
    // vertical columns. Arc seats now sit at ~±27° (top) / ~±38° (bottom) from
    // vertical on the end circles (r=250 + 25px outside), so the ring reads as
    // a ring. Hero stays alone at 6 o'clock.
    9: [
        [425, 1362],    // Seat 1 - bottom-center (hero, alone on the bottom arc)
        [256, 1267],    // Seat 2 - lower-left arc (~38° from vertical)
        [170, 985],     // Seat 3 - left side, lower
        [170, 615],     // Seat 4 - left side, upper
        [300, 305],     // Seat 5 - upper-left arc (~27° from vertical)
        [550, 305],     // Seat 6 - upper-right arc (~27° from vertical)
        [680, 615],     // Seat 7 - right side, upper
        [680, 985],     // Seat 8 - right side, lower
        [594, 1267]     // Seat 9 - lower-right arc (~38° from vertical)
    ]
};

// Flagship seats: spaced EVENLY along the rim (across the TV, pulled in 5%
// sideways so the side seats' cards clear the history panel; you sit low
// enough that your cards stay clear of the felt logo) (equal arc length between
// neighbours, you alone at 6 o'clock), each avatar sitting on the rim. On the
// phone the rim is the tilted one the skin draws, so these are its projected
// points. Generated, then the engine's SEAT_SPREAD pulls each 30px inward.
const FLAGSHIP_PORTRAIT_SEAT_COORDS: Record<number, [number, number][]> = {
    2: [[450, 1361], [450, 314.2]],
    4: [[450, 1361], [79.6, 770.2], [450, 314.2], [820.4, 770.2]],
    6: [[450, 1361], [82.1, 1012], [108.8, 545.3], [450, 314.2], [791.2, 545.3], [817.9, 1012]],
    9: [
        [450, 1361],
        [152.6, 1162.2],
        [75.7, 849.8],
        [108.8, 545.3],
        [307.6, 342.2],
        [592.4, 342.2],
        [791.2, 545.3],
        [824.3, 849.8],
        [747.4, 1162.2]
    ]
};
const FLAGSHIP_LANDSCAPE_SEAT_COORDS: Record<number, [number, number][]> = {
    2: [[800, 886], [800, 292]],
    4: [[800, 886], [296.6, 574.2], [800, 292], [1303.4, 574.2]],
    6: [[800, 886], [382, 775.3], [380.2, 372.7], [800, 292], [1219.8, 372.7], [1218, 775.3]],
    9: [
        [800, 886],
        [508.5, 840.6],
        [306.8, 648.9],
        [380.2, 372.7],
        [648.5, 297.1],
        [951.5, 297.1],
        [1219.8, 372.7],
        [1293.2, 648.9],
        [1091.5, 840.6]
    ]
};

/** Seat coordinates for the current orientation's stage. */
export function getSeatCoords(tableSize: TableSize): [number, number][] {
    if (isFlagshipPortrait()) return stageShape === "chipchair" ? chipChairPortraitSeats(tableSize) : FLAGSHIP_PORTRAIT_SEAT_COORDS[tableSize];
    if (isFlagshipShape()) return FLAGSHIP_LANDSCAPE_SEAT_COORDS[tableSize];
    return getStageOrientation() === "portrait" ? PORTRAIT_SEAT_COORDS[tableSize] : SEAT_COORDS[tableSize];
}


// ─── Coordinate Conversion ───────────────────────────────────────────

/** Convert stage coordinates to table-div-relative pixel values */
function stageToTable(stageX: number, stageY: number): [number, number] {
    const dims = getStageDims();
    return [
        Math.round((stageX - dims.originX) * 10) / 10,
        Math.round((stageY - dims.originY) * 10) / 10
    ];
}

/** Convert stage coordinates to Position (left/top px strings) */
function stageToPosition(stageX: number, stageY: number, color?: string): Position {
    const [x, y] = stageToTable(stageX, stageY);
    return {
        left: `${x}px`,
        top: `${y}px`,
        ...(color ? { color } : {})
    };
}

// ─── Derivation Constants (tweak these to move ALL positions globally) ──

/** Scale factor for player components (cards, badges, chips, dealer button).
 *  Applied on top of the auto-fit zoom. 1.0 = default, 1.3 = 30% bigger.
 *  Doesn't affect positioning — just visual size around each element's center. */
export const COMPONENT_SCALE = 1.2;

/** How many extra pixels to push ALL seats outward from table center.
 *  Positive = further from center (seats spread out, table feels bigger).
 *  Negative = closer to center (seats tighter, table feels smaller).
 *  0 = spec positions from issue #142 (no change). */
const SEAT_SPREAD = -30;

/** How far chips sit from seat toward table center (0 = at seat, 1 = at center) */
const CHIP_DISTANCE = 0.42;

/** How far dealer button sits from seat toward table center.
 *  0.5 = halfway between seat and center — ensures button is ON the table surface
 *  for all seats including top (5,6) and edge (7,8) positions. */
const DEALER_DISTANCE = 0.34;

/** How many pixels down the turn animation ring sits below the seat coordinate.
 *  30px puts it on the badge center (player is 140px tall, centered via translate-y-50%). */
const TURN_ANIM_Y_OFFSET = 30;

/** Horizontal distance from the seat centre to each hole card's centre: the two
 *  60px cards sit side by side with a 4px gap, so each is 32px off centre. */
const HOLE_CARD_DX = 32;

/** Vertical offset from the seat centre to the hole cards' centre. The 140px seat
 *  box is centred on the seat coordinate and the 80px card row is its first
 *  child, so the cards' centre sits 30px above the seat coordinate. */
const HOLE_CARD_DY = -30;

/**
 * The deck the hole cards are dealt from, in table-div coordinates (ui#21): the
 * felt centre, nudged above the community-card row so the cards visibly LEAVE
 * the board area. A single point, not per seat.
 */
export const DECK_ORIGIN: Position = { left: "500px", top: "150px" };

/** Portrait counterpart of {@link DECK_ORIGIN}: felt centre (250) nudged above
 *  the community-card row on the 500×1000 portrait felt. */
const PORTRAIT_DECK_ORIGIN: Position = { left: "250px", top: "360px" };

/** The deck origin for the current orientation's felt. */
export function getDeckOrigin(): Position {
    if (isFlagshipPortrait()) return { left: "320px", top: "350px" };
    return getStageOrientation() === "portrait" ? PORTRAIT_DECK_ORIGIN : DECK_ORIGIN;
}

// ─── Position Generators ─────────────────────────────────────────────

export type TableSize = 2 | 4 | 6 | 9;


/** Push a seat position outward from table center by SEAT_SPREAD pixels */
function applySpread(sx: number, sy: number): [number, number] {
    if ((SEAT_SPREAD as number) === 0) return [sx, sy];
    const dims = getStageDims();
    const dx = sx - dims.centerX;
    const dy = sy - dims.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return [sx, sy];
    return [sx + (dx / dist) * SEAT_SPREAD, sy + (dy / dist) * SEAT_SPREAD];
}

/** Get player seat positions for a given table size (with SEAT_SPREAD applied) */
export function getSeatPositions(tableSize: TableSize): Position[] {
    const coords = getSeatCoords(tableSize);
    const colors = SEAT_COLORS[tableSize];
    return coords.map(([x, y], i) => {
        const [sx, sy] = applySpread(x, y);
        return stageToPosition(sx, sy, colors[i]);
    });
}

/** Get vacant seat positions (with SEAT_SPREAD applied) */
export function getVacantPositions(tableSize: TableSize): Position[] {
    const coords = getSeatCoords(tableSize);
    return coords.map(([x, y]) => {
        const [sx, sy] = applySpread(x, y);
        return stageToPosition(sx, sy);
    });
}

/**
 * Get chip positions derived from seat positions.
 * Chips sit between the seat and table center, inside the 900x350 surface div.
 * They use { left, bottom } instead of { left, top }.
 */
export function getChipPositions(tableSize: TableSize): ChipPosition[] {
    const dims = getStageDims();
    const coords = getSeatCoords(tableSize);

    return coords.map(([x, y]) => {
        const [sx, sy] = applySpread(x, y);
        // Vector from seat toward table center
        const dx = dims.centerX - sx;
        const dy = dims.centerY - sy;

        // Move CHIP_DISTANCE of the way from seat toward center
        const chipStageX = sx + dx * CHIP_DISTANCE;
        const chipStageY = sy + dy * CHIP_DISTANCE;

        // Convert to table-div-relative
        const [chipX] = stageToTable(chipStageX, chipStageY);

        // Chips are inside the felt surface div, using "bottom" positioning:
        // bottom = surface height - (chipStageY - originY)
        const chipRelY = chipStageY - dims.originY;
        const chipBottom = dims.tableHeight - chipRelY;

        return {
            left: `${Math.round(chipX)}px`,
            bottom: `${Math.round(chipBottom)}px`
        };
    });
}

/**
 * Get dealer button positions.
 * Placed between seat and table edge, offset toward table center.
 */
export function getDealerPositions(tableSize: TableSize): Position[] {
    const dims = getStageDims();
    const coords = getSeatCoords(tableSize);

    return coords.map(([x, y]) => {
        const [sx, sy] = applySpread(x, y);
        const dx = dims.centerX - sx;
        const dy = dims.centerY - sy;

        // Move DEALER_DISTANCE from seat toward center
        const dealerX = sx + dx * DEALER_DISTANCE;
        const dealerY = sy + dy * DEALER_DISTANCE;

        return stageToPosition(dealerX, dealerY);
    });
}

/**
 * Get turn animation positions.
 * Placed at the seat with a slight downward offset for the ring animation.
 */
export function getTurnAnimationPositions(tableSize: TableSize): Position[] {
    const coords = getSeatCoords(tableSize);

    return coords.map(([x, y]) => {
        const [sx, sy] = applySpread(x, y);
        return stageToPosition(sx, sy + TURN_ANIM_Y_OFFSET);
    });
}

/**
 * Get win animation positions.
 * Same as seat positions (animation overlays the player).
 */
export function getWinAnimationPositions(tableSize: TableSize): Position[] {
    const coords = getSeatCoords(tableSize);
    return coords.map(([x, y]) => {
        const [sx, sy] = applySpread(x, y);
        return stageToPosition(sx, sy);
    });
}

/**
 * Get hole-card slot positions (ui#21): per seat, the centre of each of the two
 * cards the seat component draws, derived from the seat position with
 * HOLE_CARD_DX / HOLE_CARD_DY. Same seat order as {@link getSeatPositions}.
 */
export function getHoleCardSlotPositions(tableSize: TableSize): HoleCardSlotPosition[] {
    const coords = getSeatCoords(tableSize);
    return coords.map(([x, y]) => {
        const [sx, sy] = applySpread(x, y);
        return {
            first: stageToPosition(sx - HOLE_CARD_DX, sy + HOLE_CARD_DY),
            second: stageToPosition(sx + HOLE_CARD_DX, sy + HOLE_CARD_DY)
        };
    });
}

/** Pixel vector from one table-div position to another (for CSS translate offsets). */
export function positionDelta(from: Position, to: Position): { dx: number; dy: number } {
    return {
        dx: Math.round((parseFloat(to.left) - parseFloat(from.left)) * 10) / 10,
        dy: Math.round((parseFloat(to.top) - parseFloat(from.top)) * 10) / 10
    };
}

// ─── Fine-Tuning Offsets ─────────────────────────────────────────────
//
// Add entries here to nudge individual elements by a few pixels after
// visual QA. Leave empty by default — only add what needs adjustment.
//
// HOW TO USE:
//
// 1. Nudge seat 3's chips 5px left, 10px down on ALL screens:
//    GLOBAL_OFFSETS = { 9: { chips: { 3: { dx: -5, dy: 10 } } } }
//
// 2. Nudge seat 5's chips 8px up on MOBILE PORTRAIT only:
//    VIEWPORT_OFFSETS["mobile-portrait"] = { 9: { chips: { 5: { dy: -8 } } } }
//
// 3. Move dealer button for seat 7 right 10px on tablet:
//    VIEWPORT_OFFSETS["tablet"] = { 9: { dealers: { 7: { dx: 10 } } } }
//
// dx = horizontal (positive = right, negative = left)
// dy = vertical (positive = down, negative = up)

interface Offset { dx?: number; dy?: number; }

type ElementType = "players" | "vacantPlayers" | "chips" | "dealers"
                 | "turnAnimations" | "winAnimations" | "holeCards";

/** Global offsets — apply to all screen sizes */
const GLOBAL_OFFSETS: Partial<Record<TableSize,
    Partial<Record<ElementType, Record<number, Offset>>>>> = {
    2: {
        dealers: {
            0: { dx: 95, dy: 63 },
            1: { dx: 95, dy: -20 }
        },
        chips: {
            0: { dx: -38, dy: 40 },
            1: { dx: -38, dy: -5 }
        }
    },

    4: {
        dealers: {
            0: { dx: 95, dy: 63 },    // seat 1
            1: { dx: -57, dy: -2 },  // seat 2
            2: { dx: 95, dy: -20 }, // seat 3
            3: { dx: 60, dy: 24 },   // seat 4
            },
        chips: {
            0: { dx: -38, dy: 40 },    // seat 1
            1: { dx: -90, dy: 90 },  // seat 2
            2: { dx: -38, dy: -5 },  // seat 3
            3: { dx: 15, dy: 75 },   // seat 4
        }
    },

    6: {
        dealers: {
            0: { dx: 95, dy: 63 },    // seat 1
            1: { dx: -60, dy: 23 },  // seat 2
            2: { dx: -60, dy: -73 }, // seat 3
            3: { dx: 95, dy: -20 },   // seat 4
            4: { dx: 60, dy: -23 },  // seat 5
            5: { dx: 60, dy: 73 }    // seat 6
        },
        chips: {
            0: { dx: -38, dy: 40 },    // seat 1
            1: { dx: -92, dy: 20 },  // seat 2
            2: { dx: -92, dy: 28 },  // seat 3
            3: { dx: -40, dy: -7 },   // seat 4
            4: { dx: 18, dy: 15 },   // seat 5
            5: { dx: 18, dy: 20 }    // seat 6
        }
    },

    9: {
        dealers: {
            0: { dx: 95, dy: 65 },   // seat 1
            1: { dx: 25, dy: 115 },   // seat 2
            2: { dx: -68, dy: 7},   // seat 3
            3: { dx: -38, dy: 0 },  // seat 4
            4: { dx: 58, dy: -19 },  // seat 5
            5: { dx: 132, dy: -19 }, // seat 6
            6: { dx: 39, dy: -48 },   // seat 7
            7: { dx: 68, dy: 57 },    // seat 8
            8: { dx: 165, dy: 115 }   // seat 9
        },
        chips: {
            0: { dx: -35, dy: 40 },         // seat 1
            1: { dx: -125, dy: 40 },       // seat 2
            2: { dx: -103, dy: -30 },   // seat 3
            3: { dx: -204, dy: 20 },      // seat 4
            4: { dx: -85, dy: -8 },      // seat 5
            5: { dx: 7, dy: -8 },       // seat 6
            6: { dx: 130, dy: 40 },     // seat 7
            7: { dx: 35, dy: -30 },    // seat 8
            8: { dx: 50, dy: 40 }         // seat 9
        }
    }
};


/** Per-viewport offsets — override for specific screen sizes only */
const VIEWPORT_OFFSETS: Partial<Record<ViewportMode, typeof GLOBAL_OFFSETS>> = {
    "desktop": {
        9: {
            dealers: {
                1: { dy: -50 },  // D2 — move up so it's above the chips
                8: { dy: -50 },  // D9
            }
        }
    },
    "mobile-landscape": {
        9: {
            dealers: {
                1: { dy: -40 },  // D2
                8: { dy: -40 },  // D9
            }
        }
    }
};

/** Portrait offsets are tuned independently — the landscape GLOBAL_OFFSETS were
 *  hand-fitted to the landscape seat ring and don't transfer. Nudge portrait
 *  elements here after visual QA (dy negative = up for chips too — the sign is
 *  normalized by applyChipOffsets). */
const PORTRAIT_GLOBAL_OFFSETS: typeof GLOBAL_OFFSETS = {
    // Hero (seat 1) bet chip was landing on the felt's bottom boundary — pull
    // it up toward the centre so it reads as "inside the felt, near the seat".
    2: { chips: { 0: { dy: -60 } } },
    4: { chips: { 0: { dy: -60 } } },
    6: { chips: { 0: { dy: -60 } } },
    9: { chips: { 0: { dy: -60 } } }
};

function globalOffsetsForOrientation(): typeof GLOBAL_OFFSETS {
    return getStageOrientation() === "portrait" ? PORTRAIT_GLOBAL_OFFSETS : GLOBAL_OFFSETS;
}

/** Apply global + viewport offsets to a Position array */
function applyPositionOffsets(
    positions: Position[],
    tableSize: TableSize,
    element: ElementType
): Position[] {
    const mode = getViewportMode();
    const globalOffs = globalOffsetsForOrientation()[tableSize]?.[element];
    const vpOffs = VIEWPORT_OFFSETS[mode]?.[tableSize]?.[element];

    if (!globalOffs && !vpOffs) return positions;

    return positions.map((pos, i) => {
        const g = globalOffs?.[i];
        const v = vpOffs?.[i];
        if (!g && !v) return pos;

        const dx = (g?.dx ?? 0) + (v?.dx ?? 0);
        const dy = (g?.dy ?? 0) + (v?.dy ?? 0);

        return {
            ...pos,
            left: `${parseFloat(pos.left) + dx}px`,
            top: `${parseFloat(pos.top) + dy}px`
        };
    });
}

/** Apply global + viewport offsets to a ChipPosition array */
function applyChipOffsets(
    positions: ChipPosition[],
    tableSize: TableSize
): ChipPosition[] {
    const mode = getViewportMode();
    const globalOffs = globalOffsetsForOrientation()[tableSize]?.["chips"];
    const vpOffs = VIEWPORT_OFFSETS[mode]?.[tableSize]?.["chips"];

    if (!globalOffs && !vpOffs) return positions;

    return positions.map((pos, i) => {
        const g = globalOffs?.[i];
        const v = vpOffs?.[i];
        if (!g && !v) return pos;

        const dx = (g?.dx ?? 0) + (v?.dx ?? 0);
        const dy = (g?.dy ?? 0) + (v?.dy ?? 0);

        // Chips use "bottom" not "top", so dy inverts: positive dy = down = decrease bottom
        return {
            left: `${parseFloat(pos.left) + dx}px`,
            bottom: `${parseFloat(pos.bottom) - dy}px`
        };
    });
}

/** Apply global + viewport offsets to hole-card slots (both cards of a seat move together) */
function applyHoleCardOffsets(
    slots: HoleCardSlotPosition[],
    tableSize: TableSize
): HoleCardSlotPosition[] {
    const firsts = applyPositionOffsets(slots.map(slot => slot.first), tableSize, "holeCards");
    const seconds = applyPositionOffsets(slots.map(slot => slot.second), tableSize, "holeCards");
    return slots.map((_, i) => ({ first: firsts[i], second: seconds[i] }));
}

// ─── All Positions Bundle ────────────────────────────────────────────

export interface PositionArrays {
    players: Position[];
    vacantPlayers: Position[];
    chips: ChipPosition[];
    dealers: Position[];
    turnAnimations: Position[];
    winAnimations: Position[];
    /** Bad Beat only: per seat, its angle round the 3D table (utils/badBeatScene). */
    seatAngles?: number[];
    /** Bad Beat only: per seat, where a shown hand stands up (table-div px), just in from its cards. */
    feltCards?: Position[];
    /** Bad Beat only: where the board's middle card lies (table-div px). */
    boardCentre?: Position;
    /** Per seat, the two hole-card centres (ui#21 dealing animation targets). */
    holeCards: HoleCardSlotPosition[];
    /** The deck the hole cards fly from (a single point). */
    deck: Position;
}

/** Get all position arrays for a given table size, with offsets applied */
export function getAllPositions(tableSize: TableSize): PositionArrays {
    return {
        players: applyPositionOffsets(getSeatPositions(tableSize), tableSize, "players"),
        vacantPlayers: applyPositionOffsets(getVacantPositions(tableSize), tableSize, "vacantPlayers"),
        chips: applyChipOffsets(getChipPositions(tableSize), tableSize),
        dealers: applyPositionOffsets(getDealerPositions(tableSize), tableSize, "dealers"),
        turnAnimations: applyPositionOffsets(getTurnAnimationPositions(tableSize), tableSize, "turnAnimations"),
        winAnimations: applyPositionOffsets(getWinAnimationPositions(tableSize), tableSize, "winAnimations"),
        holeCards: applyHoleCardOffsets(getHoleCardSlotPositions(tableSize), tableSize),
        deck: getDeckOrigin()
    };
}

// ─── Bet chips and the dealer button beside them (ui#835) ────────────
//
// Each seat's bet group (chips + amount) sits directly under or above its own
// seat, centred on the seat's x, on the felt side of the seat. The dealer
// button is drawn beside that group (see PlayerChipDisplay), so it always sits
// on the felt in front of the button player, toward the table centre, the
// same way from every seat as it rotates.

/**
 * The seat's footprint in table-div pixels around its coordinate: `halfW`
 * each side, `above` up to the top of the hole cards, `below` down to the
 * bottom of the stack badge / action label.
 */
export interface SeatEnvelope {
    halfW: number;
    above: number;
    below: number;
    /** Air between the seat footprint and the bet group. */
    gap: number;
    /** Half the height of the bet group (chip cluster + amount pill). */
    groupHalfH: number;
    /** Nominal width of a bet group (a small bet). */
    groupW: number;
    /** Room the dealer button takes beside the group. */
    buttonW: number;
}

/** The seat is a 160×140 box centred on its coordinate (every viewport; the
 *  stage zoom scales it), with the action label hanging just under it. */
const SEAT_ENVELOPE_DESKTOP: Readonly<SeatEnvelope> = Object.freeze({
    halfW: 80,
    above: 70,
    below: 76,
    gap: 8,
    groupHalfH: 16,
    groupW: 110,
    buttonW: 34
});
const SEAT_ENVELOPE_MOBILE: Readonly<SeatEnvelope> = Object.freeze({ ...SEAT_ENVELOPE_DESKTOP, groupHalfH: 18, buttonW: 38 });

export function seatEnvelope(mobile: boolean): SeatEnvelope {
    return mobile ? SEAT_ENVELOPE_MOBILE : SEAT_ENVELOPE_DESKTOP;
}

/**
 * Seats within 60% of the half-width from the felt's vertical centre line run
 * along the top or bottom of the table; the rest sit on the left or right arc.
 */
export function betSideFor(x: number, y: number, tableWidth: number, tableHeight: number): BetSide {
    const nx = (x - tableWidth / 2) / (tableWidth / 2);
    if (Math.abs(nx) < 0.6) return y < tableHeight / 2 ? "top" : "bottom";
    return nx < 0 ? "left" : "right";
}

/**
 * Which way a seat's face-down cards stick out on the flagship table, away from
 * the felt: seats left of centre push them left, right of centre right, and the
 * seats near the middle (top and bottom) push them up. `left` is the seat's x in
 * table-div pixels.
 */
export function holeCardSideFor(left: string, tableWidth: number): "left" | "right" | "up" {
    const nx = (parseFloat(left) - tableWidth / 2) / (tableWidth / 2);
    if (Math.abs(nx) < 0.15) return "up";
    return nx < 0 ? "left" : "right";
}

/** Keep-out rectangle (centre and half sizes) in table-div pixels. */
export interface BetObstacle {
    x: number;
    y: number;
    hw: number;
    hy: number;
}

/**
 * One bet spot per seat, in table-div pixels: the centre of the bet group.
 * Every bet sits directly under or directly above its own player, centred on
 * the seat's x. Seats in the upper half of the felt get it under the seat;
 * seats in the lower half get it above the hole cards. If that spot lands on
 * the board or pot, the bet goes on the seat's other side instead, when that
 * side is clear of the board and of other bets. x is never adjusted.
 */
export function placeBetSpots(
    players: Position[],
    envelope: SeatEnvelope,
    tableWidth: number,
    tableHeight: number,
    board: BetObstacle[] = []
): ChipPosition[] {
    const r = (n: number) => `${Math.round(n * 10) / 10}px`;
    const { above, below, gap, groupHalfH, groupW, buttonW } = envelope;
    const seats = players.map(seat => {
        const x = parseFloat(seat.left);
        const y = parseFloat(seat.top);
        const side = betSideFor(x, y, tableWidth, tableHeight);
        const under = y + below + gap + groupHalfH;
        const over = y - above - gap - groupHalfH;
        const preferred = y < tableHeight / 2 ? under : over;
        return { side, cx: x, preferred, other: preferred === under ? over : under };
    });
    const halfW = groupW / 2 + buttonW;
    const hitsBoard = (cx: number, cy: number) =>
        board.some(o => Math.abs(cx - o.x) < o.hw + halfW && Math.abs(cy - o.y) < o.hy + groupHalfH);
    const hitsBet = (i: number, cx: number, cy: number) =>
        seats.some((other, j) => j !== i && Math.abs(cx - other.cx) < 2 * halfW && Math.abs(cy - other.preferred) < 2 * groupHalfH);
    return seats.map((seat, i) => {
        const flip = hitsBoard(seat.cx, seat.preferred) && !hitsBoard(seat.cx, seat.other) && !hitsBet(i, seat.cx, seat.other);
        const cy = flip ? seat.other : seat.preferred;
        return { left: r(seat.cx), top: r(cy), bottom: r(tableHeight - cy), side: seat.side };
    });
}

/** A seat's footprint on the flagship table, around its coordinate (table-div px). */
export interface FlagshipSeatBox {
    halfW: number;
    up: number;
    down: number;
}
/** Another player: avatar and cards above the coordinate, the plate below it. */
export const FLAGSHIP_SEAT_BOX: FlagshipSeatBox = { halfW: 72, up: 84, down: 52 };
/** You: your two big cards stand above your plate. */
export const FLAGSHIP_YOUR_BOX: FlagshipSeatBox = { halfW: 92, up: 156, down: 52 };
/** You on the phone: bigger cards, and a clear gap between their tips and your bet. */
export const FLAGSHIP_YOUR_BOX_PORTRAIT: FlagshipSeatBox = { halfW: 100, up: 205, down: 52 };
/** The widest bet group the flagship draws (chips plus "$12,345.67"), and half its height. */
export const FLAGSHIP_BET_HALF_W = 78;
export const FLAGSHIP_BET_HALF_H = 17;
const BET_GAP = 8;

/**
 * The flagship board's keep-out, relative to the felt's centre: the five 85px
 * community cards plus the pot pill above them (table-div px).
 */
export function flagshipBoardKeepOut(tableWidth: number, tableHeight: number): BetObstacle {
    return { x: tableWidth / 2, y: tableHeight / 2 - 25, hw: 232, hy: 85 };
}

/**
 * The way "in front" points from a seat on the flagship's stadium felt: straight
 * off the rim toward the felt, along the rim's inward normal. On the straight
 * sides that is straight across; on the round ends it points at that end's
 * centre. (x, y) and the felt size are table-div pixels.
 */
export function inwardNormal(x: number, y: number, tableWidth: number, tableHeight: number): [number, number] {
    const horizontal = tableWidth >= tableHeight;
    const r = (horizontal ? tableHeight : tableWidth) / 2;
    let cx: number;
    let cy: number;
    if (horizontal) {
        cy = r;
        cx = Math.min(Math.max(x, r), tableWidth - r);
    } else {
        cx = r;
        cy = Math.min(Math.max(y, r), tableHeight - r);
    }
    const dx = cx - x;
    const dy = cy - y;
    const len = Math.hypot(dx, dy);
    return len === 0 ? [0, -1] : [dx / len, dy / len];
}

/**
 * The flagship's bet spots: every bet goes straight out in front of its player
 * (along the rim's inward normal), just far enough to clear that player's own
 * avatar, cards and plate, for the widest bet. You are the seat alone at the
 * bottom centre, and your bet goes straight up past your big cards. The spot is
 * the centre of the bet group, in table-div pixels.
 */
export function placeBetSpotsInFront(
    players: Position[],
    tableWidth: number,
    tableHeight: number,
    yourBox: FlagshipSeatBox = FLAGSHIP_YOUR_BOX,
    seatBox: FlagshipSeatBox = FLAGSHIP_SEAT_BOX
): ChipPosition[] {
    const r = (n: number) => `${Math.round(n * 10) / 10}px`;
    const cx = tableWidth / 2;
    return players.map(seat => {
        const sx = parseFloat(seat.left);
        const sy = parseFloat(seat.top);
        const isYou = Math.abs(sx - cx) < tableWidth * 0.05 && sy > tableHeight / 2;
        const box = isYou ? yourBox : seatBox;
        const [nx, ny] = isYou ? [0, -1] : inwardNormal(sx, sy, tableWidth, tableHeight);
        // Separate the bet from the seat along whichever axis takes the shorter move.
        const across = Math.abs(nx) > 1e-6 ? (box.halfW + FLAGSHIP_BET_HALF_W + BET_GAP) / Math.abs(nx) : Infinity;
        const vertical = ny < 0 ? box.up : box.down;
        const along = Math.abs(ny) > 1e-6 ? (vertical + FLAGSHIP_BET_HALF_H + BET_GAP) / Math.abs(ny) : Infinity;
        const d = Math.min(across, along);
        const x = sx + nx * d;
        let y = sy + ny * d;
        // A side seat level with the board: slide the bet straight up or down,
        // whichever is shorter, until it clears the board.
        const board = flagshipBoardKeepOut(tableWidth, tableHeight);
        if (Math.abs(x - board.x) < board.hw + FLAGSHIP_BET_HALF_W && Math.abs(y - board.y) < board.hy + FLAGSHIP_BET_HALF_H) {
            const above = board.y - board.hy - FLAGSHIP_BET_HALF_H - BET_GAP / 2;
            const below = board.y + board.hy + FLAGSHIP_BET_HALF_H + BET_GAP / 2;
            y = Math.abs(y - above) <= Math.abs(y - below) ? above : below;
        }
        return { left: r(x), top: r(y), bottom: r(tableHeight - y), side: betSideFor(sx, sy, tableWidth, tableHeight) };
    });
}

/** The button goes on the chips' left (toward the centre for right-arc seats),
 *  except on the left arc, where the table interior is to the right. */
export function dealerSideFor(side: BetSide | undefined): "left" | "right" {
    return side === "left" ? "right" : "left";
}

/** Community-card row and the pot pill above it, in table-div pixels. */
export function boardKeepOut(tableWidth: number, tableHeight: number, portrait: boolean): BetObstacle {
    return portrait
        ? { x: tableWidth / 2, y: tableHeight / 2 - 20, hw: 160, hy: 80 }
        : { x: tableWidth / 2, y: tableHeight / 2 - 15, hw: 234, hy: 102 };
}

/**
 * Board keep-outs that may flip a bet to its seat's other side. Mobile
 * portrait 6-max is the exception: seats 3 and 5 keep their bets under the
 * player, so no flip applies there.
 */
export function betBoardFor(tableSize: number, portrait: boolean, tableWidth: number, tableHeight: number): BetObstacle[] {
    if (portrait && tableSize === 6) return [];
    return [boardKeepOut(tableWidth, tableHeight, portrait)];
}

/**
 * Seat-ring positions with bet spots for (mode, tableSize), computed once and
 * cached: the inputs are static per (mode, tableSize) (stage dims follow the
 * mode), so every caller gets the same object back.
 */
const layoutCache = new Map<string, PositionArrays>();
export function getLayoutPositions(tableSize: TableSize, mode: ViewportMode): PositionArrays {
    const key = `${stageShape}|${mode}|${tableSize}`;
    let hit = layoutCache.get(key);
    if (!hit) {
        hit = withBetSpots(getAllPositions(tableSize), tableSize, mode);
        layoutCache.set(key, hit);
    }
    return hit;
}

/** Test hook: drop cached layouts. */
export function clearLayoutCache(): void {
    layoutCache.clear();
}

/**
 * Bad Beat's table (Dzeezbtc/ui#36) is the concept's three.js table: the seat
 * ring keeps the flagship's order and spacing (each seat's angle round the
 * table), and every plate, bet amount and dealing target is that seat's 3D
 * point projected through the same fixed camera the WebGL table is drawn with
 * (utils/badBeatScene). The cards, chips and D disc are 3D objects on the felt.
 */
export function badBeatPositions(positions: PositionArrays, tableWidth: number, tableHeight: number, camera: TableCameraSpec = BADBEAT_CAMERA): PositionArrays {
    const r = (n: number) => `${Math.round(n * 10) / 10}px`;
    const angleOf = (p: Position) => seatAngle(parseFloat(p.left), parseFloat(p.top), tableWidth, tableHeight);
    const seatAngles = positions.players.map(angleOf);
    const scene = badBeatScene(seatAngles, tableWidth, tableHeight, camera);
    const at = ([x, y]: [number, number], p?: Position): Position => ({ ...p, left: r(x), top: r(y) });
    const plates = scene.screen.plates.map((pt, i) => at(pt, positions.players[i]));
    const vacant = badBeatScene(positions.vacantPlayers.map(angleOf), tableWidth, tableHeight, camera).screen.plates.map((pt, i) => at(pt, positions.vacantPlayers[i]));
    const chips: ChipPosition[] = scene.screen.betLabels.map(([x, y], i) => ({
        left: r(x),
        top: r(y),
        bottom: r(tableHeight - y),
        side: betSideFor(parseFloat(positions.players[i].left), parseFloat(positions.players[i].top), tableWidth, tableHeight)
    }));
    const holeCards: HoleCardSlotPosition[] = scene.screen.holes.map(([x, y]) => ({ first: at([x - 12, y]), second: at([x + 12, y]) }));
    return {
        ...positions,
        players: plates,
        vacantPlayers: vacant,
        turnAnimations: plates,
        winAnimations: plates,
        dealers: scene.screen.holes.map(pt => at(pt)),
        holeCards,
        deck: at(scene.screen.pot),
        chips,
        seatAngles,
        feltCards: scene.screen.shown.map(pt => at(pt)),
        boardCentre: at(scene.screen.board)
    };
}

/** Replace the chip spots with {@link placeBetSpots} for the seat ring. */
export function withBetSpots(positions: PositionArrays, tableSize: TableSize, mode: ViewportMode): PositionArrays {
    const dims = getStageDims();
    const portrait = mode === "mobile-portrait";
    const mobile = mode === "mobile-portrait" || mode === "mobile-landscape";
    const board = betBoardFor(tableSize, portrait, dims.tableWidth, dims.tableHeight);
    const camera = threeTableCamera();
    if (camera) return badBeatPositions(positions, dims.tableWidth, dims.tableHeight, camera);
    if (isFlagshipShape()) {
        return { ...positions, chips: placeBetSpotsInFront(positions.players, dims.tableWidth, dims.tableHeight, portrait ? FLAGSHIP_YOUR_BOX_PORTRAIT : FLAGSHIP_YOUR_BOX) };
    }
    return {
        ...positions,
        chips: placeBetSpots(positions.players, seatEnvelope(mobile), dims.tableWidth, dims.tableHeight, board)
    };
}

// ─── Viewport Scaling ────────────────────────────────────────────────

export type ViewportMode = "mobile-portrait" | "mobile-landscape" | "tablet" | "desktop";

export function getViewportMode(): ViewportMode {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    const isCoarsePointer =
        typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

    // Portrait: aspect ratio + (coarse pointer OR narrow width). The coarse-pointer
    // test catches large phones (iPhone 14 Pro Max = 430px, Galaxy S24 = 412px,
    // Pixel Fold inner screen = 608px tall in portrait) reliably; the <768px arm
    // makes fine-pointer environments (narrow desktop windows, viewport-resized
    // automation without touch emulation) take the SAME code path as a real
    // phone instead of falling through to "tablet" and rendering the squashed
    // landscape stage.
    if (!isLandscape && (isCoarsePointer || width < 768)) return "mobile-portrait";

    // Landscape: coarse pointer up to 1700×900 CSS px — covers regular phones,
    // large Android flagships, and foldables (e.g. Galaxy Z Fold outer = 904px wide,
    // Pixel Fold inner = 1080px wide, future iPhone Fold ≈ 1100px wide in landscape).
    // The height<500 arm is the landscape twin of the portrait width<768 arm: an
    // iPhone 15 in landscape is 852px WIDE, so any width-based breakpoint calls
    // it desktop. Height is what's actually scarce — a sub-500px-tall landscape
    // window needs the compact treatment regardless of pointer type.
    const isCompactTouchLandscape = isLandscape && (isCoarsePointer || height < 500) && width <= 1700 && height <= 900;
    if (isCompactTouchLandscape) return "mobile-landscape";

    if (width <= 1024) return "tablet";
    return "desktop";
}

/**
 * Viewport parameters — PURE FUNCTIONAL.
 *
 * paddingH:      horizontal breathing room within the container (total, split left/right)
 * paddingV:      vertical breathing room within the container (total, split top/bottom)
 * footerOverlay: px height of any FIXED overlay footer that sits ON TOP of the container.
 *                Only mobile-landscape has this (80px fixed footer). All other viewports
 *                have the footer in normal flex flow, so the container already excludes it.
 *
 * Container dimensions are MEASURED from the actual parent div (via ref),
 * not guessed from window.innerHeight. This eliminates all header/footer guesswork.
 */
export const VIEWPORT_PARAMS: Record<ViewportMode, {
    paddingH: number;
    paddingV: number;
    footerOverlay: number;
}> = {
    "desktop": {
        paddingH: 40,
        paddingV: 10,
        footerOverlay: 160      // footer is fixed h-[160px] overlay at bottom
    },
    "tablet": {
        paddingH: 40,
        paddingV: 10,
        footerOverlay: 160      // same as desktop
    },
    "mobile-landscape": {
        paddingH: 10,
        paddingV: 15,
        footerOverlay: 80       // mobile landscape footer is 80px
    },
    "mobile-portrait": {
        paddingH: 12,
        paddingV: 10,
        footerOverlay: 90       // no persistent footer bar — just clearance for the
                                // on-demand action overlay + safe area at the bottom
    }
};

const MIN_SCALE = 0.3;
const MAX_GLOBAL_SCALE = 2.0;

// ─── Auto-Fit: Dynamic Content Bounds ───────────────────────────────
//
// Calculates the bounding box from SEAT_COORDS for the current table size.
// Includes padding for player UI components that extend beyond seat points.
// 9-seat, 6-seat, and 2-seat tables all auto-fit correctly.

/**
 * Padding for player UI that extends beyond seat coordinate points.
 * x:      player component width extending left/right of outermost seats
 * top:    cards (80px) + component centering (70px) + margin above topmost seat
 * bottom: badge + stack + progress bar below bottommost seat
 */
export const PLAYER_UI_PADDING: Record<ViewportMode, { x: number; top: number; bottom: number }> = {
    "desktop":          { x: 80, top: 90, bottom: 90 },    // symmetric → perfectly centered between header and footer
    "tablet":           { x: 80, top: 120, bottom: 90 },
    "mobile-landscape": { x: 40, top: 80, bottom: 60 },    // extra top for browser chrome
    "mobile-portrait":  { x: 70, top: 90, bottom: 90 },    // symmetric — vertical stadium, hero at the bottom
};

/** Room around the flagship phone table's seats ({@link getContentBounds}). */
export const FLAGSHIP_PORTRAIT_PADDING = { x: 110, top: 90, bottom: 90 };
/** Across a big screen the flagship seats' cards stick out sideways, so leave them room. */
export const FLAGSHIP_DESKTOP_PADDING = { x: 135, top: 90, bottom: 90 };
/** The flagship table's size across a big screen, relative to a full fit. */
export const FLAGSHIP_DESKTOP_SCALE = 0.93;

export interface ContentBounds {
    width: number;
    height: number;
    centerX: number;   // content center in stage coords (for pixel-based positioning)
    centerY: number;
}

/** Calculate the bounding box + center of all seat positions + player UI.
 *  Uses per-viewport padding — desktop gets full room, mobile gets tighter fit. */
export function getContentBounds(tableSize: TableSize): ContentBounds {
    const mode = getViewportMode();
    // The flagship phone table keeps the concept's breathing room either side
    // (the table fills ~3/4 of the width, not edge to edge).
    const basePad = isFlagshipPortrait() ? FLAGSHIP_PORTRAIT_PADDING : isFlagshipShape() && mode === "desktop" ? FLAGSHIP_DESKTOP_PADDING : PLAYER_UI_PADDING[mode];
    // Bad Beat: what the fixed camera shows of the plates and rail (projected) is the content.
    const camera = threeTableCamera();
    if (camera) {
        const dims = getStageDims();
        const angles = getLayoutPositions(tableSize, mode).seatAngles ?? [];
        const { content } = badBeatScene(angles, dims.tableWidth, dims.tableHeight, camera);
        return {
            width: content.x1 - content.x0,
            height: content.y1 - content.y0,
            centerX: dims.originX + (content.x0 + content.x1) / 2,
            centerY: dims.originY + (content.y0 + content.y1) / 2
        };
    }
    const pad = basePad;
    const coords = getSeatCoords(tableSize);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of coords) {
        const [sx, sy] = applySpread(x, y);
        minX = Math.min(minX, sx);
        maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy);
        maxY = Math.max(maxY, sy);
    }
    return {
        width: (maxX - minX) + pad.x * 2,
        height: (maxY - minY) + pad.top + pad.bottom,
        // Center of the PADDED bounds (not just seats). Accounts for asymmetric
        // padding — more above (cards) than below (badges). Without this offset,
        // the top player cards get clipped by the header.
        centerX: (minX + maxX) / 2,
        centerY: ((minY - pad.top) + (maxY + pad.bottom)) / 2
    };
}

/**
 * Calculate zoom level to fit all content within the container.
 * containerWidth/Height come from the ACTUAL measured parent div (via ref).
 * footerOverlay is subtracted for mobile-landscape where the footer overlays the container.
 */
export function calculateZoom(
    tableSize: TableSize,
    containerWidth: number,
    containerHeight: number
): number {
    const mode = getViewportMode();
    const params = VIEWPORT_PARAMS[mode];
    const bounds = getContentBounds(tableSize);

    // Usable space = container minus any fixed overlay minus breathing room.
    // Portrait needs no axis swap: the portrait stage is already vertical, so
    // its content bounds are taller than wide and fit the viewport directly.
    const side = sideColumnWidth(mode);
    const usableWidth = containerWidth - params.paddingH - side;
    // sideways, your plate and its clock sit at the very bottom: keep room for them
    const usableHeight = containerHeight - bottomReserve(mode, params.footerOverlay) - params.paddingV;

    const scaleByWidth = usableWidth / bounds.width;
    const scaleByHeight = usableHeight / bounds.height;
    const fitScale = Math.min(scaleByWidth, scaleByHeight);

    // Across a big screen the flagship's side seats push their cards outward,
    // so it sits a touch smaller to keep them clear of the side panel.
    // Bad Beat's table is tipped back, so it stands shorter than its flat bounds: let it grow.
    const shapeScale = threeTableCamera() ? 1 : isFlagshipShape() && mode === "desktop" ? FLAGSHIP_DESKTOP_SCALE : 1;
    const result = Math.max(MIN_SCALE, Math.min(fitScale * shapeScale, MAX_GLOBAL_SCALE));

    return result;
}

/**
 * Where the table's content sits in the measured container (px), before the
 * zoom: its content centred in the usable area.
 */
export function getTableOffset(
    zoom: number,
    tableSize: TableSize,
    containerWidth: number,
    containerHeight: number
): { tx: number; ty: number } {
    const mode = getViewportMode();
    const params = VIEWPORT_PARAMS[mode];
    const bounds = getContentBounds(tableSize);

    // Center of the usable area within the container
    const usableCenterX = (containerWidth - sideColumnWidth(mode)) / 2;
    const lift = stageShape === "badbeat" && mode === "mobile-portrait" ? BADBEAT_PORTRAIT_LIFT : 0;
    const usableCenterY = (containerHeight - bottomReserve(mode, params.footerOverlay)) / 2 - lift;

    // Content center after scaling (transform-origin: 0 0).
    // Portrait needs no special case: the portrait stage is natively vertical
    // (the old rotate-90 matrix rendered every seat label sideways and is gone).
    const scaledCenterX = bounds.centerX * zoom;
    const scaledCenterY = bounds.centerY * zoom;

    const tx = usableCenterX - scaledCenterX;
    const ty = usableCenterY - scaledCenterY;

    return { tx, ty };
}

/**
 * Build CSS transform — pixel-based, no percentages ({@link getTableOffset}, then the zoom).
 * CSS wrapper must have: top:0; left:0; transform-origin: 0 0;
 */
export function getTableTransform(zoom: number, tableSize: TableSize, containerWidth: number, containerHeight: number): string {
    const { tx, ty } = getTableOffset(zoom, tableSize, containerWidth, containerHeight);
    return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${zoom})`;
}
