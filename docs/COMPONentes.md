# MusicOS — Especificação de Componentes UI

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Aprovado

---

## 1. Componentes Base (shadcn/ui)

### 1.1 Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

function Button({ variant = 'default', size = 'default', ...props }): JSX.Element;
```

**Variantes:**
| Variante | Descrição | Uso |
|----------|-----------|-----|
| `default` | Primário, azul | Ações principais |
| `destructive` | Vermelho | Ações destrutivas |
| `outline` | Borda, transparente | Ações secundárias |
| `secondary` | Cinza | Ações terciárias |
| `ghost` | Sem fundo | Cancelar, navegação |
| `link` | Texto sublinhado | Links inline |

**Tamanhos:**
| Tamanho | Altura | Padding | Uso |
|---------|--------|---------|-----|
| `icon` | 40px | 8px | Ícones |
| `sm` | 36px | 12px | Compacto |
| `default` | 40px | 16px | Padrão |
| `lg` | 48px | 24px | CTAs grandes |

### 1.2 Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function Input({ error, ...props }): JSX.Element;
```

**Estados:**
- Default (borda cinza)
- Focus (borda azul, ring)
- Error (borda vermelha, mensagem)
- Disabled (fundo cinza)

### 1.3 Card

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ children, ...props }): JSX.Element;
```

**Estrutura:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Ações</CardFooter>
</Card>
```

### 1.4 Modal (Dialog)

```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }): JSX.Element;
function DialogTrigger({ children }): JSX.Element;
function DialogContent({ children }): JSX.Element;
function DialogHeader({ children }): JSX.Element;
function DialogFooter({ children }): JSX.Element;
```

---

## 2. Componentes MusicOS

### 2.1 InfoButton

```typescript
interface InfoButtonProps {
  /** Conteúdo educacional (string ou React node) */
  content: string | React.ReactNode;
  /** Título do popup */
  title?: string;
  /** Posição do popup */
  position?: 'top-right' | 'top-left' | 'inline';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** ID do conteúdo educacional (para tracking) */
  contentId?: string;
}

function InfoButton({ content, title, position, size, contentId }): JSX.Element;
```

**Comportamento:**
- Clique alterna `isOpen`
- Escape fecha popup
- Clique fora fecha popup
- Animação `fade-in zoom-in` (200ms)

**Exemplo de Uso:**
```tsx
<InfoButton 
  content="O ciclo de quintas é..."
  title="Ciclo de Quintas"
  position="top-right"
  contentId="circle-of-fifths"
/>
```

### 2.2 ScaleSelector

```typescript
interface ScaleSelectorProps {
  /** Tônica selecionada */
  tonic: NoteName | null;
  /** Tipo de escala selecionado */
  scaleType: ScaleType | null;
  /** Callback de mudança de tônica */
  onTonicChange: (tonic: NoteName) => void;
  /** Callback de mudança de tipo */
  onScaleTypeChange: (type: ScaleType) => void;
  /** Se está desabilitado */
  disabled?: boolean;
}

function ScaleSelector({ 
  tonic, 
  scaleType, 
  onTonicChange, 
  onScaleTypeChange,
  disabled 
}): JSX.Element;
```

**Estrutura:**
```
┌────────────────────────────────────────────────────┐
│  [▼ C]  Tônica                              ● ● ● │
│  [▼ Maior]  Tipo de Escala                 ● ● ● │
└────────────────────────────────────────────────────┘
```

### 2.3 ScaleDisplay

```typescript
interface ScaleDisplayProps {
  /** Tônica */
  tonic: NoteName;
  /** Tipo de escala */
  scaleType: ScaleType;
  /** Notas da escala */
  notes: NoteName[];
  /** Intervalos da escala */
  intervals?: string[];
  /** Se deve mostrar campo harmônico */
  showHarmonicField?: boolean;
  /** Callback quando nota é clicada */
  onNoteClick?: (note: NoteName) => void;
}

function ScaleDisplay({
  tonic,
  scaleType,
  notes,
  intervals,
  showHarmonicField,
  onNoteClick
}): JSX.Element;
```

**Visualização:**
```
┌─────────────────────────────────────────────────┐
│  C Maior                                        │
│  ─────────────────────────────────────────────  │
│  C    D    E    F    G    A    B               │
│  R    M2   M3   P4   P5   M6   M7              │
└─────────────────────────────────────────────────┘
```

### 2.4 ChordDiagram

