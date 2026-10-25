# MusicOS — Roadmap de Desenvolvimento

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Aprovado

---

## 1. Visão Geral do Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROADMAP MUSICOS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MÊS 1-3           │  MÊS 4-5           │  MÊS 6-9          │  MÊS 10-12    │
│  ═══════════════   │  ══════════════    │  ════════════     │  ══════════   │
│                   │                    │                   │               │
│  ┌───────────┐    │  ┌───────────┐     │  ┌───────────┐    │  ┌────────┐   │
│  │   MVP     │    │  │  PRO      │     │  │EXPANSÃO   │    │  │ESCALA  │   │
│  │   🚧      │    │  │  🚧       │     │  │   🚧      │    │  │   🚧   │   │
│  └───────────┘    │  └───────────┘     │  └───────────┘    │  └────────┘   │
│                   │                    │                   │               │
│  • Infraestrutura │  • Pagamentos     │  • Técnicas       │  • A/B Test   │
│  • Auth           │  • 12 Tonalidades │  • Gerador        │  • Analytics  │
│  • Escalas        │  • Multi-inst.    │  • Guiados        │  • Otimização │
│  • Fretboard      │  • Exercises 10+  │  • Gamificação    │  • Community  │
│  • Acordes        │  • InfoButtons 20 │  • Licks AI       │  • Marketing  │
│  • Metrônomo      │  • Full Field     │  • Ear Training   │               │
│  • Educacional 5  │                   │                   │               │
│                   │                   │                   │               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fase 1 — MVP (Meses 1-3)

### 2.1 Semanas 1-2: Infraestrutura

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 1 | Setup Next.js 14 + shadcn/ui | Projeto configurado | ⏳ |
| 1 | Configurar Tailwind + ESLint | Lint passando | ⏳ |
| 1 | Setup Supabase Free Tier | DB conectado | ⏳ |
| 1 | Configurar CI/CD | GitHub Actions | ⏳ |
| 2 | Criar database schema | 4 tabelas | ⏳ |
| 2 | Configurar RLS policies | Segurança | ⏳ |
| 2 | Implementar Auth (email) | Login funcionando | ⏳ |
| 2 | Implementar Auth (Google) | OAuth funcionando | ⏳ |

### 2.2 Semanas 3-4: Core Music Theory

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 3 | Music Theory Engine | getScaleNotes, getChordNotes | ⏳ |
| 3 | Instrument Registry | Guitar + Ukulele | ⏳ |
| 3 | Audio Engine (notes) | Síntese básica | ⏳ |
| 3 | Audio Engine (chords) | Síntese polifônica | ⏳ |
| 4 | Fretboard Component | SVG render | ⏳ |
| 4 | ChordDiagram Component | Diagramas | ⏳ |
| 4 | Scale Display | Notas da escala | ⏳ |
| 4 | Metronome Component | Click rítmico | ⏳ |

### 2.3 Semanas 5-6: Sistema Educacional

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 5 | InfoButton Component | Popup funcional | ⏳ |
| 5 | Content Database | 5 textos | ⏳ |
| 5 | Info: Ciclo Quintas | Conteúdo completo | ⏳ |
| 5 | Info: Campo Harmônico | Conteúdo completo | ⏳ |
| 6 | Info: Escalas | Conteúdo completo | ⏳ |
| 6 | Info: Acordes | Conteúdo completo | ⏳ |
| 6 | Info: Metrônomo | Conteúdo completo | ⏳ |
| 6 | Unit Tests | 80% coverage | ⏳ |

### 2.4 Semanas 7-8: Landing + Integration

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 7 | Landing Page | Page completa | ⏳ |
| 7 | Pricing Section | Free/Pro/Lifetime | ⏳ |
| 7 | Auth Pages | Login/Register | ⏳ |
| 7 | Dashboard Layout | Sidebar + Header | ⏳ |
| 8 | E2E Tests | 5 fluxos críticos | ⏳ |
| 8 | Bug Fixes |Issues do QA | ⏳ |
| 8 | Performance | Core Web Vitals | ⏳ |
| 8 | Deploy Vercel | Produção | ⏳ |

### 2.5 Entregáveis da Fase 1

```
✅ Deploy URL: https://music-os.vercel.app
✅ Autenticação funcionando
✅ 5 tonalidades disponíveis
✅ Escalas Maior/Menor
✅ Fretboard interativo (guitarra)
✅ Diagramas de acordes
✅ Áudio funcionando
✅ Metrônomo básico
✅ 5 InfoButtons educacionais
✅ Tests passando (80% coverage)
```

