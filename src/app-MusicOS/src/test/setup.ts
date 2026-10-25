/**
 * Setup de Testes — Vitest
 * 
 * Configurações globais para todos os testes unitários:
 * - Mock de variáveis de ambiente
 * - Cleanup após cada teste
 * - Configurações de ambiente
 */

import { beforeEach, afterEach, vi } from 'vitest';

// ============================================
// MOCK DE VARIÁVEIS DE AMBIENTE
// ============================================

const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_123',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
};

// ============================================
// MOCKS DE BROWSER (lazy para ambiente node)
// ============================================

const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

const sessionStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Função para setup de browser globals
function setupBrowserMocks() {
  // @ts-ignore - window pode não existir em ambiente node
  if (typeof window !== 'undefined') {
    // @ts-ignore
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // @ts-ignore
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });

    // @ts-ignore
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // @ts-ignore
    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      value: vi.fn(),
    });
  }
}

// ============================================
// CLEANUP E RESET
// ============================================

/**
 * Cleanup antes de cada teste
 */
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Resetar variáveis de ambiente
  Object.assign(process.env, mockEnv);
  
  // Setup browser mocks
  setupBrowserMocks();
  
  // Reset corpo da página (se document existir)
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  }
});

/**
 * Cleanup após cada teste
 */
afterEach(() => {
  vi.clearAllTimers();
});

// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

// Timeout para testes assíncronos
vi.setConfig({ testTimeout: 10000 });