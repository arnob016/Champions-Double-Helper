"use client";

import { createTimeline } from "animejs";
import { useLayoutEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";
import { cssVar, useTheme } from "@/lib/theme";

const KEYS: { key: string; caption: string }[] = [
  { key: "/", caption: "Jump to search" },
  { key: "1", caption: "Pick lead 1" },
  { key: "3", caption: "Pick lead 2" },
  { key: "5", caption: "Pick back 1" },
  { key: "6", caption: "Pick back 2" },
  { key: "S", caption: "Suggest the best 4" },
  { key: "T", caption: "Check synergy" },
  { key: "N", caption: "Next battle" },
];

/** A keyboard that presses itself through a whole team preview. */
export function ShortcutDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const keys = el.querySelectorAll<HTMLElement>("[data-key]");
    const caption = el.querySelector<HTMLElement>("[data-caption]")!;
    // anime.js can't tween var(), so resolve the theme's colours up front
    const [bg, lit, edge, litEdge, shadow] = ["--color-slate-900", "--color-indigo-600", "--color-slate-600", "--color-indigo-300", "--shadow-hard"].map(cssVar);
    const tl = createTimeline({ loop: true, loopDelay: 800 });
    keys.forEach((k, i) => {
      const at = i * 850;
      tl.call(() => (caption.textContent = KEYS[i].caption), at).add(
        k,
        {
          translateY: [0, 4, 0],
          backgroundColor: [bg, lit, bg],
          borderColor: [edge, litEdge, edge],
          boxShadow: [`0 4px 0 0 ${shadow}`, `0 0 0 0 ${shadow}`, `0 4px 0 0 ${shadow}`],
          duration: 520,
          ease: "outQuad",
        },
        at,
      );
    });
    return () => {
      tl.revert();
    };
  }, [theme]);

  return (
    <div ref={root} className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {KEYS.map(({ key }) => (
          <span
            key={key}
            data-key
            className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-slate-600 bg-slate-900 font-pixel text-lg text-white shadow-[0_4px_0_0_var(--shadow-hard)]"
          >
            {key}
          </span>
        ))}
      </div>
      <p className="font-pixel text-sm uppercase tracking-wider text-indigo-300" aria-live="off">
        <span className="mr-2 text-slate-500">▶</span>
        <span data-caption>{KEYS[0].caption}</span>
      </p>
    </div>
  );
}
