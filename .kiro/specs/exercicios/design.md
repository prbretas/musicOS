# Exercícios — Design

Status: **aprovado pelo usuário** ("pode fazer e depois eu avalio")

Atende: `requirements.md` desta spec (R1 a R9). Depende de: `estrutura-do-app` (aba `/app/exercicios`, login) e `planos-e-assinaturas` parte 1 (`lib/plans.ts`).

## 1. Visão geral

```
/app/exercicios            catálogo (filtros, cadeado, melhor resultado)
/app/exercicios/[id]       página do exercício → escolhe o player pela categoria
   EarTrainer        intervalos e acordes        (R2, R3)
   ScaleGuide        escala guiada no braço      (R4)
   ProgressionTrainer progressões de acordes     (R5)
   RhythmTrainer     ritmo e polirritmia         (R6)
→ SessionSummary → saveSession() → Supabase practice_sessions (R7)
```

Toda a lógica (sorteio, sequência de notas, acordes, pontuação de ritmo, resumo de progresso) fica em funções puras em `src/lib/exercises/`, testadas sem navegador. Os componentes só desenham e tocam.

## 2. Lógica (`src/lib/exercises/`)

| Arquivo | Conteúdo |
|---|---|
| `types.ts` | `Category = 'auditivo' \| 'escalas' \| 'progressoes' \| 'ritmo'`, `Level = 'iniciante' \| 'intermediario' \| 'avancado'`, `ExerciseDef { id, category, level, title, description, minutes, config }` |
| `catalog.ts` | Lista fixa: `AUD-INT-1/2/3` (intervalos por nível), `AUD-ACO-1/2/3` (acordes por nível), `EXS-001..006`, `EXC-001..004`, `RIT-001..007` |
| `rng.ts` | Gerador aleatório com semente (mulberry32), para os testes repetirem o mesmo sorteio |
| `ear.ts` | `INTERVAL_SETS`, `CHORD_SETS` por nível; `makeIntervalRound(level, rng, n=10)` → perguntas `{ baseMidi, semitones, direction }` com base entre 48 (C3) e 72 (C5); `makeChordRound(level, rng)` → `{ rootMidi 48–59, quality }`; `answerOptions(level)`; `describeInterval(q)` → "C → G, 5ª justa" (nomes de `escalas.ts`) |
| `scale-path.ts` | `positionWindow(exerciseId)` usando `getCagedWindows`; `buildPositionPath(scalePcs, window, tuningMidi)` → passos `{ string, fret, midi }`: cada corda da grave à aguda, casas da janela em ordem, só notas da escala, cada nota mais aguda que a anterior (descarta a repetição da mesma altura em corda vizinha); depois a mesma sequência ao contrário, sem repetir a nota do topo |
| `progressions.ts` | `PROGRESSIONS = { 'EXC-001': [1,4,5,1], 'EXC-002': [2,5,1], 'EXC-003': [1,6,4,5], 'EXC-004': [1,3,4,5] }`; `progressionChords(rootPc, degrees)` usa `harmonicField(buildScale(rootPc,'maior'), false)` e `shapeKey` → `{ name, notes, shape }` |
| `rhythm.ts` | Padrões em frações de tempo por compasso de 4/4: RIT-001 `[0,1,2,3]`; RIT-002 colcheias `[0,.5,…,3.5]`; RIT-003 `[.5,1.5,2.5,3.5]`; RIT-004 `[0,.5,1.5,2,2.5,3.5]`; RIT-005 padrão fixo de semicolcheias com pausas; RIT-006 mão esquerda `[0,2]` e direita `[0,4/3,8/3]` (3 contra 2 em meia nota); RIT-007 esquerda `[0,4/3,8/3]` e direita `[0,1,2,3]` (4 contra 3). `expectedHits(pattern, bars, bpm, t0)`; `scoreTaps(expected, taps, latencyMs)`: para cada batida esperada, a resposta mais próxima não usada, na mesma mão, dentro de 130 ms; faixas 35/75/130 ms; nota = `max(0, (Σpesos − 0,25 × foraDoTempo) / total) × 100`; média do adiantamento ou atraso. `calibrate(clickTimes, tapTimes)` → mediana das diferenças, limitada a ±250 ms |
| `progress.ts` | `SessionRecord`; `toPracticeSessionRow(record)`; `saveSession(supabase, record)` com fila no `localStorage` (`musicos:sessoes-pendentes`) se falhar; `flushPending(supabase)`; `summarize(rows)` → melhor resultado e última data por exercício |

### Relógio comum (`src/lib/audio/clock.ts`)

`createBeatClock({ bpm, subdivision, onTick(index, time) })` com `start`, `stop`, `pause`, `resume` e `setBpm`. Usa o mesmo esquema do metrônomo atual: agenda 100 ms à frente no relógio do AudioContext, verificando a cada 25 ms, e chama `onTick` no horário de cada tick (`setTimeout` até o tempo do áudio) para atualizar a tela. O `MetronomePanel` passa a usar esse relógio, sem mudar o comportamento.

