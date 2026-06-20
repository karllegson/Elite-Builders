-- Phase 3: Blog posts, categories, and tags

create table if not exists public.post_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  parent_id text references public.post_categories (id) on delete set null,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  numeric_id integer not null unique,
  title text not null,
  slug text not null unique,
  content text not null default '',
  excerpt text not null default '',
  status text not null check (status in ('draft', 'published', 'scheduled', 'trash')),
  visibility text not null check (visibility in ('public', 'password', 'private')),
  password text not null default '',
  stick_to_front_page boolean not null default false,
  author text not null,
  featured_image_id uuid references public.media_assets (id) on delete set null,
  seo_title text not null default '',
  meta_description text not null default '',
  permalink text not null default '',
  schemas jsonb not null default '[]'::jsonb,
  schema_generator_config jsonb not null default '{}'::jsonb,
  category_ids text[] not null default '{}',
  tag_ids text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lock_modified_date boolean not null default false
);

create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists posts_numeric_id_idx on public.posts (numeric_id desc);

alter table public.post_categories enable row level security;
alter table public.post_tags enable row level security;
alter table public.posts enable row level security;

create policy "Public read published posts"
  on public.posts for select
  using (
    status = 'published'
    and visibility = 'public'
    and (published_at is null or published_at <= now())
  );

create policy "Authenticated manage posts"
  on public.posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read post categories"
  on public.post_categories for select
  using (true);

create policy "Authenticated manage post categories"
  on public.post_categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read post tags"
  on public.post_tags for select
  using (true);

create policy "Authenticated manage post tags"
  on public.post_tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
