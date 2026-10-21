import type { StatID, StatsTable } from "@pkmn/dex";

export type { StatID, StatsTable };

export const STAT_IDS: StatID[] = ["hp", "atk", "def", "spa", "spd", "spe"];

export const STAT_LABELS: Record<StatID, string> = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

export interface TeamMember {
  id: string;
  species: string;
  item: string;
  ability: string;
  nature: string;
  /** Champions Stat Points: 66 total, max 32 per stat. */
  sp: StatsTable;
  moves: string[];
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
  /** Last time the battle screen was opened with this team. */
  lastUsedAt?: string;
}

export const emptyStats = (): StatsTable => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
