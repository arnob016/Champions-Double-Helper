"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { slideTo, useAnimateIn } from "@/lib/motion";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useLocalFlag } from "@/lib/useLocalFlag";
import { useHistory } from "@/store/history";
import { suggestPicks } from "@/lib/suggest";
import { MAX_PICK, useBattle, type BattleSnapshot } from "@/store/battle";
import { useHydrated, useTeams } from "@/store/teams";
import { DefensiveMatrixView, MatchupGrid, OffensiveCoverage, SpeedTiers } from "./Analysis";
import { toMyMon, toOppMon, type MyMon, type OppMon } from "./battleMons";
import { MyTeamPanel } from "./MyTeamPanel";
import { OpponentPanel } from "./OpponentPanel";
import { SynergyTab } from "./SynergyTab";
import { ThreatsTab } from "./ThreatsTab";

const TABS = [
  { id: "matchups", label: "Matchups" },
  { id: "coverage", label: "Coverage" },
  { id: "defense", label: "Defense" },
  { id: "speed", label: "Speed" },
  { id: "synergy", label: "Synergy" },
  { id: "threats", label: "Threats" },
] as const;
const TAB_KEYS = "QWERTY";
type Tab = (typeof TABS)[number]["id"];

/** Keep the phone screen on during team preview. Silently does nothing where unsupported. */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const acquire = () => {
      if (document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;
      navigator.wakeLock
        .request("screen")
        .then((l) => (lock = l))
        .catch(() => {});
    };
    acquire();
    // the browser drops the lock when the tab is hidden; take it again on return
    document.addEventListener("visibilitychange", acquire);
    return () => {
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => {});
    };
  }, []);
}

