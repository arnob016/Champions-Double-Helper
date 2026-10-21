"use client";

import { useEffect, useMemo, useState } from "react";
import { abilitiesOf, getMove, getSpecies, megaFromItem, natures, pickableItems, pickableSpecies, type Move } from "@/lib/dex";
import { getMovePool } from "@/lib/learnset";
import { searchSpecies } from "@/lib/search";
import { computeStats, setSp, SP_MAX, SP_TOTAL, spUsed } from "@/lib/stats";
import { emptyStats, newId, STAT_IDS, STAT_LABELS, type TeamMember } from "@/lib/types";
import { Combobox, type ComboOption } from "@/components/shared/Combobox";
import { Modal } from "@/components/shared/Modal";
import { Sprite } from "@/components/shared/Sprite";
import { TypeBadge, TypeList } from "@/components/shared/TypeBadge";

const speciesOptions: ComboOption[] = pickableSpecies.map((s) => ({ value: s.name, label: s.name, hint: s.types.join(" / ") }));
const speciesSearch = (q: string) => searchSpecies(q).map((s) => ({ value: s.name, label: s.name, hint: s.types.join(" / ") }));

const natureOptions = natures.map((n) => ({
  value: n.name,
  label: n.plus && n.plus !== n.minus ? `${n.name} (+${STAT_LABELS[n.plus]} −${STAT_LABELS[n.minus!]})` : `${n.name} (neutral)`,
}));

function moveOption(m: Move): ComboOption {
  return {
    value: m.name,
    label: m.name,
    hint: (
      <span className="flex items-center gap-1.5">
        <TypeBadge type={m.type} small />
        <span className="w-10 text-right">{m.category === "Status" ? "Status" : m.basePower || "—"}</span>
      </span>
    ),
  };
}

export function blankMember(): TeamMember {
  return { id: newId(), species: "", item: "", ability: "", nature: "Serious", sp: emptyStats(), moves: [] };
}

