import "server-only";
import { createHash } from "crypto";
import { XMLParser } from "fast-xml-parser";
import { Article, Source, Topic } from "@/lib/types";

export const revalidate = 1800;

type FeedSource = {
  name: string;
  url: string;
  domain: string;
};

type ArticleQuery = {
  category?: string;
  topic?: string;
  source?: string;
  limit?: number;
  offset?: number;
};

const FEEDS: Record<string, FeedSource[]> = {
  world: [
    { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", domain: "bbc.com" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", domain: "aljazeera.com" },
    { name: "DW", url: "https://rss.dw.com/rdf/rss-en-all", domain: "dw.com" }
  ],
  business: [
    { name: "Business Insider", url: "https://feeds.businessinsider.com/custom/all", domain: "businessinsider.com" },
    { name: "Entrepreneur", url: "https://www.entrepreneur.com/latest.rss", domain: "entrepreneur.com" },
    { name: "Inc.", url: "https://www.inc.com/rss", domain: "inc.com" },
    { name: "Fast Company", url: "https://www.fastcompany.com/latest/rss", domain: "fastcompany.com" }
  ],
  finance: [
    { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", domain: "marketwatch.com" },
    { name: "Forbes", url: "https://www.forbes.com/business/feed/", domain: "forbes.com" }
  ],
  technology: [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", domain: "techcrunch.com" },
    { name: "Wired", url: "https://www.wired.com/feed/rss", domain: "wired.com" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", domain: "arstechnica.com" }
  ],
  politics: [
    { name: "BBC Politics", url: "https://feeds.bbci.co.uk/news/politics/rss.xml", domain: "bbc.com" },
    { name: "The Guardian Politics", url: "https://www.theguardian.com/politics/rss", domain: "theguardian.com" },
    { name: "Politico", url: "https://rss.politico.com/politics-news.xml", domain: "politico.com" }
  ],
  sports: [
    { name: "ESPN", url: "https://www.espn.com/espn/rss/news", domain: "espn.com" },
    { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", domain: "bbc.com" },
    { name: "Sky Sports", url: "https://www.skysports.com/rss/12040", domain: "skysports.com" }
  ],
  health: [
    { name: "Healthline", url: "https://www.healthline.com/rss/health-news", domain: "healthline.com" }
  ],
  entertainment: [
    { name: "Variety", url: "https://variety.com/feed/", domain: "variety.com" },
    { name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/", domain: "hollywoodreporter.com" },
    { name: "Deadline", url: "https://deadline.com/feed/", domain: "deadline.com" }
  ]
};

const parser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  processEntities: true,
  trimValues: true
});

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanText(value: unknown): string {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textFrom(value: unknown): string {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "#text" in value) {
    return cleanText((value as { "#text"?: unknown })["#text"]);
  }
  return cleanText(value);
}

function wordLimit(text: string, limit: number): string {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  if (words.length <= limit) return words.join(" ");
  return `${words.slice(0, limit).join(" ")}.`;
}

function summarize100(title: string, body: string): string {
  const cleanedTitle = cleanText(title).replace(/[.?!]+$/, "");
  const cleanedBody = cleanText(body);
  const combined = cleanedBody.toLowerCase().startsWith(cleanedTitle.toLowerCase())
    ? cleanedBody
    : `${cleanedTitle}. ${cleanedBody}`;
  const summary = wordLimit(combined, 100);
  return /[.!?]$/.test(summary) ? summary : `${summary}.`;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "news-brief";
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function itemLink(item: Record<string, unknown>): string {
  const link = item.link;
  if (typeof link === "string") return link.trim();
  if (typeof link === "object" && link !== null) {
    const href = (link as { "@_href"?: string })["@_href"];
    if (href) return href.trim();
  }
  const links = asArray(link as Record<string, unknown> | Record<string, unknown>[]);
  const alternate = links.find((candidate) => candidate?.["@_rel"] === "alternate") || links[0];
  return String(alternate?.["@_href"] || "").trim();
}

function itemDate(item: Record<string, unknown>): string {
  const value = item.pubDate || item.published || item.updated || item["dc:date"];
  const date = value ? new Date(String(value)) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function itemImage(item: Record<string, unknown>): string | undefined {
  const mediaContent = asArray(item["media:content"] as Record<string, unknown> | Record<string, unknown>[]);
  const mediaThumbnail = asArray(item["media:thumbnail"] as Record<string, unknown> | Record<string, unknown>[]);
  const enclosure = asArray(item.enclosure as Record<string, unknown> | Record<string, unknown>[]);
  const candidate = [...mediaContent, ...mediaThumbnail, ...enclosure].find((entry) => {
    const url = String(entry?.["@_url"] || "");
    const type = String(entry?.["@_type"] || "");
    return url && (type.includes("image") || /\.(jpe?g|png|webp)(\?|$)/i.test(url));
  });
  return candidate ? String(candidate["@_url"]) : undefined;
}

function itemTags(item: Record<string, unknown>): string[] {
  const categories = asArray(item.category as unknown[]);
  return categories
    .map((category) => textFrom(category))
    .filter(Boolean)
    .slice(0, 8);
}

function extractTopics(title: string, excerpt: string, tags: string[]): string[] {
  const stopwords = new Set([
    "about", "after", "again", "amid", "and", "are", "from", "has", "have", "into", "its",
    "new", "not", "over", "said", "says", "that", "the", "their", "this", "with", "will",
    "you", "your", "for", "but", "was", "were", "how", "why", "what", "when", "where"
  ]);
  const phrases = cleanText(`${title} ${excerpt}`)
    .toLowerCase()
    .match(/\b[a-z][a-z0-9-]{2,}\b/g) || [];
  const ranked = new Map<string, number>();

  for (const tag of tags) ranked.set(tag.toLowerCase(), 10);
  for (const word of phrases) {
    if (!stopwords.has(word)) ranked.set(word, (ranked.get(word) || 0) + 1);
  }

  return [...ranked.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([topic]) => topic)
    .slice(0, 8);
}

function normalizeItem(item: Record<string, unknown>, source: FeedSource, category: string): Article | null {
  const title = textFrom(item.title);
  const url = itemLink(item);
  if (!title || !url) return null;

  const excerpt = wordLimit(
    textFrom(item.description || item.summary || item.content || item["content:encoded"]),
    90
  );
  const id = hash(url);
  const tags = itemTags(item);
  const topics = extractTopics(title, excerpt, tags);
  const publishedAt = itemDate(item);
  const summary = summarize100(title, excerpt);

  return {
    id,
    slug: `${slugify(title)}-${id.slice(0, 8)}`,
    title,
    original_title: title,
    summary_100: summary,
    excerpt,
    url,
    canonical_url: url,
    source_name: source.name,
    source_domain: source.domain,
    category,
    image_url: itemImage(item),
    published_at: publishedAt,
    updated_at: publishedAt,
    tags,
    topics,
    entities: topics.slice(0, 5),
    seo_title: `${wordLimit(title, 10)} | ${source.name} Brief`,
    meta_description: wordLimit(summary, 26),
    content_quality: excerpt ? 85 : 60,
    indexable: true
  };
}

async function fetchSource(source: FeedSource, category: string): Promise<Article[]> {
  try {
    const response = await fetch(source.url, {
      next: { revalidate },
      headers: {
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "user-agent": "Newsstand/1.0 RSS reader"
      },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      console.error("RSS feed returned an error", { source: source.name, status: response.status });
      return [];
    }

    const parsed = parser.parse(await response.text());
    const items = asArray(
      parsed?.rss?.channel?.item ||
      parsed?.feed?.entry ||
      parsed?.rdf?.item ||
      parsed?.RDF?.item
    ) as Record<string, unknown>[];

    return items
      .slice(0, 14)
      .map((item) => normalizeItem(item, source, category))
      .filter((article): article is Article => Boolean(article));
  } catch (error) {
    console.error("RSS feed fetch failed", { source: source.name, error });
    return [];
  }
}

async function fetchAllArticles(): Promise<Article[]> {
  const jobs = Object.entries(FEEDS).flatMap(([category, sources]) =>
    sources.map((source) => fetchSource(source, category))
  );
  const batches = await Promise.all(jobs);
  const unique = new Map<string, Article>();

  for (const article of batches.flat()) {
    unique.set(article.url, article);
  }

  return [...unique.values()].sort((a, b) => {
    return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
  });
}

export async function getArticles(params: ArticleQuery = {}) {
  const limit = params.limit || 50;
  const offset = params.offset || 0;
  const articles = await fetchAllArticles();
  const filtered = articles.filter((article) => {
    return (
      (!params.category || article.category === params.category) &&
      (!params.source || article.source_domain === params.source) &&
      (!params.topic || (article.topics || []).includes(params.topic))
    );
  });

  return filtered.slice(offset, offset + limit);
}

export async function getArticle(slug: string) {
  const articles = await fetchAllArticles();
  const article = articles.find((item) => item.slug === slug);
  if (!article) {
    throw new Error("Article not found");
  }

  const related = articles
    .filter((item) => item.id !== article.id)
    .filter((item) => {
      const sharedTopics = new Set(article.topics || []);
      return item.category === article.category || (item.topics || []).some((topic) => sharedTopics.has(topic));
    })
    .slice(0, 6);

  return { article, related };
}

export async function getTopics(limit = 40): Promise<Topic[]> {
  const counts = new Map<string, number>();
  for (const article of await fetchAllArticles()) {
    for (const topic of article.topics || []) {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([topic, count]) => ({ topic, count }));
}

export async function getSources(): Promise<Source[]> {
  const sources = new Map<string, Source>();
  for (const group of Object.values(FEEDS)) {
    for (const source of group) {
      sources.set(source.domain, { name: source.name, domain: source.domain });
    }
  }
  return [...sources.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSitemapData() {
  const [articles, topics, sources] = await Promise.all([
    getArticles({ limit: 250 }),
    getTopics(80),
    getSources()
  ]);

  return {
    articles: articles.map((article) => ({
      slug: article.slug,
      category: article.category,
      updated_at: article.updated_at
    })),
    categories: Object.keys(FEEDS),
    topics,
    sources
  };
}