```typescript
interface ChordDiagramProps {
  /** Acorde a ser exibido */
  chord: Chord;
  /** Instrumento */
  instrument?: 'guitar' | 'ukulele';
  /** Tamanho */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar digitação */
  showFingering?: boolean;
  /** Callback de clique na casa */
  onFretClick?: (string: number, fret: number) => void;
  /** Callback de clique no acorde */
  onChordClick?: () => void;
}

function ChordDiagram({
  chord,
  instrument,
  size,
  showFingering,
  onFretClick,
  onChordClick
}): JSX.Element;
```

**Visualização:**
```
    1   2   3   4   5   6
  ┌───┬───┬───┬───┬───┬───┐
E │   │   │   │ ● │   │   │  ← Dó na 5ª casa da corda E
  ├───┼───┼───┼───┼───┼───┤
B │   │   │ ● │   │   │   │  ← Dó na 3ª casa da corda B
  ├───┼───┼───┼───┼───┼───┤
G │ ● │ ● │   │ ● │   │   │  ← Dó maior (C-E-G)
  ├───┼───┼───┼───┼───┼───┤
D │ ● │   │   │ ● │   │   │  ← Dó na 3ª casa da corda D
  ├───┼───┼───┼───┼───┼───┤
A │ ● │   │   │   │   │   │  ← Dó na 3ª casa da corda A
  ├───┼───┼───┼───┼───┼───┤
E │   │   │   │   │   │   │  ← Corda E solta
  └───┴───┴───┴───┴───┴───┘
       1   2   3
```

### 2.5 Fretboard

```typescript
interface FretboardProps {
  /** Instrumento */
  instrument?: 'guitar' | 'ukulele';
  /** Afinação customizada */
  tuning?: string[];
  /** Notas a destacar */
  highlightedNotes?: NoteName[];
  /** Escala ativa */
  scale?: {
    root: NoteName;
    type: string;
    notes: NoteName[];
  };
  /** Casa inicial */
  startFret?: number;
  /** Casa final */
  endFret?: number;
  /** Mostrar intervalos */
  showIntervals?: boolean;
  /** Callback de clique em nota */
  onNoteClick?: (note: NoteName, fret: number, string: number) => void;
}

function Fretboard({
  instrument,
  tuning,
  highlightedNotes,
  scale,
  startFret,
  endFret,
  showIntervals,
  onNoteClick
}): JSX.Element;
```

**Visualização:**
```
    0   1   2   3   4   5   6   7   8   9   10  11  12
  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
E │ ● │   │ ● │   │ ● │ ● │   │ ● │   │ ● │   │ ● │ ● │ ● │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
B │ ● │   │ ● │ ● │   │ ● │   │ ● │ ● │   │ ● │ ● │ ● │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
G │ ● │ ● │   │ ● │   │ ● │ ● │   │ ● │ ● │   │ ● │ ● │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
D │ ● │   │ ● │ ● │   │ ● │ ● │   │ ● │ ● │   │ ● │ ● │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
A │ ● │   │ ● │ ● │   │ ● │ ● │   │ ● │ ● │   │ ● │ ● │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
E │ ● │   │ ● │   │ ● │ ● │   │ ● │   │ ● │   │ ● │ ● │
  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

### 2.6 Metronome

```typescript
interface MetronomeProps {
  /** BPM inicial */
  initialBpm?: number;
  /** BPM mínimo */
  minBpm?: number;
  /** BPM máximo */
  maxBpm?: number;
  /** Time signature */
  timeSignature?: [number, number];
  /** Som do click */
  clickSound?: 'click' | 'woodblock' | 'cowbell';
  /** Callback de tick (para sincronização) */
  onTick?: (beat: number) => void;
  /** Estado inicial (rodando ou não) */
  isRunning?: boolean;
}

function Metronome({
  initialBpm,
  minBpm,
  maxBpm,
  timeSignature,
  clickSound,
  onTick,
  isRunning
}): JSX.Element;
```

**Controles:**
```
┌─────────────────────────────────────────┐
│              ♩ = 120                     │
│         ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│         │ - │ │ + │ │ ▶ │ │ ■ │         │
│         └───┘ └───┘ └───┘ └───┘         │
│                                          │
│         ●  ●  ●  ●                       │
│  1     2     3     4                     │
│                                          │
│  [4/4] ▼                          [Som ▼] │
└─────────────────────────────────────────┘
```

### 2.7 AudioPlayer

```typescript
interface AudioPlayerProps {
  /** Notas a tocar */
  notes: Array<{ note: NoteName; octave: number; duration: number }>;
  /** Volume (0-1) */
  volume?: number;
  /** Tipo de oscilador */
  oscillatorType?: OscillatorType;
  /** ADSR envelope */
  adsr?: ADSRParams;
  /** Callback quando tocar */
  onNotePlay?: (note: NoteName) => void;
  /** Callback quando terminar */
  onComplete?: () => void;
  /** Auto-play */
  autoPlay?: boolean;
}

