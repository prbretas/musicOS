# MusicOS — Contexto e Decisões de Projeto

> **Data da Sessão:** 23 de outubro de 2026  
> **Status:** Documento vivo — atualizar conforme evoluir  
> **Propósito:** Contextualizar o agente Kiro para sessões futuras

---

## 1. Contexto do Projeto

### 1.1 O Que É o MusicOS

MusicOS é uma plataforma educacional de música que evolui do projeto open-source **musicpages**. O objetivo é criar uma solução all-in-one que combina:

- **Teoria Musical:** Escalas, modos, campo harmônico
- **Prática Instrumental:** Fretboard interativo, acordes, metrônomo, afinador
- **Educação Contextual:** Sistema único de ajuda com botão "i" em cada seção
- **Exercícios:** Gerador inteligente de exercícios e prática guiada
- **Monetização:** Modelo freemium sustentável (R$9,90/mês)

### 1.2 O Diferencial Principal: Educação Contextual

Diferente de concorrentes, o MusicOS oferece **explicações no momento certo**. Cada seção tem um botão "i" que exibe:

- Explicação do conceito
- Exemplos práticos
- Dicas de execução
- Conexões com outros conceitos

### 1.3 Base de Referência (musicpages)

O projeto **musicpages** (em `src/musicpages/`) contém:
- Transpositor de escalas musicais
- Visualização de fretboard interativa
- Campo harmônico com acordes
- Múltiplos instrumentos (guitarra, ukulele, baixo)
- Afinações customizadas
- Áudio engine com Web Audio API
- ~4.000 linhas de código JavaScript legível

**Diretriz:** O musicpages é apenas referência. Todo desenvolvimento novo deve ser em `src/app-MusicOS/`.

---

## 2. Decisões Estratégicas Tomadas

### 2.1 Formato do Produto

| Decisão | Escolhido | Justificativa |
|---------|-----------|---------------|
| **PWA vs App Nativo** | PWA | Zero custo inicial, multiplataforma, sem taxa Google |
| **Stack Principal** | Next.js 15 + Supabase Free | Produtividade, TypeScript, auth integrado |
| **Automação** | Next.js API Routes (sem N8N) | Zero custo, webhook direto |
| **AI Assistant** | Adiado para fase 3+ | Reduzir custos iniciais |

### 2.2 Precificação Aprovada

| Tier | Preço | Período |
|------|-------|---------|
| **Free** | R$0 | Forever |
| **Pro** | **R$9,90** | Mensal |
| **Lifetime** | **R$197** | Pagamento único |

### 2.3 Diferenciais Competitivos

O MusicOS é o **único app que integra:**

1. ✅ Teoria musical completa
2. ✅ Ferramentas práticas (fretboard, acordes, metrônomo, afinador)
3. ✅ **Educação contextual** (botão "i" em cada seção)
4. ✅ **Gerador de exercícios** (escalas, progressões, técnicas)
5. ✅ **Exercícios guiados** com metrônomo
6. ⏳ AI Assistant (futuro)
7. ✅ Preço acessível (R$9,90 vs R$29-89 dos concorrentes)

---

## 3. Sistema Educacional

### 3.1 Pilares Educacionais

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PILARES EDUCACIONAIS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. EDUCAÇÃO CONTEXTUAL                                           │
│      └── Botão "i" em cada seção                                   │
│      └── Explicações aparecem quando relevantes                    │
│                                                                     │
│   2. EXERCÍCIOS PROGRESSIVOS                                        │
│      └── Do fácil ao difícil                                       │
│      └── Exercícios guiados com metrônomo                          │
│                                                                     │
│   3. TÉCNICAS INSTRUMENTAIS                                         │
│      └── Tapping, hammer-on, pull-offs, bends, two-hands           │
│      └── Demonstrações visuais                                     │
│      └── Exercícios específicos por técnica                        │
│                                                                     │
│   4. GERAÇÃO INTELIGENTE                                           │
│      └── Exercícios baseados no contexto do usuário                │
│      └── Sequências de acordes na tonalidade ativa                 │
│      └── Licks no estilo do usuário                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Info Button

Cada seção educacional tem um botão "i":

```tsx
// Exemplo de uso
<div className="section-header">
  <h2>Ciclo de Quintas</h2>
  <InfoButton 
    title="O Que é o Ciclo de Quintas?"
    content={circleOfFifthsContent}
  />
</div>
```

### 3.3 Tipos de Exercícios

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| **Escalas** | Padrões de escala progressivos | C Major posições 1-5 |
| **Acordes** | Progressões para prática | I-IV-V-I, ii-V-I |
| **Técnicas** | Exercícios específicos | Tapping, hammer-on, bends |
| **Licks** | Frases musicais style-based | Blues lick, Jazz line |
| **Guiados** | Com metrônomo e feedback visual | Todos os exercícios |

---

## 4. Arquitetura de Custo Zero (MVP)

### 4.1 Stack Tecnológica Gratuita

| Serviço | Provider | Plano | Custo |
|---------|----------|-------|-------|
| **Frontend** | Vercel | Free | R$0 |
| **Database + Auth** | Supabase | Free | R$0 |
| **Email** | Resend | Free | R$0 |
| **Analytics** | PostHog | Free | R$0 |
| **Monitoring** | Sentry | Free | R$0 |
| **CI/CD** | GitHub Actions | Free | R$0 |
| **Domínio** | Namecheap | .app | R$50/ano |

