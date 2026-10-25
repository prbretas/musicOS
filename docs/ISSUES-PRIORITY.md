# MusicOS — Issues Priorizadas

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Aprovado  
> **Baseado em:** docs/ROADMAP.md, docs/REQUIREMENTS.md, docs/TECH.md

---

## 1. Resumo Executivo

### 🎯 Ordem de Priorização

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRIORIDADE DE ISSUES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FASE 1 (Meses 1-3) — MVP                                                  │
│  ═══════════════════════                                                    │
│                                                                             │
│  🔴 P0 — CRÍTICO (Não lança sem isso)                                      │
│  ├── INF-005: Setup Supabase Free Tier                                     │
│  ├── CORE-001: Music Theory Engine                                         │
│  ├── CORE-003: AudioEngine                                                 │
│  ├── CMP-004: ScaleDisplay                                                 │
│  └── TST-001: Testes Unitários                                             │
│                                                                             │
│  🟠 P1 — IMPORTANTE (Altamente recomendável)                               │
│  ├── INF-007: CI/CD GitHub Actions                                         │
│  ├── CORE-002: InstrumentRegistry                                          │
│  ├── CMP-005: ScaleHero                                                    │
│  ├── CMP-006: ChordSelector                                                │
│  └── TST-002: Testes E2E                                                   │
│                                                                             │
│  🟡 P2 — DESEJÁVEL (Pode adiando)                                         │
│  ├── INF-008: Deploy Vercel Free                                           │
│  ├── CMP-007: Metronome Component                                          │
│  ├── EDU-001: InfoButton Content Database                                  │
│  └── EDU-002: InfoContent: Ciclo de Quintas                               │
│                                                                             │
│  🟢 P3 — PÓS-MVP (Melhorias)                                               │
│  ├── CMP-008: Exercise Player                                              │
│  ├── EDU-003: Sistema de Gamificação                                       │
│  └── EDU-004: Gerador de Exercícios                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matriz de Priorização Completa

### 2.1 Fase 1 — MVP (Meses 1-3)

#### 🔴 P0 — CRÍTICO (Bloqueadores do MVP)

| ID | Task | Esforço | Dependências | Entregável | Status |
|----|------|---------|--------------|------------|--------|
| **INF-005** | **Setup Supabase Free Tier** | **S** | - | DB + Auth funcionando | 🔵 backlog |
| **CORE-001** | **Music Theory Engine** | **L** | - | getScaleNotes, getChordNotes | 🔵 backlog |
| **CORE-003** | **AudioEngine** | **M** | - | playNote, playChord | 🔵 backlog |
| **CMP-004** | **ScaleDisplay** | **M** | CORE-001 | Exibe notas da escala | 🔵 backlog |
| **TST-001** | **Testes Unitários** | **M** | - | 80% coverage | 🔵 backlog |

##### Dependências em detalhe:

```
INF-005 (Supabase)
    │
    ├──► CORE-001 (Theory Engine) — pode desenvolver sem DB
    │
    ├──► CORE-003 (AudioEngine) — pode desenvolver sem DB
    │
    ├──► CMP-004 (ScaleDisplay) — depende de CORE-001
    │
    └──► TST-001 (Tests) — deve acompanhar os demais
```

#### 🟠 P1 — IMPORTANTE

| ID | Task | Esforço | Dependências | Entregável | Status |
|----|------|---------|--------------|------------|--------|
| **INF-007** | CI/CD GitHub Actions | M | - | Pipeline CI/CD | 🔵 backlog |
| **CORE-002** | InstrumentRegistry | M | - | Guitar + Ukulele | 🔵 backlog |
| **CMP-005** | ScaleHero | S | CMP-004 | Info da escala ativa | 🔵 backlog |
| **CMP-006** | ChordSelector | M | CORE-001 | Seleção de acordes | 🔵 backlog |
| **TST-002** | Testes E2E | M | CMP-002 | 5 fluxos críticos | 🔵 backlog |

##### Dependências:

```
INF-007 (CI/CD)
    │
    └──► TST-002 (E2E Tests) — precisa do CI para rodar

CORE-002 (InstrumentRegistry)
    │
    └──► CMP-006 (ChordSelector) — precisa de instrumentos

CMP-004 (ScaleDisplay)
    │
    └──► CMP-005 (ScaleHero) — precisa do ScaleDisplay
```

