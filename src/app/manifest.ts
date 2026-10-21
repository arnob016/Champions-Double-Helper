import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Lets the site be installed to a phone's home screen for quick access at events. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/teams",
    display: "standalone",
    background_color: "#0b0f1b",
    theme_color: "#0b0f1b",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
