import { ImageResponse } from "next/og";
import { LOGO_PIXELS, LOGO_SIZE } from "@/lib/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the mark on the app's navy, with padding for rounded masks. */
export default function AppleIcon() {
  const px = 9;
  const offset = (size.width - LOGO_SIZE * px) / 2;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#1c2439" }}>
        {LOGO_PIXELS.map((p) => (
          <div
            key={`${p.x}-${p.y}`}
            style={{ position: "absolute", left: offset + p.x * px, top: offset + p.y * px, width: px, height: px, background: p.color }}
          />
        ))}
      </div>
    ),
    size,
  );
}
