/**
 * ChordDiagram.test.tsx — Testes Unitários
 * 
 * Testa o componente ChordDiagram:
 * - Renderização do diagrama
 * - Notas do acorde
 * - Digitações
 * - Diferentes tamanhos
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ChordDiagram } from '@/components/ChordDiagram';

describe('ChordDiagram', () => {
  // ============================================
  // MOCK DATA
  // ============================================

  const mockChordC = {
    name: 'C',
    root: 'C',
    notes: ['C', 'E', 'G'],
    positions: [-1, 3, 2, 0, 1, 0],  // C: E-A-D-G-B-E
    fingering: [null, 2, 1, 0, 0, null] as (number | null)[],
  };

  const mockChordAm = {
    name: 'Am',
    root: 'A',
    notes: ['A', 'C', 'E'],
    positions: [-1, -1, 2, 2, 1, 0] as number[],
    fingering: [null, null, 2, 1, 0, null] as (number | null)[],
  };

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================

  describe('Renderização', () => {
    it('renderiza o nome do acorde', () => {
      render(<ChordDiagram chord={mockChordC} />);
      
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('renderiza como guitarra por padrão', () => {
      render(<ChordDiagram chord={mockChordC} />);
      
      // 6 posições para guitarra
      expect(screen.getAllByText(/\d|○|✕/).length).toBeGreaterThanOrEqual(5);
    });

    it('renderiza ukulele com 4 cordas', () => {
      const ukuleleChord = {
        ...mockChordC,
        positions: [-1, 3, 2, 0],
      };
      
      render(
        <ChordDiagram 
          chord={ukuleleChord}
          instrument="ukulele"
        />
      );
      
      // Menos elementos para ukulele
      const elements = screen.getAllByText(/\d|○|✕/);
      expect(elements.length).toBeLessThan(6);
    });
  });

  // ============================================
  // TESTES DE NOTAS E POSIÇÕES
  // ============================================

  describe('Notas e Posições', () => {
    it('mostra círculo para cordas abertas', () => {
      render(<ChordDiagram chord={mockChordC} />);
      
      // Corda solta = ○
      expect(screen.getByText('○')).toBeInTheDocument();
    });

    it('mostra números das casas', () => {
      render(<ChordDiagram chord={mockChordC} />);
      
      // Verifica números específicos do acorde C
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('mostra todas as notas do acorde', () => {
      render(<ChordDiagram chord={mockChordC} />);
      
      // C maior: C, E, G
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
    });

    it('destaca a nota root com cor diferente', () => {
      render(<ChordDiagram chord={mockChordC} />);
      
      // C (root) deve ter classe de destaque
      const cElement = screen.getAllByText('C')[0]?.closest('div');
      expect(cElement).toHaveClass('bg-red-500');
    });
  });

  // ============================================
  // TESTES DE DIGITAÇÃO
  // ============================================

  describe('Digitação', () => {
    it('mostra indicador de digitação quando showFingering é true', () => {
      render(<ChordDiagram chord={mockChordC} showFingering />);
      
      // Deve mostrar 1, 2 para os dedos
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('não mostra digitação quando showFingering é false', () => {
      render(<ChordDiagram chord={mockChordC} showFingering={false} />);
      
      // Verifica que número de elementos é menor
      const elements = screen.getAllByText(/\d/);
      expect(elements.length).toBeLessThanOrEqual(4);
    });

    it('mostra legenda de digitação', () => {
      render(<ChordDiagram chord={mockChordC} showFingering />);
      
      // Legenda: 1=indicador, 2=médio, etc.
      expect(screen.getByText('E:')).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE INTERAÇÃO
  // ============================================

  describe('Interação', () => {
    it('chama onFretClick ao clicar em uma casa', () => {
      const handleFretClick = vi.fn();
      
      render(
        <ChordDiagram 
          chord={mockChordC}
          onFretClick={handleFretClick}
        />
      );
      
      const fretButton = screen.getByText('3');
      fireEvent.click(fretButton);
      
      expect(handleFretClick).toHaveBeenCalled();
    });
  });

  // ============================================
  // TESTES DE TAMANHO
  // ============================================

  describe('Tamanhos', () => {
    it('renderiza em tamanho small', () => {
      const { container } = render(
        <ChordDiagram chord={mockChordC} size="sm" />
      );
      
      // w-32 para small
      expect(container.querySelector('.w-32')).toBeInTheDocument();
    });

    it('renderiza em tamanho medium (padrão)', () => {
      const { container } = render(
        <ChordDiagram chord={mockChordC} size="md" />
      );
      
      // w-48 para medium
      expect(container.querySelector('.w-48')).toBeInTheDocument();
    });

    it('renderiza em tamanho large', () => {
      const { container } = render(
        <ChordDiagram chord={mockChordC} size="lg" />
      );
      
      // w-64 para large
      expect(container.querySelector('.w-64')).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE ACORDES ESPECÍFICOS
  // ============================================

  describe('Acordes Específicos', () => {
    it('renderiza acorde Lá menor (Am)', () => {
      render(<ChordDiagram chord={mockChordAm} />);
      
      expect(screen.getByText('Am')).toBeInTheDocument();
    });

    it('mostra notas corretas do Am', () => {
      render(<ChordDiagram chord={mockChordAm} />);
      
      // A menor: A, C, E
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
    });
  });
});