export const metadata = {
  title: "Privacy Policy",
  description: "Newsstand privacy policy."
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold text-ink">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-ink/70">
        <p>
          Newsstand may collect basic analytics data to understand traffic, performance, and popular content. If advertising is enabled, third-party ad partners may use cookies or similar technologies according to their own policies.
        </p>
        <p>
          We do not sell personal information. Contact information shared with us should only be used to respond to the request that was submitted.
        </p>
      </div>
    </main>
  );
}
