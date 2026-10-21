"use client";

/* eslint-disable @next/next/no-img-element -- sprites come from Showdown's CDN */
import { useState } from "react";
import { Sprites } from "@pkmn/img";
import { pokeapiSpriteUrl, spriteUrl, type Species } from "@/lib/dex";

/**
 * Gen 5 pixel sprite (96×96 with empty padding), drawn a third larger than the box and
 * cropped to the middle so the Pokémon fills it. Falls back to the HOME render when a
 * pixel sprite doesn't exist (some new Megas), then to PokéAPI for Megas Showdown lacks.
 */
export function Sprite({ species, size = 64 }: { species: Species; size?: number }) {
  const [attempt, setAttempt] = useState(0);
  const [shown, setShown] = useState(species.name);
  if (shown !== species.name) {
    // Toggling a Mega swaps the species in place, so start over from the pixel sprite.
    setShown(species.name);
    setAttempt(0);
  }
  const pixel = Sprites.getPokemon(species.name, { gen: "gen5" }).url;
  const sources = [pixel, spriteUrl(species, "home-centered"), pokeapiSpriteUrl(species)].filter((u): u is string => !!u);

  if (attempt >= sources.length)
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-sm bg-slate-800 font-pixel text-[10px] text-slate-400"
        style={{ width: size, height: size }}
      >
        {species.name.slice(0, 3)}
      </div>
    );

  const isPixel = attempt === 0;
  const img = isPixel ? Math.round((size * 4) / 3) : size;
  return (
    <span role="img" aria-label={species.name} title={species.name} className="relative inline-block shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <img
        key={sources[attempt]}
        src={sources[attempt]}
        alt=""
        width={img}
        height={img}
        decoding="async"
        onError={() => setAttempt((a) => a + 1)}
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
        style={{ width: img, height: img, imageRendering: isPixel ? "pixelated" : "auto" }}
      />
    </span>
  );
}
