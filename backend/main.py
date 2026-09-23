import logging
import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import (
    get_article_by_slug,
    get_articles,
    get_distinct_sources,
    get_popular_topics,
    get_related_articles,
    upsert_articles,
    using_local_store,
)
from demo_data import preview_articles
from feed_fetcher import fetch_all
from sources import SOURCES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def run_fetch_job() -> int:
    logger.info("Running feed fetch")
    articles = fetch_all()
    if not articles and using_local_store():
        logger.warning("No RSS entries available; loading local preview content")
        articles = preview_articles()
    return upsert_articles(articles)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("FETCH_ON_STARTUP", "true").lower() == "true":
        try:
            await run_fetch_job()
        except Exception:
            logger.exception("Startup fetch failed")

    scheduler.add_job(run_fetch_job, "interval", minutes=30, id="fetch_feeds", replace_existing=True)
    scheduler.start()
    logger.info("Scheduler started")

    yield

    scheduler.shutdown()


app = FastAPI(
    title="Newsstand API",
    description="RSS ingestion and summary-first news API.",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Newsstand API is running"}


@app.get("/health")
def health():
    return {"status": "healthy", "categories": list(SOURCES.keys())}


@app.get("/articles")
async def list_articles(
    category: str | None = Query(None),
    topic: str | None = Query(None),
    source: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    try:
        articles = get_articles(
            category=category,
            topic=topic,
            source=source,
            limit=limit,
            offset=offset,
        )
        if not articles and offset == 0:
            await run_fetch_job()
            articles = get_articles(
                category=category,
                topic=topic,
                source=source,
                limit=limit,
                offset=offset,
            )
        return {"articles": articles, "count": len(articles)}
    except Exception as exc:
        logger.exception("Failed to list articles")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/articles/{slug}")
async def article_detail(slug: str):
    article = get_article_by_slug(slug)
    if not article:
        await run_fetch_job()
        article = get_article_by_slug(slug)

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return {
        "article": article,
        "related": get_related_articles(article),
    }


@app.post("/fetch")
async def trigger_fetch():
    try:
        count = await run_fetch_job()
        return {"status": "ok", "upserted": count}
    except Exception as exc:
        logger.exception("Manual fetch failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/categories")
def list_categories():
    return {"categories": list(SOURCES.keys())}


@app.get("/topics")
def list_topics(limit: int = Query(40, ge=1, le=100)):
    return {"topics": get_popular_topics(limit)}


@app.get("/sources")
def list_sources():
    return {"sources": get_distinct_sources()}


@app.get("/sitemap-data")
def sitemap_data(limit: int = Query(1000, ge=1, le=5000)):
    articles = get_articles(limit=limit)
    return {
        "articles": [
            {
                "slug": article["slug"],
                "category": article["category"],
                "updated_at": article.get("updated_at") or article.get("published_at"),
            }
            for article in articles
        ],
        "categories": list(SOURCES.keys()),
        "topics": get_popular_topics(100),
        "sources": get_distinct_sources(),
    }
