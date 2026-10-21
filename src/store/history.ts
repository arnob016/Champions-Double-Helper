"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newId } from "@/lib/types";

export interface BattleRecord {
  id: string;
  teamId: string;
  date: string;
  result: "W" | "L";
  /** Species you brought, in pick order (first two led). */
  picks: string[];
  opponents: string[];
}

interface HistoryState {
  records: BattleRecord[];
  add: (rec: Omit<BattleRecord, "id" | "date">) => string;
  remove: (id: string) => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      add: (rec) => {
        const id = newId();
        set((s) => ({ records: [{ ...rec, id, date: new Date().toISOString() }, ...s.records].slice(0, 500) }));
        return id;
      },
      remove: (id) => set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
    }),
    { name: "champions-history" },
  ),
);

export function recordFor(records: BattleRecord[], teamId: string) {
  const mine = records.filter((r) => r.teamId === teamId);
  return { wins: mine.filter((r) => r.result === "W").length, losses: mine.filter((r) => r.result === "L").length, recent: mine };
}
