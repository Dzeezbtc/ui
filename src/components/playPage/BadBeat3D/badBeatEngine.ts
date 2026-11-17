import * as THREE from "three";
import { BB_TABLE, chipPiles, pileSpots, type BadBeatScene, type Vec3 } from "../../../utils/badBeatScene";
import type { BadBeatTableState } from "../../../utils/badBeatTableState";
import { cardFace } from "../../../utils/cardFace";
import { chipEdge, chipFace } from "./badBeatChips";

/**
 * The Bad Beat table in WebGL (Dzeezbtc/ui#36): the concept's three.js scene
 * (design/concepts/09-bad-beat/index.html, initEngine) — the same thick
 * moulded rail, lit felt with BAD BEAT on it, spot + rim + fill lights, soft
 * shadow, crimson "BB" card backs, chip piles and the white D disc — drawn
 * from the live game. The camera is fixed (utils/badBeatScene fits it) and
 * never moves; the page draws only when the game or the screen changes.
 *
 * Opaque canvas (alpha:false) with the concept's background painted in the
 * scene: WebKit does not composite a transparent WebGL canvas.
 */

const FONT = '"Barlow Condensed", ui-sans-serif, system-ui, sans-serif';

/** The frame (the table div) on the canvas, in CSS px. */
export interface BadBeatFrame {
    /** Canvas size. */
    width: number;
    height: number;
    /** The frame's box on the canvas. */
    left: number;
    top: number;
    frameWidth: number;
    frameHeight: number;
}

const v3 = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);

function stadium(w: number, h: number): THREE.Shape {
    const s = new THREE.Shape();
    const rr = h / 2;
    s.moveTo(-w / 2 + rr, -h / 2);
    s.lineTo(w / 2 - rr, -h / 2);
    s.absarc(w / 2 - rr, 0, rr, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-w / 2 + rr, h / 2);
    s.absarc(-w / 2 + rr, 0, rr, Math.PI / 2, Math.PI * 1.5, false);
    return s;
}

function canvasTexture(c: HTMLCanvasElement, anisotropy = 1): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = anisotropy;
    return t;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return [c, c.getContext("2d")!];
}

/** The felt: radial steel-blue, grain, a crimson pin-line, the dashed betting line and BAD BEAT. */
function feltTexture(c1: string, c2: string): THREE.CanvasTexture {
    const W = 2200;
    const H = 1000;
    const [c, x] = makeCanvas(W, H);
    const g = x.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    const id = x.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 16;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
    }
    x.putImageData(id, 0, 0);
    const path = (ix: number) => {
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
    };
    x.strokeStyle = "rgba(255,45,85,.75)";
    x.lineWidth = 5;
    path(16);
    x.stroke();
    x.setLineDash([18, 16]);
    x.strokeStyle = "rgba(255,255,255,.13)";
    x.lineWidth = 4;
    path(150);
    x.stroke();
    x.setLineDash([]);
    x.save();
    x.translate(W / 2, H * 0.76);
    x.transform(1, 0, -0.2, 1, 0, 0);
    x.font = `italic 900 120px ${FONT}`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "rgba(238,241,245,.2)";
    x.fillText("BAD", -120, 0);
    x.fillStyle = "rgba(255,45,85,.45)";
    x.fillText("BEAT", 105, 0);
    x.restore();
    return canvasTexture(c, 8);
}

