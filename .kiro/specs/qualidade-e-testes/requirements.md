# Qualidade e Testes — Requisitos

Status: **aprovado pelo usuário** (pedido direto: testes E2E de todos os fluxos e CI funcionando no GitHub)

## Introdução

Hoje 119 de 221 testes unitários falham, o CI do GitHub (`.github/workflows/test.yml`) fica vermelho em todo PR, os testes E2E em `src/e2e` são antigos e não rodam, e o job de deploy tenta publicar na Vercel sem as chaves configuradas. Esta spec deixa os testes confiáveis e cria testes E2E que provam que os fluxos do usuário funcionam de ponta a ponta.

## Requisitos

### Requisito 1 — Testes unitários confiáveis

1. `npx vitest run` DEVE terminar sem falhas.
2. Cada teste que falha hoje DEVE ser corrigido ou, se testa código que não existe mais ou duplicado (ver `tech.md`), removido junto com esse código. Cada remoção fica registrada no PR.
3. Os testes E2E (Playwright) NÃO DEVEM rodar no Vitest.

### Requisito 2 — Testes E2E dos fluxos

O SISTEMA DEVE ter testes E2E (Playwright, navegador real) para cada fluxo, entregues junto com a funcionalidade:

1. **Visitante:** abre a landing, vê os planos, e ao tentar abrir `/app/escalas` é levado ao login.
2. **Cadastro:** preenche o cadastro, vê a mensagem de confirmação, abre o link de confirmação e entra no app.
3. **Login:** senha errada mostra "Email ou senha incorretos"; senha certa abre o app; depois de entrar, volta à página que tinha pedido.
4. **Senha:** "Esqueci minha senha" → link → nova senha → entra com a nova senha.
5. **Abas:** as 5 abas abrem sem erro no console; tônica e escala escolhidas continuam ao trocar de aba e ao recarregar; no braço, o Sol (G) da corda 1 fica na casa 3.
6. **Planos:** usuário Free vê cadeado num recurso pago e é levado aos planos; usuário Pro usa o mesmo recurso.
7. **Exercícios:** uma sessão completa de cada categoria (auditivo, escala guiada, progressão, ritmo com teclas simuladas) mostra o resultado e aparece no catálogo como última prática.
8. **Sair:** o usuário sai e volta à landing; `/app/*` volta a pedir login.
9. **Pagamento** (quando a spec de pagamento for executada): checkout no modo de teste do provedor libera o plano.

### Requisito 3 — Dados de teste isolados

1. Os testes E2E DEVEM criar os próprios usuários (`e2e+<data-hora>@musicos.test`), já confirmados ou com link de confirmação gerado pela chave de servidor, e apagá-los ao terminar.
2. Os testes NÃO DEVEM depender de email real.
3. Sorteios dos exercícios DEVEM poder ter semente fixa nos testes, e esse recurso NÃO DEVE existir no build de produção.

### Requisito 4 — CI no GitHub

1. Todo PR para a `main` DEVE rodar: testes unitários, lint, build e E2E.
2. O PR só pode ser mesclado com o CI verde (combinado no processo; o GitHub do plano gratuito não bloqueia sozinho em repositório privado).
3. O job de deploy DEVE ficar desligado até existir a spec de publicação (Vercel).
4. As chaves usadas pelo CI DEVEM ficar nos Secrets do GitHub, nunca no código.

### Requisito 5 — Rodar localmente

1. `RODAR-TESTES.bat` DEVE rodar os testes unitários e, se o sistema estiver no ar, oferecer rodar os E2E.
2. Localmente, os E2E usam o Chrome instalado (`channel: 'chrome'`); no CI, o Chromium do Playwright.

## Perguntas em aberto

1. **Projeto Supabase separado para testes:** os E2E criam e apagam usuários. Recomendação: **criar um segundo projeto Supabase (grátis) só para testes**, para não misturar com usuários reais. Até lá, os testes usam o projeto atual com usuários `e2e+…@musicos.test`, que são apagados no fim de cada execução.
