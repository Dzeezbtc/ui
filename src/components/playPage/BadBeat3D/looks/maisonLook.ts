import * as THREE from "three";
import { BB_TABLE } from "../../../../utils/badBeatScene";
import { cardFace } from "../../../../utils/cardFace";
import { canvasTexture, feltGeometry, grain, makeCanvas, roundRect, stadium, stadiumPath, stadiumRing, type ThreeTableLook } from "../look";

const SERIF = '"Cormorant Garamond", Georgia, serif';

const hex = (c: number) => "#" + c.toString(16).padStart(6, "0");

/** The felt: emerald, lit in the middle, a double gold line and MAISON fifty-two. */
function feltTexture(): THREE.CanvasTexture {
    const W = 2200;
    const H = 1000;
    const [c, x] = makeCanvas(W, H);
    const g = x.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H / 2, W * 0.6);
    g.addColorStop(0, "#126247");
    g.addColorStop(1, "#04241A");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    grain(x, W, H, 14);
    x.strokeStyle = "rgba(205,176,127,.55)";
    x.lineWidth = 3;
    stadiumPath(x, W, H, 150);
    x.stroke();
    x.lineWidth = 1.2;
    stadiumPath(x, W, H, 162);
    x.stroke();
    x.save();
    x.translate(W / 2, H * 0.75);
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "rgba(205,176,127,.5)";
    x.font = `500 82px ${SERIF}`;
    (x as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "28px";
    x.fillText("M A I S O N", 0, 0);
    (x as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
    x.font = `italic 500 40px ${SERIF}`;
    x.fillText("f i f t y - t w o", 0, 64);
    x.strokeStyle = "rgba(205,176,127,.45)";
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(-300, -62);
    x.lineTo(-40, -62);
    x.moveTo(40, -62);
    x.lineTo(300, -62);
    x.stroke();
    x.beginPath();
    x.moveTo(0, -74);
    x.lineTo(10, -62);
    x.lineTo(0, -50);
    x.lineTo(-10, -62);
    x.closePath();
    x.stroke();
    x.restore();
    return canvasTexture(c, 8);
}

/** The room's reflections: a warm bordeaux dusk with the chandelier and sconces as bright spots. */
function environment(r: THREE.WebGLRenderer): THREE.Texture {
    const [c, x] = makeCanvas(1024, 512);
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#2A1218");
    g.addColorStop(0.5, "#3A1A20");
    g.addColorStop(1, "#0C0607");
    x.fillStyle = g;
    x.fillRect(0, 0, 1024, 512);
    const blob = (cx: number, cy: number, rad: number, a: number) => {
        const rg = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
        rg.addColorStop(0, `rgba(255,226,170,${a})`);
        rg.addColorStop(1, "rgba(255,226,170,0)");
        x.fillStyle = rg;
        x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    };
    blob(512, 40, 160, 0.55);
    blob(180, 200, 70, 0.45);
    blob(844, 200, 70, 0.45);
    blob(512, 230, 40, 0.3);
    const t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.encoding = THREE.sRGBEncoding;
    const pm = new THREE.PMREMGenerator(r);
    const env = pm.fromEquirectangular(t).texture;
    pm.dispose();
    t.dispose();
    return env;
}

/** Fluted bordeaux velvet. */
function velvet(): THREE.CanvasTexture {
    const [c, x] = makeCanvas(512, 512);
    x.fillStyle = "#3A0F1C";
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 32) {
        const g = x.createLinearGradient(i, 0, i + 32, 0);
        g.addColorStop(0, "rgba(0,0,0,.55)");
        g.addColorStop(0.18, "rgba(0,0,0,.1)");
        g.addColorStop(0.5, "rgba(255,190,190,.10)");
        g.addColorStop(0.82, "rgba(0,0,0,.1)");
        g.addColorStop(1, "rgba(0,0,0,.55)");
        x.fillStyle = g;
        x.fillRect(i, 0, 32, 512);
    }
    grain(x, 512, 512, 10);
    const t = canvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(10, 1);
    return t;
}

