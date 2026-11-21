---
inclusion: always
---

# MusicOS — Produto

## O que é

MusicOS é uma plataforma web profissional de teoria e prática musical, em português (pt-BR), feita para ser vendida por assinatura. É a evolução do projeto MusicPages (`src/musicpages`), do qual reaproveita funcionalidades e dados.

## Para quem

Músicos de qualquer nível, do iniciante ao avançado. Prioridade: guitarra, violão e ukulele (braço do instrumento) e teclado (visualização de notas). Uso em desktop e celular.

## Proposta de valor

Teoria e prática no mesmo lugar: escalas, campo harmônico, acordes, braço com CAGED, ciclo de quintas, metrônomo e exercícios com som e pontuação, com explicações em cada tela. Preço bem abaixo dos concorrentes (Yousician, Fender Play).

## Monetização (planos)

| Plano | Preço | Cobrança | Resumo |
|---|---|---|---|
| Free | R$0 | — | Só para testar o app; bem limitado. O objetivo é o usuário assinar. |
| Plus | R$9,90 | mensal | Parte das funcionalidades e das tonalidades |
| Pro | R$19,90 | mensal | Todas as funcionalidades e tonalidades |
| Vitalício | R$697 (lançamento: R$357) | pagamento único | Tudo, para sempre, inclusive recursos futuros |

Pagamento por cartão, Pix ou boleto. Para usar o app é obrigatório criar conta e entrar (permite email marketing, lembretes e venda dos planos). O que cada plano libera fica na spec `.kiro/specs/planos-e-assinaturas/` e em um único módulo de código (`lib/plans.ts`).

## Princípios

1. **Profissional:** visual consistente, sem textos de teste, sem funcionalidade pela metade exposta ao usuário.
2. **Correção musical:** nota, intervalo, acorde e posição no braço precisam estar certos. Toda lógica musical tem teste.
3. **Visual do MusicOS:** o layout é o de abas do MusicOS (tema escuro slate, Tailwind), com código de referência em `.kiro/specs/estrutura-do-app/referencia/layout-abas-page.tsx`. Do MusicPages vêm só funcionalidades e dados (inclusive as 24 escalas), nunca o layout.
4. **Monetizável:** todo recurso novo declara em qual plano fica.
5. **Spec antes de código:** ver `process.md`.

## Fora do escopo (por enquanto)

App nativo, assistente de IA, comunidade, importação de MusicXML, MIDI.
