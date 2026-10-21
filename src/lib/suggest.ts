import { bestHit, type BattleMon } from "./coverage";
import { defensiveMultiplier } from "./typechart";
import type { TypeName } from "./dex";

export interface SuggestMon extends BattleMon {
  spe: number;
}

export interface SuggestOpp {
  types: TypeName[];
  /** Their slowest and fastest possible speed at Lv50. */
  minSpe: number;
  maxSpe: number;
}

const offenseValue = (mult: number): number => (mult >= 4 ? 3 : mult >= 2 ? 2 : mult >= 1 ? 1 : mult > 0 ? 0.25 : 0);

/** How well this mon takes their best same-type hit: positive = safe, negative = threatened. */
function defenseValue(mon: SuggestMon, opp: SuggestOpp) {
  const worst = Math.max(...opp.types.map((t) => defensiveMultiplier(t, mon.types, mon.ability)));
  if (worst >= 4) return -2.5;
  if (worst >= 2) return -1.5;
  if (worst >= 1) return 0;
  if (worst > 0.25) return 0.5;
  if (worst > 0) return 0.75;
  return 1;
}

function speedValue(mon: SuggestMon, opp: SuggestOpp) {
  if (mon.spe > opp.maxSpe) return 0.5;
  if (mon.spe < opp.minSpe) return -0.25;
  return 0;
}

/**
 * Greedy pick of `count` mons. Offense counts once per opponent (the best answer you
 * bring), so picks spread out to cover different threats; defense and speed add up per mon.
 */
export function suggestPicks(mons: SuggestMon[], opps: SuggestOpp[], count = 4): string[] {
  if (!opps.length) return [];
  const off = mons.map((m) => opps.map((o) => offenseValue(bestHit(m, o.types).mult)));
  const solo = mons.map((m) => opps.reduce((a, o) => a + 0.5 * defenseValue(m, o) + speedValue(m, o), 0));

  const picked: number[] = [];
  const bestOff = opps.map(() => 0);
  while (picked.length < Math.min(count, mons.length)) {
    let best = -1;
    let bestGain = -Infinity;
    mons.forEach((_, i) => {
      if (picked.includes(i)) return;
      const coverageGain = opps.reduce((a, _o, j) => a + Math.max(0, off[i][j] - bestOff[j]), 0);
      // small raw-offense term so ties go to the harder hitter
      const gain = coverageGain + solo[i] + 0.1 * off[i].reduce((a, v) => a + v, 0);
      if (gain > bestGain) {
        bestGain = gain;
        best = i;
      }
    });
    picked.push(best);
    opps.forEach((_o, j) => (bestOff[j] = Math.max(bestOff[j], off[best][j])));
  }
  return picked.map((i) => mons[i].id);
}
