-- ============================================================
-- MusicOS — migração v5: métricas de uso e painel do administrador
--
--  - analytics_events: eventos anônimos (visitas, áreas, cliques, paywall).
--    Sem IP e sem e-mail: só um id aleatório do navegador, país/estado/cidade
--    vindos do cabeçalho da hospedagem e o tipo de aparelho.
--    Gravado só pelo servidor (/api/track, service role). Ninguém lê pela API.
--  - is_admin(): administrador = profiles.role = 'admin' (coluna que o
--    usuário não consegue alterar; ver protect_billing_columns).
--  - admin_dashboard(dias): tudo o que o painel /admin mostra, num JSON.
--  - purge_analytics(): apaga eventos com mais de 13 meses.
-- ============================================================

create table if not exists public.analytics_events (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  visitor_id   text not null check (char_length(visitor_id) between 8 and 64),
  session_id   text check (session_id is null or char_length(session_id) <= 64),
  user_id      uuid references auth.users(id) on delete set null,
  name         text not null check (name ~ '^[a-z0-9_:.-]{2,48}$'),
  props        jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 2048),
  path         text check (path is null or char_length(path) <= 200),
  country      text check (country is null or char_length(country) <= 2),
  region       text check (region is null or char_length(region) <= 64),
  city         text check (city is null or char_length(city) <= 80),
  device       text check (device is null or device in ('desktop', 'mobile')),
  referrer     text check (referrer is null or char_length(referrer) <= 120),
  utm_source   text check (utm_source is null or char_length(utm_source) <= 80),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120)
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_idx on public.analytics_events (name, created_at desc);
create index if not exists analytics_events_visitor_idx on public.analytics_events (visitor_id, created_at desc);

alter table public.analytics_events enable row level security;
-- Sem policies: nenhum usuário lê ou escreve direto. Só service role e as funções abaixo.

