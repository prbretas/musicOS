# MusicOS — Documento Técnico

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Aprovado  
> **Doc Relacionado:** requirements.md, ARCHITECTURE.md

---

## 1. Arquitetura Geral

### 1.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Client)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │   Next.js 14    │  │    Zustand      │  │  TanStack Query │            │
│   │   App Router    │  │   (State)       │  │    (Data)       │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │  Tailwind CSS   │  │  shadcn/ui      │  │    Lucide       │            │
│   │   (Styles)      │  │   (Components)  │  │    (Icons)      │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │  Web Audio API  │  │  Service Worker │  │   LocalStorage  │            │
│   │   (Audio)       │  │    (PWA)        │  │   (Offline)     │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (REST + Webhooks)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Supabase Free Tier)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │    PostgreSQL   │  │   Supabase      │  │    Resend       │            │
│   │   (Database)    │  │    Auth         │  │    (Email)      │            │
│   │   500MB         │  │   50K users     │  │   3K emails/mês │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │      RLS        │  │    Storage      │  │    Edge         │            │
│   │  (Security)     │  │   (1GB)         │  │   Functions     │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Stripe Webhooks
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES (代替 N8N)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │  /api/stripe/   │  │  /api/webhooks/ │  │  /api/email/    │            │
│   │   checkout      │  │   stripe        │  │   send          │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │     Stripe      │  │    PostHog      │  │    Sentry       │            │
│   │  (Payments)     │  │  (Analytics)    │  │  (Monitoring)   │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| **Framework** | Next.js | 14.0 | App Router, Server Components |
| **Linguagem** | TypeScript | 5.3 | Type safety, melhor DX |
| **Styling** | Tailwind CSS | 3.4 | Utility-first, performático |
| **UI Components** | shadcn/ui | Latest | Acessível, customizável |
| **State** | Zustand | 4.4 | Leve, simples, hooks |
| **Data Fetching** | TanStack Query | 5.17 | Cache, sync, mutations |
| **Database** | PostgreSQL | Latest | Supabase Free |
| **Auth** | Supabase Auth | Latest | Já integrado |
| **Payments** | Stripe | Latest | Checkout + Webhooks |
| **Email** | Resend | Latest | Custo zero no tier free |
| **Testing** | Vitest | 1.1 | Rápido, compatible Jest |
| **E2E Testing** | Playwright | 1.40 | Multi-browser |
| **Hosting** | Vercel | Latest | Já integrado Next.js |

---

## 2. Estrutura de Pastas

```
src/app-MusicOS/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Rota de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Rota protegida
│   │   │   ├── escalas/
│   │   │   ├── acordes/
│   │   │   ├── fretboard/
│   │   │   ├── exercicios/
│   │   │   └── settings/
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   ├── stripe/
│   │   │   └── webhooks/
│   │   ├── pricing/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing Page
│   │
│   ├── components/                   # Componentes React
│   │   ├── ui/                       # Componentes base (shadcn)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── InfoButton.tsx
│   │   ├── scales/                   # Componentes de escalas
│   │   │   ├── ScaleDisplay.tsx
│   │   │   ├── ScaleSelector.tsx
│   │   │   └── ScaleHero.tsx
│   │   ├── chords/                   # Componentes de acordes
│   │   │   ├── ChordCard.tsx
│   │   │   ├── ChordDiagram.tsx
│   │   │   └── ChordSelector.tsx
│   │   ├── fretboard/                # Componentes de fretboard
│   │   │   ├── Fretboard.tsx
│   │   │   ├── FretboardNote.tsx
│   │   │   └── InstrumentSelector.tsx
│   │   ├── audio/                    # Componentes de áudio
│   │   │   ├── AudioEngine.ts
│   │   │   ├── AudioPlayer.tsx
│   │   │   └── Metronome.tsx
│   │   ├── educational/              # Componentes educacionais
│   │   │   ├── ContentDatabase.ts
│   │   │   └── TipsCarousel.tsx
│   │   ├── layout/                   # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── shared/                   # Componentes compartilhados
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/                        # Custom Hooks
│   │   ├── useAudio.ts
│   │   ├── useMetronome.ts
│   │   ├── useScale.ts
│   │   ├── useChord.ts
│   │   ├── usePreferences.ts
│   │   └── useAuth.ts
│   │
│   ├── lib/                          # Bibliotecas e utilitários
│   │   ├── supabase/                 # Supabase client
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── stripe/                   # Stripe utilities
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── music/                    # Music theory engine
│   │   │   ├── theory.ts
│   │   │   ├── scales.ts
│   │   │   ├── chords.ts
│   │   │   └── intervals.ts
│   │   ├── audio/                    # Audio engine
│   │   │   ├── engine.ts
│   │   │   ├── synthesizer.ts
│   │   │   └── metronome.ts
│   │   ├── utils/                    # Utility functions
│   │   │   ├── helpers.ts
│   │   │   ├── constants.ts
│   │   │   └── formatters.ts
│   │   └── validators/               # Input validators
│   │       └── validators.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── usePreferencesStore.ts
│   │   ├── useScaleStore.ts
│   │   ├── useChordStore.ts
│   │   ├── useAudioStore.ts
│   │   └── useAuthStore.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── music.ts
│   │   ├── user.ts
│   │   ├── auth.ts
│   │   ├── exercise.ts
│   │   └── database.ts
│   │
│   ├── styles/                       # Estilos globais
│   │   ├── globals.css
│   │   └── tailwind.config.js
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── public/                           # Assets estáticos
│   ├── imgs/
│   ├── icons/
│   └── fonts/
│
├── vitest.config.ts                  # Configuração Vitest
├── playwright.config.ts              # Configuração Playwright
└── next.config.js                    # Configuração Next.js
```

