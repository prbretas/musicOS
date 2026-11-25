/**
 * Instrumentos de corda e suas afinações.
 *
 * Fonte única para o braço, os diagramas de acordes e o afinador.
 * Afinações: cordas da mais grave (posição da 6ª corda do violão) para a
 * mais aguda, sempre com sustenidos e oitava ("D#2"). Instrumentos de cordas
 * duplas (viola caipira, bandolim) são representados por ordem (par de cordas),
 * com a nota da corda mais grave do par.
 */

export type InstrumentType =
  | 'guitar'
  | 'violao7'
  | 'guitar7'
  | 'guitar8'
  | 'bass4'
  | 'bass5'
  | 'bass6'
  | 'viola'
  | 'cavaquinho'
  | 'bandolim'
  | 'banjo5'
  | 'banjoTenor'
  | 'ukulele';

export interface Tuning {
  id: string;
  label: string;
  pitches: string[];
}

export interface InstrumentDef {
  id: InstrumentType;
  label: string;
  emoji: string;
  /** Casas mostradas no braço */
  frets: number;
  /** Mostra diagramas de acordes (no baixo, mostra só as notas do acorde) */
  chords: boolean;
  /** Cordas que começam numa casa acima da pestana (5ª corda do banjo começa na casa 5) */
  stringStartFret?: number[];
  /** Aceita acordes invertidos (banjo: o acorde aberto tem a 5ª no grave). Padrão: false */
  allowInversions?: boolean;
  /** Família do baixo: exercícios de prática usam a oitava mais grave */
  bass?: boolean;
  /** Observação curta exibida sob o braço */
  note?: string;
  /** A primeira afinação é a padrão do instrumento */
  tunings: Tuning[];
}

