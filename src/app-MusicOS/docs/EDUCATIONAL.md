# MusicOS — Sistema Educacional e Exercícios

> **Versão:** 1.0  
> **Data:** 23 de outubro de 2026  
> **Status:** Planejado para Fase 3+  
> **Doc Relacionado:** MUSICOS-SPEC.md, issues.md

---

## 1. Visão Geral do Sistema Educacional

### 1.1 Objetivo

Criar um ecossistema de aprendizado que guia o músico do básico ao avançado, combinando teoria com prática orientada. O diferencial é a **educação contextual** — cada conceito é explicado no momento em que o usuário está praticando.

### 1.2 Pilares do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PILARES EDUCACIONAIS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. EDUCAÇÃO CONTEXTUAL                                           │
│      └── Explicações aparecem quando relevantes                    │
│          └── Botão "i" em cada seção                               │
│          └── Popups com exemplos práticos                          │
│                                                                     │
│   2. EXERCÍCIOS PROGRESSIVOS                                        │
│      └── Do fácil ao difícil                                       │
│          └── Exercícios guiados com metrônomo                      │
│          └── Feedback em tempo real                                │
│                                                                     │
│   3. TÉCNICAS INSTRUMENTAIS                                         │
│      └── Tapping, hammer-on, pull-offs, bends, etc.                │
│          └── Demonstrações visuais                                 │
│          └── Exercícios específicos por técnica                    │
│                                                                     │
│   4. GERAÇÃO INTELIGENTE                                           │
│      └── Exercícios baseados no contexto do usuário                │
│          └── Sequências de acordes na tonalidade ativa             │
│          └── Licks no estilo do usuário                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sistema de Ajuda Contextual (Botão "i")

### 2.1 Conceito

Cada seção educacional terá um **ícone de informação (i)** que, quando clicado, exibe um popup com explicação contextual sobre aquele conceito.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CICLO DE QUINTAS                                           │   │
│  │  ═══════════════════════════════════════════                │   │
│  │                                                             │   │
│  │        C ─── G ─── D ─── A ─── E ─── B                     │   │
│  │        │    │    │    │    │    │                         │   │
│  │        ▼    ▼    ▼    ▼    ▼    ▼                         │   │
│  │       F#   C#   G#   D#   A#   F                          │   │
│  │                                                             │   │
│  │                                          (i) ← Botão info  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component: InfoButton

```typescript
// components/ui/InfoButton.tsx
import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoButtonProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top-right' | 'top-left' | 'inline';
}

export function InfoButton({ content, title = 'Informações', position = 'top-right' }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="info-button flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold hover:bg-blue-200 transition-colors"
        aria-label="Mais informações"
      >
        <Info size={12} />
      </button>

      {isOpen && (
        <div className={`info-popup absolute z-50 w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${positionClasses[position]}`}>
          <div className="flex justify-between items-start mb-2">
            {title && <h4 className="font-bold text-sm">{title}</h4>}
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

const positionClasses = {
  'top-right': 'top-0 right-6 mt-2',
  'top-left': 'top-0 left-6 mt-2',
  'inline': 'static ml-2',
};
```

### 2.3 Exemplos de Conteúdo por Seção

#### Ciclo de Quintas

```markdown
# O Que é o Ciclo de Quintas?

O **Ciclo de Quintas** é uma sequência de tons que passa por todas as 12 notas musicais, subindo cada vez uma quinta acima (7 semitons).

## Como Usar no Estudio

1. **Pratique os acordes em cada grau** — eles formam progressões comuns
2. **Transposição** — qualquer progressão pode ser transposta usando o ciclo
3. **Improvisação** — as notas de cada acorde são a base para solos

## Exemplo Prático

A progressão **I-IV-V-I** (C-F-G-C) é uma das mais usadas na música ocidental. Você encontra ela em centenas de músicas!

## Dica de Prática

Comece devagar (60 BPM) e aumente gradualmente. Use o metrônomo para manter o ritmo!
```

