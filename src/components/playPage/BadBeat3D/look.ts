import * as THREE from "three";

/**
 * A 3D table's look (Dzeezbtc/ui#36, #38). The engine (badBeatEngine) draws
 * the same table from the live game for every look: the seats' cards, the
 * chip stacks, the D disc and the pot, under a fixed camera. A look brings
 * everything you see: the room, lights, rail and felt, the cards, the chips
 * and the D disc. Bad Beat and Maison 52 are the looks today.
 */
export interface ThreeTableLook {
    /** Renderer clear colour and tone-mapping exposure. */
    clearColor: number;
    exposure: number;
    /** Chip colour by value rank (0 = the biggest; utils/badBeatScene BB_CHIP_DENOMS). */
    chipColors: number[];
    /** Font specs the textures draw with; the engine redraws them once these have loaded. */
    fonts: string[];
    /** Build the room, lights, table (rail, felt…) into the scene; `table` turns upright on a phone. */
    build(ctx: { scene: THREE.Scene; table: THREE.Group; renderer: THREE.WebGLRenderer }): void;
    /** The felt's texture (redrawn once the fonts load). */
    feltTexture(): THREE.Texture;
    /** A backdrop painted for the frame, or null when the room itself fills the view. */
    background(frame: TableFrame): THREE.Texture | null;
    /** A card face ("AS") or its back ("back"), 512 × 716. */
    cardCanvas(code: string): HTMLCanvasElement;
    /** A chip's rim (wrapped once round it) and face, in a colour. */
    chipEdge(color: number): HTMLCanvasElement;
    chipFace(color: number): HTMLCanvasElement;
    /** The dealer disc. */
    dealer(): THREE.Mesh;
}

/** The frame (the table div) on the canvas, in CSS px. */
export interface TableFrame {
    /** Canvas size. */
    width: number;
    height: number;
    /** The frame's box on the canvas. */
    left: number;
    top: number;
    frameWidth: number;
    frameHeight: number;
}

/** A stadium (a rectangle with round ends) w × h, centred. */
export function stadium(w: number, h: number): THREE.Shape {
    const s = new THREE.Shape();
    const rr = h / 2;
    s.moveTo(-w / 2 + rr, -h / 2);
    s.lineTo(w / 2 - rr, -h / 2);
    s.absarc(w / 2 - rr, 0, rr, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-w / 2 + rr, h / 2);
    s.absarc(-w / 2 + rr, 0, rr, Math.PI / 2, Math.PI * 1.5, false);
    return s;
}

export function canvasTexture(c: HTMLCanvasElement, anisotropy = 1, repeat = 0): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = anisotropy;
    if (repeat) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeat, repeat);
    }
    return t;
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return [c, c.getContext("2d")!];
}

/** Trace a rounded rectangle (inset `ix` from 0,0) for a fill or stroke. */
export function roundRect(x: CanvasRenderingContext2D, ix: number, w: number, h: number, r: number): void {
    x.beginPath();
    x.moveTo(ix + r, ix);
    x.lineTo(ix + w - r, ix);
    x.quadraticCurveTo(ix + w, ix, ix + w, ix + r);
    x.lineTo(ix + w, ix + h - r);
    x.quadraticCurveTo(ix + w, ix + h, ix + w - r, ix + h);
    x.lineTo(ix + r, ix + h);
    x.quadraticCurveTo(ix, ix + h, ix, ix + h - r);
    x.lineTo(ix, ix + r);
    x.quadraticCurveTo(ix, ix, ix + r, ix);
    x.closePath();
}

/** Trace a stadium inset `ix` in a W × H canvas (a felt's lines). */
export function stadiumPath(x: CanvasRenderingContext2D, W: number, H: number, ix: number): void {
    const w = W - ix * 2;
    const h = H - ix * 2;
    const r = h / 2;
    x.beginPath();
    x.moveTo(ix + r, ix);
    x.lineTo(ix + w - r, ix);
    x.arc(ix + w - r, ix + r, r, -Math.PI / 2, Math.PI / 2);
    x.lineTo(ix + r, ix + h);
    x.arc(ix + r, ix + r, r, Math.PI / 2, Math.PI * 1.5);
    x.closePath();
}

/** Fine random grain over a canvas (felt, stone). */
export function grain(x: CanvasRenderingContext2D, w: number, h: number, amount: number): void {
    const id = x.getImageData(0, 0, w, h);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * amount;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
    }
    x.putImageData(id, 0, 0);
}

/** The felt's shape with its texture mapped flat across it, lying in the table's plane. */
export function feltGeometry(FW: number, FH: number): THREE.ShapeGeometry {
    const g = new THREE.ShapeGeometry(stadium(FW, FH), 96);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + FW / 2) / FW, (pos.getY(i) + FH / 2) / FH);
    g.rotateX(-Math.PI / 2);
    return g;
}

/** An extruded ring between two stadiums, lying flat. */
export function stadiumRing(outerW: number, outerH: number, innerW: number, innerH: number, options: THREE.ExtrudeGeometryOptions): THREE.ExtrudeGeometry {
    const s = stadium(outerW, outerH);
    s.holes.push(stadium(innerW, innerH));
    const g = new THREE.ExtrudeGeometry(s, options);
    g.rotateX(-Math.PI / 2);
    return g;
}
