import { getSpecies, pickableSpecies } from "./dex";
import { searchSpecies } from "./search";
import { importShowdown } from "./showdown";

const pickable = new Set(pickableSpecies.map((s) => s.name));
export const LIST_SEPARATORS = /[,/;|\n]/;

/** One typed name → a species: exact first ("Rotom-Wash"), Megas to their base, else fuzzy. */
export function resolveSpecies(token: string): string | undefined {
  const s = getSpecies(token);
  if (s) {
    const name = s.isMega ? s.baseSpecies : s.name;
    if (pickable.has(name)) return name;
  }
  return searchSpecies(token, 1)[0]?.name;
}

/**
 * Turn a typed or pasted list into species names. Accepts "incin, flutter, kanga",
 * "Team: A / B / C", one name per line, or a full Showdown team paste.
 */
export function parseOpponentList(text: string): string[] {
  if (/^\s*(Ability|EVs|IVs|Tera Type|Level):/im.test(text) || /^\s*- \S/m.test(text)) {
    return [...new Set(importShowdown(text).members.map((m) => m.species))];
  }
  const body = text.replace(/^[^,/;|\n]*team[^:]*:\s*/i, "");
  const names = body
    .split(LIST_SEPARATORS)
    .map((t) => t.replace(/\s*@.*$/, "").trim())
    .filter(Boolean)
    .map(resolveSpecies)
    .filter((n): n is string => !!n);
  return [...new Set(names)];
}
