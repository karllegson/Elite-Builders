-- Optional email on contact / estimate form submissions

alter table public.contact_submissions
  add column if not exists email text not null default '';
