import { test, expect } from './support/fixtures';

/**
 * Smoke test do Estudio provisorio em `/`.
 * Quando a parte A da spec estrutura-do-app levar o conteudo para /app/*,
 * este arquivo e substituido por abas.spec.ts (tarefa Q6).
 */

test('a pagina carrega com o cartao da escala e sem erros', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Brilhante, aberta', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Tabela de Intervalos - C Maior/ })).toBeVisible();
});

test('trocar a escala atualiza o conteudo', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#tonica', '9');
  await page.selectOption('#tipoEscala', 'menor_natural');
  await expect(page.getByRole('heading', { name: /Tabela de Intervalos - A Menor Natural/ })).toBeVisible();
});

test('no braço, o G da corda 1 fica na casa 3 (regressão da casa vazia)', async ({ page }) => {
  await page.goto('/');
  const svg = page.locator('#braco svg').first();
  await svg.scrollIntoViewIfNeeded();

  const pos = await svg.evaluate((el) => {
    const texts = [...el.querySelectorAll('text')];
    const casa = (n: number) => texts.find((t) => t.textContent === String(n) && t.getAttribute('font-size') === '11');
    const circles = [...el.querySelectorAll('g > circle')];
    const topY = Math.min(...circles.map((c) => Number(c.getAttribute('cy'))));
    const noteX = (name: string) => {
      const g = [...el.querySelectorAll('g')].find(
        (g) => g.querySelector('text')?.textContent === name && Number(g.querySelector('circle')?.getAttribute('cy')) === topY
      );
      return g ? Number(g.querySelector('circle')?.getAttribute('cx')) : null;
    };
    return {
      casa1: Number(casa(1)?.getAttribute('x')),
      casa3: Number(casa(3)?.getAttribute('x')),
      F: noteX('F'),
      G: noteX('G'),
    };
  });

  expect(pos.F).toBe(pos.casa1);
  expect(pos.G).toBe(pos.casa3);
});
