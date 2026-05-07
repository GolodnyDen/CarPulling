import { test, expect } from '@playwright/test';

test('E2E: Успешная регистрация и вход в систему', async ({ page }) => {
  test.setTimeout(60000);

  const timestamp = Date.now();
  const testEmail = `e2e.${timestamp}@test.com`;
  const testName = `User ${timestamp}`;
  const testPassword = 'password123';

  // --- ШАГ 1: РЕГИСТРАЦИЯ ---
  await page.goto('http://localhost:5173/register');
  
  await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible({ timeout: 10000 });

  await page.fill('input[name="name"]', testName);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  await page.getByText('Пассажир').first().click();

  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

  await page.waitForURL((url) => !url.pathname.includes('/register'), { timeout: 10000 });
  
  await expect(page.locator('body')).not.toHaveText('Регистрация'); 

  // --- ШАГ 2: ВЫХОД ИЗ СИСТЕМЫ ---
  const logoutButton = page.getByText(/выйти|logout|выход/i).first();
  
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  } else {
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/login');
  }

  // --- ШАГ 3: ПОВТОРНЫЙ ВХОД (LOGIN) ---
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible({ timeout: 5000 });

  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  
  await page.getByRole('button', { name: 'Войти' }).click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

  await expect(page.getByText(testName)).toBeVisible({ timeout: 5000 });
});

test('E2E: Ошибка при входе с неверным паролем', async ({ page }) => {
  test.setTimeout(30000);

  await page.goto('http://localhost:5173/login');

  await page.fill('input[type="email"]', 'fake-user@test.com');
  await page.fill('input[type="password"]', 'wrong-password');

  await page.getByRole('button', { name: 'Войти' }).click();

  const errorElement = page.getByText(/ошибка|неверн/i).or(page.locator('[data-testid="error-message"]'));
  
  await expect(errorElement).toBeVisible({ timeout: 5000 });
});