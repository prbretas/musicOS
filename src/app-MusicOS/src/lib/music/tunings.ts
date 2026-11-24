/**
 * Afinações disponíveis no braço. A padrão de cada instrumento é grátis;
 * as demais são recurso Pro (`alt-tunings`).
 */

export type InstrumentType = 'guitar' | 'ukulele';

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  guitar: 'Guitarra / Violão',
  ukulele: 'Ukulele',
};

export interface Tuning {
  id: string;
  label: string;
  /** Cordas da mais grave para a mais aguda, com oitava (formato do Fretboard) */
  pitches: string[];
  /** Afinação padrão do instrumento (liberada no grátis; CAGED só funciona nela) */
  standard?: boolean;
}

export const TUNINGS: Record<InstrumentType, Tuning[]> = {
  guitar: [
    { id: 'standard', label: 'Padrão (E A D G B E)', pitches: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], standard: true },
    { id: 'drop-d', label: 'Drop D (D A D G B E)', pitches: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
    { id: 'half-down', label: 'Meio tom abaixo (Eb)', pitches: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
    { id: 'dadgad', label: 'DADGAD', pitches: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
    { id: 'open-g', label: 'Open G (D G D G B D)', pitches: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
    { id: 'open-d', label: 'Open D (D A D F# A D)', pitches: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'] },
    { id: 'open-e', label: 'Open E (E B E G# B E)', pitches: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] },
  ],
  ukulele: [
    { id: 'standard', label: 'Padrão (G C E A)', pitches: ['G4', 'C4', 'E4', 'A4'], standard: true },
    { id: 'low-g', label: 'Low G (G C E A, sol grave)', pitches: ['G3', 'C4', 'E4', 'A4'] },
    { id: 'd-tuning', label: 'Afinação em D (A D F# B)', pitches: ['A4', 'D4', 'F#4', 'B4'] },
    { id: 'baritone', label: 'Barítono (D G B E)', pitches: ['D3', 'G3', 'B3', 'E4'] },
  ],
};

export function getTuning(instrument: InstrumentType, id: string): Tuning {
  return TUNINGS[instrument].find((t) => t.id === id) ?? TUNINGS[instrument][0];
}
