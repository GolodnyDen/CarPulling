// e2e/main-flow.spec.ts
import { test, expect } from '@playwright/test';

test('полный сценарий: регистрация → создание поездки → просмотр', async ({ page }) => {
  test.setTimeout(60000);

  // 1. Открываем главную страницу (должна быть страница регистрации или лендинг)
  await page.goto('http://localhost:5173');

  const currentUrl = page.url();
  if (!currentUrl.includes('/register')) {
    await page.click('text=Зарегистрироваться');
    await expect(page).toHaveURL(/.*register/);
  }

  // 2. Заполняем форму регистрации
  
  await page.fill('input[name="name"]', 'E2E Тест'); 

  await page.fill('input[type="email"]', 'e2e-test-' + Date.now() + '@test.com');

  await page.fill('input[type="password"]', '123456');

  await page.selectOption('select[name="role"]', 'driver');

  await page.click('button:has-text("Зарегистрироваться")');

  // 3. Проверяем успешную регистрацию (редирект на главную или профиль)
  await expect(page.locator('text=Создать поездку')).toBeVisible({ timeout: 5000 });

  // 4. Создаем поездку
  await page.click('text=Создать поездку');
  
  await page.fill('input[name="from"]', 'Москва');
  await page.fill('input[name="to"]', 'Казань');
  await page.fill('input[name="seats"]', '3');
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const dateStr = futureDate.toISOString().slice(0, 16);
  await page.fill('input[type="datetime-local"]', dateStr);

  await page.click('button:has-text("Создать")');

  // 5. Проверяем, что поездка появилась в списке
  await expect(page.locator('text=Москва')).toBeVisible();
  await expect(page.locator('text=Казань')).toBeVisible();
});

test('авторизация и доступ к защищённым маршрутам', async ({ page }) => {
  test.setTimeout(60000);

  // 1. Переходим на страницу входа
  await page.goto('http://localhost:5173/login');

  // 2. Логинимся
  await page.fill('input[type="email"]', 'e2e@test.com');
  await page.fill('input[type="password"]', '123456');
  
  await page.click('button:has-text("Войти")');

  // 3. Проверяем вход
  await expect(page).toHaveURL(/^(?!.*login).*/);
  await page.goto('http://localhost:5173/profile');
  await expect(page.locator('text=Профиль')).toBeVisible();
});