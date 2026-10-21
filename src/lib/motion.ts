"use client";

import { animate, stagger, type AnimationParams } from "animejs";
import { useLayoutEffect, type RefObject } from "react";

/** Respect the OS "reduce motion" setting: no animation at all. */
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Spread a stagger over at most `maxTotal` ms so big groups (108 matrix cells) don't drag. */
const spread = (count: number, step: number, maxTotal = 450) => stagger(Math.min(step, maxTotal / Math.max(1, count)));

interface Preset {
  /** Applied inline before first paint so nothing flashes at full opacity. */
  initial: { opacity?: string; transform?: string };
  params: (count: number) => AnimationParams;
}

/** Entrance presets, picked with `data-anim="<preset>"` on an element. */
const PRESETS: Record<string, Preset> = {
  tile: {
    initial: { opacity: "0", transform: "translateY(14px) scale(0.96)" },
    params: (n) => ({ opacity: [0, 1], translateY: [14, 0], scale: [0.96, 1], duration: 450, ease: "outExpo", delay: spread(n, 45) }),
  },
  row: {
    initial: { opacity: "0", transform: "translateX(-10px)" },
    params: (n) => ({ opacity: [0, 1], translateX: [-10, 0], duration: 320, ease: "outQuad", delay: spread(n, 25) }),
  },
  cell: {
    initial: { opacity: "0", transform: "scale(0.6)" },
    params: (n) => ({ opacity: [0, 1], scale: [0.6, 1], duration: 260, ease: "outBack(1.6)", delay: spread(n, 6) }),
  },
  bar: {
    initial: { transform: "scaleX(0)" },
    params: (n) => ({ scaleX: [0, 1], duration: 600, ease: "outExpo", delay: spread(n, 40) }),
  },
  fade: {
    initial: { opacity: "0" },
    params: () => ({ opacity: [0, 1], duration: 250, ease: "outQuad" }),
  },
  modal: {
    initial: { opacity: "0", transform: "translateY(10px) scale(0.96)" },
    params: () => ({ opacity: [0, 1], translateY: [10, 0], scale: [0.96, 1], duration: 240, ease: "outQuad" }),
  },
  toast: {
    initial: { opacity: "0", transform: "translateY(24px)" },
    params: () => ({ opacity: [0, 1], translateY: [24, 0], duration: 320, ease: "outBack(1.4)" }),
  },
};

/**
 * Animate every `[data-anim]` element under `root` the first time it appears. Runs after
 * every render, so anything React mounts later (a new opponent, a tab's content) also animates.
 */
export function useAnimateIn(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const fresh = [...el.querySelectorAll<HTMLElement>("[data-anim]:not([data-anim-done])")];
    if (!fresh.length) return;
    for (const f of fresh) f.dataset.animDone = "";
    if (reducedMotion()) return;
    const groups = new Map<string, HTMLElement[]>();
    for (const f of fresh) {
      const kind = f.dataset.anim!;
      groups.set(kind, [...(groups.get(kind) ?? []), f]);
    }
    for (const [kind, els] of groups) {
      const preset = PRESETS[kind];
      if (!preset) continue;
      for (const e of els) Object.assign(e.style, preset.initial);
      animate(els, preset.params(els.length));
    }
  });
}

/** Quick squash-and-spring, e.g. on picking a Pokémon. */
export function pulse(el: Element | null | undefined, amount = 0.94) {
  if (!el || reducedMotion()) return;
  animate(el, { scale: [1, amount, 1], duration: 280, ease: "outQuad" });
}

/** Badge or chip popping into place. */
export function popIn(el: Element | null | undefined, delay = 0) {
  if (!el || reducedMotion()) return;
  animate(el, { scale: [0.3, 1], opacity: [0, 1], duration: 420, delay, ease: "outBack(2.2)" });
}

/** Mega Evolution flash on a sprite. */
export function megaFlash(el: Element | null | undefined) {
  if (!el || reducedMotion()) return;
  animate(el, {
    scale: [0.6, 1.25, 1],
    rotate: [-12, 8, 0],
    filter: ["brightness(3) saturate(0)", "brightness(1.6) saturate(1.4)", "brightness(1) saturate(1)"],
    duration: 650,
    ease: "outQuad",
  });
}

/** Shrink-and-fade, then run `done` (e.g. remove from state). */
export function exitThen(el: Element | null | undefined, done: () => void) {
  if (!el || reducedMotion()) return done();
  animate(el, { opacity: 0, scale: 0.85, duration: 170, ease: "inQuad", onComplete: () => done() });
}

/** Slide an indicator under the active tab. */
export function slideTo(indicator: HTMLElement, target: HTMLElement, instant: boolean) {
  const params = { translateX: target.offsetLeft, width: target.offsetWidth, height: target.offsetHeight, top: target.offsetTop };
  if (instant || reducedMotion()) {
    indicator.style.transform = `translateX(${params.translateX}px)`;
    indicator.style.width = `${params.width}px`;
    indicator.style.height = `${params.height}px`;
    indicator.style.top = `${params.top}px`;
    return;
  }
  animate(indicator, { ...params, duration: 380, ease: "outExpo" });
}
