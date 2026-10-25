# MusicOS — Issues de Desenvolvimento

> **Status do Projeto:** 🚧 Fase 1 — Setup Inicial  
> **Data de Criação:** 23 de outubro de 2026  
> **Base de Referência:** musicpages (legado)  
> **Pasta de Desenvolvimento:** `src/app-MusicOS/`
> **Custo Mensal (MVP):** R$4 (só domínio)
> **Doc Relacionado:** EDUCATIONAL.md (sistema educacional completo)

---

## Legenda de Status

| Badge | Significado |
|-------|-------------|
| `🔵 backlog` | Aguardando priorização e início |
| `🟡 spec` | Spec criada, aguardando implementação |
| `🟠 in progress` | Em desenvolvimento ativo |
| `🟢 done` | Implementado e testado |
| `⛔ blocked` | Bloqueado por dependência |
| `❌ cancelled` | Descartado |

---

## Legenda de Prioridade

| Prioridade | Significado |
|------------|-------------|
| **P0** | Crítico para MVP — sem isso, não lança |
| **P1** | Importante para MVP — altamente recomendável |
| **P2** | Desejável para MVP — pode ser adiando para v2 |
| **P3** | Pós-MVP — melhorias e diferenciais |

---

## Estratégia de Custo Zero

| Aspecto | Decisão |
|---------|---------|
| **Database + Auth** | Supabase Free (500MB, 50K MAU) |
| **Hosting** | Vercel Free (100GB bandwidth) |
| **Automação** | Next.js API Routes (sem N8N) |
| **AI Assistant** | Adiado para fase 3+ |
| **Storage** | LocalStorage apenas (50MB) |
| **Custo Mensal** | R$4 (domínio) |

---

## SISTEMA EDUCACIONAL — NOVIDADE!

### Info Buttons (Ajuda Contextual)

| ID | Status | Task | Prioridade | Esforço |
|----|--------|------|------------|---------|
| **EDU-001** | 🔵 backlog | Criar componente InfoButton | P1 | S |
| **EDU-002** | 🔵 backlog | Criar Content Database (textos educacionais) | P1 | M |
| **EDU-003** | 🔵 backlog | Info content: Ciclo de Quintas | P1 | S |
| **EDU-004** | 🔵 backlog | Info content: Campo Harmônico | P1 | S |
| **EDU-005** | 🔵 backlog | Info content: Escalas | P1 | S |
| **EDU-006** | 🔵 backlog | Info content: Acordes | P1 | S |
| **EDU-007** | 🔵 backlog | Info content: Técnicas (básico) | P2 | S |

### Exercícios de Escalas

| ID | Status | Task | Prioridade | Esforço | Dificuldade |
|----|--------|------|------------|---------|-------------|
| **EXS-001** | 🔵 backlog | Escala C Maior - Posição 1 | P1 | S | Iniciante |
| **EXS-002** | 🔵 backlog | Escala C Maior - Posição 2 | P1 | S | Iniciante |
| **EXS-003** | 🔵 backlog | Escala C Maior - Posição 3 | P1 | S | Iniciante |
| **EXS-004** | 🔵 backlog | Escala C Maior - Posição 4 | P1 | S | Intermediário |
| **EXS-005** | 🔵 backlog | Escala Pentatônica C - Posição 1 | P1 | S | Iniciante |
| **EXS-006** | 🔵 backlog | Escala Blues C - Posição 1 | P1 | S | Iniciante |

### Exercícios de Acordes

| ID | Status | Task | Prioridade | Esforço |
|----|--------|------|------------|---------|
| **EXC-001** | 🔵 backlog | Progressão I-IV-V-I (C-F-G) | P1 | S |
| **EXC-002** | 🔵 backlog | Progressão ii-V-I (Dm-G-C) | P1 | S |
| **EXC-003** | 🔵 backlog | Progressão I-vi-IV-V (C-Am-F-G) | P1 | M |
| **EXC-004** | 🔵 backlog | Progressão I-iii-IV-V (C-Em-F-G) | P2 | S |

### Exercícios de Técnicas