#### Campo Harmônico

```markdown
# Entendendo o Campo Harmônico

O **Campo Harmônico** de uma tonalidade contém os 7 acordes que "pertencem" àquela escala. Cada grau tem uma função específica.

## Os 7 Graus

| Grau | Função | Acorde (C Major) | Característica |
|------|--------|------------------|----------------|
| I    | Tônica | C                | Estável        |
| ii   | Supertônica | Dm        | Instável       |
| III  | Mediante | Em         | Estável-macio  |
| IV   | Subdominante | F     | Instável       |
| V    | Dominante | G         | Tensivo        |
| vi   | Relativo menor | Am  | Estável-macio  |
| vii° | Sensível | Bdim       | Muito tensivo  |

## Aplicação Prática

Quando encontrar uma cifra, olhe o grau! Isso ajuda a entender o "papel" do acorde na música.
```

#### Escalas

```markdown
# Por Que Estudar Escalas?

As **escalas** são como um "cardápio de notas" que você pode usar para tocar melodias e solos.

## A Escala Maior

A escala maior é a base da música ocidental. Ela segue o padrão:

**T-T-S-T-T-T-S** (Tom-Tom-Semitom)

Isso significa: 2 tons, 1 semitom, 3 tons, 1 semitom.

## Como Memorizar

1. Aprenda os intervalos (2ª, 3ª, 4ª, etc.)
2. Pratique no fretboard em uma posição
3. Expanda para outras posições gradualmente
```

### 2.4 Banco de Conteúdos (Content DB)

```typescript
// lib/educational-content.ts

export interface EducationalContent {
  id: string;
  section: 'circle-of-fifths' | 'scales' | 'chords' | 'fretboard' | 'techniques' | 'metronome';
  title: string;
  content: string; // Markdown
  examples?: string[];
  tips?: string[];
  relatedSections?: string[];
}

export const educationalContent: Record<string, EducationalContent> = {
  'circle-of-fifths': {
    id: 'circle-of-fifths',
    section: 'circle-of-fifths',
    title: 'O Ciclo de Quintas',
    content: `O **Ciclo de Quintas** é uma sequência que passa por todas as 12 notas...`,
    examples: ['I-IV-V-I em C', 'ii-V-I em G'],
    tips: ['Comece devagar', 'Use o metrônomo'],
    relatedSections: ['chords', 'scales'],
  },
  // ... mais conteúdos
};
```

---

## 3. Gerador de Exercícios

### 3.1 Arquitetura do Gerador

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GERADOR DE EXERCÍCIOS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Input     │───▶│  Generator  │───▶│  Output     │            │
│  │  (Params)   │    │  Engine     │    │  (Exercise) │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│       │                   │                   │                     │
│       │                   │                   ▼                     │
│       │                   │            ┌─────────────┐            │
│       │                   │            │  Renderer   │            │
│       │                   │            │  (UI)       │            │
│       │                   │            └─────────────┘            │
│       ▼                   ▼                   │                     │
│  ┌─────────────┐    ┌─────────────┐            ▼                     │
│  │  Settings   │    │  Database   │    ┌─────────────┐            │
│  │  UI         │    │  (Patterns) │    │  Player     │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Tipos de Exercícios

#### 3.2.1 Exercícios de Sequência de Acordes

```typescript
interface ChordProgressionExercise {
  type: 'chord-progression';
  progression: {
    chords: string[];  // ['C', 'Dm', 'G', 'C']
    tempo: number;     // BPM
    beatsPerChord: number;  // 4 = 1 compasso por acorde
    repetitions: number;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

const beginnerProgressions: ChordProgressionExercise[] = [
  {
    type: 'chord-progression',
    progression: {
      chords: ['C', 'G', 'Am', 'F'],
      tempo: 80,
      beatsPerChord: 4,
      repetitions: 4,
    },
    difficulty: 'beginner',
    description: 'A clássica progressão pop! Aprenda trocar entre acordes no ritmo.',
  },
  // ...
];
```

