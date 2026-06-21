-- First-party site analytics (page views + key conversion events)

create table if not exists public.site_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in ('page_view', 'phone_click', 'estimate_form_submit', 'outbound_link')
  ),
  page_path text not null default '/',
  metadata jsonb not null default '{}'::jsonb,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists site_analytics_events_created_at_idx
  on public.site_analytics_events (created_at desc);

create index if not exists site_analytics_events_type_created_at_idx
  on public.site_analytics_events (event_type, created_at desc);

create index if not exists site_analytics_events_page_path_idx
  on public.site_analytics_events (page_path, created_at desc);

alter table public.site_analytics_events enable row level security;

create policy "Authenticated read site analytics"
  on public.site_analytics_events for select
  using (auth.role() = 'authenticated');

create or replace function public.get_site_analytics_summary(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  today_start timestamptz := date_trunc('day', timezone('utc', now()));
begin
  select jsonb_build_object(
    'periodDays', greatest(p_days, 1),
    'pageViews', (
      select count(*)::int
      from public.site_analytics_events
      where event_type = 'page_view' and created_at >= since
    ),
    'phoneClicks', (
      select count(*)::int
      from public.site_analytics_events
      where event_type = 'phone_click' and created_at >= since
    ),
    'estimateSubmits', (
      select count(*)::int
      from public.site_analytics_events
      where event_type = 'estimate_form_submit' and created_at >= since
    ),
    'outboundClicks', (
      select count(*)::int
      from public.site_analytics_events
      where event_type = 'outbound_link' and created_at >= since
    ),
    'todayPageViews', (
      select count(*)::int
      from public.site_analytics_events
      where event_type = 'page_view' and created_at >= today_start
    ),
    'todayPhoneClicks', (
      select count(*)::int
      from public.site_analytics_events
      where event_type = 'phone_click' and created_at >= today_start
    ),
    'topPages', coalesce((
      select jsonb_agg(jsonb_build_object('path', page_path, 'views', views) order by views desc)
      from (
        select page_path, count(*)::int as views
        from public.site_analytics_events
        where event_type = 'page_view' and created_at >= since
        group by page_path
        order by views desc
        limit 10
      ) ranked
    ), '[]'::jsonb),
    'recentEvents', coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventType', event_type,
        'pagePath', page_path,
        'metadata', metadata,
        'createdAt', created_at
      ) order by created_at desc)
      from (
        select event_type, page_path, metadata, created_at
        from public.site_analytics_events
        where created_at >= since
        order by created_at desc
        limit 20
      ) recent
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_site_analytics_summary(integer) from public;
grant execute on function public.get_site_analytics_summary(integer) to service_role;
