import { describe, expect, it } from "vitest";
import { calcStat, computeStats, setSp, speedBenchmarks } from "./stats";
import { defensiveMultiplier, effectiveness, moveVsTypes } from "./typechart";
import { defensiveMatrix, offensiveCoverage } from "./coverage";
import { getMegaFormes, getSpecies, megaFromItem } from "./dex";
import { exportShowdown, importShowdown } from "./showdown";
import { emptyStats } from "./types";
import { parseOpponentList } from "./opponents";
import { suggestPicks } from "./suggest";
import { analyzePair, rankPairs, teamNotes } from "./synergy";
import { threatReport } from "./threats";

describe("opponent list parsing", () => {
  it("handles commas, slashes, prefixes, typos and duplicates", () => {
    expect(parseOpponentList("incineroar, flutter mane, rotom-wash")).toEqual(["Incineroar", "Flutter Mane", "Rotom-Wash"]);
    expect(parseOpponentList("Opponent's team: Garchomp / Gholdengo / Garchomp")).toEqual(["Garchomp", "Gholdengo"]);
    expect(parseOpponentList("Charizard-Mega-Y\nAmoongus @ Rocky Helmet")).toEqual(["Charizard", "Amoonguss"]);
  });

  it("reads a full Showdown paste", () => {
    expect(parseOpponentList("Pelipper @ Damp Rock\nAbility: Drizzle\n- Hurricane\n\nArchaludon\nAbility: Stamina\n- Snarl")).toEqual([
      "Pelipper",
      "Archaludon",
    ]);
  });
});

describe("synergy", () => {
  const m = (name: string, types: string[], ability: string, moves: string[], spe = 100, item = "") => ({
    id: name, name, types: types as never, ability, moves, spe, item,
  });
  const pelipper = m("Pelipper", ["Water", "Flying"], "Drizzle", ["Weather Ball", "Hurricane", "Wide Guard", "Helping Hand"], 85);
  const bascu = m("Basculegion-F", ["Water", "Ghost"], "Swift Swim", ["Muddy Water", "Shadow Ball", "Ice Beam", "Protect"], 98);
  const archa = m("Archaludon", ["Steel", "Dragon"], "Stamina", ["Electro Shot", "Dragon Pulse", "Snarl", "Protect"], 105);
  const sneasler = m("Sneasler", ["Fighting", "Poison"], "Unburden", ["Poison Jab", "Close Combat", "Swords Dance", "Protect"], 140, "Electric Seed");
  const chomp = m("Garchomp", ["Dragon", "Ground"], "Rough Skin", ["Earthquake", "Dragon Claw"], 122);
  const rotom = m("Rotom-Wash", ["Electric", "Water"], "Levitate", ["Hydro Pump"], 106);
  const incin = m("Incineroar", ["Fire", "Dark"], "Intimidate", ["Fake Out", "Flare Blitz"], 80);

  it("spots weather setters and abusers", () => {
    const texts = (a: typeof pelipper, b: typeof pelipper) => analyzePair(a, b).notes.map((n) => n.text);
    expect(texts(pelipper, bascu).some((t) => t.includes("Rain from Pelipper powers Basculegion-F (Swift Swim)"))).toBe(true);
    expect(texts(pelipper, archa).some((t) => t.includes("Electro Shot"))).toBe(true);
  });

  it("flags spread moves on allies", () => {
    expect(analyzePair(chomp, rotom).notes.find((n) => n.text.includes("immune to Garchomp's Earthquake"))?.good).toBe(true);
    expect(analyzePair(chomp, incin).notes.find((n) => n.text.includes("Earthquake hits Incineroar super-effectively"))?.good).toBe(false);
  });

  it("warns about an unpowered seed and unset weather", () => {
    const notes = teamNotes([sneasler, bascu]).map((n) => n.text);
    expect(notes.some((t) => t.includes("Electric Seed won't activate"))).toBe(true);
    expect(notes.some((t) => t.includes("Swift Swim wants Rain"))).toBe(true);
    expect(teamNotes([pelipper, bascu])).toEqual([]);
  });

  it("ranks the rain pair above an awkward pair", () => {
    const ranked = rankPairs([pelipper, bascu, chomp, incin]);
    const idx = (a: string, b: string) => ranked.findIndex((p) => [p.a.name, p.b.name].sort().join() === [a, b].sort().join());
    expect(idx("Pelipper", "Basculegion-F")).toBeLessThan(idx("Garchomp", "Incineroar"));
  });

  it("threat report warns about Defiant vs Intimidate", () => {
    const r = threatReport([{ ...incin }], { types: ["Dark", "Steel"] as never, abilities: ["Defiant", "Supreme Overlord", "Pressure"] });
    expect(r.warnings.some((w) => w.includes("Defiant"))).toBe(true);
    expect(r.threatened).toHaveLength(0);
    expect(r.status).toBe("handled"); // Incineroar's Flare Blitz hits Kingambit 2×, Kingambit's STABs are neutral or resisted
  });
});

