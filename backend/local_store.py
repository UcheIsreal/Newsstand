import json
import threading
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parent / "data" / "articles.json"
_lock = threading.Lock()


def _read() -> list[dict]:
    if not DATA_PATH.exists():
        return []
    try:
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _write(articles: list[dict]) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(articles, ensure_ascii=True, indent=2), encoding="utf-8")


def upsert(articles: list[dict]) -> int:
    with _lock:
        existing = {article.get("url"): article for article in _read() if article.get("url")}
        for article in articles:
            existing[article["url"]] = article
        ordered = sorted(existing.values(), key=lambda item: item.get("published_at", ""), reverse=True)
        _write(ordered)
    return len(articles)


def all_articles() -> list[dict]:
    with _lock:
        return _read()