**Custo Mensal do MVP:** R$4 (só o domínio)

### 4.2 Sem N8N no MVP

| Funcionalidade | Abordagem |
|----------------|-----------|
| Webhooks Stripe | Next.js API Routes (`/api/webhooks/stripe`) |
| Emails transacionais | Resend API direto |
| Automation | Conditional logic no código |

---

## 5. Componentes Educacionais Novos

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

## 6. Features por Fase

### Fase 1 — MVP (Meses 1-3) — Custo Zero

**Educacional:**
- [ ] InfoButton component
- [ ] 5 textos educacionais básicos
- [ ] 5 exercícios de escalas básicos
- [ ] 4 progressões de acordes básicas

**Técnico:**
- [ ] Infraestrutura Next.js + Supabase Free
- [ ] Auth (email + Google)
- [ ] Landing page + Stripe Checkout
- [ ] Sistema de escalas core (5 tônicas)
- [ ] Fretboard interativo (guitarra 6 cordas)
- [ ] Campo harmônico + acordes
- [ ] Audio engine
- [ ] Metrônomo básico
- [ ] LocalStorage manager (50MB)
- [ ] PWA setup

### Fase 2 — Pro Launch (Meses 4-5)

**Educacional:**
- [ ] InfoButton completo (todas as seções)
- [ ] Content Database expandido (20+ textos)
- [ ] 10+ progressões de acordes
- [ ] Gerador de exercícios básico

### Fase 3 — Expansão (Meses 6-9)

**Educacional:**
- [ ] Técnicas instrumentais completas (Tapping, Hammer-on, Bends, Two-Hands)
- [ ] Exercícios guiados com metrônomo
- [ ] Gerador de Licks (Blues, Jazz, Rock)
- [ ] Sistema de gamificação (conquistas, streaks)
- [ ] Ear training
- [ ] AI Assistant (avaliação: Ollama vs OpenAI)

---

## 7. Personas Alvo

| Persona | Dor | Solução |
|---------|-----|---------|
| **Iniciante** | Apps caros, não sabe teoria | Educação contextual + R$9,90 |
| **Intermediário** | Ferramentas fragmentadas | Integração total + exercícios |
| **Estudante** | Orçamento limitado | Mais barato do mercado |
| **Auto-didata** | Falta de direction | Sistema de progressão guiado |

---

## 8. Referências Importantes

### 8.1 Documentos do Projeto

| Documento | Caminho | Propósito |
|-----------|---------|-----------|
| **SPEC** | `docs/MUSICOS-SPEC.md` | Visão geral do produto |
| **ISSUES** | `docs/issues.md` | Tasks organizadas por fase |
| **ARCHITECTURE** | `docs/ARCHITECTURE.md` | Auth, RBAC, integração |
| **FINANCIAL** | `docs/FINANCIAL.md` | Custos, pricing, projeções |
| **COMPETITIVE** | `docs/COMPETITIVE.md` | Análise de mercado |
| **EDUCATIONAL** | `docs/EDUCATIONAL.md` | Sistema educacional completo |
| **PROMPTS** | `docs/PROMPTS.md` | Este documento |

### 8.2 Código de Referência

| Arquivo | Caminho | O Que Contém |
|---------|---------|--------------|
| `script-escalas.js` | `src/musicpages/scripts/` | Engine de escalas |
| `script-fretboard.js` | `src/musicpages/scripts/` | Fretboard renderer |
| `script-audio-engine.js` | `src/musicpages/scripts/` | Web Audio API |
| `script-chord-diagrams.js` | `src/musicpages/scripts/` | SVG chord diagrams |

---

## 9. Resumo para o Agente

### 9.1 O Que Já Está Decidido

- **Formato:** PWA com Next.js + Supabase Free
- **Pricing:** Free R$0 | Pro R$9,90/mês | Lifetime R$197
- **Custo MVP:** R$4/mês (só domínio)
- **AI:** Adiado para fase 3+
- **Storage:** LocalStorage apenas (sem cloud)
- **Automação:** Next.js API Routes (sem N8N)
- **Diferencial:** Educação contextual + exercícios
- **Pasta:** `src/app-MusicOS/`

### 9.2 Sistema Educacional Inclui

- **InfoButton** em todas as seções principais
- **Banco de textos** educacionais contextualizados
- **Exercícios de:** escalas, progressões, técnicas, licks
- **Player guiado** com metrônomo e feedback visual
- **Sistema de progressão** e gamificação

### 9.3 Como Começar uma Sessão

1. **Ler `docs/PROMPTS.md`** para contexto
2. **Consultar `docs/EDUCATIONAL.md`** para detalhamento educacional
3. **Consultar `docs/issues.md`** para tasks disponíveis
4. **Escolher uma task** da Fase 1 ou 2
5. **Criar branch** `feature/descricao-curta`
6. **Desenvolver** seguindo a arquitetura definida
7. **Testar** e commitar

### 9.4 Padrões de Código

- **Linguagem:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`, `edu:`)
- **Tests:** Vitest para unit tests, Playwright para E2E

---

*Documento atualizado em 23 de outubro de 2026*  
*Versão 1.2 — Com Sistema Educacional Completo*