-- ------------------------------------------------------------
-- Administrador
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) and public.session_is_current();
$$;
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------
-- Painel: um JSON com todas as séries do período (horário de Brasília)
-- ------------------------------------------------------------
create or replace function public.admin_dashboard(p_days int default 30)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_days  int := least(greatest(coalesce(p_days, 30), 1), 365);
  v_since timestamptz := (date_trunc('day', now() at time zone 'America/Sao_Paulo') - make_interval(days => v_days - 1))
                         at time zone 'America/Sao_Paulo';
  v_out   jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with ev as (
    select * from public.analytics_events where created_at >= v_since
  ),
  days as (
    select generate_series(
      (v_since at time zone 'America/Sao_Paulo')::date,
      (now() at time zone 'America/Sao_Paulo')::date,
      interval '1 day'
    )::date as d
  ),
  signups as (
    select (u.created_at at time zone 'America/Sao_Paulo')::date as d, count(*) as n
    from auth.users u where u.created_at >= v_since group by 1
  ),
  daily as (
    select (created_at at time zone 'America/Sao_Paulo')::date as d,
           count(distinct visitor_id) as visitors,
           count(*) filter (where name = 'page_view') as views,
           count(*) filter (where name = 'paywall') as paywall
    from ev group by 1
  )
  select jsonb_build_object(
    'days', v_days,
    'since', v_since,
    'totals', jsonb_build_object(
      'visitors',        (select count(distinct visitor_id) from ev),
      'sessions',        (select count(distinct session_id) from ev),
      'page_views',      (select count(*) from ev where name = 'page_view'),
      'signups_period',  (select count(*) from auth.users where created_at >= v_since),
      'users_total',     (select count(*) from auth.users),
      'free_users',      (select count(*) from public.profiles where coalesce(subscription_tier, 'free') = 'free'
                           or (subscription_tier = 'pro' and subscription_status not in ('active', 'trialing', 'past_due'))),
      'pro_active',      (select count(*) from public.profiles where subscription_tier = 'pro' and subscription_status in ('active', 'trialing', 'past_due')),
      'pro_monthly',     (select count(*) from public.profiles where subscription_tier = 'pro' and subscription_status in ('active', 'trialing', 'past_due') and plan_id ilike '%month%'),
      'pro_yearly',      (select count(*) from public.profiles where subscription_tier = 'pro' and subscription_status in ('active', 'trialing', 'past_due') and plan_id ilike '%year%'),
      'lifetime',        (select count(*) from public.profiles where subscription_tier = 'lifetime'),
      'paywall_hits',    (select count(*) from ev where name = 'paywall'),
      'paywall_visitors',(select count(distinct visitor_id) from ev where name = 'paywall'),
      'checkout_starts', (select count(*) from ev where name = 'checkout_start'),
      'online_now',      (select count(distinct visitor_id) from public.analytics_events where created_at >= now() - interval '5 minutes')
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'd', days.d, 'visitors', coalesce(daily.visitors, 0), 'views', coalesce(daily.views, 0),
        'signups', coalesce(signups.n, 0), 'paywall', coalesce(daily.paywall, 0)
      ) order by days.d), '[]'::jsonb)
      from days left join daily using (d) left join signups using (d)
    ),
    'countries', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', coalesce(country, '??'), 'visitors', count(distinct visitor_id)) as x
        from ev group by coalesce(country, '??') order by count(distinct visitor_id) desc limit 15
      ) t
    ),
    'regions', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', coalesce(region, '?') || ' · ' || coalesce(country, '??'), 'visitors', count(distinct visitor_id)) as x
        from ev where region is not null group by region, country order by count(distinct visitor_id) desc limit 15
      ) t
    ),
    'cities', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', city || coalesce(' · ' || region, ''), 'visitors', count(distinct visitor_id)) as x
        from ev where city is not null group by city, region order by count(distinct visitor_id) desc limit 15
      ) t
    ),
    'devices', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', coalesce(device, '?'), 'visitors', count(distinct visitor_id)) as x
        from ev group by device order by 1 desc
      ) t
    ),
    'areas', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', props->>'area', 'count', count(*), 'visitors', count(distinct visitor_id)) as x
        from ev where name = 'area_view' and props ? 'area' group by props->>'area' order by count(*) desc limit 20
      ) t
    ),
    'paywall', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', props->>'feature', 'count', count(*), 'visitors', count(distinct visitor_id)) as x
        from ev where name = 'paywall' group by props->>'feature' order by count(*) desc limit 20
      ) t
    ),
    'clicks', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', props->>'target', 'count', count(*), 'visitors', count(distinct visitor_id)) as x
        from ev where name = 'click' and props ? 'target' group by props->>'target' order by count(*) desc limit 25
      ) t
    ),
    'choices', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', name || ': ' || coalesce(props->>'value', '?'), 'count', count(*)) as x
        from ev where name in ('scale_change', 'instrument_change', 'tuning_change', 'practice_play', 'tool_open')
        group by name, props->>'value' order by count(*) desc limit 25
      ) t
    ),
    'sources', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('key', coalesce(utm_source, referrer, 'direto'), 'visitors', count(distinct visitor_id)) as x
        from ev group by coalesce(utm_source, referrer, 'direto') order by count(distinct visitor_id) desc limit 15
      ) t
    ),
    'recent_signups', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object(
          'email', u.email, 'created_at', u.created_at,
          'provider', u.raw_app_meta_data->>'provider',
          'tier', coalesce(p.subscription_tier, 'free'), 'status', p.subscription_status
        ) as x
        from auth.users u left join public.profiles p on p.id = u.id
        order by u.created_at desc limit 20
      ) t
    )
  ) into v_out;

  return v_out;
end;
$$;
revoke execute on function public.admin_dashboard(int) from anon, public;
grant execute on function public.admin_dashboard(int) to authenticated;

-- ------------------------------------------------------------
-- Retenção: apagar eventos com mais de 13 meses (chamado pelo cron diário)
-- ------------------------------------------------------------
create or replace function public.purge_analytics()
returns int
language sql security definer set search_path = '' as $$
  with del as (
    delete from public.analytics_events where created_at < now() - interval '13 months' returning 1
  )
  select count(*)::int from del;
$$;
revoke execute on function public.purge_analytics() from anon, public, authenticated;
