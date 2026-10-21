"use client";

import { bestHit, defensiveMatrix, offensiveCoverage } from "@/lib/coverage";
import { defensiveMultiplier, multLabel } from "@/lib/typechart";
import { Sprite } from "@/components/shared/Sprite";
import { TypeBadge } from "@/components/shared/TypeBadge";
import type { MyMon, OppMon } from "./battleMons";

/** Colour for "how well we hit them" — high is good. */
function offenseTone(m: number) {
  if (m < 0) return "bg-slate-800 text-slate-500";
  if (m === 0) return "bg-slate-950 text-slate-500 ring-1 ring-red-900";
  if (m < 1) return "bg-red-950 text-red-300";
  if (m === 1) return "bg-slate-800 text-slate-300";
  if (m < 4) return "bg-emerald-800 text-emerald-100";
  return "bg-emerald-600 text-white";
}

/** Colour for "how much it hurts us" — high is bad. */
function defenseTone(m: number) {
  if (m === 0) return "bg-sky-900 text-sky-200";
  if (m < 1) return "bg-emerald-950 text-emerald-300";
  if (m === 1) return "bg-slate-800/40 text-slate-600";
  if (m < 4) return "bg-orange-900 text-orange-100";
  return "bg-red-700 text-white";
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section data-anim="fade" className="card min-w-0 p-4">
      <h3 className="font-semibold">{title}</h3>
      {sub && <p className="mb-3 text-xs text-slate-400">{sub}</p>}
      {children}
    </section>
  );
}

export function OffensiveCoverage({ mons }: { mons: MyMon[] }) {
  const cov = offensiveCoverage(mons);
  const gaps = cov.filter((c) => c.mult <= 1);
  return (
    <Section title="Offensive coverage" sub="Best multiplier your picks' damaging moves get against each type. Hover a cell to see who hits it.">
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {cov.map((c) => (
          <div
            key={c.defTypes[0]}
            data-anim="cell"
            className={`flex flex-col items-center gap-1 rounded-lg p-1.5 ${offenseTone(c.mult)}`}
            title={c.by.length ? c.by.map((b) => `${b.mon}: ${b.move}`).join("\n") : "No damaging moves"}
          >
            <TypeBadge type={c.defTypes[0]} small />
            <span className="font-mono text-sm font-bold">{c.mult < 0 ? "–" : `${multLabel(c.mult)}×`}</span>
            <span className="max-w-full truncate text-[10px] opacity-80">{[...new Set(c.by.map((b) => b.mon))].join(", ")}</span>
          </div>
        ))}
      </div>
      {gaps.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-1 text-xs text-amber-300">
          No super-effective hit on: {gaps.map((g) => <TypeBadge key={g.defTypes[0]} type={g.defTypes[0]} small />)}
        </p>
      )}
    </Section>
  );
}

function defenseLabel(m: number) {
  if (m === 1) return "";
  return m > 1 ? `${multLabel(m)}×` : multLabel(m);
}

