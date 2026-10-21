"use client";

import Link from "next/link";

/** Shown if a page crashes. Teams live in localStorage, so nothing is lost by retrying. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="card max-w-md p-6 text-center">
        <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-red-400">Something fainted</p>
        <h1 className="mt-3 text-2xl">It&apos;s not very effective…</h1>
        <p className="mt-3 text-sm text-slate-400">The page hit an error. Your saved teams are safe in this browser.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/teams" className="btn btn-ghost">
            My teams
          </Link>
        </div>
      </div>
    </div>
  );
}
