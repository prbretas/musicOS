# Exercícios — Tarefas

Status: **aprovado pelo usuário** ("pode fazer e depois eu avalio"). Começa depois das partes A e B de `estrutura-do-app` e da parte 1 de `planos-e-assinaturas` (módulo de planos). Uma tarefa por vez, nesta ordem.

## Base

- [ ] **E1. Tipos e catálogo** `lib/exercises/types.ts`, `catalog.ts`, `rng.ts`, com teste de que todos os ids dos requisitos existem. — R1, R2, R3, R4, R5, R6
- [ ] **E2. Relógio comum** `lib/audio/clock.ts` com testes; `MetronomePanel` passa a usá-lo, com o mesmo comportamento. — R4.4, R5.4, R6.2
- [ ] **E3. Progresso** `lib/exercises/progress.ts` com testes; migração `docs/migrations/003-exercicios.sql` e passo a passo para o usuário aplicar. — R7
- [ ] **E4. Catálogo na tela** `ExerciseCatalog` em `/app/exercicios` (filtros, cadeado pelo `lib/plans.ts`, melhor resultado e última prática) e `ExercisePlayerPage` em `/app/exercicios/[id]`; retirar o catálogo fixo antigo. — R1, R8
- [ ] **E5. Componentes comuns** `TempoControl`, `CountIn`, `SessionSummary`. — R2.5, R4.4, R4.5, R6.5

## Treino auditivo

- [ ] **E6. Lógica** `lib/exercises/ear.ts` com testes. — R2.1, R2.2, R3.1, R3.2
- [ ] **E7. `EarTrainer`** para intervalos e acordes, com atalhos de teclado; fotos para conferência. — R2, R3, R9.1, R9.2

## Escalas guiadas

- [ ] **E8. Lógica** `lib/exercises/scale-path.ts` com testes. — R4.1, R4.2, R4.3
- [ ] **E9. `Fretboard` com `marks`** (nota atual e próxima), sem mudar o resto. — R4.4
- [ ] **E10. `ScaleGuide`**: contagem, avanço por batida, tocar junto, repetições, pausar; fotos. — R4

## Progressões

- [ ] **E11. Lógica** `lib/exercises/progressions.ts` com testes; extrair `ChordShapeDiagram`. — R5.1, R5.2, R5.3
- [ ] **E12. `ProgressionTrainer`**: atual e próximo, compasso, voltas, tonalidades liberadas; fotos. — R5

## Ritmo

- [ ] **E13. Lógica** `lib/exercises/rhythm.ts` (padrões, pontuação, calibração) com testes. — R6.1, R6.4, R6.5, R6.7
- [ ] **E14. `RhythmCalibration`**. — R6.7
- [ ] **E15. `RhythmTrainer`**: grade, cursor, Espaço/F/J e toque, marcação de cada batida, resultado; fotos com teclas simuladas. — R6

## Fechamento

- [ ] **E16. Verificação completa**: os 23 exercícios abrem; uma sessão de cada categoria grava no Supabase; a fila funciona sem rede; celular com 360 px de largura; fotos para o usuário aprovar. — R7, R9
