"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { dex, getSpecies, pickableSpecies, type Species } from "@/lib/dex";
import { TYPES } from "@/lib/typechart";
import { Logo } from "@/components/shared/Logo";
import { MegaStoneIcon } from "@/components/shared/MegaStone";
import { Sprite } from "@/components/shared/Sprite";
import { TypeBadge } from "@/components/shared/TypeBadge";
import { HeroDemo } from "./HeroDemo";
import { ShortcutDemo } from "./ShortcutDemo";
import { useReveal } from "./useReveal";
import { Walkers } from "./Walkers";

const sp = (n: string) => getSpecies(n) as Species;

const STATS = [
  { value: pickableSpecies.length, label: "Pokémon & formes" },
  { value: [...dex.species.all()].filter((s) => s.exists && s.isMega).length, label: "Mega Evolutions" },
  { value: [...dex.moves.all()].filter((m) => m.exists && !m.isNonstandard).length, label: "Moves" },
  { value: TYPES.length, label: "Types, every matchup" },
];

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center" data-reveal>
      <p className="mb-2 font-pixel text-[11px] uppercase tracking-[0.3em] text-indigo-400">{kicker}</p>
      <h2 className="pixel-shadow text-2xl sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-slate-400">{sub}</p>}
    </div>
  );
}

function Feature({ title, children, visual }: { title: string; children: ReactNode; visual: ReactNode }) {
  return (
    <div data-reveal-item className="card flex flex-col gap-3 p-4 transition-transform hover:-translate-y-1">
      <div className="flex h-24 items-center justify-center rounded-md border-2 border-slate-800 bg-slate-950/70 px-3">{visual}</div>
      <h3 className="text-sm">{title}</h3>
      <p className="text-sm text-slate-400">{children}</p>
    </div>
  );
}

