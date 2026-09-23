export const metadata = {
  title: "About Newsstand",
  description: "Learn how Newsstand summarizes global news from trusted RSS sources."
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold text-ink">About Newsstand</h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-ink/70">
        <p>
          Newsstand is a summary-first news aggregator that helps readers understand major stories quickly. We monitor trusted RSS feeds, create concise original briefs, and link readers back to the publishers responsible for the original reporting.
        </p>
        <p>
          Every brief is designed to add context, reduce noise, and make discovery easier across categories, topics, and sources.
        </p>
      </div>
    </main>
  );
}
