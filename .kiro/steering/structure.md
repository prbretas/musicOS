---
inclusion: always
---

# MusicOS — Estrutura

## Pastas

```
MusicPages-AI-Eng/
├── .kiro/steering/          regras do projeto (este arquivo, product, tech, process)
├── .kiro/specs/<feature>/   requirements.md, design.md, tasks.md de cada funcionalidade
├── src/app-MusicOS/         o produto (Next.js)
│   ├── src/app/             rotas (páginas e API)
│   ├── src/components/      componentes de tela
│   │   └── estudio/         seções de escala, campo, teclado, braço, acordes, ciclo, metrônomo
│   ├── src/lib/music/       teoria musical pura: escalas.ts, caged.ts, theory.ts, chord-shapes.ts, scale-info.ts
│   ├── src/lib/audio/       synth.ts (som)
│   ├── src/lib/supabase/    client.ts (navegador), server.ts (servidor)
│   └── src/__tests__/       testes Vitest
├── src/musicpages/          projeto original (fonte de funcionalidades e dados; não é o produto)
├── docs/                    documentação antiga e referência; supabase-migration.sql
├── INICIAR-MUSICOS.bat      sobe o sistema
└── RODAR-TESTES.bat         roda os testes
```

## Rotas atuais

| Rota | Conteúdo |
|---|---|
| `/` | Estúdio de escalas (provisório; a spec `estrutura-do-app` move para a área logada e devolve a landing page) |
| `/login`, `/signup` | Entrar e criar conta |
| `/pricing` | Planos |
| `/dashboard` e `/dashboard/{scales,chords,tools,exercises}` | Área do app com menu lateral |
| `/dashboard/instruments/demo`, `/dashboard/scales/demo` | Demos antigas (a remover) |
| `/api/stripe/checkout`, `/api/webhooks/stripe` | Pagamento |

## Fonte da verdade

1. `.kiro/steering/` e `.kiro/specs/` valem sobre qualquer outro documento.
2. Os arquivos em `docs/` e `src/app-MusicOS/docs/` são referência histórica. `docs/ISSUES*.md` está desatualizado.
3. Banco: `docs/supabase-migration.sql` (já aplicado no projeto Supabase `tdoyplvpwznfbgndnhlf`).

## Rotas planejadas (spec `estrutura-do-app`)

| Rota | Conteúdo | Acesso |
|---|---|---|
| `/` | Landing page | público |
| `/planos`, `/termos`, `/privacidade` | Planos e páginas legais | público |
| `/login`, `/signup`, `/recuperar-senha`, `/nova-senha`, `/auth/callback` | Conta | público |
| `/app/escalas`, `/app/braco`, `/app/acordes`, `/app/exercicios`, `/app/ferramentas` | Abas do app | logado |
| `/app/exercicios/[id]`, `/app/conta` | Exercício e Minha conta | logado |

## Specs e ordem de execução

| Ordem | Spec / parte | Assunto | Situação |
|---|---|---|---|
| 0 | `estrutura-do-app` A0 | Commit de segurança, branch, PR e merge | aprovado |
| 1 | `qualidade-e-testes` Q1–Q5 | Testes unitários verdes, CI, base do Playwright | aprovado |
| 2 | `estrutura-do-app` parte A (+ Q6) | Layout de abas e conteúdo das abas | aprovado |
| 3 | `estrutura-do-app` parte B (+ Q7) | Login obrigatório, perfil, landing, termos | aprovado |
| 4 | `planos-e-assinaturas` parte 1 (+ Q8) | Módulo de planos e bloqueios (sem pagamento) | requisitos aprovados; falta design |
| 5 | `exercicios` (+ Q9) | Auditivo, escalas guiadas, progressões, ritmo, progresso | aprovado |
| 6 | `planos-e-assinaturas` parte 2 | Pagamento (cartão, Pix, boleto) | depende do provedor e da conta |
| depois | `emails-e-engajamento`, publicação na Vercel | Lembretes e email marketing; deploy | a escrever |
