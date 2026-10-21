"use client";

import { createTimeline, stagger } from "animejs";
import { useLayoutEffect, useRef } from "react";
import { bestHit } from "@/lib/coverage";
import { getSpecies, type Species, type TypeName } from "@/lib/dex";
import { reducedMotion } from "@/lib/motion";
import { multLabel } from "@/lib/typechart";
import { MegaStoneIcon } from "@/components/shared/MegaStone";
import { Sprite } from "@/components/shared/Sprite";

const MINE: { name: string; moves: string[]; ability: string; badge?: string }[] = [
  { name: "Raichu", moves: ["Volt Tackle", "Volt Switch", "Fake Out"], ability: "Lightning Rod" },
  { name: "Pelipper", moves: ["Weather Ball", "Hurricane"], ability: "Drizzle", badge: "L1" },
  { name: "Archaludon", moves: ["Electro Shot", "Dragon Pulse"], ability: "Stamina", badge: "L2" },
  { name: "Golisopod", moves: ["Leech Life", "Iron Head"], ability: "Emergency Exit" },
  { name: "Basculegion-F", moves: ["Muddy Water", "Shadow Ball", "Ice Beam"], ability: "Swift Swim", badge: "B1" },
  { name: "Sneasler", moves: ["Close Combat", "Poison Jab"], ability: "Unburden", badge: "B2" },
];
const THEIRS = ["Incineroar", "Flutter Mane", "Kingambit", "Rillaboom", "Gholdengo", "Garchomp"];
const TYPED = "incin, flutter, gambit, rilla, ghold, chomp";

const sp = (n: string) => getSpecies(n) as Species;

function cellTone(m: number) {
  if (m >= 4) return "bg-emerald-500 text-slate-950";
  if (m >= 2) return "bg-emerald-800 text-emerald-50";
  if (m >= 1) return "bg-slate-800 text-slate-300";
  return "bg-red-950 text-red-300";
}

