"use client";

import { useEffect, useRef } from "react";
import { getMove, megaFromItem } from "@/lib/dex";
import { megaFlash, popIn, pulse } from "@/lib/motion";
import { MegaStoneButton } from "@/components/shared/MegaStone";
import { bestHit } from "@/lib/coverage";
import { defensiveMultiplier, defensiveProfile, multLabel } from "@/lib/typechart";
import { MAX_PICK, useBattle } from "@/store/battle";
import { Sprite } from "@/components/shared/Sprite";
import { StatLine } from "@/components/shared/StatBars";
import { TYPE_COLORS, TypeList } from "@/components/shared/TypeBadge";
import { WeaknessChips } from "@/components/shared/WeaknessChips";
import type { MyMon, OppMon } from "./battleMons";

/** How one of your mons fares against the focused opponent. */
function FocusRow({ mon, opp }: { mon: MyMon; opp: OppMon }) {
  const hit = bestHit(mon, opp.forme.types);
  const threat = Math.max(...opp.forme.types.map((t) => defensiveMultiplier(t, mon.types, mon.ability)));
  const spe = mon.stats.spe;
  const speed =
    spe === opp.speed.plusMax || spe === opp.speed.neutralMax
      ? { label: "Tie", tone: "text-yellow-300" }
      : spe > opp.speed.plusMax
        ? { label: "Faster", tone: "text-emerald-400" }
        : spe < opp.speed.min
          ? { label: "Slower", tone: "text-red-400" }
          : { label: "Depends", tone: "text-orange-300" };
  const offTone = hit.mult >= 2 ? "bg-emerald-700 text-white" : hit.mult < 1 ? "bg-red-950 text-red-300" : "bg-slate-800 text-slate-300";
  const defTone = threat >= 4 ? "bg-red-700 text-white" : threat >= 2 ? "bg-orange-800 text-orange-50" : threat < 1 ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-300";
  return (
    <div
      className="flex items-center gap-1 rounded-sm border border-fuchsia-900/70 bg-fuchsia-950/30 px-1 py-0.5 text-[10px]"
      title={`vs ${opp.forme.name}: your best hit ${hit.moves.join(", ") || "—"}`}
    >
      <span className={`rounded-sm px-1 font-mono font-bold ${offTone}`}>↗{hit.mult < 0 ? "–" : multLabel(hit.mult)}</span>
      <span className="min-w-0 flex-1 truncate text-slate-300">{hit.moves[0] ?? "no attack"}</span>
      <span className={`rounded-sm px-1 font-mono font-bold ${defTone}`}>↙{multLabel(threat)}</span>
      <span className={`font-pixel text-[9px] uppercase ${speed.tone}`}>{speed.label}</span>
    </div>
  );
}

