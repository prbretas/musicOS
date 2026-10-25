# MusicOS — Guia de Execução Rápida

> Este guia mostra como rodar o sistema localmente para testes e desenvolvimento.

---

## 🚀 Pré-requisitos

| Software | Versão Mínima | Como instalar |
|----------|---------------|---------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) (LTS) |
| **npm** | 9+ | Já vem com Node.js |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com/) |

---

## 📋 Como Rodar o Sistema

### Passo 1 — Entrar na pasta do projeto

```powershell
cd "c:\Users\philippe.bretas\Documents\KIRO REP\MusicPages-AI-Eng\src\app-MusicOS"
```

### Passo 2 — Rodar o servidor de desenvolvimento

```powershell
npm run dev
```

### Passo 3 — Acessar no navegador

Abra o endereço: **http://localhost:3000**

---

## 🎯 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (modo watch) |
| `npm run build` | Faz build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Verifica erros de código |
| `npm run test` | Roda testes unitários em modo watch |
| `npm run test:unit` | Roda testes unitários uma vez |
| `npm run test:e2e` | Roda testes E2E com Playwright |

---

## 🔧 Configuração (.env)

O arquivo `.env.local` já está configurado com variáveis de exemplo. Para desenvolvimento local, geralmente não é necessário alterar nada.

Se precisar criar um novo:

1. Copie o arquivo de exemplo:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. Edite as variáveis conforme necessário

---

## 🐛 Solução de Problemas

### "Module not found" ao rodar `npm run dev`

Instale as dependências:
```powershell
npm install
```

### Porta 3000 já está em uso

Mude a porta:
```powershell
$env:PORT=3001; npm run dev
```

### Erro de TypeScript

Limpe o cache e rebuild:
```powershell
Remove-Item -Recurse -Force .next
npm run build
```

---

## 📱 Funcionalidades Disponíveis

Agora você pode testar:

- ✅ **InfoButton** — Botão de ajuda contextual
- ✅ **Fretboard** — Visualização do braço do instrumento
- ✅ **ChordDiagram** — Diagrama de acordes
- ✅ **Music Theory Engine** — Cálculo de escalas e campos harmônicos

Mais informações em: `docs/ISSUES.md`

---

## 📚 Estrutura do Projeto

```
src/app-MusicOS/
├── src/
│   ├── app/              # Páginas Next.js
│   │   ├── (auth)/       # Login, signup
│   │   ├── (dashboard)/  # Dashboard principal
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Home
│   ├── components/       # Componentes React
│   │   ├── ui/           # InfoButton
│   │   ├── fretboard/    # Fretboard
│   │   └── chords/       # ChordDiagram
│   ├── lib/              # Bibliotecas
│   │   ├── music-theory/ # Engine de música
│   │   └── audio/        # AudioEngine
│   └── types/            # TypeScript types
└── package.json
```

---

## ⏭️ Próximos Passos

Após verificar que o sistema está rodando:

1. Complete a configuração do Supabase (issue INF-005)
2. Desenvolva o ScaleDisplay (issue CMP-004)
3. Implemente o AudioEngine completo (issue CORE-003)

Veja `docs/ISSUES.md` para a lista completa de tarefas.

---

*Documento criado em 25 de outubro de 2026*