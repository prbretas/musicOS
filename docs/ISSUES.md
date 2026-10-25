# MusicOS — Issues de Desenvolvimento

> **Versão:** 2.0  
> **Data:** 24 de outubro de 2026  
> **Status:** 🚧 Fase 1 — MVP  
> **Doc Relacionado:** ISSUES-PRIORITY.md (detalhado)

---

## Resumo Rápido

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRÓXIMAS A FAZER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 P0 — CRÍTICO (Sem isso não lança):                          │
│  ├── INF-005: Supabase Setup         [S] - Sem dependência      │
│  ├── CORE-001: Music Theory Engine   [L] - Sem dependência      │
│  ├── CORE-003: AudioEngine           [M] - Sem dependência      │
│  ├── CMP-004: ScaleDisplay           [M] - Depende: CORE-001    │
│  └── TST-001: Testes Unitários       [M] - Depende: CORE-001    │
│                                                                 │
│  🟠 P1 — IMPORTANTE:                                            │
│  ├── INF-007: CI/CD GitHub Actions   [M] - Sem dependência      │
│  ├── CORE-002: InstrumentRegistry    [M] - Sem dependência      │
│  ├── CMP-005: ScaleHero              [S] - Depende: CMP-004     │
│  ├── CMP-006: ChordSelector          [M] - Depende: CORE-001,002│
│  └── TST-002: Testes E2E             [M] - Depende: CMP-002     │
│                                                                 │
│  🟢 VER TUDO: docs/ISSUES-PRIORITY.md                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Legenda

### Status

| Badge | Significado |
|-------|-------------|
| 🔵 backlog | Aguardando início |
| 🟡 spec | Spec aguardando implementação |
| 🟠 in progress | Em desenvolvimento |
| 🟢 done | Implementado e testado |
| ⛔ blocked | Bloqueado por dependência |

### Prioridade

| Prioridade | Significado |
|------------|-------------|
| **P0** | Crítico — Sem isso o MVP não lança |
| **P1** | Importante — Altamente recomendável |
| **P2** | Desejável — Pode ser adiado para v2 |
| **P3** | Pós-MVP — Melhorias e diferenciais |

### Esforço

| Código | Significado | Dias |
|--------|-------------|------|
| **S** | Small | 1-2 |
| **M** | Medium | 3-5 |
| **L** | Large | 1-2 semanas |
| **XL** | Extra Large | 2+ semanas |

---

## Issues por Prioridade

### 🔴 P0 — CRÍTICO (Bloqueadores do MVP)

| ID | Task | Esforço | Dependências | Status |
|----|------|---------|--------------|--------|
| **INF-005** | Setup Supabase Free Tier | **S** | Nenhuma | 🔵 backlog |
| **CORE-001** | Music Theory Engine | **L** | Nenhuma | 🔵 backlog |
| **CORE-003** | AudioEngine | **M** | Nenhuma | 🔵 backlog |
| **CMP-004** | ScaleDisplay | **M** | CORE-001 | 🔵 backlog |
| **TST-001** | Testes Unitários | **M** | CORE-001 | 🔵 backlog |

**Total P0:** 5 issues | **Esforço:** ~10 dias

### 🟠 P1 — IMPORTANTE

| ID | Task | Esforço | Dependências | Status |
|----|------|---------|--------------|--------|
| **INF-007** | CI/CD GitHub Actions | **M** | Nenhuma | 🔵 backlog |
| **CORE-002** | InstrumentRegistry | **M** | Nenhuma | 🔵 backlog |
| **CMP-005** | ScaleHero | **S** | CMP-004 | 🔵 backlog |
| **CMP-006** | ChordSelector | **M** | CORE-001, CORE-002 | 🔵 backlog |
| **TST-002** | Testes E2E | **M** | CMP-002 (done) | 🔵 backlog |

**Total P1:** 5 issues | **Esforço:** ~10 dias

### 🟡 P2 — DESEJÁVEL

