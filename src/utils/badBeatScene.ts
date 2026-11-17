/**
 * Bad Beat's 3D table (Dzeezbtc/ui#36): the geometry of the concept's three.js
 * scene (design/concepts/09-bad-beat/index.html, initEngine/layoutSeats/fitDist),
 * kept free of three.js so the stage layout can place the HTML plates, bet
 * amounts and board on the same projected points the WebGL table is drawn
 * with. The 3D engine builds its camera from {@link fitBadBeatCamera} too, so
 * the two always agree.
 *
 * World units are the concept's: the table is 10.2 × 5.2 across, centred on
 * the origin, y up, +z towards the camera. Screen points are in "frame" px:
 * the frame is the table div (its width × height); things may project outside it.
 */

import { isEmpty } from "./guards";

export type Vec3 = [number, number, number];

/** The concept's table: rail outside (W × H), felt inside (FW × FH). */
export const BB_TABLE = { W: 10.2, H: 5.2, FW: 9.0, FH: 4.1 } as const;
/** Vertical field of view (degrees), as the concept's camera. */
export const BB_FOV = 32;
/** Where the camera looks. */
export const BB_LOOK: Vec3 = [0, 0, 0.1];
/** Camera elevation (radians above the table): the concept's "3d" view, sideways and upright. */
export const BB_ELEVATION = { landscape: 0.92, portrait: 1.05 } as const;

/** The plates' ring (rx along the long side, rz along the short side, height y), as the concept. */
export const BB_RINGS = {
    plate: { rx: 5.55, rz: 3.05, y: 0.5 }
} as const;
/**
 * How far in from the felt's edge (world units) each seat's things lie, on the
 * line from its plate to the middle: its two cards just inside the rail, its
 * bet further in. (The concept's ellipses only had seats at the corners; a seat
 * at the top or bottom would put its cards under the rail.)
 */
export const BB_INSETS = { hole: 0.55, bet: 1.1, dealer: 0.55 } as const;
/** The dealer disc lies beside its seat's two cards, this far along the rail. */
export const BB_DEALER_ALONG = 0.62;
/** The pot's chips sit this far behind the board's middle. */
export const BB_POT_BEHIND = 1.1;
/** The board's middle card. */
export const BB_BOARD: Vec3 = [0, 0.25, 0.05];
/**
 * Where the board lies along the table (world z). Across the screen it is the
 * middle. Upright the felt is narrow, so the board takes the widest gap
 * between the side seats' cards (nearest the middle), never over them.
 */
export function boardZ(holes: Vec3[], portrait: boolean): number {
    if (!portrait) return BB_BOARD[2];
    const limit = BB_TABLE.FW / 2 - 1.2;
    const zs = [-limit, limit, ...holes.filter(h => Math.abs(h[0]) > 0.3 && Math.abs(h[2]) < limit).map(h => h[2])].sort((a, b) => a - b);
    let best = BB_BOARD[2];
    let width = -1;
    for (let i = 1; i < zs.length; i++) {
        const gap = zs[i] - zs[i - 1];
        const mid = (zs[i] + zs[i - 1]) / 2;
        if (gap > width + 1e-6 || (Math.abs(gap - width) < 1e-6 && Math.abs(mid) < Math.abs(best))) {
            width = gap;
            best = mid;
        }
    }
    return best;
}


/** Room (fraction of the frame) the fit keeps clear round the plates: half a plate across, a tag above. */
export const BB_FIT_MARGIN = { landscape: { x: 0.085, y: 0.075 }, portrait: { x: 0.13, y: 0.035 } } as const;

export interface BadBeatCamera {
    position: Vec3;
    look: Vec3;
    /** Vertical field of view, degrees. */
    fov: number;
    /** Frame width / height. */
    aspect: number;
}

/**
 * A seat's angle round the table (radians, 0 = right, π/2 = bottom / towards
 * you), from its spot on the flat stage (table-div px): the seat ring keeps
 * its order and spacing, only the table under it changes.
 */
