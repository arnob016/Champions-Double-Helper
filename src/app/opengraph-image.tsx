import { ImageResponse } from "next/og";
import { LOGO_PIXELS, LOGO_SIZE } from "@/lib/logo";

export const alt = "Champions Doubles: win team preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TYPES: [string, string][] = [
  ["ELECTRIC", "#fac000"],
  ["WATER", "#2980ef"],
  ["FIRE", "#e62829"],
  ["GRASS", "#3fa129"],
  ["DRAGON", "#5060e1"],
  ["FAIRY", "#ef70ef"],
];

/** Link-preview card used when the site is shared. */
export default function OpengraphImage() {
  const px = 14;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 80px",
          background: "radial-gradient(ellipse at 75% 25%, #3a2a8f 0%, #131a2b 55%, #0b0f1b 100%)",
          color: "#e9edf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", position: "relative", width: LOGO_SIZE * px, height: LOGO_SIZE * px, flexShrink: 0 }}>
          {LOGO_PIXELS.map((p) => (
            <div key={`${p.x}-${p.y}`} style={{ position: "absolute", left: p.x * px, top: p.y * px, width: px, height: px, background: p.color }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 5, color: "#6aa1ff", fontWeight: 700 }}>POKÉMON CHAMPIONS · VGC DOUBLES</div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, marginTop: 16 }}>Champions Doubles</div>
          <div style={{ fontSize: 46, fontWeight: 700, color: "#ffd84a", marginTop: 12 }}>Win team preview.</div>
          <div style={{ display: "flex", gap: 10, marginTop: 36 }}>
            {TYPES.map(([t, c]) => (
              <div key={t} style={{ background: c, color: "white", fontSize: 22, fontWeight: 800, padding: "6px 14px", borderRadius: 4 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
