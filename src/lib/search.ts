import Fuse from "fuse.js";
import { pickableSpecies, type Species } from "./dex";

let fuse: Fuse<Species> | undefined;

/** Fuzzy species search: "garch" → Garchomp, "rotom w" → Rotom-Wash, typos OK. */
export function searchSpecies(query: string, limit = 40): Species[] {
  fuse ??= new Fuse(pickableSpecies, { keys: ["name"], threshold: 0.35, ignoreLocation: true });
  return fuse.search(query, { limit }).map((r) => r.item);
}
