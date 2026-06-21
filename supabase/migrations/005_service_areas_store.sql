-- Service areas CMS store (full editor state as JSON — one row per site)

create table if not exists public.service_areas_store (
  id text primary key default 'default',
  version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.service_areas_store enable row level security;

create policy "Authenticated manage service areas store"
  on public.service_areas_store for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
