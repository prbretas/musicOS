-- ============================================================
-- MusicOS — Migração v3: ranking dos exercícios e premiação
-- Execute no Supabase: SQL Editor → New Query → Run (idempotente)
--
-- Regras
--  - A pontuação é calculada no servidor (record_exercise_attempt), nunca no navegador.
--  - Só assinantes Pro/Vitalício pontuam (os exercícios são recurso Pro).
--  - Anti-abuso: mínimo de 1,2 s entre respostas, no máximo 400 respostas
--    pontuadas por dia, uma resposta por vez por usuário (trava).
--  - O ranking mostra só primeiro nome + inicial; quem desligar
--    "Aparecer no ranking" some dos rankings e da premiação.
-- ============================================================

alter table public.profiles add column if not exists show_in_ranking boolean not null default true;

create table if not exists public.exercise_attempts (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  mode       text not null check (mode in ('intervals', 'chords')),
  level      text not null check (level in ('beginner', 'intermediate', 'advanced')),
  correct    boolean not null,
  points     int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists exercise_attempts_created_idx on public.exercise_attempts (created_at);
create index if not exists exercise_attempts_user_idx on public.exercise_attempts (user_id, created_at desc);

alter table public.exercise_attempts enable row level security;
drop policy if exists "Users read own attempts" on public.exercise_attempts;
create policy "Users read own attempts" on public.exercise_attempts
  for select using (auth.uid() = user_id);
-- Sem policy de insert: só pela função abaixo.

-- ------------------------------------------------------------
-- Registrar uma resposta (pontuação no servidor)
-- ------------------------------------------------------------
create or replace function public.record_exercise_attempt(p_mode text, p_level text, p_correct boolean)
returns table (points int, answered_today int)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  v_tier text;
  v_status text;
  v_last timestamptz;
  v_today int;
  v_points int;
  v_day_start timestamptz := (date_trunc('day', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo';
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_mode not in ('intervals', 'chords') or p_level not in ('beginner', 'intermediate', 'advanced') then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select subscription_tier, subscription_status into v_tier, v_status from public.profiles where id = uid;
  if not (v_tier = 'lifetime' or (v_tier = 'pro' and v_status in ('active', 'trialing', 'past_due'))) then
    raise exception 'pro_required' using errcode = '42501';
  end if;

  -- uma resposta por vez por usuário
  perform pg_advisory_xact_lock(hashtext('exercise:' || uid::text));

  select max(a.created_at) into v_last from public.exercise_attempts a where a.user_id = uid;
  if v_last is not null and now() - v_last < interval '1200 milliseconds' then
    raise exception 'too_fast' using errcode = 'P0001';
  end if;

  select count(*) into v_today from public.exercise_attempts a where a.user_id = uid and a.created_at >= v_day_start;

  v_points := case
    when not p_correct then 0
    else (case p_level when 'beginner' then 1 when 'intermediate' then 2 else 3 end)
       + (case p_mode when 'chords' then 1 else 0 end)
  end;
  if v_today >= 400 then
    v_points := 0;
  end if;

  insert into public.exercise_attempts (user_id, mode, level, correct, points)
  values (uid, p_mode, p_level, p_correct, v_points);

  return query select v_points, v_today + 1;
end;
$$;

revoke execute on function public.record_exercise_attempt(text, text, boolean) from anon, public;
grant execute on function public.record_exercise_attempt(text, text, boolean) to authenticated;

-- ------------------------------------------------------------
-- Período: 'week' (segunda a domingo), 'month', 'last_month' — horário de Brasília
-- ------------------------------------------------------------
create or replace function public.ranking_bounds(p_period text, out period_start timestamptz, out period_end timestamptz)
language plpgsql stable set search_path = public as $$
declare
  local_now timestamp := now() at time zone 'America/Sao_Paulo';
begin
  if p_period = 'week' then
    period_start := date_trunc('week', local_now) at time zone 'America/Sao_Paulo';
    period_end := (date_trunc('week', local_now) + interval '7 days') at time zone 'America/Sao_Paulo';
  elsif p_period = 'month' then
    period_start := date_trunc('month', local_now) at time zone 'America/Sao_Paulo';
    period_end := (date_trunc('month', local_now) + interval '1 month') at time zone 'America/Sao_Paulo';
  elsif p_period = 'last_month' then
    period_start := (date_trunc('month', local_now) - interval '1 month') at time zone 'America/Sao_Paulo';
    period_end := date_trunc('month', local_now) at time zone 'America/Sao_Paulo';
  elsif p_period ~ '^\d{4}-\d{2}$' then
    period_start := to_date(p_period || '-01', 'YYYY-MM-DD')::timestamp at time zone 'America/Sao_Paulo';
    period_end := (to_date(p_period || '-01', 'YYYY-MM-DD')::timestamp + interval '1 month') at time zone 'America/Sao_Paulo';
  else
    raise exception 'invalid_period' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.ranking_display_name(p_name text, p_email text)
returns text language sql immutable set search_path = public as $$
  select case
    when coalesce(trim(p_name), '') = '' then 'Músico ' || upper(left(split_part(coalesce(p_email, 'anônimo'), '@', 1), 1)) || '.'
    when position(' ' in trim(p_name)) = 0 then trim(p_name)
    else split_part(trim(p_name), ' ', 1) || ' ' || upper(left(regexp_replace(trim(p_name), '^.* ', ''), 1)) || '.'
  end;
$$;

-- ------------------------------------------------------------
-- Ranking: top N + a linha de quem consulta (mesmo fora do top)
-- Mínimo de 10 respostas no período para entrar.
-- ------------------------------------------------------------
create or replace function public.exercise_leaderboard(p_period text, p_limit int default 20)
returns table (rank int, display_name text, points int, answers int, accuracy int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with b as (select * from public.ranking_bounds(p_period)),
  totals as (
    select a.user_id,
           sum(a.points)::int as points,
           count(*)::int as answers,
           round(100.0 * count(*) filter (where a.correct) / count(*))::int as accuracy,
           max(a.created_at) as last_at
    from public.exercise_attempts a, b
    where a.created_at >= b.period_start and a.created_at < b.period_end
    group by a.user_id
    having count(*) >= 10
  ),
  ranked as (
    select row_number() over (order by t.points desc, t.accuracy desc, t.last_at asc)::int as rank,
           t.*, p.name, p.email
    from totals t join public.profiles p on p.id = t.user_id
    where p.show_in_ranking or t.user_id = auth.uid()
  )
  select r.rank, public.ranking_display_name(r.name, r.email), r.points, r.answers, r.accuracy, r.user_id = auth.uid()
  from ranked r
  where r.rank <= least(greatest(p_limit, 1), 100) or r.user_id = auth.uid()
  order by r.rank;
$$;

revoke execute on function public.exercise_leaderboard(text, int) from anon, public;
grant execute on function public.exercise_leaderboard(text, int) to authenticated;

-- ------------------------------------------------------------
-- Meu progresso
-- ------------------------------------------------------------
create or replace function public.my_exercise_stats()
returns json language sql stable security definer set search_path = public as $$
  with mine as (select * from public.exercise_attempts where user_id = auth.uid()),
  by_kind as (
    select mode, level, count(*)::int as answers, count(*) filter (where correct)::int as correct, sum(points)::int as points
    from mine group by mode, level
  ),
  days as (
    select d::date as day,
           coalesce(sum(m.points), 0)::int as points,
           count(m.id)::int as answers
    from generate_series((now() at time zone 'America/Sao_Paulo')::date - 29, (now() at time zone 'America/Sao_Paulo')::date, interval '1 day') d
    left join mine m on (m.created_at at time zone 'America/Sao_Paulo')::date = d::date
    group by d order by d
  )
  select json_build_object(
    'total_points', coalesce((select sum(points) from mine), 0),
    'total_answers', (select count(*) from mine),
    'accuracy', coalesce((select round(100.0 * count(*) filter (where correct) / nullif(count(*), 0)) from mine), 0),
    'active_days', (select count(distinct (created_at at time zone 'America/Sao_Paulo')::date) from mine),
    'by_kind', coalesce((select json_agg(by_kind order by mode, level) from by_kind), '[]'::json),
    'last_30_days', (select json_agg(days) from days)
  );
$$;

revoke execute on function public.my_exercise_stats() from anon, public;
grant execute on function public.my_exercise_stats() to authenticated;

-- ------------------------------------------------------------
-- Premiação mensal
-- ------------------------------------------------------------
create table if not exists public.ranking_rewards (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  period       text not null check (period ~ '^\d{4}-\d{2}$'),
  place        int not null check (place between 1 and 3),
  points       int not null,
  amount_cents int not null,
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'applied', 'badge_only', 'rejected')),
  stripe_coupon text,
  note         text,
  created_at   timestamptz not null default now(),
  applied_at   timestamptz,
  unique (period, place),
  unique (period, user_id)
);
alter table public.ranking_rewards enable row level security;
drop policy if exists "Users read own rewards" on public.ranking_rewards;
create policy "Users read own rewards" on public.ranking_rewards
  for select using (auth.uid() = user_id);

-- Vencedores de um mês (só o servidor chama). Exige 50+ respostas e 60%+ de acerto.
create or replace function public.ranking_month_winners(p_period text)
returns table (place int, user_id uuid, points int, answers int, accuracy int)
language sql stable security definer set search_path = public as $$
  with b as (select * from public.ranking_bounds(p_period)),
  totals as (
    select a.user_id, sum(a.points)::int as points, count(*)::int as answers,
           round(100.0 * count(*) filter (where a.correct) / count(*))::int as accuracy,
           max(a.created_at) as last_at
    from public.exercise_attempts a, b
    where a.created_at >= b.period_start and a.created_at < b.period_end
    group by a.user_id
  )
  select row_number() over (order by t.points desc, t.accuracy desc, t.last_at asc)::int, t.user_id, t.points, t.answers, t.accuracy
  from totals t join public.profiles p on p.id = t.user_id
  where p.show_in_ranking and t.answers >= 50 and t.accuracy >= 60
  order by 1
  limit 3;
$$;

revoke execute on function public.ranking_month_winners(text) from anon, authenticated, public;