/** Black marble with soft white and gold veins. */
function marble(): THREE.CanvasTexture {
    const S = 1024;
    const [c, x] = makeCanvas(S, S);
    x.fillStyle = "#0D0B0C";
    x.fillRect(0, 0, S, S);
    x.filter = "blur(1.2px)";
    for (let i = 0; i < 14; i++) {
        const py = Math.random() * S;
        const gold = i % 4 === 0;
        x.strokeStyle = gold ? `rgba(214,176,106,${0.45 + Math.random() * 0.25})` : `rgba(230,225,215,${0.1 + Math.random() * 0.16})`;
        x.lineWidth = gold ? 1.6 : 0.8 + Math.random() * 1.4;
        x.beginPath();
        x.moveTo(-50, py);
        const amp = 40 + Math.random() * 90;
        const f = 0.004 + Math.random() * 0.006;
        const ph = Math.random() * 6;
        const dr = (Math.random() - 0.5) * 0.6;
        for (let k = 0; k <= S + 100; k += 12) x.lineTo(k, py + Math.sin(k * f + ph) * amp + k * dr + Math.sin(k * 0.03 + ph) * 6);
        x.stroke();
    }
    x.filter = "none";
    grain(x, S, S, 6);
    return canvasTexture(c, 4, 2);
}

/** A soft additive glow (a sconce, the chandelier). */
function glow(color: string, size: number): THREE.Sprite {
    const [c, x] = makeCanvas(128, 128);
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, color);
    g.addColorStop(0.25, color.replace(/[\d.]+\)$/, ".35)"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.scale.set(size, size, 1);
    return s;
}

/** An ivory gilt-edged card ("AS"), or its back ("back") with the green M monogram, at twice the size. */
function cardCanvas(code: string): HTMLCanvasElement {
    const [c, x] = makeCanvas(512, 716);
    x.scale(2, 2);
    roundRect(x, 0, 256, 358, 22);
    x.fillStyle = "#C9A56A";
    x.fill();
    roundRect(x, 4, 248, 350, 19);
    const face = code === "back" ? null : cardFace(code);
    if (!face) {
        x.fillStyle = "#F7F1E6";
        x.fill();
        x.save();
        x.clip();
        x.strokeStyle = "rgba(15,59,46,.28)";
        x.lineWidth = 1.2;
        for (let k = 0; k < 44; k++) {
            x.beginPath();
            x.ellipse(128, 179, 6 + k * 5.5, 4 + k * 7.5, 0, 0, Math.PI * 2);
            x.stroke();
        }
        x.strokeStyle = "#A9834C";
        x.lineWidth = 2.5;
        roundRect(x, 18, 220, 322, 12);
        x.stroke();
        x.lineWidth = 1;
        roundRect(x, 26, 204, 306, 8);
        x.stroke();
        x.fillStyle = "#0F3B2E";
        x.beginPath();
        x.arc(128, 179, 42, 0, Math.PI * 2);
        x.fill();
        x.strokeStyle = "#CDB07F";
        x.lineWidth = 2;
        x.stroke();
        x.fillStyle = "#CDB07F";
        x.font = `italic 600 52px ${SERIF}`;
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("M", 128, 184);
        x.restore();
    } else {
        const g = x.createLinearGradient(0, 0, 256, 358);
        g.addColorStop(0, "#FFFDF8");
        g.addColorStop(1, "#F2EADC");
        x.fillStyle = g;
        x.fill();
        x.strokeStyle = "rgba(169,131,76,.6)";
        x.lineWidth = 1.5;
        roundRect(x, 14, 228, 330, 12);
        x.stroke();
        // a big rank, a big suit under it, a bigger one in the corner: readable across the table
        x.fillStyle = face.red ? "#8A1C2C" : "#1D1A16";
        x.font = `700 ${face.rank === "10" ? 116 : 136}px ${SERIF}`;
        x.textBaseline = "top";
        x.textAlign = "left";
        x.fillText(face.rank, 22, 4);
        x.font = "84px serif";
        x.fillText(face.suit, 26, 134);
        x.font = "150px serif";
        x.textAlign = "right";
        x.textBaseline = "bottom";
        x.fillText(face.suit, 236, 346);
    }
    return c;
}

/** The salon plaques' cream inlay and gold foil (Dzeezbtc/ui#40). */
const PLAQUE_INLAY = "#EFE4CC";
const PLAQUE_GOLD = "#CDB07F";

/** A salon plaque's rim: its colour with eight cream inlays, a fine gold line top and bottom. */
function chipEdge(color: number): HTMLCanvasElement {
    const [c, x] = makeCanvas(256, 24);
    x.fillStyle = hex(color);
    x.fillRect(0, 0, 256, 24);
    x.fillStyle = plaqueInlay(color);
    for (let i = 0; i < 8; i++) x.fillRect(i * 32 + 9, 0, 14, 24);
    x.fillStyle = PLAQUE_GOLD;
    x.fillRect(0, 2, 256, 2);
    x.fillRect(0, 20, 256, 2);
    return c;
}

