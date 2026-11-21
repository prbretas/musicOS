/**
 * Testes para o módulo core/scales.ts
 */

import { describe, it, expect } from 'vitest';
import {
  createScale,
  getScaleInfo,
  getScaleTypes,
  getScaleNotes,
  getRandomScaleType,
  getScaleModes,
  getScaleIntervals,
  getScaleFormula,
  isValidScaleType
} from '../../../lib/music-theory';

describe('Módulo Core - Scales', () => {
  describe('createScale', () => {
    it('deve criar escala maior de C', () => {
      const scale = createScale('C', 'major');
      
      expect(scale.rootNote).toBe('C');
      expect(scale.type).toBe('major');
      expect(scale.name).toBe('C Major');
      expect(scale.notes).toHaveLength(7);
      expect(scale.notes.map(n => n.name)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('deve criar escala menor natural de A', () => {
      const scale = createScale('A', 'minor');
      
      expect(scale.rootNote).toBe('A');
      expect(scale.type).toBe('minor');
      expect(scale.name).toBe('A Minor');
      expect(scale.notes.map(n => n.name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('deve criar escala pentatônica maior de C', () => {
      const scale = createScale('C', 'pentatonic-major');
      
      expect(scale.type).toBe('pentatonic-major');
      expect(scale.notes).toHaveLength(5);
      expect(scale.notes.map(n => n.name)).toEqual(['C', 'D', 'E', 'G', 'A']);
    });

    it('deve criar escala blues de C', () => {
      const scale = createScale('C', 'blues');
      
      expect(scale.type).toBe('blues');
      expect(scale.notes).toHaveLength(6);
      expect(scale.notes.map(n => n.name)).toEqual(['C', 'Eb', 'F', 'F#', 'G', 'Bb']);
    });

    it('deve lançar erro para tipo de escala inválido', () => {
      expect(() => createScale('C', 'invalid' as any)).toThrow('Tipo de escala inválido');
    });
  });

  describe('getScaleInfo', () => {
    it('deve retornar informações da escala maior', () => {
      const info = getScaleInfo('major');
      
      expect(info.type).toBe('major');
      expect(info.name).toBe('Major');
      expect(info.description).toBeDefined();
      expect(info.formula).toBeDefined();
      expect(info.intervals).toHaveLength(7);
    });

    it('deve retornar informações da escala menor', () => {
      const info = getScaleInfo('minor');
      
      expect(info.type).toBe('minor');
      expect(info.name).toBe('Minor');
      expect(info.description).toContain('menor');
    });

    it('deve lançar erro para tipo de escala inválido', () => {
      expect(() => getScaleInfo('invalid' as any)).toThrow('Tipo de escala inválido');
    });
  });

  describe('getScaleTypes', () => {
    it('deve retornar todos os tipos de escala', () => {
      const types = getScaleTypes();
      
      expect(types).toBeInstanceOf(Array);
      expect(types.length).toBeGreaterThan(10); // Deve ter pelo menos 10 tipos
      expect(types).toContain('major');
      expect(types).toContain('minor');
      expect(types).toContain('pentatonic-major');
      expect(types).toContain('blues');
    });

    it('deve filtrar por categoria', () => {
      const diatonicTypes = getScaleTypes('diatonic');
      expect(diatonicTypes).toContain('major');
      expect(diatonicTypes).toContain('minor');
    });

    it('deve retornar categorias disponíveis', () => {
      const categories = getScaleTypes('categories');
      expect(categories).toBeInstanceOf(Array);
      expect(categories).toContain('diatonic');
      expect(categories).toContain('pentatonic');
      expect(categories).toContain('exotic');
    });
  });

  describe('getScaleNotes', () => {
    it('deve retornar notas da escala maior de C', () => {
      const notes = getScaleNotes('C', 'major');
      
      expect(notes).toHaveLength(7);
      expect(notes.map(n => n.name)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('deve retornar notas da escala menor de A', () => {
      const notes = getScaleNotes('A', 'minor');
      
      expect(notes.map(n => n.name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });
  });

  describe('getRandomScaleType', () => {
    it('deve retornar um tipo de escala válido', () => {
      const scaleType = getRandomScaleType();
      const allTypes = getScaleTypes();
      
      expect(allTypes).toContain(scaleType);
    });

    it('deve filtrar por categoria', () => {
      const diatonicTypes = getScaleTypes('diatonic');
      const randomDiatonic = getRandomScaleType('diatonic');
      
      expect(diatonicTypes).toContain(randomDiatonic);
    });
  });

  describe('getScaleModes', () => {
    it('deve retornar modos da escala maior', () => {
      const modes = getScaleModes('major');
      
      expect(modes).toHaveLength(7);
      expect(modes).toContain('ionian'); // Modo 1
      expect(modes).toContain('dorian'); // Modo 2
      expect(modes).toContain('phrygian'); // Modo 3
      expect(modes).toContain('lydian'); // Modo 4
      expect(modes).toContain('mixolydian'); // Modo 5
      expect(modes).toContain('aeolian'); // Modo 6 (menor natural)
      expect(modes).toContain('locrian'); // Modo 7
    });

    it('deve retornar array vazio para escalas sem modos definidos', () => {
      const modes = getScaleModes('blues');
      expect(modes).toEqual([]);
    });
  });

  describe('getScaleIntervals', () => {
    it('deve retornar intervalos da escala maior', () => {
      const intervals = getScaleIntervals('major');
      
      expect(intervals).toHaveLength(7);
      expect(intervals).toEqual(['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']);
    });

    it('deve retornar intervalos da escala menor natural', () => {
      const intervals = getScaleIntervals('minor');
      
      expect(intervals).toEqual(['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7']);
    });
  });

  describe('getScaleFormula', () => {
    it('deve retornar fórmula da escala maior', () => {
      const formula = getScaleFormula('major');
      
      expect(formula).toBe('W-W-H-W-W-W-H');
    });

    it('deve retornar fórmula da escala menor natural', () => {
      const formula = getScaleFormula('minor');
      
      expect(formula).toBe('W-H-W-W-H-W-W');
    });
  });

  describe('isValidScaleType', () => {
    it('deve validar tipo major como true', () => {
      expect(isValidScaleType('major')).toBe(true);
    });

    it('deve validar tipo minor como true', () => {
      expect(isValidScaleType('minor')).toBe(true);
    });

    it('deve validar tipo pentatonic-major como true', () => {
      expect(isValidScaleType('pentatonic-major')).toBe(true);
    });

    it('deve validar tipo inválido como false', () => {
      expect(isValidScaleType('invalid')).toBe(false);
      expect(isValidScaleType('')).toBe(false);
    });
  });
});