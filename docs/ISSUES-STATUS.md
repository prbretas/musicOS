# MusicOS — Status das Issues

> **Data:** 24 de outubro de 2026  
> **Versão:** 1.0  
> **Baseado em:** src/app-MusicOS/docs/issues.md

---

## Resumo Geral

| Fase | Total | Backlog | Spec | In Progress | Done | Bloqueado |
|------|-------|---------|------|-------------|------|-----------|
| **Fase 1 (MVP)** | ~55 | 45 | 0 | 0 | 10 | 0 |
| **Fase 2 (Pro)** | ~25 | 25 | 0 | 0 | 0 | 0 |
| **Fase 3 (Educacional)** | ~30 | 30 | 0 | 0 | 0 | 0 |
| **Total** | ~110 | 100 | 0 | 0 | 10 | 0 |

---

## Fase 1 — MVP (Meses 1-3) — Custo Zero

### Infraestrutura Base ✅ PARCIAL

| ID | Task | Status | Observação |
|----|------|--------|------------|
| INF-001 | Configurar repo Git e estrutura de branches | ✅ Done | Já configurado |
| INF-002 | Setup Next.js 15 com App Router | ✅ Done | Já existe |
| INF-003 | Configurar Tailwind CSS + shadcn/ui | ✅ Done | Já existe |
| INF-004 | Configurar ESLint + Prettier + Husky | 🔵 backlog | Pendente |
| INF-005 | Setup Supabase Free Tier | 🔵 backlog | Pendente |
| INF-006 | Configurar variáveis de ambiente | 🔵 backlog | Pendente |
| INF-007 | CI/CD com GitHub Actions | 🔵 backlog | Pendente |
| INF-008 | Deploy em Vercel Free | 🔵 backlog | Pendente |

### Database e Auth 🔵 BACKLOG

| ID | Task | Status | Dependência |
|----|------|--------|-------------|
| DB-001 | Criar schema PostgreSQL | 🔵 backlog | INF-005 |
| DB-002 | Configurar RLS | 🔵 backlog | DB-001 |
| DB-003 | Implementar Supabase Auth | 🔵 backlog | DB-001 |
| DB-004 | Criar types TypeScript | 🔵 backlog | DB-001 |

### Landing Page 🔵 BACKLOG

| ID | Task | Status | Dependência |
|----|------|--------|-------------|
| LP-001 | Criar layout base | 🔵 backlog | INF-003 |
| LP-002 | Hero Section com CTA | 🔵 backlog | LP-001 |
| LP-003 | Seção Features | 🔵 backlog | LP-001 |
| LP-004 | Pricing Section | 🔵 backlog | LP-001 |
| LP-005 | Seção Exercícios | 🔵 backlog | LP-001 |
| LP-006 | Stripe Checkout | 🔵 backlog | INF-005 |

### Sistema de Escalas 🔵 BACKLOG

