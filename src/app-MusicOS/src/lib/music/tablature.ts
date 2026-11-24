/**
 * Tablatura para qualquer instrumento e afinação.
 *
 * Recebe uma sequência de notas (MIDI) e escolhe corda e casa de cada uma,
 * minimizando o movimento da mão (algoritmo de Viterbi). Se a melodia não
 * cabe no instrumento, ela é transposta em oitavas (ex.: melodia aguda no
 * baixo desce uma ou duas oitavas; riff grave no cavaquinho sobe).
 */

import { pitchToMidi, semitonesAt } from './tunings';

export interface TabNote {
  /** Corda (índice na afinação: 0 = a mais grave do violão) */
  s: number;
  /** Casa (0 = solta) */
  f: number;
}

export interface TabResult {
  /** Uma posição por nota; null nas pausas */
  positions: (TabNote | null)[];
  /** Semitons aplicados à melodia para caber no instrumento (múltiplo de 12) */
  shift: number;
}

export interface TabOptions {
  tuning: string[];
  stringStartFret?: number[];
  maxFret?: number;
  /** Casa inicial da região preferida para a mão (abrange 4 casas). Sem valor: prefere casas baixas. */
  position?: number;
  /** Baixo: usar a oitava mais grave que caiba confortavelmente */
  preferLowOctave?: boolean;
}

function candidatesFor(midi: number, open: number[], starts: number[], maxFret: number): TabNote[] {
  const out: TabNote[] = [];
  for (let s = 0; s < open.length; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const semis = semitonesAt(f, starts[s] ?? 0);
      if (semis !== null && open[s] + semis === midi) out.push({ s, f });
    }
  }
  return out;
}

/**
 * Transposição em oitavas que faz a melodia caber. Entre as que cabem, escolhe
 * a mais confortável (casas mais baixas), preferindo não transpor.
 */
export function fitShift(midis: number[], opts: TabOptions): number | null {
  const open = opts.tuning.map(pitchToMidi);
  const starts = opts.stringStartFret ?? [];
  const maxFret = opts.maxFret ?? 15;
  let best: { shift: number; score: number } | null = null;
  const order = opts.preferLowOctave ? [-36, -24, -12, 0, 12, 24, 36] : [0, -12, 12, -24, 24, -36, 36];
  for (const shift of order) {
    let total = 0;
    let ok = true;
    for (const m of midis) {
      const cands = candidatesFor(m + shift, open, starts, maxFret);
      if (!cands.length) {
        ok = false;
        break;
      }
      total += Math.min(...cands.map((c) => c.f));
    }
    if (!ok) continue;
    const avgFret = total / Math.max(1, midis.length);
    // Cabe na oitava escrita, numa região confortável: não transpõe
    if (shift === 0 && avgFret <= 7 && !opts.preferLowOctave) return 0;
    if (opts.preferLowOctave && avgFret <= 7) return shift;
    const score = avgFret + Math.abs(shift) / 12;
    if (!best || score < best.score) best = { shift, score };
  }
  return best ? best.shift : null;
}

export function computeTab(midis: (number | null)[], opts: TabOptions): TabResult | null {
  const open = opts.tuning.map(pitchToMidi);
  const starts = opts.stringStartFret ?? [];
  const maxFret = opts.maxFret ?? 15;
  const notes = midis.filter((m): m is number => m !== null);
  const shift = fitShift(notes, opts);
  if (shift === null) return null;

  const lo = opts.position;
  const nodeCost = (c: TabNote) => {
    // corda solta: natural na 1ª posição; fora dela, tira a mão da região
    if (c.f === 0) return lo === undefined || lo <= 1 ? 0.4 : 2;
    if (lo === undefined) return c.f * 0.15;
    const hi = lo + 3;
    if (c.f < lo) return (lo - c.f) * 2;
    if (c.f > hi) return (c.f - hi) * 2;
    return 0;
  };
  const moveCost = (a: TabNote, b: TabNote) => {
    const fretMove = a.f > 0 && b.f > 0 ? Math.abs(b.f - a.f) : 0.5;
    return fretMove + Math.abs(b.s - a.s) * 0.3;
  };

  const layers = notes.map((m) => candidatesFor(m + shift, open, starts, maxFret));
  const cost: number[][] = [];
  const back: number[][] = [];
  layers.forEach((cands, i) => {
    cost[i] = [];
    back[i] = [];
    cands.forEach((c, j) => {
      if (i === 0) {
        cost[i][j] = nodeCost(c);
        back[i][j] = -1;
        return;
      }
      let best = Infinity;
      let arg = 0;
      layers[i - 1].forEach((p, k) => {
        const v = cost[i - 1][k] + moveCost(p, c);
        if (v < best) {
          best = v;
          arg = k;
        }
      });
      cost[i][j] = best + nodeCost(c);
      back[i][j] = arg;
    });
  });

  const chosen: TabNote[] = new Array(notes.length);
  if (notes.length) {
    const last = notes.length - 1;
    let j = cost[last].indexOf(Math.min(...cost[last]));
    for (let i = last; i >= 0; i--) {
      chosen[i] = layers[i][j];
      j = back[i][j];
    }
  }

  let k = 0;
  return { positions: midis.map((m) => (m === null ? null : chosen[k++])), shift };
}
