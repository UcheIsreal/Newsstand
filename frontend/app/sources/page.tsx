import type { Metadata } from "next";
import { getSources } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News Sources",
  description: "Browse the publishers tracked by Newsstand and read source-attributed 100-word news summaries.",
  alternates: {
    canonical: `${SITE_URL}/sources`
  }
};

export default async function SourcesPage() {
  const sources = await getSources().catch(() => []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Newsstand Sources",
    description: "Publishers tracked by Newsstand for source-attributed 100-word news briefs.",
    url: `${SITE_URL}/sources`,
    hasPart: sources.map((source) => ({
      "@type": "WebPage",
      name: source.name,
      url: `${SITE_URL}/sources/${source.domain}`
    }))
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8 border-b border-black/10 pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">Index</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">Sources</h1>
        <p className="mt-4 max-w-3xl leading-8 text-ink/70">
          Newsstand keeps original publishers visible. Browse source pages to see recent briefs connected to each publisher and follow the original reporting when you need the full story.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((source) => (
          <a key={source.domain} href={`/sources/${source.domain}`} className="flex items-center gap-3 rounded-md border border-black/10 bg-white p-4 hover:border-ocean">
            <img src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`} alt="" className="h-6 w-6" />
            <div>
              <div className="font-bold text-ink">{source.name}</div>
              <div className="text-sm text-ink/50">{source.domain}</div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
