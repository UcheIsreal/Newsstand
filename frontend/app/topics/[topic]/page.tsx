import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { getArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);
  return {
    title: `${topic} News Briefs`,
    description: `Latest news briefs and source links about ${topic}.`
  };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);
  const articles = await getArticles({ topic, limit: 60 }).catch(() => []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b border-black/10 pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">Topic</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">{topic}</h1>
        <p className="mt-3 text-ink/65">Recent 100-word briefs connected to this topic.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  );
}
