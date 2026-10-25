# MusicOS — Arquitetura de Autenticação e Controle de Acesso

> **Versão:** 1.1 (Atualizada para custo zero)  
> **Data:** 23 de outubro de 2026  
> **Status:** Aprovado  
> **Doc Relacionado:** FINANCIAL.md, MUSICOS-SPEC.md

---

## 1. Visão Geral da Arquitetura

### 1.1 Stack de Custo Zero (MVP)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 15)                        │
├─────────────────────────────────────────────────────────────────────┤
│  Vercel Free: Hosting, SSL, CI/CD                                   │
│  shadcn/ui + Tailwind CSS                                           │
│  Zustand (state) + TanStack Query (data)                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase Free Tier)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Database:            PostgreSQL 500MB                              │
│  Auth:                50.000 usuários ativos                        │
│  Storage:             1GB (textos, configs)                         │
│  Row Level Security:  ✅ Incluso                                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Stripe Webhooks (via API Routes)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES (代替 N8N)                      │
├─────────────────────────────────────────────────────────────────────┤
│  • Stripe webhooks → processados diretamente                        │
│  • Emails → Resend API                                              │
│  • Analytics → PostHog                                              │
│  • Sem custo adicional                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 O Que Foi Simplificado

| Recurso | Anterior (Caro) | Atual (Custo Zero) |
|---------|-----------------|-------------------|
| **Automação** | N8N Cloud ($20/mês) | Next.js API Routes |
| **Payments** | Stripe completo | Stripe Checkout + Webhooks |
| **AI** | OpenAI API | Adiado para fase posterior |
| **Storage** | Cloud (S3) | LocalStorage (browser) |
| **Database** | Supabase Pro | Supabase Free |

---

## 2. Sistema de Controle de Acesso (RBAC)

### 2.1 Hierarquia de Permissões

```typescript
type SubscriptionTier = 'free' | 'pro' | 'lifetime';

type Permission = 
  | 'scales:read'
  | 'scales:all_tonics'       // free: 5, pro: 12
  | 'scales:all_types'        // free: 2, pro: 30+
  | 'chords:read'
  | 'chords:full_field'
  | 'instruments:all'         // free: guitarra, pro: todos
  | 'tuning:custom'
  | 'audio:player'
  | 'audio:speed_control'
  | 'audio:loop'
  | 'ai:assistant'            // ADIADO
  | 'ear_training:access'     // ADIADO
  | 'backing_tracks:generate' // ADIADO
  | 'progress:sync';

const TIER_PERMISSIONS: Record<SubscriptionTier, Permission[]> = {
  free: [
    'scales:read',
    'scales:all_tonics',        // C, G, F, A, E apenas
    'scales:all_types',         // Maior e Menor apenas
    'chords:read',
    'instruments:guitarra_6',   // Apenas guitarra padrão
    'audio:player',             // Player básico
    'tuning:custom',            // Afinação basic
    'progress:sync',
  ],
  pro: [
    'scales:read',
    'scales:all_tonics',        // Todas as 12
    'scales:all_types',         // Todas as escalas
    'chords:read',
    'chords:full_field',
    'instruments:all',
    'tuning:custom',
    'audio:player',
    'audio:speed_control',
    'audio:loop',
    // AI e outras features ficam para fase posterior
  ],
  lifetime: [
    ...TIER_PERMISSIONS.pro,
  ],
};
```

### 2.2 Middleware de Verificação

```typescript
// lib/auth/permissions.ts
import { createClient } from '@/lib/supabase/server';
import type { Permission, SubscriptionTier } from '@/types/auth';

const FREE_TONICS = ['C', 'G', 'F', 'A', 'E'];
const FREE_SCALES = ['maior', 'menor'];

export async function getUserTier(): Promise<SubscriptionTier> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 'free';
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();
    
  return (profile?.subscription_tier as SubscriptionTier) || 'free';
}

export async function canAccessScale(tonic: string): Promise<boolean> {
  const tier = await getUserTier();
  if (tier === 'free') {
    return FREE_TONICS.includes(tonic);
  }
  return true; // Pro/Lifetime tem acesso total
}
```

---

## 3. Fluxo Completo de Autenticação

### 3.1 Signup Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO ACESSA APP                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       TELA DE SIGNUP                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [ ] Email    [ ] Google                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE AUTH                                    │
│  1. Cria usuário em auth.users                                       │
│  2. Trigger no Supabase dispara webhook (Edge Function)              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTION                            │
│  1. Cria registro em public.profiles                                 │
│  2. Define tier='free'                                               │
│  3. Envia email via Resend                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      USUÁRIO REDIRECIONADO                           │
│              → Dashboard com features Free                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Checkout e Upgrade Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USUÁRIO CLICA "ASSINAR PRO"                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         STRIPE CHECKOUT                              │
│  Redirect para: https://checkout.stripe.com/...                     │
│  User insere dados de pagamento                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     STRIPE ENVIA WEBHOOK                             │
│  POST https://music-os.com/api/webhooks/stripe                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTE                                 │
│  POST /api/webhooks/stripe                                           │
│  ├── Verifica assinatura do webhook                                 │
│  ├── Extrai customer_id e price_id                                  │
│  ├── Atualiza Supabase: subscription_tier = 'pro'                   │
│  ├── Cria registro em user_subscriptions                            │
│  ├── Envia email via Resend API                                     │
│  └── Retorna 200 OK                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (Supabase Free Tier)

### 4.1 Tabela: profiles

