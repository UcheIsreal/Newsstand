import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import NewsCard from "@/components/NewsCard";
import { getArticles } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];
  if (!label) return {};

  return {
    title: `${label} News in 50 Words`,
    description: `Latest ${label.toLowerCase()} news summarized into detailed 100-word briefs with source attribution.`
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];
  if (!label) notFound();

  const articles = await getArticles({ category, limit: 60 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b border-black/10 pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">Category</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-normal text-ink">{label}</h1>
        <p className="mt-3 max-w-2xl text-ink/65">
          The latest {label.toLowerCase()} stories summarized quickly, with direct links to original reporting.
        </p>
      </header>

      <AdSlot slot={`${category}-leaderboard`} className="mb-8" />

      {articles.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-ink/60">No briefs have been published in this section yet.</p>
      )}
    </main>
  );
}
