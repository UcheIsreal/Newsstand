import Link from "next/link";
import { Article } from "@/lib/types";

function formatTime(date?: string) {
  if (!date) return "Recently";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NewsCard({ article, priority = false }: { article: Article; priority?: boolean }) {
  return (
    <article className={`overflow-hidden rounded-md border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${priority ? "md:grid md:grid-cols-[1.15fr_1fr]" : ""}`}>
      {article.image_url ? (
        <Link href={`/${article.category}/${article.slug}`} className="block bg-ink/5">
          <img
            src={article.image_url}
            alt=""
            className={`w-full object-cover ${priority ? "h-72 md:h-full" : "h-44"}`}
          />
        </Link>
      ) : null}

      <div className="flex min-h-full flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
          <span>{article.source_name}</span>
          <span>/</span>
          <span>{formatTime(article.published_at)}</span>
        </div>

        <Link href={`/${article.category}/${article.slug}`} className="group">
          <h2 className={`${priority ? "text-3xl" : "text-xl"} font-display font-extrabold leading-tight tracking-normal text-ink group-hover:text-ocean`}>
            {article.title}
          </h2>
        </Link>

        <p className="mt-3 line-clamp-4 text-sm leading-6 text-ink/70">{article.summary_100}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(article.topics || []).slice(0, 3).map((topic) => (
            <Link
              key={topic}
              href={`/topics/${encodeURIComponent(topic)}`}
              className="rounded-md bg-mint/70 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:bg-mint"
            >
              {topic}
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <Link
            href={`/${article.category}/${article.slug}`}
            className="inline-flex items-center rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-ocean"
          >
            Read the detailed brief
          </Link>
        </div>
      </div>
    </article>
  );
}
