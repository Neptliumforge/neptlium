import type { MetadataRoute } from "next";

const routes = [
  "",
  "/platform",
  "/capital-universe",
  "/security",
  "/research",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/accessibility",
  "/risk-disclosure",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://neptlium.com${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