describe("suggest", () => {
  const mon = (id: string, types: string[], moves: string[], spe = 100) => ({ id, name: id, types: types as never, ability: "", moves, spe });
  const opp = (types: string[]) => ({ types: types as never, minSpe: 50, maxSpe: 150 });

  it("prefers the mon that hits super-effectively and isn't threatened", () => {
    const water = mon("water", ["Water"], ["Surf"]);
    const grass = mon("grass", ["Grass"], ["Energy Ball"]);
    expect(suggestPicks([grass, water], [opp(["Fire"]), opp(["Fire", "Flying"])], 1)).toEqual(["water"]);
  });

  it("spreads picks to cover different opponents", () => {
    const water = mon("water", ["Water"], ["Surf"]);
    const water2 = mon("water2", ["Water"], ["Surf"], 90);
    const grass = mon("grass", ["Grass"], ["Energy Ball"]);
    const picks = suggestPicks([water, water2, grass], [opp(["Fire"]), opp(["Ground", "Rock"]), opp(["Water"])], 2);
    expect(picks.sort()).toEqual(["grass", "water"]);
  });
});

describe("stats", () => {
  it("computes Lv50 stats with 31 IVs and 1 SP = 1 point", () => {
    // Garchomp: 108/130/95/80/85/102
    const base = getSpecies("Garchomp")!.baseStats;
    const s = computeStats(base, { ...emptyStats(), atk: 32, spe: 32, hp: 2 }, "Jolly");
    expect(s.hp).toBe(183 + 2);
    expect(s.atk).toBe(182);
    expect(s.spa).toBe(Math.floor(100 * 0.9));
    expect(s.spe).toBe(Math.floor((122 + 32) * 1.1));
  });

  it("caps SP per stat and in total", () => {
    let sp = setSp(emptyStats(), "atk", 50);
    expect(sp.atk).toBe(32);
    sp = setSp(sp, "spe", 32);
    sp = setSp(sp, "hp", 10);
    expect(sp.hp).toBe(2);
  });

  it("speed benchmarks", () => {
    const b = speedBenchmarks(100);
    expect(b.neutral).toBe(120);
    expect(b.neutralMax).toBe(152);
    expect(b.plusMax).toBe(167);
    expect(calcStat("spe", 100, 0, 0.9)).toBe(b.min);
  });
});

describe("type chart", () => {
  it("dual types multiply", () => {
    expect(effectiveness("Ice", ["Dragon", "Ground"])).toBe(4);
    expect(effectiveness("Ground", ["Flying"])).toBe(0);
    expect(effectiveness("Fire", ["Water", "Dragon"])).toBe(0.25);
  });

  it("abilities change defensive multipliers", () => {
    expect(defensiveMultiplier("Ground", ["Electric"], "Levitate")).toBe(0);
    expect(defensiveMultiplier("Fire", ["Grass"], "Thick Fat")).toBe(1);
    expect(defensiveMultiplier("Water", ["Fire"], "Water Absorb")).toBe(0);
  });

  it("special moves and -ate abilities", () => {
    expect(moveVsTypes("Freeze-Dry", ["Water"])).toBe(2);
    expect(moveVsTypes("Freeze-Dry", ["Water", "Ground"])).toBe(4);
    expect(moveVsTypes("Hyper Voice", ["Dragon"], "Pixilate")).toBe(2);
    expect(moveVsTypes("Protect", ["Dragon"])).toBeUndefined();
  });
});

