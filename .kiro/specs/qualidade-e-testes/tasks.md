# Qualidade e Testes — Tarefas

Status: **aprovado pelo usuário**. As tarefas Q1 a Q4 vêm logo depois do commit de segurança (A0), para todos os PRs seguintes terem CI útil. Os E2E de cada fluxo (Q5 em diante) entram junto com a funcionalidade, na mesma branch.

- [ ] **Q1. Configuração do Vitest**: `include`/`exclude`, `jsx: 'automatic'`, E2E fora do Vitest. — R1.3
- [ ] **Q2. Triagem dos testes que falham**: corrigir ou remover com o código duplicado; `npx vitest run` sem falhas. — R1.1, R1.2
- [ ] **Q3. Build sem chaves reais**: Stripe criado só na chamada da rota; `npm run build` e `npm run lint` passando. — R4.1
- [ ] **Q4. CI**: jobs unit, lint, build e e2e; deploy desligado; lista de Secrets para o usuário cadastrar. — R4
- [ ] **Q5. Base do Playwright**: `playwright.config.ts`, `support/admin.ts`, fixtures, verificação de erros do console, limpeza; substituir `src/e2e/`. — R3, R5.2
- [ ] **Q6. E2E das abas** (junto com a parte A da estrutura). — R2.5
- [ ] **Q7. E2E de visitante, cadastro, login, senha e sair** (junto com a parte B). — R2.1–R2.4, R2.8
- [ ] **Q8. E2E de planos** (junto com a parte 1 de planos). — R2.6
- [ ] **Q9. E2E de exercícios** (junto com a spec de exercícios). — R2.7
- [ ] **Q10. `RODAR-TESTES.bat`** com a opção de rodar os E2E. — R5.1
