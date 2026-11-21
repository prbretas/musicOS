import { test as base, expect } from '@playwright/test';

/**
 * Todo teste falha se a pagina registrar erro de JavaScript ou console.error
 * (inclui erros de hidratacao do React).
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
      });
      await use(errors);
      expect(errors, 'erros no console da pagina').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
