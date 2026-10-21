"use client";

import Link from "next/link";
import { useLocalFlag } from "@/lib/useLocalFlag";
import { Logo } from "./Logo";

/** Site header that folds away to the grass strip to give the battle screen more room. */
export function SiteHeader() {
  const [collapsed, setCollapsed] = useLocalFlag("champions-header-collapsed");

  return (
    <header className="sticky z-30 bg-slate-950/95 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      {!collapsed && (
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Champions Doubles home">
            <Logo size={28} />
            <span className="font-pixel text-sm font-bold uppercase leading-none tracking-wide">
              Champions <span className="text-indigo-400">Doubles</span>
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-1" aria-label="Main">
            <Link href="/" className="hidden rounded-md px-2.5 py-1.5 font-pixel text-xs uppercase text-slate-300 hover:bg-slate-800 hover:text-white sm:block">
              Home
            </Link>
            <Link href="/teams" className="rounded-md px-2.5 py-1.5 font-pixel text-xs uppercase text-slate-300 hover:bg-slate-800 hover:text-white">
              Teams
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="rounded-md px-2 py-1.5 font-pixel text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Collapse header"
              title="Collapse header"
            >
              ▴
            </button>
          </nav>
        </div>
      )}
      <div className="relative">
        <div className="grass" />
        {collapsed && (
          // floats over the page so the collapsed header is only the grass strip
          <div className="pointer-events-none absolute inset-x-0 top-full mx-auto flex max-w-7xl justify-end px-4 [&>*]:pointer-events-auto">
            <button
              onClick={() => setCollapsed(false)}
              className="-mt-px flex items-center gap-1.5 rounded-b-md border-2 border-t-0 border-slate-700 bg-slate-900 px-2 py-0.5 font-pixel text-[10px] uppercase text-slate-300 shadow-[0_2px_0_0_#04060c] hover:text-white"
              aria-label="Expand header"
              title="Expand header"
            >
              <Logo size={18} /> ▾
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