#### 🟡 P2 — DESEJÁVEL

| ID | Task | Esforço | Dependências | Entregável | Status |
|----|------|---------|--------------|------------|--------|
| INF-008 | Deploy Vercel Free | S | INF-007 | App em produção | 🔵 backlog |
| CMP-007 | Metronome Component | M | - | Click rítmico | 🔵 backlog |
| CMP-009 | ChordCard | M | CMP-003, CMP-006 | Card de acorde | 🔵 backlog |
| EDU-001 | InfoButton Content DB | M | CMP-001 | 5 textos educacionais | 🔵 backlog |
| EDU-002 | InfoContent: Ciclo Quintas | S | EDU-001 | Conteúdo completo | 🔵 backlog |

#### 🟢 P3 — PÓS-MVP

| ID | Task | Esforço | Dependências | Entregável | Status |
|----|------|---------|--------------|------------|--------|
| CMP-010 | Exercise Player | L | CMP-007 | Player guiado | 🔵 backlog |
| CMP-011 | Guided Exercise | L | CMP-010 | Exercícios c/ metrônomo | 🔵 backlog |
| EDU-003 | Gamification System | L | TST-001 | Conquistas, streaks | 🔵 backlog |
| EDU-004 | Exercise Generator | L | CORE-001 | Gerador aleatório | 🔵 backlog |

---

## 3. Roadmap de Implementação Recomendado

### 3.1 Semanas 1-2: Infraestrutura + Core

```
SEMANA 1
═════════
│
├─► P0: INF-005 (Supabase Setup)
│   └── Dependências: Nenhuma
│   └── Entrega: Database schema, Auth configurado
│
└─► P0: CORE-001 (Music Theory Engine)
    └── Dependências: Nenhuma
    └── Entrega: getScaleNotes(), getChordNotes(), getInterval()

SEMANA 2
═════════
│
├─► P0: CORE-003 (AudioEngine)
│   └── Dependências: Nenhuma
│   └── Entrega: playNote(), playChord(), ADSR
│
├─► P1: CORE-002 (InstrumentRegistry)
│   └── Dependências: Nenhuma
│   └── Entrega: Guitar + Ukulele profiles
│
└─► P0: TST-001 (Testes Unitários)
    └── Dependências: CORE-001
    └── Entrega: 80% coverage
```

### 3.2 Semanas 3-4: Componentes Core

```
SEMANA 3
═════════
│
├─► P0: CMP-004 (ScaleDisplay)
│   └── Dependências: CORE-001
│   └── Entrega: Grid de notas da escala
│
├─► P1: CMP-005 (ScaleHero)
│   └── Dependências: CMP-004
│   └── Entrega: Hero com info da escala
│
└─► P1: CMP-006 (ChordSelector)
    └── Dependências: CORE-001, CORE-002
    └── Entrega: Seleção de acordes

SEMANA 4
═════════
│
├─► P0: CMP-004 (completar)
│
├─► P1: CMP-005 (completar)
│
└─► P1: CMP-006 (completar)
```

### 3.3 Semanas 5-6: Sistema Educacional + Metronome

```
SEMANA 5
═════════
│
├─► P2: EDU-001 (Content Database)
│   └── Dependências: CMP-001 (InfoButton)
│   └── Entrega: 5 textos educacionais
│
├─► P2: EDU-002 (Ciclo Quintas)
│   └── Dependências: EDU-001
│   └── Entrega: Conteúdo do Ciclo de Quintas
│
└─► P2: CMP-007 (Metronome)
    └── Dependências: Nenhuma
    └── Entrega: Componente de metrônomo

SEMANA 6
═════════
│
├─► P2: EDU-001 (completar)
│
├─► P2: EDU-002 (completar)
│
└─► P2: CMP-007 (completar)
```

### 3.4 Semanas 7-8: CI/CD + Tests + Deploy

