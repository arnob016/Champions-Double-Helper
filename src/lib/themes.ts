/** Colour themes named after game versions (see globals.css). Plain module so the server layout can import the script. */
export const THEMES = [
  { id: "blue", name: "Blue", swatch: ["#131a2b", "#3d82ff", "#9cc0ff"] },
  { id: "redgreen", name: "Red & Green", swatch: ["#261d18", "#e2443a", "#a6e57f"] },
  { id: "yellowblue", name: "Yellow & Blue", swatch: ["#141e2a", "#3a7bd5", "#ffd733"] },
  { id: "crystal", name: "Crystal", swatch: ["#12272c", "#1199ab", "#7fe6ec"] },
  { id: "heartgold", name: "HeartGold", swatch: ["#291f15", "#e25a2c", "#ffd36b"] },
  { id: "soulsilver", name: "SoulSilver", swatch: ["#1b1e23", "#6a90c2", "#cfd8e3"] },
  { id: "violet", name: "Violet", swatch: ["#1e112d", "#8b5cf6", "#c8adff"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_KEY = "champions-theme";
/** Inline in <head> so the saved theme is on <html> before first paint. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
