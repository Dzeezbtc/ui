import * as THREE from "three";
import { BB_TABLE } from "../../../../utils/badBeatScene";
import { cardFace } from "../../../../utils/cardFace";
import { chipEdge, chipFace } from "../badBeatChips";
import { canvasTexture, feltGeometry, grain, makeCanvas, roundRect, stadium, stadiumPath, stadiumRing, type TableFrame, type ThreeTableLook } from "../look";

const FONT = '"Barlow Condensed", ui-sans-serif, system-ui, sans-serif';
/** Card ranks: the full-width cut, so a Q never reads as a 0. */
const RANK_FONT = '"Barlow", ui-sans-serif, system-ui, sans-serif';

/** The felt: radial steel-blue, grain, a crimson pin-line, the dashed betting line and BAD BEAT. */
function feltTexture(): THREE.CanvasTexture {
    const W = 2200;
    const H = 1000;
    const [c, x] = makeCanvas(W, H);
    const g = x.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, "#25404F");
    g.addColorStop(1, "#0E1820");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    grain(x, W, H, 16);
    x.strokeStyle = "rgba(255,45,85,.75)";
    x.lineWidth = 5;
    stadiumPath(x, W, H, 16);
    x.stroke();
    x.setLineDash([18, 16]);
    x.strokeStyle = "rgba(255,255,255,.13)";
    x.lineWidth = 4;
    stadiumPath(x, W, H, 150);
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

/** A card face ("AS") or the crimson hatched "BB" back ("back"), drawn at twice the size so it stays sharp. */
function cardCanvas(code: string): HTMLCanvasElement {
    const [c, x] = makeCanvas(512, 716);
    x.scale(2, 2);
    const face = code === "back" ? null : cardFace(code);
    roundRect(x, 0, 256, 358, 26);
    if (!face) {
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
        x.fillStyle = "#FFFFFF";
        x.fill();
        x.lineWidth = 3;
        x.strokeStyle = "rgba(10,12,15,.18)";
        x.stroke();
        // a big heavy rank, a big suit under it, a bigger one in the corner
        x.fillStyle = face.red ? "#E0102F" : "#0A0C0F";
        x.font = `800 ${face.rank === "10" ? 112 : 132}px ${RANK_FONT}`;
        x.textBaseline = "top";
        x.fillText(face.rank, 18, 10);
        x.font = "96px serif";
        x.fillText(face.suit, 22, 136);
        x.font = "170px serif";
        x.textAlign = "right";
        x.textBaseline = "bottom";
        x.fillText(face.suit, 244, 352);
    }
    return c;
}

/**
 * Bad Beat (Dzeezbtc/ui#36), from the concept's initEngine
 * (design/concepts/09-bad-beat): a thick moulded graphite rail, the lit
 * steel-blue felt with BAD BEAT, spot + crimson rim + ice fill lights, a soft
 * shadow on a dark radial room, crimson "BB" backs, Broadcast chips and a
 * white D disc.
 */
export const badBeatLook: ThreeTableLook = {
    clearColor: 0x0a0c0f,
    exposure: 1.05,
    chipColors: [0xf5c542, 0x2ee59d, 0x9fd8ff, 0xff2d55, 0xeef1f5],
    fonts: [`italic 900 64px ${FONT}`, `800 64px ${RANK_FONT}`],
    build({ scene, table }) {
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

        const { W, H, FW, FH } = BB_TABLE;
        const rail = new THREE.Mesh(
            stadiumRing(W, H, FW, FH, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.16, bevelSegments: 6, curveSegments: 64 }),
            new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: 0.78, metalness: 0.05 })
        );
        rail.castShadow = true;
        rail.receiveShadow = true;
        table.add(rail);
        const baseG = new THREE.ExtrudeGeometry(stadium(W - 0.6, H - 0.6), { depth: 0.9, bevelEnabled: false, curveSegments: 48 });
        baseG.rotateX(-Math.PI / 2);
        const base = new THREE.Mesh(baseG, new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.8 }));
        base.position.y = -0.9;
        base.castShadow = true;
        table.add(base);
        const felt = new THREE.Mesh(feltGeometry(FW, FH), new THREE.MeshStandardMaterial({ map: feltTexture(), roughness: 0.95, metalness: 0 }));
        felt.name = "felt";
        felt.position.y = 0.2;
        felt.receiveShadow = true;
        table.add(felt);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.55 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.9;
        floor.receiveShadow = true;
        scene.add(floor);
    },
    feltTexture,
    /** The concept's room: a radial glow behind the table, centred on it. */
    background(frame: TableFrame) {
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
        return canvasTexture(c);
    },
    cardCanvas,
    chipEdge,
    chipFace,
    dealer() {
        const [dc, dx] = makeCanvas(128, 128);
        dx.fillStyle = "#f4f6f8";
        dx.fillRect(0, 0, 128, 128);
        dx.fillStyle = "#0A0C0F";
        dx.font = `italic 900 84px ${FONT}`;
        dx.textAlign = "center";
        dx.textBaseline = "middle";
        dx.fillText("D", 64, 70);
        return new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 40), [
            new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.4 }),
            new THREE.MeshStandardMaterial({ map: canvasTexture(dc), roughness: 0.35 }),
            new THREE.MeshStandardMaterial({ color: 0xdfe3e8 })
        ]);
    }
};
