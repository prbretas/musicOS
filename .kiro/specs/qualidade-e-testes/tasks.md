# Qualidade e Testes — Tarefas

Status: **aprovado pelo usuário**. As tarefas Q1 a Q4 vêm logo depois do commit de segurança (A0), para todos os PRs seguintes terem CI útil. Os E2E de cada fluxo (Q5 em diante) entram junto com a funcionalidade, na mesma branch.

- [x] **Q1. Configuração do Vitest**: `include`/`exclude`, `jsx: 'automatic'`, E2E fora do Vitest, comparadores do jest-dom, tipos no `tsconfig`. — R1.3
- [x] **Q2. Triagem dos testes que falham**: corrigidos ou removidos com o código duplicado (`lib/music-theory`, `lib/instruments`, `lib/audio/core|effects|integration|types`, `lib/audio/AudioEngine.ts`, landing antiga); `npx vitest run`: 193 de 193. — R1.1, R1.2
- [x] **Q3. Build sem chaves reais**: Stripe criado só na chamada da rota (`lib/stripe/server.ts`); `.eslintrc.json`; `npm run build`, `npm run lint` e `tsc` passando. — R4.1
- [x] **Q4. CI**: jobs unit, lint e tipos, build e e2e; deploy desligado; Secrets opcionais com valores de exemplo. — R4
- [x] **Q5. Base do Playwright**: `playwright.config.ts` (desktop e celular), fixture que reprova erro no console, aquecimento das rotas, `src/e2e/` antigo substituído por `e2e/estudio.spec.ts`. Os utilitários de usuário de teste (`support/admin.ts`) entram na Q7, junto com o login. — R5.2
- [ ] **Q6. E2E das abas** (junto com a parte A da estrutura). — R2.5
- [ ] **Q7. E2E de visitante, cadastro, login, senha e sair** (junto com a parte B), com `support/admin.ts` (criar, confirmar, gerar link e apagar usuários de teste) e limpeza no fim. — R2.1–R2.4, R2.8, R3
- [ ] **Q8. E2E de planos** (junto com a parte 1 de planos). — R2.6
- [ ] **Q9. E2E de exercícios** (junto com a spec de exercícios). — R2.7
- [x] **Q10. `RODAR-TESTES.bat`** com a opção de rodar os E2E. — R5.1
