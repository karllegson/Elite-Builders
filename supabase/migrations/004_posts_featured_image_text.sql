-- Allow library-* ids and Supabase media UUIDs for featured images (no FK)

alter table public.posts
  drop constraint if exists posts_featured_image_id_fkey;

alter table public.posts
  alter column featured_image_id type text using featured_image_id::text;
