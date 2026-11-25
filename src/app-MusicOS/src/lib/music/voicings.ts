/**
 * Gerador de posições (voicings) de acordes para qualquer instrumento de
 * corda e qualquer afinação.
 *
 * Procura, janela por janela do braço, combinações tocáveis:
 *  - a nota mais grave é a fundamental;
 *  - todas as notas obrigatórias do acorde aparecem (a 5ª é opcional em
 *    acordes de 4+ notas);
 *  - abertura de até 4 casas e no máximo 4 dedos (pestana conta como 1);
 *  - cordas abafadas só nas pontas (sem "buraco" no meio).
 * Depois ordena pelas mais fáceis e escolhe posições em regiões diferentes do braço.
 */

import { pitchToMidi, semitonesAt } from './tunings';

export interface Voicing {
  /** Uma casa por corda: -1 abafada, 0 solta, n casa do braço */
  frets: number[];
  /** Dedo por corda (0 = nenhum) */
  fingers: number[];
  barre: { fret: number; fromString: number; toString: number } | null;
  /** Alturas MIDI que soam (para tocar) */
  midis: number[];
}

export interface VoicingOptions {
  tuning: string[];
  /** Classes de altura do acorde (0–11), a fundamental primeiro */
  chordPcs: number[];
  /** Classes que podem faltar (padrão: a 5ª justa em acordes de 4+ notas) */
  optionalPcs?: number[];
  stringStartFret?: number[];
  maxFret?: number;
  /** Exigir a fundamental no baixo (padrão). Banjo e afinações com bordão aceitam inversões. */
  requireRootBass?: boolean;
  /** Casas cobertas pela mão (4 = da casa n à n+3) */
  span?: number;
  limit?: number;
}

const mod12 = (n: number) => ((n % 12) + 12) % 12;

function defaultOptional(chordPcs: number[]): number[] {
  if (chordPcs.length < 4) return [];
  const fifth = mod12(chordPcs[0] + 7);
  return chordPcs.includes(fifth) ? [fifth] : [];
}

interface Candidate {
  frets: number[];
  score: number;
  minFret: number;
}

const cache = new Map<string, Voicing[]>();

/** Mesmo que computeVoicings, com cache (os cartões re-renderizam com frequência). */
export function generateVoicings(opts: VoicingOptions): Voicing[] {
  const key = JSON.stringify([
    opts.tuning,
    opts.chordPcs,
    opts.optionalPcs ?? null,
    opts.stringStartFret ?? null,
    opts.maxFret ?? null,
    opts.span ?? null,
    opts.limit ?? null,
    opts.requireRootBass ?? null,
  ]);
  const hit = cache.get(key);
  if (hit) return hit;
  const result = computeVoicings(opts);
  if (cache.size > 500) cache.clear();
  cache.set(key, result);
  return result;
}

