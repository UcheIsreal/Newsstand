import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData().catch(() => ({
    articles: [],
    categories: [],
    topics: [],
    sources: []
  }));

  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/topics`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/sources`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    ...data.categories.map((category) => ({
      url: `${SITE_URL}/${category}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8
    })),
    ...data.topics.map((topic) => ({
      url: `${SITE_URL}/topics/${encodeURIComponent(topic.topic)}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7
    })),
    ...data.sources.map((source) => ({
      url: `${SITE_URL}/sources/${source.domain}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6
    })),
    ...data.articles.map((article) => ({
      url: `${SITE_URL}/${article.category}/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.9
    }))
  ];
}
