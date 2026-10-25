# MusicOS — Guia de Contribuição

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026

Obrigado por querer contribuir com o MusicOS! Este guia explica como participar do desenvolvimento do projeto.

---

## 1. Começando

### 1.1 Pré-requisitos

| Requisito | Versão Mínima | Como Verificar |
|-----------|---------------|----------------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Git | 2.40+ | `git --version` |
| GitHub CLI | 2.40+ | `gh --version` |

### 1.2 Configuração do Ambiente

```bash
# 1. Clonar o repositório
gh repo clone prbretas/musicOS
cd musicOS

# 2. Entrar na pasta do app
cd src/app-MusicOS

# 3. Instalar dependências
npm install

# 4. Copiar variáveis de ambiente
cp .env.example .env.local

# 5. Executar testes para verificar setup
npm run test:unit
```

---

## 2. Fluxo de Contribuição

### 2.1 Escolher uma Issue

```bash
# Listar issues abertas
gh issue list --state open --label "help wanted"

# Ou ver docs/ISSUES.md
cat docs/ISSUES.md
```

### 2.2 Criar Branch

```bash
# Criar branch para a issue
git checkout -b feature/ISSUE-001-descricao

# Exemplo:
git checkout -b feature/CMP-004-ScaleDisplay
```

### 2.3 Desenvolver

```bash
# Rodar servidor de desenvolvimento
npm run dev

# Rodar testes em watch
npm run test:watch
```

### 2.4 Commits

Siga o padrão **Conventional Commits**:

```
<tipo>(<escopo>): <descrição>

Tipos:
- feat: Nova funcionalidade
- fix: Correção de bug
- test: Adição de testes
- docs: Documentação
- refactor: Refatoração
- chore: Tarefas de manutenção
- style: Formatação (ESLint, Prettier)
```

**Exemplos:**
```bash
feat(scales): add ScaleDisplay component
fix(audio): resolve click sound issue
test(fretboard): add highlight tests
docs(readme): update installation guide
```

### 2.5 Push e PR

```bash
# Push da branch
git push -u origin feature/ISSUE-001

# Criar Pull Request via GitHub CLI
gh pr create --title "feat(ISSUE-001): Descrição" \
  --body "## Descrição\n\n## Mudanças\n\n## Testes"
```

---

## 3. Padrões de Código

### 3.1 TypeScript

```typescript
// ✅ Bom
interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
}

function createUser(data: CreateUserDTO): User {
  return {
    id: generateId(),
    ...data,
  };
}

// ❌ Ruim
function createUser(data: any) {
  return { id: '123', ...data };
}
```

### 3.2 Componentes React

```typescript
// ✅ Bom - com props tipadas e comentários
interface ButtonProps {
  /** Texto do botão */
  children: React.ReactNode;
  /** Variante visual */
  variant?: 'primary' | 'secondary';
  /** Callback de clique */
  onClick?: () => void;
}

/**
 * Button component
 * @see https://ui.music-os.com/button
 */
export function Button({ 
  children, 
  variant = 'primary', 
  onClick 
}: ButtonProps) {
  return (
    <button className={variant} onClick={onClick}>
      {children}
    </button>
  );
}

// ❌ Ruim - sem tipos
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}
```

### 3.3 Testes

```typescript
// ✅ Bom - testes descritivos
describe('ScaleSelector', () => {
  it('renders all tonic options', () => {
    render(<ScaleSelector />);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('calls onTonicChange when selecting', () => {
    const onChange = vi.fn();
    render(<ScaleSelector onTonicChange={onChange} />);
    
    fireEvent.click(screen.getByText('C'));
    expect(onChange).toHaveBeenCalledWith('C');
  });
});

// ❌ Ruim - testes vagos
describe('Scale', () => {
  it('works', () => {
    // teste genérico
  });
});
```

---

## 4. Estrutura de Commits

### 4.1 Commits Pequenos

Cada commit deve fazer **uma coisa**:

```bash
# ✅ Bom - commit focado
git commit -m "feat(audio): add ADSR envelope

- Implement attack phase
- Add decay, sustain, release
- Add tests for all phases"

# ❌ Ruim - commit com múltiplas responsabilidades
git commit -m "feat: add audio, fix scales, update docs"
```

### 4.2 Commits Descritivos

O commit deve ser autoexplicativo:

```
feat(scales): implement ScaleDisplay component

- Renders scale notes in a grid layout
- Shows interval names below each note
- Handles empty scales gracefully
- Includes keyboard navigation

Closes #123
```

---

## 5. Revisões de Código

### 5.1 Checklist do Autor

Antes de criar PR, verifique:

- [ ] Testes passando
- [ ] Lint passando (`npm run lint`)
- [ ] Build passando (`npm run build`)
- [ ] Documentação atualizada
- [ ] Sem `console.log` ou `debugger`
- [ ] Commits descritivos e pequenos
- [ ] Branch atualizada com main

### 5.2 Checklist do Revisor

Ao revisar PR:

- [ ] Código é legível e bem comentado
- [ ] Tests cobrem casos importantes
- [ ] Não introduce bugs ou regressões
- [ ] Segue padrões do projeto
- [ ] Documentação atualizada se necessário
- [ ] Security concerns endereçados

---

## 6. Áreas de Contribuição

### 6.1 Bug Fixes

Procure issues com标签 `bug`:
```bash
gh issue list --label bug
```

### 6.2 Features

Procure issues com标签 `enhancement`:
```bash
gh issue list --label enhancement
```

### 6.3 Documentação

Procure issues com标签 `documentation`:
```bash
gh issue list --label documentation
```

### 6.4 Testes

Procure issues com标签 `testing`:
```bash
gh issue list --label testing
```

---

## 7. Recursos para Contribuidores

### 7.1 Documentação do Projeto

| Documento | Descrição |
|-----------|-----------|
| `docs/ISSUES.md` | Issues ativas |
| `docs/product.md` | Visão de produto |
| `docs/requirements.md` | Requisitos funcionais |
| `docs/tech.md` | Arquitetura técnica |
| `docs/API.md` | Especificação de APIs |
| `docs/COMPONentes.md` | Componentes UI |

### 7.2 Links Úteis

- [GitHub Flow](https://guides.github.com/introduction/flow/)
+ [Conventional Commits](https://www.conventionalcommits.org/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 8. Código de Conduta

### 8.1 Nossas Expectativas

- Seja respeitoso e inclusivo
- Critique ideias, não pessoas
- Foque no que é melhor para o projeto
- Seja receptivo a feedback

### 8.2 Comportamentos Inaceitáveis

- Comentários discriminatórios
- Assédio ou bullying
- Publicação de informações privadas
- Outro comportamento inadequado

---

## 9. Perguntas?

Se tiver dúvidas:

1. Verifique a [documentação](docs/)
2. Procure em [issues](docs/ISSUES.md)
3. Abra uma nova [discussion](https://github.com/prbretas/musicOS/discussions)

---

*Obrigado por contribuir com o MusicOS! 🎵*