"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useAnimateIn } from "@/lib/motion";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { exportShowdown } from "@/lib/showdown";
import type { TeamMember } from "@/lib/types";
import { useHydrated, useTeams } from "@/store/teams";
import { Modal } from "@/components/shared/Modal";
import { ImportDialog } from "./ImportDialog";
import { MemberCard } from "./MemberCard";
import { blankMember, MemberEditor } from "./MemberEditor";

export function TeamEditor({ id }: { id: string }) {
  const hydrated = useHydrated();
  const team = useTeams((s) => s.teams.find((t) => t.id === id));
  useDocumentTitle(team ? `Edit ${team.name}` : undefined);
  const { renameTeam, saveMember, removeMember, setMembers, moveMember } = useTeams();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useAnimateIn(rootRef);

  if (!hydrated) return <p className="text-slate-500">Loading…</p>;
  if (!team)
    return (
      <div className="card p-8 text-center">
        <p className="mb-4 text-slate-400">Team not found.</p>
        <Link href="/teams" className="btn btn-ghost">
          Back to teams
        </Link>
      </div>
    );

  const exportText = exportShowdown(team.members);

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/teams" className="text-sm text-slate-400 hover:text-slate-200">
          ← Teams
        </Link>
        <input
          className="input max-w-sm flex-1 text-lg font-semibold"
          value={team.name}
          onChange={(e) => renameTeam(team.id, e.target.value)}
          aria-label="Team name"
        />
        <div className="ml-auto flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => setImporting(true)}>
            Import
          </button>
          <button className="btn btn-ghost" disabled={!team.members.length} onClick={() => setExporting(true)}>
            Export
          </button>
          <Link href={`/battle/${team.id}`} className={`btn btn-primary ${team.members.length ? "" : "pointer-events-none opacity-40"}`}>
            Battle →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.members.map((m, i) => (
          <MemberCard key={m.id} member={m}>
            <div className="flex gap-2">
              <button className="btn btn-ghost px-2 py-1" disabled={i === 0} onClick={() => moveMember(team.id, m.id, -1)} aria-label="Move left" title="Move left">
                ◀
              </button>
              <button
                className="btn btn-ghost px-2 py-1"
                disabled={i === team.members.length - 1}
                onClick={() => moveMember(team.id, m.id, 1)}
                aria-label="Move right"
                title="Move right"
              >
                ▶
              </button>
              <button className="btn btn-ghost flex-1 py-1" onClick={() => setEditing(m)}>
                Edit
              </button>
              <button className="btn btn-danger py-1" onClick={() => removeMember(team.id, m.id)}>
                Remove
              </button>
            </div>
          </MemberCard>
        ))}
        {Array.from({ length: 6 - team.members.length }, (_, i) => (
          <button
            key={i}
            data-anim="tile"
            onClick={() => setEditing(blankMember())}
            className="flex min-h-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-800 text-slate-500 transition-colors hover:border-indigo-600 hover:text-indigo-300"
          >
            + Add Pokémon
          </button>
        ))}
      </div>

      {editing && (
        <MemberEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(m) => {
            saveMember(team.id, m);
            setEditing(null);
          }}
        />
      )}

      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImport={(members) => {
            setMembers(team.id, members);
            setImporting(false);
          }}
        />
      )}

      {exporting && (
        <Modal title="Export (Showdown format)" onClose={() => setExporting(false)} wide>
          <textarea readOnly className="input h-80 font-mono text-xs" value={exportText} onFocus={(e) => e.target.select()} />
          <div className="mt-3 flex justify-end">
            <button
              className="btn btn-primary"
              onClick={async () => {
                await navigator.clipboard.writeText(exportText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
