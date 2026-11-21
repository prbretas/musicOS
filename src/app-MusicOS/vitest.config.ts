/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // JSX automatico: componentes nao precisam importar React (corrige "React is not defined")
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // So testes unitarios e de integracao; os E2E (Playwright) rodam com `npx playwright test`
    include: [
      'src/__tests__/**/*.test.{ts,tsx}',
      'src/__integration__/**/*.test.{ts,tsx}',
    ],
    exclude: ['node_modules/', '.next/', '**/*.d.ts', 'e2e/**', 'src/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.next/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/middleware.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});