"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_KEY, THEMES, type ThemeId } from "./themes";

const EVENT = "theme-change";

function current(): ThemeId {
  const t = document.documentElement.dataset.theme;
  return THEMES.some((x) => x.id === t) ? (t as ThemeId) : "blue";
}

/** The active colour theme, kept on <html data-theme> and in localStorage. */
export function useTheme(): [ThemeId, (t: ThemeId) => void] {
  const theme = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    current,
    () => "blue" as ThemeId,
  );
  const set = useCallback((t: ThemeId) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--color-slate-950").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [theme, set];
}

/** Read a CSS custom property off <html>, for JS animations that can't take var(). */
export function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
