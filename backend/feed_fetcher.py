import hashlib
import logging
from urllib.request import Request, urlopen
from datetime import datetime, timezone
from typing import Any

import feedparser

from content_tools import (
    clean_text,
    domain_from_url,
    extract_topics,
    meta_description,
    seo_title,
    slugify,
    summarize_100,
    word_limit,
)
from sources import SOURCES

logger = logging.getLogger(__name__)


def fetch_feed(url: str):
    request = Request(
        url,
        headers={
            "User-Agent": "Newsstand/1.0 (+https://newsstand.example; RSS reader)",
            "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
        },
    )
    with urlopen(request, timeout=20) as response:
        return feedparser.parse(response.read())


def parse_date(entry: Any) -> str:
    for attr in ["published_parsed", "updated_parsed", "created_parsed"]:
        value = getattr(entry, attr, None)
        if value:
            try:
                return datetime(*value[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                logger.debug("Could not parse feed date", exc_info=True)
    return datetime.now(timezone.utc).isoformat()


def get_excerpt(entry: Any) -> str:
    if entry.get("summary"):
        text = entry.get("summary", "")
    elif entry.get("content"):
        text = entry.content[0].get("value", "")
    elif entry.get("description"):
        text = entry.get("description", "")
    else:
        text = ""

    return word_limit(clean_text(text), 90, "...")


def get_image(entry: Any) -> str | None:
    if entry.get("media_thumbnail"):
        return entry.media_thumbnail[0].get("url")

    if entry.get("media_content"):
        for media in entry.media_content:
            url = media.get("url", "")
            if media.get("medium") == "image" or url.endswith((".jpg", ".jpeg", ".png", ".webp")):
                return url

    if entry.get("enclosures"):
        for enclosure in entry.enclosures:
            if "image" in enclosure.get("type", ""):
                return enclosure.get("url")

    links = entry.get("links", [])
    for link in links:
        if "image" in link.get("type", ""):
            return link.get("href")

    return None


def make_id(url: str) -> str:
    return hashlib.sha256(url.encode("utf-8")).hexdigest()[:32]


def build_article(entry: Any, source: dict, category: str) -> dict | None:
    url = entry.get("link", "").strip()
    title = clean_text(entry.get("title", ""))

    if not url or not title:
        return None

    excerpt = get_excerpt(entry)
    tags = [clean_text(tag.get("term", "")) for tag in entry.get("tags", []) if tag.get("term")]
    topics = extract_topics(title, excerpt, tags)
    summary = summarize_100(title, excerpt)
    source_domain = source.get("domain") or source.get("logo") or domain_from_url(url)
    slug = f"{slugify(title)}-{make_id(url)[:8]}"

    content_quality = 85 if excerpt and len(summary.split()) >= 25 else 55
    indexable = content_quality >= 60

    return {
        "id": make_id(url),
        "slug": slug,
        "title": title,
        "original_title": title,
        "summary_100": summary,
        "excerpt": excerpt,
        "url": url,
        "canonical_url": url,
        "source_name": source["name"],
        "source_domain": source_domain,
        "category": category,
        "image_url": get_image(entry),
        "published_at": parse_date(entry),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "tags": tags[:8],
        "topics": topics,
        "entities": topics[:5],
        "seo_title": seo_title(title, source["name"]),
        "meta_description": meta_description(summary),
        "reading_time": 1,
        "content_quality": content_quality,
        "indexable": indexable,
        "status": "published",
        "source_payload": {
            "feed_url": source["url"],
            "feed_id": entry.get("id", ""),
            "author": entry.get("author", ""),
        },
    }


def fetch_category(category: str) -> list[dict]:
    articles = []

    for source in SOURCES.get(category, []):
        try:
            logger.info("Fetching %s", source["name"])
            feed = fetch_feed(source["url"])

            if feed.bozo and not feed.entries:
                logger.warning("Feed error for %s: %s", source["name"], feed.bozo_exception)
                continue

            for entry in feed.entries[:12]:
                article = build_article(entry, source, category)
                if article:
                    articles.append(article)

        except Exception:
            logger.exception("Failed to fetch %s", source["name"])

    logger.info("Fetched %s articles for %s", len(articles), category)
    return articles


def fetch_all() -> list[dict]:
    articles = []
    for category in SOURCES:
        articles.extend(fetch_category(category))
    logger.info("Fetched %s total articles", len(articles))
    return articles
