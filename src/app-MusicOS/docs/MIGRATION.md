# MusicOS — Plano de Migração do musicpages

> **Versão:** 1.0  
> **Data:** 23 de outubro de 2026  
> **Status:** Aprovado para execução  
> **Objetivo:** Portar código existente do musicpages para arquitetura Next.js

---

## 1. Inventário do Código Legado

### 1.1 Arquivos Principais (src/musicpages/scripts/)

| Arquivo | Linhas | O Que Faz | Prioridade |
|---------|--------|-----------|------------|
| `script.js` | ~500 | Main app logic, event handlers | Alta |
| `script-escalas.js` | ~400 | Engine de escalas e campo harmônico | Alta |
| `script-fretboard.js` | ~600 | Renderização do fretboard | Alta |
| `script-audio-engine.js` | ~300 | Web Audio API wrapper | Alta |
| `script-chord-diagrams.js` | ~500 | SVG chord diagrams | Alta |
| `script-instrument-registry.js` | ~200 | Perfis de instrumentos | Média |
| `script-metronome.js` | ~200 | Metrônomo digital | Média |
| `script-circle-of-fifths.js` | ~200 | Círculo de quintas | Média |
| `script-scale-circle.js` | ~150 | Círculo de escalas | Média |
| `script-custom-tuning.js` | ~150 | Afinações customizadas | Baixa |
| `script-instrument-selector.js` | ~100 | UI de seleção de instrumento | Baixa |
| `script-sidebar.js` | ~100 | Navigation sidebar | Baixa |
| `script-floating-popup.js` | ~100 | Popup flutuante | Baixa |
| `script-nav.js` | ~50 | Navigation logic | Baixa |

**Total:** ~3.550 linhas de código JavaScript funcional

### 1.2 Arquivos de Estilo

| Arquivo | O Que Faz |
|---------|-----------|
| `styles/style.css` | Estilos principais |
| `styles/style-responsive.css` | Responsividade |
| `styles/style-fretboard.css` | Estilos do fretboard |

### 1.3 Arquivo HTML

| Arquivo | O Que Faz |
|---------|-----------|
| `index.html` | Estrutura da página única |

---

## 2. Estratégia de Migração

### 2.1 Abordagem: Strangler Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MIGRATION TIMELINE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  MÊS 1          MÊS 2          MÊS 3          MÊS 4                │
│  │               │               │               │                  │
│  └───────────────┴───────────────┴───────────────┘                  │
│                  NEXT.JS APP CRIAÇÃO                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Semanas 1-2: Setup + Estrutura + Core Pages                │   │
│  │  Semanas 3-4: Port Escalas + Fretboard + Audio              │   │
│  │  Semanas 5-6: Port Acordes + Metrônomo + Auth               │   │
│  │  Semanas 7-8: Stripe + Paywall + Deploy MVP                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mapeamento de Arquivos

```
musicpages/                    →  music-os/src/
├── scripts/script.js          →  lib/legacy/main.ts
├── scripts/script-escalas.js  →  lib/music-theory/scales.ts
├── scripts/script-fretboard.js →  components/fretboard/Fretboard.tsx
├── scripts/script-audio-engine.js → lib/audio/AudioEngine.ts
├── scripts/script-chord-diagrams.js → components/chords/ChordDiagram.tsx
└── index.html                 →  app/page.tsx (estrutura)
```

### 2.3 Princípios de Migração

1. **Funcionalidade primeiro:** Mantém comportamento, migra depois
2. **Typing gradual:** JS → JSDoc → TypeScript
3. **Componentização:** Funções → Componentes React
4. **State management:** Variáveis globais → React State/Zustand
5. **Tests:** Adicionar testes conforme migra

---

## 3. Plano Detalhado de Migração

### FASE 1.1: Setup Inicial (Semanas 1-2)

#### Sprint 1.1.1: Ambiente

```bash
# Criar projeto Next.js
npx create-next-app@latest music-os \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

cd music-os

# Instalar dependências
npm install @supabase/supabase-js zustand @tanstack/react-query
npm install -D vitest @testing-library/react
```

#### Sprint 1.1.2: Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # App routes
│   ├── api/               # API routes
│   └── page.tsx           # Landing
├── components/
│   ├── ui/                # shadcn/ui
│   ├── scales/            # Escalas
│   ├── fretboard/         # Fretboard
│   ├── chords/            # Acordes
│   ├── tools/             # Ferramentas
│   └── educational/       # Sistema educacional
├── lib/
│   ├── legacy/            # Código portado (compatibilidade)
│   ├── music-theory/      # Teoria musical
│   ├── audio/             # Audio engine
│   ├── supabase/          # Supabase client
│   └── stripe/            # Stripe integration
├── hooks/                 # Custom hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

