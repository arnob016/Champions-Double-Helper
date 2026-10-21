import { bestHit, type BattleMon } from "./coverage";
import { getMove } from "./dex";
import { defensiveMultiplier, TYPES } from "./typechart";

export interface SynMon extends BattleMon {
  spe: number;
  item: string;
}

export interface Note {
  text: string;
  good: boolean;
  weight: number;
}

type Weather = "rain" | "sun" | "sand" | "snow";
type Terrain = "electric" | "psychic" | "grassy" | "misty";

const WEATHER_NAME: Record<Weather, string> = { rain: "Rain", sun: "Sun", sand: "Sand", snow: "Snow" };
const WEATHER_ABILITY: Record<string, Weather> = {
  Drizzle: "rain",
  "Primordial Sea": "rain",
  Drought: "sun",
  "Desolate Land": "sun",
  "Orichalcum Pulse": "sun",
  "Sand Stream": "sand",
  "Snow Warning": "snow",
};
const WEATHER_MOVE: Record<string, Weather> = { "Rain Dance": "rain", "Sunny Day": "sun", Sandstorm: "sand", Snowscape: "snow", "Chilly Reception": "snow" };
const WEATHER_ABILITY_USERS: Record<Weather, string[]> = {
  rain: ["Swift Swim", "Rain Dish", "Dry Skin", "Hydration"],
  sun: ["Chlorophyll", "Solar Power", "Protosynthesis", "Flower Gift", "Harvest", "Leaf Guard"],
  sand: ["Sand Rush", "Sand Force", "Sand Veil"],
  snow: ["Slush Rush", "Ice Body", "Snow Cloak"],
};
const WEATHER_MOVE_USERS: Record<Weather, string[]> = {
  rain: ["Thunder", "Hurricane", "Electro Shot", "Weather Ball"],
  sun: ["Solar Beam", "Solar Blade", "Weather Ball", "Growth", "Morning Sun", "Synthesis"],
  sand: ["Shore Up", "Weather Ball"],
  snow: ["Blizzard", "Aurora Veil", "Weather Ball"],
};

const TERRAIN_NAME: Record<Terrain, string> = { electric: "Electric", psychic: "Psychic", grassy: "Grassy", misty: "Misty" };
const TERRAIN_ABILITY: Record<string, Terrain> = {
  "Electric Surge": "electric",
  "Hadron Engine": "electric",
  "Psychic Surge": "psychic",
  "Grassy Surge": "grassy",
  "Misty Surge": "misty",
};
const TERRAIN_MOVE: Record<string, Terrain> = {
  "Electric Terrain": "electric",
  "Psychic Terrain": "psychic",
  "Grassy Terrain": "grassy",
  "Misty Terrain": "misty",
};
const TERRAIN_SEED: Record<string, Terrain> = {
  "Electric Seed": "electric",
  "Psychic Seed": "psychic",
  "Grassy Seed": "grassy",
  "Misty Seed": "misty",
};
const TERRAIN_USERS: Record<Terrain, string[]> = {
  electric: ["Surge Surfer", "Quark Drive", "Rising Voltage"],
  psychic: ["Expanding Force"],
  grassy: ["Grassy Glide"],
  misty: ["Misty Explosion"],
};

const SETUP = ["Swords Dance", "Nasty Plot", "Dragon Dance", "Calm Mind", "Quiver Dance", "Bulk Up", "Shell Smash", "Belly Drum", "Coil", "Victory Dance", "Tidy Up", "Trick Room", "Tailwind"];
const REDIRECT = ["Follow Me", "Rage Powder"];
const ABSORB_REDIRECT: Record<string, string> = { "Lightning Rod": "Electric", "Storm Drain": "Water" };

const has = (m: SynMon, move: string) => m.moves.includes(move);
const firstOf = (m: SynMon, list: string[]) => list.find((x) => m.moves.includes(x) || m.ability === x);

function weatherOf(m: SynMon): Weather | undefined {
  return WEATHER_ABILITY[m.ability] ?? m.moves.map((x) => WEATHER_MOVE[x]).find(Boolean);
}

function terrainOf(m: SynMon): Terrain | undefined {
  return TERRAIN_ABILITY[m.ability] ?? m.moves.map((x) => TERRAIN_MOVE[x]).find(Boolean);
}

const damaging = (m: SynMon, type: string) =>
  m.moves.filter((x) => {
    const mv = getMove(x);
    return mv && mv.category !== "Status" && mv.type === type;
  });