```
SEMANA 7
═════════
│
├─► P1: INF-007 (CI/CD GitHub Actions)
│   └── Dependências: Nenhuma
│   └── Entrega: Pipeline de CI/CD
│
├─► P1: TST-002 (Testes E2E)
│   └── Dependências: CMP-002 (Fretboard done)
│   └── Entrega: 5 fluxos E2E
│
└─► P2: INF-008 (Deploy Vercel)
    └── Dependências: INF-007
    └── Entrega: App em produção

SEMANA 8
═════════
│
├─► Finalização de TODOS os blockers P0/P1
│
├─► Bug fixes e polishing
│
└─► 📦 RELEASE MVP
```

---

## 4. Matriz de Blocker/Dependência

```
LEGENDA:
[XXX] = Issue P0 (Crítico)
{XXX} = Issue P1 (Importante)
(XXX) = Issue P2 (Desejável)
<XXX> = Issue P3 (Pós-MVP)

DIAGRAMA DE DEPENDÊNCIAS:
═══════════════════════════════════════════════════════════════════════

                          ┌─────────────────┐
                          │   INF-005       │ ◄── P0 CRÍTICO
                          │  Supabase       │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │   CORE-001      │  │   TST-001       │  │   INF-007       │
    │ Music Theory    │  │ Testes Unitários│  │   CI/CD         │
    └────────┬────────┘  └─────────────────┘  └────────┬────────┘
             │                                            │
    ┌────────┼────────┐                                   │
    │        │        │                                   │
    ▼        ▼        ▼                                   ▼
┌───────┐┌───────┐┌───────┐                    ┌─────────────────┐
│CMP-004││CORE-003││CORE-002│                    │   TST-002       │
│ScaleDi││AudioEng││Instrum.│                    │  Testes E2E     │
└───┬───┘└───┬───┘└───┬───┘                    └─────────────────┘
    │        │        │                                   │
    │        │        │                                   │
    ▼        ▼        ▼                                   ▼
┌───────┐           ┌───────┐                    ┌─────────────────┐
│CMP-005│           │CMP-006│                    │   INF-008       │
│ScaleHe│           │ChordSe│                    │   Vercel Deploy │
└───┬───┘           └───────┘                    └─────────────────┘
    │
    ▼
┌───────┐
│CMP-007│ ◄── P2 (Metronome) - pode ser feito em paralelo
└───┬───┘
    │
    ▼
┌───────┐
│CMP-010│ ◄─ P3 (Exercise Player) - Pós-MVP
└───────┘
```

---

## 5. Critérios de Decisão

### 5.1 Quando Começar uma Issue?

| Se... | Então Priorize |
|-------|----------------|
| Todas as dependências estão **DONE** | Issue imediata |
| Dependências estão **IN PROGRESS** | Aguarde ou ajude |
| Dependências estão **BACKLOG** | Issue bloqueada |
| Issue tem **P0** e nenhuma dependência | Comece agora |

### 5.2 Prioridade por Fase

| Fase | Foco Principal |
|------|----------------|
| **Semanas 1-2** | Infraestrutura (P0) + Core (P0) |
| **Semanas 3-4** | Componentes Core (P0/P1) |
| **Semanas 5-6** | Educacional (P2) + Metronome (P2) |
| **Semanas 7-8** | CI/CD (P1) + Tests (P0/P1) + Deploy |

---

## 6. Esforço Estimado por Issue

### Escala de Esforço

| Código | Significado | Dias/Homem |
|--------|-------------|------------|
| **S** | Small | 1-2 dias |
| **M** | Medium | 3-5 dias |
| **L** | Large | 1-2 semanas |
| **XL** | Extra Large | 2+ semanas |

### Resumo de Esforço

| Prioridade | S | M | L | XL | Total |
|------------|---|---|---|---|-------|
| **P0** | 0 | 2 | 2 | 0 | **~10 dias** |
| **P1** | 1 | 3 | 1 | 0 | **~10 dias** |
| **P2** | 2 | 2 | 0 | 0 | **~6 dias** |
| **P3** | 0 | 0 | 3 | 0 | **~15 dias** |

---

## 7. Definition of Ready (DoR)

Uma issue está **READY** para desenvolvimento quando:

### Checklist Pré-Desenvolvimento

