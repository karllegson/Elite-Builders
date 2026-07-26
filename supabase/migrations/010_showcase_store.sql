-- Lobby TV showcase store (current projects, due dates, slideshow content)

create table if not exists public.showcase_store (
  id text primary key default 'default',
  version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.showcase_store enable row level security;

create policy "Authenticated manage showcase store"
  on public.showcase_store for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
