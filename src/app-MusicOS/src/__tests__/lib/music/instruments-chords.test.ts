// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  INSTRUMENTS,
  INSTRUMENT_ORDER,
  findTuning,
  isStandardTuning,
  midiToPitch,
  pitchToMidi,
  semitonesAt,
  transposePitch,
} from '@/lib/music/tunings';
import { computeVoicings } from '@/lib/music/voicings';
import { extendedField } from '@/lib/music/extensions';
import { buildScale } from '@/lib/music/escalas';
import { SHAPE_ORDER } from '@/lib/music/caged';

const frets = (v: { frets: number[] }) => v.frets.map((f) => (f < 0 ? 'x' : String(f))).join('');
const guitar = INSTRUMENTS.guitar.tunings[0].pitches;

describe('CAGED', () => {
  it('tem só as 5 formas C A G E D', () => {
    expect([...SHAPE_ORDER]).toEqual(['C', 'A', 'G', 'E', 'D']);
  });
});

describe('instrumentos e afinações', () => {
  it('todo instrumento tem afinações válidas com o mesmo número de cordas', () => {
    for (const id of INSTRUMENT_ORDER) {
      const def = INSTRUMENTS[id];
      const n = def.tunings[0].pitches.length;
      expect(def.tunings.length).toBeGreaterThan(0);
      for (const t of def.tunings) {
        expect(t.pitches).toHaveLength(n);
        t.pitches.forEach((p) => expect(() => pitchToMidi(p)).not.toThrow());
      }
      if (def.stringStartFret) expect(def.stringStartFret).toHaveLength(n);
    }
  });

  it('afinações de um instrumento não se repetem', () => {
    for (const id of INSTRUMENT_ORDER) {
      const keys = INSTRUMENTS[id].tunings.map((t) => t.pitches.map(pitchToMidi).join(','));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('converte alturas', () => {
    expect(pitchToMidi('E2')).toBe(40);
    expect(pitchToMidi('A4')).toBe(69);
    expect(pitchToMidi('Eb2')).toBe(pitchToMidi('D#2'));
    expect(midiToPitch(39)).toBe('D#2');
    expect(transposePitch('E2', -2)).toBe('D2');
    expect(transposePitch('B3', 1)).toBe('C4');
  });

  it('reconhece afinações prontas e personalizadas', () => {
    expect(isStandardTuning('guitar', guitar)).toBe(true);
    expect(findTuning('guitar', ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'])?.id).toBe('drop-d');
    expect(findTuning('guitar', guitar.map((p) => transposePitch(p, -1)))?.id).toBe('half-down');
    expect(findTuning('guitar', ['E2', 'A2', 'D3', 'G3', 'B3', 'F4'])).toBeNull();
  });

  it('corda curta do banjo: casas antes do início não existem', () => {
    expect(semitonesAt(0, 5)).toBe(0);
    expect(semitonesAt(3, 5)).toBeNull();
    expect(semitonesAt(5, 5)).toBeNull();
    expect(semitonesAt(7, 5)).toBe(2);
    expect(semitonesAt(7, 0)).toBe(7);
  });
});

describe('gerador de posições', () => {
  it('encontra as posições clássicas no violão', () => {
    expect(computeVoicings({ tuning: guitar, chordPcs: [0, 4, 7] }).map(frets)).toContain('x32010');
    expect(computeVoicings({ tuning: guitar, chordPcs: [7, 11, 2] }).map(frets)).toContain('320003');
    expect(computeVoicings({ tuning: guitar, chordPcs: [9, 0, 4] }).map(frets)).toContain('x02210');
    expect(computeVoicings({ tuning: guitar, chordPcs: [0, 4, 7, 11] }).map(frets)).toContain('x32000');
  });

  it('toda posição gerada é tocável e soa o acorde certo', () => {
    const cases: [string[], number[]][] = [
      [guitar, [2, 5, 9, 0, 4]], // Dm9
      [guitar, [7, 11, 2, 5]], // G7
      [INSTRUMENTS.cavaquinho.tunings[0].pitches, [2, 6, 9]], // D
      [INSTRUMENTS.viola.tunings[0].pitches, [4, 8, 11]], // E
      [INSTRUMENTS.guitar7.tunings[0].pitches, [9, 0, 4, 7]], // Am7
      [INSTRUMENTS.ukulele.tunings[0].pitches, [0, 4, 7]], // C
    ];
    for (const [tuning, pcs] of cases) {
      const voicings = computeVoicings({ tuning, chordPcs: pcs });
      expect(voicings.length).toBeGreaterThan(0);
      for (const v of voicings) {
        const sounded = v.midis.map((m) => m % 12);
        // só notas do acorde
        sounded.forEach((p) => expect(pcs).toContain(p));
        // fundamental no baixo
        expect(Math.min(...v.midis) % 12).toBe(pcs[0]);
        // abertura de até 4 casas e no máximo 4 dedos
        const fretted = v.frets.filter((f) => f > 0);
        if (fretted.length) expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(3);
        expect(Math.max(0, ...v.fingers)).toBeLessThanOrEqual(4);
        // cordas abafadas só nas pontas
        const s = v.frets.map((f, i) => (f >= 0 ? i : -1)).filter((i) => i >= 0);
        expect(s[s.length - 1] - s[0] + 1).toBe(s.length);
      }
    }
  });

  it('acompanha a afinação: Drop D toca o D com a 6ª solta', () => {
    const dropD = INSTRUMENTS.guitar.tunings.find((t) => t.id === 'drop-d')!.pitches;
    const shapes = computeVoicings({ tuning: dropD, chordPcs: [2, 6, 9] }).map(frets);
    expect(shapes.some((f) => f.startsWith('0'))).toBe(true);
  });

  it('banjo em Open G: o acorde de G é tudo solto (inversão permitida)', () => {
    const def = INSTRUMENTS.banjo5;
    const shapes = computeVoicings({
      tuning: def.tunings[0].pitches,
      chordPcs: [7, 11, 2],
      stringStartFret: def.stringStartFret,
      requireRootBass: false,
    }).map(frets);
    expect(shapes).toContain('00000');
  });
});

describe('tétrades e extensões', () => {
  const names = (key: string, root: number, ext: Parameters<typeof extendedField>[1]) =>
    extendedField(buildScale(root, key), ext)!.map((c) => (c ? c.name : '—'));

  it('tétrades de C maior', () => {
    expect(names('maior', 0, '7')).toEqual(['C7M', 'Dm7', 'Em7', 'F7M', 'G7', 'Am7', 'Bm7(b5)']);
  });

  it('acordes com 9 de C maior', () => {
    expect(names('maior', 0, '9')).toEqual(['C7M(9)', 'Dm7(9)', 'Em7(b9)', 'F7M(9)', 'G7(9)', 'Am7(9)', 'Bm7(b5/b9)']);
  });

  it('sus4 não se forma no IV (4ª aumentada) nem no VII', () => {
    expect(names('maior', 0, 'sus4')).toEqual(['Csus4', 'Dsus4', 'Esus4', '—', 'Gsus4', 'Asus4', '—']);
  });

  it('menor harmônica: dominante e diminuto com 7ª', () => {
    const n = names('menor_harmonica', 9, '7');
    expect(n[4]).toBe('E7');
    expect(n[6]).toBe('G#º7');
    expect(n[0]).toBe('Am(7M)');
  });

  it('pentatônica usa a escala-mãe só nos graus presentes', () => {
    expect(names('pentatonica_menor', 4, '7')).toEqual(['Em7', 'G7M', 'Am7', 'Bm7', 'D7']);
  });

  it('escala sem campo harmônico retorna null', () => {
    expect(extendedField(buildScale(0, 'cromatica'), '7')).toBeNull();
  });
});
