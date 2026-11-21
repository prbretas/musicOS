---
inclusion: always
---

# MusicOS — Tecnologia

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 14.0.4 (App Router), React 18, TypeScript 5 (strict) |
| Estilo | Tailwind CSS 3.4, tema escuro (`<html class="dark">`), paleta slate |
| Banco e login | Supabase (PostgreSQL + Auth), `@supabase/ssr` |
| Pagamento | Stripe (checkout, webhooks) |
| Áudio | Web Audio API via `src/lib/audio/synth.ts` |
| Testes | Vitest + jsdom (unitários), Playwright com `channel: 'chrome'` (verificação visual) |

O app fica em `src/app-MusicOS`. Variáveis de ambiente em `src/app-MusicOS/.env.local` (modelo em `.env.local.example`). Nunca colocar chaves no código nem em logs. A `SUPABASE_SERVICE_ROLE_KEY` e a `STRIPE_SECRET_KEY` só podem ser usadas no servidor.

## Regras de código

- Lógica musical em funções puras em `src/lib/music/` (sem React), com teste em `src/__tests__/lib/music/`.
- Notas internas em sustenido (`C#`) para cálculo; exibição com a grafia correta da escala (`lib/music/escalas.ts`, `noteNameIn`).
- Som só por `lib/audio/synth.ts`. O AudioContext é criado no primeiro clique do usuário.
- SVG com coordenadas arredondadas (2 casas) para não gerar erro de hidratação.
- Componentes de tela em `src/components/`; páginas em `src/app/`.
- O que cada plano libera vem de um único lugar (`lib/plans.ts`). Nenhuma tela decide plano por conta própria.
- Acesso ao banco com RLS ligado; o usuário só lê e escreve os próprios dados.

## Comandos (rodar em `src/app-MusicOS`)

| Ação | Comando |
|---|---|
| Subir o sistema | `npm run dev` (porta 3000) ou `INICIAR-MUSICOS.bat` na raiz |
| Testes | `npx vitest run` ou `RODAR-TESTES.bat` na raiz |
| Tipos | `npx tsc --noEmit -p tsconfig.json` |

O Playwright não tem navegador baixado nesta máquina; usar `chromium.launch({ channel: 'chrome' })`. O Edge fecha ao abrir por política da máquina.

## Problemas conhecidos

- 119 de 221 testes falham (testes antigos de componentes e configuração: `React is not defined`, `jest is not defined`). Tratados na spec `qualidade-e-testes` quando ela existir.
- Código duplicado sem uso: dois AudioEngines (`lib/audio/AudioEngine.ts`, `lib/audio/core/`), dois registros de instrumentos (`lib/instruments`, `lib/music/instruments`), motor `lib/music-theory/` usado só por testes. Não usar em código novo.
- Nenhuma rota é protegida por login (não há `middleware.ts`).
- O cadastro não cria o registro em `profiles`.
