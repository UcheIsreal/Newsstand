import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { getArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ source: string }> }): Promise<Metadata> {
  const { source } = await params;
  return {
    title: `${source} News Briefs`,
    description: `Latest summarized stories from ${source}.`
  };
}

export default async function SourcePage({ params }: { params: Promise<{ source: string }> }) {
  const { source: rawSource } = await params;
  const source = decodeURIComponent(rawSource);
  const articles = await getArticles({ source, limit: 60 }).catch(() => []);
  const sourceName = articles[0]?.source_name || source;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b border-black/10 pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">Source</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">{sourceName}</h1>
        <p className="mt-3 text-ink/65">Recent Newsstand briefs attributed to {sourceName}.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  );
}
