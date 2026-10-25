# MusicOS — Spec de Produto

> **Versão:** 1.2 (Atualizado com Sistema Educacional)  
> **Data:** 23 de outubro de 2026  
> **Autor:** Philippe Bretas  
> **Doc Relacionado:** FINANCIAL.md, ARCHITECTURE.md, EDUCATIONAL.md

---

## 1. Visão Geral do Produto

### 1.1 O Que é o MusicOS

MusicOS é uma plataforma educacional de música que combina ferramentas de teoria musical, prática instrumental e tecnologia interativa em uma experiência unificada. O produto evolui do projeto open-source musicpages, agregando identidade própria, arquitetura profissional e modelo de monetização sustentável.

### 1.2 Problema que Resolve

Músicos iniciantes e intermediários enfrentam fragmentação extrema:
- Apps separados para afinação, metrônomo, teoria, aprendizagem
- Conteúdo teórico disperso em vídeos, partituras, artigos
- Falta de integração entre teoria e prática no instrumento
- Apps caros (R$30-90/mês) inacessíveis para muitos
- **Falta de educação contextual** — teoria explicada de forma isolada

### 1.3 Proposta de Valor

> **"O sistema operacional da sua jornada musical — teoria e prática integradas, com educação contextual e exercícios guiados, acessível em qualquer lugar, por R$9,90/mês."**

| Aspecto | Apps Tradicionais | MusicOS |
|---------|-------------------|---------|
| **Preço** | R$30-90/mês | **R$9,90/mês** |
| **Integração** | Apps isolados | **Tudo em um lugar** |
| **Educação** | Teoria isolada | **Educação contextual (botão i)** |
| **Exercícios** | Gamificação paga | **Gerador de exercícios gratuito** |
| **Acessibilidade** | App nativo | **Web (PWA)** |

---

## 2. Sistema Educacional — O Diferencial Principal

### 2.1 Pilares Educacionais

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PILARES EDUCACIONAIS DO MUSICOS                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. EDUCAÇÃO CONTEXTUAL                                           │
│      └── Explicações aparecem quando relevantes                    │
│          └── Botão "i" em cada seção                               │
│          └── Popups com exemplos práticos                          │
│                                                                     │
│   2. EXERCÍCIOS PROGRESSIVOS                                        │
│      └── Do fácil ao difícil                                       │
│          └── Exercícios guiados com metrônomo                      │
│          └── Feedback em tempo real                                │
│                                                                     │
│   3. TÉCNICAS INSTRUMENTAIS                                         │
│      └── Tapping, hammer-on, pull-offs, bends, etc.                │
│          └── Demonstrações visuais                                 │
│          └── Exercícios específicos por técnica                    │
│                                                                     │
│   4. GERAÇÃO INTELIGENTE DE EXERCÍCIOS                             │
│      └── Exercícios baseados no contexto do usuário                │
│          └── Sequências de acordes na tonalidade ativa             │
│          └── Licks no estilo do usuário                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 O Botão "i" de Ajuda Contextual

Cada seção educacional terá um ícone de informação que exibe explicações:

| Seção | Conteúdo do Info Button |
|-------|------------------------|
| **Ciclo de Quintas** | O que é, como usar no estudo, exemplos práticos |
| **Campo Harmônico** | Os 7 graus e suas funções |
| **Escalas** | Padrão T-T-S-T-T-T-S, como memorizar |
| **Acordes** | Formação de acordes, inversões |
| **Técnicas** | Como executar, dicas de prática |
| **Metrônomo** | Importância do ritmo, como usar |

---

## 3. Análise de Viabilidade: Zero Custo Inicial

### 3.1 Stack de Custo Zero (MVP)

| Serviço | Provider | Plano | Custo |
|---------|----------|-------|-------|
| **Frontend** | Vercel | Free | R$0 |
| **Database + Auth** | Supabase | Free | R$0 |
| **Email** | Resend | Free | R$0 |
| **Analytics** | PostHog | Free | R$0 |
| **Monitoring** | Sentry | Free | R$0 |
| **CI/CD** | GitHub Actions | Free | R$0 |
| **Domínio** | Namecheap | .app | R$4/mês |

**Custo Mensal do MVP:** R$4 (só o domínio)

---

## 4. Modelo de Monetização

### 4.1 Precificação Aprovada

| Tier | Preço | Período | O Que Inclui |
|------|-------|---------|--------------|
| **Free** | R$0 | Forever | 5 tonalidades, escalas básicas, fretboard, exercícios básicos |
| **Pro** | **R$9,90** | Mês | Todas as ferramentas, multi-instrumento, exercícios ilimitados, técnicas |
| **Lifetime** | **R$197** | Único | Pro forever, sem mensalidade |

