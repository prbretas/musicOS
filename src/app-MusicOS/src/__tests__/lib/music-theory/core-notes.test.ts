/**
 * Testes para o módulo core/notes.ts
 */

import { describe, it, expect } from 'vitest';
import {
  getNaturalNotes,
  getNoteInfo,
  isValidNote,
  transposeNote,
  noteToFrequency,
  getNoteByFrequency,
  getRandomNote,
  isFreeTierNote
} from '../../../lib/music-theory';

describe('Módulo Core - Notes', () => {
  describe('getNaturalNotes', () => {
    it('deve retornar todas as notas naturais', () => {
      const notes = getNaturalNotes();
      expect(notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });
  });

  describe('getNoteInfo', () => {
    it('deve retornar informações da nota C', () => {
      const info = getNoteInfo('C');
      expect(info.name).toBe('C');
      expect(info.octave).toBe(4);
      expect(info.frequency).toBeCloseTo(261.63, 2);
    });

    it('deve retornar informações da nota C#', () => {
      const info = getNoteInfo('C#');
      expect(info.name).toBe('C#');
      expect(info.alternativeName).toBe('Db');
    });

    it('deve aceitar octave customizada', () => {
      const info = getNoteInfo('C', 3);
      expect(info.octave).toBe(3);
      expect(info.frequency).toBeCloseTo(130.81, 2);
    });
  });

  describe('isValidNote', () => {
    it('deve validar nota C como true', () => {
      expect(isValidNote('C')).toBe(true);
    });

    it('deve validar nota C# como true', () => {
      expect(isValidNote('C#')).toBe(true);
    });

    it('deve validar nota Db como true', () => {
      expect(isValidNote('Db')).toBe(true);
    });

    it('deve validar nota inválida como false', () => {
      expect(isValidNote('H')).toBe(false);
      expect(isValidNote('C##')).toBe(false);
    });
  });

  describe('transposeNote', () => {
    it('deve transpor C em 2 semitons para D', () => {
      const result = transposeNote('C', 2);
      expect(result).toBe('D');
    });

    it('deve transpor C em -2 semitons para A#', () => {
      const result = transposeNote('C', -2);
      expect(result).toBe('A#');
    });

    it('deve transpor B em 1 semitom para C', () => {
      const result = transposeNote('B', 1);
      expect(result).toBe('C');
    });

    it('deve manter a notação preferida (sustenidos)', () => {
      const result = transposeNote('C', 1, 'sharp');
      expect(result).toBe('C#');
    });

    it('deve manter a notação preferida (bemóis)', () => {
      const result = transposeNote('C', 1, 'flat');
      expect(result).toBe('Db');
    });
  });

  describe('noteToFrequency', () => {
    it('deve calcular frequência de A4 como 440Hz', () => {
      const freq = noteToFrequency('A', 4);
      expect(freq).toBeCloseTo(440, 2);
    });

    it('deve calcular frequência de C4 como 261.63Hz', () => {
      const freq = noteToFrequency('C', 4);
      expect(freq).toBeCloseTo(261.63, 2);
    });

    it('deve calcular frequência de C5 como o dobro de C4', () => {
      const freqC4 = noteToFrequency('C', 4);
      const freqC5 = noteToFrequency('C', 5);
      expect(freqC5).toBeCloseTo(freqC4 * 2, 2);
    });
  });

  describe('getNoteByFrequency', () => {
    it('deve identificar 440Hz como A4', () => {
      const note = getNoteByFrequency(440);
      expect(note.name).toBe('A');
      expect(note.octave).toBe(4);
    });

    it('deve identificar 261.63Hz como C4', () => {
      const note = getNoteByFrequency(261.63);
      expect(note.name).toBe('C');
      expect(note.octave).toBe(4);
    });

    it('deve lidar com frequência entre notas', () => {
      const note = getNoteByFrequency(445); // Entre A4 e A#4
      expect(note.name).toBe('A');
      expect(note.octave).toBe(4);
    });

    it('deve lidar com frequência muito baixa', () => {
      const note = getNoteByFrequency(1);
      expect(note.name).toBe('C');
      expect(note.octave).toBe(0);
    });

    it('deve lidar com frequência muito alta', () => {
      const note = getNoteByFrequency(20000);
      expect(note.name).toBe('G');
      expect(note.octave).toBe(9);
    });
  });

  describe('getRandomNote', () => {
    it('deve retornar uma nota válida', () => {
      const note = getRandomNote();
      expect(isValidNote(note)).toBe(true);
    });

    it('deve retornar apenas notas do tier gratuito quando solicitado', () => {
      const freeTierNotes = ['C', 'G', 'F', 'A', 'E'];
      
      for (let i = 0; i < 20; i++) {
        const note = getRandomNote(true);
        expect(freeTierNotes).toContain(note);
      }
    });
  });

  describe('isFreeTierNote', () => {
    it('deve identificar C como tier gratuito', () => {
      expect(isFreeTierNote('C')).toBe(true);
    });

    it('deve identificar G como tier gratuito', () => {
      expect(isFreeTierNote('G')).toBe(true);
    });

    it('deve identificar F como tier gratuito', () => {
      expect(isFreeTierNote('F')).toBe(true);
    });

    it('deve identificar A como tier gratuito', () => {
      expect(isFreeTierNote('A')).toBe(true);
    });

    it('deve identificar E como tier gratuito', () => {
      expect(isFreeTierNote('E')).toBe(true);
    });

    it('deve identificar D como NÃO tier gratuito', () => {
      expect(isFreeTierNote('D')).toBe(false);
    });

    it('deve identificar B como NÃO tier gratuito', () => {
      expect(isFreeTierNote('B')).toBe(false);
    });

    it('deve identificar C# como NÃO tier gratuito', () => {
      expect(isFreeTierNote('C#')).toBe(false);
    });
  });
});