```sql
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  
  -- Subscription
  subscription_tier text default 'free' 
    check (subscription_tier in ('free', 'pro', 'lifetime')),
  subscription_status text default 'active'
    check (subscription_status in ('active', 'past_due', 'canceled', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  
  -- Preferences (armazenado no banco)
  preferences jsonb default '{
    "default_instrument": "guitarra-6",
    "theme": "dark",
    "notifications": true
  }'::jsonb,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_login_at timestamptz
);

-- Index para performance
create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
```

### 4.2 Tabela: user_subscriptions

```sql
create table public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  -- Stripe data
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  stripe_price_id text not null,
  
  -- Status
  status text not null 
    check (status in ('active', 'past_due', 'canceled', 'unpaid', 'paused')),
  
  -- Billing cycle
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 4.3 Tabela: user_progress

```sql
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  module_type text not null 
    check (module_type in ('scale', 'chord', 'instrument', 'practice')),
  module_id text not null,
  
  progress_percent integer default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  time_spent_seconds integer default 0,
  
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(user_id, module_type, module_id)
);
```

### 4.4 Tabela: user_favorites

```sql
create table public.user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  item_type text not null 
    check (item_type in ('scale', 'chord', 'instrument', 'tuning', 'practice')),
  item_data jsonb not null,
  
  created_at timestamptz default now(),
  
  unique(user_id, item_type, item_data)
);
```

---

## 5. RLS Policies (Row Level Security)

```sql
-- Usuário só pode ver e editar seu próprio profile
alter table public.profiles enable row level security;

create policy "users_can_manage_own_profile"
on public.profiles
for all
using (auth.uid() = id);

-- Usuário só vê eigene progress
create policy "users_see_own_progress"
on public.user_progress
for select
using (auth.uid() = user_id);

create policy "users_manage_own_progress"
on public.user_progress
for all
using (auth.uid() = user_id);

-- Usuário gerencia own favorites
create policy "users_manage_own_favorites"
on public.user_favorites
for all
using (auth.uid() = user_id);

-- Subscriptions: só vê propia
create policy "users_see_own_subscriptions"
on public.user_subscriptions
for all
using (auth.uid() = user_id);
```

---

## 6. LocalStorage Strategy (Sem Cloud Storage)

### 6.1 O Que Armazenar no LocalStorage

```typescript
// lib/local-storage.ts

const STORAGE_KEYS = {
  USER_PREFERENCES: 'music_os_preferences',
  LAST_AUDIO_FILE: 'music_os_last_audio',
  PROGRESS_CACHE: 'music_os_progress_cache',
  FAVORITES_CACHE: 'music_os_favorites_cache',
};

// Limite: 50MB total para LocalStorage
const MAX_STORAGE_SIZE = 50 * 1024 * 1024;

export function saveUserPreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
}

export function saveLastAudioFile(fileData: string): void {
  // Converter áudio para base64 e salvar
  // Apenas 1 arquivo por vez
  localStorage.setItem(STORAGE_KEYS.LAST_AUDIO_FILE, fileData);
}

export function getStorageUsage(): { used: number; total: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += (localStorage.getItem(key) || '').length * 2; // UTF-16
    }
  }
  return { used, total: MAX_STORAGE_SIZE };
}
```

---

## 7. Stripe Integration (API Routes)

### 7.1 Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  // Processar evento
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      
      // Buscar usuário pelo email
      const { data: { user } } = await supabase.auth.admin.listUsers();
      const targetUser = user?.find(u => u.email === email);

      if (targetUser) {
        // Atualizar para Pro
        await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'pro',
            stripe_customer_id: session.customer as string
          })
          .eq('id', targetUser.id);

        // Enviar email de boas-vindas via Resend
        await sendWelcomeEmail(email!);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('stripe_customer_id', subscription.customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### 7.2 Checkout Session Creator

```typescript
// lib/stripe/checkout.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(email: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      user_email: email,
    },
  });

  return session.url;
}
```

---

## 8. Checklist de Implementação

### Auth e Database

- [ ] Configurar Supabase project (Free Tier)
- [ ] Criar schema PostgreSQL (profiles, subscriptions, progress, favorites)
- [ ] Configurar RLS policies
- [ ] Implementar Supabase Auth (email, Google)
- [ ] Criar Types TypeScript para as tabelas
- [ ] Implementar auth middleware no Next.js
- [ ] Criar hook useAuth()
- [ ] Criar hook usePermission()

### LocalStorage

- [ ] Implementar Storage Manager
- [ ] Limitar a 50MB
- [ ] Salvar último arquivo de áudio
- [ ] Salvar preferências do usuário

### Stripe Integration

- [ ] Criar conta Stripe
- [ ] Configurar products e prices (Pro R$9,90, Lifetime R$197)
- [ ] Criar webhook endpoint (/api/webhooks/stripe)
- [ ] Implementar checkout flow no frontend
- [ ] Testar payment success e failure

### Email (Resend)

- [ ] Configurar conta Resend
- [ ] Criar template: Welcome Email
- [ ] Criar template: Upgrade Confirmation
- [ ] Integrar no webhook handler

### Analytics

- [ ] Configurar PostHog
- [ ] Criar eventos: user.signup, user.upgrade, feature.used
- [ ] Criar funis de conversão

---

## 9. Próximos Passos

1. **Revisar esta arquitetura** ✅
2. **Aprovar uso de Supabase Free Tier** ✅
3. **Criar conta Supabase** (próximo passo)
4. **Criar conta Stripe** (próximo passo)
5. **Iniciar Fase 1** — setup do projeto

---

*Documento atualizado em 23 de outubro de 2026*  
*Versão 1.1 — Simplified for Zero Cost MVP*