/** The mark on a plaque's centre: gold on the dark chips, espresso on ivory. */
function plaqueMark(color: number): string {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#4A3418" : PLAQUE_GOLD;
}

/** A plaque's inlays: cream, or espresso on the pale chips so they still show. */
function plaqueInlay(color: number): string {
    return plaqueMark(color) === PLAQUE_GOLD ? PLAQUE_INLAY : "#6B4F2A";
}

/**
 * A salon plaque's face: eight cream inlays round the rim, a gold-foil ring
 * inside the edge, and a raised, finely engraved centre with the M52 monogram.
 */
function chipFace(color: number): HTMLCanvasElement {
    const [c, x] = makeCanvas(256, 256);
    const mark = plaqueMark(color);
    x.fillStyle = hex(color);
    x.fillRect(0, 0, 256, 256);
    // eight inlays round the rim
    x.fillStyle = plaqueInlay(color);
    for (let i = 0; i < 8; i++) {
        const a0 = (i / 8) * Math.PI * 2 - Math.PI / 16;
        x.beginPath();
        x.arc(128, 128, 128, a0, a0 + Math.PI / 8);
        x.arc(128, 128, 102, a0 + Math.PI / 8, a0, true);
        x.closePath();
        x.fill();
    }
    // the gold-foil ring
    x.strokeStyle = PLAQUE_GOLD;
    x.lineWidth = 6;
    x.beginPath();
    x.arc(128, 128, 94, 0, Math.PI * 2);
    x.stroke();
    // the engraved centre
    x.strokeStyle = "rgba(255,255,255,0.08)";
    x.lineWidth = 1.5;
    for (let r = 8; r < 72; r += 5) {
        x.beginPath();
        x.arc(128, 128, r, 0, Math.PI * 2);
        x.stroke();
    }
    x.strokeStyle = mark;
    x.lineWidth = 3;
    x.beginPath();
    x.arc(128, 128, 74, 0, Math.PI * 2);
    x.stroke();
    // the monogram
    x.fillStyle = mark;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "700 64px 'Cormorant Garamond', Georgia, serif";
    x.fillText("M52", 128, 132);
    return c;
}

/**
 * Maison 52 (Dzeezbtc/ui#38), from the concept's initEngine
 * (design/concepts/10-maison): a night salon — fluted bordeaux velvet wall,
 * gold dado rails, brass sconces and a chandelier glow over black marble —
 * and a black lacquer table with a gold-leaf inlay, emerald felt and a
 * pedestal on a gold ring. Ivory gilt cards, Maison chips, a brass D.
 */
