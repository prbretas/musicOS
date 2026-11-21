# Estrutura do App — Design

Status: **aprovado pelo usuário** ("pode fazer e depois eu avalio")

Atende: `requirements.md` desta spec (R1 a R9).

## 1. Visão geral

```
/                      landing page (pública)
/planos /termos /privacidade                      (públicas)
/login /signup /recuperar-senha /nova-senha       (públicas; logado é redirecionado ao app)
/auth/callback         troca o código do email do Supabase por sessão
/app/*                 área logada, layout de abas   ← middleware exige login
   escalas | braco | acordes | exercicios | ferramentas | conta
/dashboard/*, /pricing → redirecionam para /app/escalas e /planos
```

A área logada é um layout do App Router (`src/app/app/layout.tsx`) que desenha o header, as abas e a barra de seleção uma vez; cada aba é uma página. O visual vem de `referencia/layout-abas-page.tsx`.

## 2. Visual (tokens do layout aprovado)

Tirados do código de referência e usados em todas as abas:

| Elemento | Classes |
|---|---|
| Fundo da página | `min-h-screen bg-slate-900 text-white` |
| Header | `border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10`, conteúdo `max-w-5xl mx-auto px-6 py-4` |
| Logo | `text-2xl font-bold` "🎵 MusicOS" + subtítulo `text-slate-400 text-sm` |
| Abas | `px-5 py-2.5 text-sm font-medium rounded-t-lg`; ativa `bg-slate-700 text-white border border-b-0 border-slate-600`; inativa `text-slate-400 hover:text-slate-200` |
| Conteúdo | `max-w-5xl mx-auto px-6 py-8` |
| Cartão | `bg-slate-800 rounded-xl p-6`; título `text-lg font-semibold text-slate-200` |
| Botão de opção | normal `bg-slate-700 text-slate-300 hover:bg-slate-600`; escolhido `bg-purple-600 text-white`; tônica escolhida `bg-red-500 text-white` |
| Select | `bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm` |
| Texto secundário | `text-slate-400` / `text-slate-500 text-xs` |
| Rodapé | `border-t border-slate-800 py-4 text-center text-slate-600 text-xs` |

Os componentes de `components/estudio/` que hoje usam cores do MusicPages (`#1e1e1e`, `#24485a`, `#bccc00`, títulos com borda inferior) passam a usar esses tokens. O ciclo de quintas mantém o desenho de anéis que o usuário aprovou.

## 3. Componentes e arquivos

### Área logada

| Arquivo | Responsabilidade |
|---|---|
| `src/app/app/layout.tsx` | Monta `AppHeader`, `AppTabs`, `ScaleSelectionBar` (só em Escalas, Braço e Acordes) e `AppFooter` |
| `src/components/app-shell/AppHeader.tsx` | Logo, subtítulo, seletor de instrumento, `UserMenu` |
| `src/components/app-shell/UserMenu.tsx` | Nome, plano, links Minha conta e Planos, Sair |
| `src/components/app-shell/AppTabs.tsx` | Links das 5 abas; aba ativa pelo `usePathname()` |
| `src/components/app-shell/ScaleSelectionBar.tsx` | 12 botões de tônica e select de escala com os 4 grupos (24 escalas); cadeado nos itens bloqueados quando o módulo de planos existir |
| `src/lib/state/selection.ts` | Store (zustand + `persist`, chave `musicos:selecao`) com `rootPc`, `scaleKey`, `instrument` |
| `src/app/app/escalas/page.tsx` | `ScaleHeroCard`, `IntervalTable`, `ScaleNotesPanel`, `PianoKeyboard` |
| `src/app/app/braco/page.tsx` | `FretboardSection` |
| `src/app/app/acordes/page.tsx` | `ChordFieldViewer` com o seletor tríades/tétrades |
| `src/app/app/ferramentas/page.tsx` | Sub-abas: Metrônomo (`MetronomePanel` em cartão), Afinador (o atual de `/dashboard/tools`), Ciclo de Quintas, Estruturas de Escalas |
| `src/app/app/exercicios/page.tsx` | Catálogo (spec `exercicios`) |
| `src/app/app/conta/page.tsx` | Minha conta |

Hidratação do store: no servidor e no primeiro render o store usa os valores padrão (C, Maior, guitarra) e reidrata do `localStorage` no `useEffect`, evitando diferença entre servidor e navegador.

### Conta e login

