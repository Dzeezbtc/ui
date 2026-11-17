import * as THREE from "three";
import { chipStack, type BadBeatScene, type Vec3 } from "../../../utils/badBeatScene";
import type { BadBeatTableState } from "../../../utils/badBeatTableState";
import { cardFace } from "../../../utils/cardFace";
import { isNullish } from "../../../utils/guards";
import { canvasTexture, type TableFrame, type ThreeTableLook } from "./look";

/**
 * The 3D table in WebGL (Dzeezbtc/ui#36, #38): a concept's three.js scene
 * drawn from the live game — each seat's cards, the chip stacks, the D disc
 * and the pot — in a look (./looks: Bad Beat, Maison 52) that brings the room,
 * the table, the cards and the chips. The camera is fixed (utils/badBeatScene
 * fits it) and never moves; the page draws only when the game or the screen
 * changes.
 *
 * Opaque canvas (alpha:false): WebKit does not composite a transparent WebGL canvas.
 */

/** The frame (the table div) on the canvas, in CSS px. */
export type BadBeatFrame = TableFrame;

const v3 = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);

export class BadBeatEngine {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.PerspectiveCamera(32, 2, 0.1, 120);
    private readonly table = new THREE.Group();
    private readonly dealer: THREE.Mesh;
    private readonly textures = new Map<string, THREE.CanvasTexture>();
    private readonly chipMaterials = new Map<number, THREE.Material[]>();
    private readonly chipGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 32);
    private readonly cardGeometry = new THREE.PlaneGeometry(0.66 * 0.62, 0.92 * 0.62);
    /** Face-up cards (yours, and at showdown) a size up, so they read from across the table. */
    private readonly faceGeometry = new THREE.PlaneGeometry(0.66 * 0.74, 0.92 * 0.74);
    private dynamic = new THREE.Group();
    private layout: BadBeatScene | null = null;
    private state: BadBeatTableState | null = null;
    private frame: BadBeatFrame | null = null;
    private raf = 0;
    private fontTimer = 0;

    constructor(
        canvas: HTMLCanvasElement,
        private readonly look: ThreeTableLook
    ) {
        const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
        r.setClearColor(look.clearColor, 1);
        r.shadowMap.enabled = true;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        r.outputEncoding = THREE.sRGBEncoding;
        r.toneMapping = THREE.ACESFilmicToneMapping;
        r.toneMappingExposure = look.exposure;
        this.renderer = r;
        this.scene.add(this.dynamic, this.table);
        look.build({ scene: this.scene, table: this.table, renderer: r });
        this.dealer = look.dealer();
        this.dealer.castShadow = true;
        this.dealer.rotation.y = Math.PI / 2;
        this.dealer.visible = false;
        this.scene.add(this.dealer);
        // the textures draw text: redraw once the look's faces have loaded
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
        const bg = this.look.background(frame);
        if (bg) {
            const old = this.scene.background as THREE.Texture | null;
            this.scene.background = bg;
            old?.dispose();
        }
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

    /** Redraw the text once the look's faces are really in (the sheet that declares them may load late). */
    private whenFontReady(tries: number): void {
        const fonts = document.fonts;
        if (!fonts) return;
        void Promise.all(this.look.fonts.map(f => fonts.load(f))).then(() => {
            if (this.look.fonts.every(f => fonts.check(f))) this.refreshText();
            else if (tries > 0) this.fontTimer = window.setTimeout(() => this.whenFontReady(tries - 1), 250);
        });
    }

    private refreshText(): void {
        this.textures.forEach((t, code) => {
            t.image = this.look.cardCanvas(code);
            t.needsUpdate = true;
        });
        const felt = this.table.getObjectByName("felt") as THREE.Mesh | undefined;
        if (felt) {
            const m = felt.material as THREE.MeshStandardMaterial;
            m.map?.dispose();
            m.map = this.look.feltTexture();
            m.needsUpdate = true;
        }
        this.dealer.material = this.look.dealer().material;
        this.draw();
    }

    private cardTexture(code: string): THREE.CanvasTexture {
        let t = this.textures.get(code);
        if (!t) {
            t = canvasTexture(this.look.cardCanvas(code), 8);
            this.textures.set(code, t);
        }
        return t;
    }

    private cardMesh(code: string): THREE.Group {
        const faceUp = !!cardFace(code);
        const g = new THREE.Group();
        // a face is drawn unlit and untoned, so it stays white with crisp black and red under the table's lights
        const map = this.cardTexture(faceUp ? code.toUpperCase() : "back");
        const material = faceUp
            ? new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, toneMapped: false })
            : new THREE.MeshStandardMaterial({ map, transparent: true, alphaTest: 0.5, roughness: 0.5 });
        const f = new THREE.Mesh(faceUp ? this.faceGeometry : this.cardGeometry, material);
        f.rotation.x = -Math.PI / 2;
        f.position.y = 0.004;
        f.castShadow = true;
        g.add(f);
        return g;
    }

    private chipMats(col: number): THREE.Material[] {
        const hit = this.chipMaterials.get(col);
        if (hit) return hit;
        const face = canvasTexture(this.look.chipFace(col), 8);
        const mats = [
            new THREE.MeshStandardMaterial({ map: canvasTexture(this.look.chipEdge(col), 4), roughness: 0.45 }),
            new THREE.MeshStandardMaterial({ map: face, roughness: 0.38 }),
            new THREE.MeshStandardMaterial({ map: face, roughness: 0.38 })
        ];
        this.chipMaterials.set(col, mats);
        return mats;
    }

    /** A bet's chips: one neat stack ({@link chipStack}), its colours stepping across the screen so each shows a sliver. */
    private chipStack(smallBlinds: number, seed: number): THREE.Group {
        const g = new THREE.Group();
        chipStack(smallBlinds).forEach(({ rank, y, shift }, k) => {
            const m = new THREE.Mesh(this.chipGeometry, this.chipMats(this.look.chipColors[rank]));
            m.position.set(shift, y, 0);
            // a fixed turn per chip, so a redraw never shuffles them
            m.rotation.y = ((seed * 7 + k) * 2.399) % (Math.PI * 2);
            m.castShadow = true;
            g.add(m);
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
            // shown cards are drawn big and flat over the table (BadBeatShowCards), not on the felt
            if (seat.cards && !seat.shown) {
                // two cards side by side, a little turned, as dealt in the concept
                // face up they lie side by side, both fully readable; face down they overlap a little
                const spread = seat.cards.some(c => !!cardFace(c)) ? 0.52 : 0.34;
                seat.cards.forEach((code, k) => {
                    const m = this.cardMesh(code);
                    const off = (k - 0.5) * spread;
                    m.position.set(hole[0] + off, 0.22 + k * 0.006, hole[2]);
                    m.rotation.y = cardFace(code) ? 0 : (((i * 5 + k * 3) % 7) / 7 - 0.5) * 0.25;
                    this.dynamic.add(m);
                });
            }
            if (seat.bet > 0 && bets[i]) {
                const s = this.chipStack(seat.bet, i);
                s.position.set(bets[i][0], 0.2, bets[i][2]);
                this.dynamic.add(s);
            }
        });
        if (state.pot > 0) {
            const s = this.chipStack(state.pot, 99);
            s.position.set(pot[0], 0.2, pot[2]);
            this.dynamic.add(s);
        }
        const d = isNullish(state.dealerPosition) ? null : dealers[state.dealerPosition];
        this.dealer.visible = !!d;
        if (d) this.dealer.position.set(d[0], 0.24, d[2]);
    }

    private draw(): void {
        if (!this.frame) return;
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => this.renderer.render(this.scene, this.camera));
    }
}
