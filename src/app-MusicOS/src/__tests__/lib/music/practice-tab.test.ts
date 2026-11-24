// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { FREE_PRACTICE_IDS, PRACTICE, seq, totalBeats } from '@/lib/music/practice';
import { computeTab, fitShift } from '@/lib/music/tablature';
import { FREE_INSTRUMENTS, INSTRUMENTS, pitchToMidi, semitonesAt } from '@/lib/music/tunings';
import { canUse } from '@/lib/features';

const guitar = INSTRUMENTS.guitar.tunings[0].pitches;
const tabOf = (id: string, inst: keyof typeof INSTRUMENTS = 'guitar') => {
  const ex = PRACTICE.find((p) => p.id === id)!;
  const def = INSTRUMENTS[inst];
  const tuning = def.tunings[0].pitches;
  if (ex.build) {
    const built = ex.build(tuning, def.stringStartFret);
    return built ? { ...built, shift: 0 } : null;
  }
  const tab = computeTab(ex.notes!.map((n) => n.m), {
    tuning,
    stringStartFret: def.stringStartFret,
    maxFret: def.frets,
    position: ex.position,
    preferLowOctave: def.bass,
  });
  return tab ? { notes: ex.notes!, positions: tab.positions, shift: tab.shift } : null;
};
const fmt = (positions: ({ s: number; f: number } | null)[], n = 6) =>
  positions.map((p) => (p ? `${n - p.s}:${p.f}` : '-'));

describe('plano grátis', () => {
  it('3 instrumentos grátis: violão/guitarra, cavaquinho e baixo', () => {
    expect([...FREE_INSTRUMENTS].sort()).toEqual(['bass4', 'cavaquinho', 'guitar']);
  });

  it('3 exercícios de prática grátis', () => {
    expect(FREE_PRACTICE_IDS.size).toBe(3);
  });

  it('metrônomo básico grátis; completo, prática e treino completo são Pro', () => {
    expect(canUse('free', 'metronome')).toBe(true);
    expect(canUse('free', 'metronome-pro')).toBe(false);
    expect(canUse('free', 'practice')).toBe(false);
    expect(canUse('pro', 'practice')).toBe(true);
  });
});

describe('catálogo de prática', () => {
  it('ids únicos, só material original ou em domínio público', () => {
    const ids = PRACTICE.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PRACTICE) {
      expect(['original', 'dominio-publico']).toContain(p.source);
      if (p.source === 'dominio-publico') expect(p.credit).toBeTruthy();
    }
  });

  it('todo exercício fecha compassos inteiros (descontando a anacruse)', () => {
    for (const p of PRACTICE) {
      const notes = p.build ? p.build(guitar)!.notes : p.notes!;
      const beats = totalBeats(notes) - (p.pickup ?? 0);
      expect(beats % p.meter, `${p.id}: ${beats} tempos em ${p.meter}/4`).toBeCloseTo(0, 6);
    }
  });

  it('notação compacta', () => {
    expect(seq('E4 D#4:0.5 R:1')).toEqual([
      { m: 64, d: 1 },
      { m: 63, d: 0.5 },
      { m: null, d: 1 },
    ]);
  });
});

describe('tablatura', () => {
  it('toda nota da tab soa a altura certa, em todos os instrumentos', () => {
    for (const inst of Object.keys(INSTRUMENTS) as (keyof typeof INSTRUMENTS)[]) {
      const def = INSTRUMENTS[inst];
      const open = def.tunings[0].pitches.map(pitchToMidi);
      for (const ex of PRACTICE) {
        const r = tabOf(ex.id, inst);
        if (!r) continue; // não cabe neste instrumento: a tela avisa
        r.notes.forEach((note, i) => {
          const p = r.positions[i];
          if (note.m === null) return expect(p).toBeNull();
          expect(p, `${inst}/${ex.id}#${i}`).not.toBeNull();
          const semis = semitonesAt(p!.f, def.stringStartFret?.[p!.s] ?? 0);
          expect(open[p!.s] + semis!).toBe(note.m + r.shift);
          expect(p!.f).toBeLessThanOrEqual(def.frets);
        });
      }
    }
  });

  it('exercícios grátis funcionam nos 3 instrumentos grátis', () => {
    for (const inst of FREE_INSTRUMENTS) {
      for (const id of FREE_PRACTICE_IDS) expect(tabOf(id, inst), `${inst}/${id}`).not.toBeNull();
    }
  });

  it('violão: digitações usuais', () => {
    expect(fmt(tabOf('cromatico-1234')!.positions).slice(0, 8)).toEqual(['6:1', '6:2', '6:3', '6:4', '5:1', '5:2', '5:3', '5:4']);
    expect(fmt(tabOf('escala-do-maior')!.positions).slice(0, 8)).toEqual(['5:3', '4:0', '4:2', '4:3', '3:0', '3:2', '2:0', '2:1']);
    // frase de pentatônica fica na casa 5 (sem corda solta)
    expect(tabOf('lick-pentatonica-am')!.positions.every((p) => !p || p.f >= 5)).toBe(true);
  });

  it('baixo: riff grave na oitava do baixo, melodia aguda desce', () => {
    const boogie = tabOf('boogie-blues-e', 'bass4')!;
    expect(fmt(boogie.positions, 4)[0]).toBe('4:0'); // Mi solto
    expect(tabOf('brilha-brilha', 'bass4')!.shift).toBe(-24);
  });

  it('cavaquinho: riff grave sobe de oitava', () => {
    expect(tabOf('boogie-blues-e', 'cavaquinho')!.shift).toBeGreaterThan(0);
  });

  it('melodia fora da extensão retorna null', () => {
    expect(fitShift([20, 100], { tuning: guitar })).toBeNull();
  });
});
