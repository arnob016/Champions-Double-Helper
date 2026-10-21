import { Dex, toID, type Species, type Item, type Move, type TypeName } from "@pkmn/dex";

export const dex = Dex.forGen(9);

const HIDDEN_NONSTANDARD = new Set(["CAP", "Custom", "LGPE", "Gigantamax", "Unobtainable"]);

export function getSpecies(name: string): Species | undefined {
  const s = dex.species.get(name);
  return s?.exists ? s : undefined;
}

export function getMove(name: string): Move | undefined {
  const m = dex.moves.get(name);
  return m?.exists ? m : undefined;
}

export function getItem(name: string): Item | undefined {
  const i = dex.items.get(name);
  return i?.exists ? i : undefined;
}

/** Species a trainer can pick: no Megas or other battle-only formes, no CAP/G-Max/Totems. */
export const pickableSpecies: Species[] = [...dex.species.all()]
  .filter(
    (s) =>
      s.exists &&
      !s.isMega &&
      !s.battleOnly &&
      !s.name.endsWith("-Totem") &&
      !(s.isNonstandard && HIDDEN_NONSTANDARD.has(s.isNonstandard)),
  )
  .sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));

/** Held items: current-gen items plus every Mega Stone (Champions brings Megas back). */
export const pickableItems: Item[] = [...dex.items.all()]
  .filter((i) => i.exists && (!i.isNonstandard || i.megaStone))
  .sort((a, b) => a.name.localeCompare(b.name));

export const natures = [...dex.natures.all()].sort((a, b) => a.name.localeCompare(b.name));

export function abilitiesOf(species: Species): string[] {
  return Object.values(species.abilities).filter(Boolean) as string[];
}

export function getMegaFormes(species: Species): Species[] {
  const base = getSpecies(species.baseSpecies) ?? species;
  return (base.otherFormes ?? [])
    .map((n) => getSpecies(n))
    .filter((s): s is Species => !!s && s.isMega === true);
}

/** The Mega forme this member turns into with the held item, if any. */
export function megaFromItem(speciesName: string, itemName: string): Species | undefined {
  const item = itemName ? getItem(itemName) : undefined;
  const species = getSpecies(speciesName);
  if (!item?.megaStone || !species) return undefined;
  const target = item.megaStone[species.name] ?? item.megaStone[species.baseSpecies];
  return target ? getSpecies(target) : undefined;
}

export function spriteUrl(species: Species, set: "home-centered" | "gen5" = "home-centered") {
  const id = toID(species.baseSpecies) + (species.forme ? "-" + toID(species.forme) : "");
  return `https://play.pokemonshowdown.com/sprites/${set}/${id}.png`;
}

/** PokéAPI form IDs for Megas that Showdown has no gen5/HOME sprite for (Legends: Z-A Megas). */
const POKEAPI_IDS: Record<string, number> = {
  "Scolipede-Mega": 10288,
  "Scrafty-Mega": 10289,
  "Eelektross-Mega": 10290,
  "Pyroar-Mega": 10295,
  "Malamar-Mega": 10297,
  "Barbaracle-Mega": 10298,
  "Dragalge-Mega": 10299,
  "Zygarde-Mega": 10301,
  "Falinks-Mega": 10303,
  "Raichu-Mega-X": 10304,
  "Raichu-Mega-Y": 10305,
  "Staraptor-Mega": 10308,
  "Heatran-Mega": 10311,
  "Darkrai-Mega": 10312,
  "Magearna-Mega": 10317,
  "Zeraora-Mega": 10319,
};

/** Last-resort HOME render from PokéAPI, for formes missing from Showdown's sprite sets. */
export function pokeapiSpriteUrl(species: Species): string | undefined {
  const id = POKEAPI_IDS[species.name];
  return id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png` : undefined;
}

export type { Species, Item, Move, TypeName };
