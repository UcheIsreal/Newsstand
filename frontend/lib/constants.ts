export const SITE_NAME = "Newsstand";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL =
  configuredSiteUrl && !configuredSiteUrl.includes("localhost")
    ? configuredSiteUrl.replace(/\/$/, "")
    : "https://www.newsstand.online";

export const CATEGORIES = [
  { slug: "", label: "Top Stories" },
  { slug: "world", label: "World" },
  { slug: "business", label: "Business" },
  { slug: "finance", label: "Finance" },
  { slug: "technology", label: "Technology" },
  { slug: "politics", label: "Politics" },
  { slug: "sports", label: "Sports" },
  { slug: "health", label: "Health" },
  { slug: "entertainment", label: "Entertainment" }
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.filter((category) => category.slug).map((category) => [category.slug, category.label])
) as Record<string, string>;
