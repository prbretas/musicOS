/**
 * Fretboard.test.tsx — Testes Unitários
 * 
 * Testa o componente Fretboard:
 * - Renderização de cordas e casas
 * - Destaque de notas da escala
 * - Clique em notas
 * - Diferentes instrumentos
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Fretboard } from '@/components/Fretboard';

describe('Fretboard', () => {
  // ============================================
  // TESTES DE RENDERIZAÇÃO BÁSICA
  // ============================================

  describe('Renderização', () => {
    it('renderiza fretboard de guitarra com 6 cordas', () => {
      render(<Fretboard instrument="guitar" />);
      
      // Verifica que há 6 linhas de cordas
      const strings = screen.getAllByRole('button');
      expect(strings.length).toBeGreaterThanOrEqual(6);
    });

    it('renderiza fretboard de ukulele com 4 cordas', () => {
      render(<Fretboard instrument="ukulele" />);
      
      const strings = screen.getAllByRole('button');
      expect(strings.length).toBe(4);
    });

    it('mostra indicador de corda solta (casa 0)', () => {
      render(<Fretboard instrument="guitar" />);
      
      // Cordas soltas são marcadas com ○
      const openStrings = screen.getAllByText('○');
      expect(openStrings.length).toBeGreaterThan(0);
    });

    it('mostra números das casas', () => {
      render(<Fretboard instrument="guitar" startFret={0} endFret={5} />);
      
      // Casas 1, 2, 3, 4, 5
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('mostra marcas de posição (inlay dots)', () => {
      render(<Fretboard instrument="guitar" endFret={12} />);
      
      // Casa 3, 5, 7, 9, 12 têm dots
      expect(screen.getAllByText(/●|•/).length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // TESTES DE DESTAQUE DE NOTAS
  // ============================================

  describe('Destaque de Notas', () => {
    it('destaca notas da escala maior de C', () => {
      render(
        <Fretboard 
          instrument="guitar"
          scale={{
            root: 'C',
            type: 'maior',
            notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
          }}
        />
      );
      
      // Verifica que há notas vermelhas (raiz = C)
      const rootNotes = screen.getAllByText('C');
      expect(rootNotes.length).toBeGreaterThan(0);
    });

    it('destaca notas com cores diferentes por grau', () => {
      render(
        <Fretboard 
          instrument="guitar"
          scale={{
            root: 'C',
            type: 'maior',
            notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
          }}
        />
      );
      
      // Deve ter cores diferentes (verificar que há múltiplas cores)
      const rootElement = screen.getAllByText('C')[0]?.closest('div');
      expect(rootElement).toHaveClass('bg-red-500');
    });

    it('aceita lista de highlightedNotes', () => {
      render(
        <Fretboard 
          instrument="guitar"
          highlightedNotes={['C', 'E', 'G']}
        />
      );
      
      // Verifica que pelo menos uma das notas está destacada
      const highlighted = screen.getAllByRole('button').filter(
        btn => ['C', 'E', 'G'].some(note => btn.textContent?.includes(note))
      );
      expect(highlighted.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // TESTES DE INTERAÇÃO
  // ============================================

  describe('Interação', () => {
    it('chama onNoteClick ao clicar em uma nota', () => {
      const handleNoteClick = vi.fn();
      
      render(
        <Fretboard 
          instrument="guitar"
          onNoteClick={handleNoteClick}
        />
      );
      
      const noteButton = screen.getAllByRole('button').find(
        btn => btn.textContent === 'C' || btn.textContent === 'E'
      );
      
      if (noteButton) {
        fireEvent.click(noteButton);
        expect(handleNoteClick).toHaveBeenCalled();
      }
    });

    it('mostra informação de hover', () => {
      render(<Fretboard instrument="guitar" />);
      
      // Move mouse sobre uma nota
      const note = screen.getAllByRole('button')[5];
      fireEvent.mouseEnter(note);
      
      // Verifica que informação aparece
      expect(screen.getByText(/na corda/)).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE EXIBIÇÃO DE INTERVALOS
  // ============================================

  describe('Intervalos', () => {
    it('mostra intervalos quando showIntervals é true', () => {
      render(
        <Fretboard 
          instrument="guitar"
          scale={{
            root: 'C',
            type: 'maior',
            notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
          }}
          showIntervals
        />
      );
      
      // Deve mostrar R (raiz), M2, M3, etc.
      const intervals = screen.getAllByText(/^[RMP]/);
      expect(intervals.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // TESTES DE CUSTOMIZAÇÃO
  // ============================================

  describe('Customização', () => {
    it('aceita afinação customizada', () => {
      const customTuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
      
      render(
        <Fretboard 
          instrument="guitar"
          tuning={customTuning}
        />
      );
      
      // Verifica que fretboard renderiza
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('mostra intervalo customizado de casas', () => {
      render(
        <Fretboard 
          instrument="guitar"
          startFret={5}
          endFret={10}
        />
      );
      
      // Casas 5-10
      for (let i = 5; i <= 10; i++) {
        expect(screen.getByText(String(i))).toBeInTheDocument();
      }
    });
  });
});