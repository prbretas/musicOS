import { defineConfig, devices } from '@playwright/test';

/**
 * Testes E2E do MusicOS (spec .kiro/specs/qualidade-e-testes).
 * Local: usa o Chrome instalado e reaproveita o `npm run dev` se ja estiver no ar.
 * CI: usa o Chromium do Playwright e sobe o build de producao (`npm run start`).
 */
const isCI = !!process.env.CI;
const channel = isCI ? undefined : 'chrome';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 2,
  globalSetup: './e2e/support/global-setup.ts',
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel } },
    { name: 'celular', use: { ...devices['Pixel 5'], channel } },
  ],
  webServer: {
    command: isCI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