#### Sprint 1.1.3: Landing Page Base

- Criar layout similar ao index.html atual
- shadcn/ui para componentes
- Tailwind para estilos

### FASE 1.2: Core Porting (Semanas 3-4)

#### 1.2.1 AudioEngine (PRIORIDADE ALTA)

```typescript
// src/lib/audio/AudioEngine.ts

// Port de: script-audio-engine.js
// Adicionar: TypeScript types, React hooks integration

import { useCallback, useRef, useState } from 'react';

interface AudioEngineConfig {
  timbre?: 'sine' | 'square' | 'sawtooth' | 'triangle';
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
}

// Adicionar types do arquivo original
export function useAudioEngine() {
  // ...
}
```

#### 1.2.2 Music Theory Engine (PRIORIDADE ALTA)

```typescript
// src/lib/music-theory/scales.ts

// Port de: script-escalas.js
// Adicionar: TypeScript types, exports limpos

import { NOTE_NAMES, CHROMATIC_SCALE } from './constants';

export function calculateScale(tonic: string, scaleType: string): string[] {
  // Funcionalidade do original
}

export function generateHarmonicField(tonic: string, scaleType: string): string[][] {
  // Funcionalidade do original
}
```

#### 1.2.3 Fretboard Component (PRIORIDADE ALTA)

```typescript
// src/components/fretboard/Fretboard.tsx

// Port de: script-fretboard.js
// Adicionar: React component, props, events

import { useState, useEffect, useCallback } from 'react';
import { useAudioEngine } from '@/lib/audio/AudioEngine';

interface FretboardProps {
  instrument: InstrumentProfile;
  tuning?: string[];
  highlightedNotes?: string[];
  onNoteClick?: (note: string, midi: number) => void;
}

export function Fretboard({ instrument, onNoteClick }: FretboardProps) {
  // Renderizar SVG do fretboard
  // Integrar com audio engine
  // Suportar highlighting de escalas
}
```

### FASE 1.3: Components Adicionais (Semanas 5-6)

#### 1.3.1 Chord Diagrams

```typescript
// src/components/chords/ChordDiagram.tsx

// Port de: script-chord-diagrams.js
// Adicionar: React, SVG generation

import { ChordShape } from '@/types/music';

interface ChordDiagramProps {
  chordName: string;
  shape: ChordShape;
  width?: number;
  height?: number;
  onPlay?: () => void;
}
```

#### 1.3.2 Metronome

```typescript
// src/components/tools/Metronome.tsx

// Port de: script-metronome.js
// Adicionar: React state, audio engine integration
```

#### 1.3.3 Circle of Fifths

```typescript
// src/components/scales/CircleOfFifths.tsx

// Port de: script-circle-of-fifths.js
// Adicionar: React, interatividade
```

### FASE 1.4: Backend Integration (Semanas 7-8)

#### 1.4.1 Supabase Auth + Database

```typescript
// src/lib/supabase/client.ts
// src/lib/supabase/server.ts
```

#### 1.4.2 Stripe Integration

```typescript
// src/lib/stripe/checkout.ts
// src/app/api/webhooks/stripe/route.ts
```

#### 1.4.3 Paywall Component

```typescript
// src/components/ui/Paywall.tsx
// Bloqueia features baseado no tier do usuário
```

---

## 4. Mapeamento Técnico Detalhado

### 4.1 script-escalas.js → music-theory/scales.ts

```typescript
// ORIGINAL (script-escalas.js)
function calcularEscala() {
  var tonica = document.getElementById('tonica').value;
  var tipo = document.getElementById('tipoEscala').value;
  // ...
}

// MIGRADO
export function calculateScale(tonic: string, scaleType: ScaleType): ScaleResult {
  // Types adicionados
  // Código portado 1:1
  // Retorno tipado
}
```

### 4.2 script-fretboard.js → components/fretboard/Fretboard.tsx

```typescript
// ORIGINAL (script-fretboard.js)
var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function initializeFretboard() {
  applyInstrumentProfile('guitarra-6');
}

// MIGRADO
interface FretboardState {
  profileId: string;
  tuning: string[];
  scaleNotes: string[] | null;
}

export function useFretboard() {
  const [state, setState] = useState<FretboardState>(initialState);
  // React hooks
  // TypeScript types
}
```

### 4.3 script-audio-engine.js → lib/audio/AudioEngine.ts

```typescript
// ORIGINAL (script-audio-engine.js)
var AudioEngine = (function () {
  'use strict';
  
  function playNote(midiNote, timbre, adsr) {
    // ...
  }
  
  return { playNote, stopNote, ... };
})();

// MIGRADO
export class AudioEngine {
  private context: AudioContext | null = null;
  
  playNote(midiNote: number, timbre?: OscillatorType, adsr?: ADSR): void {
    // TypeScript + Class
  }
}
```