| ID | Task | Status | Referência |
|----|------|--------|------------|
| SCA-001 | Music Theory Engine | 🔵 backlog | script-escalas.js |
| SCA-002 | Seletores de Tônica (5) | 🔵 backlog | index.html (#tonica) |
| SCA-003 | Seletores de Escala | 🔵 backlog | index.html (#tipoEscala) |
| SCA-004 | ScaleDisplay | 🔵 backlog | script-escalas.js |
| SCA-005 | ScaleHero | 🔵 backlog | script-scale-hero.js |
| SCA-006 | InfoButton no ScaleHero | 🔵 backlog | EDU-001 |

### Fretboard Interativo ✅ FEITO

| ID | Task | Status | Observação |
|----|------|--------|------------|
| FBT-001 | Fretboard (SVG) | ✅ Done | Componente existente |
| FBT-002 | InstrumentRegistry | 🔵 backlog | Pendente |
| FBT-003 | Guitarra 6 cordas | 🔵 backlog | Precisa更多人 |
| FBT-004 | Destaque de notas | ✅ Done | Já funciona |
| FBT-005 | Audio playback | 🔵 backlog | Precisa AudioEngine |
| FBT-006 | InfoButton no Fretboard | 🔵 backlog | EDU-001 |

### Campo Harmônico e Acordes 🔵 BACKLOG

| ID | Task | Status | Referência |
|----|------|--------|------------|
| CHD-001 | Algoritmo campo harmônico | 🔵 backlog | script-escalas.js |
| CHD-002 | ChordCard | 🔵 backlog | script-chord-diagrams.js |
| CHD-003 | Diagramas SVG | 🔵 backlog | script-chord-diagrams.js |
| CHD-004 | LocalChordDB | 🔵 backlog | script-chord-diagrams.js |
| CHD-005 | Áudio de acorde | 🔵 backlog | AudioEngine.playNote() |
| CHD-006 | InfoButton no Campo | 🔵 backlog | EDU-001 |

### Audio Engine 🔵 BACKLOG

| ID | Task | Status | Referência |
|----|------|--------|------------|
| AUD-001 | AudioEngine wrapper | 🔵 backlog | script-audio-engine.js |
| AUD-002 | Síntese de notas | 🔵 backlog | script-audio-engine.js |
| AUD-003 | Envelope ADSR | 🔵 backlog | script-audio-engine.js |

### Metrônomo 🔵 BACKLOG

| ID | Task | Status | Referência |
|----|------|--------|------------|
| MET-001 | Componente Metronome | 🔵 backlog | script-metronome.js |
| MET-002 | Motor de click | 🔵 backlog | script-metronome.js |
| MET-003 | Controle BPM | 🔵 backlog | script-metronome.js |
| MET-004 | InfoButton no Metrônomo | 🔵 backlog | EDU-001 |

### LocalStorage Manager 🔵 BACKLOG

| ID | Task | Status |
|----|------|--------|
| LS-001 | Storage Manager | 🔵 backlog |
| LS-002 | Salvar preferências | 🔵 backlog |
| LS-003 | Salvar último áudio | 🔵 backlog |
| LS-004 | Alerta storage cheio | 🔵 backlog |

### PWA 🔵 BACKLOG

| ID | Task | Status |
|----|------|--------|
| PWA-001 | manifest.json | 🔵 backlog |
| PWA-002 | Service Worker | 🔵 backlog |
| PWA-003 | Ícones PWA | 🔵 backlog |
| PWA-004 | next-pwa | 🔵 backlog |

### Stripe Integration 🔵 BACKLOG

| ID | Task | Status |
|----|------|--------|
| STR-001 | Conta Stripe dev | 🔵 backlog |
| STR-002 | Configurar products | 🔵 backlog |
| STR-003 | API Route webhook | 🔵 backlog |
| STR-004 | Checkout session | 🔵 backlog |
| STR-005 | Testar fluxo | 🔵 backlog |

---

## Sistema Educacional — Fase 1

### Info Buttons 🔵 BACKLOG

| ID | Task | Status | Prioridade |
|----|------|--------|------------|
| EDU-001 | InfoButton component | ✅ Done | P1 |
| EDU-002 | Content Database | 🔵 backlog | P1 |
| EDU-003 | Info content: Ciclo de Quintas | 🔵 backlog | P1 |
| EDU-004 | Info content: Campo Harmônico | 🔵 backlog | P1 |
| EDU-005 | Info content: Escalas | 🔵 backlog | P1 |
| EDU-006 | Info content: Acordes | 🔵 backlog | P1 |
| EDU-007 | Info content: Técnicas | 🔵 backlog | P2 |

### Exercícios de Escalas 🔵 BACKLOG

| ID | Task | Prioridade | Dificuldade |
|----|------|------------|-------------|
| EXS-001 | Escala C Maior - Posição 1 | P1 | Iniciante |
| EXS-002 | Escala C Maior - Posição 2 | P1 | Iniciante |
| EXS-003 | Escala C Maior - Posição 3 | P1 | Iniciante |
| EXS-004 | Escala C Maior - Posição 4 | P1 | Intermediário |
| EXS-005 | Escala Pentatônica C - Posição 1 | P1 | Iniciante |
| EXS-006 | Escala Blues C - Posição 1 | P1 | Iniciante |

### Exercícios de Acordes 🔵 BACKLOG

| ID | Task | Prioridade |
|----|------|------------|
| EXC-001 | Progressão I-IV-V-I (C-F-G) | P1 |
| EXC-002 | Progressão ii-V-I (Dm-G-C) | P1 |
| EXC-003 | Progressão I-vi-IV-V (C-Am-F-G) | P1 |
| EXC-004 | Progressão I-iii-IV-V (C-Em-F-G) | P2 |

---

## Fase 2 — Pro Launch (Meses 4-5)

| ID | Task | Status |
|----|------|--------|
| EDU-010 | InfoButton completo | 🔵 backlog |
| EDU-011 | Content DB expandido (20+) | 🔵 backlog |
| EXS-010 | +10 exercícios de escalas | 🔵 backlog |
| EXC-010 | 10 progressões de acordes | 🔵 backlog |
| GER-010 | Gerador de exercícios | 🔵 backlog |

---

## Fase 3 — Educacional Completo (Meses 6-9)

### Técnicas Instrumentais 🔵 BACKLOG

| ID | Task | Dificuldade |
|----|------|-------------|
| EXT-001 | Tapping - Notas únicas | P2 |
| EXT-002 | Tapping - Two-hand básico | P2 |
| EXT-003 | Hammer-on - 2 notas | P2 |
| EXT-004 | Hammer-on - 3 notas | P2 |
| EXT-005 | Bends - 1/4 tom | P2 |
| EXT-006 | Bends - Full bend | P2 |

### Exercícios Guiados 🔵 BACKLOG

| ID | Task |
|----|------|
| GUI-001 | Guided Exercise Player |
| GUI-002 | Metrônomo integrado |
| GUI-003 | Visual highlight |
| GUI-004 | Progress bar |

### Gerador de Exercícios 🔵 BACKLOG

| ID | Task |
|----|------|
| GER-001 | Exercise Generator Engine |
| GER-002 | Random chord progression |
| GER-003 | Random scale exercise |
| GER-004 | UI de configuração |

---

## Priorização Recomendada para Próximos Passos

### 🔴 P0 — Crítico para MVP

1. **Infraestrutura**: Setup Supabase + Variáveis de ambiente
2. **Database**: Schema PostgreSQL + RLS + Auth
3. **Music Theory Engine**: O core de toda a aplicação
4. **Stripe**: Checkout básico para monetização
5. **ScaleDisplay + ScaleHero**: Módulo de escalas completo

### 🟡 P1 — Importante para MVP

1. **Fretboard**: InstrumentRegistry + guitarra completa
2. **ChordCard + Diagramas**: Módulo de acordes
3. **InfoButton**: Conteúdo educacional básico
4. **Exercícios**: 5 exercícios de escalas básicos
5. **AudioEngine**: Síntese de notas

### 🟢 P2 — Desejável

1. **Metrônomo**
2. **LocalStorage Manager**
3. **PWA**
4. **Landing Page completa**
5. **Mais exercícios**

---

## Issues Já Implementadas (Done ✅)

| Componente | Arquivos | Status |
|------------|----------|--------|
| **InfoButton** | src/components/ui/InfoButton.tsx | ✅ Done |
| **Fretboard** | src/components/Fretboard.tsx | ✅ Done |
| **ChordDiagram** | src/components/ChordDiagram.tsx | ✅ Done |
| **Estrutura Next.js** | src/app-MusicOS/ | ✅ Done |
| **Docs existentes** | docs/*.md | ✅ Done |

---

*Documento atualizado em 24 de outubro de 2026*  
*Versão 1.0 — Status das Issues*