export function DefensiveMatrixView({ mons }: { mons: MyMon[] }) {
  const rows = defensiveMatrix(mons);
  const isThreat = (r: (typeof rows)[number]) => r.weak >= 2 && r.resist + r.immune === 0;
  const threats = rows.filter(isThreat);
  // 2+ weak but someone resists or is immune: lower priority, still worth seeing
  const covered = rows.filter((r) => r.weak >= 2 && !isThreat(r));
  const cols = `4.25rem repeat(${mons.length}, minmax(2.25rem, 4rem)) 1.75rem 1.75rem`;
  const half = Math.ceil(rows.length / 2);

  const header = (
    <div className="grid items-end gap-1 pb-1" style={{ gridTemplateColumns: cols }}>
      <span className="text-[10px] text-slate-500">Attack</span>
      {mons.map((m) => (
        <div key={m.id} className="flex min-w-0 flex-col items-center" title={m.forme.name}>
          <Sprite species={m.forme} size={30} />
          <span className="w-full truncate text-center text-[10px] text-slate-300">{m.forme.name}</span>
        </div>
      ))}
      <span className="text-center text-[10px] font-semibold text-orange-300">Weak</span>
      <span className="text-center text-[10px] font-semibold text-emerald-300">Res</span>
    </div>
  );

  return (
    <Section title="Defense" sub="Damage each attacking type does to your picks, including abilities like Levitate. Outlined rows are shared weaknesses nobody covers.">
      {threats.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          <span className="font-semibold">⚠ Shared weaknesses:</span>
          {threats.map((t) => (
            <span key={t.attack} className="flex items-center gap-1">
              <TypeBadge type={t.attack} small />
              <span className="text-red-300">×{t.weak}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="mb-3 rounded-lg border border-emerald-900/70 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
          ✓ No type hits 2+ of these without someone resisting it.
        </div>
      )}
      {covered.length > 0 && (
        <div className="-mt-1 mb-3 flex flex-wrap items-center gap-1.5 px-1 text-xs text-amber-200/90">
          <span>Hits 2+ but covered:</span>
          {covered.map((t) => (
            <span key={t.attack} className="flex items-center gap-1">
              <TypeBadge type={t.attack} small />
              <span className="text-amber-300">×{t.weak}</span>
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          {[rows.slice(0, half), rows.slice(half)].map((chunk, ci) => (
            <div key={ci} className="max-w-xl">
              {header}
              <div className="space-y-1">
                {chunk.map((r) => (
                  <div
                    key={r.attack}
                    data-anim="row"
                    className={`grid items-center gap-1 rounded-md ${isThreat(r) ? "ring-1 ring-red-500/70" : ""}`}
                    style={{ gridTemplateColumns: cols }}
                  >
                    <TypeBadge type={r.attack} small />
                    {r.cells.map((c, i) => (
                      <span key={i} className={`flex h-6 items-center justify-center rounded font-mono text-xs font-bold ${defenseTone(c)}`}>
                        {defenseLabel(c)}
                      </span>
                    ))}
                    <span
                      className={`flex h-6 items-center justify-center rounded font-mono text-xs font-bold ${
                        r.weak >= 2 ? "bg-orange-600 text-white" : r.weak ? "text-orange-300" : "text-slate-700"
                      }`}
                    >
                      {r.weak || "–"}
                    </span>
                    <span className={`text-center font-mono text-xs ${r.resist + r.immune ? "text-emerald-300" : "text-slate-700"}`}>
                      {r.resist + r.immune || "–"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-400">
        {(
          [
            [4, "4× weak"],
            [2, "2× weak"],
            [0.5, "resists"],
            [0, "immune"],
          ] as const
        ).map(([m, l]) => (
          <span key={l} className="flex items-center gap-1">
            <span className={`h-3 w-4 rounded ${defenseTone(m)}`} />
            {l}
          </span>
        ))}
      </div>
    </Section>
  );
}

/** Their strongest same-type (STAB) hit on one of ours. Their real moves aren't known, so STAB is the best guess. */
function stabThreat(opp: OppMon, mon: MyMon) {
  return Math.max(...opp.forme.types.map((t) => defensiveMultiplier(t, mon.types, mon.ability)));
}

export function MatchupGrid({ mons, opponents }: { mons: MyMon[]; opponents: OppMon[] }) {
  if (!opponents.length)
    return (
      <Section title="Matchups">
        <p className="text-sm text-slate-400">Add the opponent&apos;s Pokémon to see matchups.</p>
      </Section>
    );
  return (
    <Section
      title="Matchups"
      sub="↗ your best move on them · ↙ their best STAB type on you · speed vs their max-speed Jolly/Timid (+) and neutral max."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th />
              {opponents.map((o) => (
                <th key={o.opp.id} className="px-1 font-medium">
                  <div>{o.forme.name}</div>
                  <div className="flex justify-center gap-0.5">
                    {o.forme.types.map((t) => (
                      <TypeBadge key={t} type={t} small />
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mons.map((m) => (
              <tr key={m.id}>
                <th className="pr-2 text-left font-medium">
                  {m.forme.name}
                  <div className="font-mono text-[10px] font-normal text-slate-500">Spe {m.stats.spe}</div>
                </th>
                {opponents.map((o) => {
                  const hit = bestHit(m, o.forme.types);
                  const threat = stabThreat(o, m);
                  const spe = m.stats.spe;
                  const speed =
                    spe === o.speed.plusMax || spe === o.speed.neutralMax
                      ? ["Speed tie", "text-yellow-300"]
                      : spe > o.speed.plusMax
                        ? ["Faster", "text-emerald-400"]
                        : spe > o.speed.neutralMax
                          ? ["Faster than neutral", "text-lime-300"]
                          : spe < o.speed.min
                            ? ["Always slower", "text-red-400"]
                            : ["Slower if max", "text-orange-300"];
                  return (
                    <td key={o.opp.id} data-anim="cell" className="rounded-lg bg-slate-800/50 p-1.5 align-top">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`rounded px-1.5 py-0.5 font-mono font-bold ${offenseTone(hit.mult)}`} title={hit.moves.join(", ")}>
                          ↗{hit.mult < 0 ? "–" : multLabel(hit.mult)}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 font-mono font-bold ${defenseTone(threat)}`}>↙{multLabel(threat)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-center text-[10px] text-slate-400">{hit.moves[0] ?? "—"}</div>
                      <div className={`text-center text-[10px] ${speed[1]}`}>{speed[0]}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function SpeedTiers({ mons, opponents }: { mons: MyMon[]; opponents: OppMon[] }) {
  const rows = [
    ...mons.map((m) => ({ key: m.id, name: m.forme.name, value: m.stats.spe, range: "", mine: true })),
    ...opponents.map((o) => ({
      key: o.opp.id,
      name: o.forme.name,
      value: o.speed.plusMax,
      range: `${o.speed.min}–${o.speed.plusMax} · Scarf ${o.speed.scarf}`,
      mine: false,
    })),
  ].sort((a, b) => b.value - a.value);
  return (
    <Section title="Speed tiers" sub="Yours are exact. Opponents are shown at max speed with a + nature, plus their full possible range. Under Trick Room, read bottom-up.">
      <ol className="space-y-1">
        {rows.map((r) => (
          <li key={r.key} data-anim="row" className={`flex items-center gap-3 rounded-lg px-2 py-1 text-sm ${r.mine ? "bg-indigo-950/60" : "bg-slate-800/40"}`}>
            <span className="w-10 text-right font-mono font-bold tabular-nums">{r.value}</span>
            <span className={r.mine ? "text-indigo-200" : ""}>{r.name}</span>
            <span className="ml-auto text-[11px] text-slate-500">{r.mine ? "you" : r.range}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
