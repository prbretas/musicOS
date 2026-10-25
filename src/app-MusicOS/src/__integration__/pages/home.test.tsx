/**
 * home.test.tsx — Testes de Integração da Landing Page
 * 
 * Testa integração entre componentes da página inicial:
 * - Hero Section + CTA
 * - Features Section
 * - Pricing Section
 * - Navigation
 */

import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';

describe('Landing Page Integration', () => {
  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================

  describe('Renderização', () => {
    it('renderiza a página sem erros', () => {
      expect(() => render(<HomePage />)).not.toThrow();
    });

    it('renderiza título principal', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/música/i)).toBeInTheDocument();
    });

    it('renderiza logo ou nome do app', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/MusicOS/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE HERO SECTION
  // ============================================

  describe('Hero Section', () => {
    it('possui botão de CTA', () => {
      render(<HomePage />);
      
      const ctaButton = screen.getByRole('button', { name: /começar/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it(' CTA é clicável', () => {
      const handleCtaClick = vi.fn();
      
      render(<HomePage onCtaClick={handleCtaClick} />);
      
      const ctaButton = screen.getByRole('button', { name: /começar/i });
      fireEvent.click(ctaButton);
      
      expect(handleCtaClick).toHaveBeenCalled();
    });
  });

  // ============================================
  // TESTES DE FEATURES
  // ============================================

  describe('Features Section', () => {
    it('renderiza seção de teoria musical', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/teoria musical/i)).toBeInTheDocument();
    });

    it('renderiza seção de exercícios', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/exercícios/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // TESTES DE PRICING
  // ============================================

  describe('Pricing Section', () => {
    it('renderiza opção Free', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/grátis/i)).toBeInTheDocument();
    });

    it('renderiza opção Pro com preço', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/R\$9,90/i)).toBeInTheDocument();
    });

    it('renderiza opção Lifetime', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/lifetime/i)).toBeInTheDocument();
    });

    it('possui botão para cada opção de pricing', () => {
      render(<HomePage />);
      
      const pricingButtons = screen.getAllByRole('button', { name: /assinar/i });
      expect(pricingButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // TESTES DE NAVEGAÇÃO
  // ============================================

  describe('Navegação', () => {
    it('possui links de navegação', () => {
      render(<HomePage />);
      
      // Verifica âncoras para seções
      const featuresLink = screen.getByRole('link', { name: /features/i });
      const pricingLink = screen.getByRole('link', { name: /pricing/i });
      
      expect(featuresLink).toBeInTheDocument();
      expect(pricingLink).toBeInTheDocument();
    });

    it('links apontam para seções corretas', () => {
      render(<HomePage />);
      
      const featuresLink = screen.getByRole('link', { name: /features/i });
      expect(featuresLink).toHaveAttribute('href', '#features');
    });
  });
});