---

## 3. Modelagem de Dados

### 3.1 Schema do Banco (Supabase PostgreSQL)

```sql
-- ============================================
-- TABELAS PÚBLICAS
-- ============================================

-- Profiles de usuários
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' 
    CHECK (subscription_tier IN ('free', 'pro', 'lifetime')),
  subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Preferências (JSON para flexibilidade)
  preferences JSONB DEFAULT '{
    "defaultInstrument": "guitarra-6",
    "theme": "dark",
    "showNoteNames": true,
    "showFretNumbers": true,
    "audioTimbre": "sine"
  }'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Exercícios completados
CREATE TABLE public.user_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  exercise_id TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  
  -- Progresso
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  score INTEGER,
  
  metadata JSONB DEFAULT '{}'::JSONB,
  
  UNIQUE(user_id, exercise_id, completed_at)
);

-- Favoritos
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  item_type TEXT NOT NULL 
    CHECK (item_type IN ('scale', 'chord', 'instrument', 'exercise')),
  item_data JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, item_type, item_data)
);

-- Histórico de prática (para streaks)
CREATE TABLE user_practice_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  date DATE NOT NULL,
  total_time_seconds INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  
  UNIQUE(user_id, date)
);

-- ============================================
-- TABELAS DE SUBSCRIÇÃO (STRIPE)
-- ============================================

CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  
  status TEXT NOT NULL 
    CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'paused')),
  
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_stripe ON public.profiles(stripe_customer_id);
CREATE INDEX idx_user_exercises_user ON public.user_exercises(user_id);
CREATE INDEX idx_user_exercises_date ON public.user_exercises(completed_at);
CREATE INDEX idx_practice_log_user ON user_practice_log(user_id);
CREATE INDEX idx_practice_log_date ON user_practice_log(date);
```

### 3.2 RLS Policies (Row Level Security)

```sql
-- Usuários só veem e editam próprios dados
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_profile"
ON public.profiles FOR ALL
USING (auth.uid() = id);

-- Exercícios: só próprios
CREATE POLICY "users_see_own_exercises"
ON public.user_exercises FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_manage_own_exercises"
ON public.user_exercises FOR ALL
USING (auth.uid() = user_id);

-- Favoritos: só próprios
CREATE POLICY "users_manage_own_favorites"
ON public.user_favorites FOR ALL
USING (auth.uid() = user_id);

-- Subscriptions: só próprias
CREATE POLICY "users_see_own_subscriptions"
ON public.user_subscriptions FOR ALL
USING (auth.uid() = user_id);
```

---