const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function BattleView({ teamId }: { teamId: string }) {
  const hydrated = useHydrated();
  const team = useTeams((s) => s.teams.find((t) => t.id === teamId));
  useDocumentTitle(team ? `Battle: ${team.name}` : undefined);
  const selectedRaw = useBattle((s) => s.selected[teamId]);
  const megaId = useBattle((s) => s.mega[teamId] ?? null);
  const opponentsRaw = useBattle((s) => s.opponents);
  const { toggleSelected, setSelected, newBattle, restore } = useBattle();
  const addRecord = useHistory((s) => s.add);
  const removeRecord = useHistory((s) => s.remove);
  const markUsed = useTeams((s) => s.markUsed);
  const [tab, setTabState] = useState<Tab>(() => {
    try {
      const saved = sessionStorage.getItem("champions-tab");
      return TABS.some((t) => t.id === saved) ? (saved as Tab) : "matchups";
    } catch {
      return "matchups";
    }
  });
  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    try {
      sessionStorage.setItem("champions-tab", t);
    } catch {}
  }, []);
  const [details, setDetailsFlag] = useLocalFlag("champions-details");
  const toggleDetails = useCallback(() => setDetailsFlag(!details), [details, setDetailsFlag]);
  const [undo, setUndo] = useState<{ snap: BattleSnapshot; recordId?: string; message: string } | null>(null);
  /** Opponent tapped to compare against each of your tiles. */
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated) markUsed(teamId);
  }, [hydrated, markUsed, teamId]);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const indicatorTab = useRef<Tab | null>(null);
  useWakeLock();
  useAnimateIn(rootRef);

  // slide the highlight to the active tab (placed instantly the first time)
  useLayoutEffect(() => {
    const active = tabsRef.current?.querySelector<HTMLElement>("[aria-selected=true]");
    if (!active || !indicatorRef.current || indicatorTab.current === tab) return;
    slideTo(indicatorRef.current, active, indicatorTab.current === null);
    indicatorTab.current = tab;
  });

  // the Undo button disappears after a few seconds
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  const mons = useMemo(
    () => (team?.members ?? []).map((m) => toMyMon(m, m.id === megaId)).filter((m): m is MyMon => !!m),
    [team, megaId],
  );
  const selected = useMemo(() => (selectedRaw ?? []).filter((id) => mons.some((m) => m.id === id)), [selectedRaw, mons]);
  const opponents = useMemo(() => opponentsRaw.map(toOppMon).filter((o): o is OppMon => !!o), [opponentsRaw]);

  const suggest = useCallback(() => {
    const ids = suggestPicks(
      mons.map((m) => ({ ...m, spe: m.stats.spe })),
      opponents.map((o) => ({ types: [...o.forme.types], minSpe: o.speed.min, maxSpe: o.speed.plusMax })),
    );
    if (ids.length) setSelected(teamId, ids);
  }, [mons, opponents, setSelected, teamId]);

  const startNewBattle = useCallback(() => {
    setUndo({ snap: newBattle(teamId), message: "New battle started." });
    setFocusId(null);
    searchRef.current?.focus();
  }, [newBattle, teamId]);

  /** Log the result, then clear the board for the next game (undoable). */
  const recordResult = useCallback(
    (result: "W" | "L") => {
      const recordId = addRecord({
        teamId,
        result,
        picks: selected.map((id) => mons.find((m) => m.id === id)!.species.name),
        opponents: opponents.map((o) => o.forme.name),
      });
      setUndo({ snap: newBattle(teamId), recordId, message: result === "W" ? "Win recorded." : "Loss recorded." });
      setFocusId(null);
      searchRef.current?.focus();
    },
    [addRecord, newBattle, teamId, selected, mons, opponents],
  );

  const focusOpp = opponents.find((o) => o.opp.id === focusId);

  // Shortcuts: "/" search, 1–6 pick, S suggest, N new battle, D details, Q/W/E/R analysis tabs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= mons.length) {
        const id = mons[n - 1].id;
        if (selected.includes(id) || selected.length < MAX_PICK) toggleSelected(teamId, id);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "d") toggleDetails();
      if (k === "escape") setFocusId(null);
      if (k === "s") suggest();
      if (k === "n") {
        e.preventDefault(); // don't type "n" into the search box it focuses
        startNewBattle();
      }
      const t = TAB_KEYS.indexOf(k.toUpperCase());
      if (k.length === 1 && t >= 0) setTab(TABS[t].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mons, selected, teamId, toggleSelected, suggest, startNewBattle, toggleDetails, setTab]);

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

  // Until 4 are picked, analyse the whole team so the charts are useful right away
  const picked = selected.length ? selected.map((id) => mons.find((m) => m.id === id)!) : mons;
  const scope = selected.length ? `${selected.length} pick${selected.length > 1 ? "s" : ""}` : "whole team";

  return (
    <div ref={rootRef} className="min-w-0 space-y-3">
      <MyTeamPanel teamId={team.id} mons={mons} selected={selected} details={details} focusOpp={focusOpp} />
      <OpponentPanel
        opponents={opponents}
        details={details}
        searchRef={searchRef}
        focusId={focusOpp?.opp.id ?? null}
        onFocus={(id) => setFocusId((cur) => (cur === id ? null : id))}
        actions={
          <>
            <button
              className="btn border-emerald-500 bg-emerald-700 px-2.5 py-1.5 text-[11px] text-white hover:bg-emerald-600"
              onClick={() => recordResult("W")}
              disabled={!opponents.length}
              title="Record a win and start the next battle"
            >
              Won
            </button>
            <button
              className="btn btn-danger px-2.5 py-1.5 text-[11px]"
              onClick={() => recordResult("L")}
              disabled={!opponents.length}
              title="Record a loss and start the next battle"
            >
              Lost
            </button>
            <button
              className="btn btn-primary px-2.5 py-1.5 text-[11px]"
              onClick={suggest}
              disabled={!opponents.length}
              title="Pick 4 based on matchups against the opponent's team (S)"
            >
              ✨ Suggest 4
            </button>
            <button className="btn btn-ghost px-2.5 py-1.5 text-[11px]" onClick={startNewBattle} title="Clear opponents and picks (N)">
              New battle
            </button>
            <button
              className={`btn px-2.5 py-1.5 text-[11px] ${details ? "btn-primary" : "btn-ghost"}`}
              onClick={toggleDetails}
              aria-pressed={details}
              title="Shortcut: D"
            >
              {details ? "Details on" : "Details"}
            </button>
            <Link href={`/teams/${team.id}`} className="btn btn-ghost px-2.5 py-1.5 text-[11px]">
              Edit team
            </Link>
          </>
        }
      />

      <section className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div ref={tabsRef} role="tablist" className="relative flex max-w-full overflow-x-auto rounded-lg border-2 border-slate-700 bg-slate-950 p-0.5 shadow-[0_3px_0_0_var(--shadow-hard)]">
            <span
              ref={indicatorRef}
              aria-hidden
              className="pointer-events-none absolute left-0 rounded-md border-2 border-indigo-300 bg-indigo-600 shadow-[0_2px_0_0_var(--shadow-hard)]"
            />
            {TABS.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                title={`Shortcut: ${TAB_KEYS[i]}`}
                className={`relative shrink-0 rounded-md px-3 py-2 font-pixel text-xs uppercase transition-colors ${tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">Analysing {scope}</span>
        </div>
        {tab === "matchups" && <MatchupGrid mons={picked} opponents={opponents} />}
        {tab === "coverage" && <OffensiveCoverage mons={picked} />}
        {tab === "defense" && <DefensiveMatrixView mons={picked} />}
        {tab === "speed" && <SpeedTiers mons={picked} opponents={opponents} />}
        {tab === "synergy" && <SynergyTab mons={picked} opponents={opponents} teamId={team.id} selected={selected} />}
        {tab === "threats" && <ThreatsTab mons={picked} opponents={opponents} />}
      </section>

      <p className="hidden text-center text-[11px] text-slate-600 sm:block">
        Shortcuts: <kbd>/</kbd> search · <kbd>Backspace</kbd> remove last opponent · <kbd>1–6</kbd> pick (first two lead) · <kbd>S</kbd> suggest · <kbd>N</kbd>{" "}
        new battle · <kbd>D</kbd> details · <kbd>Q W E R T Y</kbd> tabs · tap an opponent to compare it with your team
      </p>

      {undo && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div data-anim="toast" className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm shadow-2xl">
            {undo.message}
            <button
              className="font-semibold text-indigo-300 hover:text-indigo-200"
              onClick={() => {
                restore(undo.snap);
                if (undo.recordId) removeRecord(undo.recordId);
                setUndo(null);
              }}
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
