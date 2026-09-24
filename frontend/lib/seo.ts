import { Article, Topic } from "@/lib/types";
import { CATEGORY_LABELS, SITE_NAME, SITE_URL } from "@/lib/constants";

export const CATEGORY_SEO: Record<string, { title: string; description: string; intro: string[]; keywords: string[] }> = {
  world: {
    title: "World News Briefs in 100 Words",
    description: "Follow global news with concise 100-word world news briefs, source links, and related context from major international publishers.",
    keywords: ["world news briefs", "global news summaries", "international news in 100 words"],
    intro: [
      "Newsstand's world news section is built for readers who want fast global context without opening a dozen tabs. Each brief pulls from trusted international RSS feeds, summarizes the core development in plain language, and links back to the original publisher for full reporting.",
      "Use this page to track diplomacy, conflict, elections, policy, global institutions, and major cross-border events through short source-attributed updates. The goal is not to replace original journalism, but to help you decide what deserves deeper reading."
    ]
  },
  business: {
    title: "Business News Briefs and Company Updates",
    description: "Read concise business news summaries covering companies, leadership, startups, strategy, markets, and global commerce.",
    keywords: ["business news briefs", "company news summaries", "startup news briefings"],
    intro: [
      "The business section turns major company, startup, leadership, and commerce stories into compact briefs for busy operators, founders, and professionals. Every item is source-attributed and designed to surface the decision-making signal quickly.",
      "Use these business news summaries to scan what is happening across companies, industries, and markets before jumping into the original reporting."
    ]
  },
  finance: {
    title: "Finance News Summaries in 100 Words",
    description: "Track market, investing, economy, banking, and personal finance stories through concise source-attributed news briefs.",
    keywords: ["finance news summaries", "market news briefs", "investing news in brief"],
    intro: [
      "Newsstand's finance page compresses market, banking, economic, and investing stories into short summaries that make the core movement easier to understand. Each brief keeps the source visible so readers can verify details and explore full analysis.",
      "This section is built for fast scanning: market signals, earnings themes, economic updates, and finance stories that may shape business decisions."
    ]
  },
  technology: {
    title: "Technology News Briefs and AI Updates",
    description: "Follow technology, AI, startups, apps, cybersecurity, platforms, and software news through concise 100-word briefs.",
    keywords: ["technology news briefs", "AI news summaries", "startup technology news"],
    intro: [
      "The technology section tracks AI, software, platforms, cybersecurity, startups, devices, and digital policy through short briefs. It is designed for builders and business readers who need useful context without losing the source trail.",
      "Each item summarizes what happened, why it may matter, and where to read the original reporting."
    ]
  },
  politics: {
    title: "Politics News Briefs and Policy Summaries",
    description: "Read concise politics news summaries covering elections, public policy, government, parties, and major political developments.",
    keywords: ["politics news briefs", "policy news summaries", "election news briefings"],
    intro: [
      "Newsstand's politics page gathers political and policy updates into brief, source-linked summaries. It helps readers follow elections, government decisions, public institutions, and political strategy without getting buried in noise.",
      "Every brief points back to the original publisher for the full reporting, quotes, and local context."
    ]
  },
  sports: {
    title: "Sports News Briefs and Match Updates",
    description: "Catch sports news summaries covering teams, athletes, leagues, tournaments, transfers, injuries, and major results.",
    keywords: ["sports news briefs", "sports summaries", "latest sports news in brief"],
    intro: [
      "The sports section turns major team, league, athlete, tournament, and result updates into quick summaries for readers who want the key story first. Each brief keeps the original source one click away.",
      "Use this page to scan developing stories across sports before choosing what to read in depth."
    ]
  },
  health: {
    title: "Health News Briefs and Wellness Updates",
    description: "Read concise health news summaries covering public health, research, medicine, wellness, and healthcare developments.",
    keywords: ["health news briefs", "medical news summaries", "wellness news briefings"],
    intro: [
      "Newsstand's health section summarizes public health, wellness, medicine, and research stories in plain language. It is intended for quick awareness and always links to the original publisher for full context.",
      "Health information changes quickly, so source attribution matters. These briefs help readers identify important developments without treating summaries as medical advice."
    ]
  },
  entertainment: {
    title: "Entertainment News Briefs and Culture Updates",
    description: "Follow entertainment news summaries covering film, streaming, television, music, celebrities, media, and culture.",
    keywords: ["entertainment news briefs", "movie news summaries", "streaming news briefings"],
    intro: [
      "The entertainment section tracks film, television, streaming, music, media, and culture stories through concise briefs. It is made for readers who want to know what is happening quickly, then follow the source link for the full story.",
      "Use this page to scan releases, industry moves, casting updates, media deals, and major culture stories."
    ]
  }
};