## 4. APIs e Endpoints

### 4.1 API Routes (Next.js)

#### Autenticação
```
GET  /api/auth/session      # Sessão atual
POST /api/auth/login        # Login
POST /api/auth/register     # Registro
POST /api/auth/logout       # Logout
POST /api/auth/recover      # Recover password
POST /api/auth/refresh      # Refresh token
```

#### Stripe
```
POST /api/stripe/checkout           # Criar sessão de checkout
POST /api/stripe/portal             # Customer portal
GET  /api/stripe/subscription       # Status da assinatura
```

#### Webhooks
```
POST /api/webhooks/stripe           # Stripe webhooks
POST /api/webhooks/supabase         # Supabase webhooks
```

#### Dados do Usuário
```
GET  /api/user/profile              # Perfil do usuário
PUT  /api/user/preferences          # Atualizar preferências
GET  /api/user/progress             # Progresso de exercícios
GET  /api/user/favorites            # Favoritos
```

#### Content
```
GET  /api/content/educational       # Conteúdo educacional
GET  /api/content/exercises         # Lista de exercícios
```

### 4.2 Supabase Client (Frontend)

```typescript
// Client-side (browser)
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Server-side
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component
          }
        },
      },
    }
  );
}
```

---

## 5. Audio Engine

### 5.1 Arquitetura do Audio Engine

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUDIO ENGINE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │ AudioContext │─▶│  Oscillator │─▶│  Gain Node (ADSR)  │    │
│  │  (Singleton) │  │  (Synth)    │  │  (Envelope)         │    │
│  └─────────────┘  └─────────────┘  └─────────────────────┘    │
│                                              │                 │
│                                              ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │ MasterGain │◀─│  Compressor │◀─│  Destination        │    │
│  │ (Volume)    │  │  (Limiter)  │  │  (Speakers)         │    │
│  └─────────────┘  └─────────────┘  └─────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Cálculo de Frequências

```typescript
/**
 * Calcula frequência de uma nota
 * @param noteName Nome da nota (C, C#, D, etc.)
 * @param octave Oitava (1-8)
 * @returns Frequência em Hz
 */
export function getFrequency(noteName: NoteName, octave: number): number {
  // Nota A4 = 440Hz (padrão)
  const A4_FREQUENCY = 440;
  
  // Mapeamento de notas para semitons a partir de C4
  const noteOffsets: Record<NoteName, number> = {
    'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6,
    'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1, 'Ab': -1,
    'A': 0, 'A#': 1, 'Bb': 1, 'B': 2
  };
  
  // A4 é a nota 9 em C4-C5, então:
  const semitonesFromA4 = (noteOffsets[noteName]) + ((octave - 4) * 12);
  
  // Fórmula: f = 440 * 2^(n/12)
  return A4_FREQUENCY * Math.pow(2, semitonsFromA4 / 12);
}

/**
 * Mapa de frequências para todas as notas em todas as oitavas
 */
export const FREQUENCY_MAP: Record<NoteName, Record<number, number>> = {
  'C': { 2: 65.41, 3: 130.81, 4: 261.63, 5: 523.25 },
  'C#': { 2: 69.30, 3: 138.59, 4: 277.18, 5: 554.37 },
  'D': { 2: 73.42, 3: 146.83, 4: 293.66, 5: 587.33 },
  // ... todas as notas
};
```

### 5.3 Synthesizer Class

```typescript
class AudioSynthesizer {
  private context: AudioContext;
  private masterGain: GainNode;
  private compressor: DynamicsCompressorNode;
  
  constructor() {
    this.context = new AudioContext();
    
    // Master gain (volume)
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.7;
    
    // Compressor (evita clipping)
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    
    // Conectar: synth -> gain -> compressor -> destination
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.context.destination);
  }
  
  /**
   * Toca uma nota
   */
  playNote(note: NoteName, octave: number, duration: number, adsr?: ADSRParams): void {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    const frequency = getFrequency(note, octave);
    const envelope = adsr || DEFAULT_ADSR;
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Conectar: oscillator -> gain -> master
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // ADSR Envelope
    const now = this.context.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + envelope.attack);
    gainNode.gain.linearRampToValueAtTime(envelope.sustain, now + envelope.attack + envelope.decay);
    gainNode.gain.setValueAtTime(envelope.sustain, now + duration - envelope.release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);
  }
  
  /**
   * Toca um acorde
   */
  playChord(notes: Array<{ note: NoteName; octave: number }>, duration: number): void {
    notes.forEach(({ note, octave }) => {
      this.playNote(note, octave, duration);
    });
  }
  
  /**
   * Configura volume master
   */
  setVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Suspende contexto (para economia de bateria)
   */
  suspend(): void {
    this.context.suspend();
  }
  
  /**
   * Resume contexto
   */
  resume(): void {
    this.context.resume();
  }
}
```