| ID | Task | Esforço | Dependências | Status |
|----|------|---------|--------------|--------|
| INF-008 | Deploy Vercel Free | S | INF-007 | 🔵 backlog |
| CMP-007 | Metronome Component | M | Nenhuma | 🔵 backlog |
| CMP-009 | ChordCard | M | CMP-003, CMP-006 | 🔵 backlog |
| EDU-001 | InfoButton Content DB | M | CMP-001 (done) | 🔵 backlog |
| EDU-002 | InfoContent: Ciclo Quintas | S | EDU-001 | 🔵 backlog |

**Total P2:** 5 issues | **Esforço:** ~6 dias

### 🟢 P3 — PÓS-MVP

| ID | Task | Esforço | Dependências | Status |
|----|------|---------|--------------|--------|
| CMP-010 | Exercise Player | L | CMP-007 | 🔵 backlog |
| CMP-011 | Guided Exercise | L | CMP-010 | 🔵 backlog |
| EDU-003 | Gamification System | L | TST-001 | 🔵 backlog |
| EDU-004 | Exercise Generator | L | CORE-001 | 🔵 backlog |

**Total P3:** 4 issues | **Esforço:** ~15 dias

---

## ✅ Já Feitas (3)

| ID | Task | Concluída em |
|----|------|--------------|
| CMP-001 | InfoButton Component | 24/10/2026 |
| CMP-002 | Fretboard Component | 24/10/2026 |
| CMP-003 | ChordDiagram Component | 24/10/2026 |

---

## Mapa de Dependências

```
                    ┌─────────────────┐
                    │   INF-005       │ ◄─ P0 (Supabase)
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   CORE-001      │ │   TST-001       │ │   INF-007       │ ◄─ P1 (CI/CD)
    │ Music Theory    │ │ Testes Unitários│ │ CI/CD GitHub    │
    └────────┬────────┘ └─────────────────┘ └────────┬────────┘
             │                                        │
    ┌────────┼────────┐                               │
    │        │        │                               │
    ▼        ▼        ▼                               ▼
┌───────┐┌───────┐┌───────┐               ┌─────────────────┐
│CMP-004││CORE-003││CORE-002│               │   TST-002       │ ◄─ P1 (E2E)
│ScaleDi││AudioEng││Instrum.│               │  Testes E2E     │
└───┬───┘└───┬───┘└───┬───┘               └─────────────────┘
    │        │        │
    │        │        │
    ▼        ▼        ▼
┌───────┐           ┌───────┐
│CMP-005│           │CMP-006│ ◄─ P1 (ChordSelector)
│ScaleHe│           │ChordSe│
└───────┘           └───────┘
```

---

## Como Trabalhar com Issues

### 1. Escolher uma Issue

```bash
# Ver P0 (crítico)
gh issue list --state open --label "P0"

# Ver todas
gh issue list --state open
```

### 2. Criar Branch

```bash
scripts\git-workflow.bat init INF-005
```

### 3. Desenvolver com Testes

```bash
npm run test:watch
```

### 4. Commitar

```bash
scripts\git-workflow.bat commit "feat(INF-005): setup supabase"
```

---

## Próximos Passos Imediatos

1. **Ver detalhes completos:** `docs/ISSUES-PRIORITY.md`
2. **Escolher issue:** Comece por INF-005 (Supabase) ou CORE-001 (Theory)
3. **Iniciar desenvolvimento:** `scripts\git-workflow.bat init <ISSUE>`

---

## Contagem Total

| Prioridade | Qtd | Esforço Total |
|------------|-----|---------------|
| 🔴 P0 | 5 | ~10 dias |
| 🟠 P1 | 5 | ~10 dias |
| 🟡 P2 | 5 | ~6 dias |
| 🟢 P3 | 4 | ~15 dias |
| ✅ Done | 3 | Feito |
| **TOTAL** | **22** | **~41 dias** |

---

*Documento atualizado em 24 de outubro de 2026*  
*Versão 2.0 — Com Priorização*