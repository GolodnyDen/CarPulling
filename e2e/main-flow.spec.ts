mport { test, expect } from '@playwright/test';

test('полный сценарий: регистрация → создание поездки → просмотр', async ({ page }) => {
  // 1. Открываем главную
  await page.goto('http://localhost:5173');
  
  // 2. Переходим на регистрацию
  await page.click('text=Зарегистрироваться');
  await expect(page).toHaveURL(/\/register/);
  
  // 3. Заполняем форму
  await page.fill('input[placeholder="Имя"]', 'E2E Тест');
  await page.fill('input[placeholder="Email"]', 'e2e@test.com');
  await page.fill('input[type="password"]', '123456');
  await page.selectOption('select', 'driver');
  
  // 4. Отправляем
  await page.click('button:has-text("Зарегистрироваться")');
  
  // 5. Проверяем редирект на главную
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toContainText('Поездки');
  
  // 6. Создаём поездку (кнопка + только для driver)
  await page.click('button:has-text("+")');
  await expect(page).toHaveURL(/\/create/);
  
  // 7. Заполняем форму поездки
  await page.fill('input[placeholder="Откуда"]', 'Дом');
  await page.fill('input[placeholder="Куда"]', 'Университет');
  await page.fill('input[type="datetime-local"]', '2024-12-25T10:00');
  await page.fill('input[type="number"]', '3');
  
  // 8. Отправляем
  await page.click('button:has-text("Создать поездку")');
  
  // 9. Проверяем, что поездка появилась в списке
  await expect(page).toHaveURL('/');
  await expect(page.locator('text=Дом → Университет')).toBeVisible();
});

test('авторизация и доступ к защищённым маршрутам', async ({ page }) => {
  // Без авторизации — редирект на /login
  await page.goto('http://localhost:5173/create');
  await expect(page).toHaveURL(/\/login/);
  
  // После логина — доступ разрешён
  await page.goto('http://localhost:5173/login');
  await page.fill('input[placeholder="Email"]', 'e2e@test.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Войти")');
  
  await page.waitForURL('/');
  await page.goto('http://localhost:5173/create');
  await expect(page).toHaveURL(/\/create/);
});