export const INSTRUMENTS: Record<InstrumentType, InstrumentDef> = {
  guitar: {
    id: 'guitar',
    label: 'Violão / Guitarra',
    emoji: '🎸',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'standard', label: 'Padrão (E A D G B E)', pitches: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'drop-d', label: 'Drop D (D A D G B E)', pitches: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'double-drop-d', label: 'Double Drop D (D A D G B D)', pitches: ['D2', 'A2', 'D3', 'G3', 'B3', 'D4'] },
      { id: 'half-down', label: 'Meio tom abaixo (Eb Ab Db Gb Bb Eb)', pitches: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
      { id: 'whole-down', label: 'Um tom abaixo (D G C F A D)', pitches: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
      { id: 'drop-c-sharp', label: 'Drop C# (C# G# C# F# A# D#)', pitches: ['C#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
      { id: 'drop-c', label: 'Drop C (C G C F A D)', pitches: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
      { id: 'drop-b', label: 'Drop B (B F# B E G# C#)', pitches: ['B1', 'F#2', 'B2', 'E3', 'G#3', 'C#4'] },
      { id: 'dadgad', label: 'DADGAD', pitches: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
      { id: 'open-d', label: 'Open D (D A D F# A D)', pitches: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'] },
      { id: 'open-dm', label: 'Open D menor (D A D F A D)', pitches: ['D2', 'A2', 'D3', 'F3', 'A3', 'D4'] },
      { id: 'open-e', label: 'Open E (E B E G# B E)', pitches: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] },
      { id: 'open-g', label: 'Open G (D G D G B D)', pitches: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
      { id: 'open-a', label: 'Open A (E A E A C# E)', pitches: ['E2', 'A2', 'E3', 'A3', 'C#4', 'E4'] },
      { id: 'open-c', label: 'Open C (C G C G C E)', pitches: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'] },
    ],
  },
  violao7: {
    id: 'violao7',
    label: 'Violão de 7 cordas',
    emoji: '🎸',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'si', label: '7ª em Si (B E A D G B E)', pitches: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'do', label: '7ª em Dó (C E A D G B E)', pitches: ['C2', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'la', label: '7ª em Lá (A E A D G B E)', pitches: ['A1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
    ],
  },
  guitar7: {
    id: 'guitar7',
    label: 'Guitarra de 7 cordas',
    emoji: '🎸',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'standard', label: 'Padrão (B E A D G B E)', pitches: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'drop-a', label: 'Drop A (A E A D G B E)', pitches: ['A1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'half-down', label: 'Meio tom abaixo', pitches: ['A#1', 'D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
    ],
  },
  guitar8: {
    id: 'guitar8',
    label: 'Guitarra de 8 cordas',
    emoji: '🎸',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'standard', label: 'Padrão (F# B E A D G B E)', pitches: ['F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
      { id: 'drop-e', label: 'Drop E (E B E A D G B E)', pitches: ['E1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
    ],
  },
  bass4: {
    id: 'bass4',
    bass: true,
    label: 'Baixo 4 cordas',
    emoji: '🎸',
    frets: 15,
    chords: false,
    tunings: [
      { id: 'standard', label: 'Padrão (E A D G)', pitches: ['E1', 'A1', 'D2', 'G2'] },
      { id: 'drop-d', label: 'Drop D (D A D G)', pitches: ['D1', 'A1', 'D2', 'G2'] },
      { id: 'half-down', label: 'Meio tom abaixo (Eb Ab Db Gb)', pitches: ['D#1', 'G#1', 'C#2', 'F#2'] },
      { id: 'whole-down', label: 'Um tom abaixo (D G C F)', pitches: ['D1', 'G1', 'C2', 'F2'] },
      { id: 'drop-c', label: 'Drop C (C G C F)', pitches: ['C1', 'G1', 'C2', 'F2'] },
    ],
  },
  bass5: {
    id: 'bass5',
    bass: true,
    label: 'Baixo 5 cordas',
    emoji: '🎸',
    frets: 15,
    chords: false,
    tunings: [
      { id: 'standard', label: 'Padrão (B E A D G)', pitches: ['B0', 'E1', 'A1', 'D2', 'G2'] },
      { id: 'tenor', label: 'Agudo (E A D G C)', pitches: ['E1', 'A1', 'D2', 'G2', 'C3'] },
      { id: 'drop-a', label: 'Drop A (A E A D G)', pitches: ['A0', 'E1', 'A1', 'D2', 'G2'] },
    ],
  },
  bass6: {
    id: 'bass6',
    bass: true,
    label: 'Baixo 6 cordas',
    emoji: '🎸',
    frets: 15,
    chords: false,
    tunings: [{ id: 'standard', label: 'Padrão (B E A D G C)', pitches: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'] }],
  },
  viola: {
    id: 'viola',
    label: 'Viola caipira',
    emoji: '🪕',
    frets: 12,
    chords: true,
    note: 'Viola caipira: cada linha é um par de cordas (ordem), com a nota do par.',
    tunings: [
      { id: 'cebolao-e', label: 'Cebolão em Mi (B E G# B E)', pitches: ['B2', 'E3', 'G#3', 'B3', 'E4'] },
      { id: 'cebolao-d', label: 'Cebolão em Ré (A D F# A D)', pitches: ['A2', 'D3', 'F#3', 'A3', 'D4'] },
      { id: 'rio-abaixo', label: 'Rio Abaixo (G D G B D)', pitches: ['G2', 'D3', 'G3', 'B3', 'D4'] },
      { id: 'natural', label: 'Natural (A D G B E)', pitches: ['A2', 'D3', 'G3', 'B3', 'E4'] },
    ],
  },
  cavaquinho: {
    id: 'cavaquinho',
    label: 'Cavaquinho',
    emoji: '🪕',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'standard', label: 'Padrão em Ré (D G B D)', pitches: ['D4', 'G4', 'B4', 'D5'] },
      { id: 'natural', label: 'Natural (D G B E)', pitches: ['D4', 'G4', 'B4', 'E5'] },
    ],
  },
  bandolim: {
    id: 'bandolim',
    label: 'Bandolim',
    emoji: '🪕',
    frets: 15,
    chords: true,
    note: 'Bandolim: cada linha é um par de cordas.',
    tunings: [{ id: 'standard', label: 'Padrão (G D A E)', pitches: ['G3', 'D4', 'A4', 'E5'] }],
  },
  banjo5: {
    id: 'banjo5',
    label: 'Banjo 5 cordas',
    emoji: '🪕',
    frets: 15,
    chords: true,
    stringStartFret: [5, 0, 0, 0, 0],
    allowInversions: true,
    note: 'A 5ª corda do banjo é curta e começa na casa 5.',
    tunings: [
      { id: 'open-g', label: 'Open G (g D G B D)', pitches: ['G4', 'D3', 'G3', 'B3', 'D4'] },
      { id: 'double-c', label: 'Double C (g C G C D)', pitches: ['G4', 'C3', 'G3', 'C4', 'D4'] },
      { id: 'open-d', label: 'Open D (f# D F# A D)', pitches: ['F#4', 'D3', 'F#3', 'A3', 'D4'] },
    ],
  },
  banjoTenor: {
    id: 'banjoTenor',
    label: 'Banjo tenor (4 cordas)',
    emoji: '🪕',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'standard', label: 'Padrão (C G D A)', pitches: ['C3', 'G3', 'D4', 'A4'] },
      { id: 'irish', label: 'Irlandês (G D A E)', pitches: ['G2', 'D3', 'A3', 'E4'] },
      { id: 'cavaco', label: 'Como cavaquinho (D G B D)', pitches: ['D3', 'G3', 'B3', 'D4'] },
      { id: 'chicago', label: 'Chicago (D G B E)', pitches: ['D3', 'G3', 'B3', 'E4'] },
    ],
  },
  ukulele: {
    id: 'ukulele',
    label: 'Ukulele',
    emoji: '🪕',
    frets: 15,
    chords: true,
    tunings: [
      { id: 'standard', label: 'Padrão (G C E A)', pitches: ['G4', 'C4', 'E4', 'A4'] },
      { id: 'low-g', label: 'Low G (G C E A, sol grave)', pitches: ['G3', 'C4', 'E4', 'A4'] },
      { id: 'd-tuning', label: 'Afinação em D (A D F# B)', pitches: ['A4', 'D4', 'F#4', 'B4'] },
      { id: 'baritone', label: 'Barítono (D G B E)', pitches: ['D3', 'G3', 'B3', 'E4'] },
    ],
  },
};

/** Ordem no seletor */
export const INSTRUMENT_ORDER: InstrumentType[] = [
  'guitar',
  'violao7',
  'guitar7',
  'guitar8',
  'bass4',
  'bass5',
  'bass6',
  'viola',
  'cavaquinho',
  'bandolim',
  'banjo5',
  'banjoTenor',
  'ukulele',
];

/** Instrumentos liberados no modo grátis (na afinação padrão). Os demais são Pro. */
export const FREE_INSTRUMENTS: ReadonlySet<InstrumentType> = new Set<InstrumentType>(['guitar', 'cavaquinho', 'bass4']);

export function isFreeInstrument(id: InstrumentType): boolean {
  return FREE_INSTRUMENTS.has(id);
}

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = Object.fromEntries(
  INSTRUMENT_ORDER.map((id) => [id, INSTRUMENTS[id].label])
) as Record<InstrumentType, string>;

/** Compatibilidade: afinações por instrumento */
export const TUNINGS: Record<InstrumentType, Tuning[]> = Object.fromEntries(
  INSTRUMENT_ORDER.map((id) => [id, INSTRUMENTS[id].tunings])
) as Record<InstrumentType, Tuning[]>;

export function getTuning(instrument: InstrumentType, id: string): Tuning {
  return TUNINGS[instrument].find((t) => t.id === id) ?? TUNINGS[instrument][0];
}

export function standardTuning(instrument: InstrumentType): string[] {
  return INSTRUMENTS[instrument].tunings[0].pitches;
}

// ------------------------------------------------------------------
// Alturas
// ------------------------------------------------------------------

export const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** "D#2" → 39 (MIDI). Aceita bemóis ("Eb2"). */
export function pitchToMidi(pitch: string): number {
  const m = pitch.match(/^([A-G])([#b]?)(-?\d)$/);
  if (!m) throw new Error(`Altura inválida: ${pitch}`);
  let pcValue = SHARPS.indexOf(m[1] as (typeof SHARPS)[number]);
  if (m[2] === '#') pcValue += 1;
  if (m[2] === 'b') pcValue -= 1;
  return (Number(m[3]) + 1) * 12 + pcValue;
}

/** 39 → "D#2" */
export function midiToPitch(midi: number): string {
  return `${SHARPS[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export function pitchClassOf(pitch: string): string {
  return SHARPS[((pitchToMidi(pitch) % 12) + 12) % 12];
}

/** Sobe/desce uma altura em semitons. */
export function transposePitch(pitch: string, semitones: number): string {
  return midiToPitch(pitchToMidi(pitch) + semitones);
}

/** Identifica a afinação conhecida (ou null se é personalizada). */
export function findTuning(instrument: InstrumentType, pitches: string[]): Tuning | null {
  const key = pitches.map(pitchToMidi).join(',');
  return INSTRUMENTS[instrument].tunings.find((t) => t.pitches.map(pitchToMidi).join(',') === key) ?? null;
}

export function isStandardTuning(instrument: InstrumentType, pitches: string[]): boolean {
  return findTuning(instrument, pitches)?.id === INSTRUMENTS[instrument].tunings[0].id;
}

/**
 * Semitons acima da corda solta ao pisar a casa `fret` do braço.
 * Considera cordas curtas (banjo): casa 0 = solta; casas até o início da corda não existem.
 */
export function semitonesAt(fret: number, startFret = 0): number | null {
  if (fret === 0) return 0;
  if (fret <= startFret) return null;
  return fret - startFret;
}
