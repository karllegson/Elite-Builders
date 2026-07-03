-- FAQs CMS store (categories + entries as JSON — one row per site)

create table if not exists public.faqs_store (
  id text primary key default 'default',
  version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.faqs_store enable row level security;

create policy "Authenticated manage faqs store"
  on public.faqs_store for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
