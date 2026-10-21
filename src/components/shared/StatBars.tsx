import { STAT_IDS, STAT_LABELS, type StatsTable } from "@/lib/types";

function barColor(v: number) {
  if (v < 60) return "bg-red-500";
  if (v < 90) return "bg-orange-400";
  if (v < 110) return "bg-yellow-400";
  if (v < 130) return "bg-lime-400";
  return "bg-emerald-400";
}

/** Base stat bars. `compare` shows the change from another stat line (e.g. Mega vs base). */
export function StatBars({ stats, compare, max = 200 }: { stats: StatsTable; compare?: StatsTable; max?: number }) {
  const total = STAT_IDS.reduce((a, s) => a + stats[s], 0);
  const compareTotal = compare ? STAT_IDS.reduce((a, s) => a + compare[s], 0) : 0;
  return (
    <div className="space-y-1 text-xs">
      {STAT_IDS.map((s) => {
        const diff = compare ? stats[s] - compare[s] : 0;
        return (
          <div key={s} className="flex items-center gap-2">
            <span className="w-8 text-slate-400">{STAT_LABELS[s]}</span>
            <span className="w-8 text-right font-mono tabular-nums">{stats[s]}</span>
            <div className="meter h-2.5 flex-1 overflow-hidden bg-slate-800">
              <div data-anim="bar" className={`h-full origin-left ${barColor(stats[s])}`} style={{ width: `${Math.min(100, (stats[s] / max) * 100)}%` }} />
            </div>
            {compare && (
              <span className={`w-8 text-right font-mono tabular-nums ${diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-slate-600"}`}>
                {diff > 0 ? `+${diff}` : diff || "–"}
              </span>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2 border-t border-slate-800 pt-1">
        <span className="w-8 text-slate-400">BST</span>
        <span className="w-8 text-right font-mono tabular-nums font-semibold">{total}</span>
        {compare && <span className="ml-auto font-mono text-emerald-400">+{total - compareTotal}</span>}
      </div>
    </div>
  );
}

/** Final Lv50 stats, as a compact row. */
export function StatLine({ stats }: { stats: StatsTable }) {
  return (
    <div className="grid grid-cols-6 gap-0.5 text-center text-[10px]">
      {STAT_IDS.map((s) => (
        <div key={s} className="rounded bg-slate-800/70 py-0.5">
          <div className="font-pixel text-[8px] uppercase text-slate-500">{STAT_LABELS[s]}</div>
          <div className="font-mono font-semibold tabular-nums">{stats[s]}</div>
        </div>
      ))}
    </div>
  );
}
