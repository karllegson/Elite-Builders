-- Contact / estimate form submissions

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  city text not null default '',
  service text not null default '',
  message text not null default '',
  page_path text not null default '/',
  form_type text not null default 'estimate' check (form_type in ('estimate', 'contact')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_is_read_idx
  on public.contact_submissions (is_read, created_at desc);

alter table public.contact_submissions enable row level security;

create policy "Authenticated read contact submissions"
  on public.contact_submissions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated update contact submissions"
  on public.contact_submissions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated delete contact submissions"
  on public.contact_submissions for delete
  using (auth.role() = 'authenticated');
