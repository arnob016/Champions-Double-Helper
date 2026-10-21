import type { TypeName } from "@/lib/dex";

export const TYPE_COLORS: Record<string, string> = {
  Normal: "#9fa19f",
  Fire: "#e62829",
  Water: "#2980ef",
  Electric: "#fac000",
  Grass: "#3fa129",
  Ice: "#3dcef3",
  Fighting: "#ff8000",
  Poison: "#9141cb",
  Ground: "#915121",
  Flying: "#81b9ef",
  Psychic: "#ef4179",
  Bug: "#91a119",
  Rock: "#afa981",
  Ghost: "#704170",
  Dragon: "#5060e1",
  Dark: "#624d4e",
  Steel: "#60a1b8",
  Fairy: "#ef70ef",
};

export function TypeBadge({ type, small }: { type: TypeName | string; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm font-pixel uppercase leading-none text-white [text-shadow:1px_1px_0_rgb(0_0_0/0.55)] ${
        small ? "min-w-12 px-1 py-[3px] text-[9px]" : "min-w-16 px-2 py-1 text-[10px]"
      }`}
      style={{ backgroundColor: TYPE_COLORS[type] ?? "#555", boxShadow: "inset 0 -2px 0 rgb(0 0 0 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.25)" }}
    >
      {type}
    </span>
  );
}

export function TypeList({ types, small }: { types: readonly string[]; small?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {types.map((t) => (
        <TypeBadge key={t} type={t} small={small} />
      ))}
    </span>
  );
}
