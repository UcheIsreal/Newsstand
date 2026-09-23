export const metadata = {
  title: "Terms of Use",
  description: "Newsstand terms of use."
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold text-ink">Terms of Use</h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-ink/70">
        <p>
          Newsstand provides short news summaries for informational purposes. We do not guarantee that every brief captures every development in a story.
        </p>
        <p>
          Publisher names, trademarks, and source links belong to their respective owners. Visit original publisher links for complete articles and updates.
        </p>
      </div>
    </main>
  );
}
