import type { Metadata } from "next";
import { getTopics } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";
import { topicListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending News Topics",
  description: "Explore trending news topics tracked across global publishers and grouped into source-attributed 100-word briefs.",
  alternates: {
    canonical: `${SITE_URL}/topics`
  }
};

export default async function TopicsPage() {
  const topics = await getTopics(100).catch(() => []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(topicListJsonLd(topics)) }} />

      <header className="mb-8 border-b border-black/10 pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">Index</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">Trending Topics</h1>
        <p className="mt-4 max-w-3xl leading-8 text-ink/70">
          Browse the topic clusters Newsstand is seeing across RSS feeds. Each topic page connects related 100-word briefs, original sources, and category coverage.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic) => (
          <a key={topic.topic} href={`/topics/${encodeURIComponent(topic.topic)}`} className="rounded-md border border-black/10 bg-white p-4 hover:border-ocean">
            <div className="font-bold text-ink">{topic.topic}</div>
            <div className="mt-2 text-sm text-ink/55">{topic.count} briefs</div>
          </a>
        ))}
      </div>
    </main>
  );
}