const Mini = ({ children, tone }: { children: ReactNode; tone: string }) => (
  <span className={`rounded-sm px-1.5 py-0.5 font-pixel text-[9px] uppercase ${tone}`}>{children}</span>
);

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  return (
    <div ref={root} className="overflow-x-clip">
      {/* ---------- hero ---------- */}
      <section className="sky scanlines relative">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-sm border-2 border-indigo-500 bg-indigo-950/80 px-2 py-1 font-pixel text-[10px] uppercase tracking-widest text-indigo-200">
              <span className="h-2 w-2 bg-emerald-400" /> Pokémon Champions · VGC doubles
            </p>
            <h1 className="pixel-shadow text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              Win team <span className="text-amber-300">preview.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Save your team once. At preview, type their six and instantly see weaknesses, Megas, speed, matchups and your best four, before the timer runs out.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/teams" className="btn btn-primary px-6 py-3 text-sm">
                ▶ Press start
              </Link>
              <Link href="/teams?import=1" className="btn btn-ghost px-5 py-3 text-sm">
                Import from Showdown
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">Free · no account · your teams stay in your browser</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-full bg-indigo-600/20 blur-3xl" aria-hidden />
            <HeroDemo />
          </div>
        </div>
        <Walkers />
      </section>

      {/* ---------- numbers ---------- */}
      <section className="border-y-2 border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4" data-reveal>
          {STATS.map((s) => (
            <div key={s.label} data-reveal-item className="text-center">
              <div className="pixel-shadow font-pixel text-3xl text-white sm:text-4xl" data-count={s.value}>
                {s.value.toLocaleString()}
              </div>
              <div className="mt-1 font-pixel text-[10px] uppercase tracking-wider text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle kicker="Your toolkit" title="Everything team preview needs" sub="Built for doubles: two on the field, four brought, one Mega, and no time to think." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          <Feature
            title="Stat Points, done right"
            visual={
              <div className="w-full space-y-1.5">
                {[
                  ["HP", 2],
                  ["Atk", 32],
                  ["Spe", 32],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="w-7 font-pixel text-[9px] text-slate-400">{l}</span>
                    <div className="meter h-2.5 flex-1 bg-slate-800">
                      <div className="h-full bg-indigo-500" style={{ width: `${((v as number) / 32) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div className="text-right font-pixel text-[9px] text-emerald-400">0 / 66 left</div>
              </div>
            }
          >
            Lv50 with 31 IVs and the 66-point system built in. Final stats update as you drag.
          </Feature>
          <Feature
            title="Paste from Showdown"
            visual={
              <pre className="w-full overflow-hidden font-mono text-[10px] leading-snug text-slate-300">
                {"Sneasler @ Electric Seed\nAbility: Unburden\nEVs: 32 Atk / 32 Spe\n- Close Combat"}
              </pre>
            }
          >
            Drop in a paste or build by hand, with move pools, items, natures and Mega Stones.
          </Feature>
          <Feature
            title="Instant opponent intel"
            visual={
              <div className="flex items-center gap-2">
                <Sprite species={sp("Garchomp")} size={52} />
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <TypeBadge type="Dragon" small />
                    <TypeBadge type="Ground" small />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-pixel text-[9px] text-red-400">4×</span>
                    <TypeBadge type="Ice" small />
                  </div>
                </div>
              </div>
            }
          >
            Type a name, typos welcome. Weaknesses, base stats and speed benchmarks appear instantly.
          </Feature>
          <Feature
            title="Every Mega, even new ones"
            visual={
              <div className="flex items-center gap-3">
                <Sprite species={sp("Charizard-Mega-X")} size={52} />
                <MegaStoneIcon active size={28} />
                <Sprite species={sp("Dragonite-Mega")} size={52} />
              </div>
            }
          >
            Tap the stone to flip any Pokémon into its Mega, including the new Legends Z-A Megas.
          </Feature>
          <Feature
            title="Coverage & defense"
            visual={
              <div className="grid grid-cols-6 gap-1">
                {["bg-emerald-600", "bg-emerald-800", "bg-slate-700", "bg-red-900", "bg-emerald-800", "bg-sky-800", "bg-slate-700", "bg-orange-800", "bg-emerald-800", "bg-slate-700", "bg-red-700", "bg-emerald-800"].map(
                  (c, i) => (
                    <span key={i} className={`h-5 w-5 rounded-sm ${c}`} />
                  ),
                )}
              </div>
            }
          >
            See what your four hit hard, and which types hit two of them at once.
          </Feature>
          <Feature
            title="Synergy & best leads"
            visual={
              <div className="flex items-center gap-2">
                <Sprite species={sp("Pelipper")} size={44} />
                <span className="font-pixel text-slate-500">+</span>
                <Sprite species={sp("Archaludon")} size={44} />
                <span className="rounded-md bg-emerald-600 px-1.5 font-mono text-xs font-bold text-white">+8.0</span>
              </div>
            }
          >
            Rain setters and abusers, spread moves hitting your partner, Fake Out plus setup. Pairs ranked for you.
          </Feature>
          <Feature
            title="Threat check"
            visual={
              <div className="flex flex-wrap justify-center gap-1.5">
                <Mini tone="bg-emerald-700 text-white">Answered</Mini>
                <Mini tone="bg-amber-600 text-white">Risky</Mini>
                <Mini tone="bg-red-600 text-white">No answer</Mini>
              </div>
            }
          >
            Who each opponent threatens, who answers it, and tricks like Defiant against your Intimidate.
          </Feature>
          <Feature
            title="Win/loss log"
            visual={
              <div className="text-center">
                <div className="font-pixel text-2xl">
                  <span className="text-emerald-400">12W</span>
                  <span className="text-slate-600">-</span>
                  <span className="text-red-400">5L</span>
                </div>
                <div className="mt-1 font-pixel text-[9px] uppercase text-slate-500">Nice Regional run</div>
              </div>
            }
          >
            One tap after each game logs what you brought and what you faced.
          </Feature>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="border-y-2 border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle kicker="How it works" title="Three steps. One minute." />
          <div className="grid gap-4 md:grid-cols-3" data-reveal>
            {[
              { n: "01", t: "Build your six", d: "Import a Showdown paste or pick Pokémon, moves, items and Stat Points by hand. Saved in your browser.", icon: "Raichu" },
              { n: "02", t: "Enter their six", d: "Type their team at preview, e.g. “incin, flutter, gambit”. Weaknesses and Megas show up instantly.", icon: "Incineroar" },
              { n: "03", t: "Bring your best four", d: "Check matchups, synergy and threats, or press S to have four picked for you. Then go win.", icon: "Sneasler" },
            ].map((s) => (
              <div key={s.n} data-reveal-item className="card relative overflow-hidden p-5">
                <span className="pointer-events-none absolute -right-2 -top-4 font-pixel text-7xl text-slate-800/80" aria-hidden>
                  {s.n}
                </span>
                <Sprite species={sp(s.icon)} size={56} />
                <h3 className="mt-3 text-base">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- shortcuts ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle kicker="Speedrun mode" title="Play it like a game" sub="Every action has a key, so you never have to reach for the mouse during preview." />
        <div data-reveal>
          <ShortcutDemo />
        </div>
      </section>

      {/* ---------- final call ---------- */}
      <section className="sky scanlines relative border-t-2 border-slate-800">
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center" data-reveal>
          <div className="mb-6 flex justify-center gap-2" data-reveal-item>
            {["Pikachu", "Charizard", "Gengar", "Garchomp"].map((n) => (
              <Sprite key={n} species={sp(n)} size={56} />
            ))}
          </div>
          <h2 className="pixel-shadow text-3xl sm:text-4xl" data-reveal-item>
            Ready, trainer?
          </h2>
          <p className="mt-4 text-slate-300" data-reveal-item>
            Your next team preview could be your best one.
          </p>
          <div className="mt-8" data-reveal-item>
            <Link href="/teams" className="btn btn-primary px-8 py-4 text-base">
              <span className="blink">▶</span> Press start
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex shrink-0 items-center gap-2 font-pixel uppercase tracking-wider text-slate-400">
            <Logo size={20} /> Champions Doubles
          </span>
          <span>
            Fan-made tool, not affiliated with Nintendo, Game Freak or The Pokémon Company. Pokémon and its sprites are trademarks of their respective owners. Data and
            sprites via Pokémon Showdown.
          </span>
        </div>
      </footer>
    </div>
  );
}