export const maisonLook: ThreeTableLook = {
    clearColor: 0x170a0f,
    exposure: 1.15,
    // 500, 100, 25, 5, 1: black, bordeaux, bottle green, navy, ivory
    chipColors: [0x1d1a16, 0x6e1f2b, 0x0f3b2e, 0x22427a, 0xf4eee2],
    fonts: [`500 64px ${SERIF}`, `italic 500 64px ${SERIF}`, `700 64px ${SERIF}`, `italic 600 64px ${SERIF}`],
    build({ scene, table, renderer }) {
        scene.background = new THREE.Color(0x170a0f);
        scene.fog = new THREE.Fog(0x170a0f, 24, 48);
        scene.environment = environment(renderer);
        scene.add(new THREE.HemisphereLight(0xffd9b0, 0x1a0a0e, 0.28));
        const sun = new THREE.SpotLight(0xffe2b8, 2.1, 40, 0.6, 0.75, 1.1);
        sun.position.set(0, 13, 1.5);
        sun.target.position.set(0, 0, 0);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.bias = -0.0005;
        sun.shadow.radius = 5;
        scene.add(sun, sun.target);
        const fill = new THREE.DirectionalLight(0xffc9a0, 0.18);
        fill.position.set(-8, 5, 8);
        scene.add(fill);

        // the room: fluted bordeaux velvet, gold dado rails, brass sconces, a chandelier glow
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(70, 22), new THREE.MeshStandardMaterial({ map: velvet(), roughness: 0.9, metalness: 0, envMapIntensity: 0.2 }));
        wall.position.set(0, 5, -9);
        wall.receiveShadow = true;
        scene.add(wall);
        const gold = new THREE.MeshStandardMaterial({ color: 0xd6b06a, metalness: 1, roughness: 0.3, envMapIntensity: 1.4 });
        [-2.2, 9.6].forEach(y => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(70, 0.14, 0.14), gold);
            m.position.set(0, y, -8.9);
            scene.add(m);
        });
        [-9, -3, 3, 9].forEach(sx => {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.7, 24), gold);
            b.position.set(sx, 3.6, -8.7);
            scene.add(b);
            const g1 = glow("rgba(255,214,150,1)", 5.5);
            g1.position.set(sx, 3.9, -8.5);
            scene.add(g1);
            const pl = new THREE.PointLight(0xffc98a, 0.55, 12, 2);
            pl.position.set(sx, 3.8, -7.8);
            scene.add(pl);
        });
        const chand = glow("rgba(255,230,190,.9)", 9);
        chand.position.set(0, 11, -1);
        scene.add(chand);

        // the table: black lacquer rail, gold-leaf inlay and edge, lacquer apron, pedestal on a gold ring
        const { FW, FH } = BB_TABLE;
        const W = 10.4;
        const H = 5.5;
        const rail = new THREE.Mesh(
            stadiumRing(W, H, FW + 0.4, FH + 0.4, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 8, curveSegments: 72 }),
            new THREE.MeshPhysicalMaterial({ color: 0x0a0708, roughness: 0.42, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.3, envMapIntensity: 0.5 })
        );
        rail.castShadow = true;
        rail.receiveShadow = true;
        table.add(rail);
        const inlay = new THREE.Mesh(stadiumRing(FW + 0.4, FH + 0.4, FW, FH, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 72 }), gold);
        inlay.position.y = 0.2;
        inlay.receiveShadow = true;
        table.add(inlay);
        const edge = new THREE.Mesh(stadiumRing(W + 0.42, H + 0.42, W + 0.3, H + 0.3, { depth: 0.05, bevelEnabled: false, curveSegments: 72 }), gold);
        edge.position.y = -0.02;
        table.add(edge);
        const apronG = new THREE.ExtrudeGeometry(stadium(W - 0.3, H - 0.3), { depth: 0.75, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 60 });
        apronG.rotateX(-Math.PI / 2);
        const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x0a0708, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.8 });
        const apron = new THREE.Mesh(apronG, lacquer);
        apron.position.y = -0.75;
        apron.castShadow = true;
        table.add(apron);
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.9, 2.2, 48), lacquer);
        ped.position.y = -1.85;
        ped.castShadow = true;
        scene.add(ped);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.05, 12, 64), gold);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -2.9;
        scene.add(ring);
        const felt = new THREE.Mesh(feltGeometry(FW, FH), new THREE.MeshStandardMaterial({ map: feltTexture(), roughness: 1, metalness: 0, envMapIntensity: 0.25 }));
        felt.name = "felt";
        felt.position.y = 0.19;
        felt.receiveShadow = true;
        table.add(felt);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshPhysicalMaterial({ map: marble(), roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.9 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2.95;
        floor.receiveShadow = true;
        scene.add(floor);
    },
    feltTexture,
    // the room fills the view
    background: () => null,
    cardCanvas,
    chipEdge,
    chipFace,
    dealer() {
        const [dc, dx] = makeCanvas(256, 256);
        const dg = dx.createRadialGradient(110, 100, 10, 128, 128, 128);
        dg.addColorStop(0, "#F1DDB0");
        dg.addColorStop(1, "#B08A50");
        dx.fillStyle = dg;
        dx.fillRect(0, 0, 256, 256);
        dx.strokeStyle = "rgba(60,40,15,.55)";
        dx.lineWidth = 3;
        dx.beginPath();
        dx.arc(128, 128, 100, 0, Math.PI * 2);
        dx.stroke();
        dx.fillStyle = "rgba(50,32,12,.85)";
        dx.font = `italic 600 130px ${SERIF}`;
        dx.textAlign = "center";
        dx.textBaseline = "middle";
        dx.fillText("D", 128, 138);
        const brass = new THREE.MeshStandardMaterial({ color: 0xc9a56a, metalness: 1, roughness: 0.25 });
        return new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 48), [brass, new THREE.MeshStandardMaterial({ map: canvasTexture(dc), metalness: 0.85, roughness: 0.3 }), brass]);
    }
};
