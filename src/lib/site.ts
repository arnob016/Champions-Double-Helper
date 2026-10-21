/** Site-wide identity, used by metadata, the manifest, robots and the sitemap. */
export const SITE = {
  name: "Champions Doubles",
  shortName: "Champions",
  tagline: "Win team preview",
  description:
    "Free team-preview helper for Pokémon Champions VGC doubles: save your team, type the opponent's six, and see weaknesses, Megas, speed, matchups, synergy and your best four instantly.",
  /** Set NEXT_PUBLIC_SITE_URL when deploying so share links and the sitemap use the real domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
