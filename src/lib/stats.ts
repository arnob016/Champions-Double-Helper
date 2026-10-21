import type { StatID, StatsTable } from "./types";
import { STAT_IDS } from "./types";
import { dex } from "./dex";

export const LEVEL = 50;
export const IV = 31;
export const SP_TOTAL = 66;
export const SP_MAX = 32;

/**
 * Pokémon Champions stat formula: fixed Lv50, 31 IVs, and each Stat Point adds
 * exactly one point to the stat before the nature multiplier.
 */
export function calcStat(stat: StatID, base: number, sp: number, natureMod = 1): number {
  const core = Math.floor(((2 * base + IV) * LEVEL) / 100);
  if (stat === "hp") return base === 1 ? 1 : core + LEVEL + 10 + sp;
  return Math.floor((core + 5 + sp) * natureMod);
}

export function natureMod(natureName: string, stat: StatID): number {
  const n = dex.natures.get(natureName);
  if (!n?.exists) return 1;
  if (n.plus === stat && n.minus !== stat) return 1.1;
  if (n.minus === stat && n.plus !== stat) return 0.9;
  return 1;
}

export function computeStats(base: StatsTable, sp: StatsTable, nature: string): StatsTable {
  const out = {} as StatsTable;
  for (const s of STAT_IDS) out[s] = calcStat(s, base[s], sp[s] ?? 0, natureMod(nature, s));
  return out;
}

export const spUsed = (sp: StatsTable) => STAT_IDS.reduce((sum, s) => sum + (sp[s] ?? 0), 0);

/** Clamp one stat's SP so the per-stat cap and the 66 total both hold. */
export function setSp(sp: StatsTable, stat: StatID, value: number): StatsTable {
  const others = spUsed(sp) - (sp[stat] ?? 0);
  const v = Math.max(0, Math.min(SP_MAX, SP_TOTAL - others, Math.round(value) || 0));
  return { ...sp, [stat]: v };
}

/** Speed benchmarks for an opponent whose spread is unknown. */
export function speedBenchmarks(baseSpe: number) {
  const neutralMax = calcStat("spe", baseSpe, SP_MAX, 1);
  const plusMax = calcStat("spe", baseSpe, SP_MAX, 1.1);
  return {
    min: calcStat("spe", baseSpe, 0, 0.9),
    neutral: calcStat("spe", baseSpe, 0, 1),
    neutralMax,
    plusMax,
    scarf: Math.floor(plusMax * 1.5),
  };
}