A hora das batidas no ritmo é lida de `audioNow()` no evento de tecla ou toque, no mesmo relógio dos cliques.

## 3. Componentes (`src/components/exercises/`)

Visual: tokens de `estrutura-do-app/design.md` §2 (cartões `bg-slate-800`, botões slate e roxo).

| Componente | Função |
|---|---|
| `ExerciseCatalog` | Filtros (categoria, nível), cartões com nível, minutos, melhor resultado, última prática e cadeado vindo de `lib/plans.ts` |
| `ExercisePlayerPage` | Busca o exercício no catálogo, confere o plano (sem direito → tela de planos), escolhe o player |
| `TempoControl` | BPM (slider + botões −/+), dentro dos limites de cada exercício |
| `CountIn` | Contagem 1-2-3-4 em destaque |
| `EarTrainer` | Botão Ouvir, opções de resposta, retorno, placar, atalhos (1–9, Enter, R) |
| `ScaleGuide` | `Fretboard` com a nova propriedade `marks` (nota atual e próxima), Iniciar/Pausar/Continuar, "Tocar junto", repetições |
| `ProgressionTrainer` | Diagrama atual grande e próximo menor (`ChordShapeDiagram`), tempo do compasso, voltas, tonalidade (só as liberadas) |
| `RhythmTrainer` | Grade SVG do compasso com batidas esperadas e cursor, área de toque grande, teclas Espaço / F / J, marcação de cada batida (Perfeito, Bom, Fraco, Perdeu) |
| `RhythmCalibration` | 8 cliques, mede o atraso e salva em `localStorage` (`musicos:latencia-ms`) |
| `SessionSummary` | Resultado, detalhes, Repetir e Voltar; dispara `saveSession` |

Mudanças em componentes existentes:
- `Fretboard`: nova propriedade opcional `marks?: { string: number; fret: number; kind: 'current' \| 'next' }[]`, desenhada como anel por cima das notas. Nada muda quando ela não é passada.
- `MiniChordDiagram` sai de `ChordFieldViewer.tsx` para `src/components/ChordShapeDiagram.tsx`, com tamanho configurável, e é usado pelos dois.

## 4. Dados

Tabela existente `practice_sessions` (`user_id, session_type, duration_minutes, date, data, created_at`).

| Categoria | `session_type` |
|---|---|
| auditivo | `ear_training` |
| escalas | `scale_practice` |
| progressoes | `chord_practice` |
| ritmo | `rhythm_practice` (novo) |

`data` (jsonb): `{ exercise_id, level, score, total, bpm, reps, seconds, details }`. Em `details`: os intervalos errados no auditivo e as contagens por classificação no ritmo.

Migração `docs/migrations/003-exercicios.sql`: incluir `rhythm_practice` na regra de `session_type` e criar o índice `(user_id, created_at desc)`. A RLS atual (o usuário só vê os próprios registros) continua.

Acesso por plano: `lib/plans.ts` expõe `canUseExercise(plan, def)`, com a regra do Requisito 8. Esta spec não decide plano por conta própria.

## 5. Erros e casos-limite

- AudioContext indisponível ou bloqueado: aviso "Clique em Iniciar para ativar o som" e o player não começa sem som.
- Falha ao salvar: "Resultado guardado neste aparelho; será enviado depois." O registro entra na fila.
- Aba do navegador em segundo plano durante o ritmo: a sessão é cancelada e não conta, porque o navegador atrasa os timers.
- Exercício inexistente na URL: página "Exercício não encontrado" com link para o catálogo.
- BPM fora dos limites é ajustado ao limite mais próximo.

## 6. Testes e verificação

Unitários (`src/__tests__/lib/exercises/`), todos com semente fixa:
- `ear`: cada nível só sorteia intervalos e acordes do seu conjunto; notas dentro de C3–C5; 10 perguntas; `describeInterval`.
- `scale-path`: posição 1 de C maior gera exatamente E F G, A B C, D E F, G A, B C D, E F G subindo, e a volta; todas as notas pertencem à escala e à janela; nenhuma altura repetida na subida.
- `progressions`: em C, `EXC-001` dá C F G C e `EXC-002` dá Dm G C; em G, `EXC-002` dá Am D G; todos os acordes têm posição no banco.
- `rhythm`: batidas exatas valem 100; +50 ms vira Bom; resposta ausente vira Perdeu; batida extra desconta; mãos não se misturam na polirritmia; calibração com atraso constante de 80 ms devolve 80.
- `progress`: conversão para linha do banco; fila guarda quando falha e esvazia no `flushPending`; `summarize` escolhe o melhor resultado.
- `clock`: ticks no intervalo certo para um BPM e mudança de BPM no meio.

Visual: `scripts/capturar-telas.cjs` fotografa o catálogo e um exercício de cada categoria em andamento (com teclas simuladas no ritmo), e lista os erros do console.
