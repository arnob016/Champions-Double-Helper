// 12×12 pixel-art Mega Stone: a round stone with the DNA-like swirl.
// k outline · a stone · b swirl core · w swirl highlight · s shine
const ART = [
  "...kkkkkk...",
  "..kaaaaaak..",
  ".kaawwaasak.",
  "kaawbbwaaaak",
  "kaawbaabwaak",
  "kaaawbaabwak",
  "kawbaabwaaak",
  "kaawbaabwaak",
  "kaaawbbwaaak",
  ".kaaawwaaak.",
  "..kaaaaaak..",
  "...kkkkkk...",
];

const ON = { k: "#1a0b24", a: "#b43ad1", b: "#ffd84a", w: "#fff6c9", s: "#ffffff" };
const OFF = { k: "#0b0f1b", a: "#4a4f63", b: "#8a90a6", w: "#b6bccd", s: "#d3daea" };

export function MegaStoneIcon({ active, size = 20 }: { active: boolean; size?: number }) {
  const pal = active ? ON : OFF;
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden>
      {ART.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={pal[c as keyof typeof pal]} />)),
      )}
    </svg>
  );
}

/** Mega toggle that sits on a sprite's corner. `label` marks X/Y formes. */
export function MegaStoneButton({ active, onClick, label, title }: { active: boolean; onClick: () => void; label?: string; title: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`absolute -bottom-1 -right-1 z-10 flex items-center rounded-full border-2 p-px transition-transform hover:scale-110 active:scale-95 ${
        active ? "border-fuchsia-300 bg-fuchsia-950 shadow-[0_0_8px_2px_rgb(217_70_239/0.6)]" : "border-slate-600 bg-slate-900"
      }`}
    >
      <MegaStoneIcon active={active} size={18} />
      {label && <span className="pr-1 font-pixel text-[9px] font-bold leading-none text-fuchsia-200">{label}</span>}
    </button>
  );
}
