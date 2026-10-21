"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { MegaStoneButton } from "@/components/shared/MegaStone";
import { exitThen, megaFlash, pulse } from "@/lib/motion";
import { abilitiesOf, getMegaFormes, getSpecies, type Species } from "@/lib/dex";
import { searchSpecies } from "@/lib/search";
import { defensiveProfile, TYPES } from "@/lib/typechart";
import { LIST_SEPARATORS, parseOpponentList } from "@/lib/opponents";
import { MAX_OPPONENTS, useBattle, useFaced } from "@/store/battle";
import { Combobox, type ComboOption } from "@/components/shared/Combobox";
import { Sprite } from "@/components/shared/Sprite";
import { StatBars, StatLine } from "@/components/shared/StatBars";
import { TypeList } from "@/components/shared/TypeBadge";
import { WeaknessChips } from "@/components/shared/WeaknessChips";
import type { OppMon } from "./battleMons";

const search = (q: string): ComboOption[] =>
  searchSpecies(q, 20).map((s) => ({
    value: s.name,
    label: s.name,
    hint: getMegaFormes(s).length ? `${s.types.join("/")} · Mega` : s.types.join("/"),
  }));

export function OpponentPanel({
  opponents,
  details,
  searchRef,
  actions,
  focusId,
  onFocus,
}: {
  opponents: OppMon[];
  details: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  focusId: string | null;
  onFocus: (id: string) => void;
  /** Battle-wide buttons (Suggest, New battle…) shown on the search row. */
  actions?: ReactNode;
}) {
  const { addOpponent, clearOpponents, removeLastOpponent } = useBattle();
  const faced = useFaced((s) => s.counts);
  const full = opponents.length >= MAX_OPPONENTS;

  const addMany = (text: string) => {
    if (!LIST_SEPARATORS.test(text)) return false;
    for (const name of parseOpponentList(text)) addOpponent(name);
    return true;
  };

  const shown = new Set(opponents.map((o) => o.opp.species));
  const frequent = Object.entries(faced)
    .filter(([name, n]) => n >= 2 && !shown.has(name))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([name]) => getSpecies(name))
    .filter((s): s is Species => !!s);
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="shrink-0 text-sm">
          Opponent <span className="font-normal text-slate-500">{opponents.length}/{MAX_OPPONENTS}</span>
        </h2>
        <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-56 sm:flex-1">
          <Combobox
            options={[]}
            search={search}
            clearOnSelect
            onChange={addOpponent}
            onSubmitQuery={addMany}
            onPasteText={addMany}
            onEmptyBackspace={removeLastOpponent}
            autoFocus
            inputRef={searchRef}
            placeholder={full ? "Opponent team is full" : "Add opponents: incin, flutter, kanga…  ( / )"}
          />
        </div>
        {opponents.length > 0 && (
          <button className="text-xs text-slate-400 hover:text-slate-200" onClick={clearOpponents}>
            Clear
          </button>
        )}
        {actions && <div className="ml-auto flex flex-wrap justify-end gap-2">{actions}</div>}
      </div>
      {!full && frequent.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[11px] text-slate-500">Often faced:</span>
          {frequent.map((s) => (
            <button
              key={s.name}
              data-anim="cell"
              onClick={() => addOpponent(s.name)}
              className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 py-0.5 pl-0.5 pr-2 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-white"
            >
              <Sprite species={s} size={20} />
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {opponents.map((o) => (
          <OpponentTile key={o.opp.id} mon={o} details={details} focused={focusId === o.opp.id} onFocus={() => onFocus(o.opp.id)} />
        ))}
        {Array.from({ length: MAX_OPPONENTS - opponents.length }, (_, i) => (
          <button
            key={i}
            data-anim="fade"
            onClick={() => searchRef.current?.focus()}
            className={`min-h-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-800 text-xs text-slate-600 hover:border-slate-600 ${
              opponents.length === 0 && i === 0 ? "flex" : "hidden sm:flex"
            }`}
          >
            + Opponent
          </button>
        ))}
      </div>
    </section>
  );
}

/** Abilities that would change this Pokémon's weaknesses, so the user knows to watch for them. */
function abilityNotes(forme: Species) {
  const base = defensiveProfile(forme.types);
  return abilitiesOf(forme)
    .map((a) => {
      const prof = defensiveProfile(forme.types, a);
      const changes = TYPES.filter((t) => prof[t] !== base[t]).map((t) => `${t} ${prof[t]}×`);
      return changes.length ? `${a}: ${changes.join(", ")}` : null;
    })
    .filter(Boolean) as string[];
}

function OpponentTile({ mon, details, focused, onFocus }: { mon: OppMon; details: boolean; focused: boolean; onFocus: () => void }) {
  const { setOpponentForme, removeOpponent } = useBattle();
  const { species, forme, speed, opp } = mon;
  const megas = getMegaFormes(species);
  const notes = abilityNotes(forme);
  const tileRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const prevForme = useRef(forme.name);

  useEffect(() => {
    if (prevForme.current === forme.name) return;
    prevForme.current = forme.name;
    if (forme.isMega) megaFlash(spriteRef.current);
    else pulse(spriteRef.current, 0.85);
  }, [forme.name, forme.isMega]);

  return (
    <div
      ref={tileRef}
      data-anim="tile"
      role="button"
      tabIndex={0}
      aria-pressed={focused}
      aria-label={`${forme.name}: compare with your team`}
      title={focused ? "Stop comparing" : `Compare ${forme.name} with your team`}
      onClick={onFocus}
      onKeyDown={(e) => e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onFocus())}
      className={`tile relative flex cursor-pointer flex-col gap-1.5 p-2 ${
        focused ? "border-fuchsia-400 shadow-[0_3px_0_0_#04060c,0_0_0_2px_rgb(217_70_239/0.35)]" : forme.isMega ? "border-fuchsia-500" : "hover:border-slate-500"
      }`}
    >
      {focused && (
        <span className="absolute -top-2 left-2 rounded-sm border border-fuchsia-300 bg-fuchsia-600 px-1 font-pixel text-[8px] uppercase text-white">Comparing</span>
      )}
      <button
        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-red-400"
        onClick={(e) => {
          e.stopPropagation();
          exitThen(tileRef.current, () => removeOpponent(opp.id));
        }}
        aria-label={`Remove ${species.name}`}
      >
        ✕
      </button>
      <div className="flex items-center gap-2 pr-6">
        <div className="relative shrink-0">
          <div ref={spriteRef}>
            <Sprite species={forme} size={52} />
          </div>
          {megas.length > 0 && (
            <MegaStoneButton
              active={!!forme.isMega}
              label={forme.isMega && megas.length > 1 ? forme.forme.replace(/^Mega-?/, "") : undefined}
              onClick={() => {
                // cycle Base → Mega (→ Mega Y) → Base
                const order = [species, ...megas];
                const next = order[(order.findIndex((f) => f.name === forme.name) + 1) % order.length];
                setOpponentForme(opp.id, next.name);
              }}
              title={
                megas.length > 1
                  ? `Cycle formes (now ${forme.isMega ? forme.name : "Base"})`
                  : forme.isMega
                    ? `Revert to ${species.name}`
                    : `Show ${megas[0].name}`
              }
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight">{forme.name}</div>
          <TypeList types={forme.types} small />
        </div>
      </div>

      <WeaknessChips profile={defensiveProfile(forme.types)} compact minimal={!details} />
      {notes.length > 0 && (
        <div className="text-[10px] leading-tight text-amber-300/90" title={notes.join("\n")}>
          ⚠ {notes.map((n) => n.split(":")[0]).join(", ")}
        </div>
      )}

      {!details && <StatLine stats={forme.baseStats} />}

      <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
        {(
          [
            ["Max", speed.neutralMax],
            ["Max+", speed.plusMax],
            ["Scarf", speed.scarf],
          ] as const
        ).map(([l, v]) => (
          <div key={l} className="rounded bg-slate-800/70 py-0.5">
            <div className="text-slate-500">Spe {l}</div>
            <div className="font-mono text-xs font-semibold">{v}</div>
          </div>
        ))}
      </div>

      {details && (
        <>
          <div className="text-[10px] text-slate-400">
            {Object.entries(forme.abilities)
              .map(([slot, a]) => (slot === "H" ? `${a} (H)` : a))
              .join(" · ")}
          </div>
          {notes.length > 0 && (
            <ul className="space-y-0.5 text-[10px] text-amber-300/90">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          <StatBars stats={forme.baseStats} compare={forme.isMega ? getSpecies(forme.baseSpecies)?.baseStats : undefined} />
        </>
      )}
    </div>
  );
}
