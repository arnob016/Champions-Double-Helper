"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newId, type Team, type TeamMember } from "@/lib/types";

interface TeamsState {
  teams: Team[];
  createTeam: (name?: string, members?: TeamMember[]) => string;
  renameTeam: (id: string, name: string) => void;
  deleteTeam: (id: string) => void;
  duplicateTeam: (id: string) => string | undefined;
  saveMember: (teamId: string, member: TeamMember) => void;
  removeMember: (teamId: string, memberId: string) => void;
  setMembers: (teamId: string, members: TeamMember[]) => void;
  /** Shift a member left (-1) or right (+1). Order decides the 1–6 pick keys in battle. */
  moveMember: (teamId: string, memberId: string, dir: -1 | 1) => void;
  markUsed: (teamId: string) => void;
}

const now = () => new Date().toISOString();

export const useTeams = create<TeamsState>()(
  persist(
    (set, get) => {
      const patch = (id: string, fn: (t: Team) => Partial<Team>) =>
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...fn(t), updatedAt: now() } : t)) }));

      return {
        teams: [],
        createTeam: (name = "New team", members = []) => {
          const id = newId();
          set((s) => ({ teams: [...s.teams, { id, name, members: members.slice(0, 6), createdAt: now(), updatedAt: now() }] }));
          return id;
        },
        renameTeam: (id, name) => patch(id, () => ({ name })),
        deleteTeam: (id) => set((s) => ({ teams: s.teams.filter((t) => t.id !== id) })),
        duplicateTeam: (id) => {
          const src = get().teams.find((t) => t.id === id);
          if (!src) return;
          return get().createTeam(`${src.name} (copy)`, src.members.map((m) => ({ ...m, id: newId() })));
        },
        saveMember: (teamId, member) =>
          patch(teamId, (t) => {
            const exists = t.members.some((m) => m.id === member.id);
            if (!exists && t.members.length >= 6) return {};
            return { members: exists ? t.members.map((m) => (m.id === member.id ? member : m)) : [...t.members, member] };
          }),
        removeMember: (teamId, memberId) => patch(teamId, (t) => ({ members: t.members.filter((m) => m.id !== memberId) })),
        setMembers: (teamId, members) => patch(teamId, () => ({ members: members.slice(0, 6) })),
        // not via patch(): opening a battle shouldn't count as editing the team
        markUsed: (teamId) => set((s) => ({ teams: s.teams.map((t) => (t.id === teamId ? { ...t, lastUsedAt: now() } : t)) })),
        moveMember: (teamId, memberId, dir) =>
          patch(teamId, (t) => {
            const i = t.members.findIndex((m) => m.id === memberId);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= t.members.length) return {};
            const members = [...t.members];
            [members[i], members[j]] = [members[j], members[i]];
            return { members };
          }),
      };
    },
    { name: "champions-teams", version: 1 },
  ),
);

/** localStorage is only readable after mount; render a placeholder until then to avoid hydration mismatches. */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useTeams.persist.onFinishHydration(cb),
    () => useTeams.persist.hasHydrated(),
    () => false,
  );
}
