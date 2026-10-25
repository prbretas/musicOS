/**
 * home.spec.ts — Testes E2E da Landing Page
 * 
 * Testa fluxos principais da página inicial:
 * - Renderização dos componentes
 * - navegação entre seções
 * - Responsividade
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renderiza corretamente no desktop', async ({ page }) => {
    // Verifica elementos principais
    await expect(page.locator('text=MusicOS')).toBeVisible();
    await expect(page.locator('text=Aprenda música')).toBeVisible();
  });

  test('possui CTA para começar', async ({ page }) => {
    const ctaButton = page.locator('button:has-text("Começar")');
    await expect(ctaButton).toBeVisible();
  });

  test('navega para pricing ao clicar em pricing', async ({ page }) => {
    await page.click('a[href="#pricing"]');
    await expect(page).toHaveURL(/#pricing/);
  });

  test('mostra opções de pricing', async ({ page }) => {
    // Scroll até pricing
    await page.locator('#pricing').scrollIntoViewIfNeeded();
    
    await expect(page.locator('text=Grátis')).toBeVisible();
    await expect(page.locator('text=R$9,90')).toBeVisible();
    await expect(page.locator('text=R$197')).toBeVisible();
  });

  test('funciona em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verifica que elementos principais ainda são visíveis
    await expect(page.locator('text=MusicOS')).toBeVisible();
    await expect(page.locator('text=Aprenda música')).toBeVisible();
  });
});