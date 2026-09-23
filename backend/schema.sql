-- Newsstand database schema.
-- Run this file in the Supabase SQL editor.

create table if not exists articles (
  id                 text primary key,
  slug               text unique not null,
  title              text not null,
  original_title     text,
  summary_100        text not null,
  excerpt            text,
  url                text not null unique,
  canonical_url      text,
  source_name        text not null,
  source_domain      text not null,
  category           text not null,
  image_url          text,
  published_at       timestamptz,
  fetched_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  tags               text[] default '{}',
  topics             text[] default '{}',
  entities           text[] default '{}',
  seo_title          text,
  meta_description   text,
  reading_time       integer default 1,
  content_quality    integer default 60,
  indexable          boolean default true,
  status             text default 'published',
  source_payload     jsonb default '{}'::jsonb
);

create index if not exists idx_articles_category_published
  on articles (category, published_at desc);

create index if not exists idx_articles_published
  on articles (published_at desc);

create index if not exists idx_articles_slug
  on articles (slug);

create index if not exists idx_articles_source_domain
  on articles (source_domain);

create index if not exists idx_articles_topics
  on articles using gin (topics);

create index if not exists idx_articles_tags
  on articles using gin (tags);

alter table articles enable row level security;

drop policy if exists "Public read access" on articles;

create policy "Public read access"
  on articles for select
  using (status = 'published');

-- Migration for databases created with the previous 50-word model.
alter table articles add column if not exists summary_100 text;
alter table articles add column if not exists summary_50 text;
update articles
set summary_100 = coalesce(summary_100, summary_50)
where summary_100 is null;
alter table articles alter column summary_100 set not null;
alter table articles drop column if exists summary_50;
alter table articles drop column if exists why_it_matters;
