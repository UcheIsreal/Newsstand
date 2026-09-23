export type Article = {
  id: string;
  slug: string;
  title: string;
  original_title?: string;
  summary_100: string;
  excerpt?: string;
  url: string;
  canonical_url?: string;
  source_name: string;
  source_domain: string;
  category: string;
  image_url?: string;
  published_at?: string;
  updated_at?: string;
  tags?: string[];
  topics?: string[];
  entities?: string[];
  seo_title?: string;
  meta_description?: string;
  content_quality?: number;
  indexable?: boolean;
};

export type Topic = {
  topic: string;
  count: number;
};

export type Source = {
  name: string;
  domain: string;
};
