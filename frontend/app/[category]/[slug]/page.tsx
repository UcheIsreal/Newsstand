import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import NewsCard from "@/components/NewsCard";
import { getArticle } from "@/lib/api";
import { CATEGORY_LABELS, SITE_URL } from "@/lib/constants";
import { articleJsonLd, articleTakeaways, articleUrl, breadcrumbJsonLd, whyItMatters } from "@/lib/seo";

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
      keywords: article.topics || [],
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1
        }
      },
      openGraph: {
        title: article.title,
        description: article.summary_100,
        url: `${SITE_URL}${path}`,
        type: "article",
        images: article.image_url ? [{ url: article.image_url }] : undefined,
        publishedTime: article.published_at,
        modifiedTime: article.updated_at || article.published_at,
        section: CATEGORY_LABELS[article.category] || article.category,
        tags: article.topics
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.meta_description || article.summary_100,
        images: article.image_url ? [article.image_url] : undefined
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
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;
  const takeaways = articleTakeaways(article);
  const jsonLd = [
    articleJsonLd(article),
    breadcrumbJsonLd([
      { name: "Newsstand", url: SITE_URL },
      { name: categoryLabel, url: `${SITE_URL}/${article.category}` },
      { name: article.title, url: articleUrl(article) }
    ])
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/55" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ocean">Newsstand</Link>
            <span>/</span>
            <Link href={`/${article.category}`} className="uppercase tracking-[0.16em] text-signal hover:text-ocean">
              {categoryLabel}
            </Link>
          </nav>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-tight tracking-normal text-ink md:text-6xl">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink/55">
            <Link href={`/sources/${article.source_domain}`} className="text-ocean hover:underline">
              {article.source_name}
            </Link>
            <span>/</span>
            <time dateTime={article.published_at}>{published}</time>
            <span>/</span>
            <span>100-word brief</span>
          </div>

          {article.image_url ? (
            <img src={article.image_url} alt="" className="mt-8 h-auto max-h-[520px] w-full rounded-md object-cover" />
          ) : null}

          <AdSlot slot="article-top" className="mt-8" />

          <section className="mt-8 rounded-md border border-black/10 bg-white p-6">
            <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-ink/45">The short version</div>
            <p className="mt-4 text-xl font-normal leading-9 text-ink">{article.summary_100}</p>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-md border border-black/10 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-ink">Why it matters</h2>
              <p className="mt-3 leading-8 text-ink/70">{whyItMatters(article)}</p>
            </div>

            <div className="rounded-md border border-black/10 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-ink">Key context</h2>
              <ul className="mt-3 grid gap-3 text-ink/70">
                {takeaways.map((takeaway) => (
                  <li key={takeaway} className="leading-7">{takeaway}</li>
                ))}
              </ul>
            </div>
          </section>

          <AdSlot slot="article-mid" className="mt-8" />

          <section className="mt-8 rounded-md border border-black/10 bg-white p-6">
            <h2 className="font-display text-2xl font-bold text-ink">Source attribution</h2>
            <p className="mt-3 leading-8 text-ink/70">
              This Newsstand page summarizes and points to reporting from {article.source_name}. The original publisher owns the full story, reporting, quotes, images, and any later updates.
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
                <Link key={topic} href={`/topics/${encodeURIComponent(topic)}`} className="rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint">
                  {topic}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-black/10 bg-white p-5">
            <h2 className="font-display text-xl font-bold text-ink">Explore More</h2>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-ink/70">
              <Link href={`/${article.category}`} className="hover:text-ocean">More {categoryLabel.toLowerCase()} briefs</Link>
              <Link href={`/sources/${article.source_domain}`} className="hover:text-ocean">More from {article.source_name}</Link>
              <Link href="/topics" className="hover:text-ocean">Trending topics</Link>
            </div>
          </section>
        </aside>
      </article>
    </main>
  );
}
