# Estrutura do App — Tarefas

Status: **aprovado pelo usuário** ("pode fazer e depois eu avalio"). Executar uma por vez, nesta ordem. Cada tarefa só fica `[x]` depois de cumprir o "Pronto quer dizer" de `.kiro/steering/process.md`.

## Parte A — Layout de abas e conteúdo

- [x] **A0. Commit de segurança** do estado atual — PR #1 mesclado na `main`.
- [ ] **A1. Store de seleção** `lib/state/selection.ts` (tônica, escala, instrumento, persistido) com testes. — R6.3
- [ ] **A2. Layout da área logada** `src/app/app/layout.tsx` com `AppHeader`, `AppTabs`, `ScaleSelectionBar`, `AppFooter` no visual de referência; páginas das 5 abas vazias; `/app` redireciona para `/app/escalas`. — R6.1, R6.2, R6.3, R6.5
- [ ] **A3. Aba Escalas**: `ScaleHeroCard`, círculo de escalas, `IntervalTable`, `ScaleNotesPanel`, `PianoKeyboard` lendo o store e com os tokens do design. — R6.4
- [ ] **A4. Aba Braço**: `FretboardSection` lendo o store; a escolha de tônica sai da aba e passa à barra de seleção. — R6.4
- [ ] **A5. Aba Acordes**: `ChordFieldViewer` com tríades/tétrades. — R6.4
- [ ] **A6. Aba Ferramentas**: Metrônomo em cartão, Afinador, Ciclo de Quintas, Estruturas de Escalas. — R6.4
- [ ] **A7. Aba Exercícios**: mostra o catálogo atual até a spec `exercicios` ser executada. — R6.2
- [ ] **A8. Aprovação visual**: fotos de todas as abas para o usuário aprovar; ajustes pedidos entram aqui. — R6.6

## Parte B — Conta, login e páginas públicas

- [ ] **B1. Migração** `docs/migrations/002-estrutura-perfil.sql` (consentimento, planos novos, gatilho de perfil, RLS, `update_my_profile`) e passo a passo para o usuário aplicar no SQL Editor e configurar as URLs de retorno no Supabase. — R2.2, R4.1
- [ ] **B2. Traduções de erro** `lib/auth/errors.ts` com testes. — R2.4, R3.2, R3.3
- [ ] **B3. Middleware e callback**: `src/middleware.ts`, `src/app/auth/callback/route.ts`, validação do `next`, redirecionamentos de `/dashboard/*` e `/pricing`. — R3.1, R5
- [ ] **B4. Cadastro** com nome, aceite dos termos e consentimento de marketing. — R2
- [ ] **B5. Login, reenviar confirmação, recuperar e nova senha**; remover botões Google/GitHub. — R3
- [ ] **B6. Menu do usuário** no header (nome, plano, Minha conta, Planos, Sair). — R3.5, R4.2
- [ ] **B7. Minha conta**: trocar nome, senha e consentimento de marketing. — R7
- [ ] **B8. Usuário de teste e script de fotos logado** (`scripts/criar-usuario-teste.cjs`, `scripts/capturar-telas.cjs`). — verificação
- [ ] **B9. Landing page** em `/` com planos lidos do módulo de planos (enquanto a spec de planos não roda, os planos vêm de uma lista provisória no mesmo formato); fotos para aprovação. — R1
- [ ] **B10. Termos de Uso e Política de Privacidade** (LGPD), com os dados da empresa pendentes marcados. — R8

## Parte C — Limpeza

- [ ] **C1. Remover** o Estúdio provisório de `/` (já substituído pela landing), as páginas antigas com menu lateral de `/dashboard`, as demos e os componentes sem uso, depois do commit da parte B. — R9