---

## 3. Fase 2 — Pro Launch (Meses 4-5)

### 3.1 Semanas 9-10: Pagamentos

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 9 | Stripe Checkout | Integração completa | ⏳ |
| 9 | Stripe Webhooks | Processamento | ⏳ |
| 9 | Customer Portal | Gerenciamento | ⏳ |
| 9 | Email Receipts | Resend integration | ⏳ |
| 10 | Subscription Logic | Upgrade/Downgrade | ⏳ |
| 10 | Lifetime Purchase | One-time payment | ⏳ |
| 10 | RLS Updates | Tier-based access | ⏳ |
| 10 | Testing Payments | Test mode | ⏳ |

### 3.2 Semanas 11-12: Expansão de Features

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 11 | 12 Tonalidades | Todas as notas | ⏳ |
| 11 | Todos os Modos | 7 modos gregos | ⏳ |
| 11 | Pentatônica + Blues | Escalas extras | ⏳ |
| 11 | Ukulele Support | 4 cordas | ⏳ |
| 11 | Baixo 4 cordas | Novo instrumento | ⏳ |
| 12 | Violão 6 cordas | Novo instrumento | ⏳ |
| 12 | Custom Tuning | Afinações | ⏳ |
| 12 | Inversions | Inversões de acorde | ⏳ |

### 3.3 Semanas 13-14: Exercícios Expandidos

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 13 | Progressões I-IV-V | 5 progressões | ⏳ |
| 13 | Progressões ii-V-I | 5 progressões | ⏳ |
| 13 | Scale Patterns | 10 posições | ⏳ |
| 13 | Arpeggios | 10 padrões | ⏳ |
| 14 | 15+ InfoButtons | Conteúdo completo | ⏳ |
| 14 | Search/Filter | Busca de exercícios | ⏳ |
| 14 | Difficulty Filter | 3 níveis | ⏳ |
| 14 | User Progress | Tracking | ⏳ |

### 3.4 Entregáveis da Fase 2

```
✅ Stripe Payments funcionando
✅ 12 tonalidades disponíveis
✅ 4 instrumentos
✅ 20+ escalas
✅ 20+ exercícios
✅ 15+ InfoButtons
✅ Portal do usuário
✅ Histórico de progresso
```

---

## 4. Fase 3 — Expansão (Meses 6-9)

### 4.1 Semanas 17-20: Técnicas Avançadas

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 17 | Tapping Exercises | 8 exercícios | ⏳ |
| 17 | Hammer-on/Pull-off | 6 exercícios | ⏳ |
| 17 | Bends | 5 exercícios | ⏳ |
| 17 | Slides | 4 exercícios | ⏳ |
| 18 | Two-Hand Tapping | 4 exercícios | ⏳ |
| 18 | Economy Picking | 3 exercícios | ⏳ |
| 18 | Sweep Picking | 3 exercícios | ⏳ |
| 18 | Technique Videos | Demonstrações | ⏳ |

### 4.2 Semanas 21-24: Sistema Guiado

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 21 | Guided Player | Componente completo | ⏳ |
| 21 | Metronome Integration | Sincronizado | ⏳ |
| 21 | Visual Feedback | Highlight notas | ⏳ |
| 21 | Progress Tracking | % completado | ⏳ |
| 22 | Exercise Generator | Engine funcional | ⏳ |
| 22 | Random Progressions | Gerador | ⏳ |
| 22 | Random Scales | Gerador | ⏳ |
| 22 | Difficulty Scaling | Auto-adjust | ⏳ |
| 23 | Licks Generator | Blues/Jazz/Rock | ⏳ |
| 23 | Ear Training | Identificação | ⏳ |
| 23 | Interval Recognition | 2nd-8th | ⏳ |
| 23 | Chord Recognition | Triades-7ths | ⏳ |
| 24 | Gamification | Conquistas | ⏳ |
| 24 | Streaks | Diário/semanal | ⏳ |
| 24 | XP System | Pontuação | ⏳ |
| 24 | Badges | Conquistas | ⏳ |

### 4.3 Entregáveis da Fase 3

```
✅ Técnicas: Tapping, Hammer-on, Bends, Slides
✅ Guided Player com metrônomo
✅ Gerador de exercícios aleatórios
✅ Licks por estilo (Blues, Jazz, Rock)
✅ Ear Training (intervalos, acordes)
✅ Sistema de gamificação
✅ Conquistas e streaks
```

---

## 5. Fase 4 — Escala (Meses 10-12)

