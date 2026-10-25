#!/usr/bin/env python3
"""
Script para criar issues do MusicOS no GitHub
用法: python create_issues.py --token GITHUB_TOKEN --repo owner/repo
"""

import argparse
import json
import requests
from typing import List, Dict

# Issues baseadas no docs/ISSUES-STATUS.md
ISSUES = [
    # === FASE 1: MVP ===
    {
        "title": "[Infraestrutura] Setup Supabase Free Tier",
        "body": """## Descrição
Configurar o Supabase Free Tier com database PostgreSQL, Auth e Storage.

## Tarefas
- [ ] Criar projeto no Supabase
- [ ] Configurar variáveis de ambiente (.env.local)
- [ ] Criar schema do banco (profiles, subscriptions, user_progress, user_favorites)
- [ ] Configurar RLS (Row Level Security)
- [ ] Testar conexão

## Critérios de Aceitação
- [ ] Supabase configurado e funcionando
- [ ] Auth com email e Google funcionando
- [ ] Database schema criado
- [ ] Tests de integração passando

## Dependências
- INF-005 (Setup Supabase)

## Labels
`P0` `infraestrutura` `database` `MVP`""",
        "labels": ["P0", "infraestrutura", "database", "MVP"]
    },
    {
        "title": "[Infraestrutura] Configurar GitHub Actions CI/CD",
        "body": """## Descrição
Configurar pipeline de CI/CD com GitHub Actions para testes automatizados.

## Tarefas
- [ ] Criar workflow de testes (test.yml)
- [ ] Configurar lint e prettier
- [ ] Configurar build automatizado
- [ ] Configurar deployment para Vercel

## Critérios de Aceitação
- [ ] Tests unitários rodam no CI
- [ ] Tests E2E rodam no CI
- [ ] Build é validado automaticamente
- [ ] Deploy automático em branch main

## Labels
`P1` `CI/CD` `automação`""",
        "labels": ["P1", "CI/CD", "automação"]
    },
    {
        "title": "[Music Theory] Implementar Music Theory Engine",
        "body": """## Descrição
Criar o engine central de teoria musical para escalas, acordes e intervalos.

## Tarefas
- [ ] Implementar cálculo de notas (getNoteFromPitch)
- [ ] Implementar cálculo de intervalos (getInterval)
- [ ] Implementar geração de escalas (Maior, Menor, Pentatônica, Blues)
- [ ] Implementar geração de acordes (triades, 7, 9, 11, 13)
- [ ] Implementar campo harmônico
- [ ] Criar testes unitários

## Critérios de Aceitação
- [ ] Escala C Maior retorna ['C', 'D', 'E', 'F', 'G', 'A', 'B']
- [ ] Acorde C maior retorna ['C', 'E', 'G']
- [ ] Campo harmônico de C Maior tem 7 acordes
- [ ] 80%+ de cobertura de testes

## Referência
- `src/lib/music/theory.ts`""",
        "labels": ["P0", "core", "music-theory"]
    },
    {
        "title": "[Escalas] Implementar ScaleDisplay e ScaleHero",
        "body": """## Descrição
Criar componentes de display de escalas com seleção de tônica e tipo.

## Tarefas
- [ ] Criar componente ScaleDisplay (notas da escala)
- [ ] Criar componente ScaleHero (info da escala ativa)
- [ ] Integrar InfoButton educacional
- [ ] Criar seletores de tônica (C, G, F, A, E para Free)
- [ ] Criar seletores de escala (Maior, Menor)
- [ ] Criar testes unitários

## Critérios de Aceitação
- [ ] Usuário pode selecionar tônica
- [ ] Usuário pode selecionar tipo de escala
- [ ] Notas da escala aparecem destacadas
- [ ] InfoButton mostra conteúdo educacional
- [ ] Tests passando

## Dependências
- SCA-001 (Music Theory Engine)

## Labels
`P1` `escala` `MVP`""",
        "labels": ["P1", "escala", "MVP"]
    },
    {
        "title": "[Fretboard] Implementar InstrumentRegistry",
        "body": """## Descrição
Criar registro de instrumentos com perfis de afinação customizáveis.

## Tarefas
- [ ] Criar interface InstrumentProfile
- [ ] Implementar Guitarra 6 cordas (EADGBe)
- [ ] Implementar Violão 6 cordas
- [ ] Implementar Ukulele (GCEA)
- [ ] Implementar Baixo 4 cordas
- [ ] Criar testes unitários

## Critérios de Aceitação
- [ ] Guitarra funciona corretamente
- [ ] Ukulele funciona corretamente
- [ ] Afinações customizadas funcionando
- [ ] Tests passando

## Labels
`P1` `instrumento` `MVP`""",
        "labels": ["P1", "instrumento", "MVP"]
    },
    {
        "title": "[Áudio] Implementar AudioEngine",
        "body": """## Descrição
Criar engine de áudio usando Web Audio API para síntese de notas.

## Tarefas
- [ ] Criar AudioEngine wrapper
- [ ] Implementar síntese de notas (Oscillator + Gain)
- [ ] Adicionar envelope ADSR configurável
- [ ] Implementar playNote(note, duration)
- [ ] Implementar playChord(chord, duration)
- [ ] Criar testes

## Critérios de Aceitação
- [ ] Nota é tocada ao clicar no fretboard
- [ ] Som é suave (envelope ADSR)
- [ ] Volume é configurável
- [ ] Tests passando

## Dependências
- FBT-005 (Audio playback)

## Labels
`P1` `áudio` `MVP`""",
        "labels": ["P1", "áudio", "MVP"]
    },
    {
        "title": "[Acordes] Implementar ChordCard e diagramas",
        "body": """## Descrição
Criar componentes de display de acordes com diagramas SVG interativos.

## Tarefas
- [ ] Criar componente ChordCard
- [ ] Implementar diagramas SVG de acordes
- [ ] Criar LocalChordDB (fallback shapes)
- [ ] Integrar áudio de acorde
- [ ] Criar testes

## Critérios de Aceitação
- [ ] Diagrama de C maior aparece corretamente
- [ ] Clique toca o acorde
- [ ] Números de casa corretos
- [ ] Tests passando

## Labels
`P1` `acorde` `MVP`""",
        "labels": ["P1", "acorde", "MVP"]
    },
    {
        "title": "[Metrônomo] Implementar componente Metronome",
        "body": """## Descrição
Criar componente de metrônomo com controle de BPM.

## Tarefas
- [ ] Criar componente Metronome
- [ ] Implementar motor de click (Web Audio API)
- [ ] Adicionar controle de BPM (20-300)
- [ ] Criar testes

## Critérios de Aceitação
- [ ] Click funciona em diferentes BPMs
- [ ] Start/Stop funciona
- [ ] Áudio é claro
- [ ] Tests passando

## Labels
`P2` `metrônomo` `MVP`""",
        "labels": ["P2", "metrônomo", "MVP"]
    },
    {
        "title": "[Educação] Criar Content Database de textos",
        "body": """## Descrição
Criar banco de textos educacionais para o sistema de ajuda contextual.

## Tarefas
- [ ] Criar Content Database (JSON/TypeScript)
- [ ] Escrever conteúdo: Ciclo de Quintas
- [ ] Escrever conteúdo: Campo Harmônico
- [ ] Escrever conteúdo: Escalas
- [ ] Escrever conteúdo: Acordes
- [ ] Escrever conteúdo: Metrônomo
- [ ] Criar testes

## Critérios de Aceitação
- [ ] 5+ textos educacionais criados
- [ ] InfoButton mostra conteúdo correto
- [ ] Tests de hooks passando

## Dependências
- EDU-001 (InfoButton component)

## Labels
`P1` `educacional` `MVP`""",
        "labels": ["P1", "educacional", "MVP"]
    },
    {
        "title": "[Tests] Implementar Testes Unitários",
        "body": """## Descrição
Implementar testes unitários usando Vitest e React Testing Library.

## Tarefas
- [ ] Configurar Vitest (vitest.config.ts)
- [ ] Configurar setup de testes (src/test/setup.ts)
- [ ] Escrever testes: InfoButton (5+)
- [ ] Escrever testes: Fretboard (8+)
- [ ] Escrever testes: ChordDiagram (6+)
- [ ] Escrever testes: Music Theory (15+)
- [ ] Escrever testes: Hooks (5+)
- [ ] Atingir 80%+ de cobertura

## Critérios de Aceitação
- [ ] Tests passando
- [ ] Cobertura >= 80%
- [ ] CI configurado

## Labels
`P0` `tests` `MVP`""",
        "labels": ["P0", "tests", "MVP"]
    },
    {
        "title": "[Tests] Implementar Testes E2E com Playwright",
        "body": """## Descrição
Implementar testes end-to-end usando Playwright para fluxos críticos.

## Tarefas
- [ ] Configurar Playwright (playwright.config.ts)
- [ ] Criar teste: Login → Dashboard
- [ ] Criar teste: Escala → Fretboard → Play
- [ ] Criar teste: Acorde → Diagram → Play
- [ ] Criar teste: Pricing → Checkout
- [ ] Criar teste: Metrônomo Start/Stop
- [ ] Configurar CI com GitHub Actions

## Critérios de Aceitação
- [ ] 5+ fluxos E2E funcionando
- [ ] Tests passam no CI
- [ ] Documentação atualizada

## Labels
`P1` `tests` `E2E` `MVP`""",
        "labels": ["P1", "tests", "E2E", "MVP"]
    },
]

def create_github_issue(token: str, repo: str, issue: Dict) -> bool:
    """Cria uma issue no GitHub"""
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }
    data = {
        "title": issue["title"],
        "body": issue["body"],
        "labels": issue.get("labels", []),
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        print(f"✓ Created: {issue['title']}")
        return True
    else:
        print(f"✗ Failed: {issue['title']} - {response.text}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Create GitHub issues for MusicOS")
    parser.add_argument("--token", required=True, help="GitHub Personal Access Token")
    parser.add_argument("--repo", required=True, help="Repository in format owner/repo")
    parser.add_argument("--dry-run", action="store_true", help="Show issues without creating")
    args = parser.parse_args()
    
    print(f"Criando {len(ISSUES)} issues no repositório {args.repo}...\n")
    
    if args.dry_run:
        for issue in ISSUES:
            print(f"[DRY RUN] {issue['title']}")
        return
    
    for issue in ISSUES:
        create_github_issue(args.token, args.repo, issue)

if __name__ == "__main__":
    main()