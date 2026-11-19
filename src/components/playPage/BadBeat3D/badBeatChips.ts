/**
 * Bad Beat's "Broadcast" chip (Dzeezbtc/ui#36): the textures the 3D table
 * wraps round each chip, in Bad Beat's own look. A graphite chip whose rim
 * carries six slanted colour stripes (like the italic tags), with a band of
 * slanted colour segments round the face and a colour core crossed by the
 * Bad Beat slash. Nothing here is the Flagship's.
 */

const hex = (c: number) => "#" + c.toString(16).padStart(6, "0");
const GRAPHITE = "#15181d";
/** A pale chip colour takes a graphite slash; a strong one a white slash. */
const isLight = (c: number) => ((c >> 16) & 255) * 0.299 + ((c >> 8) & 255) * 0.587 + (c & 255) * 0.114 > 170;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return [c, c.getContext("2d")!];
}

/** The rim, wrapped once round the chip (256 × 24): graphite with six slanted colour stripes. */
export function chipEdge(color: number): HTMLCanvasElement {
    const [c, x] = canvas(256, 24);
    x.fillStyle = GRAPHITE;
    x.fillRect(0, 0, 256, 24);
    x.fillStyle = hex(color);
    for (let i = 0; i < 6; i++) {
        const s = i * (256 / 6);
        x.beginPath();
        x.moveTo(s + 8, 0);
        x.lineTo(s + 30, 0);
        x.lineTo(s + 22, 24);
        x.lineTo(s, 24);
        x.closePath();
        x.fill();
    }
    return c;
}

/** The top and bottom faces (a 256 square; the cylinder's cap maps its inscribed circle). */
export function chipFace(color: number): HTMLCanvasElement {
    const [c, x] = canvas(256, 256);
    const col = hex(color);
    x.fillStyle = GRAPHITE;
    x.fillRect(0, 0, 256, 256);
    // the band of slanted colour segments round the edge
    x.beginPath();
    x.setLineDash([34, 14]);
    x.lineWidth = 26;
    x.strokeStyle = col;
    x.arc(128, 128, 108, 0, Math.PI * 2);
    x.stroke();
    x.setLineDash([]);
    // the colour core with a white pin-line
    x.beginPath();
    x.fillStyle = col;
    x.arc(128, 128, 58, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.lineWidth = 4;
    x.strokeStyle = "rgba(255,255,255,.9)";
    x.arc(128, 128, 58, 0, Math.PI * 2);
    x.stroke();
    // the slanted Bad Beat slash across the core
    x.save();
    x.translate(128, 128);
    x.transform(1, 0, -0.32, 1, 0, 0);
    x.fillStyle = isLight(color) ? "rgba(21,24,29,.85)" : "rgba(255,255,255,.9)";
    x.fillRect(-10, -36, 20, 72);
    x.restore();
    return c;
}