### 5.1 Otimização e Analytics

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 25 | A/B Testing | Framework | ⏳ |
| 25 | Pricing Tests | Otimização | ⏳ |
| 25 | Onboarding Tests | Conversão | ⏳ |
| 25 | Analytics Dashboard | Métricas | ⏳ |
| 26 | Performance | < 2s load | ⏳ |
| 26 | Bundle Optimization | Code splitting | ⏳ |
| 26 | Image Optimization | Lazy loading | ⏳ |
| 26 | Caching Strategy | Service Worker | ⏳ |

### 5.2 Accessibility e Quality

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 27 | WCAG 2.1 AA | Certificação | ⏳ |
| 27 | Keyboard Navigation | Navegação | ⏳ |
| 27 | Screen Reader | ARIA labels | ⏳ |
| 27 | Color Contrast | AA compliance | ⏳ |
| 28 | Bug Bashes | QA total | ⏳ |
| 28 | Security Audit | Pen test | ⏳ |
| 28 | Load Testing | Stress test | ⏳ |
| 28 | Documentation | Completa | ⏳ |

### 5.3 Community e Marketing

| Semana | Task | Entregável | Status |
|--------|------|------------|--------|
| 29 | Share Features | Redes sociais | ⏳ |
| 29 | Referral System | Indicações | ⏳ |
| 29 | Social Proof | Reviews | ⏳ |
| 29 | Content Marketing | Blog posts | ⏳ |
| 30 | SEO Optimization | Google ranking | ⏳ |
| 30 | Email Marketing | Newsletters | ⏳ |
| 30 | Partnership | Professores | ⏳ |
| 30 | Expansion Plan | Español | ⏳ |

---

## 6. Métricas por Fase

### 6.1 Milestones

| Fase | Data Alvo | Usuários | Usuários Pro | MRR |
|------|-----------|----------|--------------|-----|
| Fase 1 | Mês 3 | 1.000 | 50 | R$495 |
| Fase 2 | Mês 5 | 5.000 | 200 | R$1.980 |
| Fase 3 | Mês 9 | 15.000 | 400 | R$3.960 |
| Fase 4 | Mês 12 | 30.000 | 500 | R$4.950 |

### 6.2 KPIs Técnicos

| Métrica | Meta Fase 1 | Meta Fase 2 | Meta Final |
|---------|-------------|-------------|------------|
| **Core Web Vitals LCP** | < 3s | < 2.5s | < 2s |
| **Core Web Vitals FID** | < 100ms | < 50ms | < 50ms |
| **Core Web Vitals CLS** | < 0.1 | < 0.1 | < 0.1 |
| **Test Coverage** | 80% | 85% | 90% |
| **Uptime** | 99% | 99.5% | 99.9% |
| **Error Rate** | < 1% | < 0.5% | < 0.1% |

---

## 7. Riscos por Fase

### 7.1 Fase 1

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| DB schema incorreto | Média | Alto | Revisão por pares |
| Audio não funciona mobile | Média | Médio | Fallback tones |
| Performance ruim | Baixa | Alto | Monitoring desde início |

### 7.2 Fase 2

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Stripe rejeita | Baixa | Crítico | PayPal backup |
| Churn alto após trial | Média | Alto | Onboarding flow |
| Concorrente similar | Baixa | Médio | Diferenciais únicos |

### 7.3 Fase 3

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| AI custos altos | Média | Alto | Ollama local |
| Engajamento baixo | Média | Alto | Gamificação |
| Bugs em gerador | Média | Médio | Tests extensivos |

---

## 8. Recursos por Fase

### 8.1 Desenvolvimento

| Fase | Desenvolvedores | Designer | DevOps |
|------|-----------------|----------|--------|
| **Fase 1** | 1 (full-stack) | 0.5 | 0.25 |
| **Fase 2** | 1-2 | 0.5 | 0.25 |
| **Fase 3** | 2 | 0.5 | 0.5 |
| **Fase 4** | 2 | 0.25 | 0.5 |

### 8.2 Custos Mensais

| Fase | Infraestrutura | Serviços | Total |
|------|----------------|----------|-------|
| **Fase 1** | R$4 (domínio) | R$0 | **R$4** |
| **Fase 2** | R$4 | Stripe fees | **~R$20** |
| **Fase 3** | R$4 | Stripe + Resend | **~R$30** |
| **Fase 4** | R$4 | Stripe + Analytics | **~R$50** |

---

*Documento aprovado em 24 de outubro de 2026*  
*Versão 1.0*