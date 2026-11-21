# Qualidade e Testes — Design

Status: **aprovado pelo usuário** (delegado: "pode fazer e depois eu avalio")

## 1. Testes unitários (Vitest)

- `vitest.config.ts`: `include: ['src/__tests__/**/*.test.{ts,tsx}', 'src/__integration__/**/*.test.{ts,tsx}']`, `exclude: ['e2e/**', 'src/e2e/**']`, `esbuild: { jsx: 'automatic' }` (resolve o `React is not defined`), ambiente `jsdom`, setup `src/test/setup.ts`.
- Triagem dos 119 testes que falham, um arquivo por vez:
  - testes de componentes reescritos (`ChordDiagram`, `Fretboard`, `ScaleDisplay`, `InfoButton`) → reescrever para o comportamento atual;
  - `jest.fn` → `vi.fn`;
  - testes de código duplicado e sem uso (`lib/music-theory/`, `lib/instruments/`, `lib/audio/AudioEngine.ts`, `lib/audio/core/`) → remover junto com o código, listando no PR;
  - `__tests__/supabase/setup.test.ts` → não pode depender de rede; usar mock.

## 2. Testes E2E (Playwright)

```
src/app-MusicOS/e2e/
  playwright.config.ts   (na raiz do app; webServer = npm run dev; baseURL http://localhost:3000)
  support/admin.ts       criar, confirmar, gerar link e apagar usuários; mudar plano (chave de servidor)
  support/fixtures.ts    fixture `usuario` (Free) e `usuarioPro`, já logados via tela de login
  visitante.spec.ts  cadastro.spec.ts  login.spec.ts  senha.spec.ts
  abas.spec.ts  planos.spec.ts  exercicios.spec.ts  sair.spec.ts
```

- Links de confirmação e de nova senha: `auth.admin.generateLink({ type: 'signup' | 'recovery' })`; o teste abre o link no navegador, passando pelo `/auth/callback` real.
- Limpeza: `globalTeardown` apaga todos os usuários `e2e+…@musicos.test` criados na execução.
- Semente dos exercícios: `?seed=<n>` aceito só quando `process.env.NEXT_PUBLIC_E2E === '1'` (definido no `webServer` dos testes, nunca no build de produção).
- Seletores por papel e texto (`getByRole`, `getByText`); `data-testid` só onde não houver texto estável (cursor do ritmo, casas do braço).
- Erros do console: um fixture falha o teste se a página registrar `pageerror` ou `console.error`.
- `channel`: `process.env.CI ? undefined : 'chrome'`.
- Os 4 arquivos antigos de `src/e2e/` são substituídos por estes.

## 3. CI (`.github/workflows/test.yml`)

| Job | O que faz |
|---|---|
| `unit` | `npm ci` e `npx vitest run` |
| `lint` | `npm run lint` |
| `build` | `npm run build` com variáveis de exemplo (o build não pode depender de chaves reais; o Stripe passa a ser criado só quando a rota é chamada) |
| `e2e` | `npx playwright install --with-deps chromium`, `npx playwright test`, relatório salvo como artefato |
| `deploy` | removido até a spec de publicação |

Secrets no GitHub (o usuário cadastra): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, do projeto de testes.

## 4. Local

- `RODAR-TESTES.bat`: roda o Vitest; pergunta se quer rodar os E2E e, se sim, roda `npx playwright test`.
