// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PRACTICE, buildArpeggio, chordPcs } from '@/lib/music/practice';
import { INSTRUMENTS, pitchToMidi, semitonesAt } from '@/lib/music/tunings';
import { SHAPE_ORDER } from '@/lib/music/caged';
import { allCagedPositions, cagedPosition, gripMidis, backingVoicing, BACKING_PROGRESSIONS } from '@/lib/music/cagedGrips';

const guitar = INSTRUMENTS.guitar.tunings[0].pitches;
const arps = PRACTICE.filter((p) => p.category === 'arpejo');
const mod12 = (n: number) => ((n % 12) + 12) % 12;

describe('arpejos', () => {
  it('há arpejos em todas as cordas, nas 3 e nas 4 primeiras', () => {
    expect(arps.length).toBeGreaterThanOrEqual(5);
    expect(arps.some((a) => a.id.includes('todas'))).toBe(true);
    expect(arps.some((a) => a.id.includes('3-cordas'))).toBe(true);
    expect(arps.some((a) => a.id.includes('4-cordas'))).toBe(true);
  });

  it('cada nota pertence ao acorde da vez e está na corda e casa certas', () => {
    const open = guitar.map(pitchToMidi);
    const r = buildArpeggio(guitar, undefined, { chords: ['C', 'Am', 'F', 'G'], strings: 'all' })!;
    expect(r).not.toBeNull();
    let t = 0;
    const chords = ['C', 'Am', 'F', 'G'].map(chordPcs);
    r.notes.forEach((n, i) => {
      const p = r.positions[i]!;
      expect(open[p.s] + semitonesAt(p.f, 0)!).toBe(n.m);
      // a última nota (semibreve final) repete a primeira, do 1º acorde
      const bar = i === r.notes.length - 1 ? 0 : Math.floor(t / 4 + 1e-9);
      expect(chords[bar]).toContain(mod12(n.m!));
      t += n.d;
    });
  });

  it('3 e 4 primeiras cordas usam só as cordas agudas', () => {
    const three = buildArpeggio(guitar, undefined, { chords: ['C', 'G'], strings: 3 })!;
    expect(three.positions.every((p) => p!.s >= 3)).toBe(true);
    expect(new Set(three.positions.map((p) => p!.s)).size).toBe(3);
    const four = buildArpeggio(guitar, undefined, { chords: ['Am', 'E'], strings: 4 })!;
    expect(four.positions.every((p) => p!.s >= 2)).toBe(true);
    expect(new Set(four.positions.map((p) => p!.s)).size).toBe(4);
  });

  it('inversões sobem o braço', () => {
    const r = buildArpeggio(guitar, undefined, { chords: ['C', 'C', 'C'], strings: 3, ascend: true })!;
    const firstFretOfBar = [0, 12, 24].map((i) => Math.max(...r.positions.slice(i, i + 3).map((p) => p!.f)));
    expect(firstFretOfBar[1]).toBeGreaterThan(firstFretOfBar[0]);
    expect(firstFretOfBar[2]).toBeGreaterThan(firstFretOfBar[1]);
  });

  it('não cabe → null (3 cordas pedidas num instrumento de 2)', () => {
    expect(buildArpeggio(['E2', 'A2'], undefined, { chords: ['C'], strings: 3 })).toBeNull();
  });

  it('funcionam em todos os instrumentos com 3+ cordas', () => {
    for (const def of Object.values(INSTRUMENTS)) {
      const tuning = def.tunings[0].pitches;
      for (const ex of arps) {
        const r = ex.build!(tuning, def.stringStartFret);
        expect(r, `${def.label}/${ex.id}`).not.toBeNull();
      }
    }
  });
});

describe('CAGED: escala e acorde juntos', () => {
  it('tom de C maior: forma C aberta, A na 3, G na 5, E na 8, D na 10', () => {
    const pos = allCagedPositions(0, 'major');
    expect(pos.map((p) => `${p.shape}${p.k}`)).toEqual(['C0', 'A3', 'G5', 'E8', 'D10']);
    expect(cagedPosition(0, 'major', 'C').grip.map((g) => g.f)).toEqual([3, 2, 0, 1, 0]);
  });

  it('o desenho de cada forma soa o acorde da tônica, com a fundamental no baixo', () => {
    for (const quality of ['major', 'minor'] as const) {
      const third = quality === 'major' ? 4 : 3;
      for (let key = 0; key < 12; key++) {
        for (const shape of SHAPE_ORDER) {
          const p = cagedPosition(key, quality, shape);
          const pcs = new Set(gripMidis(p).map(mod12));
          expect([...pcs].sort((a, b) => a - b)).toEqual([key, key + third, key + 7].map(mod12).sort((a, b) => a - b));
          expect(mod12(gripMidis(p)[0])).toBe(key);
          // o acorde cabe na região da escala
          for (const g of p.grip) {
            expect(g.f).toBeGreaterThanOrEqual(p.window[0]);
            expect(g.f).toBeLessThanOrEqual(p.window[1]);
          }
          expect(p.window[1]).toBeLessThanOrEqual(15);
        }
      }
    }
  });

  it('Lá menor: forma Em fica na casa 5 (pestana de Am)', () => {
    expect(cagedPosition(9, 'minor', 'E').grip.map((g) => g.f)).toEqual([5, 7, 7, 5, 5, 5]);
  });

  it('base de improviso: acordes certos', () => {
    const [ii] = BACKING_PROGRESSIONS.major;
    const v = backingVoicing(2, ii.chords[1]); // IV de D = G
    expect(mod12(v.bass)).toBe(7);
    expect(v.triad.map(mod12)).toEqual([7, 11, 2]);
  });
});
