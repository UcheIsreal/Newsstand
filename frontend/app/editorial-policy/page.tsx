export const metadata = {
  title: "Editorial Policy",
  description: "Newsstand editorial and attribution policy."
};

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold text-ink">Editorial Policy</h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-ink/70">
        <p>
          Newsstand publishes original summaries based on RSS metadata and publicly available source information. We do not present summaries as original reporting.
        </p>
        <p>
          Each story page attributes the publisher and links to the original article. Readers should visit the original source for complete reporting, quotes, corrections, and updates.
        </p>
        <p>
          Pages that are incomplete, duplicate, unsafe, or too thin should be withheld from indexing until they meet quality standards.
        </p>
      </div>
    </main>
  );
}
