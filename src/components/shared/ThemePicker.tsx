"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { THEMES } from "@/lib/themes";

function Swatch({ colors }: { colors: readonly string[] }) {
  return (
    <span className="flex shrink-0 border-2 border-slate-600" aria-hidden>
      {colors.map((c, i) => (
        <span key={i} className="h-2.5 w-1.5" style={{ backgroundColor: c }} />
      ))}
    </span>
  );
}

/** Header dropdown for the game-version colour themes. */
export function ThemePicker() {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-pixel text-xs uppercase text-slate-300 hover:bg-slate-800 hover:text-white"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Colour theme: ${active.name}`}
        title="Colour theme"
      >
        <Swatch colors={active.swatch} />
        <span className="hidden sm:inline">{active.name}</span>
        <span aria-hidden>▾</span>
      </button>
      {open && (
        <div role="menu" aria-label="Colour theme" className="card absolute right-0 top-full z-40 mt-1 w-48 p-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="menuitemradio"
              aria-checked={t.id === theme}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-pixel text-xs uppercase hover:bg-slate-800 ${
                t.id === theme ? "text-indigo-300" : "text-slate-300 hover:text-white"
              }`}
            >
              <Swatch colors={t.swatch} />
              <span className="flex-1">{t.name}</span>
              {t.id === theme && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
