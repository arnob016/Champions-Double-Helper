import { defensiveMultiplier, moveVsTypes, TYPES } from "./typechart";
import type { TypeName } from "./dex";

/** A Pokémon in battle terms: the forme actually on the field (base or Mega). */
export interface BattleMon {
  id: string;
  name: string;
  types: TypeName[];
  ability: string;
  moves: string[];
}

export interface OffenseHit {
  mult: number;
  by: { mon: string; move: string }[];
}

/** Best hit this mon can land on the given types, and with which moves. */
export function bestHit(mon: BattleMon, defTypes: readonly TypeName[]): { mult: number; moves: string[] } {
  let best = -1;
  let moves: string[] = [];
  for (const m of mon.moves) {
    const mult = moveVsTypes(m, defTypes, mon.ability);
    if (mult === undefined) continue;
    if (mult > best) {
      best = mult;
      moves = [m];
    } else if (mult === best) moves.push(m);
  }
  return { mult: best, moves };
}

/** For each single defending type: the team's best multiplier and who provides it. */
export function offensiveCoverage(mons: BattleMon[], targets: readonly TypeName[][] = TYPES.map((t) => [t])) {
  return targets.map((defTypes) => {
    const hit: OffenseHit = { mult: -1, by: [] };
    for (const mon of mons) {
      const { mult, moves } = bestHit(mon, defTypes);
      if (mult < 0) continue;
      if (mult > hit.mult) {
        hit.mult = mult;
        hit.by = moves.map((move) => ({ mon: mon.name, move }));
      } else if (mult === hit.mult) hit.by.push(...moves.map((move) => ({ mon: mon.name, move })));
    }
    return { defTypes, ...hit };
  });
}

/** Rows: every attacking type. Cells: how much it hurts each mon. */
export function defensiveMatrix(mons: BattleMon[]) {
  return TYPES.map((attack) => {
    const cells = mons.map((m) => defensiveMultiplier(attack, m.types, m.ability));
    return {
      attack,
      cells,
      weak: cells.filter((c) => c > 1).length,
      resist: cells.filter((c) => c > 0 && c < 1).length,
      immune: cells.filter((c) => c === 0).length,
    };
  });
}
