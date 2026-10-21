import { LOGO_PIXELS, LOGO_SIZE } from "@/lib/logo";

/** The pixel mark, crisp at any size. */
export function Logo({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${LOGO_SIZE} ${LOGO_SIZE}`}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className="shrink-0"
    >
      {title && <title>{title}</title>}
      {LOGO_PIXELS.map((p) => (
        <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={1} height={1} fill={p.color} />
      ))}
    </svg>
  );
}
