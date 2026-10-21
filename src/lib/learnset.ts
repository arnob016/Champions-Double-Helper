import { toID } from "@pkmn/dex";
import { dex, getMove, getSpecies, type Move, type Species } from "./dex";

const cache = new Map<string, Promise<Move[]>>();

/** Every species whose learnset this one inherits: itself, its base forme, and all pre-evolutions. */
function lineage(species: Species): Species[] {
  const out = new Map<string, Species>();
  const visit = (s: Species | undefined) => {
    if (!s || out.has(s.id)) return;
    out.set(s.id, s);
    if (s.changesFrom) visit(getSpecies(s.changesFrom));
    if (s.baseSpecies !== s.name) visit(getSpecies(s.baseSpecies));
    if (s.prevo) visit(getSpecies(s.prevo));
  };
  visit(species);
  return [...out.values()];
}

/**
 * Moves the species can learn in any generation. With `currentOnly`, moves that
 * no longer exist in current games (Return, Hidden Power…) are dropped.
 */
export function getMovePool(speciesName: string, currentOnly = true): Promise<Move[]> {
  const key = `${toID(speciesName)}:${currentOnly}`;
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      const species = getSpecies(speciesName);
      if (!species) return [];
      const ids = new Set<string>();
      for (const s of lineage(species)) {
        const ls = await dex.learnsets.get(s.id);
        for (const id of Object.keys(ls?.learnset ?? {})) ids.add(id);
      }
      return [...ids]
        .map((id) => getMove(id))
        .filter((m): m is Move => !!m && (!currentOnly || !m.isNonstandard))
        .sort((a, b) => a.name.localeCompare(b.name));
    })();
    cache.set(key, p);
  }
  return p;
}
