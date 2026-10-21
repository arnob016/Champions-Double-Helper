"use client";

import { bestHit } from "@/lib/coverage";
import type { Species } from "@/lib/dex";
import { rankPairs, teamNotes, type Note, type PairReport, type SynMon } from "@/lib/synergy";
import { Sprite } from "@/components/shared/Sprite";
import { TypeBadge } from "@/components/shared/TypeBadge";
import { useBattle } from "@/store/battle";
import type { MyMon, OppMon } from "./battleMons";

function NoteList({ notes, limit }: { notes: Note[]; limit?: number }) {
  const shown = limit ? notes.slice(0, limit) : notes;
  if (!shown.length) return <p className="text-xs text-slate-500">Nothing notable together.</p>;
  return (
    <ul className="space-y-0.5 text-xs">
      {shown.map((n) => (
        <li key={n.text} className={`flex gap-1.5 ${n.good ? "text-emerald-200" : "text-red-200"}`}>
          <span className={`shrink-0 font-bold ${n.good ? "text-emerald-400" : "text-red-400"}`}>{n.good ? "+" : "−"}</span>
          {n.text}
        </li>
      ))}
      {limit && notes.length > limit && <li className="text-slate-500">+{notes.length - limit} more</li>}
    </ul>
  );
}

function scoreTone(s: number) {
  if (s >= 4) return "bg-emerald-600 text-white";
  if (s >= 1) return "bg-emerald-900 text-emerald-100";
  if (s > -1) return "bg-slate-700 text-slate-200";
  return "bg-red-800 text-white";
}

type UIPair = PairReport<SynMon & { forme: Species }>;

function PairHead({ pair, rank }: { pair: UIPair; rank?: number }) {
  return (
    <div className="flex items-center gap-2">
      {rank !== undefined && <span className="w-5 text-center text-sm font-bold text-slate-500">{rank}</span>}
      <Sprite species={pair.a.forme} size={36} />
      <span className="text-slate-600">+</span>
      <Sprite species={pair.b.forme} size={36} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {pair.a.name} <span className="text-slate-500">&amp;</span> {pair.b.name}
        </div>
        {pair.shared.length > 0 && (
          <div className="flex flex-wrap items-center gap-0.5 text-[10px] text-red-300">
            both weak:
            {pair.shared.map((t) => (
              <TypeBadge key={t} type={t} small />
            ))}
          </div>
        )}
      </div>
      <span className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${scoreTone(pair.score)}`} title="Synergy score">
        {pair.score > 0 ? "+" : ""}
        {pair.score.toFixed(1)}
      </span>
    </div>
  );
}

export function SynergyTab({ mons, opponents, teamId, selected }: { mons: MyMon[]; opponents: OppMon[]; teamId: string; selected: string[] }) {
  const setSelected = useBattle((s) => s.setSelected);
  // Put the pair first (they lead), keep the rest of the current picks behind them
  const leadWith = (p: UIPair) => setSelected(teamId, [p.a.id, p.b.id, ...selected.filter((id) => id !== p.a.id && id !== p.b.id)]);
  const isLead = (p: UIPair) => selected.slice(0, 2).includes(p.a.id) && selected.slice(0, 2).includes(p.b.id);
  const syn = mons.map((m) => ({ ...m, spe: m.stats.spe, item: m.member.item, forme: m.forme }));
  const pairs = rankPairs(syn, opponents.map((o) => [...o.forme.types]));
  const team = teamNotes(syn);
  const top = pairs.slice(0, 3);
  const rest = pairs.slice(3);
  const coverage = (p: UIPair) => opponents.filter((o) => bestHit(p.a, o.forme.types).mult >= 2 || bestHit(p.b, o.forme.types).mult >= 2).length;

  return (
    <section data-anim="fade" className="card min-w-0 space-y-4 p-4">
      <div>
        <h3 className="font-semibold">Synergy</h3>
        <p className="text-xs text-slate-400">
          How your picks work as partners: spread moves hitting allies, weather and terrain, speed control, support combos and shared weaknesses.
          {opponents.length ? " Lead ranking also counts how hard each pair hits the opponent's team." : " Add opponents to factor their team into the lead ranking."}
        </p>
      </div>

      {team.length > 0 && (
        <div className="rounded-lg border border-amber-900/70 bg-amber-950/30 px-3 py-2">
          <div className="mb-1 text-xs font-semibold text-amber-200">Team check</div>
          <ul className="space-y-0.5 text-xs text-amber-100/90">
            {team.map((n) => (
              <li key={n.text}>⚠ {n.text}</li>
            ))}
          </ul>
        </div>
      )}

      {pairs.length === 0 ? (
        <p className="text-sm text-slate-400">Need at least 2 Pokémon.</p>
      ) : (
        <>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Best leads</h4>
            <div className="grid gap-2 lg:grid-cols-3">
              {top.map((p, i) => (
                <div key={p.a.id + p.b.id} data-anim="tile" className={`space-y-2 rounded-xl border p-3 ${i === 0 ? "border-indigo-500 bg-indigo-950/40" : "border-slate-800 bg-slate-900/60"}`}>
                  <PairHead pair={p} />
                  <button
                    className={`btn w-full px-2 py-1 text-[10px] ${isLead(p) ? "border-amber-200 bg-amber-500 text-slate-950" : "btn-ghost"}`}
                    onClick={() => leadWith(p)}
                    aria-pressed={isLead(p)}
                  >
                    {isLead(p) ? "Leading" : "Lead these"}
                  </button>
                  {opponents.length > 0 && (
                    <div className="text-[11px] text-slate-400">
                      Hits <span className="font-semibold text-slate-200">{coverage(p)}</span>/{opponents.length} of their team super-effectively
                    </div>
                  )}
                  <NoteList notes={p.notes} limit={6} />
                </div>
              ))}
            </div>
          </div>

          {rest.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Other pairs</h4>
              <div className="space-y-1">
                {rest.map((p, i) => (
                  <details key={p.a.id + p.b.id} data-anim="row" className="group rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1.5">
                    <summary className="cursor-pointer list-none">
                      <PairHead pair={p} rank={i + 4} />
                    </summary>
                    <div className="mt-2 pl-7">
                      <NoteList notes={p.notes} />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
