/**
 * Testes para a API unificada (theory-engine.ts)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MusicTheoryEngine } from '../../../lib/music-theory';

describe('API Unificada - MusicTheoryEngine', () => {
  let engine: MusicTheoryEngine;

  beforeEach(() => {
    engine = new MusicTheoryEngine();
  });

  describe('Construtor e Configuração', () => {
    it('deve criar engine com configuração padrão', () => {
      expect(engine).toBeInstanceOf(MusicTheoryEngine);
    });

    it('deve aceitar configuração personalizada', () => {
      const customEngine = new MusicTheoryEngine({
        language: 'en',
        notation: 'flat',
        freeTierOnly: true
      });
      
      expect(customEngine).toBeInstanceOf(MusicTheoryEngine);
    });
  });

  describe('Métodos de Notas', () => {
    it('deve criar escala', () => {
      const scale = engine.createScale('C', 'major');
      expect(scale.rootNote).toBe('C');
      expect(scale.type).toBe('major');
      expect(scale.notes).toHaveLength(7);
    });

    it('deve criar acorde', () => {
      const chord = engine.createChord('C', 'major');
      expect(chord.rootNote).toBe('C');
      expect(chord.type).toBe('major');
      expect(chord.notes).toHaveLength(3);
    });

    it('deve transpor nota', () => {
      const result = engine.transposeNote('C', 2);
      expect(result).toBe('D');
    });

    it('deve verificar nota do tier gratuito', () => {
      expect(engine.isFreeTierNote('C')).toBe(true);
      expect(engine.isFreeTierNote('D')).toBe(false);
    });

    it('deve obter nota aleatória', () => {
      const note = engine.getRandomNote();
      expect(typeof note).toBe('string');
      expect(note.length).toBeGreaterThan(0);
    });
  });

  describe('Métodos de Escalas', () => {
    it('deve obter informações da escala', () => {
      const info = engine.getScaleInfo('major');
      expect(info.type).toBe('major');
      expect(info.name).toBe('Major');
    });

    it('deve obter tipos de escala', () => {
      const types = engine.getScaleTypes();
      expect(types.length).toBeGreaterThan(10);
      expect(types).toContain('major');
    });

    it('deve obter tipo de escala aleatório', () => {
      const scaleType = engine.getRandomScaleType();
      const allTypes = engine.getScaleTypes();
      expect(allTypes).toContain(scaleType);
    });

    it('deve obter modos da escala', () => {
      const modes = engine.getScaleModes('major');
      expect(modes).toHaveLength(7);
      expect(modes).toContain('ionian');
    });

    it('deve obter escalas similares', () => {
      const similar = engine.getSimilarScales('major');
      expect(similar.length).toBeGreaterThan(0);
    });

    it('deve obter intervalos da escala', () => {
      const intervals = engine.getScaleIntervals('major');
      expect(intervals).toEqual(['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']);
    });
  });

  describe('Métodos de Acordes', () => {
    it('deve obter informações do acorde', () => {
      const info = engine.getChordInfo('major');
      expect(info.type).toBe('major');
      expect(info.name).toBe('Major');
    });

    it('deve obter tipos de acorde', () => {
      const types = engine.getChordTypes();
      expect(types.length).toBeGreaterThan(10);
      expect(types).toContain('major');
    });

    it('deve obter tipo de acorde aleatório', () => {
      const chordType = engine.getRandomChordType();
      const allTypes = engine.getChordTypes();
      expect(allTypes).toContain(chordType);
    });

    it('deve obter inversões do acorde', () => {
      const chord = engine.createChord('C', 'major');
      const inversions = engine.getChordInversions(chord);
      expect(inversions).toHaveLength(2); // 2 inversões para tríade
    });

    it('deve obter extensões do acorde', () => {
      const extensions = engine.getChordExtensions('major');
      expect(extensions.length).toBeGreaterThan(0);
    });

    it('deve obter voicings do acorde', () => {
      const chord = engine.createChord('C', 'major');
      const voicings = engine.getChordVoicings(chord);
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe('Métodos de Intervalos', () => {
    it('deve obter informações do intervalo', () => {
      const info = engine.getIntervalInfo('P1');
      expect(info.name).toBe('P1');
      expect(info.semitones).toBe(0);
    });

    it('deve obter intervalo entre notas', () => {
      const interval = engine.getIntervalBetweenNotes('C', 'E');
      expect(interval.name).toBe('M3');
      expect(interval.semitones).toBe(4);
    });

    it('deve obter intervalo aleatório', () => {
      const interval = engine.getRandomInterval();
      expect(interval.name).toBeDefined();
      expect(interval.semitones).toBeGreaterThanOrEqual(0);
    });

    it('deve obter intervalo por número de semitons', () => {
      const interval = engine.getIntervalBySemitones(4);
      expect(interval.name).toBe('M3');
    });
  });

  describe('Métodos de Campo Harmônico', () => {
    it('deve calcular campo harmônico', () => {
      const scale = engine.createScale('C', 'major');
      const harmonicField = engine.getHarmonicField(scale);
      
      expect(harmonicField).toHaveLength(7);
      expect(harmonicField[0].rootNote).toBe('C');
      expect(harmonicField[0].type).toBe('major');
    });

    it('deve calcular progressão de acordes', () => {
      const progression = engine.getChordProgression(['I', 'IV', 'V', 'I'], 'C', 'major');
      
      expect(progression).toHaveLength(4);
      expect(progression[0].rootNote).toBe('C');
      expect(progression[1].rootNote).toBe('F');
      expect(progression[2].rootNote).toBe('G');
      expect(progression[3].rootNote).toBe('C');
    });

    it('deve analisar progressão de acordes', () => {
      const chords = [
        engine.createChord('C', 'major'),
        engine.createChord('F', 'major'),
        engine.createChord('G', 'major')
      ];
      
      const analysis = engine.analyzeChordProgression(chords);
      expect(analysis.key).toBe('C');
      expect(analysis.scaleType).toBe('major');
    });
  });

  describe('Métodos de Modulação', () => {
    it('deve modular escala', () => {
      const scale = engine.createScale('C', 'major');
      const modulated = engine.modulateScale(scale, 'G');
      
      expect(modulated.rootNote).toBe('G');
      expect(modulated.type).toBe('major');
    });

    it('deve modular acorde', () => {
      const chord = engine.createChord('C', 'major');
      const modulated = engine.modulateChord(chord, 'G');
      
      expect(modulated.rootNote).toBe('G');
      expect(modulated.type).toBe('major');
    });
  });

  describe('Métodos de Utilidade', () => {
    it('deve validar configuração', () => {
      const validation = engine.validateConfiguration();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('deve retornar informações da engine', () => {
      const info = engine.getEngineInfo();
      expect(info.version).toBeDefined();
      expect(info.name).toBe('MusicOS Theory Engine');
    });

    it('deve limpar cache', () => {
      expect(() => engine.clearCache()).not.toThrow();
    });
  });

  describe('Modo Free Tier', () => {
    it('deve restringir notas no modo free tier', () => {
      const freeTierEngine = new MusicTheoryEngine({ freeTierOnly: true });
      
      expect(freeTierEngine.isFreeTierNote('C')).toBe(true);
      expect(freeTierEngine.isFreeTierNote('G')).toBe(true);
      expect(freeTierEngine.isFreeTierNote('D')).toBe(false);
    });

    it('deve lançar erro ao criar escala com nota não free tier', () => {
      const freeTierEngine = new MusicTheoryEngine({ freeTierOnly: true });
      
      expect(() => freeTierEngine.createScale('D', 'major')).toThrow('Nota não disponível no tier gratuito');
    });

    it('deve lançar erro ao criar acorde com nota não free tier', () => {
      const freeTierEngine = new MusicTheoryEngine({ freeTierOnly: true });
      
      expect(() => freeTierEngine.createChord('D', 'major')).toThrow('Nota não disponível no tier gratuito');
    });

    it('deve permitir apenas notas free tier no getRandomNote', () => {
      const freeTierEngine = new MusicTheoryEngine({ freeTierOnly: true });
      const freeTierNotes = ['C', 'G', 'F', 'A', 'E'];
      
      for (let i = 0; i < 10; i++) {
        const note = freeTierEngine.getRandomNote();
        expect(freeTierNotes).toContain(note);
      }
    });
  });
});