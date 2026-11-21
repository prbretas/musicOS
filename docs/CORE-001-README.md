# CORE-001: Music Theory Engine

## Status: 🟡 In Progress

## Descrição
Implementar o motor central de teoria musical para o MusicOS. Esta engine fornece todas as funcionalidades de cálculo de escalas, acordes, intervalos e teoria musical necessárias para o aplicativo.

## Critérios de Aceitação
- [ ] API unificada para teoria musical
- [ ] Suporte a 20+ tipos de escalas
- [ ] Suporte a 15+ tipos de acordes
- [ ] Cálculo de campo harmônico
- [ ] Sistema de intervalos
- [ ] Testes unitários com 80%+ cobertura
- [ ] Documentação completa da API
- [ ] Integração com componentes existentes

## Progresso

### ✅ Já Implementado (arquivos existentes)
1. **`src/lib/music-theory/scales.ts`** - Sistema completo de escalas
   - 20+ tipos de escalas (diatônicas, modos gregos, pentatônicas, exóticas)
   - Geração de notas de escala
   - Campo harmônico
   - Transposição

2. **`src/lib/music/theory.ts`** - Engine básica de teoria
   - Escalas e acordes básicos
   - Intervalos
   - Funções de utilidade

### 🔄 Em Desenvolvimento
1. **Organização da estrutura** - Unificar os dois sistemas
2. **API completa** - Interface unificada para toda teoria musical
3. **Testes unitários** - Cobertura completa
4. **Documentação** - Guia de uso da API

## Arquitetura Proposta

```
src/lib/music-theory/
├── index.ts              # Export principal
├── core/
│   ├── notes.ts         # Sistema de notas
│   ├── intervals.ts     # Sistema de intervalos
│   ├── scales.ts        # Sistema de escalas (existente)
│   └── chords.ts        # Sistema de acordes
├── engine/
│   └── theory-engine.ts # Engine principal unificada
├── types/
│   └── music.ts         # Tipos TypeScript
├── utils/
│   └── converters.ts    # Utilitários de conversão
└── __tests__/           # Testes unitários
```

## API a Implementar

### Notas
```typescript
getNoteIndex(note: string): number
transposeNote(note: string, semitones: number): string
normalizeNote(note: string): string
getEnharmonicEquivalent(note: string): string[]
```

### Intervalos
```typescript
getInterval(from: string, to: string): number
getIntervalName(semitones: number): string
isConsonantInterval(interval: number): boolean
```

### Escalas
```typescript
getScaleNotes(tonic: string, scaleType: ScaleType): string[]
getScaleInfo(scaleType: ScaleType): ScaleInfo
getAvailableScales(): ScaleType[]
getScalesByCategory(category: string): ScaleType[]
```

### Acordes
```typescript
getChordNotes(root: string, chordType: ChordType): string[]
getChordInfo(chordType: ChordType): ChordInfo
getChordExtensions(root: string, baseType: ChordType): ChordExtension[]
```

### Campo Harmônico
```typescript
getHarmonicField(tonic: string, scaleType: ScaleType): HarmonicDegree[]
getChordProgression(progression: string[], key: string): ChordProgression
```

### Modulação
```typescript
transposeScale(notes: string[], semitones: number): string[]
modulate(keyFrom: string, keyTo: string): ModulationResult
getRelativeMinor(majorKey: string): string
getRelativeMajor(minorKey: string): string
```

## Implementação

### Fase 1: Organização (hoje)
1. Criar estrutura de pastas organizada
2. Unificar os dois sistemas existentes
3. Criar API principal

### Fase 2: Expansão (amanhã)
1. Adicionar mais tipos de acordes
2. Implementar sistema de inversões
3. Adicionar extensões de acordes (9, 11, 13)

### Fase 3: Testes e Documentação
1. Escrever testes unitários
2. Documentar API completa
3. Criar exemplos de uso

## Dependências
- **Nenhuma** - Engine pura TypeScript
- **Compatível** com Node.js e navegadores
- **Isolada** do Supabase e outras dependências

## Integração com Componentes

### Componentes que usarão esta engine:
1. **ScaleDisplay** (CMP-004) - Exibe notas da escala
2. **ChordSelector** (CMP-006) - Seleciona acordes
3. **Fretboard** (CMP-002) - Exibe notas no braço
4. **ChordDiagram** (CMP-003) - Exibe diagramas de acordes

## Testes Planejados

### Testes Unitários
```typescript
// Escalas
test('C major scale has correct notes', () => {})
test('A minor scale has correct notes', () => {})
test('Scale transposition works correctly', () => {})

// Acordes
test('C major chord has correct notes', () => {})
test('Am chord has correct notes', () => {})
test('Chord inversions work correctly', () => {})

// Intervalos
test('Interval C to E is major third', () => {})
test('Interval calculation is correct', () => {})
```

### Testes de Integração
```typescript
test('ScaleDisplay uses theory engine correctly', () => {})
test('ChordSelector integrates with engine', () => {})
```

## Próximos Passos Imediatos

1. **Criar estrutura organizada** de pastas
2. **Unificar** `scales.ts` e `theory.ts`
3. **Criar API principal** `music-theory-engine.ts`
4. **Escrever primeiros testes**

---

**Responsável:** Desenvolvedor  
**Data de Início:** 11/11/2026  
**Estimativa:** 3-5 dias (M - Medium)  
**Dependências:** Nenhuma  
**Próxima Issue:** CORE-003: AudioEngine