/** A card face ("AS") or the crimson hatched "BB" back ("back"). */
function cardCanvas(code: string): HTMLCanvasElement {
    const [c, x] = makeCanvas(256, 358);
    const rr = (w: number, h: number, r: number) => {
        x.beginPath();
        x.moveTo(r, 0);
        x.lineTo(w - r, 0);
        x.quadraticCurveTo(w, 0, w, r);
        x.lineTo(w, h - r);
        x.quadraticCurveTo(w, h, w - r, h);
        x.lineTo(r, h);
        x.quadraticCurveTo(0, h, 0, h - r);
        x.lineTo(0, r);
        x.quadraticCurveTo(0, 0, r, 0);
        x.closePath();
    };
    const face = code === "back" ? null : cardFace(code);
    if (!face) {
        rr(256, 358, 26);
        x.fillStyle = "#F4F6F8";
        x.fill();
        x.save();
        x.clip();
        x.fillStyle = "#FF2D55";
        x.fillRect(12, 12, 232, 334);
        x.strokeStyle = "rgba(255,255,255,.22)";
        x.lineWidth = 6;
        for (let i = -358; i < 256; i += 22) {
            x.beginPath();
            x.moveTo(i, 358);
            x.lineTo(i + 358, 0);
            x.stroke();
        }
        x.fillStyle = "#0A0C0F";
        x.font = `italic 900 64px ${FONT}`;
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.translate(128, 179);
        x.rotate(-0.2);
        x.fillText("BB", 0, 4);
        x.restore();
    } else {
        rr(256, 358, 26);
        x.fillStyle = "#F7F8FA";
        x.fill();
        x.fillStyle = face.red ? "#E3123F" : "#0A0C0F";
        x.font = `800 128px ${FONT}`;
        x.textBaseline = "top";
        x.fillText(face.rank, 22, 6);
        x.font = "72px serif";
        x.fillText(face.suit, 26, 138);
        x.font = "150px serif";
        x.textAlign = "right";
        x.textBaseline = "bottom";
        x.fillText(face.suit, 238, 350);
    }
    return c;
}

