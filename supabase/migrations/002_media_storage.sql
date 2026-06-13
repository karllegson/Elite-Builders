-- Phase 3: Supabase Storage for CMS-managed images (gallery, posts, homepage content)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  268435456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  filename text not null,
  title text not null default '',
  alt text not null default '',
  caption text not null default '',
  description text not null default '',
  mime_type text not null,
  file_size bigint not null default 0,
  width integer,
  height integer,
  source_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_created_at_idx
  on public.media_assets (created_at desc);

create index if not exists media_assets_source_key_idx
  on public.media_assets (source_key)
  where source_key is not null;

alter table public.media_assets enable row level security;

create policy "Public read media assets"
  on public.media_assets for select
  using (true);

create policy "Authenticated insert media assets"
  on public.media_assets for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated update media assets"
  on public.media_assets for update
  using (auth.role() = 'authenticated');

create policy "Authenticated delete media assets"
  on public.media_assets for delete
  using (auth.role() = 'authenticated');

-- storage.objects policies for the media bucket
create policy "Public read media files"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Authenticated upload media files"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Authenticated update media files"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Authenticated delete media files"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
