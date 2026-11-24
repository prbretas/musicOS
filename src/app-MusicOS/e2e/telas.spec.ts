import { test } from './support/fixtures';
import type { Page } from '@playwright/test';

async function shot(page: Page, path: string, fullPage: boolean) {
  await page.screenshot({ path, fullPage });
}

/**
 * Capturas das telas principais (computador e celular) para revisão visual.
 * Ficam em test-results/telas e sobem como artefato do CI.
 */

const AREAS = ['escala', 'campo', 'braco', 'acordes', 'teclado', 'pratica', 'treino', 'ciclo'];

test('capturas — computador', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'só no projeto desktop');
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const area of AREAS) {
    await page.goto(`/#${area}`);
    await page.waitForTimeout(900);
    await shot(page, `test-results/telas/desktop-${area}.png`, true);
  }
});

test('capturas — celular', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'celular', 'só no projeto celular');
  test.setTimeout(120_000);
  for (const area of ['escala', 'braco', 'acordes']) {
    await page.goto(`/#${area}`);
    await page.waitForTimeout(900);
    await shot(page, `test-results/telas/mobile-${area}.png`, false);
  }
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.waitForTimeout(500);
  await shot(page, `test-results/telas/mobile-menu.png`, false);
});