/** Why this mon likes the weather, if it does. */
function weatherBenefit(m: SynMon, w: Weather): string | undefined {
  const user = firstOf(m, [...WEATHER_ABILITY_USERS[w], ...WEATHER_MOVE_USERS[w]]);
  if (user) return user;
  if (w === "rain" && damaging(m, "Water").length) return "Water moves ×1.5";
  if (w === "sun" && damaging(m, "Fire").length) return "Fire moves ×1.5";
  if (w === "sand" && m.types.includes("Rock")) return "Rock-type SpD ×1.5";
  if (w === "snow" && m.types.includes("Ice")) return "Ice-type Def ×1.5";
}

function weatherHarm(m: SynMon, w: Weather): string | undefined {
  if (w === "rain" && damaging(m, "Fire").length) return "Fire moves are halved";
  if (w === "sun" && damaging(m, "Water").length) return "Water moves are halved";
  if ((w === "rain" || w === "sun") && has(m, w === "rain" ? "Solar Beam" : "Thunder")) return w === "rain" ? "Solar Beam needs to charge" : "Thunder is less accurate";
}

/** One-directional effects of `a` on its partner `b`. */
function oneWay(a: SynMon, b: SynMon): Note[] {
  const notes: Note[] = [];
  const add = (good: boolean, weight: number, text: string) => notes.push({ good, weight, text });

  // spread moves that also hit the partner
  for (const name of a.moves) {
    const mv = getMove(name);
    if (!mv || mv.category === "Status" || mv.target !== "allAdjacent") continue;
    const mult = b.ability === "Telepathy" ? 0 : defensiveMultiplier(mv.type, b.types, b.ability);
    if (mult === 0) add(true, 1.5, `${b.name} is immune to ${a.name}'s ${mv.name}`);
    else if (mult > 1) add(false, 2, `${a.name}'s ${mv.name} hits ${b.name} super-effectively`);
    else add(false, 1, `${a.name}'s ${mv.name} also hits ${b.name}`);
  }

  // weather and terrain
  const w = weatherOf(a);
  if (w) {
    const why = weatherBenefit(b, w);
    if (why) add(true, 2, `${WEATHER_NAME[w]} from ${a.name} powers ${b.name} (${why})`);
    const harm = weatherHarm(b, w);
    if (harm) add(false, 1, `${WEATHER_NAME[w]} from ${a.name}: ${b.name}'s ${harm}`);
  }
  const t = terrainOf(a);
  if (t) {
    if (TERRAIN_SEED[b.item] === t)
      add(true, b.ability === "Unburden" ? 2.5 : 1.5, `${TERRAIN_NAME[t]} Terrain triggers ${b.name}'s ${b.item}${b.ability === "Unburden" ? " → Unburden doubles its Speed" : ""}`);
    const user = firstOf(b, TERRAIN_USERS[t]);
    if (user) add(true, 1.5, `${TERRAIN_NAME[t]} Terrain from ${a.name} powers ${b.name}'s ${user}`);
    if (t === "psychic" && has(b, "Fake Out")) add(false, 1, `Psychic Terrain stops ${b.name}'s Fake Out on grounded foes`);
  }

  // speed control
  if (has(a, "Trick Room")) {
    if (b.spe <= 80) add(true, 1.5, `Trick Room lets ${b.name} (Spe ${b.spe}) move first`);
    else if (b.spe >= 120) add(false, 1.5, `Trick Room makes ${b.name} (Spe ${b.spe}) move last`);
    if (has(b, "Tailwind")) add(false, 1, `${a.name}'s Trick Room and ${b.name}'s Tailwind work against each other`);
  }
  if (has(a, "Tailwind") && !has(a, "Trick Room") && b.spe >= 60) add(true, 1, `${a.name}'s Tailwind doubles ${b.name}'s Speed (${b.spe} → ${b.spe * 2})`);

  // support moves
  const setup = SETUP.find((x) => has(b, x));
  if (has(a, "Fake Out") && setup) add(true, 1.5, `${a.name}'s Fake Out buys ${b.name} a free ${setup}`);
  const redirect = REDIRECT.find((x) => has(a, x));
  if (redirect && setup) add(true, 1.5, `${a.name}'s ${redirect} draws attacks while ${b.name} uses ${setup}`);
  if (has(a, "Helping Hand") && b.moves.some((x) => getMove(x)?.category !== "Status")) add(true, 0.5, `${a.name}'s Helping Hand boosts ${b.name}'s attacks ×1.5`);
  if (has(a, "Pollen Puff")) add(true, 0.5, `${a.name} can heal ${b.name} with Pollen Puff`);
  if (a.ability === "Friend Guard") add(true, 1, `Friend Guard cuts damage to ${b.name} by 25%`);

  // redirecting abilities soak up a type the partner is weak to
  const pulled = ABSORB_REDIRECT[a.ability];
  if (pulled && defensiveMultiplier(pulled as never, b.types, b.ability) > 1)
    add(true, 1, `${a.name}'s ${a.ability} pulls ${pulled} attacks away from ${b.name}`);

  // defensive complement: a resists what b fears
  const covered = TYPES.filter((type) => defensiveMultiplier(type, b.types, b.ability) > 1 && defensiveMultiplier(type, a.types, a.ability) < 1);
  if (covered.length) add(true, Math.min(2, covered.length * 0.5), `${a.name} resists ${b.name}'s weaknesses: ${covered.join(", ")}`);

  return notes;
}

