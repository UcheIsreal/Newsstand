import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import NewsCard from "@/components/NewsCard";
import { getArticles, getTopics } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, topics] = await Promise.all([
    getArticles({ limit: 52 }).catch(() => []),
    getTopics(18).catch(() => [])
  ]);
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <main>
      <section className="border-b border-black/10 bg-paper px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.5fr_0.75fr]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-signal">Global news intelligence</p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-normal text-ink md:text-7xl">
              Understand the world in 100 words.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Newsstand turns trusted RSS feeds into concise briefings, source links, and topic trails for readers who want the signal without losing the original reporting.
            </p>
          </div>

          <div className="self-end border-l-4 border-signal bg-white p-5">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-ink/45">Today</div>
            <p className="mt-3 text-2xl font-display font-bold leading-tight text-ink">
              Fresh briefs from world, business, finance, technology, politics, sports, health, and entertainment.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {lead ? <NewsCard article={lead} priority /> : <p>No articles yet. Trigger the backend fetch job to populate the newsstand.</p>}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold text-ink">Latest Briefs</h2>
            <Link href="/topics" className="text-sm font-bold text-ocean">Explore topics</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <AdSlot slot="home-sidebar" />

          <section className="rounded-md border border-black/10 bg-white p-5">
            <h2 className="font-display text-xl font-bold text-ink">Trending Topics</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <a key={topic.topic} href={`/topics/${encodeURIComponent(topic.topic)}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
                  {topic.topic}
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-black/10 bg-white p-5">
            <h2 className="font-display text-xl font-bold text-ink">News Sections</h2>
            <div className="mt-4 grid gap-2">
              {CATEGORIES.filter((category) => category.slug).map((category) => (
                <a key={category.slug} href={`/${category.slug}`} className="rounded-md px-3 py-2 text-sm font-bold text-ink/70 hover:bg-paper">
                  {category.label}
                </a>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
