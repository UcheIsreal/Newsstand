# Newsstand

Newsstand is a summary-first global news aggregator. It collects RSS feeds from trusted publishers, normalizes each story, creates a detailed 100-word brief, and publishes SEO-friendly article pages with source attribution and ad-ready content sections.

The goal is not to clone publisher articles. The goal is to help readers understand fast-moving news quickly while sending clear attribution and traffic back to original sources.

## Product Direction

- Aggregate major RSS feeds across world, business, finance, politics, technology, sports, entertainment, and health.
- Generate an original 100-word news brief for each item.
- Create one indexable page per qualified news item.
- Link every story to categories, topics, source pages, and related stories.
- Prepare tasteful Google AdSense placements without overloading pages.
- Keep weak, incomplete, duplicate, or unsafe pages out of the index.

## Architecture

```text
RSS sources
  -> FastAPI ingestion worker
  -> Supabase Postgres
  -> Next.js website
  -> Google Search / AdSense-ready pages
```

## Backend

The backend is in `backend/`.

Main responsibilities:

- Fetch RSS feeds every 30 minutes.
- Parse titles, excerpts, canonical URLs, images, dates, tags, and source data.
- Create slugs and stable IDs.
- Generate a detailed 100-word brief.
- Store articles in Supabase.
- Expose article, category, topic, source, and sitemap endpoints.

Setup:

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload
```

Required environment variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ALLOWED_ORIGINS=http://localhost:3000
FETCH_ON_STARTUP=true
```

Run `backend/schema.sql` in Supabase before starting the backend.

## Frontend

The frontend is in `frontend/`.

Main responsibilities:

- Render homepage, category pages, article pages, topic pages, and source pages.
- Generate SEO metadata.
- Generate sitemap and robots files.
- Display source attribution and outbound links.
- Provide AdSense-ready placements through reusable ad slot components.

Setup:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Required environment variables:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_CLIENT=
```

`NEXT_PUBLIC_ADSENSE_CLIENT` can stay empty until the site is accepted into AdSense.

For a live deployment, set `NEXT_PUBLIC_API_URL` on the frontend to the public backend URL, set `NEXT_PUBLIC_SITE_URL` to the public frontend URL, and set `ALLOWED_ORIGINS` on the backend to the frontend URL. Apply `backend/schema.sql` to Supabase before the first production fetch. The backend fetches RSS on startup and every 30 minutes.

## SEO Principles

- Article pages should include source attribution and a clear outbound link.
- Summaries must be original and concise.
- Thin, duplicate, unsafe, or incomplete pages should not be indexed.
- Category, topic, source, and article pages should all link together.
- Ads should support the reading experience instead of replacing content value.

## Deployment

- Backend: Render, Railway, Fly.io, or another always-on Python service.
- Database: Supabase.
- Frontend: Vercel.

The backend `render.yaml` is included as a starting point.
