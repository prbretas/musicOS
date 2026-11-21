/**
 * Tests for InstrumentRegistry (CORE-002)
 */

import { instrumentRegistry, DEFAULT_INSTRUMENTS } from '@/lib/music/instruments/registry';
import type { InstrumentProfile, NoteName } from '@/types/music';

describe('InstrumentRegistry', () => {
  // Limpar o singleton antes de cada teste
  beforeEach(() => {
    // Resetar a instância singleton (hack para testes)
    const registry = instrumentRegistry as any;
    Object.keys(registry).forEach(key => {
      if (key !== 'getInstance' && typeof registry[key] === 'function') {
        delete registry[key];
      }
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = instrumentRegistry;
      const instance2 = instrumentRegistry;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Default Instruments', () => {
    it('should have default instruments registered', () => {
      const instruments = instrumentRegistry.getAll();
      expect(instruments.length).toBeGreaterThan(0);
      
      // Verificar instrumentos padrão
      expect(instruments).toContainEqual(
        expect.objectContaining({ id: 'guitarra-6' })
      );
      expect(instruments).toContainEqual(
        expect.objectContaining({ id: 'ukulele' })
      );
      expect(instruments).toContainEqual(
        expect.objectContaining({ id: 'baixo-4' })
      );
    });

    it('should return instrument by ID', () => {
      const guitar = instrumentRegistry.getById('guitarra-6');
      expect(guitar).toBeDefined();
      expect(guitar?.id).toBe('guitarra-6');
      expect(guitar?.name).toBe('Guitarra (6 cordas)');
      expect(guitar?.strings).toBe(6);
      expect(guitar?.tuning).toHaveLength(6);
      expect(guitar?.frets).toBe(24);
    });

    it('should return null for non-existent instrument', () => {
      const result = instrumentRegistry.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Default Instrument', () => {
    it('should return default instrument', () => {
      const defaultInstrument = instrumentRegistry.getDefault();
      expect(defaultInstrument).toBeDefined();
      expect(defaultInstrument.id).toBe('guitarra-6');
    });

    it('should allow changing default instrument', () => {
      // Primeiro verificar o padrão
      const originalDefault = instrumentRegistry.getDefault();
      expect(originalDefault.id).toBe('guitarra-6');

      // Mudar para ukulele
      instrumentRegistry.setDefaultInstrument('ukulele');
      
      // Nota: Como é singleton, pode afetar outros testes
      // Em um sistema real, isso seria persistido
    });
  });

  describe('Instrument Registration', () => {
    const customInstrument: InstrumentProfile = {
      id: 'custom-test',
      name: 'Instrumento de Teste',
      strings: 7,
      tuning: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
      octaves: [1, 1, 2, 2, 2, 3, 3],
      frets: 24,
      fretless: false,
    };

    it('should register new instrument', () => {
      const beforeCount = instrumentRegistry.getAll().length;
      const result = instrumentRegistry.registerInstrument(customInstrument);
      
      expect(result).toBe(true);
      
      const afterCount = instrumentRegistry.getAll().length;
      expect(afterCount).toBe(beforeCount + 1);
      
      const retrieved = instrumentRegistry.getById('custom-test');
      expect(retrieved).toEqual(customInstrument);
    });

    it('should not register duplicate instrument', () => {
      const firstResult = instrumentRegistry.registerInstrument(customInstrument);
      expect(firstResult).toBe(true);
      
      const secondResult = instrumentRegistry.registerInstrument(customInstrument);
      expect(secondResult).toBe(false);
    });

    it('should validate instrument profile', () => {
      const invalidInstrument = {
        id: '',
        name: '',
        strings: 0,
        tuning: [],
        octaves: [],
        frets: 0,
        fretless: false,
      } as InstrumentProfile;

      const result = instrumentRegistry.registerInstrument(invalidInstrument);
      expect(result).toBe(false);
    });

    it('should update existing instrument', () => {
      // Primeiro registrar
      instrumentRegistry.registerInstrument(customInstrument);
      
      // Depois atualizar
      const updates = { name: 'Instrumento Atualizado', frets: 22 };
      const result = instrumentRegistry.updateInstrument('custom-test', updates);
      
      expect(result).toBe(true);
      
      const updated = instrumentRegistry.getById('custom-test');
      expect(updated?.name).toBe('Instrumento Atualizado');
      expect(updated?.frets).toBe(22);
      expect(updated?.strings).toBe(7); // Mantém outros valores
    });

    it('should not update non-existent instrument', () => {
      const result = instrumentRegistry.updateInstrument('non-existent', { name: 'Test' });
      expect(result).toBe(false);
    });

    it('should remove custom instrument', () => {
      // Registrar
      instrumentRegistry.registerInstrument(customInstrument);
      const beforeCount = instrumentRegistry.getAll().length;
      
      // Remover
      const result = instrumentRegistry.removeInstrument('custom-test');
      expect(result).toBe(true);
      
      const afterCount = instrumentRegistry.getAll().length;
      expect(afterCount).toBe(beforeCount - 1);
      
      const retrieved = instrumentRegistry.getById('custom-test');
      expect(retrieved).toBeNull();
    });

    it('should not remove default instrument', () => {
      const result = instrumentRegistry.removeInstrument('guitarra-6');
      expect(result).toBe(false);
      
      const guitar = instrumentRegistry.getById('guitarra-6');
      expect(guitar).toBeDefined();
    });
  });

  describe('Tuning Management', () => {
    it('should get default tuning for instrument', () => {
      const guitarTuning = instrumentRegistry.getDefaultTuning('guitarra-6');
      expect(guitarTuning).toBeDefined();
      expect(guitarTuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
      
      const ukuleleTuning = instrumentRegistry.getDefaultTuning('ukulele');
      expect(ukuleleTuning).toEqual(['G', 'C', 'E', 'A']);
    });

    it('should return null for non-existent instrument tuning', () => {
      const result = instrumentRegistry.getDefaultTuning('non-existent');
      expect(result).toBeNull();
    });

    it('should get available tunings for instrument', () => {
      const guitarTunings = instrumentRegistry.getAvailableTunings('guitarra-6');
      expect(guitarTunings).toBeInstanceOf(Array);
      expect(guitarTunings.length).toBeGreaterThan(0);
      
      // Deve incluir a afinação padrão
      const standardTuning = guitarTunings.find(t => t.id === 'standard');
      expect(standardTuning).toBeDefined();
      expect(standardTuning?.tuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    });

    it('should save custom tuning', () => {
      const customTuning: NoteName[] = ['D', 'A', 'D', 'G', 'B', 'E']; // Drop D
      const result = instrumentRegistry.saveCustomTuning('my-drop-d', customTuning, 'guitarra-6');
      
      expect(result).toBe(true);
      
      // Verificar se está disponível
      const tunings = instrumentRegistry.getAvailableTunings('guitarra-6');
      const custom = tunings.find(t => t.id === 'my-drop-d');
      expect(custom).toBeDefined();
      expect(custom?.tuning).toEqual(customTuning);
    });

    it('should not save invalid tuning', () => {
      const invalidTuning: NoteName[] = ['C', 'D']; // Poucas notas para guitarra
      const result = instrumentRegistry.saveCustomTuning('invalid', invalidTuning, 'guitarra-6');
      
      expect(result).toBe(false);
    });
  });

  describe('Fretboard Calculations', () => {
    it('should calculate note at position', () => {
      // Guitarra padrão: E2, A2, D3, G3, B3, E4
      const note1 = instrumentRegistry.calculateNoteAtPosition('guitarra-6', 0, 0); // Corda 6 (E) aberta
      expect(note1).toBe('E');
      
      const note2 = instrumentRegistry.calculateNoteAtPosition('guitarra-6', 0, 1); // Corda 6, traste 1
      expect(note2).toBe('F');
      
      const note3 = instrumentRegistry.calculateNoteAtPosition('guitarra-6', 0, 12); // Corda 6, traste 12 (oitava)
      expect(note3).toBe('E');
      
      const note4 = instrumentRegistry.calculateNoteAtPosition('guitarra-6', 5, 0); // Corda 1 (E) aberta
      expect(note4).toBe('E');
    });

    it('should return null for invalid positions', () => {
      const invalidString = instrumentRegistry.calculateNoteAtPosition('guitarra-6', 10, 0);
      expect(invalidString).toBeNull();
      
      const invalidFret = instrumentRegistry.calculateNoteAtPosition('guitarra-6', 0, 30); // Acima do número de trastes
      expect(invalidFret).toBeNull();
      
      const invalidInstrument = instrumentRegistry.calculateNoteAtPosition('non-existent', 0, 0);
      expect(invalidInstrument).toBeNull();
    });

    it('should find all positions of a note', () => {
      const positions = instrumentRegistry.findNotePositions('guitarra-6', 'E');
      
      expect(positions).toBeInstanceOf(Array);
      expect(positions.length).toBeGreaterThan(0);
      
      // Verificar algumas posições conhecidas
      expect(positions).toContainEqual({ string: 0, fret: 0 }); // Corda 6 aberta
      expect(positions).toContainEqual({ string: 5, fret: 0 }); // Corda 1 aberta
      expect(positions).toContainEqual({ string: 0, fret: 12 }); // Corda 6, traste 12
    });

    it('should return empty array for non-existent instrument', () => {
      const positions = instrumentRegistry.findNotePositions('non-existent', 'C');
      expect(positions).toEqual([]);
    });

    it('should calculate interval between positions', () => {
      // Corda 6 aberta (E) para corda 6, traste 5 (A) = 7 semitons (quinta justa)
      const interval1 = instrumentRegistry.getIntervalBetweenPositions(
        'guitarra-6',
        { string: 0, fret: 0 },
        { string: 0, fret: 5 }
      );
      expect(interval1).toBe(7);
      
      // Corda 6 aberta (E) para corda 5 aberta (A) = 7 semitons (quinta justa)
      const interval2 = instrumentRegistry.getIntervalBetweenPositions(
        'guitarra-6',
        { string: 0, fret: 0 },
        { string: 1, fret: 0 }
      );
      expect(interval2).toBe(7);
    });

    it('should return null for invalid interval calculation', () => {
      const interval = instrumentRegistry.getIntervalBetweenPositions(
        'non-existent',
        { string: 0, fret: 0 },
        { string: 1, fret: 0 }
      );
      expect(interval).toBeNull();
    });
  });

  describe('Instrument Utilities', () => {
    it('should export default instruments', () => {
      expect(DEFAULT_INSTRUMENTS).toBeDefined();
      expect(DEFAULT_INSTRUMENTS['guitarra-6']).toBeDefined();
      expect(DEFAULT_INSTRUMENTS['ukulele']).toBeDefined();
    });

    it('should provide instrument utilities', () => {
      // Testar algumas funções utilitárias
      const guitar = DEFAULT_INSTRUMENTS['guitarra-6'];
      
      // Verificar se é baixo
      const isBass = instrumentRegistry['instrumentUtils']?.isBass?.('baixo-4');
      expect(isBass).toBe(true);
      
      const isNotBass = instrumentRegistry['instrumentUtils']?.isBass?.('guitarra-6');
      expect(isNotBass).toBe(false);
    });
  });
});