/** Looping, scripted "team preview" that sells the app in five seconds. */
export function HeroDemo() {
  const root = useRef<HTMLDivElement>(null);

  // Real numbers from the app's own type logic, so the demo never lies
  const picks = MINE.filter((m) => m.badge);
  const grid = picks.map((m) => {
    const mon = { id: m.name, name: m.name, types: [...sp(m.name).types] as TypeName[], ability: m.ability, moves: m.moves };
    return THEIRS.map((o) => bestHit(mon, sp(o).types).mult);
  });

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const q = (s: string) => el.querySelectorAll<HTMLElement>(s);
    const typedEl = el.querySelector<HTMLElement>("[data-typed]")!;
    const typed = { n: 0 };

    const tl = createTimeline({ loop: true, loopDelay: 2600 })
      // reset everything at the start of each loop
      .set(q("[data-opp]"), { opacity: 0, translateY: -28, scale: 0.6 }, 0)
      .set(q("[data-badge]"), { opacity: 0, scale: 0 }, 0)
      .set(q("[data-cell]"), { opacity: 0, scale: 0.4 }, 0)
      .set(q("[data-tip]"), { opacity: 0, translateY: 12 }, 0)
      .set(q("[data-stone]"), { opacity: 0.35 }, 0)
      .set(q("[data-mega]"), { filter: "brightness(1) saturate(1)", scale: 1 }, 0)
      .add(
        typed,
        {
          n: [0, TYPED.length],
          duration: 1500,
          ease: "linear",
          modifier: Math.round,
          onUpdate: () => {
            typedEl.textContent = TYPED.slice(0, typed.n);
          },
        },
        0,
      )
      .add(q("[data-opp]"), { opacity: [0, 1], translateY: [-28, 0], scale: [0.6, 1], duration: 650, ease: "outBounce", delay: stagger(110) }, 1400)
      .add(q("[data-badge]"), { opacity: [0, 1], scale: [0, 1], duration: 450, ease: "outBack(2.6)", delay: stagger(170) }, 2500)
      .add(q("[data-stone]"), { opacity: [0.35, 1], scale: [1, 1.5, 1], duration: 500, ease: "outQuad" }, 3300)
      .add(
        q("[data-mega]"),
        { scale: [1, 1.3, 1], filter: ["brightness(1) saturate(1)", "brightness(3) saturate(0)", "brightness(1) saturate(1)"], duration: 700, ease: "outQuad" },
        3400,
      )
      .add(q("[data-cell]"), { opacity: [0, 1], scale: [0.4, 1], duration: 280, ease: "outBack(1.8)", delay: stagger(28, { grid: [6, 4], from: "first" }) }, 3900)
      .add(q("[data-tip]"), { opacity: [0, 1], translateY: [12, 0], duration: 420, ease: "outBack(1.4)" }, 5000);

    return () => {
      tl.revert();
    };
  }, []);

  return (
    <div ref={root} className="card relative overflow-hidden p-3 sm:p-4" aria-label="Animated demo of a team preview" role="img">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
        </span>
        <span className="font-pixel text-[10px] uppercase tracking-widest text-slate-400">Team preview</span>
        <span className="ml-auto rounded-sm border-2 border-red-800 bg-red-950 px-1.5 font-pixel text-[10px] text-red-300">0:58</span>
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-md border-2 border-slate-700 bg-slate-950 px-2 py-1.5 text-xs">
        <span className="font-pixel text-[9px] uppercase text-slate-500">Them</span>
        <span className="truncate font-mono text-slate-200" data-typed>
          {TYPED}
        </span>
        <span className="blink -ml-1 h-3.5 w-1.5 bg-indigo-400" aria-hidden />
      </div>
      <div className="mb-3 grid grid-cols-6 gap-1">
        {THEIRS.map((n) => (
          <div key={n} data-opp className="flex justify-center rounded-md border-2 border-slate-800 bg-slate-950/60 py-1">
            <Sprite species={sp(n)} size={40} />
          </div>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-6 gap-1">
        {MINE.map((m) => (
          <div
            key={m.name}
            className={`relative flex justify-center rounded-md border-2 py-1 ${m.badge ? "border-duo bg-indigo-950" : "border-slate-800 bg-slate-900"}`}
          >
            <div data-mega={m.name === "Raichu" ? "" : undefined}>
              <Sprite species={sp(m.name)} size={40} />
            </div>
            {m.name === "Raichu" && (
              <span data-stone className="absolute -bottom-1.5 -left-1 rounded-full border-2 border-fuchsia-300 bg-fuchsia-950 p-px">
                <MegaStoneIcon active size={12} />
              </span>
            )}
            {m.badge && (
              <span
                data-badge
                className={`absolute -right-1 -top-1.5 rounded-sm border-2 px-0.5 font-pixel text-[8px] font-bold leading-none ${
                  m.badge.startsWith("L") ? "border-amber-200 bg-amber-500 text-slate-950" : "border-indigo-300 bg-indigo-500 text-white"
                }`}
              >
                {m.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {picks.map((m, r) => (
          <div key={m.name} className="grid grid-cols-[5.5rem_repeat(6,1fr)] items-center gap-1">
            <span className="truncate text-[10px] text-slate-400">{m.name}</span>
            {grid[r].map((v, c) => (
              <span key={c} data-cell className={`rounded-sm py-0.5 text-center font-mono text-[10px] font-bold ${cellTone(v)}`}>
                ↗{multLabel(v)}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div
        data-tip
        className="mt-3 flex items-center gap-2 rounded-md border-2 border-emerald-700 bg-emerald-950/70 px-2 py-1.5 text-[11px] text-emerald-100"
      >
        <span className="font-pixel text-[9px] uppercase text-emerald-300">Tip</span>
        Sneasler&apos;s Close Combat hits Kingambit 4× and outspeeds it.
      </div>
    </div>
  );
}
