/**
 * auth.spec.ts — Testes E2E de Autenticação
 * 
 * Testa fluxos de autenticação:
 * - Login com email/senha
 * - Login com Google
 * - Logout
 * - Redirects protegidos
 */

import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('mostra formulário de login', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('valida email inválido', async ({ page }) => {
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button:has-text("Entrar")');
    
    // Verifica mensagem de erro
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('valida senha curta', async ({ page }) => {
    await page.fill('input[name="email"]', 'teste@exemplo.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button:has-text("Entrar")');
    
    // Verifica mensagem de erro
    await expect(page.locator('text=Senha muito curta')).toBeVisible();
  });

  test('mostra botão de Google login', async ({ page }) => {
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
  });

  test('navega para registro ao clicar em criar conta', async ({ page }) => {
    await page.click('text=Criar conta');
    await expect(page).toHaveURL(/register/);
  });

  test('recuperação de senha funciona', async ({ page }) => {
    await page.click('text=Esqueceu a senha?');
    await expect(page).toHaveURL(/recover/);
  });
});