---
inclusion: always
---

# MusicOS — Processo de desenvolvimento (spec-driven)

## Regra principal

Nenhuma funcionalidade nova é programada sem spec aprovada. Cada spec fica em `.kiro/specs/<feature>/` com três arquivos, escritos e aprovados nesta ordem:

1. `requirements.md`: histórias de usuário e critérios de aceite no formato "QUANDO … O SISTEMA DEVE …", com o plano (Free, Plus, Vitalício) de cada recurso e as perguntas em aberto.
2. `design.md`: arquitetura, arquivos, interfaces, dados, erros e estratégia de teste.
3. `tasks.md`: tarefas pequenas, numeradas, em ordem, cada uma citando os requisitos que atende.

O usuário aprova cada arquivo antes do próximo. Pergunta em aberto bloqueia o que depende dela.

## Execução

- Uma tarefa por vez, na ordem do `tasks.md`. Ao terminar, marcar `[x]` na tarefa.
- Não mexer em nada fora do escopo da tarefa. Se aparecer algo fora do escopo, anotar e perguntar.
- Mudança de layout ou de visual só com aprovação explícita do usuário.
- Correção de bug pequeno e evidente pode ser feita direto, informando o que mudou.

## Fluxo do GitHub (repositório `prbretas/musicOS`)

1. Cada parte de spec (ou correção) tem uma branch saindo da `main` atualizada: `feat/<spec>-<parte>`, `fix/<assunto>`, `docs/<assunto>`, `test/<assunto>`.
2. Um commit por tarefa, em Conventional Commits, citando a tarefa: `feat(estrutura): A2 layout da área logada`.
3. Ao fim da parte: `git push`, PR para a `main` com as tarefas feitas, os testes rodados e as fotos das telas; o CI precisa passar.
4. Merge na `main` (merge commit) e apagar a branch.
5. Nunca commitar `.env.local` nem chaves. Antes de cada commit, conferir se não há segredo nos arquivos.
6. `src/musicpages` é um submódulo (`prbretas/musicpages`); não alterar por este repositório.

## Pronto quer dizer

1. `npx tsc --noEmit` sem erro nos arquivos tocados.
2. Testes da área passando, com teste novo para toda lógica nova e teste E2E para todo fluxo novo do usuário (spec `qualidade-e-testes`).
3. Tela conferida no navegador (foto com Playwright, `channel: 'chrome'`), sem erro no console.
4. O sistema sobe com `INICIAR-MUSICOS.bat`.

## Combinados com o usuário

- O usuário não digita comandos: entregar scripts para clicar. Só existem dois `.bat`: `INICIAR-MUSICOS.bat` e `RODAR-TESTES.bat`.
- Comunicação em português.
- Do MusicPages, levar funcionalidades e dados, não o layout.
