<div align="center">

<img src="https://play.pokemonshowdown.com/sprites/gen5ani/pikachu.gif" height="56" alt="Pikachu" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/charizard.gif" height="72" alt="Charizard" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/garchomp.gif" height="72" alt="Garchomp" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/incineroar.gif" height="72" alt="Incineroar" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/gengar.gif" height="64" alt="Gengar" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/pelipper.gif" height="64" alt="Pelipper" />

<img src="docs/media/logo.png" width="96" alt="Champions Doubles logo: two overlapping pixel orbs" />

# CHAMPIONS DOUBLES

### Win team preview.

**A retro, keyboard-first team-preview helper for _Pokémon Champions_ VGC doubles.**<br/>
Save your six once. At preview, type their six and instantly see weaknesses, Megas, speed,<br/>
matchups, synergy and your best four, before the timer runs out.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-0B1120?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![anime.js](https://img.shields.io/badge/anime.js_4-FF4B4B?style=for-the-badge&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

![Electric](https://img.shields.io/badge/ELECTRIC-F7D02C?style=flat-square)
![Water](https://img.shields.io/badge/WATER-6390F0?style=flat-square)
![Fire](https://img.shields.io/badge/FIRE-EE8130?style=flat-square)
![Grass](https://img.shields.io/badge/GRASS-7AC74C?style=flat-square)
![Psychic](https://img.shields.io/badge/PSYCHIC-F95587?style=flat-square)
![Dragon](https://img.shields.io/badge/DRAGON-6F35FC?style=flat-square)
![Fairy](https://img.shields.io/badge/FAIRY-D685AD?style=flat-square)
![Ghost](https://img.shields.io/badge/GHOST-735797?style=flat-square)
![Steel](https://img.shields.io/badge/STEEL-B7B7CE?style=flat-square)
![Dark](https://img.shields.io/badge/DARK-705746?style=flat-square)

<br/>

<img src="docs/media/demo.gif" width="560" alt="Animated team preview: the opponent's team is typed in, four picks pop in as leads and backs, Raichu Mega Evolves, and the matchup grid fills in" />

<sub>⬆ The landing page's live anime.js demo, recorded from the app</sub>

</div>

---

## ▶ PRESS START

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Unit tests (type chart, stats, coverage, synergy, import…) |
| `npm run lint` | ESLint |

> **No account, no backend.** Teams, settings and your win/loss log live in your browser's `localStorage`, and the whole Pokédex ships with the app, so nothing waits on the network mid-preview. Accounts and cloud sync are planned for a later release.

### 🚀 Deploy

It's a standard Next.js app, so it runs on any Node.js host or platform that supports Next.js.

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build
npm start
```

`NEXT_PUBLIC_SITE_URL` sets the canonical address used by share cards, the sitemap and `robots.txt`; without it they point at `http://localhost:3000`. Players can also **install it to their home screen** (it ships a web manifest and icons), handy at events.

| Built in | |
| --- | --- |
| 🖼️ App icon, Apple touch icon, social share card | generated from the pixel logo (`src/app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`) |
| 🔎 Page titles & descriptions | `Your teams · Champions Doubles`, `Battle: <team> · Champions Doubles`, … |
| 🗺️ `sitemap.xml`, `robots.txt`, web manifest | `src/app/sitemap.ts`, `robots.ts`, `manifest.ts` |
| ♿ Accessibility | skip link, visible focus ring, labelled controls, full keyboard play, reduced-motion support |
| 🧭 Friendly 404 & error pages | "A wild 404 appeared!" |

<div align="center"><img src="docs/media/social.png" width="600" alt="Social share card" /></div>

---

## 🎒 MOVESET

> _Champions Doubles learned 10 moves!_

| | Move | Type | Effect |
| :-: | --- | :-: | --- |
| 🛠️ | **Team Builder** | ![Normal](https://img.shields.io/badge/NORMAL-A8A77A?style=flat-square) | Search any Pokémon (typos welcome), pick moves from its real move pool, items, abilities and natures. **Stat Points** sliders follow Champions' rules: 66 total, 32 per stat, Lv50, 31 IVs. |
| 📋 | **Showdown Import** | ![Psychic](https://img.shields.io/badge/PSYCHIC-F95587?style=flat-square) | Paste a Showdown team. Champions spreads (`32 Atk / 32 Spe`) are read as SP directly; classic `252/252/4` EVs are converted. Exports back to Showdown too. |
| 🔍 | **Opponent Intel** | ![Dark](https://img.shields.io/badge/DARK-705746?style=flat-square) | Type `incin, flutter, gambit` and press Enter. Each opponent shows weaknesses, base stats and Min / Max / Max+ / Scarf speed, plus a warning when an ability like Levitate changes its weaknesses. |
| 💎 | **Mega Stone** | ![Dragon](https://img.shields.io/badge/DRAGON-6F35FC?style=flat-square) | Tap the pixel Mega Stone on any sprite to Mega Evolve, including the new Legends Z-A Megas. X/Y Megas cycle Base → X → Y. |
| 🎯 | **Compare** | ![Fighting](https://img.shields.io/badge/FIGHTING-C22E28?style=flat-square) | Tap an opponent: every one of your tiles shows your best hit, their strongest same-type hit and who's faster. |
| 🛡️ | **Coverage & Defense** | ![Steel](https://img.shields.io/badge/STEEL-B7B7CE?style=flat-square) | What your four hit super-effectively, plus a defense grid that flags types hitting 2+ of your picks with nobody resisting. |
| 🤝 | **Synergy** | ![Fairy](https://img.shields.io/badge/FAIRY-D685AD?style=flat-square) | Ranks your lead pairs: rain setters with Swift Swim, Earthquake hitting your partner, Fake Out plus setup, Trick Room fit, terrain seeds. **Lead these** in one tap. |
| 👻 | **Threats** | ![Ghost](https://img.shields.io/badge/GHOST-735797?style=flat-square) | Per opponent: *Answered / Risky / No answer*, the support moves it can learn, and traps like Defiant vs your Intimidate. |
| ⚡ | **Suggest 4** | ![Electric](https://img.shields.io/badge/ELECTRIC-F7D02C?style=flat-square) | Press <kbd>S</kbd> to pick four that cover their team, aren't threatened, and outspeed what they can. |
| 🏆 | **Battle Log** | ![Grass](https://img.shields.io/badge/GRASS-7AC74C?style=flat-square) | **Won / Lost** logs your picks and their team, then clears the board for the next game. Records show on every team card. |

---

## 📸 POKÉDEX ENTRIES

<table>
  <tr>
    <td width="50%"><img src="docs/media/landing.png" alt="Landing page" /><br/><sub><b>Landing</b>: pixel starfield, walking sprites, live demo</sub></td>
    <td width="50%"><img src="docs/media/battle.png" alt="Battle screen comparing Kingambit with your team" /><br/><sub><b>Battle</b>: tap Kingambit, every tile shows the matchup</sub></td>
  </tr>
  <tr>
    <td><img src="docs/media/synergy.png" alt="Synergy tab" /><br/><sub><b>Synergy</b>: best lead pairs with the reasons why</sub></td>
    <td><img src="docs/media/threats.png" alt="Threats tab" /><br/><sub><b>Threats</b>: who answers what, and what they can learn</sub></td>
  </tr>
  <tr>
    <td><img src="docs/media/defense.png" alt="Defense tab" /><br/><sub><b>Defense</b>: shared weaknesses at a glance</sub></td>
    <td><img src="docs/media/editor.png" alt="Pokémon editor" /><br/><sub><b>Editor</b>: Stat Points with live final stats</sub></td>
  </tr>
</table>

---

## ⌨️ SPEEDRUN CONTROLS

<div align="center">
<img src="docs/media/shortcuts.gif" width="720" alt="Shortcut keys pressing themselves in sequence" />
</div>

| Key | Action |
| :-: | --- |
| <kbd>/</kbd> | Jump to the opponent search |
| <kbd>Enter</kbd> | Add it (or a whole comma list: `incin, flutter, kanga`) |
| <kbd>Backspace</kbd> | Remove the last opponent (in an empty search box) |
| <kbd>1</kbd> – <kbd>6</kbd> | Pick your Pokémon (first two lead, next two in the back) |
| <kbd>S</kbd> | Suggest the best 4 |
| <kbd>N</kbd> | New battle (undoable) |
| <kbd>D</kbd> | Details on/off |
| <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> <kbd>T</kbd> <kbd>Y</kbd> | Matchups · Coverage · Defense · Speed · Synergy · Threats |
| <kbd>Esc</kbd> | Leave the search box / stop comparing |

---

## ✨ ANIME.JS EFFECTS

Every animation is [anime.js 4](https://animejs.com), kept short (150–450 ms) so nothing slows you down at preview. If your OS has **Reduce motion** turned on, every animation is skipped.

| Effect | Where |
| --- | --- |
| 🎬 Scripted `createTimeline` loop: typing, bouncing sprites, badge pops, Mega flash, matchup grid | Landing hero |
| 🚶 Two-frame overworld walk (`steps(2)`) across a pixel grass strip | Landing |
| 📜 Scroll reveal + counting stats (IntersectionObserver + `stagger`) | Landing |
| ⌨️ Self-playing keyboard timeline | Landing |
| 🃏 Tiles rise in with `stagger`; matrix cells ripple, stat bars grow | Everywhere |
| 🔢 Pick badge springs in (`outBack`), with tiles dipping when picked | Battle |
| 💥 Mega Evolution flash: brightness and twist keyframes on the sprite | Battle |
| 🫥 Opponents shrink out before they're removed | Battle |
| 🧭 Sliding tab indicator | Battle |

---

## 📊 BASE STATS

```
HP   ▰▰▰▰▰▰▰▰▰▱  1,277 Pokémon & formes from Showdown's dex
ATK  ▰▰▰▰▰▰▰▰▱▱  89 Mega Evolutions, new Legends Z-A ones included
DEF  ▰▰▰▰▰▰▰▰▰▱  18×18 type chart + ability immunities (Levitate, Flash Fire, …)
SPA  ▰▰▰▰▰▰▰▱▱▱  685 current moves, full learnsets incl. pre-evolutions
SPD  ▰▰▰▰▰▰▰▰▰▱  zero network calls during a battle
SPE  ▰▰▰▰▰▰▰▰▰▰  every action has a hotkey
```

### Stat Points math

Champions fixes every Pokémon at **Lv50 with 31 IVs** and replaces EVs with **Stat Points**: 66 to spend, at most 32 per stat, and **1 SP = +1 stat** before the nature multiplier.

```ts
// src/lib/stats.ts
const core = Math.floor(((2 * base + 31) * 50) / 100);
hp    = core + 60 + sp;                       // HP
other = Math.floor((core + 5 + sp) * nature); // Atk, Def, SpA, SpD, Spe
```

---

## 🗺️ ROUTE MAP

```
src/
├─ app/
│  ├─ page.tsx                 # landing page
│  ├─ icon.tsx  apple-icon.tsx  opengraph-image.tsx   # generated from the logo
│  ├─ manifest.ts  robots.ts  sitemap.ts  not-found.tsx  error.tsx
│  └─ (app)/                   # working area
│     ├─ teams/                # team list + /teams/[id] editor
│     └─ battle/[teamId]/      # the battle screen
├─ components/
│  ├─ landing/                 # HeroDemo, Walkers, ShortcutDemo, scroll reveal
│  ├─ battle/                  # team & opponent panels, analysis tabs
│  ├─ team/                    # editor, import, cards
│  └─ shared/                  # Sprite, TypeBadge, MegaStone, Combobox, Modal…
├─ lib/                        # pure logic, unit-tested
│  ├─ typechart.ts  coverage.ts  synergy.ts  threats.ts  suggest.ts
│  ├─ stats.ts      showdown.ts  learnset.ts  opponents.ts
│  ├─ motion.ts                # anime.js presets + useAnimateIn
│  └─ logo.ts  site.ts         # pixel logo data, site name/URL/description
└─ store/                      # zustand: teams, battle, history (localStorage)
```

---

## 🎓 CREDITS

- Pokédex, moves, learnsets and type chart: [`@pkmn/dex`](https://github.com/pkmn/ps) (Pokémon Showdown data)
- Showdown paste parsing: [`@pkmn/sets`](https://github.com/pkmn/ps) · sprites: [Pokémon Showdown](https://play.pokemonshowdown.com) via [`@pkmn/img`](https://github.com/pkmn/img)
- Animation: [anime.js](https://animejs.com) · fonts: [Silkscreen](https://fonts.google.com/specimen/Silkscreen), [Rubik](https://fonts.google.com/specimen/Rubik), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

<div align="center">

<br/>

<img src="https://play.pokemonshowdown.com/sprites/gen5ani/lucario.gif" height="64" alt="Lucario" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/dragonite.gif" height="64" alt="Dragonite" />
<img src="https://play.pokemonshowdown.com/sprites/gen5ani/raichu.gif" height="56" alt="Raichu" />

**Ready, trainer?**

<sub>Fan-made project, not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company.<br/>Pokémon and all related names and sprites are trademarks of their respective owners.</sub>

</div>
