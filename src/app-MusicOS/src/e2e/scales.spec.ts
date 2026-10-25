/**
 * scales.spec.ts — Testes E2E do Módulo de Escalas
 * 
 * Testa fluxos do módulo de escalas:
 * - Seleção de tônica
 * - Seleção de escala
 * - Destaque de notas
 * - Reprodução de notas
 */

import { test, expect } from '@playwright/test';

test.describe('Módulo de Escalas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Escalas');
  });

  test('seleciona tônica C e mostra notas', async ({ page }) => {
    // Seleciona tônica C
    await page.click('button:has-text("C")');
    
    // Verifica que escala foi alterada
    await expect(page.locator('text=C Maior')).toBeVisible();
  });

  test('seleciona escala maior', async ({ page }) => {
    await page.click('button:has-text("Maior")');
    
    // Verifica que notas da escala maior aparecem
    const notes = page.locator('.bg-red-500, .bg-blue-500, .bg-green-500');
    await expect(notes.first()).toBeVisible();
  });

  test('seleciona escala menor', async ({ page }) => {
    await page.click('button:has-text("C")');
    await page.click('button:has-text("Menor")');
    
    await expect(page.locator('text=C Menor')).toBeVisible();
  });

  test('muda instrumento para ukulele', async ({ page }) => {
    await page.click('button:has-text("Ukulele")');
    
    // Verifica que fretboard tem menos cordas (4 ao invés de 6)
    await page.locator('[class*="border-slate-600"]').first().scrollIntoViewIfNeeded();
    const fretboardLines = page.locator('[class*="border-slate-600"]');
    
    // Ukulele tem 4 cordas
    expect(await fretboardLines.count()).toBe(4);
  });

  test('mostra InfoButton com conteúdo educacional', async ({ page }) => {
    // Verifica que InfoButton existe
    const infoButton = page.locator('button[aria-label="Mais informações"]');
    await expect(infoButton).toBeVisible();
    
    // Clica para abrir popup
    await infoButton.click();
    
    // Verifica que conteúdo aparece
    await expect(page.locator('text=Escalas')).toBeVisible();
  });

  test('mostra intervalo de casas customizado', async ({ page }) => {
    // Altera range de casas
    await page.click('button:has-text("5")');
    await page.click('button:has-text("12")');
    
    // Verifica que casa 12 é visível
    await expect(page.getByText('12')).toBeVisible();
  });
});