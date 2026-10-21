import { abilitiesOf, getSpecies, megaFromItem, type Species } from "@/lib/dex";
import type { BattleMon } from "@/lib/coverage";
import { computeStats, speedBenchmarks } from "@/lib/stats";
import type { StatsTable, TeamMember } from "@/lib/types";
import type { Opponent } from "@/store/battle";

export interface MyMon extends BattleMon {
  member: TeamMember;
  species: Species;
  /** The forme in play (Mega if toggled). */
  forme: Species;
  isMega: boolean;
  stats: StatsTable;
}

export function toMyMon(member: TeamMember, megaOn: boolean): MyMon | undefined {
  const species = getSpecies(member.species);
  if (!species) return;
  const mega = megaOn ? megaFromItem(member.species, member.item) : undefined;
  const forme = mega ?? species;
  return {
    id: member.id,
    name: forme.name,
    types: [...forme.types],
    // a Mega always has its own fixed ability
    ability: mega ? abilitiesOf(mega)[0] : member.ability,
    moves: member.moves,
    member,
    species,
    forme,
    isMega: !!mega,
    stats: computeStats(forme.baseStats, member.sp, member.nature),
  };
}

export interface OppMon {
  opp: Opponent;
  species: Species;
  forme: Species;
  speed: ReturnType<typeof speedBenchmarks>;
}

export function toOppMon(opp: Opponent): OppMon | undefined {
  const species = getSpecies(opp.species);
  if (!species) return;
  const forme = getSpecies(opp.forme) ?? species;
  return { opp, species, forme, speed: speedBenchmarks(forme.baseStats.spe) };
}
