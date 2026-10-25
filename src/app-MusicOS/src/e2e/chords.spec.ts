/**
 * chords.spec.ts — Testes E2E do Módulo de Acordes
 * 
 * Testa fluxos do módulo de acordes:
 * - Seleção de acorde
 * - Visualização de diagrama
 * - Reprodução de acorde
 */

import { test, expect } from '@playwright/test';

test.describe('Módulo de Acordes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Acordes');
  });

  test('seleciona acorde C e mostra diagrama', async ({ page }) => {
    await page.click('button:has-text("C")');
    
    // Verifica que acorde C aparece
    await expect(page.locator('text=C')).toBeVisible();
    
    // Verifica notas do acorde
    await expect(page.locator('text=C')).toBeVisible();
    await expect(page.locator('text=E')).toBeVisible();
    await expect(page.locator('text=G')).toBeVisible();
  });

  test('seleciona acorde menor', async ({ page }) => {
    await page.click('button:has-text("Am")');
    
    await expect(page.locator('text=Am')).toBeVisible();
  });

  test('mostra número das casas no diagrama', async ({ page }) => {
    await page.click('button:has-text("C")');
    
    // Verifica que casas 1, 2, 3 aparecem
    await expect(page.getByText('3')).toBeVisible();
    await expect(page.getByText('2')).toBeVisible();
    await expect(page.getByText('1')).toBeVisible();
  });

  test('mostra círculo para cordas abertas', async ({ page }) => {
    await page.click('button:has-text("C")');
    
    // Verifica indicador de corda aberta
    await expect(page.locator('text=○')).toBeVisible();
  });

  test('muda para ukulele e mostra 4 cordas', async ({ page }) => {
    await page.click('button:has-text("Ukulele")');
    await page.click('button:has-text("C")');
    
    // Verifica que acorde é mostrado com 4 posições
    const positions = page.getAllByText(/\d|○/);
    expect(await positions.count()).toBeLessThanOrEqual(5);
  });

  test('mostra digitação do acorde', async ({ page }) => {
    await page.click('button:has-text("C")');
    
    // Verifica indicadores de dedo (1, 2)
    await expect(page.locator('text=1')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
  });

  test('mostra InfoButton com conteúdo educacional', async ({ page }) => {
    const infoButton = page.locator('button[aria-label="Mais informações"]');
    await infoButton.click();
    
    await expect(page.locator('text=Acordes')).toBeVisible();
  });
});