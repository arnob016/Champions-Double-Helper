"use client";

import { animate } from "animejs";
import { useEffect, useRef } from "react";
import { getSpecies, type Species } from "@/lib/dex";
import { reducedMotion } from "@/lib/motion";
import { Sprite } from "@/components/shared/Sprite";

const PARADE = ["Pikachu", "Charizard", "Garchomp", "Incineroar", "Gengar", "Dragonite", "Sneasler", "Rillaboom", "Pelipper", "Kingambit"];

/** Pixel Pokémon strolling right-to-left across the grass (Gen 5 sprites already face left). */
export function Walkers() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const walkers = [...el.querySelectorAll<HTMLElement>("[data-walker]")];
    const anims = walkers.flatMap((w, i) => {
      const duration = 16000 + ((i * 3700) % 9000);
      return [
        animate(w, { left: ["105%", "-12%"], duration, delay: i * 2300, loop: true, ease: "linear" }),
        // two-frame hop, like an overworld walk cycle
        animate(w.firstElementChild!, { translateY: [0, -4], duration: 260, loop: true, alternate: true, ease: "steps(2)" }),
      ];
    });
    return () => anims.forEach((a) => a.revert());
  }, []);

  return (
    <div ref={root} className="relative h-20 overflow-hidden" aria-hidden>
      {PARADE.map((n, i) => (
        <div key={n} data-walker className="absolute bottom-3" style={{ left: `${(i * 11) % 100}%` }}>
          <div>
            <Sprite species={getSpecies(n) as Species} size={56} />
          </div>
        </div>
      ))}
      <div className="ground absolute inset-x-0 bottom-0 h-4" />
    </div>
  );
}