#### 3.2.2 Exercícios de Escalas

```typescript
interface ScaleExercise {
  type: 'scale';
  scale: string;        // 'C major'
  pattern: string;      // '1-2-3-4-5-6-7-8'
  direction: 'up' | 'down' | 'up-down' | 'interval';
  tempo: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const scaleExercises: ScaleExercise[] = [
  {
    type: 'scale',
    scale: 'C major',
    pattern: '1-2-3-4-5-6-7-8',
    direction: 'up-down',
    tempo: 80,
    difficulty: 'beginner',
  },
  {
    type: 'scale',
    scale: 'C major',
    pattern: '1-3-5-8-7-5-3-1',
    direction: 'arpeggio',
    tempo: 100,
    difficulty: 'intermediate',
  },
];
```

#### 3.2.3 Exercícios de Licks e Frases

```typescript
interface LicksExercise {
  type: 'licks';
  style: 'blues' | 'jazz' | 'rock' | 'country';
  scale: string;
  licks: {
    notes: string[];
    rhythm: string;  // '4/4, 1-1-1-1'
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
}
```

#### 3.2.4 Exercícios de Técnicas

```typescript
interface TechniqueExercise {
  type: 'technique';
  technique: 'tapping' | 'hammer-on' | 'pull-off' | 'bends' | 'slides' | 'vibrato' | 'two-hands';
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: {
    instruction: string;
    tab: string;      // Tablatura simplificada
    tempo: number;
    repetitions: number;
  }[];
  tips: string[];
}

// Exemplo: Exercício de Tapping
const tappingExercises: TechniqueExercise[] = [
  {
    type: 'technique',
    technique: 'tapping',
    level: 'beginner',
    steps: [
      {
        instruction: 'Pressione a nota com o dedo indicador da mão direita',
        tab: 'e|--5-----|',
        tempo: 60,
        repetitions: 10,
      },
      {
        instruction: 'Agora adicione o tapping na nota 7',
        tab: 'e|--5-7----|',
        tempo: 60,
        repetitions: 10,
      },
    ],
    tips: [
      'Mantenha as unhas curtas na mão direita',
      'Use a ponta do dedo, não a polpa',
      'Comece devagar e aumente gradualmente',
    ],
  },
];
```

### 3.3 Gerador de Exercícios Aleatórios

```typescript
// lib/exercise-generator.ts

interface ExerciseGeneratorParams {
  type: 'chords' | 'scales' | 'licks' | 'technique';
  scale?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutos
}

export function generateExercise(params: ExerciseGeneratorParams): Exercise {
  switch (params.type) {
    case 'chords':
      return generateChordExercise(params);
    case 'scales':
      return generateScaleExercise(params);
    case 'licks':
      return generateLicksExercise(params);
    case 'technique':
      return generateTechniqueExercise(params);
  }
}

function generateChordExercise(params: ExerciseGeneratorParams) {
  const progressions = getProgressionsForScale(params.scale || 'C major');
  const random = progressions[Math.floor(Math.random() * progressions.length)];
  
  return {
    ...random,
    tempo: params.difficulty === 'beginner' ? 60 : 
           params.difficulty === 'intermediate' ? 80 : 100,
    duration: params.duration,
  };
}
```

---

## 4. Exercícios Guiados com Metrônomo

