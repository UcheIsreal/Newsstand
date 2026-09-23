import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import NewsCard from "@/components/NewsCard";
import { getArticles, getSources } from "@/lib/api";
import { CATEGORY_LABELS, SITE_URL } from "@/lib/constants";
import { breadcrumbJsonLd, categorySeo, collectionJsonLd, uniqueTopics } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];
  if (!label) return {};
  const seo = categorySeo(category);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${SITE_URL}/${category}`
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE_URL}/${category}`,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];
  if (!label) notFound();

  const [articles, sources] = await Promise.all([
    getArticles({ category, limit: 60 }).catch(() => []),
    getSources().catch(() => [])
  ]);
  const seo = categorySeo(category);
  const topics = uniqueTopics(articles, 12);
  const categorySources = sources.filter((source) => articles.some((article) => article.source_domain === source.domain));
  const jsonLd = [
    collectionJsonLd(seo.title, seo.description, `${SITE_URL}/${category}`, articles),
    breadcrumbJsonLd([
      { name: "Newsstand", url: SITE_URL },
      { name: label, url: `${SITE_URL}/${category}` }
    ])
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8 border-b border-black/10 pb-6">
        <nav className="text-sm font-bold text-ink/55" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ocean">Newsstand</Link>
          <span className="mx-2">/</span>
          <span className="uppercase tracking-[0.16em] text-signal">{label}</span>
        </nav>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-normal text-ink">{seo.title}</h1>
        <div className="mt-4 grid max-w-4xl gap-4 text-base leading-8 text-ink/70">
          {seo.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      <AdSlot slot={`${category}-leaderboard`} className="mb-8" />

      <section className="mb-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-md border border-black/10 bg-white p-5">
          <h2 className="font-display text-2xl font-bold text-ink">Trending {label} Topics</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link key={topic.topic} href={`/topics/${encodeURIComponent(topic.topic)}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
                {topic.topic}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-black/10 bg-white p-5">
          <h2 className="font-display text-2xl font-bold text-ink">Sources in this section</h2>
          <div className="mt-4 grid gap-2">
            {categorySources.slice(0, 8).map((source) => (
              <Link key={source.domain} href={`/sources/${source.domain}`} className="text-sm font-semibold text-ink/70 hover:text-ocean">
                {source.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {articles.length ? (
        <section>
          <h2 className="mb-4 font-display text-3xl font-extrabold text-ink">Latest {label} Briefs</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-ink/60">No briefs have been published in this section yet.</p>
      )}
    </main>
  );
}
