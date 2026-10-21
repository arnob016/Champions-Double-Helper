"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { newId } from "@/lib/types";

export interface Opponent {
  id: string;
  species: string;
  /** The forme shown and used in calcs: the base species or one of its Megas. */
  forme: string;
}

/** What "New battle" clears, kept so it can be undone. */
export interface BattleSnapshot {
  teamId: string;
  selected: string[];
  mega: string | null;
  opponents: Opponent[];
}

interface BattleState {
  /** Picked 4, per team. */
  selected: Record<string, string[]>;
  /** The one member (per team) shown in Mega form. Only one Mega per battle. */
  mega: Record<string, string | null>;
  opponents: Opponent[];
  toggleSelected: (teamId: string, memberId: string) => void;
  setSelected: (teamId: string, ids: string[]) => void;
  clearSelected: (teamId: string) => void;
  setMega: (teamId: string, memberId: string | null) => void;
  addOpponent: (species: string) => void;
  setOpponentForme: (id: string, forme: string) => void;
  removeOpponent: (id: string) => void;
  removeLastOpponent: () => void;
  clearOpponents: () => void;
  newBattle: (teamId: string) => BattleSnapshot;
  restore: (snap: BattleSnapshot) => void;
}

export const MAX_PICK = 4;
export const MAX_OPPONENTS = 6;

export const useBattle = create<BattleState>()(
  persist(
    (set, get) => ({
      selected: {},
      mega: {},
      opponents: [],
      toggleSelected: (teamId, memberId) =>
        set((s) => {
          const cur = s.selected[teamId] ?? [];
          const next = cur.includes(memberId) ? cur.filter((x) => x !== memberId) : cur.length < MAX_PICK ? [...cur, memberId] : cur;
          return { selected: { ...s.selected, [teamId]: next } };
        }),
      setSelected: (teamId, ids) => set((s) => ({ selected: { ...s.selected, [teamId]: ids.slice(0, MAX_PICK) } })),
      clearSelected: (teamId) => set((s) => ({ selected: { ...s.selected, [teamId]: [] } })),
      setMega: (teamId, memberId) => set((s) => ({ mega: { ...s.mega, [teamId]: memberId } })),
      addOpponent: (species) => {
        const s = get();
        if (s.opponents.length >= MAX_OPPONENTS || s.opponents.some((o) => o.species === species)) return;
        set({ opponents: [...s.opponents, { id: newId(), species, forme: species }] });
        useFaced.getState().record(species);
      },
      setOpponentForme: (id, forme) => set((s) => ({ opponents: s.opponents.map((o) => (o.id === id ? { ...o, forme } : o)) })),
      removeOpponent: (id) => set((s) => ({ opponents: s.opponents.filter((o) => o.id !== id) })),
      removeLastOpponent: () => set((s) => ({ opponents: s.opponents.slice(0, -1) })),
      clearOpponents: () => set({ opponents: [] }),
      newBattle: (teamId) => {
        const s = get();
        const snap = { teamId, selected: s.selected[teamId] ?? [], mega: s.mega[teamId] ?? null, opponents: s.opponents };
        set({ opponents: [], selected: { ...s.selected, [teamId]: [] }, mega: { ...s.mega, [teamId]: null } });
        return snap;
      },
      restore: (snap) =>
        set((s) => ({
          opponents: snap.opponents,
          selected: { ...s.selected, [snap.teamId]: snap.selected },
          mega: { ...s.mega, [snap.teamId]: snap.mega },
        })),
    }),
    // sessionStorage: survives a refresh mid-preview, resets for a new browser session
    { name: "champions-battle", storage: createJSONStorage(() => sessionStorage) },
  ),
);

interface FacedState {
  /** How often each species has been added as an opponent. */
  counts: Record<string, number>;
  record: (species: string) => void;
  forget: (species: string) => void;
}

export const useFaced = create<FacedState>()(
  persist(
    (set) => ({
      counts: {},
      record: (species) => set((s) => ({ counts: { ...s.counts, [species]: (s.counts[species] ?? 0) + 1 } })),
      forget: (species) =>
        set((s) => {
          const counts = { ...s.counts };
          delete counts[species];
          return { counts };
        }),
    }),
    { name: "champions-faced" },
  ),
);