### 4.4 script-chord-diagrams.js → components/chords/ChordDiagram.tsx

```typescript
// ORIGINAL (script-chord-diagrams.js)
function parseChordName(name) {
  var root = name.charAt(0);
  // ...
}

// MIGRADO
export function parseChordName(name: string): { root: string; quality: string } {
  // TypeScript + Util function
}
```

---

## 5. Checklist de Migração

### Legado → Moderno

| Arquivo Original | Novo Destino | Status |
|------------------|--------------|--------|
| `script.js` | `lib/legacy/main.ts` | ⏳ Pending |
| `script-escalas.js` | `lib/music-theory/scales.ts` | ⏳ Pending |
| `script-fretboard.js` | `components/fretboard/Fretboard.tsx` | ⏳ Pending |
| `script-audio-engine.js` | `lib/audio/AudioEngine.ts` | ⏳ Pending |
| `script-chord-diagrams.js` | `components/chords/ChordDiagram.tsx` | ⏳ Pending |
| `script-instrument-registry.js` | `lib/music-theory/instruments.ts` | ⏳ Pending |
| `script-metronome.js` | `components/tools/Metronome.tsx` | ⏳ Pending |
| `script-circle-of-fifths.js` | `components/scales/CircleOfFifths.tsx` | ⏳ Pending |
| `script-scale-circle.js` | `components/scales/ScaleCircle.tsx` | ⏳ Pending |
| `script-custom-tuning.js` | `components/instruments/CustomTuning.tsx` | ⏳ Pending |
| `script-sidebar.js` | `components/layout/Sidebar.tsx` | ⏳ Pending |

---

## 6. Validação de Funcionalidade

### Teste de Smoke Por Feature

| Feature | Teste | Status |
|---------|-------|--------|
| **Escalas** | Gerar C Major → 7 notas corretas | ⏳ |
| **Fretboard** | Clicar nota → toca som | ⏳ |
| **Campo Harmônico** | C Major → 7 acordes corretos | ⏳ |
| **Acordes** | Renderizar C → diagrama correto | ⏳ |
| **Metrônomo** | 120 BPM → 2 clicks/segundo | ⏳ |
| **Círculo de Quintas** | 12 notas em círculo | ⏳ |

---

## 7. Diferenciais a Adicionar

### Novos (Não Existiam no Original)

| Feature | Descrição | Prioridade |
|---------|-----------|------------|
| **InfoButton** | Sistema de ajuda contextual | Alta |
| **Paywall** | Controle de acesso por tier | Alta |
| **Auth** | Login/cadastro com Supabase | Alta |
| **Stripe** | Assinaturas | Alta |
| **Exercícios** | Gerador de exercícios | Média |
| **Gamificação** | Conquistas, streaks | Baixa |

---

## 8. Timeline Final

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TIMELINE DE MIGRAÇÃO                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SEMANA 1-2: SETUP                                                  │
│  ├── Criar projeto Next.js                                          │
│  ├── Configurar TypeScript + Tailwind                               │
│  ├── Setup Supabase Free                                            │
│  └── Criar landing page base                                        │
│                                                                     │
│  SEMANA 3-4: CORE                                                   │
│  ├── AudioEngine (portado)                                          │
│  ├── Music Theory (portado)                                         │
│  ├── Fretboard (portado)                                            │
│  └── Audio Engine + Fretboard integrados                            │
│                                                                     │
│  SEMANA 5-6: COMPONENTS                                             │
│  ├── Chord Diagrams (portado)                                       │
│  ├── Metronome (portado)                                            │
│  ├── Circle of Fifths (portado)                                     │
│  └── Instrument Registry (portado)                                  │
│                                                                     │
│  SEMANA 7-8: BACKEND + MVP                                          │
│  ├── Supabase Auth                                                  │
│  ├── Stripe Checkout                                                │
│  ├── Paywall System                                                 │
│  └── DEPLOY MVP                                                     │
│                                                                     │
│  TOTAL: 8 SEMANAS (2 MESES)                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Próximos Passos Imediatos

1. [ ] **Confirmar estrutura** de pastas acima
2. [ ] **Criar projeto Next.js** (eu posso fazer isso se tiver acesso)
3. [ ] **Portar primeiro arquivo** (sugiro script-audio-engine.js como teste)
4. [ ] **Validar** que funciona
5. [ ] **Continuar** com o resto

---

*Documento criado em 23 de outubro de 2026*  
*Versão 1.0 — Estratégia de Migração Aprovada*