function AudioPlayer({
  notes,
  volume,
  oscillatorType,
  adsr,
  onNotePlay,
  onComplete,
  autoPlay
}): JSX.Element;
```

---

## 3. Hooks

### 3.1 useAudio

```typescript
function useAudio(): {
  /** Instância do AudioEngine */
  engine: AudioEngine | null;
  /** Estado de carregamento */
  isLoading: boolean;
  /** Estado de erro */
  error: Error | null;
  /** Toca uma nota */
  playNote: (note: NoteName, octave: number) => void;
  /** Toca um acorde */
  playChord: (notes: Array<{ note: NoteName; octave: number }>) => void;
  /** Para o som */
  stop: () => void;
  /** Configura volume */
  setVolume: (volume: number) => void;
};
```

### 3.2 useMetronome

```typescript
function useMetronome(initialBpm: number): {
  /** BPM atual */
  bpm: number;
  /** Se está rodando */
  isRunning: boolean;
  /** Beat atual (0-indexed) */
  currentBeat: number;
  /** Muda BPM */
  setBpm: (bpm: number) => void;
  /** Inicia */
  start: () => void;
  /** Para */
  stop: () => void;
  /** Toggle */
  toggle: () => void;
};
```

### 3.3 useScale

```typescript
function useScale(): {
  /** Tônica selecionada */
  tonic: NoteName | null;
  /** Tipo de escala */
  scaleType: ScaleType | null;
  /** Notas da escala */
  notes: NoteName[];
  /** Campo harmônico */
  harmonicField: ChordInField[];
  /** Altera tônica */
  setTonic: (tonic: NoteName) => void;
  /** Altera tipo */
  setScaleType: (type: ScaleType) => void;
  /** Carrega escala */
  loadScale: (tonic: NoteName, type: ScaleType) => void;
};
```

### 3.4 usePreferences

```typescript
function usePreferences(): {
  /** Preferências */
  preferences: UserPreferences;
  /** Atualiza preferências */
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  /** Reseta para padrão */
  resetPreferences: () => void;
};
```

### 3.5 useAuth

```typescript
function useAuth(): {
  /** Usuário atual */
  user: User | null;
  /** Se está carregando */
  isLoading: boolean;
  /** Se está autenticado */
  isAuthenticated: boolean;
  /** Faz login */
  login: (email: string, password: string) => Promise<void>;
  /** Faz logout */
  logout: () => Promise<void>;
  /** Atualiza perfil */
  updateProfile: (data: Partial<User>) => Promise<void>;
};
```

---

## 4. Stores (Zustand)

### 4.1 useScaleStore

```typescript
interface ScaleState {
  tonic: NoteName | null;
  scaleType: ScaleType | null;
  scaleNotes: NoteName[];
  harmonicField: ChordInField[];
  isLoading: boolean;
  error: string | null;
  
  setTonic: (tonic: NoteName) => void;
  setScaleType: (type: ScaleType) => void;
  loadScale: (tonic: NoteName, type: ScaleType) => void;
  clearScale: () => void;
}
```

### 4.2 useAudioStore

```typescript
interface AudioState {
  isEnabled: boolean;
  volume: number;
  timbre: OscillatorType;
  adsr: ADSRParams;
  
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setTimbre: (timbre: OscillatorType) => void;
  setADSR: (adsr: ADSRParams) => void;
}
```

### 4.3 usePreferencesStore

```typescript
interface PreferencesState {
  defaultInstrument: InstrumentId;
  theme: 'light' | 'dark' | 'system';
  showNoteNames: boolean;
  showFretNumbers: boolean;
  
  setDefaultInstrument: (instrument: InstrumentId) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowNoteNames: (show: boolean) => void;
  setShowFretNumbers: (show: boolean) => void;
}
```

---

## 5. Tokens de Design

### 5.1 Cores

```typescript
const colors = {
  // Primárias
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // Principal
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Secundárias
  secondary: {
    500: '#64748b',
    600: '#475569',
  },
  
  // Acordes (por função)
  root: '#ef4444',      // Vermelho
  third: '#eab308',     // Amarelo
  fifth: '#3b82f6',     // Azul
  seventh: '#a855f7',   // Roxo
  
  // Notas fretboard
  noteHighlight: '#22c55e',
  fretWire: '#64748b',
  fretMarker: '#475569',
};
```

### 5.2 Espaçamento

```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};
```

### 5.3 Tipografia

```typescript
const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, sans-serif',
    mono: 'var(--font-jetbrains-mono), monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
};
```

---

*Documento aprovado em 24 de outubro de 2026*  
*Versão 1.0*