### 4.2 Features por Tier

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE FEATURES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FREE ($0)                        │  PRO ($9,90/mês)                │
│  ────────────────────────────────┼─────────────────────────────     │
│  • 5 tonalidades (C,G,F,A,E)     │  • Todas as 12 tonalidades       │
│  • Escalas Maior/Menor           │  • Todos os modos gregos         │
│  • Guitarra 6 cordas             │  • Todos os instrumentos         │
│  • Acordes essenciais            │  • Campo harmônico completo      │
│  • Metrônomo básico              │  • Extensões (7, 9, 11, 13)     │
│  • Fretboard interativo          │  • Audio player c/ velocidade    │
│  • 🔵 Info buttons básicos       │  • 🔷 Info buttons completos     │
│  • 🔵 Exercícios básicos (5)     │  • 🔷 Exercícios ilimitados      │
│  • 🔵 Técnicas básicas           │  • 🔷 Técnicas avançadas         │
│  • Login/Sync                    │  • Progress sync multi-device   │
│                                                                     │
│  LIFETIME ($197)                                                  │
│  ──────────────────────────────────────────────────────────────     │
│  • Todas as features Pro forever                                      │
│  • Sem mensalidades                                                   │
│  • Badge "Early Adopter"                                             │
│  • Prioridade no roadmap                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Por Que R$9,90 é o Preço Certo

- **89% mais barato** que Yousician (R$89,90)
- **67% mais barato** que Fender Songs (R$29,90)
- Inclui **exercícios e educação** que concorrentes vendem separadamente
- Margem de R$7,81 por usuário (79%)

---

## 5. Sistema de Exercícios

### 5.1 Tipos de Exercícios

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Sequências de Acordes** | Progressões para prática de mudanças | I-IV-V-I em C |
| **Escalas** | Padrões de escala para velocidade | C Major posição 1 |
| **Licks e Frases** | Frases musicais style-based | Blues lick em G |
| **Técnicas** | Exercícios específicos | Tapping, hammer-on, bends |
| **Guiados com Metrônomo** | Exercícios ritmados | Escala ascendente 60 BPM |

### 5.2 Gerador Inteligente de Exercícios

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GERADOR DE EXERCÍCIOS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Configurações:                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Tipo: [Sequência de Acordes ▼]                             │   │
│  │  Tonalidade: [C Maior ▼]                                    │   │
│  │  Dificuldade: [Iniciante ▼]                                 │   │
│  │  Duração: [5 minutos ▼]                                     │   │
│  │  [🎲 GERAR EXERCÍCIO ALEATÓRIO]                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Exercícios por Técnica

| Técnica | Níveis | Exercícios |
|---------|--------|------------|
| **Tapping** | Iniciante → Avançado | 8 exercícios progressivos |
| **Hammer-on/Pull-off** | Iniciante → Intermediário | 6 exercícios |
| **Bends** | Iniciante → Avançado | 5 exercícios |
| **Two-Hands** | Intermediário → Avançado | 4 exercícios |
| **Slides** | Iniciante → Intermediário | 4 exercícios |

---

## 6. Arquitetura Técnica

### 6.1 Stack Tecnológica (Custo Zero)

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Client)                       │
├─────────────────────────────────────────────────────────────┤
│  Framework:    Next.js 15 (App Router)                      │
│  UI Library:   shadcn/ui + Tailwind CSS                     │
│  State:        Zustand + TanStack Query                     │
│  Audio:        Web Audio API + Tone.js                      │
│  Education:    InfoButton + ExercisePlayer components       │
│  PWA:          next-pwa + Service Workers                   │
│  Hosting:      Vercel Free (100GB bandwidth/mês)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Supabase Free)                   │
├─────────────────────────────────────────────────────────────┤
│  Platform:     Supabase Free Tier                           │
│  Auth:         Supabase Auth (50.000 MAU)                   │
│  Database:     PostgreSQL (500MB)                           │
│  Storage:      1GB (textos, configs)                       │
│  RLS:          Row Level Security incluso                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Stripe Webhooks → processamento direto                     │
│  Resend API → emails transacionais                          │
│  PostHog → analytics                                        │
│  Exercício Generator → Engine de exercícios                 │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Componentes Educacionais Novos

```typescript
// Novos componentes para educação
components/
├── ui/
│   └── InfoButton.tsx        // Botão de ajuda contextual
├── exercises/
│   ├── ExerciseGenerator.tsx // Gerador de exercícios
│   ├── ExercisePlayer.tsx    // Player guiado com metrônomo
│   ├── ChordProgression.tsx  // Exercícios de progressões
│   ├── ScaleExercise.tsx     // Exercícios de escalas
│   └── TechniqueExercise.tsx // Exercícios de técnicas
└── educational/
    ├── ContentDatabase.ts    // Banco de textos educacionais
    └── TipsCarousel.tsx      // Carrossel de dicas
```

---

## 7. Escopo de Desenvolvimento (Fases)

### Fase 1: MVP — Custo Zero (Meses 1-3)

**Objetivo:** Lançar com custo R$4/mês + sistema educacional básico

