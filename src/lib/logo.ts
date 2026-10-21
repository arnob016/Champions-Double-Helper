/**
 * The Champions Doubles mark: two overlapping pixel orbs (your two leads),
 * blue behind and amber in front, each with a highlight. 16×16 pixels, generated
 * from circles so the icon, the header logo and the share image all match.
 */
export const LOGO_SIZE = 16;

export interface LogoPixel {
  x: number;
  y: number;
  color: string;
}

const OUTLINE = "#0b0f1b";
const ORBS = [
  { cx: 5.5, cy: 10, r: 5.4, fill: "#3d82ff", shade: "#2256c4", shine: "#c7dbff" },
  { cx: 10.5, cy: 6, r: 5.4, fill: "#ffc83d", shade: "#d9921c", shine: "#fff3c4" },
];

const inside = (x: number, y: number, o: (typeof ORBS)[number]) => (x + 0.5 - o.cx) ** 2 + (y + 0.5 - o.cy) ** 2 <= o.r ** 2;

function computePixels(): LogoPixel[] {
  const out: LogoPixel[] = [];
  for (let y = 0; y < LOGO_SIZE; y++)
    for (let x = 0; x < LOGO_SIZE; x++) {
      // the front orb wins where they overlap
      const orb = [...ORBS].reverse().find((o) => inside(x, y, o));
      if (!orb) continue;
      const edge = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].some(([nx, ny]) => !inside(nx, ny, orb));
      const dx = x + 0.5 - orb.cx;
      const dy = y + 0.5 - orb.cy;
      let color = orb.fill;
      if (edge) color = OUTLINE;
      else if (dx + dy > orb.r * 0.75) color = orb.shade;
      else if ((dx + 2) ** 2 + (dy + 2) ** 2 <= 1.6) color = orb.shine;
      out.push({ x, y, color });
    }
  return out;
}

export const LOGO_PIXELS = computePixels();
