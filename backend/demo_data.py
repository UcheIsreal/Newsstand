from datetime import datetime, timezone

from content_tools import extract_topics, meta_description, seo_title, slugify, summarize_100


def preview_articles() -> list[dict]:
    now = datetime.now(timezone.utc).isoformat()
    stories = [
        ("How smaller AI tools are changing everyday work", "How smaller AI tools are changing everyday work", "technology", "Newsstand preview content showing how concise reporting can explain practical technology trends without reproducing a publisher's article."),
        ("What resilient businesses are prioritizing in uncertain markets", "What resilient businesses are prioritizing in uncertain markets", "business", "Newsstand preview content about planning, customer value, and operational decisions businesses can evaluate as markets change."),
        ("Why local context matters when following global news", "Why local context matters when following global news", "world", "Newsstand preview content explaining why readers benefit from source attribution and context when interpreting international events."),
        ("The next phase of digital health information", "The next phase of digital health information", "health", "Newsstand preview content about making health information easier to understand while directing readers to trusted original reporting."),
        ("The data signals changing how fans follow sport", "The data signals changing how fans follow sport", "sports", "Newsstand preview content exploring how live data, reporting, and fan habits are reshaping the sports news experience."),
        ("Why independent culture reporting still matters online", "Why independent culture reporting still matters online", "entertainment", "Newsstand preview content about discovery, attribution, and the role of careful reporting in culture coverage."),
    ]

    articles = []
    for index, (title, original_title, category, excerpt) in enumerate(stories, start=1):
        summary = summarize_100(title, excerpt)
        topic_list = extract_topics(title, excerpt, [])
        slug = f"{slugify(title)}-preview-{index}"
        articles.append({
            "id": f"preview-{index}",
            "slug": slug,
            "title": title,
            "original_title": original_title,
            "summary_100": summary,
            "excerpt": excerpt,
            "url": f"https://newsstand.local/preview/{index}",
            "canonical_url": f"https://newsstand.local/preview/{index}",
            "source_name": "Newsstand Preview",
            "source_domain": "newsstand.local",
            "category": category,
            "image_url": None,
            "published_at": now,
            "fetched_at": now,
            "updated_at": now,
            "tags": ["preview", category],
            "topics": topic_list,
            "entities": topic_list[:5],
            "seo_title": seo_title(title, "Newsstand Preview"),
            "meta_description": meta_description(summary),
            "reading_time": 1,
            "content_quality": 100,
            "indexable": True,
            "status": "published",
            "source_payload": {"preview": True},
        })
    return articles
