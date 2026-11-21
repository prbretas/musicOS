import { describe, it, expect } from 'vitest';
import { buildScale, harmonicField, pc, shapeKey, toSharp } from '@/lib/music/escalas';
import { CHORD_SHAPES } from '@/lib/music/chord-shapes';
import { SCALE_INFO } from '@/lib/music/scale-info';
import { SCALES } from '@/lib/music/escalas';
import { getCagedKey, getCagedWindows } from '@/lib/music/caged';

const names = (rootPc: number, key: string) => buildScale(rootPc, key).notes.join(' ');
const field = (rootPc: number, key: string, tetrads = true) =>
  harmonicField(buildScale(rootPc, key), tetrads)?.map((c) => `${c.grau}:${c.name}`).join(' ');

describe('pc e toSharp', () => {
  it('reconhece acidentes', () => {
    expect(pc('C')).toBe(0);
    expect(pc('Eb')).toBe(3);
    expect(pc('E#')).toBe(5);
    expect(pc('Cb')).toBe(11);
    expect(pc('F##')).toBe(7);
    expect(toSharp('Bb')).toBe('A#');
  });
});

describe('grafia das escalas', () => {
  it('escalas maiores', () => {
    expect(names(0, 'maior')).toBe('C D E F G A B');
    expect(names(7, 'maior')).toBe('G A B C D E F#');
    expect(names(5, 'maior')).toBe('F G A Bb C D E');
    expect(names(10, 'maior')).toBe('Bb C D Eb F G A');
    expect(names(1, 'maior')).toBe('Db Eb F Gb Ab Bb C');
  });

  it('menores e modos usam a grafia da maior relativa', () => {
    expect(names(0, 'menor_natural')).toBe('C D Eb F G Ab Bb');
    expect(names(9, 'menor_natural')).toBe('A B C D E F G');
    expect(names(0, 'dorico')).toBe('C D Eb F G A Bb');
    expect(names(4, 'frigio')).toBe('E F G A B C D');
    expect(names(5, 'lidio')).toBe('F G A B C D E');
    expect(names(10, 'menor_natural')).toBe('Bb C Db Eb F Gb Ab');
  });

  it('menor harmonica e melodica', () => {
    expect(names(9, 'menor_harmonica')).toBe('A B C D E F G#');
    expect(names(8, 'menor_harmonica')).toBe('G# A# B C# D# E F##');
    expect(names(0, 'menor_melodica')).toBe('C D Eb F G A B');
  });

  it('pentatonicas, blues e simetricas', () => {
    expect(names(0, 'pentatonica_maior')).toBe('C D E G A');
    expect(names(9, 'pentatonica_menor')).toBe('A C D E G');
    expect(names(9, 'blues_menor')).toBe('A C D D# E G');
    expect(names(0, 'tons_inteiros')).toBe('C D E F# G# A#');
    expect(buildScale(0, 'cromatica').notes).toHaveLength(12);
  });
});

describe('campo harmonico', () => {
  it('C maior em tetrades (igual ao MusicPages)', () => {
    expect(field(0, 'maior')).toBe('I:CMaj7 ii:Dm7 iii:Em7 IV:FMaj7 V:G7 vi:Am7 viiº:Bm7b5');
  });

  it('C maior em triades', () => {
    expect(field(0, 'maior', false)).toBe('I:C ii:Dm iii:Em IV:F V:G vi:Am viiº:Bº');
  });

  it('A menor harmonica', () => {
    expect(field(9, 'menor_harmonica')).toBe('i:AmMaj7 iiº:Bm7b5 III+:CMaj7#5 iv:Dm7 V:E7 VI:FMaj7 viiº:G#dim7');
  });

  it('pentatonicas usam as triades da tonalidade', () => {
    expect(field(0, 'pentatonica_maior')).toBe('I:C ii:Dm iii:Em V:G vi:Am');
    expect(field(9, 'pentatonica_menor')).toBe('i:Am III:C iv:Dm v:Em VII:G');
  });

  it('escalas exoticas nao tem campo harmonico', () => {
    expect(harmonicField(buildScale(0, 'hirajoshi'))).toBeNull();
  });
});

describe('CAGED', () => {
  it('C maior: formas na tonalidade de C', () => {
    const w = getCagedWindows('C', 'maior', 15);
    expect(w.E).toEqual([[7, 11]]);
    expect(w.G).toEqual([[4, 8]]);
  });

  it('A menor: forma Em na casa 5 (mesma regiao da forma G de C maior)', () => {
    const w = getCagedWindows('A', 'menor_natural', 15);
    expect(getCagedKey('A', 'menor_natural')).toBe('A');
    expect(w.E).toEqual([[4, 8]]);
    expect(w.D).toEqual([[6, 10]]);
  });

  it('modos usam a maior relativa', () => {
    expect(getCagedKey('D', 'dorico')).toBe('C');
    expect(getCagedWindows('D', 'dorico', 15).E).toEqual([[7, 11]]);
  });
});

describe('dados extraidos do MusicPages', () => {
  it('toda escala do catalogo tem texto', () => {
    for (const s of SCALES) expect(SCALE_INFO[s.key], s.key).toBeDefined();
  });

  it('acordes do campo de C maior existem no banco de posicoes', () => {
    const chords = harmonicField(buildScale(0, 'maior'))!;
    for (const ch of chords) expect(CHORD_SHAPES[shapeKey(ch)!], ch.name).toBeDefined();
  });

  it('posicoes do banco tocam as notas do acorde', () => {
    const open = [4, 9, 2, 7, 11, 4];
    const g7 = CHORD_SHAPES['G7'][0].frets
      .map((f, s) => (f < 0 ? null : (open[s] + f) % 12))
      .filter((x): x is number => x !== null);
    expect(new Set(g7)).toEqual(new Set([7, 11, 2, 5]));
  });
});
