-- ============================================================
-- MusicOS — Migração v2: contas, planos e cobrança
-- Execute no Supabase: SQL Editor → New Query → Run
-- Idempotente: pode rodar mais de uma vez.
--
-- Fonte de verdade do acesso: public.profiles
--   subscription_tier   free | pro | lifetime
--   subscription_status none | active | trialing | past_due | canceled | incomplete | unpaid
-- Quem grava tier/status é o webhook do Stripe (service role). O usuário só lê.
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  name                   text,
  avatar_url             text,
  stripe_customer_id     text unique,
  stripe_subscription_id text,
  plan_id                text,
  subscription_tier      text not null default 'free',
  subscription_status    text not null default 'none',
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  role                   text not null default 'student',
  preferences            jsonb not null default '{}'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Colunas novas em bancos que já tinham a tabela
alter table public.profiles
  add column if not exists email                  text,
  add column if not exists name                   text,
  add column if not exists avatar_url             text,
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_id                text,
  add column if not exists subscription_tier      text not null default 'free',
  add column if not exists subscription_status    text not null default 'none',
  add column if not exists current_period_end     timestamptz,
  add column if not exists cancel_at_period_end   boolean not null default false,
  add column if not exists role                   text not null default 'student',
  add column if not exists preferences            jsonb not null default '{}'::jsonb,
  add column if not exists created_at             timestamptz not null default now(),
  add column if not exists updated_at             timestamptz not null default now();

-- Troca os CHECKs antigos (free/pro/premium) pelos valores usados pelo app
alter table public.profiles drop constraint if exists profiles_subscription_tier_check;
alter table public.profiles drop constraint if exists profiles_subscription_status_check;
alter table public.profiles drop constraint if exists profiles_plan_id_check;
update public.profiles set subscription_tier = 'pro' where subscription_tier = 'premium';
alter table public.profiles
  add constraint profiles_subscription_tier_check
    check (subscription_tier in ('free','pro','lifetime')),
  add constraint profiles_subscription_status_check
    check (subscription_status in ('none','active','trialing','past_due','canceled','incomplete','unpaid')),
  add constraint profiles_plan_id_check
    check (plan_id is null or plan_id in ('pro_monthly','pro_yearly','lifetime'));

create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id) where stripe_customer_id is not null;

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- O usuário pode editar nome/avatar/preferências, mas NUNCA o plano.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.protect_billing_columns()
returns trigger language plpgsql security definer as $$
begin
  -- service_role (webhook) pode tudo; usuário comum não altera campos de cobrança
  if coalesce(auth.role(), current_user::text) not in ('service_role', 'postgres', 'supabase_admin') then
    new.subscription_tier      := old.subscription_tier;
    new.subscription_status    := old.subscription_status;
    new.plan_id                := old.plan_id;
    new.stripe_customer_id     := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.current_period_end     := old.current_period_end;
    new.cancel_at_period_end   := old.cancel_at_period_end;
    new.role                   := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing
  before update on public.profiles
  for each row execute function public.protect_billing_columns();

-- ------------------------------------------------------------
-- Perfil criado automaticamente no cadastro (e-mail, Google...)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cria perfis para usuários que já existiam antes desta migração
insert into public.profiles (id, email, name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- ------------------------------------------------------------
-- stripe_events — idempotência do webhook
-- ------------------------------------------------------------
create table if not exists public.stripe_events (
  id         text primary key,
  type       text not null,
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
-- Sem policies: só o service role (webhook) acessa.

-- ------------------------------------------------------------
-- Realtime: o app recebe a atualização do plano assim que o webhook grava
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

-- ------------------------------------------------------------
-- Tabela antiga `subscriptions` (migração v1): não é mais usada pelo app.
-- Mantida por segurança; pode ser removida depois de conferir os dados:
--   drop table if exists public.subscriptions;
-- ------------------------------------------------------------
