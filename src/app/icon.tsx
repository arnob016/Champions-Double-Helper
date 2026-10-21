import { ImageResponse } from "next/og";
import { LOGO_PIXELS, LOGO_SIZE } from "@/lib/logo";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Browser-tab favicon: the pixel mark, 4 device pixels per art pixel. */
export default function Icon() {
  const px = size.width / LOGO_SIZE;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        {LOGO_PIXELS.map((p) => (
          <div key={`${p.x}-${p.y}`} style={{ position: "absolute", left: p.x * px, top: p.y * px, width: px, height: px, background: p.color }} />
        ))}
      </div>
    ),
    size,
  );
}
