-- ============================================================
-- MusicOS - Migration Completa
-- Execute no Supabase: SQL Editor → New Query → Run All
-- ============================================================

-- ============================================================
-- TABELA: subscriptions
-- ============================================================
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  tier         text not null default 'free' check (tier in ('free','pro','premium')),
  status       text not null default 'active' check (status in ('active','canceled','past_due')),
  started_at   timestamptz not null default now(),
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "Users see own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================
-- TABELA: instruments
-- ============================================================
create table if not exists public.instruments (
  id          text primary key,
  name        text not null,
  type        text not null check (type in ('keyboard','stringed','wind','percussion')),
  category    text not null check (category in ('acoustic','electric','digital')),
  strings     int,
  frets       int,
  octaves     int,
  tuning      jsonb,
  description text,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.instruments enable row level security;
create policy "Instruments are public" on public.instruments
  for select using (true);

-- Dados iniciais dos instrumentos
insert into public.instruments (id, name, type, category, strings, frets, is_premium) values
  ('piano-88',        'Piano 88 Teclas',       'keyboard', 'acoustic',  null, null, false),
  ('piano-61',        'Piano 61 Teclas',        'keyboard', 'digital',   null, null, false),
  ('guitar-standard', 'Guitarra 6 Cordas',      'stringed', 'electric',  6,    24,   false),
  ('guitar-acoustic', 'Violão',                 'stringed', 'acoustic',  6,    20,   false),
  ('ukulele-soprano', 'Ukulele Soprano',        'stringed', 'acoustic',  4,    15,   false),
  ('bass-4',          'Contrabaixo 4 Cordas',   'stringed', 'electric',  4,    24,   true),
  ('ukulele-tenor',   'Ukulele Tenor',          'stringed', 'acoustic',  4,    17,   true),
  ('synthesizer',     'Sintetizador Digital',   'keyboard', 'digital',   null, null, true)
on conflict (id) do nothing;

-- ============================================================
-- TABELA: lessons
-- ============================================================
create table if not exists public.lessons (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  difficulty       text not null check (difficulty in ('beginner','intermediate','advanced')),
  duration_minutes int not null default 15,
  content          jsonb not null default '{}',
  tags             text[] not null default '{}',
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.lessons enable row level security;
create policy "Published lessons are public" on public.lessons
  for select using (is_published = true);

-- ============================================================
-- TABELA: lesson_progress
-- ============================================================
create table if not exists public.lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  lesson_id       uuid references public.lessons(id) on delete cascade not null,
  completed       boolean not null default false,
  score           numeric(5,2) not null default 0,
  attempts        int not null default 0,
  last_attempt_at timestamptz not null default now(),
  completed_at    timestamptz,
  data            jsonb not null default '{}',
  unique (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
create policy "Users see own progress" on public.lesson_progress
  for all using (auth.uid() = user_id);

-- ============================================================
-- TABELA: practice_sessions
-- ============================================================
create table if not exists public.practice_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  session_type     text not null check (session_type in ('chord_practice','scale_practice','song_practice','ear_training')),
  duration_minutes int not null default 0,
  date             date not null default current_date,
  data             jsonb not null default '{}',
  created_at       timestamptz not null default now()
);
alter table public.practice_sessions enable row level security;
create policy "Users see own sessions" on public.practice_sessions
  for all using (auth.uid() = user_id);

-- ============================================================
-- GARANTIR que saved_chords tem a estrutura certa
-- ============================================================
create table if not exists public.saved_chords (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  root_note     text not null,
  chord_type    text not null,
  extensions    text[],
  instrument_id text not null default 'guitar-standard',
  difficulty    text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  tags          text[] not null default '{}',
  is_favorite   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.saved_chords enable row level security;
create policy "Users see own chords" on public.saved_chords
  for all using (auth.uid() = user_id);

-- ============================================================
-- GARANTIR que profiles tem a estrutura certa
-- ============================================================
alter table public.profiles
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free','pro','premium')),
  add column if not exists role text not null default 'student'
    check (role in ('student','teacher','admin','guest')),
  add column if not exists preferences jsonb not null default '{
    "theme": "dark",
    "instrument": "guitar-standard",
    "default_key": "C",
    "difficulty": "beginner",
    "notation": "english"
  }';

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_subscriptions_updated
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create or replace trigger trg_saved_chords_updated
  before update on public.saved_chords
  for each row execute function public.set_updated_at();

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
