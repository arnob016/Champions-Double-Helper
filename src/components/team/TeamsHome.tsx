"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAnimateIn } from "@/lib/motion";
import { getSpecies } from "@/lib/dex";
import { recordFor, useHistory } from "@/store/history";
import { useHydrated, useTeams } from "@/store/teams";
import { Sprite } from "@/components/shared/Sprite";
import { Modal } from "@/components/shared/Modal";
import { ImportDialog } from "./ImportDialog";
import { MemberCard } from "./MemberCard";

function SpeciesRow({ names }: { names: string[] }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center">
      {names.map((n) => {
        const s = getSpecies(n);
        return s ? <Sprite key={n} species={s} size={28} /> : null;
      })}
      {!names.length && <span className="text-[10px] text-slate-600">—</span>}
    </span>
  );
}

export function TeamsHome({ openImport = false }: { openImport?: boolean }) {
  const hydrated = useHydrated();
  const { teams, createTeam, deleteTeam, duplicateTeam } = useTeams();
  const [importing, setImporting] = useState(openImport);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewTeam = teams.find((t) => t.id === preview);
  const records = useHistory((s) => s.records);
  const removeRecord = useHistory((s) => s.remove);
  // most recently battled (or edited) first
  const sorted = [...teams].sort((a, b) => (b.lastUsedAt ?? b.updatedAt).localeCompare(a.lastUsedAt ?? a.updatedAt));
  const previewRecord = previewTeam ? recordFor(records, previewTeam.id) : undefined;
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  useAnimateIn(rootRef);

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your teams</h1>
          <p className="text-sm text-slate-400">Build a team once, then open Battle at team preview.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setImporting(true)}>
            Import from Showdown
          </button>
          <button className="btn btn-primary" onClick={() => router.push(`/teams/${createTeam()}`)}>
            + New team
          </button>
        </div>
      </div>

      {!hydrated ? (
        <p className="text-slate-500">Loading…</p>
      ) : teams.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">No teams yet. Create one or import a Showdown paste.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((t, idx) => {
            const rec = recordFor(records, t.id);
            return (
            <div
              key={t.id}
              data-anim="tile"
              role="button"
              tabIndex={0}
              aria-label={`Preview ${t.name}`}
              onClick={() => setPreview(t.id)}
              onKeyDown={(e) => e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPreview(t.id))}
              className="card flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:border-slate-500"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate font-semibold" title={t.name}>
                  {t.name}
                </h2>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                  {idx === 0 && t.lastUsedAt && (
                    <span className="rounded-sm border border-indigo-400 bg-indigo-950 px-1 font-pixel text-[8px] uppercase text-indigo-200">Last used</span>
                  )}
                  {rec.wins + rec.losses > 0 && (
                    <span className="font-pixel text-[10px]" title={`${rec.wins} wins, ${rec.losses} losses`}>
                      <span className="text-emerald-400">{rec.wins}W</span>-<span className="text-red-400">{rec.losses}L</span>
                    </span>
                  )}
                  {t.members.length}/6
                </span>
              </div>
              <div className="flex min-h-12 flex-wrap gap-1">
                {t.members.map((m) => {
                  const s = getSpecies(m.species);
                  return s ? <Sprite key={m.id} species={s} size={44} /> : null;
                })}
              </div>
              {/* buttons act on their own; don't also open the preview */}
              <div className="mt-auto flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Link href={`/battle/${t.id}`} className={`btn btn-primary flex-1 ${t.members.length ? "" : "pointer-events-none opacity-40"}`}>
                  Battle
                </Link>
                <Link href={`/teams/${t.id}`} className="btn btn-ghost">
                  Edit
                </Link>
                <button className="btn btn-ghost" onClick={() => duplicateTeam(t.id)}>
                  Copy
                </button>
                {confirmDelete === t.id ? (
                  <button className="btn btn-danger" onClick={() => deleteTeam(t.id)} onBlur={() => setConfirmDelete(null)} autoFocus>
                    Confirm
                  </button>
                ) : (
                  <button className="btn btn-danger" onClick={() => setConfirmDelete(t.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {previewTeam && (
        <Modal title={previewTeam.name} onClose={() => setPreview(null)} wide="xl">
          {previewTeam.members.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {previewTeam.members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">This team is empty.</p>
          )}
          {previewRecord && previewRecord.recent.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs">
                Recent battles{" "}
                <span className="font-normal">
                  <span className="text-emerald-400">{previewRecord.wins}W</span>-<span className="text-red-400">{previewRecord.losses}L</span>
                </span>
              </h3>
              <ul className="max-h-60 space-y-1 overflow-y-auto pr-1">
                {previewRecord.recent.slice(0, 20).map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-md border-2 border-slate-800 bg-slate-950/60 px-2 py-1">
                    <span
                      className={`w-6 shrink-0 rounded-sm text-center font-pixel text-[10px] font-bold ${r.result === "W" ? "bg-emerald-600 text-white" : "bg-red-700 text-white"}`}
                    >
                      {r.result}
                    </span>
                    <SpeciesRow names={r.picks} />
                    <span className="font-pixel text-[9px] text-slate-500">vs</span>
                    <SpeciesRow names={r.opponents} />
                    <span className="ml-auto shrink-0 text-[10px] text-slate-500">{new Date(r.date).toLocaleDateString()}</span>
                    <button className="shrink-0 text-xs text-slate-600 hover:text-red-400" onClick={() => removeRecord(r.id)} aria-label="Delete this record">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t-2 border-slate-800 pt-4">
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>
              Close
            </button>
            <Link href={`/teams/${previewTeam.id}`} onClick={() => setPreview(null)} className="btn btn-ghost">
              Edit
            </Link>
            <Link href={`/battle/${previewTeam.id}`} onClick={() => setPreview(null)} className={`btn btn-primary ${previewTeam.members.length ? "" : "pointer-events-none opacity-40"}`}>
              Battle →
            </Link>
          </div>
        </Modal>
      )}

      {importing && (
        <ImportDialog
          onClose={() => {
            setImporting(false);
            if (openImport) router.replace("/teams");
          }}
          onImport={(members) => {
            setImporting(false);
            router.push(`/teams/${createTeam("Imported team", members)}`);
          }}
        />
      )}
    </div>
  );
}
