import { test } from './support/fixtures';

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
    await page.screenshot({ path: `test-results/telas/desktop-${area}.png`, fullPage: true });
  }
});

test('capturas — celular', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'celular', 'só no projeto celular');
  test.setTimeout(120_000);
  for (const area of ['escala', 'braco', 'acordes']) {
    await page.goto(`/#${area}`);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `test-results/telas/mobile-${area}.png`, fullPage: false });
  }
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `test-results/telas/mobile-menu.png` });
});