export function MyTeamPanel({
  teamId,
  mons,
  selected,
  details,
  focusOpp,
}: {
  teamId: string;
  mons: MyMon[];
  selected: string[];
  details: boolean;
  focusOpp?: OppMon;
}) {
  const { toggleSelected, setMega, mega } = useBattle();
  const megaId = mega[teamId] ?? null;
  const rootRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const prevSelected = useRef(selected);
  const prevMega = useRef(megaId);

  // Picks can come from taps, number keys or Suggest, so animate from the state change
  useEffect(() => {
    const root = rootRef.current;
    const before = prevSelected.current;
    prevSelected.current = selected;
    if (!root || before === selected) return;
    const tile = (id: string) => root.querySelector(`[data-mon-id="${id}"]`);
    selected
      .filter((id) => !before.includes(id))
      .forEach((id, i) => {
        pulse(tile(id));
        popIn(tile(id)?.querySelector("[data-badge]"), i * 70);
      });
    before.filter((id) => !selected.includes(id)).forEach((id) => pulse(tile(id), 0.97));
    if (selected.length === MAX_PICK && before.length !== MAX_PICK) popIn(countRef.current);
  }, [selected]);

  useEffect(() => {
    const before = prevMega.current;
    prevMega.current = megaId;
    if (megaId && megaId !== before) megaFlash(rootRef.current?.querySelector(`[data-mon-id="${megaId}"] [data-sprite]`));
  }, [megaId]);

  return (
    <section ref={rootRef} className="flex gap-2">
      {/* vertical label strip: saves a whole row above the tiles */}
      <div className="tile flex w-8 shrink-0 flex-col items-center justify-center gap-2 px-0.5 py-2" title="Tap a Pokémon or press 1–6 to pick">
        <h2 className="rotate-180 whitespace-nowrap text-xs [writing-mode:vertical-rl]">Your team</h2>
        <span
          ref={countRef}
          aria-label={`${selected.length} of ${MAX_PICK} picked`}
          className={`rounded-sm border-2 px-0.5 py-0.5 font-pixel text-[9px] leading-none transition-colors ${
            selected.length === MAX_PICK ? "border-emerald-400 bg-emerald-600 text-white" : "border-slate-600 bg-slate-800 text-slate-300"
          }`}
        >
          {selected.length}/{MAX_PICK}
        </span>
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {mons.map((mon, i) => {
          const pickIndex = selected.indexOf(mon.id);
          const picked = pickIndex >= 0;
          const full = !picked && selected.length >= MAX_PICK;
          const canMega = !!megaFromItem(mon.member.species, mon.member.item);
          return (
            <div
              key={mon.id}
              data-anim="tile"
              data-mon-id={mon.id}
              role="button"
              tabIndex={0}
              aria-pressed={picked}
              aria-disabled={full}
              aria-label={`Pick ${mon.forme.name}`}
              onClick={() => !full && toggleSelected(teamId, mon.id)}
              onKeyDown={(e) =>
                // only keys aimed at the tile itself, not its Mega Stone button
                e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && !full && (e.preventDefault(), toggleSelected(teamId, mon.id))
              }
              className={`tile relative flex cursor-pointer select-none flex-col gap-1.5 p-2 ${
                picked ? "tile-active" : full ? "cursor-not-allowed opacity-45" : "hover:border-slate-500"
              }`}
            >
              <span
                data-badge
                title={picked ? (pickIndex < 2 ? "Lead" : "Back") : `Press ${i + 1} to pick`}
                className={`absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-sm px-0.5 font-pixel text-[10px] font-bold ${
                  !picked
                    ? "border-2 border-slate-700 text-slate-500"
                    : pickIndex < 2
                      ? "border-2 border-amber-200 bg-amber-500 text-slate-950 shadow-[0_2px_0_0_#04060c]"
                      : "border-2 border-indigo-300 bg-indigo-500 text-white shadow-[0_2px_0_0_#04060c]"
                }`}
              >
                {!picked ? i + 1 : pickIndex < 2 ? `L${pickIndex + 1}` : `B${pickIndex - 1}`}
              </span>
              <div className="flex items-center gap-2 pr-6">
                <div className="relative shrink-0">
                  <div data-sprite>
                    <Sprite species={mon.forme} size={52} />
                  </div>
                  {canMega && (
                    <MegaStoneButton
                      active={megaId === mon.id}
                      onClick={() => setMega(teamId, megaId === mon.id ? null : mon.id)}
                      title={megaId === mon.id ? `Revert ${mon.species.name}` : `Mega Evolve ${mon.species.name}`}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold leading-tight">{mon.forme.name}</div>
                  <TypeList types={mon.types} small />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                <span className="truncate">{mon.ability}</span>
                <span className="shrink-0 font-mono">Spe {mon.stats.spe}</span>
              </div>
              {focusOpp && <FocusRow mon={mon} opp={focusOpp} />}
              <WeaknessChips profile={defensiveProfile(mon.types, mon.ability)} compact minimal={!details} />
              <div className="grid grid-cols-2 gap-0.5">
                {mon.moves.map((mv) => {
                  const type = getMove(mv)?.type;
                  return (
                    <span key={mv} className="flex items-center gap-1 truncate text-[10px] text-slate-300">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: type ? TYPE_COLORS[type] : "#555" }} />
                      <span className="truncate">{mv}</span>
                    </span>
                  );
                })}
              </div>
              {details && <StatLine stats={mon.stats} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