#### Entregáveis:
1. [ ] Arquitetura Next.js + Supabase Free configurada
2. [ ] Auth (email + Google)
3. [ ] Database schema + RLS
4. [ ] Landing page com pricing (R$9,90/R$197)
5. [ ] Checkout Stripe integrado (sem N8N)
6. [ ] Módulo Escalas completo (Free tier)
7. [ ] Módulo Fretboard (guitarra 6 cordas)
8. [ ] Módulo Acordes (diagramas básicos)
9. [ ] **InfoButton component** (versão básica)
10. [ ] **5 exercícios básicos de escalas**
11. [ ] LocalStorage manager (50MB limit)
12. [ ] PWA manifest + offline basics
13. [ ] Deploy em Vercel Free

### Fase 2: Pro Launch (Meses 4-5)

**Objetivo:** Ativar monetização R$9,90/mês + expandir educacional

#### Entregáveis:
1. [ ] Stripe webhooks + sync de assinaturas
2. [ ] Portal do usuário (dashboard)
3. [ ] Todas as 12 tonalidades
4. [ ] Todos os modos e escalas
5. [ ] Multi-instrumento
6. [ ] Campo harmônico completo
7. [ ] Sistema de favoritos (cloud)
8. [ ] Audio player com velocidade
9. [ ] **InfoButton com conteúdo completo** (todas as seções)
10. [ ] **Exercícios de progressões de acordes** (10 progressões)
11. [ ] **Gerador de exercícios básico** (aleatório)

### Fase 3: Expansão — Educacional (Meses 6-9)

**Objetivo:** Diferenciais competitivos + sistema educacional completo

#### Entregáveis:
1. [ ] **Sistema de Técnicas Instrumentais:**
   - Tapping (8 exercícios)
   - Hammer-on/Pull-off (6 exercícios)
   - Bends (5 exercícios)
   - Two-Hands (4 exercícios)
2. [ ] **Exercícios Guiados com Metrônomo:**
   - Player com controle de BPM
   - Realce visual da nota atual
   - Feedback de progresso
3. [ ] **Gerador de Licks e Frases:**
   - Blues, Jazz, Rock, Country
   - Baseado na tonalidade ativa
4. [ ] **Sistema de Gamificação:**
   - Conquistas
   - Streaks diários
   - Progress tracking
5. [ ] AI Assistant (avaliação: Ollama vs OpenAI)
6. [ ] Ear training gamificado

### Fase 4: Escala (Meses 10-12)

**Objetivo:** Otimizar conversão e retenção

#### Entregáveis:
1. [ ] A/B testing de pricing
2. [ ] Experimentos de onboarding
3. [ ] Analytics dashboard
4. [ ] Performance optimization
5. [ ] Accessibility WCAG 2.1 AA
6. [ ] Upgrade para Supabase Pro (se necessário)

---

## 8. Métricas de Sucesso (12 meses)

| Métrica | Meta Conservadora | Meta Otimista |
|---------|-------------------|---------------|
| Usuários cadastrados | 30.000 | 100.000 |
| Usuários ativos mensais | 10.000 | 50.000 |
| Usuários Pro | 500 | 2.000 |
| **Exercícios completados/dia** | 1.000 | 5.000 |
| **Tempo médio na seção educacional** | 5 min | 15 min |
| MRR | R$4.950 | R$19.800 |
| Conversão Free→Pro | 5% | 10% |
| Churn mensal | <10% | <5% |

---

## 9. Diferenciais Competitivos

### 9.1 O Que Nenhum Concorrente Tem

| Concorrente | Teoria | Exercícios | Técnicas | Educação Contextual |
|-------------|--------|------------|----------|---------------------|
| Ultimate Guitar | ✗ | ✗ | ✗ | ✗ |
| Yousician | ✗ | ✓ | ✓ | ✗ |
| Songsterr | ✗ | ✗ | ✗ | ✗ |
| Fender Songs | ✗ | ✓ | ✗ | ✗ |
| MusicOS | ✓ | ✓ | ✓ | ✓ |

### 9.2 Messaging Central

> **"Aprenda música de verdade — teoria explicada na hora que você precisa, exercícios guiados pelo metrônomo, e técnicas instrumentais com passo a passo. Por 89% menos que apps similares."**

---

## 10. Checklist de Lançamento Educacional

### Fase 1
- [ ] InfoButton component básico
- [ ] 5 textos educacionais (ciclos, escalas, etc)
- [ ] 5 exercícios de escalas básicos

### Fase 2
- [ ] InfoButton completo (todas as seções)
- [ ] 10+ textos educacionais
- [ ] 10 progressões de acordes
- [ ] Gerador de exercícios básico

### Fase 3
- [ ] Técnicas instrumentais (todas)
- [ ] Player guiado com metrônomo
- [ ] Licks e frases por estilo
- [ ] Sistema de gamificação
- [ ] Ear training

---

## 11. Próximos Passos Imediatos

1. **Revisar documento EDUCATIONAL.md** para详细内容
2. **Aprovar estrutura de InfoButtons**
3. **Priorizar exercícios para MVP**
4. **Criar conta Supabase** (Free Tier)
5. **Iniciar Fase 1** — setup do projeto

---

*Documento atualizado em 23 de outubro de 2026*  
*Versão 1.2 — Com Sistema Educacional Completo*