import type { Metadata } from "next";
import { getSources } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News Sources",
  description: "Browse the publishers tracked by Newsstand."
};

export default async function SourcesPage() {
  const sources = await getSources().catch(() => []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b border-black/10 pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-signal">Index</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-ink">Sources</h1>
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