### 4.1 Interface do Exercício Guiado

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXERCÍCIO GUIADO                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ESCALA DE C MAIOR - POSIÇÃO 1                              │   │
│  │  Dificuldade: Iniciante  |  Tempo: 80 BPM                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │    e|--8-10-12---------------------------------------------|  │   │
│  │    B|-----9-10----9----------------------------------------|  │   │
│  │    G|---------7-9------7-9---------------------------------|  │   │
│  │    D|----7-9--------7-9----7-9----------------------------|  │   │
│  │    A|-5-7----------5-7------5-7---------------------------|  │   │
│  │    E|----------------5----------5-------------------------|  │   │
│  │                                                             │   │
│  │    ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲            │   │
│  │    1   2   3   4   5   6   7   8                           │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [▶ INICIAR]  [⏸ PAUSAR]  [- +] 80 BPM  [+ -]              │   │
│  │  Repetições: 5/10  │  Sentido: Subir e Descer               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  (i) DICA: Mantenha os dedos curvados como "garras"         │   │
│  │       enquanto toca para maior velocidade e precisão.       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component: GuidedExercisePlayer

```typescript
// components/exercises/GuidedExercisePlayer.tsx

interface GuidedExercisePlayerProps {
  exercise: Exercise;
  onComplete?: (result: ExerciseResult) => void;
}

export function GuidedExercisePlayer({ exercise, onComplete }: GuidedExercisePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(0);
  const [tempo, setTempo] = useState(exercise.tempo);
  const [repetitions, setRepetitions] = useState(0);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = 60000 / tempo; // ms por nota
    const timer = setInterval(() => {
      setCurrentNote(prev => {
        if (prev >= exercise.notes.length - 1) {
          setRepetitions(r => r + 1);
          return 0;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPlaying, tempo, exercise]);
  
  // Reproduzir som da nota atual
  useEffect(() => {
    if (isPlaying && exercise.notes[currentNote]) {
      AudioEngine.playNote(midiFromNote(exercise.notes[currentNote]));
    }
  }, [currentNote, isPlaying]);
  
  return (
    <div className="exercise-player">
      <div className="exercise-visualization">
        {/* Render tabs with current note highlighted */}
        {exercise.tabs.map((string, i) => (
          <div key={i} className="string-row">
            {string.notes.map((note, j) => (
              <span 
                className={`note ${j === currentNote ? 'active' : ''}`}
                key={j}
              >
                {note.fret}
              </span>
            ))}
          </div>
        ))}
      </div>
      
      <div className="exercise-controls">
        <Button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸ Pausar' : '▶ Iniciar'}
        </Button>
        
        <div className="tempo-control">
          <Button onClick={() => setTempo(t => Math.max(40, t - 5))}>-</Button>
          <span>{tempo} BPM</span>
          <Button onClick={() => setTempo(t => Math.min(200, t + 5))}>+</Button>
        </div>
      </div>
      
      <div className="exercise-progress">
        Repetições: {repetitions} / {exercise.repetitions}
        <ProgressBar value={repetitions / exercise.repetitions} />
      </div>
      
      {onComplete && repetitions >= exercise.repetitions && (
        <CompletionDialog onComplete={() => onComplete({ ...exercise, repetitions })} />
      )}
    </div>
  );
}
```

---

## 5. Exercícios por Técnica