export interface PairReport<T extends SynMon = SynMon> {
  a: T;
  b: T;
  score: number;
  shared: string[];
  notes: Note[];
}

export function analyzePair<T extends SynMon>(a: T, b: T): PairReport<T> {
  const shared = TYPES.filter((t) => defensiveMultiplier(t, a.types, a.ability) > 1 && defensiveMultiplier(t, b.types, b.ability) > 1);
  const notes = [...oneWay(a, b), ...oneWay(b, a)];
  if (has(a, "Wide Guard") || has(b, "Wide Guard")) notes.push({ good: true, weight: 0.5, text: `Wide Guard blocks spread moves for both` });
  if (shared.length) notes.push({ good: false, weight: shared.length, text: `Both weak to ${shared.join(", ")}` });
  const score = notes.reduce((s, n) => s + (n.good ? n.weight : -n.weight), 0);
  return { a, b, score, shared, notes: notes.sort((x, y) => Number(y.good) - Number(x.good) || y.weight - x.weight) };
}

const offenseValue = (mult: number): number => (mult >= 4 ? 3 : mult >= 2 ? 2 : mult >= 1 ? 1 : mult > 0 ? 0.25 : 0);

/** Every pair, best first. With opponents known, pairs that can hit their team hard rank higher. */
export function rankPairs<T extends SynMon>(mons: T[], oppTypes: string[][] = []): (PairReport<T> & { vsOpp: number })[] {
  const out: (PairReport<T> & { vsOpp: number })[] = [];
  for (let i = 0; i < mons.length; i++)
    for (let j = i + 1; j < mons.length; j++) {
      const r = analyzePair(mons[i], mons[j]);
      const vsOpp = oppTypes.reduce(
        (s, types) => s + Math.max(offenseValue(bestHit(mons[i], types as never).mult), offenseValue(bestHit(mons[j], types as never).mult)),
        0,
      );
      out.push({ ...r, vsOpp, score: r.score + 0.6 * vsOpp });
    }
  return out.sort((x, y) => y.score - x.score);
}

/** Problems that involve the whole selection rather than one pair. */
export function teamNotes(mons: SynMon[]): Note[] {
  const notes: Note[] = [];
  const weathers = new Set(mons.map(weatherOf).filter(Boolean));
  const terrains = new Set(mons.map(terrainOf).filter(Boolean));
  for (const m of mons) {
    const seed = TERRAIN_SEED[m.item];
    if (seed && !terrains.has(seed))
      notes.push({ good: false, weight: 2, text: `${m.name}'s ${m.item} won't activate: none of these picks sets ${TERRAIN_NAME[seed]} Terrain` });
    for (const w of Object.keys(WEATHER_ABILITY_USERS) as Weather[]) {
      const user = WEATHER_ABILITY_USERS[w].find((a) => a === m.ability) ?? (w === "rain" && has(m, "Electro Shot") ? "Electro Shot" : undefined);
      if (user && !weathers.has(w)) notes.push({ good: false, weight: 1, text: `${m.name}'s ${user} wants ${WEATHER_NAME[w]}, but none of these picks sets it` });
    }
  }
  if (weathers.size > 1) notes.push({ good: false, weight: 1, text: `Weather clash: these picks set ${[...weathers].map((w) => WEATHER_NAME[w!]).join(" and ")}` });
  return notes;
}
