import type { Metadata } from "next";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { getArticles } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";
import { collectionJsonLd, topicTitle, uniqueTopics } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);
  const title = topicTitle(topic);
  const articles = await getArticles({ topic, limit: 4 }).catch(() => []);
  const isThin = articles.length < 3;
  return {
    title: `${title} News Briefs and 100-Word Summaries`,
    description: `Latest ${title.toLowerCase()} news briefs, source links, and related context from Newsstand.`,
    alternates: {
      canonical: `${SITE_URL}/topics/${encodeURIComponent(topic)}`
    },
    robots: {
      index: !isThin,
      follow: true
    },
    openGraph: {
      title: `${title} News Briefs`,
      description: `Latest source-attributed news summaries about ${title}.`,
      url: `${SITE_URL}/topics/${encodeURIComponent(topic)}`,
      type: "website"
    }
  };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);
  const title = topicTitle(topic);
  const articles = await getArticles({ topic, limit: 60 }).catch(() => []);
  const relatedTopics = uniqueTopics(articles, 12).filter((item) => item.topic !== topic);
  const jsonLd = collectionJsonLd(
    `${title} News Briefs`,
    `Latest source-attributed 100-word news summaries about ${title}.`,
    `${SITE_URL}/topics/${encodeURIComponent(topic)}`,
    articles
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8 border-b border-black/10 pb-6">
        <nav className="text-sm font-bold text-ink/55" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ocean">Newsstand</Link>
          <span className="mx-2">/</span>
          <Link href="/topics" className="hover:text-ocean">Topics</Link>
          <span className="mx-2">/</span>
          <span className="uppercase tracking-[0.16em] text-signal">{title}</span>
        </nav>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">{title} News Briefs</h1>
        <p className="mt-4 max-w-3xl leading-8 text-ink/70">
          Follow concise 100-word briefs connected to {title}. This topic page groups related stories, sources, and internal links so readers and search engines can understand how the story cluster is developing.
        </p>
      </header>

      <section className="mb-8 rounded-md border border-black/10 bg-white p-5">
        <h2 className="font-display text-2xl font-bold text-ink">Related Topics</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {relatedTopics.map((related) => (
            <Link key={related.topic} href={`/topics/${encodeURIComponent(related.topic)}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
              {related.topic}
            </Link>
          ))}
        </div>
      </section>

      {articles.length ? (
        <section>
          <h2 className="mb-4 font-display text-3xl font-extrabold text-ink">Latest Briefs About {title}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-ink/60">No briefs are currently available for this topic.</p>
      )}
    </main>
  );
}
