"use client";

import { useEffect, useState } from "react";
import { abilitiesOf } from "@/lib/dex";
import { getMovePool } from "@/lib/learnset";
import { NOTABLE_ABILITIES, NOTABLE_MOVES, threatReport, type ThreatStatus } from "@/lib/threats";
import { multLabel } from "@/lib/typechart";
import { Sprite } from "@/components/shared/Sprite";
import { TypeList } from "@/components/shared/TypeBadge";
import type { MyMon, OppMon } from "./battleMons";

const STATUS: Record<ThreatStatus, { label: string; tone: string }> = {
  handled: { label: "Answered", tone: "bg-emerald-700 text-white" },
  risky: { label: "Risky", tone: "bg-amber-600 text-white" },
  unanswered: { label: "No answer", tone: "bg-red-600 text-white" },
};

/** Notable doubles moves each opponent species can learn, loaded on demand. */
function useNotableMoves(species: string[]) {
  const [moves, setMoves] = useState<Record<string, string[]>>({});
  const key = species.join("|");
  useEffect(() => {
    let live = true;
    for (const s of key ? key.split("|") : []) {
      getMovePool(s).then((pool) => {
        if (!live) return;
        const names = new Set<string>(pool.map((m) => m.name));
        setMoves((prev) => ({ ...prev, [s]: NOTABLE_MOVES.filter((m) => names.has(m)) }));
      });
    }
    return () => {
      live = false;
    };
  }, [key]);
  return moves;
}

export function ThreatsTab({ mons, opponents }: { mons: MyMon[]; opponents: OppMon[] }) {
  // Megas usually share the base form's moves, so look up the base species
  const notable = useNotableMoves(opponents.map((o) => o.species.name));

  if (!opponents.length)
    return (
      <section className="card p-4">
        <h3 className="font-semibold">Threats</h3>
        <p className="text-sm text-slate-400">Add the opponent&apos;s Pokémon to see who threatens you and who answers them.</p>
      </section>
    );

  const tmons = mons.map((m) => ({ ...m, spe: m.stats.spe }));
  const reports = opponents.map((o) => ({ o, r: threatReport(tmons, { types: [...o.forme.types], abilities: abilitiesOf(o.forme) }) }));
  const unanswered = reports.filter((x) => x.r.status === "unanswered");

  return (
    <section data-anim="fade" className="card min-w-0 space-y-3 p-4">
      <div>
        <h3 className="font-semibold">Threats</h3>
        <p className="text-xs text-slate-400">
          Per opponent: which of your picks its same-type moves hit super-effectively, who hits it back super-effectively without being threatened (answer), and
          the doubles tools it can learn. Moves are possibilities, not a confirmed set.
        </p>
      </div>
      {unanswered.length > 0 ? (
        <div className="rounded-lg border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          ⚠ Nothing in your picks safely hits {unanswered.map((x) => x.o.forme.name).join(", ")} super-effectively.
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-900/70 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">✓ Every opponent has at least a risky answer.</div>
      )}

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(({ o, r }) => {
          const abil = abilitiesOf(o.forme);
          const known = abil.filter((a) => NOTABLE_ABILITIES[a]);
          const moves = notable[o.species.name];
          return (
            <div key={o.opp.id} data-anim="tile" className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-2">
                <Sprite species={o.forme} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{o.forme.name}</div>
                  <TypeList types={o.forme.types} small />
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${STATUS[r.status].tone}`}>{STATUS[r.status].label}</span>
              </div>

              <Row label="Threatens">
                {r.threatened.length ? (
                  r.threatened.map((t) => (
                    <Chip key={t.mon.id} tone={t.stab >= 4 ? "bg-red-700 text-white" : "bg-orange-900 text-orange-100"}>
                      {t.mon.name} {multLabel(t.stab)}×
                    </Chip>
                  ))
                ) : (
                  <span className="text-slate-500">none of your picks</span>
                )}
              </Row>
              <Row label="Answers">
                {r.answers.length ? (
                  r.answers.map((a) => (
                    <Chip key={a.mon.id} tone="bg-emerald-900 text-emerald-100" title={a.hit.moves.join(", ")}>
                      {a.mon.name} · {a.hit.moves[0]} {multLabel(a.hit.mult)}×
                    </Chip>
                  ))
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </Row>
              {r.checks.length > 0 && (
                <Row label="Trades">
                  {r.checks.map((c) => (
                    <Chip key={c.mon.id} tone="bg-amber-900 text-amber-100" title="Hits it super-effectively but is also hit super-effectively">
                      {c.mon.name} · {c.hit.moves[0]}
                    </Chip>
                  ))}
                </Row>
              )}

              {r.warnings.length > 0 && (
                <ul className="space-y-0.5 text-[11px] text-amber-300">
                  {r.warnings.map((w) => (
                    <li key={w}>⚠ {w}</li>
                  ))}
                </ul>
              )}

              <Row label="Can learn">
                {moves === undefined ? (
                  <span className="text-slate-500">loading…</span>
                ) : moves.length ? (
                  moves.map((m) => (
                    <Chip key={m} tone="bg-slate-800 text-slate-200">
                      {m}
                    </Chip>
                  ))
                ) : (
                  <span className="text-slate-500">no notable support moves</span>
                )}
              </Row>
              {known.length > 0 && (
                <ul className="space-y-0.5 text-[11px] text-slate-300">
                  {known.map((a) => (
                    <li key={a}>
                      <span className="font-semibold text-slate-100">{a}</span> <span className="text-slate-400">— {NOTABLE_ABILITIES[a]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className="w-16 shrink-0 pt-0.5 text-slate-500">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({ children, tone, title }: { children: React.ReactNode; tone: string; title?: string }) {
  return (
    <span className={`rounded px-1.5 py-0.5 font-medium ${tone}`} title={title}>
      {children}
    </span>
  );
}
