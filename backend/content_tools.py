import re
import unicodedata
from html import unescape
from urllib.parse import urlparse


STOPWORDS = {
    "about", "after", "again", "against", "also", "among", "because", "before",
    "being", "between", "could", "during", "from", "have", "into", "more",
    "over", "said", "says", "than", "that", "their", "there", "these", "this",
    "through", "under", "were", "what", "when", "where", "which", "while",
    "with", "would", "your",
}


def clean_text(value: str | None) -> str:
    if not value:
        return ""

    text = re.sub(r"<script.*?</script>", " ", value, flags=re.I | re.S)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def word_limit(text: str, limit: int, suffix: str = "") -> str:
    words = text.split()
    if len(words) <= limit:
        return text
    return " ".join(words[:limit]).rstrip(".,;:") + suffix


def summarize_100(title: str, excerpt: str) -> str:
    """Create a compact, factual brief from the headline and RSS description.

    This intentionally stays extractive: it never invents facts that are not in
    the publisher-provided RSS text. It also stops on a complete sentence so a
    brief never ends with a cut-off phrase or an ellipsis.
    """
    headline = clean_text(title)
    body = clean_text(excerpt)

    if headline and body.lower().startswith(headline.lower()):
        body = body[len(headline):].lstrip(" .:;-–—")

    source = ". ".join(part for part in (headline, body) if part)
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", source)
        if sentence.strip()
    ]

    selected = []
    total_words = 0
    for sentence in sentences:
        sentence_words = len(sentence.split())
        if total_words and total_words + sentence_words > 100:
            break
        selected.append(sentence)
        total_words += sentence_words

    summary = " ".join(selected) if selected else word_limit(source, 100)
    if not summary.endswith((".", "!", "?")):
        summary = summary.rstrip(" ,;:") + "."
    return summary


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug[:96].strip("-") or "news-update"


def domain_from_url(url: str) -> str:
    netloc = urlparse(url).netloc.lower()
    return netloc[4:] if netloc.startswith("www.") else netloc


def extract_topics(title: str, excerpt: str, tags: list[str]) -> list[str]:
    candidates = []
    for tag in tags:
        cleaned = clean_text(tag).lower()
        if cleaned:
            candidates.append(cleaned)

    text = clean_text(f"{title} {excerpt}")
    for phrase in re.findall(r"\b[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,3}", text):
        cleaned = clean_text(phrase).lower()
        if len(cleaned) > 2:
            candidates.append(cleaned)

    for word in re.findall(r"\b[a-zA-Z][a-zA-Z0-9-]{4,}\b", text.lower()):
        if word not in STOPWORDS:
            candidates.append(word)

    seen = set()
    topics = []
    for item in candidates:
        item = re.sub(r"[^a-z0-9&.\-\s]", "", item).strip()
        if item and item not in seen:
            seen.add(item)
            topics.append(item)
        if len(topics) == 8:
            break
    return topics


def seo_title(title: str, source_name: str) -> str:
    clean = clean_text(title)
    suffix = f" | {source_name} Brief"
    return word_limit(clean, 10)[: max(0, 60 - len(suffix))].strip() + suffix


def meta_description(summary: str) -> str:
    return word_limit(clean_text(summary), 28)[:155].strip()
