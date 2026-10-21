import { bestHit, type BattleMon } from "./coverage";
import { getMove, type TypeName } from "./dex";
import { defensiveMultiplier } from "./typechart";

/** Moves that shape a doubles game. Shown when an opponent can learn them. */
export const NOTABLE_MOVES = [
  "Fake Out",
  "Tailwind",
  "Trick Room",
  "Follow Me",
  "Rage Powder",
  "Spore",
  "Wide Guard",
  "Icy Wind",
  "Electroweb",
  "Helping Hand",
  "Parting Shot",
  "Will-O-Wisp",
  "Thunder Wave",
  "Taunt",
  "Encore",
  "Snarl",
  "Perish Song",
  "Ally Switch",
  "Sleep Powder",
  "Haze",
];

export const NOTABLE_ABILITIES: Record<string, string> = {
  Intimidate: "lowers your Attack on entry",
  Defiant: "Intimidate raises its Attack",
  Competitive: "Intimidate raises its Sp. Atk",
  Prankster: "priority status moves",
  "Inner Focus": "immune to Fake Out flinch and Intimidate",
  "Armor Tail": "blocks priority moves like Fake Out",
  "Queenly Majesty": "blocks priority moves like Fake Out",
  Dazzling: "blocks priority moves like Fake Out",
  "Psychic Surge": "Psychic Terrain blocks priority",
  "Good as Gold": "immune to status moves",
  "Unseen Fist": "hits through Protect",
  "Friend Guard": "partner takes 25% less damage",
  "Lightning Rod": "redirects Electric moves",
  "Storm Drain": "redirects Water moves",
  Drizzle: "sets Rain",
  Drought: "sets Sun",
  "Sand Stream": "sets Sand",
  "Snow Warning": "sets Snow",
  "Electric Surge": "sets Electric Terrain",
  "Grassy Surge": "sets Grassy Terrain",
  "Misty Surge": "sets Misty Terrain (blocks sleep)",
  "Swift Swim": "doubles Speed in Rain",
  Chlorophyll: "doubles Speed in Sun",
  "Sand Rush": "doubles Speed in Sand",
  "Slush Rush": "doubles Speed in Snow",
  Unburden: "doubles Speed after using its item",
  "Parental Bond": "hits twice",
  "Huge Power": "doubles Attack",
  "Pure Power": "doubles Attack",
  "Mold Breaker": "ignores your defensive abilities",
  Levitate: "immune to Ground",
  "Water Absorb": "immune to Water",
  "Volt Absorb": "immune to Electric",
  "Flash Fire": "immune to Fire",
  "Sap Sipper": "immune to Grass",
};

const FAKE_OUT_BLOCKERS = ["Inner Focus", "Armor Tail", "Queenly Majesty", "Dazzling", "Psychic Surge"];

export interface ThreatMon extends BattleMon {
  spe: number;
}

export interface ThreatOpp {
  types: TypeName[];
  abilities: string[];
}

export type ThreatStatus = "handled" | "risky" | "unanswered";

export function threatReport(mons: ThreatMon[], opp: ThreatOpp) {
  const rows = mons.map((m) => {
    const stab = Math.max(...opp.types.map((t) => defensiveMultiplier(t, m.types, m.ability)));
    const hit = bestHit(m, opp.types);
    return { mon: m, stab, hit };
  });
  const threatened = rows.filter((r) => r.stab > 1).sort((a, b) => b.stab - a.stab);
  const answers = rows.filter((r) => r.hit.mult >= 2 && r.stab <= 1);
  const checks = rows.filter((r) => r.hit.mult >= 2 && r.stab > 1);
  const status: ThreatStatus = answers.length ? "handled" : checks.length ? "risky" : "unanswered";

  const warnings: string[] = [];
  const intimidators = mons.filter((m) => m.ability === "Intimidate");
  const punish = opp.abilities.filter((a) => a === "Defiant" || a === "Competitive");
  if (intimidators.length && punish.length) warnings.push(`May have ${punish.join("/")}: careful with ${intimidators.map((m) => m.name).join(", ")}'s Intimidate`);
  const fakers = mons.filter((m) => m.moves.includes("Fake Out"));
  const blocker = opp.abilities.find((a) => FAKE_OUT_BLOCKERS.includes(a));
  if (fakers.length && blocker) warnings.push(`May have ${blocker}: ${fakers.map((m) => m.name).join(", ")}'s Fake Out can fail`);
  if (opp.abilities.includes("Good as Gold")) {
    const statusers = mons.filter((m) => m.moves.some((x) => getMove(x)?.category === "Status" && getMove(x)?.target !== "self" && getMove(x)?.target !== "allySide"));
    if (statusers.length) warnings.push(`Good as Gold blocks status moves from ${statusers.map((m) => m.name).join(", ")}`);
  }
  if (opp.abilities.includes("Mold Breaker")) {
    const relying = mons.filter((m) => ["Levitate", "Water Absorb", "Volt Absorb", "Flash Fire", "Sap Sipper", "Multiscale"].includes(m.ability));
    if (relying.length) warnings.push(`May have Mold Breaker: ignores ${relying.map((m) => `${m.name}'s ${m.ability}`).join(", ")}`);
  }

  return { threatened, answers, checks, status, warnings };
}
