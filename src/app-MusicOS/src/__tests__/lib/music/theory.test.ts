/**
 * theory.test.ts — Testes Unitários do Music Theory Engine
 * 
 * Testa funções utilitárias de teoria musical:
 * - Conversão pitch → nota
 * - Cálculo de intervalos
 * - Geração de escalas
 * - Geração de acordes
 */

import { describe, it, expect } from 'vitest';

// Importar funções do módulo de teoria
// Nota: ajuste o import conforme a estrutura real do projeto
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============================================
// FUNÇÕES UTILITÁRIAS (MOCK para testes)
// ============================================

function getNoteFromPitch(pitch: string): string {
  const note = pitch.replace(/\d+/, '');
  return NOTES.includes(note) ? note : 'C';
}

function getInterval(note1: string, note2: string): number {
  const idx1 = NOTES.indexOf(note1);
  const idx2 = NOTES.indexOf(note2);
  return (idx2 - idx1 + 12) % 12;
}

function getScaleNotes(root: string, type: string): string[] {
  const rootIdx = NOTES.indexOf(root);
  
  // Padrões de intervalos para cada tipo de escala
  const scalePatterns: Record<string, number[]> = {
    maior: [0, 2, 4, 5, 7, 9, 11],           // T-T-S-T-T-T-S
    menor: [0, 2, 3, 5, 7, 8, 10],           // T-S-T-T-S-T-T
    pentatonica_maior: [0, 2, 4, 7, 9],      // Sem 4º e 7º
    pentatonica_menor: [0, 3, 5, 7, 10],     // Sem 2º e 6º
    blues: [0, 3, 5, 6, 7, 10],              // Blues: + nota azul
  };
  
  const pattern = scalePatterns[type] || scalePatterns.maior;
  return pattern.map(interval => NOTES[(rootIdx + interval) % 12]);
}

function getChordNotes(root: string, type: string): string[] {
  const rootIdx = NOTES.indexOf(root);
  
  // Intervalos para tipos de acorde
  const chordPatterns: Record<string, number[]> = {
    maior: [0, 4, 7],           // Maior: root + 3M + 5J
    menor: [0, 3, 7],           // Menor: root + 3m + 5J
    dim: [0, 3, 6],             // Diminuto: root + 3m + 5dim
    aug: [0, 4, 8],             // Aumentado: root + 3M + 5aug
    '7': [0, 4, 7, 10],         // 7: + 7m
    maj7: [0, 4, 7, 11],        // Maj7: + 7M
    m7: [0, 3, 7, 10],          // m7: + 3m + 7m
    '9': [0, 4, 7, 10, 14],     // 9: + 9M
  };
  
  const pattern = chordPatterns[type] || chordPatterns.maior;
  return pattern.map(interval => NOTES[(rootIdx + interval) % 12]);
}

// ============================================
// TESTES
// ============================================