export function seatAngle(x: number, y: number, width: number, height: number): number {
    return Math.atan2((y - height / 2) / (height / 2), (x - width / 2) / (width / 2));
}

/** A point on a ring at an angle. Upright, the table is turned a quarter: its long side runs down the screen. */
export function ringPoint(angle: number, ring: { rx: number; rz: number; y: number }, portrait: boolean): Vec3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return portrait ? [c * ring.rz, ring.y, s * ring.rx] : [c * ring.rx, ring.y, s * ring.rz];
}

/**
 * In front of a plate (the Flagship's rule: a seat's things run in a straight
 * line from it to the middle): the felt's edge nearest the plate, then `inset`
 * in from it along that line, and `along` the rail. The felt is a stadium
 * FW × FH; upright, its long side runs down the screen.
 */
export function inFrontOf(plate: Vec3, inset: number, y: number, portrait: boolean, along = 0): Vec3 {
    // table-local: u along the long side, v along the short side
    const pu = portrait ? plate[2] : plate[0];
    const pv = portrait ? plate[0] : plate[2];
    const r = BB_TABLE.FH / 2;
    const flat = BB_TABLE.FW / 2 - r;
    const cu = Math.min(flat, Math.max(-flat, pu));
    const l = Math.hypot(pu - cu, pv) || 1;
    // outward from the felt's spine towards the plate
    const ou = (pu - cu) / l;
    const ov = pv / l;
    const d = r - inset;
    // the rail's direction there (clockwise on screen)
    const u = cu + ou * d + ov * along;
    const v = ov * d - ou * along;
    return portrait ? [v, y, u] : [u, y, v];
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => {
    const l = Math.hypot(a[0], a[1], a[2]);
    return [a[0] / l, a[1] / l, a[2] / l];
};

/** Where a world point lands in the frame (px), as three.js's camera.lookAt + project would put it. */
export function projectPoint(cam: BadBeatCamera, p: Vec3, width: number, height: number): [number, number] {
    const f = norm(sub(cam.look, cam.position));
    const r = norm(cross(f, [0, 1, 0]));
    const u = cross(r, f);
    const v = sub(p, cam.position);
    const depth = dot(v, f);
    const t = Math.tan((cam.fov * Math.PI) / 360);
    const nx = dot(v, r) / (depth * t * cam.aspect);
    const ny = dot(v, u) / (depth * t);
    return [((nx + 1) / 2) * width, ((1 - ny) / 2) * height];
}

/** The rail's outermost points (front edge a touch low, for its depth). */
function railExtremes(portrait: boolean): Vec3[] {
    return portrait
        ? [
              [-2.8, 0.2, 0],
              [2.8, 0.2, 0],
              [0, 0.2, -5.3],
              [0, -0.3, 5.4]
          ]
        : [
              [-5.3, 0.2, 0],
              [5.3, 0.2, 0],
              [0, 0.2, -2.8],
              [0, -0.3, 2.9]
          ];
}

/**
 * The concept's camera fit (fitDist): from the fixed elevation, the closest
 * distance at which every plate and the whole rail still sit inside the frame
 * with the margins kept clear. The camera never moves after this.
 */
export function fitBadBeatCamera(angles: number[], portrait: boolean, width: number, height: number): BadBeatCamera {
    const el = portrait ? BB_ELEVATION.portrait : BB_ELEVATION.landscape;
    const dir: Vec3 = [0, Math.sin(el), Math.cos(el)];
    const margin = portrait ? BB_FIT_MARGIN.portrait : BB_FIT_MARGIN.landscape;
    const mx = margin.x * width;
    const my = margin.y * height;
    const pts = [...angles.map(a => ringPoint(a, BB_RINGS.plate, portrait)), ...railExtremes(portrait)];
    const at = (d: number): BadBeatCamera => ({
        position: [BB_LOOK[0] + dir[0] * d, BB_LOOK[1] + dir[1] * d, BB_LOOK[2] + dir[2] * d],
        look: BB_LOOK,
        fov: BB_FOV,
        aspect: width / height
    });
    let lo = 3;
    let hi = 60;
    for (let it = 0; it < 30; it++) {
        const d = (lo + hi) / 2;
        const cam = at(d);
        const fits = pts.every(p => {
            const [x, y] = projectPoint(cam, p, width, height);
            return x > mx && x < width - mx && y > my && y < height - my;
        });
        if (fits) hi = d;
        else lo = d;
    }
    return at(hi);
}

/** A bet's amount sits this far (world units) from its chips' middle: above or below them… */
export const BB_BET_LABEL_GAP = 0.48;
/** …or, for a seat at the side, beside them (the amount is wide). */
export const BB_BET_LABEL_GAP_SIDE = 0.8;

/**
 * Where a bet's amount sits: right by its chips, on the side facing the middle
 * of the table. A seat at the far or near side has it below or above its
 * chips; a seat at either end beside them, towards the board. So it never runs
 * into the next seat's, and screen-up stays screen-up whichever way the table turns.
 */
export function betLabelPoint(bet: Vec3, plate: Vec3, portrait: boolean): Vec3 {
    const dx = bet[0] - plate[0];
    const dz = bet[2] - plate[2];
    // only a seat square at an end (its line within ~27° of level) has it beside; a corner keeps it above or below.
    // Upright the felt is too narrow for that: always above or below.
    if (!portrait && Math.abs(dx) > 2 * Math.abs(dz)) return [bet[0] + Math.sign(dx) * BB_BET_LABEL_GAP_SIDE, bet[1], bet[2]];
    // towards the middle; a seat level with it (upright, at the side) takes the side away from the board's end
    const towards = Math.abs(dz) > 0.3 * Math.abs(dx) ? Math.sign(dz) : bet[2] > 0.05 ? -1 : 1;
    return [bet[0], bet[1], bet[2] + towards * BB_BET_LABEL_GAP];
}

export interface BadBeatScene {
    portrait: boolean;
    /** What must show (the plates with room round them, and the rail), in frame px. */
    content: { x0: number; y0: number; x1: number; y1: number };
    camera: BadBeatCamera;
    /** Per table position, in world units. */
    world: {
        plates: Vec3[];
        bets: Vec3[];
        holes: Vec3[];
        dealers: Vec3[];
        pot: Vec3;
    };
    /** The same, projected into the frame (px). */
    screen: {
        plates: [number, number][];
        betLabels: [number, number][];
        holes: [number, number][];
        pot: [number, number];
        board: [number, number];
    };
}

/**
 * Everything Bad Beat puts round the table, for a seat ring (angles from
 * {@link seatAngle}) and a frame of width × height px: the camera, each seat's
 * plate, cards, bet and dealer spot in the world, and the same projected.
 */
export function badBeatScene(angles: number[], width: number, height: number): BadBeatScene {
    const portrait = height > width;
    const camera = fitBadBeatCamera(angles, portrait, width, height);
    const proj = (p: Vec3) => projectPoint(camera, p, width, height);
    const plates = angles.map(a => ringPoint(a, BB_RINGS.plate, portrait));
    const bets = plates.map(p => inFrontOf(p, BB_INSETS.bet, 0.21, portrait));
    const holes = plates.map(p => inFrontOf(p, BB_INSETS.hole, 0.215, portrait));
    // the disc beside the seat's cards, on whichever side has more room from the other seats' things
    const others = (i: number) => [...holes.filter((_, j) => j !== i), ...bets.filter((_, j) => j !== i)];
    const room = (q: Vec3, i: number) => Math.min(...others(i).map(o => Math.hypot(o[0] - q[0], o[2] - q[2])), Infinity);
    const dealers = plates.map((p, i) => {
        const a = inFrontOf(p, BB_INSETS.dealer, 0.24, portrait, BB_DEALER_ALONG);
        const b = inFrontOf(p, BB_INSETS.dealer, 0.24, portrait, -BB_DEALER_ALONG);
        return room(b, i) > room(a, i) + 1e-6 ? b : a;
    });
    const bz = boardZ(holes, portrait);
    const pot: Vec3 = [0, 0.21, bz - BB_POT_BEHIND];
    const margin = portrait ? BB_FIT_MARGIN.portrait : BB_FIT_MARGIN.landscape;
    const mx = margin.x * width;
    const my = margin.y * height;
    const content = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const [x, y] of plates.map(proj)) {
        content.x0 = Math.min(content.x0, x - mx);
        content.x1 = Math.max(content.x1, x + mx);
        content.y0 = Math.min(content.y0, y - my);
        content.y1 = Math.max(content.y1, y + my);
    }
    for (const [x, y] of railExtremes(portrait).map(proj)) {
        content.x0 = Math.min(content.x0, x);
        content.x1 = Math.max(content.x1, x);
        content.y0 = Math.min(content.y0, y);
        content.y1 = Math.max(content.y1, y);
    }
    return {
        portrait,
        content,
        camera,
        world: { plates, bets, holes, dealers, pot },
        screen: {
            plates: plates.map(proj),
            // each amount right by its chips, on the side facing the middle
            betLabels: bets.map((b, i) => proj(betLabelPoint(b, plates[i], portrait))),
            holes: holes.map(proj),
            pot: proj([pot[0], pot[1] + 0.45, pot[2]]),
            board: proj([BB_BOARD[0], BB_BOARD[1], bz])
        }
    };
}