- [ ] Issue tem código (ex: CMP-004)
- [ ] Prioridade definida (P0/P1/P2/P3)
- [ ] Esforço estimado (S/M/L/XL)
- [ ] Dependências identificadas
- [ ] Critérios de aceitação claros
- [ ] Spec aprovada (se aplicável)
- [ ] Testes planejados

### Checklist Técnico

- [ ] Arquitetura revisada (se aplicável)
- [ ] API definida (se aplicável)
- [ ] Types TypeScript prontos
- [ ] Design aprovado (se aplicável)
- [ ] Testes de referência criados

---

## 8. Status Atual das Issues

### ✅ CONCLUÍDAS (3)

| ID | Task | Conclída em |
|----|------|-------------|
| CMP-001 | InfoButton Component | 24/10/2026 |
| CMP-002 | Fretboard Component | 24/10/2026 |
| CMP-003 | ChordDiagram Component | 24/10/2026 |

### 🔵 BACKLOG - P0 CRÍTICO (5)

| ID | Task | Esforço | Dependência |
|----|------|---------|-------------|
| INF-005 | Setup Supabase Free Tier | S | - |
| CORE-001 | Music Theory Engine | L | - |
| CORE-003 | AudioEngine | M | - |
| CMP-004 | ScaleDisplay | M | CORE-001 |
| TST-001 | Testes Unitários | M | - |

### 🟠 BACKLOG - P1 IMPORTANTE (5)

| ID | Task | Esforço | Dependência |
|----|------|---------|-------------|
| INF-007 | CI/CD GitHub Actions | M | - |
| CORE-002 | InstrumentRegistry | M | - |
| CMP-005 | ScaleHero | S | CMP-004 |
| CMP-006 | ChordSelector | M | CORE-001, CORE-002 |
| TST-002 | Testes E2E | M | CMP-002 |

### 🟡 BACKLOG - P2 DESEJÁVEL (5)

| ID | Task | Esforço | Dependência |
|----|------|---------|-------------|
| INF-008 | Deploy Vercel Free | S | INF-007 |
| CMP-007 | Metronome Component | M | - |
| CMP-009 | ChordCard | M | CMP-003, CMP-006 |
| EDU-001 | InfoButton Content DB | M | CMP-001 |
| EDU-002 | InfoContent: Ciclo Quintas | S | EDU-001 |

### 🟢 BACKLOG - P3 PÓS-MVP (4)

| ID | Task | Esforço | Dependência |
|----|------|---------|-------------|
| CMP-010 | Exercise Player | L | CMP-007 |
| CMP-011 | Guided Exercise | L | CMP-010 |
| EDU-003 | Gamification System | L | TST-001 |
| EDU-004 | Exercise Generator | L | CORE-001 |

---

## 9. Próximas Ações Imediatas

### 🎯 Comece por estas (na ordem):

```
1. INF-005 (Supabase Setup) — P0
   └─ Precisa ser feito primeiro para Auth + DB
   
2. CORE-001 (Music Theory Engine) — P0  
   └─ Base de toda a lógica musical
   
3. TST-001 (Testes Unitários) — P0
   └─ Deve acompanhar o desenvolvimento
   
4. CORE-003 (AudioEngine) — P0
   └─ Funcionalidade core do app
   
5. CORE-002 (InstrumentRegistry) — P1
   └─ Dependência de CMP-006
```

### 📋 Checklist para Iniciar:

```bash
# 1. Verificar issues disponíveis
gh issue list --state open --label "P0"

# 2. Criar branch para primeira issue
scripts\git-workflow.bat init INF-005

# 3. Desenvolver com testes desde o início
npm run test:watch
```

---

## 10. Métricas de Progresso

### Target da Fase 1 (MVP)

| Métrica | Target | Status |
|---------|--------|--------|
| Issues P0 concluídas | 5/5 | 0/5 ✅ |
| Issues P1 concluídas | 5/5 | 0/5 ✅ |
| Issues P2 concluídas | 3/5 | 0/5 ✅ |
| Coverage de testes | 80% | 0% |
| CI/CD funcionando | Sim | Não |
| Deploy em produção | Sim | Não |

---

*Documento atualizado em 24 de outubro de 2026*  
*Versão 1.0 — Issues Priorizadas e Organizadas*