export function categorySeo(category: string) {
  const label = CATEGORY_LABELS[category] || category;
  return CATEGORY_SEO[category] || {
    title: `${label} News Briefs in 100 Words`,
    description: `Latest ${label.toLowerCase()} news summarized into 100-word briefs with source attribution.`,
    intro: [`Read concise ${label.toLowerCase()} news briefs with direct links to original reporting and related topic trails.`],
    keywords: [`${label.toLowerCase()} news briefs`, `${label.toLowerCase()} news summaries`]
  };
}

export function topicTitle(topic: string) {
  return topic
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function articlePath(article: Article) {
  return `/${article.category}/${article.slug}`;
}

export function articleUrl(article: Article) {
  return `${SITE_URL}${articlePath(article)}`;
}

export function uniqueTopics(articles: Article[], limit = 12) {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const topic of cleanArticleTopics(article)) counts.set(topic, (counts.get(topic) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([topic, count]) => ({ topic, count }));
}

const WEAK_TOPICS = new Set([
  "body",
  "campaigners",
  "dutch",
  "here",
  "image",
  "images",
  "news",
  "said",
  "says",
  "source",
  "story",
  "the",
  "this",
  "today",
  "video",
  "world"
]);

function sentenceFrom(text: string | undefined) {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentence = cleaned.match(/[^.!?]+[.!?]/)?.[0] || cleaned;
  return sentence.replace(/\s+/g, " ").trim();
}

function trimSentence(text: string, maxWords = 28) {
  const words = text.split(/\s+/).filter(Boolean);
  const trimmed = words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}.` : text;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function cleanArticleTopics(article: Article, limit = 6) {
  return (article.topics || [])
    .map((topic) => topic.trim().toLowerCase())
    .filter((topic) => {
      return (
        topic.length > 3 &&
        !WEAK_TOPICS.has(topic) &&
        !/^\d+$/.test(topic) &&
        !topic.includes("&") &&
        topic.split(/\s+/).length <= 3
      );
    })
    .slice(0, limit);
}

export function articleTakeaways(article: Article) {
  const category = CATEGORY_LABELS[article.category] || article.category;
  const summarySentence = trimSentence(sentenceFrom(article.summary_100 || article.excerpt || article.title), 30);
  const sourceLine = `${article.source_name} is the original source for the full report, including quotes, images, and later updates.`;
  const categoryLine = `Newsstand is grouping this as a ${category.toLowerCase()} story so readers can follow related briefs in one place.`;

  return [
    summarySentence,
    categoryLine,
    sourceLine
  ];
}

export function whyItMatters(article: Article) {
  const category = CATEGORY_LABELS[article.category] || article.category;
  const summarySentence = trimSentence(sentenceFrom(article.summary_100 || article.excerpt || article.title), 34);
  return `This ${category.toLowerCase()} update matters because it gives readers the main development quickly: ${summarySentence} Newsstand keeps the summary short and source-attributed so you can understand the issue first, then open ${article.source_name} for the complete report.`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Newsstand summarizes major RSS news stories into concise 100-word briefs with source attribution."
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/topics/{search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.meta_description || article.summary_100,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    mainEntityOfPage: articleUrl(article),
    image: article.image_url ? [article.image_url] : undefined,
    articleSection: CATEGORY_LABELS[article.category] || article.category,
    keywords: cleanArticleTopics(article).join(", "),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL
    },
    isBasedOn: article.url,
    citation: article.url
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function collectionJsonLd(name: string, description: string, url: string, articles: Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    hasPart: articles.slice(0, 12).map((article) => ({
      "@type": "NewsArticle",
      headline: article.title,
      url: articleUrl(article),
      datePublished: article.published_at,
      isBasedOn: article.url
    }))
  };
}

export function topicListJsonLd(topics: Topic[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: topics.slice(0, 50).map((topic, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: topicTitle(topic.topic),
      url: `${SITE_URL}/topics/${encodeURIComponent(topic.topic)}`
    }))
  };
}
