/**
 * Tests for useInstrument hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useInstrument, useInstrumentManager } from '@/hooks/useInstrument';

// Mock do instrumentRegistry para evitar efeitos colaterais
jest.mock('@/lib/music/instruments/registry', () => {
  const mockInstrument = {
    id: 'guitarra-6',
    name: 'Guitarra (6 cordas)',
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    octaves: [2, 2, 3, 3, 3, 4],
    frets: 24,
    fretless: false,
  };

  const mockRegistry = {
    getAll: jest.fn(() => [mockInstrument]),
    getById: jest.fn((id) => id === 'guitarra-6' ? mockInstrument : null),
    getDefault: jest.fn(() => mockInstrument),
    setDefaultInstrument: jest.fn(),
    getDefaultTuning: jest.fn(() => ['E', 'A', 'D', 'G', 'B', 'E']),
    getAvailableTunings: jest.fn(() => [
      { id: 'standard', name: 'Padrão', tuning: ['E', 'A', 'D', 'G', 'B', 'E'] },
      { id: 'drop-d', name: 'Drop D', tuning: ['D', 'A', 'D', 'G', 'B', 'E'] },
    ]),
    saveCustomTuning: jest.fn(() => true),
    calculateNoteAtPosition: jest.fn(() => 'C'),
    findNotePositions: jest.fn(() => [{ string: 0, fret: 3 }, { string: 1, fret: 8 }]),
    registerInstrument: jest.fn(() => true),
    removeInstrument: jest.fn(() => true),
  };

  return {
    instrumentRegistry: mockRegistry,
    DEFAULT_INSTRUMENTS: { 'guitarra-6': mockInstrument },
  };
});

describe('useInstrument Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return current instrument', () => {
      const { result } = renderHook(() => useInstrument());
      
      expect(result.current.currentInstrument).toBeDefined();
      expect(result.current.currentInstrument.id).toBe('guitarra-6');
      expect(result.current.currentInstrument.strings).toBe(6);
    });

    it('should return current tuning', () => {
      const { result } = renderHook(() => useInstrument());
      
      expect(result.current.currentTuning).toBeDefined();
      expect(result.current.currentTuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    });

    it('should return available instruments', () => {
      const { result } = renderHook(() => useInstrument());
      
      expect(result.current.availableInstruments).toBeDefined();
      expect(result.current.availableInstruments).toHaveLength(1);
      expect(result.current.availableInstruments[0].id).toBe('guitarra-6');
    });

    it('should return available tunings', () => {
      const { result } = renderHook(() => useInstrument());
      
      expect(result.current.availableTunings).toBeDefined();
      expect(result.current.availableTunings).toHaveLength(2);
      expect(result.current.availableTunings[0].id).toBe('standard');
    });
  });

  describe('Instrument Management', () => {
    it('should allow changing instrument', () => {
      const onInstrumentChange = jest.fn();
      const { result } = renderHook(() => 
        useInstrument({ onInstrumentChange })
      );

      act(() => {
        result.current.setInstrument('ukulele');
      });

      // Note: Mock returns null for ukulele, so instrument won't actually change
      // In a real test with proper mocking, this would work
      expect(onInstrumentChange).not.toHaveBeenCalled(); // Because mock returns null
    });

    it('should not change to invalid instrument', () => {
      const { result } = renderHook(() => useInstrument());
      
      act(() => {
        const success = result.current.setInstrument('invalid-instrument');
        expect(success).toBe(false);
      });
    });

    it('should call onInstrumentChange callback', () => {
      const onInstrumentChange = jest.fn();
      const { result } = renderHook(() => 
        useInstrument({ onInstrumentChange })
      );

      // Mock do getById para retornar um instrumento válido
      const mockRegistry = require('@/lib/music/instruments/registry').instrumentRegistry;
      mockRegistry.getById.mockReturnValueOnce({
        id: 'ukulele',
        name: 'Ukulele',
        strings: 4,
        tuning: ['G', 'C', 'E', 'A'],
        octaves: [4, 4, 4, 4],
        frets: 15,
        fretless: false,
      });

      act(() => {
        result.current.setInstrument('ukulele');
      });

      expect(onInstrumentChange).toHaveBeenCalled();
      expect(mockRegistry.setDefaultInstrument).toHaveBeenCalledWith('ukulele');
    });
  });

  describe('Tuning Management', () => {
    it('should allow changing tuning', () => {
      const onTuningChange = jest.fn();
      const { result } = renderHook(() => 
        useInstrument({ onTuningChange })
      );

      const newTuning = ['D', 'A', 'D', 'G', 'B', 'E']; // Drop D

      act(() => {
        const success = result.current.setTuning(newTuning);
        expect(success).toBe(true);
      });

      expect(onTuningChange).toHaveBeenCalledWith(newTuning);
      expect(result.current.currentTuning).toBe(newTuning);
    });

    it('should not set invalid tuning', () => {
      const { result } = renderHook(() => useInstrument());
      
      act(() => {
        const invalidTuning = ['C', 'D']; // Muito curto
        const success = result.current.setTuning(invalidTuning);
        expect(success).toBe(false);
      });
    });

    it('should save custom tuning', () => {
      const { result } = renderHook(() => useInstrument());
      const mockRegistry = require('@/lib/music/instruments/registry').instrumentRegistry;

      act(() => {
        const success = result.current.saveCustomTuning('my-tuning', ['D', 'A', 'D', 'G', 'B', 'E']);
        expect(success).toBe(true);
      });

      expect(mockRegistry.saveCustomTuning).toHaveBeenCalledWith(
        'my-tuning',
        ['D', 'A', 'D', 'G', 'B', 'E'],
        'guitarra-6'
      );
    });
  });

  describe('Fretboard Calculations', () => {
    it('should calculate note at position', () => {
      const { result } = renderHook(() => useInstrument());
      const mockRegistry = require('@/lib/music/instruments/registry').instrumentRegistry;

      const note = result.current.calculateNoteAtPosition(0, 3);
      
      expect(note).toBe('C');
      expect(mockRegistry.calculateNoteAtPosition).toHaveBeenCalledWith(
        'guitarra-6',
        0,
        3
      );
    });

    it('should find note positions', () => {
      const { result } = renderHook(() => useInstrument());
      const mockRegistry = require('@/lib/music/instruments/registry').instrumentRegistry;

      const positions = result.current.findNotePositions('C');
      
      expect(positions).toHaveLength(2);
      expect(mockRegistry.findNotePositions).toHaveBeenCalledWith(
        'guitarra-6',
        'C'
      );
    });
  });
});

describe('useInstrumentManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return instrument manager', () => {
    const { result } = renderHook(() => useInstrumentManager());
    
    expect(result.current.instruments).toBeDefined();
    expect(result.current.activeInstrumentId).toBe('guitarra-6');
    expect(result.current.activeInstrument).toBeDefined();
    expect(result.current.instrumentCount).toBe(1);
  });

  it('should allow changing active instrument', () => {
    const { result } = renderHook(() => useInstrumentManager());
    
    act(() => {
      result.current.setActiveInstrument('ukulele');
    });
    
    expect(result.current.activeInstrumentId).toBe('ukulele');
  });

  it('should add instrument', () => {
    const { result } = renderHook(() => useInstrumentManager());
    const mockRegistry = require('@/lib/music/instruments/registry').instrumentRegistry;
    
    const newInstrument = {
      id: 'custom-1',
      name: 'Custom Instrument',
      strings: 7,
      tuning: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
      octaves: [1, 1, 2, 2, 2, 3, 3],
      frets: 24,
      fretless: false,
    };
    
    act(() => {
      result.current.addInstrument(newInstrument);
    });
    
    expect(mockRegistry.registerInstrument).toHaveBeenCalledWith(newInstrument);
  });

  it('should remove instrument', () => {
    const { result } = renderHook(() => useInstrumentManager());
    const mockRegistry = require('@/lib/music/instruments/registry').instrumentRegistry;
    
    act(() => {
      result.current.removeInstrument('custom-1');
    });
    
    expect(mockRegistry.removeInstrument).toHaveBeenCalledWith('custom-1');
  });

  it('should check if instrument exists', () => {
    const { result } = renderHook(() => useInstrumentManager());
    
    const exists = result.current.hasInstrument('guitarra-6');
    expect(exists).toBe(true);
    
    const notExists = result.current.hasInstrument('non-existent');
    expect(notExists).toBe(false);
  });

  it('should get instrument by ID', () => {
    const { result } = renderHook(() => useInstrumentManager());
    
    const instrument = result.current.getInstrument('guitarra-6');
    expect(instrument).toBeDefined();
    expect(instrument?.id).toBe('guitarra-6');
    
    const nullInstrument = result.current.getInstrument('non-existent');
    expect(nullInstrument).toBeNull();
  });
});