export function MemberEditor({ initial, onSave, onClose }: { initial: TeamMember; onSave: (m: TeamMember) => void; onClose: () => void }) {
  const [m, setM] = useState<TeamMember>(initial);
  const [pool, setPool] = useState<Move[] | null>(null);
  const [allGens, setAllGens] = useState(false);
  const species = getSpecies(m.species);

  const speciesName = species?.name;
  useEffect(() => {
    if (!speciesName) return;
    let live = true;
    getMovePool(speciesName, !allGens).then((p) => live && setPool(p));
    return () => {
      live = false;
    };
  }, [speciesName, allGens]);

  const moveOptions = useMemo(() => (pool ?? []).map(moveOption), [pool]);

  const itemOptions = useMemo(() => {
    const opts = pickableItems.map((i) => ({ value: i.name, label: i.name, hint: i.megaStone ? "Mega Stone" : undefined }));
    if (!species) return opts;
    // this species' own Mega Stones float to the top
    const own = opts.filter((o) => megaFromItem(species.name, o.value));
    return [...own, ...opts.filter((o) => !own.includes(o))];
  }, [species]);

  const pickSpecies = (name: string) => {
    const s = getSpecies(name);
    if (!s) return;
    setPool(null);
    setM((prev) => ({ ...prev, species: s.name, ability: abilitiesOf(s)[0], moves: [], item: megaFromItem(prev.species, prev.item) ? "" : prev.item }));
  };

  const setMove = (i: number, name: string) =>
    setM((prev) => {
      const moves = [...prev.moves];
      moves[i] = name;
      return { ...prev, moves: moves.filter(Boolean) };
    });

  const stats = species ? computeStats(species.baseStats, m.sp, m.nature) : undefined;
  const used = spUsed(m.sp);
  const mega = species ? megaFromItem(species.name, m.item) : undefined;
  const megaStats = mega ? computeStats(mega.baseStats, m.sp, m.nature) : undefined;

  return (
    <Modal title={initial.species ? `Edit ${initial.species}` : "Add Pokémon"} onClose={onClose} wide>
      <div className="space-y-5">
        <div>
          <label className="label">Pokémon</label>
          <Combobox options={speciesOptions} search={speciesSearch} value={m.species} onChange={pickSpecies} placeholder="Search Pokémon…" autoFocus={!m.species} />
        </div>

        {species && stats && (
          <>
            <div className="flex items-center gap-3">
              <Sprite species={species} size={72} />
              <div className="space-y-1">
                <div className="font-semibold">{species.name}</div>
                <TypeList types={species.types} />
                {mega && (
                  <div className="flex items-center gap-1.5 text-xs text-fuchsia-300">
                    Mega → {mega.name} <TypeList types={mega.types} small />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Ability</label>
                <select className="input" value={m.ability} onChange={(e) => setM({ ...m, ability: e.target.value })}>
                  {Object.entries(species.abilities).map(([slot, a]) => (
                    <option key={slot} value={a}>
                      {a}
                      {slot === "H" ? " (Hidden)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Held item</label>
                <Combobox options={itemOptions} value={m.item} onChange={(item) => setM({ ...m, item })} placeholder="Search items…" />
                {m.item && (
                  <button className="mt-1 text-xs text-slate-400 hover:text-slate-200" onClick={() => setM({ ...m, item: "" })}>
                    Clear item
                  </button>
                )}
              </div>
              <div>
                <label className="label">Nature</label>
                <select className="input" value={m.nature} onChange={(e) => setM({ ...m, nature: e.target.value })}>
                  {natureOptions.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label mb-0">Stat Points</span>
                <span className={`text-xs font-mono ${used === SP_TOTAL ? "text-emerald-400" : "text-slate-300"}`}>
                  {SP_TOTAL - used} / {SP_TOTAL} left
                </span>
              </div>
              <div className="space-y-1.5">
                {STAT_IDS.map((s) => (
                  <div key={s} className="grid grid-cols-[2.5rem_2rem_1fr_3.5rem_3rem] items-center gap-2 text-sm">
                    <span className="text-slate-400">{STAT_LABELS[s]}</span>
                    <span className="text-right font-mono text-xs text-slate-500">{species.baseStats[s]}</span>
                    <input
                      type="range"
                      min={0}
                      max={SP_MAX}
                      value={m.sp[s]}
                      onChange={(e) => setM({ ...m, sp: setSp(m.sp, s, +e.target.value) })}
                      className="accent-indigo-500"
                      aria-label={`${STAT_LABELS[s]} stat points`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={SP_MAX}
                      value={m.sp[s]}
                      onChange={(e) => setM({ ...m, sp: setSp(m.sp, s, +e.target.value) })}
                      className="input px-2 py-1 text-right font-mono"
                    />
                    <span className="text-right font-mono font-semibold tabular-nums">
                      {stats[s]}
                      {megaStats && megaStats[s] !== stats[s] && <span className="block text-[10px] text-fuchsia-300">M {megaStats[s]}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">Lv50, 31 IVs. Right column shows final stats.</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label mb-0">Moves</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-400">
                  <input type="checkbox" checked={allGens} onChange={(e) => setAllGens(e.target.checked)} />
                  Include past-gen moves
                </label>
              </div>
              {pool === null ? (
                <p className="text-sm text-slate-400">Loading move pool…</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-1">
                      <div className="flex-1">
                        <Combobox
                          options={moveOptions.filter((o) => o.value === m.moves[i] || !m.moves.includes(o.value))}
                          value={m.moves[i] ?? ""}
                          onChange={(v) => setMove(i, v)}
                          placeholder={`Move ${i + 1}`}
                        />
                      </div>
                      {m.moves[i] && (
                        <button className="btn btn-ghost px-2" onClick={() => setMove(i, "")} aria-label="Remove move">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {m.moves.some((mv) => !getMove(mv)) && <p className="mt-1 text-xs text-red-400">Some moves aren&apos;t recognised.</p>}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!species} onClick={() => onSave(m)}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
