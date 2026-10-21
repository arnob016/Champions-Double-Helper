import { TYPES } from "@/lib/typechart";
import type { TypeName } from "@/lib/dex";
import { TypeBadge } from "./TypeBadge";

const GROUPS: { label: string; test: (m: number) => boolean; tone: string }[] = [
  { label: "4×", test: (m) => m >= 4, tone: "text-red-400" },
  { label: "2×", test: (m) => m > 1 && m < 4, tone: "text-orange-300" },
  { label: "½×", test: (m) => m > 0.25 && m < 1, tone: "text-emerald-300" },
  { label: "¼×", test: (m) => m > 0 && m <= 0.25, tone: "text-emerald-400" },
  { label: "0×", test: (m) => m === 0, tone: "text-sky-300" },
];

/** Grouped weaknesses / resistances / immunities. Neutral types are omitted. `minimal` drops resistances. */
export function WeaknessChips({ profile, compact, minimal }: { profile: Record<TypeName, number>; compact?: boolean; minimal?: boolean }) {
  const groups = minimal ? GROUPS.filter((g) => g.label !== "½×" && g.label !== "¼×") : GROUPS;
  return (
    <div className="space-y-1">
      {groups.map((g) => {
        const types = TYPES.filter((t) => g.test(profile[t]));
        if (!types.length) return null;
        return (
          <div key={g.label} className="flex items-start gap-2">
            <span className={`w-6 shrink-0 pt-px text-xs font-bold ${g.tone}`}>{g.label}</span>
            <div className="flex flex-wrap gap-1">
              {types.map((t) => (
                <TypeBadge key={t} type={t} small={compact} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