### 5.1 Tapping

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TÉCNICA: TAPPING                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  (i) O que é tapping?                                               │
│  Tapping é uma técnica onde você "dá notas" com os dedos            │
│  da mão direita (ou esquerda) diretamente sobre o traste,          │
│  criando um efeito de velocidade e legato.                          │
│                                                                     │
│  NÍVEL INICIANTE                                                    │
│  ───────────────────                                                │
│  Exercício 1: Notas únicas                                          │
│  e|--5-7-5-7-5-7----------------------------------------------------| 60 BPM 10x  │
│                                                                     │
│  Exercício 2: Two-Hand Tapping                                      │
│  e|--5-7-----|--5-7-----|--5-7-----|--5-7-------------------------| 60 BPM 5x   │
│         (tap)       (tap)                                           │
│                                                                     │
│  NÍVEL INTERMEDIÁRIO                                                │
│  ────────────────────────                                           │
│  Exercício 3: Tapping com cordas vazias                             │
│  e|------12-14-----|--12-14----|----------------------------------| 80 BPM 8x   │
│  B|-10-12----10-12-|--10-12----|                                  │
│  G|----------------|----------|                                   │
│                                                                     │
│  DICA: Comece devagar. Qualidade > Velocidade!                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Hammer-On e Pull-Off

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TÉCNICA: HAMMER-ON / PULL-OFF                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  (i) Conceito                                                      │
│  Hammer-on: bater o dedo no traste para produzir som               │
│  Pull-off: puxar o dedo do traste para produzir som                │
│  Resultado: Notas sem plucking!                                    │
│                                                                     │
│  NÍVEL INICIANTE                                                    │
│  ───────────────────                                                │
│  Exercício 1: Básico (2 notas)                                      │
│  e|--3p1--3p1--3p1--3p1--------------------------------------------| 60 BPM     │
│      ^^     ^^     ^^     ^^                                       │
│      HO     PO     HO     PO                                       │
│                                                                     │
│  Exercício 2: Três notas                                            │
│  e|--3p1p3--3p1p3--3p1p3-------------------------------------------| 60 BPM     │
│                                                                     │
│  NÍVEL INTERMEDIÁRIO                                                │
│  ────────────────────────                                           │
│  Exercício 3: Sequência cromática                                   │
│  e|--3p2p3p2--3p2p3p2---------------------------------------------| 80 BPM     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Bends

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TÉCNICA: BENDS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  (i) O que é bend?                                                  │
│  Bend é quando você empurra a corda para cima,                     │
│  aumentando a afinação da nota.                                     │
│                                                                     │
│  TIPOS DE BENDS:                                                    │
│  • 1/4 tone (meio traste) — som "choroso"                          │
│  • 1/2 tone (um traste) — som "entre" duas notas                   │
│  • Full bend (dois trastes) — sobe uma nota inteira                │
│  • Release bend — bend e solta                                      │
│                                                                     │
│  NÍVEL INICIANTE                                                    │
│  ───────────────────                                                │
│  Exercício 1: 1/4 tone bend                                         │
│  e|--7b9--7---------|--7b9--7-------------------------------------| 60 BPM     │
│                                                                     │
│  Exercício 2: Full bend com release                                 │
│  e|--7b9r7----------|--7b9r7-------------------------------------| 60 BPM     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.4 Two-Hands Technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TÉCNICA: TWO HANDS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  (i) O que é two-hands?                                             │
│  Técnica onde ambas as mãos tocam no fretboard,                    │
│  comum em tapping avançado e steel guitar.                          │
│                                                                     │
│  NÍVEL AVANÇADO                                                     │
│  ───────────────────                                               │
│  Exercício 1: Basic two-hand pattern                                │
│  e|--5-7---------|--5-7---------|--5-7---------|--------------------| 80 BPM     │
│       ^^^             ^^^             ^^^                           │
│       LHO             LHO             LHO                           │
│  e|------7-5-------|------7-5-------|------7-5-------|------------- |             |
│         (tap)           (tap)           (tap)                         |
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Integração com o Restante do App

### 6.1 Menu de Exercícios

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRÁTICA E EXERCÍCIOS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │  🎵 Exercícios   │  │  🎸 Técnicas     │                       │
│  │  de Acordes     │  │  Instrumentais   │                       │
│  └──────────────────┘  └──────────────────┘                       │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │  📊 Escalas     │  │  🎼 Licks e      │                       │
│  │  e Padrões      │  │  Frases          │                       │
│  └──────────────────┘  └──────────────────┘                       │
│                                                                     │
│  ┌─────────────────────────────────────────────┐                   │
│  │  🎯 GERADOR DE EXERCÍCIOS                   │                   │
│  │  [ Selecione o que praticar... ]            │                   │
│  └─────────────────────────────────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Integração com Seções Existentes

| Seção | Info Button | Exercícios Gerados |
|-------|-------------|-------------------|
| **Ciclo de Quintas** | ✅ Explicação do ciclo | Progressões em cada tom |
| **Campo Harmônico** | ✅ Função de cada grau | Exercícios de mudança de acorde |
| **Escalas** | ✅ Padrão da escala | Exercícios de escala na tonalidade ativa |
| **Fretboard** | ✅ Visualização de notas | Exercícios de posicionamento |
| **Acordes** | ✅ Formação do acorde | Exercícios de mudança |

