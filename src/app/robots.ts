import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // team and battle pages only hold the visitor's own local data
    rules: { userAgent: "*", allow: "/", disallow: ["/battle/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
