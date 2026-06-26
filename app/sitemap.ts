import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

const routes = ["/", "/cloud-souverain", "/ia", "/politique-confidentialite", "/mentions-legales"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-06-26"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/ia" || route === "/cloud-souverain" ? 0.8 : 0.3,
  }));
}
