import { getMove, getSpecies, megaFromItem } from "@/lib/dex";
import { computeStats } from "@/lib/stats";
import type { TeamMember } from "@/lib/types";
import { Sprite } from "@/components/shared/Sprite";
import { StatLine } from "@/components/shared/StatBars";
import { TypeBadge, TypeList } from "@/components/shared/TypeBadge";

export function MoveChip({ name }: { name: string }) {
  const move = getMove(name);
  return (
    <span className="flex items-center gap-1.5 truncate rounded bg-slate-800/70 px-1.5 py-0.5 text-xs">
      {move && <TypeBadge type={move.type} small />}
      <span className="truncate">{name}</span>
    </span>
  );
}

export function MemberCard({ member, children }: { member: TeamMember; children?: React.ReactNode }) {
  const species = getSpecies(member.species);
  if (!species) return <div className="card p-3 text-sm text-red-400">Unknown Pokémon: {member.species}</div>;
  const stats = computeStats(species.baseStats, member.sp, member.nature);
  const mega = megaFromItem(member.species, member.item);
  return (
    <div data-anim="tile" className="card flex flex-col gap-2 p-3">
      <div className="flex items-center gap-3">
        <Sprite species={species} size={56} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{species.name}</div>
          <TypeList types={species.types} small />
          <div className="mt-0.5 truncate text-xs text-slate-400">
            {member.item || "No item"} · {member.ability} · {member.nature}
          </div>
          {mega && <div className="text-[11px] text-fuchsia-300">Can Mega Evolve → {mega.name}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {member.moves.map((mv) => (
          <MoveChip key={mv} name={mv} />
        ))}
      </div>
      <StatLine stats={stats} />
      {children}
    </div>
  );
}