describe("coverage", () => {
  const mons = [
    { id: "1", name: "Garchomp", types: ["Dragon", "Ground"] as const, ability: "Rough Skin", moves: ["Earthquake", "Dragon Claw"] },
    { id: "2", name: "Rotom-Wash", types: ["Electric", "Water"] as const, ability: "Levitate", moves: ["Hydro Pump", "Thunderbolt"] },
  ].map((m) => ({ ...m, types: [...m.types] }));

  it("finds best hits and gaps", () => {
    const cov = offensiveCoverage(mons);
    const fire = cov.find((c) => c.defTypes[0] === "Fire")!;
    expect(fire.mult).toBe(2);
    expect(fire.by.map((b) => b.mon)).toEqual(["Garchomp", "Rotom-Wash"]);
    const grass = cov.find((c) => c.defTypes[0] === "Grass")!;
    expect(grass.mult).toBe(1);
  });

  it("counts shared weaknesses", () => {
    const ice = defensiveMatrix(mons).find((r) => r.attack === "Ice")!;
    expect(ice.cells).toEqual([4, 0.5]);
    expect(ice.weak).toBe(1);
  });
});

describe("dex", () => {
  it("finds megas", () => {
    expect(getMegaFormes(getSpecies("Charizard")!).map((s) => s.name)).toEqual(["Charizard-Mega-X", "Charizard-Mega-Y"]);
    expect(megaFromItem("Garchomp", "Garchompite")?.name).toBe("Garchomp-Mega");
    expect(megaFromItem("Garchomp", "Life Orb")).toBeUndefined();
  });
});

describe("showdown import", () => {
  it("parses a paste and converts EVs to SP", () => {
    const { members, errors } = importShowdown(`Garchomp @ Life Orb
Ability: Rough Skin
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Rock Slide
- Protect`);
    expect(errors).toEqual([]);
    expect(members[0]).toMatchObject({ species: "Garchomp", item: "Life Orb", nature: "Jolly", ability: "Rough Skin" });
    expect(members[0].sp).toMatchObject({ hp: 1, atk: 32, spe: 32 });
    expect(members[0].moves).toHaveLength(4);
  });

  it("reads Champions-style spreads as Stat Points directly", () => {
    const paste = `Raichu @ Raichunite X
Ability: Lightning Rod
EVs: 2 HP / 32 Atk / 32 Spe
Jolly Nature
- Volt Tackle
- Volt Switch
- Feint
- Fake Out

Golisopod @ Golisopite
Ability: Emergency Exit
EVs: 32 HP / 32 Atk / 2 Def
Adamant Nature
- Leech Life
- Iron Head
- Sucker Punch
- Protect

Archaludon @ Leftovers
Ability: Stamina
EVs: 32 HP / 1 Def / 2 SpA / 20 SpD / 11 Spe
Calm Nature
- Electro Shot
- Dragon Pulse
- Snarl
- Protect

Pelipper @ Damp Rock
Ability: Drizzle
EVs: 31 HP / 25 SpD / 10 Spe
Bold Nature
- Weather Ball
- Hurricane
- Wide Guard
- Helping Hand

Basculegion-F @ Focus Sash
Ability: Swift Swim
EVs: 2 HP / 32 SpA / 32 Spe
Modest Nature
- Muddy Water
- Shadow Ball
- Ice Beam
- Protect

Sneasler @ Electric Seed
Ability: Unburden
EVs: 32 Atk / 2 SpD / 32 Spe
Adamant Nature
- Poison Jab
- Close Combat
- Swords Dance
- Protect`;
    const { members, errors } = importShowdown(paste);
    expect(errors).toEqual([]);
    expect(members.map((m) => m.species)).toEqual(["Raichu", "Golisopod", "Archaludon", "Pelipper", "Basculegion-F", "Sneasler"]);
    expect(members[0].sp).toEqual({ hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 });
    expect(members[2].sp).toEqual({ hp: 32, atk: 0, def: 1, spa: 2, spd: 20, spe: 11 });
    expect(members[5].sp).toEqual({ hp: 0, atk: 32, def: 0, spa: 0, spd: 2, spe: 32 });
    expect(megaFromItem("Raichu", "Raichunite X")?.name).toBe("Raichu-Mega-X");
    expect(megaFromItem("Golisopod", "Golisopite")?.name).toBe("Golisopod-Mega");

    // export → import keeps the spread unchanged
    expect(importShowdown(exportShowdown(members)).members.map((m) => m.sp)).toEqual(members.map((m) => m.sp));
  });
});
