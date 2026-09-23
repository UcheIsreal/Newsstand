import { Article, Source, Topic } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ArticleResponse = {
  articles: Article[];
  count: number;
};

type ArticleDetailResponse = {
  article: Article;
  related: Article[];
};

function url(path: string, params?: Record<string, string | number | undefined>) {
  const target = new URL(path, API_URL);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      target.searchParams.set(key, String(value));
    }
  });
  return target.toString();
}

async function getJson<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const response = await fetch(url(path, params), { next: { revalidate: 1800 } });

  if (!response.ok) {
    throw new Error(`Newsstand API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getArticles(params?: {
  category?: string;
  topic?: string;
  source?: string;
  limit?: number;
  offset?: number;
}) {
  const data = await getJson<ArticleResponse>("/articles", params);
  return data.articles;
}

export async function getArticle(slug: string) {
  return getJson<ArticleDetailResponse>(`/articles/${slug}`);
}

export async function getTopics(limit = 40) {
  const data = await getJson<{ topics: Topic[] }>("/topics", { limit });
  return data.topics;
}

export async function getSources() {
  const data = await getJson<{ sources: Source[] }>("/sources");
  return data.sources;
}

export async function getSitemapData() {
  return getJson<{
    articles: { slug: string; category: string; updated_at?: string }[];
    categories: string[];
    topics: Topic[];
    sources: Source[];
  }>("/sitemap-data");
}
