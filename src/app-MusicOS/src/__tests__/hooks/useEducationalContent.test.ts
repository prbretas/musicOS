/**
 * useEducationalContent.test.ts — Testes Unitários
 * 
 * Testa o hook useEducationalContent:
 * - Retorno de conteúdo válido
 * - Retorno null para conteúdo inexistente
 */

import { renderHook } from '@testing-library/react';
import { useEducationalContent } from '@/components/ui/InfoButton';

describe('useEducationalContent', () => {
  // ============================================
  // TESTES DE CONTEÚDO
  // ============================================

  describe('Retorno de Conteúdo', () => {
    it('retorna null para conteúdo inexistente', () => {
      const { result } = renderHook(() => 
        useEducationalContent('conteudo-inexistente')
      );
      
      expect(result.current).toBeNull();
    });

    it('retorna conteúdo para ID "circle-of-fifths"', () => {
      const { result } = renderHook(() => 
        useEducationalContent('circle-of-fifths')
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current!.title).toBe('O Ciclo de Quintas');
      expect(result.current!.content).toContain('Ciclo de Quintas');
    });

    it('retorna conteúdo para ID "scales"', () => {
      const { result } = renderHook(() => 
        useEducationalContent('scales')
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current!.title).toBe('Entendendo Escalas');
    });

    it('retorna conteúdo para ID "chord-field"', () => {
      const { result } = renderHook(() => 
        useEducationalContent('chord-field')
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current!.title).toBe('O Campo Harmônico');
    });

    it('retorna conteúdo para ID "metronome"', () => {
      const { result } = renderHook(() => 
        useEducationalContent('metronome')
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current!.title).toBe('Usando o Metrônomo');
    });

    it('retorna conteúdo para ID "fretboard"', () => {
      const { result } = renderHook(() => 
        useEducationalContent('fretboard')
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current!.title).toBe('Navegando o Fretboard');
    });
  });

  // ============================================
  // TESTES DE ESTRUTURA
  // ============================================

  describe('Estrutura do Retorno', () => {
    it('retorna objeto com title e content', () => {
      const { result } = renderHook(() => 
        useEducationalContent('circle-of-fifths')
      );
      
      expect(result.current).toHaveProperty('title');
      expect(result.current).toHaveProperty('content');
      expect(typeof result.current!.title).toBe('string');
      expect(typeof result.current!.content).toBe('string');
    });

    it('conteúdo tem múltiplas seções', () => {
      const { result } = renderHook(() => 
        useEducationalContent('circle-of-fifths')
      );
      
      // Deve ter título, explicação, exemplos, dicas
      expect(result.current!.content.length).toBeGreaterThan(100);
    });
  });
});