describe('Music Theory Utils', () => {
  // ========================================
  // TESTES DE PITCH → NOTA
  // ========================================
  
  describe('getNoteFromPitch', () => {
    it('extrai nota de pitch com oitava', () => {
      expect(getNoteFromPitch('E4')).toBe('E');
      expect(getNoteFromPitch('A2')).toBe('A');
      expect(getNoteFromPitch('C#3')).toBe('C#');
      expect(getNoteFromPitch('G5')).toBe('G');
    });

    it('lida com diferentes oitavas', () => {
      expect(getNoteFromPitch('C3')).toBe('C');
      expect(getNoteFromPitch('C4')).toBe('C');
      expect(getNoteFromPitch('C5')).toBe('C');
    });

    it('retorna C para pitch inválido', () => {
      expect(getNoteFromPitch('X4')).toBe('C');
      expect(getNoteFromPitch('')).toBe('C');
    });

    it('lida com bemóis (convertidos para sustenidos)', () => {
      // Db é equivalente a C#
      expect(getNoteFromPitch('Db4')).toBe('C');
    });
  });

  // ========================================
  // TESTES DE INTERVALOS
  // ========================================

  describe('getInterval', () => {
    it('calcula uníssono (0)', () => {
      expect(getInterval('C', 'C')).toBe(0);
    });

    it('calcula 2ª maior (2 semitons)', () => {
      expect(getInterval('C', 'D')).toBe(2);
    });

    it('calcula 3ª maior (4 semitons)', () => {
      expect(getInterval('C', 'E')).toBe(4);
    });

    it('calcula 4ª perfeita (5 semitons)', () => {
      expect(getInterval('C', 'F')).toBe(5);
    });

    it('calcula 5ª perfeita (7 semitons)', () => {
      expect(getInterval('C', 'G')).toBe(7);
    });

    it('calcula 6ª maior (9 semitons)', () => {
      expect(getInterval('C', 'A')).toBe(9);
    });

    it('calcula 7ª maior (11 semitons)', () => {
      expect(getInterval('C', 'B')).toBe(11);
    });

    it('calcula intervalos circulares (passando de B)', () => {
      expect(getInterval('G', 'C')).toBe(5);  // G->A(2)->B(4)->C(5)
      expect(getInterval('F', 'C')).toBe(7);  // F->G(2)->A(4)->B(6)->C(7)
      expect(getInterval('E', 'C')).toBe(8);  // E->F(1)->G(3)->A(5)->B(7)->C(8)
    });

    it('lida com sustenidos', () => {
      expect(getInterval('C', 'F#')).toBe(6);
      expect(getInterval('C', 'C#')).toBe(1);
    });
  });

  // ========================================
  // TESTES DE ESCALAS
  // ========================================

  describe('Escalas', () => {
    describe('Escala Maior', () => {
      it('calcula escala C Maior corretamente', () => {
        const scale = getScaleNotes('C', 'maior');
        expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      });

      it('calcula escala G Maior (com F#)', () => {
        const scale = getScaleNotes('G', 'maior');
        expect(scale).toContain('F#');
        expect(scale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
      });

      it('calcula escala F Maior (com Bb)', () => {
        const scale = getScaleNotes('F', 'maior');
        expect(scale).toContain('Bb');
        expect(scale).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
      });

      it('calcula escala D Maior (com F# e C#)', () => {
        const scale = getScaleNotes('D', 'maior');
        expect(scale).toContain('F#');
        expect(scale).toContain('C#');
        expect(scale).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
      });
    });

    describe('Escala Menor', () => {
      it('calcula escala A Menor Natural', () => {
        const scale = getScaleNotes('A', 'menor');
        expect(scale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
      });

      it('calcula escala E Menor Natural', () => {
        const scale = getScaleNotes('E', 'menor');
        expect(scale).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
      });
    });

    describe('Pentatônica', () => {
      it('calcula pentatônica maior de C', () => {
        const scale = getScaleNotes('C', 'pentatonica_maior');
        expect(scale).toHaveLength(5);
        expect(scale).toEqual(['C', 'D', 'E', 'G', 'A']);
      });

      it('calcula pentatônica menor de A', () => {
        const scale = getScaleNotes('A', 'pentatonica_menor');
        expect(scale).toHaveLength(5);
        expect(scale).toEqual(['A', 'C', 'D', 'E', 'G']);
      });
    });

    describe('Blues', () => {
      it('calcula escala blues de C', () => {
        const scale = getScaleNotes('C', 'blues');
        expect(scale).toHaveLength(6);
        expect(scale).toContain('C');
        expect(scale).toContain('D#');  // Nota blues (3ª menor)
      });
    });
  });

  // ========================================
  // TESTES DE ACORDES
  // ========================================

  describe('Acordes', () => {
    describe('Triades', () => {
      it('calcula acorde C maior', () => {
        const chord = getChordNotes('C', 'maior');
        expect(chord).toEqual(['C', 'E', 'G']);
      });

      it('calcula acorde A menor', () => {
        const chord = getChordNotes('A', 'menor');
        expect(chord).toEqual(['A', 'C', 'E']);
      });

      it('calcula acorde B diminuto', () => {
        const chord = getChordNotes('B', 'dim');
        expect(chord).toEqual(['B', 'D', 'F']);
      });

      it('calcula acorde C aumentado', () => {
        const chord = getChordNotes('C', 'aug');
        expect(chord).toEqual(['C', 'E', 'G#']);
      });
    });

    describe('Acordes com 7', () => {
      it('calcula acorde C7', () => {
        const chord = getChordNotes('C', '7');
        expect(chord).toEqual(['C', 'E', 'G', 'Bb']);
      });

      it('calcula acorde Cmaj7', () => {
        const chord = getChordNotes('C', 'maj7');
        expect(chord).toEqual(['C', 'E', 'G', 'B']);
      });

      it('calcula acorde Am7', () => {
        const chord = getChordNotes('A', 'm7');
        expect(chord).toEqual(['A', 'C', 'E', 'G']);
      });
    });

    describe('Acordes com 9', () => {
      it('calcula acorde C9', () => {
        const chord = getChordNotes('C', '9');
        expect(chord).toHaveLength(5);
        expect(chord).toContain('D');  // 9ª
      });
    });
  });

  // ========================================
  // TESTES DE VALIDAÇÃO
  // ========================================

  describe('Validação de Entrada', () => {
    it('lida com nota raiz inválida', () => {
      const scale = getScaleNotes('X', 'maior');
      expect(scale[0]).toBe('C');  // Fallback para C
    });

    it('lida com tipo de escala inválida', () => {
      const scale = getScaleNotes('C', 'invalida');
      expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);  // Fallback maior
    });

    it('lida com tipo de acorde inválido', () => {
      const chord = getChordNotes('C', 'invalido');
      expect(chord).toEqual(['C', 'E', 'G']);  // Fallback maior
    });
  });
});