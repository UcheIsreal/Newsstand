import logging
import os
from functools import lru_cache

from dotenv import load_dotenv
from supabase import Client, create_client

from content_tools import summarize_100
from local_store import all_articles, upsert

load_dotenv()

logger = logging.getLogger(__name__)


def supabase_key() -> str | None:
    return (
        os.getenv("SUPABASE_SERVICE_KEY")
        or os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_KEY")
    )


def using_local_store() -> bool:
    return not os.getenv("SUPABASE_URL") or not supabase_key()


def get_local_articles(
    category: str | None = None,
    topic: str | None = None,
    source: str | None = None,
    limit: int = 50,
    offset: int = 0,
    indexable_only: bool = True,
) -> list[dict]:
    articles = [
        article for article in all_articles()
        if article.get("status") == "published"
        and (not indexable_only or article.get("indexable", False))
        and (not category or article.get("category") == category)
        and (not source or article.get("source_domain") == source)
        and (not topic or topic in (article.get("topics") or []))
    ]
    return [normalize_article(article) for article in articles[offset : offset + limit]]


def normalize_article(article: dict) -> dict:
    normalized = dict(article)
    if not normalized.get("summary_100"):
        normalized["summary_100"] = summarize_100(
            normalized.get("title", ""), normalized.get("excerpt", "")
        )
    return normalized


@lru_cache(maxsize=1)
def get_client() -> Client:
    return create_client(
        os.environ["SUPABASE_URL"],
        supabase_key() or "",
    )


def upsert_articles(articles: list[dict]) -> int:
    if not articles:
        return 0

    if using_local_store():
        logger.info("Using local article store")
        return upsert(articles)

    try:
        response = (
            get_client()
            .table("articles")
            .upsert(articles, on_conflict="url")
            .execute()
        )
        count = len(response.data) if response.data else 0
        logger.info("Upserted %s articles", count)
        return count
    except Exception:
        logger.exception("Supabase upsert failed; falling back to local article store")
        return upsert(articles)


def get_articles(
    category: str | None = None,
    topic: str | None = None,
    source: str | None = None,
    limit: int = 50,
    offset: int = 0,
    indexable_only: bool = True,
) -> list[dict]:
    if using_local_store():
        return get_local_articles(category, topic, source, limit, offset, indexable_only)

    try:
        query = (
            get_client()
            .table("articles")
            .select("*")
            .eq("status", "published")
            .order("published_at", desc=True)
            .limit(limit)
            .offset(offset)
        )

        if indexable_only:
            query = query.eq("indexable", True)
        if category:
            query = query.eq("category", category)
        if source:
            query = query.eq("source_domain", source)
        if topic:
            query = query.contains("topics", [topic])

        response = query.execute()
        return [normalize_article(article) for article in (response.data or [])]
    except Exception:
        logger.exception("Supabase read failed; falling back to local article store")
        return get_local_articles(category, topic, source, limit, offset, indexable_only)


def get_article_by_slug(slug: str) -> dict | None:
    if using_local_store():
        return get_article_by_slug_from_local(slug)

    try:
        response = (
            get_client()
            .table("articles")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .limit(1)
            .execute()
        )
        if response.data:
            return normalize_article(response.data[0])
    except Exception:
        logger.exception("Supabase article lookup failed; falling back to local article store")
        return get_article_by_slug_from_local(slug)
    return None


def get_article_by_slug_from_local(slug: str) -> dict | None:
    article = next(
        (
            article
            for article in all_articles()
            if article.get("slug") == slug and article.get("status") == "published"
        ),
        None,
    )
    return normalize_article(article) if article else None


def get_related_articles(article: dict, limit: int = 6) -> list[dict]:
    if using_local_store():
        topics = set(article.get("topics") or [])
        candidates = [
            item for item in get_articles(limit=500)
            if item.get("id") != article.get("id")
            and (item.get("category") == article.get("category") or topics.intersection(item.get("topics") or []))
        ]
        return candidates[:limit]

    topics = article.get("topics") or []
    category = article.get("category")

    query = (
        get_client()
        .table("articles")
        .select("*")
        .eq("status", "published")
        .eq("indexable", True)
        .neq("id", article["id"])
        .order("published_at", desc=True)
        .limit(limit)
    )

    if topics:
        query = query.overlaps("topics", topics[:4])
    elif category:
        query = query.eq("category", category)

    try:
        response = query.execute()
        return [normalize_article(item) for item in (response.data or [])]
    except Exception:
        logger.exception("Supabase related article lookup failed; falling back to local article store")
        topics_set = set(topics)
        candidates = [
            item for item in get_local_articles(limit=500)
            if item.get("id") != article.get("id")
            and (item.get("category") == category or topics_set.intersection(item.get("topics") or []))
        ]
        return candidates[:limit]


def get_distinct_sources() -> list[dict]:
    articles = get_articles(limit=500, indexable_only=False)
    sources: dict[str, dict] = {}

    for article in articles:
        domain = article.get("source_domain")
        if not domain:
            continue
        sources[domain] = {
            "name": article.get("source_name", domain),
            "domain": domain,
        }

    return sorted(sources.values(), key=lambda item: item["name"])


def get_popular_topics(limit: int = 40) -> list[dict]:
    articles = get_articles(limit=500)
    counts: dict[str, int] = {}

    for article in articles:
        for topic in article.get("topics") or []:
            counts[topic] = counts.get(topic, 0) + 1

    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    return [{"topic": topic, "count": count} for topic, count in ranked[:limit]]