---

## 6. Music Theory Engine

### 6.1 Escalas

```typescript
/**
 * Definição de escalas por intervalos
 */
export const SCALE_PATTERNS: Record<ScaleType, number[]> = {
  maior: [0, 2, 4, 5, 7, 9, 11],              // T-T-S-T-T-T-S
  menor_natural: [0, 2, 3, 5, 7, 8, 10],      // T-S-T-T-S-T-T
  menor_harmonica: [0, 2, 3, 5, 7, 8, 11],    // T-S-T-T-S-m3-S
  menor_melodica: [0, 2, 3, 5, 7, 9, 11],     // T-S-T-T-T-T-S
  jonico: [0, 2, 4, 5, 7, 9, 11],             // Modo 1 (Maior)
  dorico: [0, 2, 3, 5, 7, 9, 10],             // Modo 2
  frigio: [0, 1, 3, 5, 7, 8, 10],             // Modo 3
  lidio: [0, 2, 4, 6, 7, 9, 11],              // Modo 4
  mixolidio: [0, 2, 4, 5, 7, 9, 10],          // Modo 5
  eolio: [0, 2, 3, 5, 7, 8, 10],              // Modo 6 (Menor)
  locrio: [0, 1, 3, 5, 6, 8, 10],             // Modo 7
  pentatonica_maior: [0, 2, 4, 7, 9],         // Sem 4 e 7
  pentatonica_menor: [0, 3, 5, 7, 10],        // Sem 2 e 6
  blues_maior: [0, 2, 3, 4, 7, 9],            // Maior + blues note
  blues_menor: [0, 3, 5, 6, 7, 10],           // Menor + blues note
  diminuta_tom_e_semitom: [0, 1, 3, 4, 6, 7, 9, 10],
  diminuta_semitom_e_tom: [0, 2, 3, 5, 6, 8, 9, 11],
  tons_inteiros: [0, 2, 4, 6, 8, 10],
  cromatica: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

/**
 * Gera notas de uma escala
 */
export function getScaleNotes(root: NoteName, type: ScaleType): NoteName[] {
  const rootIndex = NOTES.indexOf(root);
  const pattern = SCALE_PATTERNS[type];
  
  return pattern.map(interval => NOTES[(rootIndex + interval) % 12]);
}
```

### 6.2 Acordes

```typescript
/**
 * Definição de acordes por intervalos
 */
export const CHORD_PATTERNS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  '9': [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 17, 21],
};

/**
 * Gera notas de um acorde
 */
export function getChordNotes(root: NoteName, type: ChordType): NoteName[] {
  const rootIndex = NOTES.indexOf(root);
  const pattern = CHORD_PATTERNS[type];
  
  return pattern.map(interval => NOTES[(rootIndex + interval) % 12]);
}
```

---

## 7. Configuração de Deploy

### 7.1 Variáveis de Ambiente

```bash
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx

# ============================================
# STRIPE
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ============================================
# RESEND
# ============================================
RESEND_API_KEY=re_xxx

# ============================================
# ANALYTICS
# ============================================
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
POSTHOG_API_KEY=phc_xxx

# ============================================
# MONITORING
# ============================================
SENTRY_DSN=https://xxx@sentry.io/xxx

# ============================================
# APP
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.2 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables available on client
  publicRuntimeConfig: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  // Images
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.sentry.io;",
          },
        ],
      },
    ];
  },
  
  // Webpack config for audio
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

---

*Documento aprovado em 24 de outubro de 2026*  
*Versão 1.0*