export class BadBeatEngine {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.PerspectiveCamera(32, 2, 0.1, 100);
    private readonly table = new THREE.Group();
    private readonly dealer: THREE.Mesh;
    private readonly textures = new Map<string, THREE.CanvasTexture>();
    private readonly chipMaterials = new Map<number, THREE.Material[]>();
    private readonly chipGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 32);
    private readonly cardGeometry = new THREE.PlaneGeometry(0.66 * 0.62, 0.92 * 0.62);
    private dynamic = new THREE.Group();
    private layout: BadBeatScene | null = null;
    private state: BadBeatTableState | null = null;
    private frame: BadBeatFrame | null = null;
    private raf = 0;
    private fontTimer = 0;

    constructor(canvas: HTMLCanvasElement) {
        const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
        r.setClearColor(0x0a0c0f, 1);
        r.shadowMap.enabled = true;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        r.outputEncoding = THREE.sRGBEncoding;
        r.toneMapping = THREE.ACESFilmicToneMapping;
        r.toneMappingExposure = 1.05;
        this.renderer = r;
        const scene = this.scene;
        scene.add(this.dynamic);

        // lights
        scene.add(new THREE.HemisphereLight(0xcfdcef, 0x0a0c0f, 0.38));
        const sp = new THREE.SpotLight(0xffffff, 1.55, 40, 0.62, 0.65, 1.2);
        sp.position.set(0, 11.5, 0.6);
        sp.target.position.set(0, 0, 0);
        sp.castShadow = true;
        sp.shadow.mapSize.set(2048, 2048);
        sp.shadow.bias = -0.0004;
        sp.shadow.radius = 4;
        scene.add(sp, sp.target);
        const rim = new THREE.PointLight(0xff2d55, 0.9, 18);
        rim.position.set(0, 1.6, -5.6);
        scene.add(rim);
        const fill = new THREE.DirectionalLight(0x9fd8ff, 0.25);
        fill.position.set(-6, 4, 6);
        scene.add(fill);

        // table: rail, base, felt, floor shadow
        const { W, H, FW, FH } = BB_TABLE;
        scene.add(this.table);
        const railShape = stadium(W, H);
        railShape.holes.push(stadium(FW, FH));
        const railG = new THREE.ExtrudeGeometry(railShape, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.16, bevelSegments: 6, curveSegments: 64 });
        railG.rotateX(-Math.PI / 2);
        const rail = new THREE.Mesh(railG, new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: 0.78, metalness: 0.05 }));
        rail.castShadow = true;
        rail.receiveShadow = true;
        this.table.add(rail);
        const baseG = new THREE.ExtrudeGeometry(stadium(W - 0.6, H - 0.6), { depth: 0.9, bevelEnabled: false, curveSegments: 48 });
        baseG.rotateX(-Math.PI / 2);
        const base = new THREE.Mesh(baseG, new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.8 }));
        base.position.y = -0.9;
        base.castShadow = true;
        this.table.add(base);
        const feltG = new THREE.ShapeGeometry(stadium(FW, FH), 96);
        const uv = feltG.attributes.uv as THREE.BufferAttribute;
        const pos = feltG.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + FW / 2) / FW, (pos.getY(i) + FH / 2) / FH);
        feltG.rotateX(-Math.PI / 2);
        const felt = new THREE.Mesh(feltG, new THREE.MeshStandardMaterial({ map: feltTexture("#25404F", "#0E1820"), roughness: 0.95, metalness: 0 }));
        felt.position.y = 0.2;
        felt.receiveShadow = true;
        this.table.add(felt);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.55 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.9;
        floor.receiveShadow = true;
        scene.add(floor);

        // dealer disc
        const [dc, dx] = makeCanvas(128, 128);
        dx.fillStyle = "#f4f6f8";
        dx.fillRect(0, 0, 128, 128);
        dx.fillStyle = "#0A0C0F";
        dx.font = `italic 900 84px ${FONT}`;
        dx.textAlign = "center";
        dx.textBaseline = "middle";
        dx.fillText("D", 64, 70);
        this.dealer = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 40), [
            new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.4 }),
            new THREE.MeshStandardMaterial({ map: canvasTexture(dc), roughness: 0.35 }),
            new THREE.MeshStandardMaterial({ color: 0xdfe3e8 })
        ]);
        this.dealer.castShadow = true;
        this.dealer.rotation.y = Math.PI / 2;
        this.dealer.visible = false;
        scene.add(this.dealer);

        // the textures draw text: redraw once the condensed face has loaded
        this.whenFontReady(40);
    }

    /** Fit the canvas and camera to the screen. */
    setFrame(frame: BadBeatFrame, layout: BadBeatScene): void {
        this.frame = frame;
        const layoutChanged = layout !== this.layout;
        this.layout = layout;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(frame.width, frame.height, false);
        this.paintBackground(frame);
        const cam = this.camera;
        cam.fov = layout.camera.fov;
        cam.aspect = layout.camera.aspect;
        cam.position.copy(v3(layout.camera.position));
        cam.lookAt(v3(layout.camera.look));
        cam.setViewOffset(frame.frameWidth, frame.frameHeight, -frame.left, -frame.top, frame.width, frame.height);
        cam.updateProjectionMatrix();
        this.table.rotation.y = layout.portrait ? Math.PI / 2 : 0;
        if (layoutChanged) this.rebuild();
        this.draw();
    }

    /** Draw the live game: cards, bets, the dealer disc and the pot. */
    setState(state: BadBeatTableState): void {
        this.state = state;
        this.rebuild();
        this.draw();
    }

    dispose(): void {
        cancelAnimationFrame(this.raf);
        clearTimeout(this.fontTimer);
        this.renderer.dispose();
        this.renderer.forceContextLoss();
    }

    /** Redraw the text once the condensed face is really in (the sheet that declares it may load late). */
    private whenFontReady(tries: number): void {
        const spec = `italic 900 64px ${FONT}`;
        const fonts = document.fonts;
        if (!fonts) return;
        void fonts.load(spec).then(() => {
            if (fonts.check(spec) && Array.from(fonts).some(f => f.family.replace(/"/g, "") === "Barlow Condensed" && f.status === "loaded")) this.refreshText();
            else if (tries > 0) this.fontTimer = window.setTimeout(() => this.whenFontReady(tries - 1), 250);
        });
    }

    private refreshText(): void {
        this.textures.forEach((t, code) => {
            t.image = cardCanvas(code);
            t.needsUpdate = true;
        });
        const felt = this.table.children[2] as THREE.Mesh;
        (felt.material as THREE.MeshStandardMaterial).map = feltTexture("#25404F", "#0E1820");
        (felt.material as THREE.MeshStandardMaterial).needsUpdate = true;
        this.draw();
    }

    /** The concept's room: a radial glow behind the table, centred on it. */
    private paintBackground(frame: BadBeatFrame): void {
        const w = Math.max(2, Math.round(frame.width / 2));
        const h = Math.max(2, Math.round(frame.height / 2));
        const [c, x] = makeCanvas(w, h);
        const cx = (frame.left + frame.frameWidth / 2) / 2;
        const cy = (frame.top + frame.frameHeight * 0.47) / 2;
        const r = Math.max(frame.frameWidth, frame.frameHeight) * 0.62;
        const g = x.createRadialGradient(cx, cy, 20, cx, cy, r);
        g.addColorStop(0, "#1b2733");
        g.addColorStop(1, "#0A0C0F");
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
        const old = this.scene.background as THREE.Texture | null;
        this.scene.background = canvasTexture(c);
        old?.dispose();
    }

    private cardTexture(code: string): THREE.CanvasTexture {
        let t = this.textures.get(code);
        if (!t) {
            t = canvasTexture(cardCanvas(code), 8);
            this.textures.set(code, t);
        }
        return t;
    }

    private cardMesh(code: string): THREE.Group {
        const faceUp = !!cardFace(code);
        const g = new THREE.Group();
        const f = new THREE.Mesh(this.cardGeometry, new THREE.MeshStandardMaterial({ map: this.cardTexture(faceUp ? code.toUpperCase() : "back"), transparent: true, alphaTest: 0.5, roughness: 0.5 }));
        f.rotation.x = -Math.PI / 2;
        f.position.y = 0.004;
        f.castShadow = true;
        g.add(f);
        return g;
    }

    private chipMats(col: number): THREE.Material[] {
        const hit = this.chipMaterials.get(col);
        if (hit) return hit;
        const face = canvasTexture(chipFace(col), 8);
        const mats = [
            new THREE.MeshStandardMaterial({ map: canvasTexture(chipEdge(col), 4), roughness: 0.45 }),
            new THREE.MeshStandardMaterial({ map: face, roughness: 0.38 }),
            new THREE.MeshStandardMaterial({ map: face, roughness: 0.38 })
        ];
        this.chipMaterials.set(col, mats);
        return mats;
    }

    /** A bet's chips: its piles side by side in a row across the line from `from` (its seat) to `at`. */
    private chipStack(smallBlinds: number, seed: number, at: Vec3, from: Vec3): THREE.Group {
        const g = new THREE.Group();
        const piles = chipPiles(smallBlinds);
        const spots = pileSpots(piles.length, at, from);
        piles.forEach(({ color, count }, col) => {
            const [ox, oz] = spots[col];
            for (let k = 0; k < count; k++) {
                const m = new THREE.Mesh(this.chipGeometry, this.chipMats(color));
                m.position.set(ox, 0.02 + k * 0.042, oz);
                // a fixed jitter per chip, so a redraw never shuffles them
                m.rotation.y = ((seed * 7 + col * 3 + k) * 2.399) % (Math.PI * 2);
                m.castShadow = true;
                g.add(m);
            }
        });
        return g;
    }

    private rebuild(): void {
        const layout = this.layout;
        const state = this.state;
        this.scene.remove(this.dynamic);
        // card materials are per card (their textures and every geometry are shared); chip materials are cached
        this.dynamic.traverse(o => {
            if (o instanceof THREE.Mesh && !Array.isArray(o.material)) (o.material as THREE.Material).dispose();
        });
        this.dynamic = new THREE.Group();
        this.scene.add(this.dynamic);
        if (!layout || !state) {
            this.dealer.visible = false;
            return;
        }
        const { holes, bets, dealers, pot } = layout.world;
        state.seats.forEach((seat, i) => {
            const hole = holes[i];
            if (!hole) return;
            if (seat.cards) {
                // two cards side by side, a little turned, as dealt in the concept
                seat.cards.forEach((code, k) => {
                    const m = this.cardMesh(code);
                    const off = (k - 0.5) * 0.34;
                    m.position.set(hole[0] + off, 0.22 + k * 0.006, hole[2]);
                    m.rotation.y = (((i * 5 + k * 3) % 7) / 7 - 0.5) * 0.25;
                    this.dynamic.add(m);
                });
            }
            if (seat.bet > 0 && bets[i]) {
                const s = this.chipStack(seat.bet, i, bets[i], layout.world.plates[i]);
                s.position.set(bets[i][0], 0.2, bets[i][2]);
                this.dynamic.add(s);
            }
        });
        if (state.pot > 0) {
            // the pot's piles in a row across the table
            const s = this.chipStack(state.pot, 99, pot, [pot[0], pot[1], pot[2] - 1]);
            s.position.set(pot[0], 0.2, pot[2]);
            this.dynamic.add(s);
        }
        const d = state.dealerPosition === null ? null : dealers[state.dealerPosition];
        this.dealer.visible = !!d;
        if (d) this.dealer.position.set(d[0], 0.24, d[2]);
    }

    private draw(): void {
        if (!this.frame) return;
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => this.renderer.render(this.scene, this.camera));
    }
}