| ID | Status | Task | Prioridade | Esforço | Técnica |
|----|--------|------|------------|---------|---------|
| **EXT-001** | 🔵 backlog | Tapping - Notas únicas | P2 | S | Tapping |
| **EXT-002** | 🔵 backlog | Tapping - Two-hand básico | P2 | M | Tapping |
| **EXT-003** | 🔵 backlog | Hammer-on/Pull-off - 2 notas | P2 | S | Hammer-on |
| **EXT-004** | 🔵 backlog | Hammer-on/Pull-off - 3 notas | P2 | S | Hammer-on |
| **EXT-005** | 🔵 backlog | Bends - 1/4 tom | P2 | S | Bends |
| **EXT-006** | 🔵 backlog | Bends - Full bend | P2 | S | Bends |

### Gerador de Exercícios

| ID | Status | Task | Prioridade | Esforço |
|----|--------|------|------------|---------|
| **GER-001** | 🔵 backlog | Exercise Generator Engine | P2 | L |
| **GER-002** | 🔵 backlog | Random chord progression generator | P2 | M |
| **GER-003** | 🔵 backlog | Random scale exercise generator | P2 | M |
| **GER-004** | 🔵 backlog | UI de configuração do gerador | P2 | S |

### Exercícios Guiados com Metrônomo

| ID | Status | Task | Prioridade | Esforço |
|----|--------|------|------------|---------|
| **GUI-001** | 🔵 backlog | Guided Exercise Player component | P2 | L |
| **GUI-002** | 🔵 backlog | Metrônomo integrado no player | P2 | M |
| **GUI-003** | 🔵 backlog | Visual highlight da nota atual | P2 | M |
| **GUI-004** | 🔵 backlog | Progress bar e tracking | P2 | S |

---

## FASE 1 — MVP (Meses 1-3) — Custo Zero

### Infraestrutura Base

| ID | Status | Task | Prioridade | Esforço | Dependência |
|----|--------|------|------------|---------|-------------|
| INF-001 | 🔵 backlog | Configurar repo Git e estrutura de branches | P0 | S | — |
| INF-002 | 🔵 backlog | Setup Next.js 15 com App Router | P0 | S | INF-001 |
| INF-003 | 🔵 backlog | Configurar Tailwind CSS + shadcn/ui | P0 | S | INF-002 |
| INF-004 | 🔵 backlog | Configurar ESLint + Prettier + Husky | P1 | S | INF-001 |
| INF-005 | 🔵 backlog | **Setup Supabase Free Tier** (DB + Auth) | P0 | M | — |
| INF-006 | 🔵 backlog | Configurar variáveis de ambiente (.env.example) | P0 | S | INF-005 |
| INF-007 | 🔵 backlog | **CI/CD com GitHub Actions** (sem Vercel build) | P1 | M | INF-001 |
| INF-008 | 🔵 backlog | Deploy em Vercel Free | P0 | S | INF-002 |

### Database e Auth

| ID | Status | Task | Prioridade | Esforço | Dependência |
|----|--------|------|------------|---------|-------------|
| DB-001 | 🔵 backlog | Criar schema PostgreSQL (profiles, subscriptions, progress) | P0 | M | INF-005 |
| DB-002 | 🔵 backlog | Configurar Row Level Security (RLS) | P0 | M | DB-001 |
| DB-003 | 🔵 backlog | Implementar Supabase Auth (email + Google) | P0 | M | DB-001 |
| DB-004 | 🔵 backlog | Criar types TypeScript para database | P0 | S | DB-001 |

### Landing Page

| ID | Status | Task | Prioridade | Esforço | Dependência |
|----|--------|------|------------|---------|-------------|
| LP-001 | 🔵 backlog | Criar layout base (Header, Footer) | P1 | M | INF-003 |
| LP-002 | 🔵 backlog | Desenvolver Hero Section com CTA | P0 | M | LP-001 |
| LP-003 | 🔵 backlog | Criar seção Features (comparativo Free vs Pro + Educacional) | P0 | M | LP-001 |
| LP-004 | 🔵 backlog | Implementar Pricing Section (R$9,90/mês, R$197 lifetime) | P0 | M | LP-001 |
| LP-005 | 🔵 backlog | Adicionar seção de Exercícios Educacionais | P1 | S | LP-001 |
| LP-006 | 🔵 backlog | **Integrar Stripe Checkout (via API Routes)** | P0 | M | INF-005 |

### Sistema de Escalas (Core) — Free Tier (5 tônicas)

