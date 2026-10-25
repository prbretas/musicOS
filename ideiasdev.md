# MusicOS — Diretrizes de Desenvolvimento

> **Repositório:** github.com/prbretas/musicOS  
> **Documentação:** docs/ISSUES.md, docs/HISTORICO.md, docs/TESTING-PLAN.md  
> **Data:** 24 de outubro de 2026

---

## 📋 Estrutura do Repositório

```
musicOS/
├── .github/
│   └── workflows/
│       └── test.yml              # CI/CD completo
├── docs/
│   ├── ISSUES.md                 # Issues ativas
│   ├── HISTORICO.md              # Histórico de conclusões
│   ├── MANUAL-USUARIO.md         # Manual do usuário
│   ├── ADMIN-GUIDE.md            # Guia de administração
│   └── TESTING-PLAN.md           # Estratégia de testes
├── scripts/
│   ├── run-tests.bat             # Executa testes automaticamente
│   └── git-workflow.bat          # Automatiza fluxo Git
└── src/app-MusicOS/              # Código fonte
    ├── src/
    │   ├── __tests__/            # Testes Unitários
    │   ├── __integration__/      # Testes Integração
    │   ├── e2e/                  # Testes E2E (Playwright)
    │   └── components/           # Componentes React
```

---

## 🔄 Fluxo de Desenvolvimento ( Padrão )

### 1. Criar Issue no GitHub

```bash
# Via CLI
gh issue create --title "[CMP-001] InfoButton Component" \
  --body "Descricao da issue" \
  --label "P1,feature"
```

Ou via interface web do GitHub.

### 2. Criar Branch para a Issue

```bash
# Automatizado
scripts\git-workflow.bat init CMP-001

# Manual
git checkout main
git pull origin main
git checkout -b feature/CMP-001-descricao
```

### 3. Desenvolver com Testes

**Ordem recomendada:**
1. Criar arquivo de teste vazio
2. Desenvolver componente/funcionalidade
3. Escrever testes
4. Validar que passam

```bash
# Rodar testes em modo watch
npm run test:watch
```

### 4. Commits Frequentes

**Formato de commits:**
```
tipo(escopo): descricao curta

Corpo descritivo (opcional)

- bullet point 1
- bullet point 2
```

**Tipos permitidos:**
| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `test` | Adição/modificação de testes |
| `docs` | Documentação |
| `refactor` | Refatoração de código |
| `chore` | Tarefas de manutenção |

```bash
# Commit com script
scripts\git-workflow.bat commit "feat(CMP-001): add InfoButton component"

# Commit manual
git add src/components/ui/InfoButton.tsx
git commit -m "feat(CMP-001): add InfoButton component

- cria componente com popup
- inclui conteudo educacional
- adiciona props de customizacao"
```

### 5. Criar Pull Request

```bash
# Automatizado
scripts\git-workflow.bat push

# Manual
git push -u origin feature/CMP-001
gh pr create --title "feat(CMP-001): InfoButton Component" \
  --body "Implementa componente InfoButton..."
```

### 6. Revisão e Merge

1. Revisar PR no GitHub
2. Aprovar se testes passaram
3. Fazer merge
4. Deletar branch

### 7. Atualizar Histórico

```bash
# Automatizado
scripts\git-workflow.bat finish

# Manual: editar docs/HISTORICO.md
```

---

## 🧪 Testes Obrigatórios

### Tipos de Testes

| Tipo | Localização | Ferramenta | Target |
|------|-------------|------------|--------|
| **Unitários** | `src/__tests__/` | Vitest | 80%+ coverage |
| **Integração** | `src/__integration__/` | Vitest | 70%+ coverage |
| **E2E** | `src/e2e/` | Playwright | Fluxos críticos |

### Rodar Testes

```bash
# Todos os testes
scripts\run-tests.bat

# Apenas unitarios
scripts\run-tests.bat unit

# Apenas E2E
scripts\run-tests.bat e2e

# Modo CI/CD
scripts\run-tests.bat ci
```

---

## ✅ Checklist Antes do PR

- [ ] Testes unitários passando
- [ ] Testes de integração passando  
- [ ] Testes E2E passando
- [ ] Lint passando (`npm run lint`)
- [ ] Build passando (`npm run build`)
- [ ] Commits descritivos e pequenos
- [ ] Documentação atualizada
- [ ] Sem console.log ou código debugger

---

## 📝 Arquivos Obrigatórios por Issue

Para cada feature implementada:

```
1. Componente principal
   src/components/[categoria]/[nome].tsx

2. Testes unitarios
   src/__tests__/components/[categoria]/[nome].test.tsx

3. Documentacao (se necessario)
   docs/adicionar info se for algo complexo
```

---

## 🏷️ Convenções de Nomes

### Branches
```
feature/ISSUE-001-descricao     # Nova feature
fix/ISSUE-002-descricao          # Correcao de bug
docs/ISSUE-003-descricao         # Documentacao
```

### Commits
```
feat(CMP-001): add new component
fix(AUTH-005): resolve login issue
test(SCales): add scale tests
docs(readme): update installation
```

### Issues
```
[CÓDIGO] — [TIPO]: Descrição
Ex: [CMP-001] — feat: InfoButton Component
```

---

## 📦 Scripts Disponíveis

### run-tests.bat
Executa toda a suíte de testes.

```bash
scripts\run-tests.bat           # Todos os testes
scripts\run-tests.bat unit      # Apenas unitarios
scripts\run-tests.bat e2e       # Apenas E2E
scripts\run-tests.bat ci        # Modo CI/CD
```

### git-workflow.bat
Automatiza o fluxo Git.

```bash
scripts\git-workflow.bat init ISSUE-001   # Criar branch
scripts\git-workflow.bat commit "msg"     # Commit
scripts\git-workflow.bat push             # Push + PR
scripts\git-workflow.bat finish           # Merge + cleanup
```

---

## 📚 Documentação Relacionada

| Documento | Descrição |
|-----------|-----------|
| `docs/ISSUES.md` | Lista de issues ativas a desenvolver |
| `docs/HISTORICO.md` | Registro de issues concluídas |
| `docs/TESTING-PLAN.md` | Estratégia completa de testes |
| `docs/MANUAL-USUARIO.md` | Manual para usuários finais |
| `docs/ADMIN-GUIDE.md` | Guia para administradores |

---

## 🚀 Próximos Passos

1. **Executar setup inicial:**
   ```bash
   cd src/app-MusicOS
   npm install
   ```

2. **Escolher uma issue:** Ver `docs/ISSUES.md`

3. **Iniciar desenvolvimento:**
   ```bash
   scripts\git-workflow.bat init CMP-004
   ```

4. **Desenvolver e testar:**
   ```bash
   npm run test:watch
   ```

5. **Commitar e PR:**
   ```bash
   scripts\git-workflow.bat commit "feat: descricao"
   scripts\git-workflow.bat push
   ```

---

*Documento criado em 24 de outubro de 2026*  
*Versão 1.0*