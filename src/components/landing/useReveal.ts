"use client";

import { animate, stagger } from "animejs";
import { useLayoutEffect, type RefObject } from "react";
import { reducedMotion } from "@/lib/motion";

/**
 * Scroll reveal: every `[data-reveal]` under `root` rises in when it first enters the
 * viewport (its `[data-reveal-item]` children stagger). `[data-count]` numbers count up.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    const blocks = [...el.querySelectorAll<HTMLElement>("[data-reveal]")];
    const itemsOf = (b: HTMLElement) => {
      const items = [...b.querySelectorAll<HTMLElement>("[data-reveal-item]")];
      return items.length ? items : [b];
    };
    for (const b of blocks) for (const i of itemsOf(b)) Object.assign(i.style, { opacity: "0", transform: "translateY(24px)" });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          const b = e.target as HTMLElement;
          animate(itemsOf(b), { opacity: [0, 1], translateY: [24, 0], duration: 600, ease: "outExpo", delay: stagger(70) });
          for (const c of b.querySelectorAll<HTMLElement>("[data-count]")) {
            const target = Number(c.dataset.count);
            const obj = { n: 0 };
            animate(obj, {
              n: [0, target],
              duration: 1400,
              ease: "outExpo",
              modifier: Math.round,
              onUpdate: () => (c.textContent = obj.n.toLocaleString()),
            });
          }
        }
      },
      { threshold: 0.15 },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [root]);
}
