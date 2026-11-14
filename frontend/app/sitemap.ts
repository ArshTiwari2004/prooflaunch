import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { SITE_URL } from "@/lib/config";
import type { SitemapEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/launches`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/how-scoring-works`, changeFrequency: "monthly", priority: 0.5 },
  ];
  try {
    const entries = await apiFetch<SitemapEntry[]>("/sitemap", { auth: false });
    return [
      ...base,
      ...entries.map((e) => ({
        url: `${SITE_URL}/products/${e.slug}`,
        lastModified: new Date(e.updatedAt),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return base;
  }
}