---

## 7. Banco de Dados de Exercícios

```typescript
// lib/exercises/database.ts

export const exerciseDatabase = {
  scales: {
    'c-major-beginner': {
      name: 'C Major Scale - Position 1',
      difficulty: 'beginner',
      tempo: 60,
      notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
      tabs: [
        { string: 'E', open: null, frets: [null, null, null, 1, 2, 3] },
        { string: 'A', open: null, frets: [null, null, 2, 3, null, null] },
        { string: 'D', open: null, frets: [null, 2, 3, null, null, null] },
        { string: 'G', open: null, frets: [2, 3, null, null, null, null] },
        { string: 'B', open: null, frets: [1, 2, null, null, null, null] },
        { string: 'E', open: true, frets: [null, null, null, null, null, null] },
      ],
      tips: ['Mantenha os dedos curvados', 'Comece devagar'],
      videoUrl: '/videos/c-major-scale.mp4',
    },
    // ...
  },
  
  techniques: {
    'tapping-beginner': {
      name: 'Tapping - Introdução',
      technique: 'tapping',
      difficulty: 'beginner',
      steps: [
        { description: 'Toque a nota 5 no E agudo', tabs: 'e|--5-----|', tempo: 60 },
        { description: 'Dê tap na nota 7', tabs: 'e|--5-7----|', tempo: 60 },
        { description: 'Alternando', tabs: 'e|--5-7-5-7-|', tempo: 60 },
      ],
      tips: ['Unhas curtas', 'Use a ponta do dedo'],
    },
    // ...
  },
  
  progressions: {
    'c-f-g-c': {
      name: 'I-IV-V-I in C Major',
      difficulty: 'beginner',
      chords: ['C', 'F', 'G', 'C'],
      tempo: 80,
      beatsPerChord: 4,
      description: 'A progressão mais clássica da música!',
    },
    // ...
  },
};
```

---

## 8. Progressão e Gamificação

### 8.1 Sistema de Conquistas de Exercícios

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CONQUISTAS                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🥉 INICIANTE                                                       │
│  └── Primeiro exercício completado                                  │
│                                                                     │
│  🥈 PRATICANTE                                                      │
│  └── 10 exercícios completados                                      │
│                                                                     │
│  🥇 DEDICADO                                                        │
│  └── 50 exercícios completados                                      │
│                                                                     │
│  🎵 ESCALISTA                                                       │
│  └── Praticou todas as escalas maiores                              │
│                                                                     │
│  🎸 TÉCNICO                                                         │
│  └── Dominou 5 técnicas diferentes                                  │
│                                                                     │
│  ⏱️ METRÔNOMO                                                       │
│  └── Usou metrônomo por 7 dias seguidos                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Tracking de Progresso

```typescript
interface ExerciseProgress {
  exerciseId: string;
  totalRepetitions: number;
  lastPracticed: Date;
  averageTempo: number;
  streak: number; // dias seguidos
  completed: boolean;
}
```

---

## 9. Roadmap de Implementação

| Fase | Items | Prioridade |
|------|-------|------------|
| **Fase 2** | InfoButton component + Banco de conteúdos básicos | P1 |
| **Fase 2** | Exercícios de escalas básicos | P1 |
| **Fase 3** | Exercícios de acordes e progressões | P2 |
| **Fase 3** | Exercícios de técnicas (tapping, hammer-on, bends) | P2 |
| **Fase 3** | Gerador de exercícios aleatórios | P2 |
| **Fase 3** | Exercícios guiados com metrônomo | P2 |
| **Fase 4** | Sistema de gamificação | P3 |

---

*Documento criado em 23 de outubro de 2026*  
*Versão 1.0*