| ID | Status | Task | Prioridade | Esforço | Referência MusicPages |
|----|--------|------|------------|---------|----------------------|
| SCA-001 | 🔵 backlog | Criar Music Theory Engine (core) | P0 | L | script-escalas.js |
| SCA-002 | 🔵 backlog | Implementar seletores de Tônica (5 básicas: C, G, F, A, E) | P0 | S | index.html (#tonica) |
| SCA-003 | 🔵 backlog | Implementar seletores de Escala (Maior, Menor) | P0 | S | index.html (#tipoEscala) |
| SCA-004 | 🔵 backlog | Criar componente ScaleDisplay (notas da escala) | P0 | M | script-escalas.js |
| SCA-005 | 🔵 backlog | Criar componente ScaleHero (info da escala ativa) | P1 | M | script-scale-hero.js |
| SCA-006 | 🔵 backlog | **Integrar InfoButton no ScaleHero** | P1 | S | EDU-001 |

### Fretboard Interativo

| ID | Status | Task | Prioridade | Esforço | Referência MusicPages |
|----|--------|------|------------|---------|----------------------|
| FBT-001 | 🔵 backlog | Criar componente Fretboard (SVG render) | P0 | L | script-fretboard.js |
| FBT-002 | 🔵 backlog | Implementar InstrumentRegistry (perfis de instrumentos) | P0 | M | script-instrument-registry.js |
| FBT-003 | 🔵 backlog | Implementar Guitarra 6 cordas (EADGBE) | P0 | M | — |
| FBT-004 | 🔵 backlog | Integrar destaque de notas da escala | P0 | M | highlightFretboardNotes() |
| FBT-005 | 🔵 backlog | Implementar audio playback por clique | P0 | S | script-fretboard.js |
| FBT-006 | 🔵 backlog | **Integrar InfoButton no Fretboard** | P1 | S | EDU-001 |

### Campo Harmônico e Acordes

| ID | Status | Task | Prioridade | Esforço | Referência MusicPages |
|----|--------|------|------------|---------|----------------------|
| CHD-001 | 🔵 backlog | Implementar algoritmo de campo harmônico | P0 | M | script-escalas.js |
| CHD-002 | 🔵 backlog | Criar componente ChordCard | P0 | M | script-chord-diagrams.js |
| CHD-003 | 🔵 backlog | Renderizar diagramas SVG de acordes | P0 | M | script-chord-diagrams.js |
| CHD-004 | 🔵 backlog | Criar LocalChordDB (fallback shapes) | P0 | L | script-chord-diagrams.js |
| CHD-005 | 🔵 backlog | Implementar áudio de acorde (play) | P0 | S | AudioEngine.playNote() |
| CHD-006 | 🔵 backlog | **Integrar InfoButton no Campo Harmônico** | P1 | S | EDU-001 |

### Audio Engine

| ID | Status | Task | Prioridade | Esforço | Referência MusicPages |
|----|--------|------|------------|---------|----------------------|
| AUD-001 | 🔵 backlog | Criar AudioEngine wrapper (Web Audio API) | P0 | M | script-audio-engine.js |
| AUD-002 | 🔵 backlog | Implementar síntese de notas (Oscillator + Gain) | P0 | M | script-audio-engine.js |
| AUD-003 | 🔵 backlog | Adicionar envelope ADSR configurável | P0 | S | script-audio-engine.js |

### Metrônomo

| ID | Status | Task | Prioridade | Esforço | Referência MusicPages |
|----|--------|------|------------|---------|----------------------|
| MET-001 | 🔵 backlog | Criar componente Metronome | P1 | M | script-metronome.js |
| MET-002 | 🔵 backlog | Implementar motor de click (Web Audio API) | P1 | M | script-metronome.js |
| MET-003 | 🔵 backlog | Adicionar controle de BPM (20-300) | P1 | S | script-metronome.js |
| MET-004 | 🔵 backlog | **Integrar InfoButton no Metrônomo** | P1 | S | EDU-001 |

### LocalStorage Manager

| ID | Status | Task | Prioridade | Esforço | Dependência |
|----|--------|------|------------|---------|-------------|
| LS-001 | 🔵 backlog | Criar Storage Manager (limite 50MB) | P0 | S | — |
| LS-002 | 🔵 backlog | Salvar preferências do usuário (tema, instrumento) | P0 | S | LS-001 |
| LS-003 | 🔵 backlog | Salvar último arquivo de áudio (1 arquivo) | P0 | M | LS-001 |
| LS-004 | 🔵 backlog | Implementar alerta de storage cheio | P1 | S | LS-001 |

### PWA

| ID | Status | Task | Prioridade | Esforço | Dependência |
|----|--------|------|------------|---------|-------------|
| PWA-001 | 🔵 backlog | Criar manifest.json | P0 | S | — |
| PWA-002 | 🔵 backlog | Configurar Service Worker (offline básico) | P1 | M | — |
| PWA-003 | 🔵 backlog | Adicionar ícones PWA | P1 | S | — |
| PWA-004 | 🔵 backlog | Configurar next-pwa | P1 | S | — |

### Stripe Integration (Sem N8N)

| ID | Status | Task | Prioridade | Esforço | Dependência |
|----|--------|------|------------|---------|-------------|
| STR-001 | 🔵 backlog | Criar conta Stripe (desenvolvimento) | P0 | S | — |
| STR-002 | 🔵 backlog | Configurar products (Pro R$9,90, Lifetime R$197) | P0 | S | — |
| STR-003 | 🔵 backlog | Criar API Route: `/api/webhooks/stripe` | P0 | M | — |
| STR-004 | 🔵 backlog | Implementar checkout session creator | P0 | M | — |
| STR-005 | 🔵 backlog | Testar fluxo completo (success/cancel) | P0 | M | STR-003 |

---

## FASE 2 — Pro Launch (Meses 4-5)

*(Tasks educacionais continuam)*

| ID | Status | Task | Prioridade | Esforço |
|----|--------|------|------------|---------|
| EDU-010 | 🔵 backlog | InfoButton completo (todas as seções) | P1 | L |
| EDU-011 | 🔵 backlog | Content Database expandido (20+ textos) | P1 | M |
| EXS-010 | 🔵 backlog | Mais 10 exercícios de escalas | P1 | M |
| EXC-010 | 🔵 backlog | 10 progressões de acordes | P1 | M |
| GER-010 | 🔵 backlog | Gerador de exercícios básico | P2 | L |

---

## FASE 3 — Expansão (Meses 6-9) — Educacional Completo

| ID | Status | Task | Prioridade | Esforço |
|----|--------|------|------------|---------|
| EXT-010 | 🔵 backlog | Técnicas: Tapping (8 exercícios) | P2 | L |
| EXT-011 | 🔵 backlog | Técnicas: Hammer-on/Pull-off (6 exercícios) | P2 | M |
| EXT-012 | 🔵 backlog | Técnicas: Bends (5 exercícios) | P2 | M |
| EXT-013 | 🔵 backlog | Técnicas: Two-Hands (4 exercícios) | P2 | L |
| GUI-010 | 🔵 backlog | Guided Exercise Player completo | P2 | L |
| GUI-011 | 🔵 backlog | Metrônomo integrado no player | P2 | M |
| GUI-012 | 🔵 backlog | Visual highlight e feedback | P2 | M |
| GER-020 | 🔵 backlog | Gerador de Licks (Blues, Jazz, Rock) | P2 | XL |
| GAM-001 | 🔵 backlog | Sistema de conquistas | P3 | M |
| GAM-002 | 🔵 backlog | Streaks diários | P3 | M |

---

## Resumo por Fase

| Fase | Tasks Educacionais | Tasks Totais | Custo Mensal |
|------|-------------------|--------------|--------------|
| **Fase 1: MVP** | 15 tasks | ~55 tasks | R$4 |
| **Fase 2: Pro** | 30 tasks | ~80 tasks | R$4 |
| **Fase 3: Expansão** | 70 tasks | ~110 tasks | R$4-115* |

---

## Como Criar Nova Issue

```markdown
### [CÓDIGO] · `[STATUS]` · `[TIPO]:` Descrição curta

**Prioridade:** P0/P1/P2/P3  
**Esforço:** S/M/L/XL  
**Doc Relacionado:** EDUCATIONAL.md  
**Depende de:** códigos das tasks dependentes

#### Contexto
Descreva o problema ou feature...

#### Comportamento Esperado
1. Bullet points do comportamento esperado
2. ...
```

---

*Documento atualizado em 23 de outubro de 2026*  
*Versão 1.2 — Com Sistema Educacional Completo*  
*Baseado em: docs/EDUCATIONAL.md*