import { Sets, Team as SDTeam } from "@pkmn/sets";
import { abilitiesOf, getItem, getMove, getSpecies } from "./dex";
import { SP_MAX, SP_TOTAL } from "./stats";
import { emptyStats, newId, STAT_IDS, type StatsTable, type TeamMember } from "./types";

/**
 * Champions pastes put Stat Points straight into the EVs line ("32 Atk / 32 Spe").
 * Anything that fits within 32 per stat and 66 total is read as SP as-is; otherwise
 * it's a classic EV spread, converted at 8 EVs ≈ 1 SP and trimmed to 66 from the lowest stats.
 */
function evsToSp(evs: Partial<StatsTable> | undefined): StatsTable {
  const sp = emptyStats();
  const raw = STAT_IDS.map((s) => evs?.[s] ?? 0);
  const isSp = raw.every((v) => v <= SP_MAX) && raw.reduce((a, v) => a + v, 0) <= SP_TOTAL;
  for (const s of STAT_IDS) sp[s] = isSp ? (evs?.[s] ?? 0) : Math.min(SP_MAX, Math.round((evs?.[s] ?? 0) / 8));
  let over = STAT_IDS.reduce((a, s) => a + sp[s], 0) - SP_TOTAL;
  const order = [...STAT_IDS].sort((a, b) => sp[a] - sp[b]);
  for (const s of order) {
    if (over <= 0) break;
    const cut = Math.min(sp[s], over);
    sp[s] -= cut;
    over -= cut;
  }
  return sp;
}

export interface ImportResult {
  members: TeamMember[];
  errors: string[];
}

export function importShowdown(text: string): ImportResult {
  const errors: string[] = [];
  const members: TeamMember[] = [];
  const parsed = SDTeam.import(text)?.team ?? [];
  if (!parsed.length) return { members, errors: ["Couldn't find any Pokémon in that paste."] };

  for (const set of parsed.slice(0, 6)) {
    const species = getSpecies(set.species ?? "");
    if (!species) {
      errors.push(`Unknown Pokémon "${set.species}".`);
      continue;
    }
    // A Mega forme in the paste means the base Pokémon holding its stone
    const base = species.isMega ? getSpecies(species.baseSpecies)! : species;
    const abilities = abilitiesOf(base);
    const ability = set.ability && abilities.includes(set.ability) ? set.ability : abilities[0];
    if (set.ability && ability !== set.ability) errors.push(`${base.name}: "${set.ability}" isn't a legal ability, using ${ability}.`);

    const item = set.item ? getItem(set.item) : undefined;
    if (set.item && !item) errors.push(`${base.name}: unknown item "${set.item}".`);

    const moves: string[] = [];
    for (const m of set.moves ?? []) {
      const move = getMove(m);
      if (move) moves.push(move.name);
      else errors.push(`${base.name}: unknown move "${m}".`);
    }

    members.push({
      id: newId(),
      species: base.name,
      item: item?.name ?? "",
      ability,
      nature: set.nature || "Serious",
      sp: evsToSp(set.evs),
      moves: moves.slice(0, 4),
    });
  }
  return { members, errors };
}

export function exportShowdown(members: TeamMember[]): string {
  return members
    .map((m) =>
      Sets.exportSet({
        species: m.species,
        item: m.item || undefined,
        ability: m.ability,
        nature: m.nature,
        level: 50,
        // Champions format: Stat Points go in the EVs line unchanged
        evs: m.sp,
        moves: m.moves,
      }),
    )
    .join("\n");
}
