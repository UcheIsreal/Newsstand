import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import NewsCard from "@/components/NewsCard";
import { getArticle } from "@/lib/api";
import { CATEGORY_LABELS, SITE_URL } from "@/lib/constants";

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { article } = await getArticle(slug);
    const path = `/${article.category}/${article.slug}`;

    return {
      title: article.seo_title || article.title,
      description: article.meta_description || article.summary_100,
      alternates: {
        canonical: `${SITE_URL}${path}`
      },
      openGraph: {
        title: article.title,
        description: article.summary_100,
        url: `${SITE_URL}${path}`,
        type: "article",
        images: article.image_url ? [{ url: article.image_url }] : undefined
      }
    };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { category, slug } = await params;
  const { article, related } = await getArticle(slug).catch(() => ({ article: null, related: [] }));

  if (!article || article.category !== category) {
    notFound();
  }

  const published = article.published_at ? new Date(article.published_at).toLocaleString() : "Recently";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary_100,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    mainEntityOfPage: `${SITE_URL}/${article.category}/${article.slug}`,
    image: article.image_url ? [article.image_url] : undefined,
    publisher: {
      "@type": "Organization",
      name: "Newsstand"
    },
    isBasedOn: article.url
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <a href={`/${article.category}`} className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">
            {CATEGORY_LABELS[article.category] || article.category}
          </a>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-tight tracking-normal text-ink md:text-6xl">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink/55">
            <a href={`/sources/${article.source_domain}`} className="text-ocean hover:underline">
              {article.source_name}
            </a>
            <span>/</span>
            <time>{published}</time>
          </div>

          {article.image_url ? (
            <img src={article.image_url} alt="" className="mt-8 h-auto max-h-[520px] w-full rounded-md object-cover" />
          ) : null}

          <AdSlot slot="article-top" className="mt-8" />

          <section className="mt-8 rounded-md border border-black/10 bg-white p-6">
            <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-ink/45">100-word brief</div>
            <p className="mt-4 text-xl font-normal leading-9 text-ink">{article.summary_100}</p>
          </section>

          <AdSlot slot="article-mid" className="mt-8" />

          <section className="mt-8 rounded-md border border-black/10 bg-white p-6">
            <h2 className="font-display text-2xl font-bold text-ink">Source attribution</h2>
            <p className="mt-3 leading-8 text-ink/70">
              This Newsstand brief is based on reporting from {article.source_name}. Read the original story for full reporting, quotes, and publisher context.
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-md bg-signal px-4 py-3 text-sm font-extrabold text-white hover:bg-ink"
            >
              Visit original source
            </a>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold text-ink">Related briefs</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <AdSlot slot="article-sidebar" />

          <section className="rounded-md border border-black/10 bg-white p-5">
            <h2 className="font-display text-xl font-bold text-ink">Topics</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(article.topics || []).map((topic) => (
                <a key={topic} href={`/topics/${encodeURIComponent(topic)}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
                  {topic}
                </a>
              ))}
            </div>
          </section>
        </aside>
      </article>
    </main>
  );
}
