import { dex, getMove, type TypeName } from "./dex";

export const TYPES: TypeName[] = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
];

// Showdown's damageTaken codes: 0 neutral, 1 weak, 2 resist, 3 immune
const CODE_MULT = [1, 2, 0.5, 0];

export function effectiveness(attack: TypeName, defTypes: readonly TypeName[]): number {
  let mult = 1;
  for (const t of defTypes) {
    const code = dex.types.get(t)?.damageTaken[attack] ?? 0;
    mult *= CODE_MULT[code] ?? 1;
  }
  return mult;
}

/** Defensive abilities that change how much a type hurts the holder. */
const DEFENSIVE_ABILITIES: Record<string, Partial<Record<TypeName, number>>> = {
  Levitate: { Ground: 0 },
  "Earth Eater": { Ground: 0 },
  "Flash Fire": { Fire: 0 },
  "Well-Baked Body": { Fire: 0 },
  "Water Absorb": { Water: 0 },
  "Storm Drain": { Water: 0 },
  "Dry Skin": { Water: 0, Fire: 1.25 },
  "Volt Absorb": { Electric: 0 },
  "Lightning Rod": { Electric: 0 },
  "Motor Drive": { Electric: 0 },
  "Sap Sipper": { Grass: 0 },
  "Thick Fat": { Fire: 0.5, Ice: 0.5 },
  Heatproof: { Fire: 0.5 },
  "Water Bubble": { Fire: 0.5 },
  "Purifying Salt": { Ghost: 0.5 },
  Fluffy: { Fire: 2 },
};

export function defensiveMultiplier(attack: TypeName, defTypes: readonly TypeName[], ability?: string) {
  let mult = effectiveness(attack, defTypes);
  if (ability === "Wonder Guard" && mult <= 1) return 0;
  const mod = ability ? DEFENSIVE_ABILITIES[ability]?.[attack] : undefined;
  if (mod !== undefined) mult *= mod;
  if (mult > 1 && (ability === "Filter" || ability === "Solid Rock" || ability === "Prism Armor")) mult *= 0.75;
  return mult;
}

export function defensiveProfile(defTypes: readonly TypeName[], ability?: string): Record<TypeName, number> {
  const out = {} as Record<TypeName, number>;
  for (const t of TYPES) out[t] = defensiveMultiplier(t, defTypes, ability);
  return out;
}

const ATE_ABILITIES: Record<string, TypeName> = {
  Pixilate: "Fairy",
  Aerilate: "Flying",
  Refrigerate: "Ice",
  Galvanize: "Electric",
};

/** Best multiplier one damaging move gets against a defender's types. */
export function moveVsTypes(moveName: string, defTypes: readonly TypeName[], ability?: string): number | undefined {
  const move = getMove(moveName);
  if (!move || move.category === "Status") return undefined;
  // fixed-damage moves (Seismic Toss etc.) ignore type matchups beyond immunity
  if (!move.basePower && move.damage) return undefined;

  let type = move.type as TypeName;
  if (type === "Normal" && ability && ATE_ABILITIES[ability]) type = ATE_ABILITIES[ability];

  let mult = effectiveness(type, defTypes);
  if (move.id === "freezedry" && defTypes.includes("Water")) mult *= 4; // 0.5 → 2 per Water type
  if (move.id === "flyingpress") mult *= effectiveness("Flying", defTypes);
  if (move.id === "thousandarrows" && defTypes.includes("Flying")) mult = effectiveness("Ground", defTypes.filter((t) => t !== "Flying"));
  if ((ability === "Scrappy" || ability === "Mind's Eye") && (type === "Normal" || type === "Fighting") && defTypes.includes("Ghost"))
    mult = effectiveness(type, defTypes.filter((t) => t !== "Ghost"));
  if (ability === "Tinted Lens" && mult > 0 && mult < 1) mult *= 2;
  return mult;
}

export function multLabel(m: number) {
  if (m === 0) return "0";
  if (m === 0.25) return "¼";
  if (m === 0.5) return "½";
  return String(Math.round(m * 100) / 100);
}