export function computeVoicings(opts: VoicingOptions): Voicing[] {
  const { tuning, chordPcs } = opts;
  const n = tuning.length;
  const maxFret = opts.maxFret ?? 12;
  const span = opts.span ?? 4;
  const limit = opts.limit ?? 4;
  const starts = opts.stringStartFret ?? new Array(n).fill(0);
  const rootPc = mod12(chordPcs[0]);
  const requireRootBass = opts.requireRootBass ?? true;
  const chordSet = new Set(chordPcs.map(mod12));
  const optional = new Set((opts.optionalPcs ?? defaultOptional(chordPcs)).map(mod12));
  const required = [...chordSet].filter((p) => !optional.has(p));
  const openMidi = tuning.map(pitchToMidi);

  // Quantas cordas precisam soar
  const minSounded = n <= 4 ? Math.min(3, n) : n <= 5 ? 4 : n === 6 ? 4 : 5;
  if (required.length > n) return [];

  const midiAt = (s: number, fret: number): number | null => {
    if (fret < 0) return null;
    const semis = semitonesAt(fret, starts[s]);
    return semis === null ? null : openMidi[s] + semis;
  };

  const seen = new Set<string>();
  const candidates: Candidate[] = [];

  for (let lo = 1; lo <= maxFret - span + 1; lo++) {
    const hi = lo + span - 1;
    const allowOpen = lo <= 5;

    // Opções por corda
    const options: number[][] = [];
    for (let s = 0; s < n; s++) {
      const opt = [-1];
      if (allowOpen && chordSet.has(mod12(openMidi[s]))) opt.push(0);
      for (let f = lo; f <= hi; f++) {
        const m = midiAt(s, f);
        if (m !== null && chordSet.has(mod12(m))) opt.push(f);
      }
      options.push(opt);
    }

    const current = new Array<number>(n).fill(-1);
    const walk = (s: number) => {
      if (s === n) {
        evaluate(current.slice());
        return;
      }
      for (const f of options[s]) {
        current[s] = f;
        walk(s + 1);
      }
    };

    const evaluate = (frets: number[]) => {
      const key = frets.join(',');
      if (seen.has(key)) return;

      const sounded = frets.map((f, s) => (f >= 0 ? s : -1)).filter((s) => s >= 0);
      if (sounded.length < minSounded) return;

      // abafadas só nas pontas
      const first = sounded[0];
      const last = sounded[sounded.length - 1];
      if (last - first + 1 !== sounded.length) return;
      if (n <= 4 && n - sounded.length > 1) return;

      const midis = sounded.map((s) => midiAt(s, frets[s])!) as number[];
      const lowest = Math.min(...midis);
      const rootInBass = mod12(lowest) === rootPc;
      if (!rootInBass && requireRootBass) return;

      const present = new Set(midis.map(mod12));
      if (!required.every((p) => present.has(p))) return;

      const fretted = frets.filter((f) => f > 0);
      const minF = fretted.length ? Math.min(...fretted) : 0;
      const maxF = fretted.length ? Math.max(...fretted) : 0;
      if (fretted.length && maxF - minF > span - 1) return;

      const barre = findBarre(frets);
      const fingersNeeded = barre ? 1 + fretted.filter((f) => f > barre.fret).length : fretted.length;
      if (fingersNeeded > 4) return;

      const opens = frets.filter((f) => f === 0).length;
      const allPresent = [...chordSet].every((p) => present.has(p));
      const muted = n - sounded.length;
      // Corda solta junto com casas altas soa estranho e é difícil de alcançar
      const awkwardOpens = maxF > 4 ? opens : 0;
      const score =
        minF * 0.3 +
        fingersNeeded * 0.4 +
        (barre ? 0.6 : 0) +
        muted * (n <= 4 ? 1.5 : 0.7) +
        awkwardOpens * 0.9 +
        (rootInBass ? 0 : 1.5) -
        sounded.length * 0.5 -
        (maxF <= 4 ? opens * 0.3 : 0) -
        (allPresent ? 0.6 : 0);

      seen.add(key);
      candidates.push({ frets, score, minFret: minF });
    };

    walk(0);
  }

  candidates.sort((a, b) => a.score - b.score);

  // Posições em regiões diferentes do braço
  const chosen: Candidate[] = [];
  for (const c of candidates) {
    if (chosen.length >= limit) break;
    if (chosen.some((x) => Math.abs(x.minFret - c.minFret) < 2)) continue;
    chosen.push(c);
  }
  // A mais fácil primeiro; as demais subindo o braço
  const [best, ...rest] = chosen;
  const ordered = best ? [best, ...rest.sort((a, b) => a.minFret - b.minFret)] : [];

  return ordered.map((c) => {
    const barre = findBarre(c.frets);
    return {
      frets: c.frets,
      fingers: assignFingers(c.frets, barre),
      barre,
      midis: c.frets.flatMap((f, s) => {
        const m = midiAt(s, f);
        return m === null ? [] : [m];
      }),
    };
  });
}

/** Pestana: a casa mais baixa pisada em 2+ cordas, sem corda solta entre elas. */
function findBarre(frets: number[]): Voicing['barre'] {
  const fretted = frets.filter((f) => f > 0);
  if (fretted.length < 2) return null;
  const minF = Math.min(...fretted);
  const at = frets.map((f, s) => (f === minF ? s : -1)).filter((s) => s >= 0);
  if (at.length < 2) return null;
  const from = at[0];
  const to = at[at.length - 1];
  for (let s = from; s <= to; s++) {
    if (frets[s] === 0) return null; // corda solta no meio: não dá pestana
  }
  // Só vale a pena se há notas na casa da pestana em cordas não vizinhas ou 3+ cordas
  return to - from >= 1 ? { fret: minF, fromString: from, toString: to } : null;
}

/** Dedos 1–4: pestana com o 1; demais na ordem das casas. */
function assignFingers(frets: number[], barre: Voicing['barre']): number[] {
  const fingers = new Array<number>(frets.length).fill(0);
  const fretted = frets
    .map((f, s) => ({ f, s }))
    .filter(({ f }) => f > 0)
    .sort((a, b) => a.f - b.f || a.s - b.s);

  let next = 1;
  if (barre) {
    fretted.filter(({ f }) => f === barre.fret).forEach(({ s }) => (fingers[s] = 1));
    next = 2;
    for (const { f, s } of fretted) {
      if (f === barre.fret) continue;
      fingers[s] = Math.min(4, next++);
    }
    return fingers;
  }
  for (const { s } of fretted) fingers[s] = Math.min(4, next++);
  return fingers;
}
