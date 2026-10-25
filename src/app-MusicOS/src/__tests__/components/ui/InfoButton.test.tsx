/**
 * InfoButton.test.tsx — Testes Unitários
 * 
 * Testa o componente InfoButton:
 * - Renderização
 * - Abertura/fechamento de popup
 * - Conteúdo renderizado
 * - Diferentes tamanhos e posições
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { InfoButton } from '@/components/ui/InfoButton';

describe('InfoButton', () => {
  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================

  describe('Renderização', () => {
    it('renderiza o botão de informação', () => {
      render(<InfoButton content="Conteúdo de teste" />);
      
      const button = screen.getByRole('button', { name: /mais informações/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-100');
    });

    it('renderiza com tamanho small (padrão)', () => {
      const { container } = render(<InfoButton content="Teste" />);
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('w-5', 'h-5');
    });

    it('renderiza com tamanho medium', () => {
      render(<InfoButton content="Teste" size="md" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-6', 'h-6');
    });

    it('renderiza com tamanho large', () => {
      render(<InfoButton content="Teste" size="lg" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-7', 'h-7');
    });
  });

  // ============================================
  // TESTES DE FUNCIONALIDADE
  // ============================================

  describe('Funcionalidade', () => {
    it('abre o popup quando clicado', () => {
      render(
        <InfoButton 
          content="Conteúdo de teste" 
          title="Título Teste"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Título Teste')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument();
    });

    it('fecha o popup ao clicar no botão X', () => {
      render(<InfoButton content="Conteúdo" title="Título" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);
      
      expect(screen.queryByText('Título')).not.toBeInTheDocument();
      expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
    });

    it('fecha o popup ao clicar fora', () => {
      render(<InfoButton content="Conteúdo" title="Título" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Clica fora do componente
      fireEvent.mouseDown(document.body);
      
      expect(screen.queryByText('Título')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE CONTEÚDO
  // ============================================

  describe('Conteúdo', () => {
    it('renderiza conteúdo string com múltiplas linhas', () => {
      const multiLineContent = `Linha 1
Linha 2
Linha 3`;
      
      render(<InfoButton content={multiLineContent} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Linha 1')).toBeInTheDocument();
      expect(screen.getByText('Linha 2')).toBeInTheDocument();
      expect(screen.getByText('Linha 3')).toBeInTheDocument();
    });

    it('renderiza conteúdo React Node', () => {
      const reactContent = (
        <div>
          <h4>Custom Title</h4>
          <p>Custom content</p>
        </div>
      );
      
      render(<InfoButton content={reactContent} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });

    it('usa título padrão quando não fornecido', () => {
      render(<InfoButton content="Conteúdo" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Informações')).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE POSIÇÃO
  // ============================================

  describe('Posição do Popup', () => {
    it('posiciona corretamente em top-right (padrão)', () => {
      const { container } = render(
        <InfoButton content="Teste" position="top-right" />
      );
      
      const popup = container.querySelector('.absolute');
      expect(popup).toHaveClass('right-0');
    });

    it('posiciona corretamente em top-left', () => {
      const { container } = render(
        <InfoButton content="Teste" position="top-left" />
      );
      
      const popup = container.querySelector('.absolute');
      expect(popup).toHaveClass('left-0');
    });

    it('posiciona corretamente em inline', () => {
      const { container } = render(
        <InfoButton content="Teste" position="inline" />
      );
      
      const popup = container.querySelector('.absolute');
      expect(popup).toHaveClass('static', 'ml-2');
    });
  });

  // ============================================
  // TESTES DE ACESSIBILIDADE
  // ============================================

  describe('Acessibilidade', () => {
    it('tem atributo aria-label', () => {
      render(<InfoButton content="Teste" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Mais informações');
    });

    it('tem atributo title', () => {
      render(<InfoButton content="Teste" title="Título Customizado" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Título Customizado');
    });

    it('renderiza ícone de informação', () => {
      render(<InfoButton content="Teste" />);
      
      const button = screen.getByRole('button');
      expect(button).toContainHTML('<svg');
    });
  });
});