import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="sky scanlines relative flex flex-1 items-center justify-center px-4 py-24">
      <div className="relative z-10 text-center">
        <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-duo">Error 404</p>
        <h1 className="pixel-shadow mt-3 text-3xl sm:text-4xl">A wild 404 appeared!</h1>
        <p className="mt-4 text-slate-300">This page fled. It may have moved, or never existed.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/teams" className="btn btn-primary">
            ▶ My teams
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
