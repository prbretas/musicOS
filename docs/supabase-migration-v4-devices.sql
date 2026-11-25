-- ============================================================
-- MusicOS — migração v4: limite de dispositivos por conta
--
-- Regra: cada conta tem no máximo 1 dispositivo "computador" e
-- 1 "celular" conectados ao mesmo tempo. Ao entrar num novo
-- dispositivo do mesmo tipo, a sessão anterior é encerrada no
-- servidor (auth.sessions), então quem compartilhar a senha
-- derruba a si mesmo.
--
--  - user_devices: um registro por (usuário, tipo)
--  - claim_device(): o dispositivo atual assume a vaga do seu tipo
--  - check_device(): batimento — a sessão ainda vale?
--  - revoke_device(): "Desconectar" na página da conta / ao sair
--  - session_is_current(): usada nas policies e nas RPCs, para que
--    um token antigo (ainda não expirado) de uma sessão derrubada
--    não leia o plano nem pontue.
-- ============================================================

create table if not exists public.user_devices (
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('desktop', 'mobile')),
  device_id  text not null check (char_length(device_id) between 8 and 64),
  session_id uuid not null,
  label      text check (label is null or char_length(label) <= 80),
  last_seen  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, kind)
);
create index if not exists user_devices_session_idx on public.user_devices (session_id);

alter table public.user_devices enable row level security;
alter table public.user_devices replica identity full;
drop policy if exists "Users read own devices" on public.user_devices;
create policy "Users read own devices" on public.user_devices
  for select to authenticated using ((select auth.uid()) = user_id);
-- Sem insert/update/delete: só pelas funções abaixo.

do $$ begin
  alter publication supabase_realtime add table public.user_devices;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- A sessão do token atual ainda existe?
-- ------------------------------------------------------------
create or replace function public.session_is_current()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.sessions s
    where s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
      and s.user_id = auth.uid()
  );
$$;
revoke execute on function public.session_is_current() from anon, public;
grant execute on function public.session_is_current() to authenticated;

-- Perfil (plano) só é lido por sessão válida
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id and public.session_is_current());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id and public.session_is_current());

-- ------------------------------------------------------------
-- O dispositivo atual assume a vaga do seu tipo
-- ------------------------------------------------------------
create or replace function public.claim_device(p_device_id text, p_kind text, p_label text default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_sid uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  v_old_sid uuid;
  v_kicked boolean := false;
begin
  if v_uid is null or v_sid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_kind not in ('desktop', 'mobile') or p_device_id is null
     or char_length(p_device_id) not between 8 and 64 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.sessions where id = v_sid and user_id = v_uid) then
    return jsonb_build_object('ok', false, 'reason', 'session_revoked');
  end if;

  perform pg_advisory_xact_lock(hashtext('device:' || v_uid::text));

  select d.session_id into v_old_sid
  from public.user_devices d where d.user_id = v_uid and d.kind = p_kind;

  if v_old_sid is not null and v_old_sid <> v_sid then
    delete from auth.sessions where id = v_old_sid and user_id = v_uid;
    v_kicked := found;
  end if;

  -- se esta sessão ocupava a vaga do outro tipo, libera
  delete from public.user_devices
  where user_id = v_uid and kind <> p_kind and session_id = v_sid;

  insert into public.user_devices as d (user_id, kind, device_id, session_id, label, last_seen, created_at)
  values (v_uid, p_kind, p_device_id, v_sid, left(p_label, 80), now(), now())
  on conflict (user_id, kind) do update
    set device_id  = excluded.device_id,
        session_id = excluded.session_id,
        label      = excluded.label,
        last_seen  = now(),
        created_at = case when d.device_id = excluded.device_id then d.created_at else now() end;

  return jsonb_build_object('ok', true, 'kicked', v_kicked);
end;
$$;
revoke execute on function public.claim_device(text, text, text) from anon, public;
grant execute on function public.claim_device(text, text, text) to authenticated;

-- ------------------------------------------------------------
-- Batimento: 'ok' | 'unclaimed' | 'revoked'
-- ------------------------------------------------------------
create or replace function public.check_device()
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_sid uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
begin
  if v_uid is null or v_sid is null then
    return 'revoked';
  end if;
  if not exists (select 1 from auth.sessions where id = v_sid and user_id = v_uid) then
    return 'revoked';
  end if;
  update public.user_devices set last_seen = now()
  where user_id = v_uid and session_id = v_sid;
  if found then
    return 'ok';
  end if;
  return 'unclaimed';
end;
$$;
revoke execute on function public.check_device() from anon, public;
grant execute on function public.check_device() to authenticated;

-- ------------------------------------------------------------
-- Desconectar um dispositivo (ou liberar o próprio ao sair)
-- ------------------------------------------------------------
create or replace function public.revoke_device(p_kind text)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_sid uuid;
begin
  if v_uid is null or not public.session_is_current() then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  delete from public.user_devices
  where user_id = v_uid and kind = p_kind
  returning session_id into v_sid;
  if v_sid is null then
    return false;
  end if;
  delete from auth.sessions where id = v_sid and user_id = v_uid;
  return true;
end;
$$;
revoke execute on function public.revoke_device(text) from anon, public;
grant execute on function public.revoke_device(text) to authenticated;

-- ------------------------------------------------------------
-- Pontuação só de sessão válida
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
  if uid is null or not public.session_is_current() then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_mode not in ('intervals', 'chords') or p_level not in ('beginner', 'intermediate', 'advanced') then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select subscription_tier, subscription_status into v_tier, v_status from public.profiles where id = uid;
  if not (v_tier = 'lifetime' or (v_tier = 'pro' and v_status in ('active', 'trialing', 'past_due'))) then
    raise exception 'pro_required' using errcode = '42501';
  end if;

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