| Arquivo | Responsabilidade |
|---|---|
| `src/middleware.ts` | Cria o cliente Supabase com os cookies da requisição; sem sessão em `/app/*` → `/login?next=<rota>`; com sessão em `/login` ou `/signup` → `/app/escalas`; também redireciona `/dashboard/*` e `/pricing` |
| `src/app/auth/callback/route.ts` | `exchangeCodeForSession(code)` e redireciona para `next` (`/login?confirmado=1` ou `/nova-senha`) |
| `src/lib/auth/errors.ts` | Traduz erros do Supabase (`user_already_exists`, `weak_password`, `invalid_credentials`, `email_not_confirmed`, `over_email_send_rate_limit`) para mensagens em português |
| `src/lib/auth/session.ts` | `getCurrentProfile()` no servidor: usuário + perfil (nome, plano) |
| `src/app/(auth)/signup/page.tsx` | Nome, email, senha (mín. 8), aceite dos termos (obrigatório), consentimento de marketing (desmarcado). `signUp` com `options.data = { full_name, marketing_opt_in }` e `emailRedirectTo = APP_URL/auth/callback?next=/login?confirmado=1` |
| `src/app/(auth)/login/page.tsx` | Email e senha, mensagens traduzidas, "Reenviar confirmação" (`auth.resend`), "Esqueci minha senha"; sem Google/GitHub |
| `src/app/(auth)/recuperar-senha/page.tsx` | `resetPasswordForEmail` com retorno em `/auth/callback?next=/nova-senha` |
| `src/app/(auth)/nova-senha/page.tsx` | `updateUser({ password })` |

As telas de conta usam o visual do app (fundo slate, cartão central).

### Públicas

| Arquivo | Responsabilidade |
|---|---|
| `src/app/page.tsx` | Landing: hero, 6 cartões de funcionalidades (textos da landing original do commit `3cd440e`, atualizados), planos (do módulo de planos), chamada final, rodapé |
| `src/app/planos/page.tsx` | Tela de planos (spec `planos-e-assinaturas`); até lá, a `/pricing` atual movida |
| `src/app/termos/page.tsx`, `src/app/privacidade/page.tsx` | Textos legais; dados da empresa como `[RAZÃO SOCIAL]`, `[CNPJ]`, `[EMAIL DE CONTATO]` |

## 4. Banco de dados

Migração `docs/migrations/002-estrutura-perfil.sql`, aplicada pelo usuário no SQL Editor do Supabase:

1. `alter table profiles add column if not exists marketing_opt_in boolean not null default false, add column if not exists marketing_opt_in_at timestamptz`.
2. Trocar a regra de `subscription_tier` para aceitar `free`, `plus`, `pro`, `vitalicio`, convertendo valores antigos (`premium` e `lifetime` viram `vitalicio`).
3. Função `handle_new_user()` (`security definer`) e gatilho `after insert on auth.users`, inserindo em `profiles` id, email, `full_name` e `marketing_opt_in` vindos de `raw_user_meta_data`, plano `free`.
4. RLS: o usuário lê o próprio perfil. Não pode dar `update` direto na tabela, para não conseguir mudar o próprio plano. Nome e consentimento mudam pela função `update_my_profile(p_full_name text, p_marketing boolean)`, `security definer`, que só altera essas colunas e a data do consentimento.

Configuração no painel do Supabase (feita pelo usuário, com passo a passo na tarefa): Site URL `http://localhost:3000` e Redirect URL `http://localhost:3000/auth/callback`; mais tarde, o domínio de produção.

## 5. Erros e casos-limite

- Supabase fora do ar no login: "Não foi possível entrar agora. Tente de novo em instantes."
- Perfil ainda não criado (gatilho atrasado): o header mostra o email e "Free" até o perfil existir.
- `next` do login só aceita caminhos internos que comecem com `/app` (evita redirecionamento para outro site).
- Sessão expirada no meio do uso: o middleware leva ao login na próxima navegação e volta à mesma aba.

## 6. Testes e verificação

- Unitários: `lib/auth/errors.ts` (todas as traduções), `lib/state/selection.ts` (padrões e persistência), validação do `next`.
- Visual: o script `src/app-MusicOS/scripts/capturar-telas.cjs` (Playwright, `channel: 'chrome'`) entra com o usuário de teste (`E2E_EMAIL`, `E2E_PASSWORD` no `.env.local`), fotografa cada aba, a landing e as telas de conta, e lista os erros do console. As fotos vão para aprovação do usuário (R6.6).
- Usuário de teste criado por `scripts/criar-usuario-teste.cjs`, com a chave de servidor, já confirmado.

## 7. Decisões

| Decisão | Motivo |
|---|---|
| Área logada em `/app/*`, não `/dashboard/*` | Endereços em português e separação clara da landing; `/dashboard` redireciona |
| Abas como páginas, não estado da tela | Endereço próprio, botão voltar do navegador, links diretos nos emails |
| Store zustand com `persist` | Já está nas dependências; a seleção vale entre abas e ao recarregar |
| Plano alterado só por função no servidor | O usuário não pode se dar o plano Pro pelo navegador |
