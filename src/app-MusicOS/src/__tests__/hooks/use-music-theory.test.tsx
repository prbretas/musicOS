/**
 * Testes para os hooks React de teoria musical
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useMusicTheory,
  useScaleExplorer,
  useChordBuilder,
  useIntervalTrainer,
  useMusicTheoryHealth
} from '../../lib/music-theory/hooks';

// Mock da engine
vi.mock('../../lib/music-theory', () => ({
  MusicTheoryEngine: vi.fn().mockImplementation(() => ({
    createScale: vi.fn().mockReturnValue({
      rootNote: 'C',
      type: 'major',
      name: 'C Major',
      notes: [
        { name: 'C', octave: 4, frequency: 261.63 },
        { name: 'D', octave: 4, frequency: 293.66 },
        { name: 'E', octave: 4, frequency: 329.63 },
        { name: 'F', octave: 4, frequency: 349.23 },
        { name: 'G', octave: 4, frequency: 392.00 },
        { name: 'A', octave: 4, frequency: 440.00 },
        { name: 'B', octave: 4, frequency: 493.88 }
      ],
      intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
      formula: 'W-W-H-W-W-W-H',
      description: 'Escala maior'
    }),
    createChord: vi.fn().mockReturnValue({
      rootNote: 'C',
      type: 'major',
      name: 'C Major',
      notes: [
        { name: 'C', octave: 4, frequency: 261.63 },
        { name: 'E', octave: 4, frequency: 329.63 },
        { name: 'G', octave: 4, frequency: 392.00 }
      ],
      intervals: ['P1', 'M3', 'P5'],
      formula: '1-3-5',
      description: 'Acorde maior'
    }),
    isFreeTierNote: vi.fn().mockImplementation((note: string) => 
      ['C', 'G', 'F', 'A', 'E'].includes(note)
    ),
    transposeNote: vi.fn().mockReturnValue('D'),
    getRandomNote: vi.fn().mockReturnValue('C'),
    getRandomScaleType: vi.fn().mockReturnValue('major'),
    getRandomChordType: vi.fn().mockReturnValue('major'),
    getHarmonicField: vi.fn().mockReturnValue([]),
    getRelatedScales: vi.fn().mockReturnValue([]),
    getScaleModes: vi.fn().mockReturnValue([]),
    getSimilarScales: vi.fn().mockReturnValue([]),
    getChordInversions: vi.fn().mockReturnValue([]),
    getChordExtensions: vi.fn().mockReturnValue([]),
    getChordVoicings: vi.fn().mockReturnValue([])
  })),
  checkEngineHealth: vi.fn().mockReturnValue({
    healthy: true,
    modules: {
      notes: true,
      intervals: true,
      scales: true,
      chords: true,
      types: true,
      utils: true
    },
    errors: []
  })
}));

describe('Hooks React - useMusicTheory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useMusicTheory', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      expect(result.current.rootNote).toBe('C');
      expect(result.current.scaleType).toBe('major');
      expect(result.current.chordType).toBe('major');
      expect(result.current.errors).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
    });

    it('deve aceitar configuração personalizada', () => {
      const { result } = renderHook(() => useMusicTheory({
        language: 'en',
        notation: 'flat',
        freeTierOnly: true,
        initialRoot: 'G',
        initialScaleType: 'minor',
        initialChordType: 'minor'
      }));
      
      expect(result.current.config.language).toBe('en');
      expect(result.current.config.notation).toBe('flat');
      expect(result.current.config.freeTierOnly).toBe(true);
      expect(result.current.rootNote).toBe('G');
      expect(result.current.scaleType).toBe('minor');
      expect(result.current.chordType).toBe('minor');
    });

    it('deve mudar a nota raiz', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      act(() => {
        result.current.setRootNote('G');
      });
      
      expect(result.current.rootNote).toBe('G');
    });

    it('deve mudar o tipo de escala', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      act(() => {
        result.current.setScaleType('minor');
      });
      
      expect(result.current.scaleType).toBe('minor');
    });

    it('deve mudar o tipo de acorde', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      act(() => {
        result.current.setChordType('minor');
      });
      
      expect(result.current.chordType).toBe('minor');
    });

    it('deve transpor', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      act(() => {
        result.current.transpose(2);
      });
      
      expect(result.current.rootNote).toBe('D');
    });

    it('deve gerar escala aleatória', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      act(() => {
        result.current.randomScale();
      });
      
      expect(result.current.rootNote).toBe('C');
      expect(result.current.scaleType).toBe('major');
    });

    it('deve gerar acorde aleatório', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      act(() => {
        result.current.randomChord();
      });
      
      expect(result.current.rootNote).toBe('C');
      expect(result.current.chordType).toBe('major');
    });

    it('deve calcular campo harmônico', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      const field = result.current.calculateHarmonicField();
      expect(field).toEqual([]);
    });

    it('deve verificar nota do tier gratuito', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      expect(result.current.isFreeTierNote('C')).toBe(true);
      expect(result.current.isFreeTierNote('D')).toBe(false);
    });

    it('deve limpar erros', () => {
      const { result } = renderHook(() => useMusicTheory());
      
      // Simular erro
      act(() => {
        result.current.setRootNote('X' as any);
      });
      
      act(() => {
        result.current.clearErrors();
      });
      
      expect(result.current.errors).toHaveLength(0);
    });

    it('deve resetar para configuração inicial', () => {
      const { result } = renderHook(() => useMusicTheory({
        initialRoot: 'G',
        initialScaleType: 'minor'
      }));
      
      // Mudar valores
      act(() => {
        result.current.setRootNote('A');
        result.current.setScaleType('blues');
      });
      
      // Resetar
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.rootNote).toBe('G');
      expect(result.current.scaleType).toBe('minor');
    });

    it('deve bloquear nota não free tier quando freeTierOnly=true', () => {
      const { result } = renderHook(() => useMusicTheory({
        freeTierOnly: true
      }));
      
      act(() => {
        result.current.setRootNote('D');
      });
      
      expect(result.current.errors).toContain('Nota não disponível no tier gratuito. Use: C, G, F, A, E');
      expect(result.current.rootNote).toBe('C'); // Não muda
    });
  });

  describe('useScaleExplorer', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useScaleExplorer());
      
      expect(result.current.rootNote).toBe('C');
      expect(result.current.scaleType).toBe('major');
      expect(result.current.currentScale).toBeDefined();
    });

    it('deve aceitar valores iniciais', () => {
      const { result } = renderHook(() => useScaleExplorer('G', 'minor'));
      
      expect(result.current.rootNote).toBe('G');
      expect(result.current.scaleType).toBe('minor');
    });

    it('deve retornar informações da escala', () => {
      const { result } = renderHook(() => useScaleExplorer());
      
      expect(result.current.scaleInfo).toBeDefined();
      expect(result.current.scaleInfo?.name).toBe('C Major');
      expect(result.current.scaleInfo?.notes).toHaveLength(7);
    });

    it('deve retornar modos da escala', () => {
      const { result } = renderHook(() => useScaleExplorer());
      
      const modes = result.current.getScaleModes();
      expect(modes).toEqual([]);
    });

    it('deve retornar escalas similares', () => {
      const { result } = renderHook(() => useScaleExplorer());
      
      const similar = result.current.getSimilarScales();
      expect(similar).toEqual([]);
    });
  });

  describe('useChordBuilder', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useChordBuilder());
      
      expect(result.current.rootNote).toBe('C');
      expect(result.current.chordType).toBe('major');
      expect(result.current.currentChord).toBeDefined();
    });

    it('deve aceitar valores iniciais', () => {
      const { result } = renderHook(() => useChordBuilder('G', 'minor'));
      
      expect(result.current.rootNote).toBe('G');
      expect(result.current.chordType).toBe('minor');
    });

    it('deve retornar informações do acorde', () => {
      const { result } = renderHook(() => useChordBuilder());
      
      expect(result.current.chordInfo).toBeDefined();
      expect(result.current.chordInfo?.name).toBe('C Major');
      expect(result.current.chordInfo?.notes).toHaveLength(3);
    });

    it('deve retornar extensões do acorde', () => {
      const { result } = renderHook(() => useChordBuilder());
      
      const extensions = result.current.getChordExtensions();
      expect(extensions).toEqual([]);
    });

    it('deve retornar voicings do acorde', () => {
      const { result } = renderHook(() => useChordBuilder());
      
      const voicings = result.current.getChordVoicings();
      expect(voicings).toEqual([]);
    });
  });

  describe('useIntervalTrainer', () => {
    it('deve inicializar com estado vazio', () => {
      const { result } = renderHook(() => useIntervalTrainer());
      
      expect(result.current.currentInterval).toBeNull();
      expect(result.current.score.correct).toBe(0);
      expect(result.current.score.total).toBe(0);
      expect(result.current.history).toHaveLength(0);
    });

    it('deve gerar intervalo aleatório', () => {
      const { result } = renderHook(() => useIntervalTrainer());
      
      act(() => {
        const interval = result.current.generateRandomInterval();
        expect(interval).toBeDefined();
      });
    });

    it('deve verificar palpite correto', () => {
      const { result } = renderHook(() => useIntervalTrainer());
      
      // Primeiro gerar um intervalo
      act(() => {
        result.current.generateRandomInterval();
      });
      
      // Mock do intervalo atual
      const mockInterval = {
        name: 'M3',
        semitones: 4,
        description: 'Terça maior'
      };
      
      // Substituir currentInterval
      (result.current as any).currentInterval = mockInterval;
      
      act(() => {
        const isCorrect = result.current.checkGuess('M3');
        expect(isCorrect).toBe(true);
      });
      
      expect(result.current.score.correct).toBe(1);
      expect(result.current.score.total).toBe(1);
      expect(result.current.history).toHaveLength(1);
    });

    it('deve verificar palpite incorreto', () => {
      const { result } = renderHook(() => useIntervalTrainer());
      
      // Primeiro gerar um intervalo
      act(() => {
        result.current.generateRandomInterval();
      });
      
      // Mock do intervalo atual
      const mockInterval = {
        name: 'M3',
        semitones: 4,
        description: 'Terça maior'
      };
      
      // Substituir currentInterval
      (result.current as any).currentInterval = mockInterval;
      
      act(() => {
        const isCorrect = result.current.checkGuess('P5');
        expect(isCorrect).toBe(false);
      });
      
      expect(result.current.score.correct).toBe(0);
      expect(result.current.score.total).toBe(1);
    });

    it('deve resetar treinamento', () => {
      const { result } = renderHook(() => useIntervalTrainer());
      
      // Adicionar algum histórico
      act(() => {
        result.current.generateRandomInterval();
        result.current.checkGuess('M3');
      });
      
      // Resetar
      act(() => {
        result.current.resetTraining();
      });
      
      expect(result.current.score.correct).toBe(0);
      expect(result.current.score.total).toBe(0);
      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('useMusicTheoryHealth', () => {
    it('deve verificar saúde da engine', async () => {
      const { result } = renderHook(() => useMusicTheoryHealth());
      
      await waitFor(() => {
        expect(result.current.health.healthy).toBe(true);
        expect(result.current.isChecking).toBe(false);
      });
    });

    it('deve permitir verificação manual', async () => {
      const { result } = renderHook(() => useMusicTheoryHealth());
      
      await act(async () => {
        const health = await result.current.checkHealth();
        expect(health.healthy).toBe(true);
      });
      
      expect(result.current.isChecking).toBe(false);
    });
  });
});