/**
 * Chip colours by value, in small blinds: Bad Beat's own palette (white,
 * crimson, ice blue, green, amber), five values a factor of 5 apart.
 */
export const BB_CHIP_DENOMS: [number, number][] = [
    [500, 0xf5c542],
    [100, 0x2ee59d],
    [25, 0x9fd8ff],
    [5, 0xff2d55],
    [1, 0xeef1f5]
];

/** Piles of one bet stand this far apart (a chip is 0.28 across). */
export const BB_PILE_GAP = 0.3;

/**
 * Where each of a bet's piles stands, from the bet's spot (world x, z), lined
 * up with the seat: two side by side across its line, a third and fourth in a
 * second row behind them (towards the seat), so a bet never reaches far towards
 * its amount or across into the next seat's.
 */
export function pileSpots(count: number, bet: Vec3, plate: Vec3): [number, number][] {
    const dx = bet[0] - plate[0];
    const dz = bet[2] - plate[2];
    const l = Math.hypot(dx, dz) || 1;
    // in: towards the middle; across: along the rail
    const [ix, iz] = [dx / l, dz / l];
    const [ax, az] = [-iz, ix];
    const h = BB_PILE_GAP / 2;
    const grid: [number, number][][] = [[[0, 0]], [[-h, 0], [h, 0]], [[-h, h], [h, h], [0, -h]], [[-h, h], [h, h], [-h, -h], [h, -h]]];
    return (grid[count - 1] ?? []).map(([a, i]) => [ax * a + ix * i, az * a + iz * i]);
}

/**
 * A bet as chip piles (the concept's chipStack): per colour, how many chips
 * (at most 8 a pile, 4 piles). Any bet shows at least one white chip.
 */
export function chipPiles(smallBlinds: number): { color: number; count: number }[] {
    let left = Math.round(smallBlinds);
    const piles: { color: number; count: number }[] = [];
    for (const [d, color] of BB_CHIP_DENOMS) {
        const n = Math.floor(left / d);
        left -= n * d;
        if (n > 0) piles.push({ color, count: Math.min(n, 8) });
        if (piles.length > 3) break;
    }
    if (isEmpty(piles) && smallBlinds > 0) piles.push({ color: 0xeef1f5, count: 1 });
    return piles;
}
