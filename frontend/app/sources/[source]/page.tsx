import type { Metadata } from "next";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { getArticles } from "@/lib/api";
import { CATEGORY_LABELS, SITE_URL } from "@/lib/constants";
import { collectionJsonLd, uniqueTopics } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ source: string }> }): Promise<Metadata> {
  const { source } = await params;
  const decoded = decodeURIComponent(source);
  const articles = await getArticles({ source: decoded, limit: 4 }).catch(() => []);
  const sourceName = articles[0]?.source_name || decoded;
  const isThin = articles.length < 3;
  return {
    title: `${sourceName} News Briefs and Summaries`,
    description: `Latest source-attributed Newsstand briefs based on stories from ${sourceName}.`,
    alternates: {
      canonical: `${SITE_URL}/sources/${decoded}`
    },
    robots: {
      index: !isThin,
      follow: true
    },
    openGraph: {
      title: `${sourceName} News Briefs`,
      description: `Concise 100-word summaries based on stories from ${sourceName}.`,
      url: `${SITE_URL}/sources/${decoded}`,
      type: "website"
    }
  };
}

export default async function SourcePage({ params }: { params: Promise<{ source: string }> }) {
  const { source: rawSource } = await params;
  const source = decodeURIComponent(rawSource);
  const articles = await getArticles({ source, limit: 60 }).catch(() => []);
  const sourceName = articles[0]?.source_name || source;
  const topics = uniqueTopics(articles, 12);
  const categories = [...new Set(articles.map((article) => article.category))];
  const jsonLd = collectionJsonLd(
    `${sourceName} News Briefs`,
    `Latest source-attributed 100-word news summaries based on stories from ${sourceName}.`,
    `${SITE_URL}/sources/${source}`,
    articles
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8 border-b border-black/10 pb-6">
        <nav className="text-sm font-bold text-ink/55" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ocean">Newsstand</Link>
          <span className="mx-2">/</span>
          <Link href="/sources" className="hover:text-ocean">Sources</Link>
          <span className="mx-2">/</span>
          <span className="uppercase tracking-[0.16em] text-signal">{sourceName}</span>
        </nav>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">{sourceName}</h1>
        <p className="mt-4 max-w-3xl leading-8 text-ink/70">
          Recent Newsstand briefs attributed to {sourceName}. This page helps readers scan summaries quickly while keeping the original publisher visible and linked for full reporting.
        </p>
      </header>

      <section className="mb-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-md border border-black/10 bg-white p-5">
          <h2 className="font-display text-2xl font-bold text-ink">Covered Categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category} href={`/${category}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
                {CATEGORY_LABELS[category] || category}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-black/10 bg-white p-5">
          <h2 className="font-display text-2xl font-bold text-ink">Related Topics</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link key={topic.topic} href={`/topics/${encodeURIComponent(topic.topic)}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
                {topic.topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {articles.length ? (
        <section>
          <h2 className="mb-4 font-display text-3xl font-extrabold text-ink">Latest Briefs From {sourceName}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-ink/60">No briefs are currently available for this source.</p>
      )}
    </main>
  );
}
